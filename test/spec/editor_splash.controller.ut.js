(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorSplashController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                FileService,
                CollateralService,
                EditorSplashCtrl;

            var EditorCtrl;

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

                    FileService = $injector.get('FileService');
                    spyOn(FileService, 'open').and.returnValue({ url: '' });

                    $scope = $rootScope.$new();
                    $scope.EditorCtrl = EditorCtrl = {
                        model: {
                            data: {
                                collateral: {
                                    splash: null
                                },
                                splash: {
                                    source: 'generated',
                                    ratio: '1-1'
                                }
                            }
                        }
                    };
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

                describe('maxFileSize', function() {
                    it('should be 307200', function() {
                        expect(EditorSplashCtrl.maxFileSize).toBe(307200);
                    });
                });

                describe('splash', function() {
                    it('should be null', function() {
                        expect(EditorSplashCtrl.splash).toBeNull();
                    });
                });

                describe('currentUpload', function() {
                    it('should be null', function() {
                        expect(EditorSplashCtrl.splash).toBeNull();
                    });
                });

                describe('fileTooBig', function() {
                    beforeEach(function() {
                        EditorSplashCtrl.maxFileSize = 204800;
                    });

                    it('should not throw any errors if there is no file', function() {
                        expect(function() {
                            return EditorSplashCtrl.fileTooBig;
                        }).not.toThrow();
                    });

                    describe('if there is a file', function() {
                        beforeEach(function() {
                            EditorSplashCtrl.splash = {
                                size: 102400
                            };
                        });

                        it('should be true if the file\'s size is greater than the max size', function() {
                            function tooBig() {
                                return EditorSplashCtrl.fileTooBig;
                            }

                            expect(tooBig()).toBe(false);

                            EditorSplashCtrl.splash.size = 204800;
                            expect(tooBig()).toBe(false);

                            EditorSplashCtrl.splash.size = 204801;
                            expect(tooBig()).toBe(true);
                        });
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
                                            EditorSplashCtrl.splash = {};
                                        });

                                        [true, false].forEach(function(tooBig) {
                                            describe('if fileTooBig is ' + tooBig, function() {
                                                var result = !tooBig && bool;

                                                beforeEach(function() {
                                                    Object.defineProperty(EditorSplashCtrl, 'fileTooBig', {
                                                        value: tooBig
                                                    });
                                                });

                                                it('should be ' + result, function() {
                                                    expect(EditorSplashCtrl.tabIsValid(tab)).toBe(result);
                                                });
                                            });
                                        });
                                    });

                                    describe('if there is no splash', function() {
                                        beforeEach(function() {
                                            EditorSplashCtrl.splash = null;
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

                describe('upload()', function() {
                    var setDeferred,
                        success;

                    beforeEach(function() {
                        success = jasmine.createSpy('upload() success');
                        setDeferred = $q.defer();

                        spyOn(CollateralService, 'set')
                            .and.returnValue(setDeferred.promise);

                        EditorSplashCtrl.splash = {};

                        $scope.$apply(function() {
                            EditorSplashCtrl.upload().then(success);
                        });
                    });

                    it('should set the user-selected file as the minireel\'s splash image', function() {
                        expect(CollateralService.set).toHaveBeenCalledWith('splash', EditorSplashCtrl.splash, minireel);
                    });

                    it('should put the result of the set method on iteself', function() {
                        expect(EditorSplashCtrl.currentUpload).toBe(setDeferred.promise);
                    });

                    describe('after the upload completes', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                setDeferred.resolve(minireel);
                            });
                        });

                        it('should null-out the currentUpload property', function() {
                            expect(EditorSplashCtrl.currentUpload).toBeNull();
                        });

                        it('should resolve to the minireel', function() {
                            expect(success).toHaveBeenCalledWith(minireel);
                        });
                    });

                    describe('if the upload fails', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                setDeferred.reject({});
                            });
                        });

                        it('should null-out the currentUpload property', function() {
                            expect(EditorSplashCtrl.currentUpload).toBeNull();
                        });
                    });
                });

                describe('save', function() {
                    var originalData,
                        uploadDeferred,
                        success;

                    beforeEach(function() {
                        success = jasmine.createSpy('save() success');
                        uploadDeferred = $q.defer();
                        spyOn(c6State, 'goTo');
                        spyOn(EditorSplashCtrl, 'upload').and.returnValue(uploadDeferred.promise);

                        EditorSplashCtrl.splash = {};

                        originalData = EditorCtrl.model.data;
                        $scope.$apply(function() {
                            EditorSplashCtrl.save().then(success);
                        });
                    });

                    describe('if there is no splash', function() {
                        beforeEach(function() {
                            EditorSplashCtrl.upload.calls.reset();
                            success.calls.reset();

                            EditorSplashCtrl.splash = null;

                            $scope.$apply(function() {
                                EditorSplashCtrl.save().then(success);
                            });
                        });

                        it('should not upload anything', function() {
                            expect(EditorSplashCtrl.upload).not.toHaveBeenCalled();
                            expect(success).toHaveBeenCalled();
                        });
                    });

                    it('should upload the splash image', function() {
                        expect(EditorSplashCtrl.upload).toHaveBeenCalled();
                    });

                    describe('after the upload completes', function() {
                        beforeEach(function() {
                            expect(EditorCtrl.model.data.collateral).not.toEqual(minireel.data.collateral);
                            expect(EditorCtrl.model.data.splash).not.toEqual(minireel.data.splash);
                            expect(c6State.goTo).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                uploadDeferred.resolve(minireel);
                            });
                        });

                        it('should copy the collateral hash of its model to the EditorCtrl\'s model', function() {
                            expect(EditorCtrl.model.data.collateral).toEqual(minireel.data.collateral);
                            expect(EditorCtrl.model.data).toBe(originalData);
                        });

                        it('should copy the splash object', function() {
                            expect(EditorCtrl.model.data.splash).toEqual(minireel.data.splash);
                            expect(EditorCtrl.model.data).toBe(originalData);
                        });

                        it('should transition back to the editor', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('editor');
                        });

                        it('should resolve the promsise', function() {
                            expect(success).toHaveBeenCalledWith(EditorCtrl.model);
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

                describe('$destroy', function() {
                    function trigger() {
                        $scope.$emit('$destroy');
                    }

                    describe('if the user did not select an image', function() {
                        beforeEach(trigger);

                        it('should do nothing', function() {
                            expect(FileService.open).not.toHaveBeenCalled();
                        });
                    });

                    describe('if the user did select an image', function() {
                        var wrapper;

                        beforeEach(function() {
                            wrapper = {
                                close: jasmine.createSpy('wrapper.close()')
                            };

                            EditorSplashCtrl.splash = {};
                            FileService.open.and.returnValue(wrapper);

                            trigger();
                        });

                        it('should close the file', function() {
                            expect(FileService.open).toHaveBeenCalledWith(EditorSplashCtrl.splash);
                            expect(wrapper.close).toHaveBeenCalled();
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

                describe('this.splash', function() {
                    it('should set the splashSrc to the url of the opened file', function() {
                        var file,
                            wrapper = {
                                url: 'blah.jpg'
                            };

                        FileService.open.and.returnValue(wrapper);

                        $scope.$apply(function() {
                            EditorSplashCtrl.splash = file = {};
                        });
                        expect(EditorSplashCtrl.splashSrc).toBe(wrapper.url);
                    });

                    it('should close a file if it is no longer the user-selected file', function() {
                        var file,
                            wrapper = {
                                close: jasmine.createSpy('wrapper.close()')
                            };

                        expect(FileService.open).not.toHaveBeenCalled();

                        FileService.open.and.returnValue(wrapper);
                        $scope.$apply(function() {
                            EditorSplashCtrl.splash = file = {};
                        });

                        expect(wrapper.close).not.toHaveBeenCalled();

                        $scope.$apply(function() {
                            EditorSplashCtrl.splash = file = {};
                        });
                        expect(FileService.open).toHaveBeenCalledWith(file);
                        expect(wrapper.close).toHaveBeenCalled();
                    });
                });
            });
        });
    });
}());
