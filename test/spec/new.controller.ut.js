(function() {
    'use strict';

    define(['manager'], function() {
        ddescribe('NewController', function() {
            var $rootScope,
                $q,
                $scope,
                $controller,
                c6State,
                NewCtrl;

            var model,
                minireel;

            beforeEach(function() {
                minireel = {
                    data: {
                        title: 'Awesome Videos, Brah!',
                        mode: 'full',
                        autoplay: false
                    },
                    save: jasmine.createSpy('minireel.save()')
                        .and.callFake(function() {
                            $q.when(this);
                        })
                };

                model = {
                    modes: [
                        /* jshint quotmark:false */
                        {
                            "value": "lightbox",
                            "modes": [
                                {
                                    "value": "lightbox",
                                    "autoplayable": true
                                },
                                {
                                    "value": "lightbox-ads",
                                    "autoplayable": true
                                }
                            ]
                        },
                        {
                            "value": "inline",
                            "modes": [
                                {
                                    "value": "light",
                                    "autoplayable": true
                                },
                                {
                                    "value": "full",
                                    "autoplayable": false
                                }
                            ]
                        }
                        /* jshint quotmark:single */
                    ],
                    minireel: minireel
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');
                    $q = $injector.get('$q');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        NewCtrl = $controller('NewController', { $scope: $scope, cModel: model });
                        NewCtrl.model = model;
                        NewCtrl.tabs = [
                            {
                                sref: 'general',
                                requiredVisits: 3,
                                visits: 3
                            },
                            {
                                sref: 'category',
                                requiredVisits: 10,
                                visits: 10
                            },
                            {
                                sref: 'mode',
                                requiredVisits: 3,
                                visits: 3
                            },
                            {
                                sref: 'autoplay',
                                requiredVisits: 5,
                                visits: 5
                            }
                        ];
                        NewCtrl.baseState = 'manager.new';
                        NewCtrl.returnState = 'manager';
                    });
                });
            });

            it('should exist', function() {
                expect(NewCtrl).toEqual(jasmine.any(Object));
            });

            describe('events', function() {
                describe('c6State:stateChangeSuccess', function() {
                    [0, 1, 2, 3].forEach(function(index) {
                        describe('with the state of the tab at index: ' + index, function() {
                            var tab,
                                state,
                                initialVisits;

                            beforeEach(function() {
                                tab = NewCtrl.tabs[index];
                                initialVisits = tab.visits;
                                state = {
                                    name: NewCtrl.baseState + '.' + tab.sref
                                };

                                c6State.emit('stateChangeSuccess', state);
                            });

                            it('should bump up the visits of the corresponding tab', function() {
                                expect(tab.visits).toBe(initialVisits + 1);
                            });
                        });
                    });

                    describe('after the $scope is destroyed', function() {
                        var initialVisits;

                        beforeEach(function() {
                            $scope.$destroy();
                            initialVisits = NewCtrl.tabs[3].visits;

                            c6State.emit('stateChangeSuccess', { name: NewCtrl.baseState + '.autoplay' });
                        });

                        it('should not increment visits', function() {
                            expect(NewCtrl.tabs[3].visits).toBe(initialVisits);
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('general tab requiredVisits', function() {
                    var tab;

                    beforeEach(function() {
                        tab = NewCtrl.tabs[0];
                    });

                    describe('if there is a title', function() {
                        beforeEach(function() {
                            NewCtrl.title = 'Foo';
                        });

                        it('should be the same as the number of visits', function() {
                            expect(tab.requiredVisits).toBe(tab.visits);
                        });
                    });

                    describe('if there is no title', function() {
                        beforeEach(function() {
                            NewCtrl.title = '';
                        });

                        it('should be the number of visits + 1', function() {
                            expect(tab.requiredVisits).toBe(tab.visits + 1);
                        });
                    });

                    describe('if the general tab is not present', function() {
                        var tabs;

                        beforeEach(function() {
                            tabs = NewCtrl.tabs.slice(1);
                        });

                        it('should not throw errors', function() {
                            expect(function() {
                                $scope.$apply(function() {
                                    NewCtrl = $controller('NewController', { $scope: $scope, cModel: model });
                                    NewCtrl.tabs = tabs;
                                    NewCtrl.model = model;
                                });
                            }).not.toThrow();
                        });
                    });
                });

                describe('category', function() {
                    it('should be the category of the MiniReel', function() {
                        expect(NewCtrl.category).toBe(model.modes[1]);
                    });
                });

                describe('mode', function() {
                    it('should be the mode config of the minireel', function() {
                        expect(NewCtrl.mode).toBe(model.modes[1].modes[1]);
                    });
                });

                describe('autoplay', function() {
                    it('should be the autoplay value of the minireel', function() {
                        expect(NewCtrl.autoplay).toBe(minireel.data.autoplay);
                    });
                });

                describe('title', function() {
                    it('should be the title value of the minireel', function() {
                        expect(NewCtrl.title).toBe(minireel.data.title);
                    });
                });

                describe('currentTab', function() {
                    describe('if there is no tab for the current state', function() {
                        beforeEach(function() {
                            c6State.current = { name: 'manager.new.foo' };
                        });

                        it('should be null', function() {
                            expect(NewCtrl.currentTab).toBeNull();
                        });
                    });

                    describe('if there is a tab for the current state', function() {
                        it('should be the tab for the current state', function() {
                            NewCtrl.tabs.forEach(function(tab) {
                                c6State.current = { name: 'manager.new.' + tab.sref };

                                expect(NewCtrl.currentTab).toBe(tab);
                            });
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('save()', function() {
                    var saveDeferred;

                    beforeEach(function() {
                        saveDeferred = $q.defer();

                        NewCtrl.mode = model.modes[0].modes[0];
                        NewCtrl.autoplay = true;
                        NewCtrl.title = 'Sweet!';

                        minireel.save.and.returnValue(saveDeferred.promise);
                        spyOn(c6State, 'goTo');

                        NewCtrl.save();
                    });

                    ['title', 'autoplay'].forEach(function(prop) {
                        it('should copy the ' + prop + ' setting to the minireel', function() {
                            expect(minireel.data[prop]).toBe(NewCtrl[prop]);
                        });
                    });

                    it('should copy the mode to the minreel', function() {
                        expect(minireel.data.mode).toBe(NewCtrl.mode.value);
                    });

                    it('should save the minireel', function() {
                        expect(minireel.save).toHaveBeenCalled();
                    });

                    describe('after the save is finished', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                minireel.id = 'e-31ba4eaf5dc098';
                                saveDeferred.resolve(minireel);
                            });
                        });

                        it('should go to the editor', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('editor', { minireelId: minireel.id });
                        });
                    });

                    describe('if the minireel already has an id', function() {
                        beforeEach(function() {
                            minireel.id = 'e-97a58a5eba29e0';

                            $scope.$apply(function() {
                                NewCtrl.save();
                            });
                        });

                        it('should go right to the editor', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('editor', { minireelId: minireel.id });
                        });
                    });
                });

                describe('isAsFarAs(tab)', function() {
                    beforeEach(function() {
                        Object.defineProperty(NewCtrl, 'currentTab', {
                            value: NewCtrl.tabs[1]
                        });
                    });

                    it('should be true if the currentTab is, or comes before, the currentTab', function() {
                        NewCtrl.tabs.forEach(function(tab, index) {
                            if (index <= 1) {
                                expect(NewCtrl.isAsFarAs(tab)).toBe(true);
                            } else {
                                expect(NewCtrl.isAsFarAs(tab)).toBe(false);
                            }
                        });
                    });
                });

                describe('tabIsValid', function() {
                    var tab;

                    beforeEach(function() {
                        spyOn(NewCtrl, 'isAsFarAs');
                    });

                    describe('on the "general" tab', function() {
                        beforeEach(function() {
                            tab = NewCtrl.tabs[0];
                        });

                        describe('if there is no title', function() {
                            beforeEach(function() {
                                NewCtrl.title = '';
                            });

                            it('should be false', function() {
                                expect(NewCtrl.tabIsValid(tab)).toBe(false);
                            });
                        });

                        describe('if there is a title', function() {
                            beforeEach(function() {
                                NewCtrl.title = 'Foo!';
                            });

                            it('should be true', function() {
                                expect(NewCtrl.tabIsValid(tab)).toBe(true);
                            });
                        });
                    });

                    [1, 2, 3].forEach(function(index) {
                        describe('on the tab at index: ' + index, function() {
                            [true, false].forEach(function(bool) {
                                describe('if isAsFarAs(tab) returns ' + bool, function() {
                                    beforeEach(function() {
                                        tab = NewCtrl.tabs[index];
                                        NewCtrl.isAsFarAs.and.returnValue(bool);
                                    });

                                    it('should return ' + bool, function() {
                                        expect(NewCtrl.tabIsValid(tab)).toBe(bool);
                                    });
                                });
                            });
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('this.category', function() {
                    it('should set the mode to be the first in the category', function() {
                        $scope.$apply(function() {
                            NewCtrl.category = model.modes[0];
                        });
                        expect(NewCtrl.mode).toBe(model.modes[0].modes[0]);

                        $scope.$apply(function() {
                            NewCtrl.category = model.modes[1];
                        });
                        expect(NewCtrl.mode).toBe(model.modes[1].modes[0]);
                    });

                    it('should bump up the requiredVisits of the mode tab by one', function() {
                        var modeTab = NewCtrl.tabs[2];

                        expect(modeTab.requiredVisits).toBe(modeTab.visits);

                        $scope.$apply(function() {
                            NewCtrl.category = model.modes[0];
                        });
                        expect(modeTab.requiredVisits).toBe(modeTab.visits + 1);
                    });
                });

                describe('this.mode', function() {
                    describe('when switching to a non-autoplayable mode', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                minireel.data.autoplay = true;
                                NewCtrl.autoplay = true;
                                NewCtrl.mode = model.modes[0].modes[0];
                            });

                            $scope.$apply(function() {
                                NewCtrl.mode = model.modes[1].modes[1];
                            });
                        });

                        it('should set this.autoplay to false', function() {
                            expect(NewCtrl.autoplay).toBe(false);
                        });

                        it('should bump up the requiredVisits of the autoplay tab', function() {
                            expect(NewCtrl.tabs[3].requiredVisits).toBe(NewCtrl.tabs[3].visits + 1);
                        });
                    });

                    describe('when switching to an autoplayable mode', function() {
                        [true, false].forEach(function(bool) {
                            describe('if the minireel autoplay setting is ' + bool, function() {
                                beforeEach(function() {
                                    minireel.data.autoplay = bool;

                                    $scope.$apply(function() {
                                        NewCtrl.mode = model.modes[0].modes[0];
                                    });
                                });

                                it('should set this.autoplay to ' + bool, function() {
                                    expect(NewCtrl.autoplay).toBe(bool);
                                });

                                it('should bump up the requiredVisits of the autoplay tab', function() {
                                    expect(NewCtrl.tabs[3].requiredVisits).toBe(NewCtrl.tabs[3].visits + 1);
                                });
                            });
                        });
                    });

                    describe('when switching modes that do not effect the autoplayable status', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                NewCtrl.mode = model.modes[0].modes[0];
                            });
                            NewCtrl.tabs[3].requiredVisits = NewCtrl.tabs[3].visits;
                            $scope.$apply(function() {
                                NewCtrl.mode = model.modes[0].modes[1];
                            });
                        });

                        it('should not bump up the requiredVisits of the autoplay tab', function() {
                            expect(NewCtrl.tabs[3].requiredVisits).toBe(NewCtrl.tabs[3].visits);
                        });
                    });
                });
            });
        });
    });
}());
