(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorSplashController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                CollateralService,
                EditorSplashCtrl;

            var minireel;

            beforeEach(function() {
                minireel = {
                    data: {
                        collateral: {
                            splash: 'foo.jpg'
                        },
                        splash: {
                            source: 'specified',
                            ratio: '16-9'
                        }
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    CollateralService = $injector.get('CollateralService');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        EditorSplashCtrl = $controller('EditorSplashController', { $scope: $scope, cModel: minireel });
                        EditorSplashCtrl.model = minireel;
                    });
                });
            });

            it('should exist', function() {
                expect(EditorSplashCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('splashSrc', function() {
                    it('should be the minireel\'s splash src', function() {
                        expect(EditorSplashCtrl.splashSrc).toBe(minireel.data.collateral.splash);
                    });
                });

                describe('tabs', function() {
                    it('should be an array of the modal\'s tabs', function() {
                        expect(EditorSplashCtrl.tabs).toEqual([
                            {
                                name: 'Source Type',
                                sref: 'editor.splash.source',
                                visits: 0,
                                requiredVisits: 0
                            },
                            {
                                name: 'Image Settings',
                                sref: 'editor.splash.image',
                                visits: 0,
                                requiredVisits: 0
                            }
                        ]);
                    });
                });

                describe('currentTab', function() {
                    describe('if the current state is not represented by a tab', function() {
                        beforeEach(function() {
                            c6State.current = { name: 'editor.splash' };
                        });

                        it('should be null', function() {
                            expect(EditorSplashCtrl.currentTab).toBeNull();
                        });
                    });

                    describe('if the current state is represented by a tab', function() {
                        it('should be the tab of that state', function() {
                            EditorSplashCtrl.tabs.forEach(function(tab) {
                                c6State.current = { name: tab.sref };

                                expect(EditorSplashCtrl.currentTab).toBe(tab);
                            });
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('isAsFarAs(tab)', function() {
                    [0, 1].forEach(function(currentTabIndex) {
                        [0, 1].forEach(function(tabIndex) {
                            describe('with the current tab being the tab at index ' + currentTabIndex + ' and the provided tab being at index ' + tabIndex, function() {
                                var result = tabIndex <= currentTabIndex,
                                    tab;

                                beforeEach(function() {
                                    Object.defineProperty(EditorSplashCtrl, 'currentTab', {
                                        value: EditorSplashCtrl.tabs[currentTabIndex]
                                    });
                                    tab = EditorSplashCtrl.tabs[tabIndex];
                                });

                                it('should be ' + result, function() {
                                    expect(EditorSplashCtrl.isAsFarAs(tab)).toBe(result);
                                });
                            });
                        });
                    });
                });

                describe('tabIsValid', function() {
                    var tab;

                    beforeEach(function() {
                        spyOn(EditorSplashCtrl, 'isAsFarAs');
                    });

                    [null, undefined].forEach(function(falsyValue) {
                        describe('if ' + falsyValue + ' is passed in', function() {
                            it('should return ' + falsyValue, function() {
                                expect(EditorSplashCtrl.tabIsValid(falsyValue)).toBe(falsyValue);
                            });
                        });
                    });

                    describe('on most tabs', function() {
                        beforeEach(function() {
                            tab = EditorSplashCtrl.tabs[0];
                        });

                        it('should delegate to isAsFarAs(tab)', function() {
                            [true, false].forEach(function(bool) {
                                EditorSplashCtrl.isAsFarAs.and.returnValue(bool);

                                expect(EditorSplashCtrl.tabIsValid(tab)).toBe(bool);
                            });
                        });
                    });

                    describe('on the image tab', function() {
                        beforeEach(function() {
                            tab = EditorSplashCtrl.tabs[1];
                        });

                        describe('if the source is generated', function() {
                            beforeEach(function() {
                                minireel.data.splash.source = 'generated';
                                EditorSplashCtrl.splashSrc = null;
                            });

                            it('should delegate to isAsFarAs(tab)', function() {
                                [true, false].forEach(function(bool) {
                                    EditorSplashCtrl.isAsFarAs.and.returnValue(bool);

                                    expect(EditorSplashCtrl.tabIsValid(tab)).toBe(bool);
                                });
                            });
                        });

                        describe('if the source is specified', function() {
                            beforeEach(function() {
                                minireel.data.splash.source = 'specified';
                            });

                            [true, false].forEach(function(bool) {
                                describe('if isAsFarAs(tab) returns ' + bool, function() {
                                    beforeEach(function() {
                                        EditorSplashCtrl.isAsFarAs.and.returnValue(bool);
                                    });

                                    describe('if there is a splash', function() {
                                        beforeEach(function() {
                                            EditorSplashCtrl.splashSrc = 'test.jpg';
                                        });

                                        it('should be ' + bool, function() {
                                            expect(EditorSplashCtrl.tabIsValid(tab)).toBe(bool);
                                        });
                                    });

                                    describe('if there is no splash', function() {
                                        beforeEach(function() {
                                            EditorSplashCtrl.splashSrc = null;
                                        });

                                        it('should be false', function() {
                                            expect(EditorSplashCtrl.tabIsValid(tab)).toBe(false);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });

            describe('events', function() {
                describe('c6State: stateChangeSuccess', function() {
                    ['editor.splash.source', 'editor.splash.image'].forEach(function(stateName, index) {
                        describe('when the state is ' + stateName, function() {
                            var state, tab,
                                initialVisits;

                            beforeEach(function() {
                                state = { name: stateName };
                                tab = EditorSplashCtrl.tabs[index];
                                initialVisits = tab.visits = Math.floor(Math.random() * 10) + 1;

                                c6State.emit('stateChangeSuccess', state);
                            });

                            it('should increment the visit count of the tab', function() {
                                expect(tab.visits).toBe(initialVisits + 1);
                            });
                        });
                    });

                    describe('when the $scope is destroyed', function() {
                        beforeEach(function() {
                            $scope.$destroy();

                            c6State.emit('stateChangeSuccess', { name: 'editor.splash.image' });
                        });

                        it('should not increment the visits', function() {
                            expect(EditorSplashCtrl.tabs[1].visits).toBe(0);
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('this.model.data.splash.source', function() {
                    beforeEach(function() {
                        EditorSplashCtrl.tabs.forEach(function(tab) {
                            expect(tab.requiredVisits).toBe(0);
                        });
                        expect(EditorSplashCtrl.splashSrc).toEqual(jasmine.any(String));

                        EditorSplashCtrl.tabs[1].visits = 6;

                        $scope.$apply(function() {
                            minireel.data.splash.source = 'generated';
                        });
                    });

                    it('should increment the requiredVisits of the "image" tab', function() {
                        expect(EditorSplashCtrl.tabs[1].requiredVisits).toBe(7);
                    });

                    it('should nullify the splashSrc', function() {
                        expect(EditorSplashCtrl.splashSrc).toBeNull();
                    });
                });

            });
        });
    });
}());
