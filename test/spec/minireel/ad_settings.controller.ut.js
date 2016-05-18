(function() {
    'use strict';

    define(['minireel/ad_manager','app'], function(adModule, appModule) {
        describe('AdSettingsController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                PortalCtrl,
                MiniReelCtrl,
                c6State,
                cState,
                AdSettingsCtrl,
                MiniReelService,
                model,
                minireels,
                settings,
                initCtrl;

            function setCurrentState(name) {
                Object.defineProperty(c6State, 'current', {
                    get: function() {
                        return name;
                    }
                });
            }

            beforeEach(function() {
                model = [];

                settings = {
                    video: {
                        firstPlacement: 2,
                        frequency: 0,
                        waterfall: 'cinema6',
                        skip: 6
                    },
                    display: {
                        waterfall: 'cinema6',
                        enabled: false
                    }
                };

                minireels = [
                    {
                        id: 'e-1',
                        data: {
                            deck: [
                                {
                                    modules: []
                                },
                                {
                                    modules: []
                                },
                                {
                                    modules: []
                                }
                            ],
                            adConfig: {
                                video: {
                                    firstPlacement: 2,
                                    frequency: 0,
                                    waterfall: 'cinema6',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6',
                                    enabled: false
                                }
                            }
                        }
                    },
                    {
                        id: 'e-2',
                        data: {
                            deck: [
                                {
                                    modules: []
                                },
                                {
                                    modules: []
                                },
                                {
                                    modules: []
                                }
                            ]
                        }
                    }
                ];

                module(adModule.name);
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    MiniReelService = $injector.get('MiniReelService');

                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'goTo');

                    $scope = $rootScope.$new();

                    MiniReelCtrl = $scope.MiniReelCtrl = {
                        model: {
                            data: {
                                /* jshint quotmark:false */
                                "videoAdSources": [
                                    {
                                        "name": "Cinema6 Ad Server Only",
                                        "value": "cinema6",
                                        "description": "Only call the Cinema6 ad server"
                                    },
                                    {
                                        "name": "Cinema6 with Publisher Fallback",
                                        "value": "cinema6-publisher",
                                        "description": "Try calling Cinema6 ad server first, but fall back to publisher ad tag"
                                    },
                                    {
                                        "name": "Publisher Only",
                                        "value": "publisher",
                                        "description": "Only call the Publisher's provided ad tag"
                                    },
                                    {
                                        "name": "Publisher with Cinema6 Fallback",
                                        "value": "publisher-cinema6",
                                        "description": "Try calling Publisher ad tag first, but fall back to Cinema6 ad server"
                                    }
                                ],
                                "displayAdSources": [
                                    {
                                        "name": "Cinema6 Only",
                                        "value": "cinema6",
                                        "description": "Only call the Cinema6 ad server"
                                    },
                                    {
                                        "name": "Cinema6 with Publisher Fallback",
                                        "value": "cinema6-publisher",
                                        "description": "Try calling Cinema6 ad server first, but fall back to publisher ad tag"
                                    },
                                    {
                                        "name": "Publisher Only",
                                        "value": "publisher",
                                        "description": "Only call the Publisher's provided ad tag"
                                    },
                                    {
                                        "name": "Publisher with Cinema6 Fallback",
                                        "value": "publisher-cinema6",
                                        "description": "Try calling Publisher ad tag first, but fall back to Cinema6 ad server"
                                    }
                                ]
                                /* jshint quotmark:single */
                            }
                        }
                    };

                    cState = c6State.get('MR:AdManager.Settings');

                    initCtrl = function(model, org) {
                        PortalCtrl = $scope.PortalCtrl = { model: {} };

                        PortalCtrl.model.org = org || {
                            id: 'org1'
                        };

                        cState.cModel = model;

                        $scope.$apply(function() {
                            AdSettingsCtrl = $controller('AdSettingsController', { $scope: $scope, cState: cState });
                            AdSettingsCtrl.model = model;
                        });
                    };
                });
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $controller = null;
                $q = null;
                PortalCtrl = null;
                MiniReelCtrl = null;
                c6State = null;
                cState = null;
                AdSettingsCtrl = null;
                MiniReelService = null;
                model = null;
                minireels = null;
                settings = null;
                initCtrl = null;
            });

            describe('initialization', function() {
                it('should go to Ad Manager if there is no model to bind', function() {
                    initCtrl();
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager');
                });

                it('should go to Frequency tab if there is a model', function() {
                    initCtrl({
                        type: 'minireels',
                        settings: settings,
                        data: minireels
                    });
                    expect(c6State.goTo).not.toHaveBeenCalledWith('MR:AdManager');
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings.Frequency');
                });
            });

            describe('properties', function() {
                describe('adChoices', function() {
                    it('should enable options based on org data', function() {
                        var model = {
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        },
                        org = {
                            id: 'org1',
                            waterfalls: {
                                video: ['cinema6','publisher','publisher-cinema6'],
                                display: ['cinema6','publisher']
                            }
                        };

                        initCtrl(model, org);

                        expect(AdSettingsCtrl.adChoices.video.length).toBe(3);
                        expect(AdSettingsCtrl.adChoices.display.length).toBe(2);
                    });
                });

                describe('returnState', function() {
                    it('should be the parent state', function() {
                        expect(AdSettingsCtrl.returnState).toBe('MR:AdManager');
                    });
                });

                describe('tabs', function() {
                    it('should have three tabs', function() {
                        expect(AdSettingsCtrl.tabs.length).toBe(3);
                        expect(AdSettingsCtrl.tabs).toEqual([
                                jasmine.objectContaining({
                                    name: jasmine.any(String),
                                    sref: 'MR:AdManager.Settings.Frequency',
                                    visits: 0,
                                    required: false,
                                    requiredVisits: 0
                                }),
                                jasmine.objectContaining({
                                    name: jasmine.any(String),
                                    sref: 'MR:AdManager.Settings.VideoServer',
                                    visits: 0,
                                    required: false,
                                    requiredVisits: 0
                                }),
                                jasmine.objectContaining({
                                    name: jasmine.any(String),
                                    sref: 'MR:AdManager.Settings.DisplayServer',
                                    visits: 0,
                                    required: false,
                                    requiredVisits: 0
                                })
                            ]);
                    });
                });

                describe('frequency', function() {
                    it('should bind to UI value if set', function() {
                        var model = {
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        };

                        initCtrl(model);

                        expect(AdSettingsCtrl.frequency).toBe(0);

                        settings.video.frequency = 3;

                        initCtrl(model);
                        expect(AdSettingsCtrl.frequency).toBe(3);

                        settings.video.frequency = void 0;

                        initCtrl(model);
                        expect(AdSettingsCtrl.frequency).not.toBeDefined();
                    });
                });

                describe('firstPlacement', function() {
                    it('should bind to UI value if set', function() {
                        var model = {
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        };

                        initCtrl(model);
                        expect(AdSettingsCtrl.firstPlacement).toBe(2);

                        settings.video.firstPlacement = -1;

                        initCtrl(model);
                        expect(AdSettingsCtrl.firstPlacement).toBe(-1);

                        settings.video.firstPlacement = void 0;

                        initCtrl(model);
                        expect(AdSettingsCtrl.firstPlacement).not.toBeDefined();
                    });
                });

                describe('skip', function() {
                    it('should bind to UI value if set', function() {
                        var model = {
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        };

                        initCtrl(model);
                        expect(AdSettingsCtrl.skip).toBe(6);

                        settings.video.skip = false;

                        initCtrl(model);
                        expect(AdSettingsCtrl.skip).toBe(false);

                        settings.video.skip = void 0;

                        initCtrl(model);
                        expect(AdSettingsCtrl.skip).not.toBeDefined();
                    });
                });

                describe('firstPlacementOptions', function() {
                    describe('when editing Org', function() {
                        it('should offer 12 options', function() {
                            initCtrl({
                                type: 'org',
                                settings: settings,
                                data: {id:'org1'}
                            });

                            expect(Object.keys(AdSettingsCtrl.firstPlacementOptions).length).toBe(12);
                            expect(AdSettingsCtrl.firstPlacementOptions['No ads']).toBe(-1);
                            expect(AdSettingsCtrl.firstPlacementOptions['After 10th Video']).toBe(10);
                        });
                    });

                    describe('when editing minireel(s)', function() {
                        it('should offer (2 + the smallest number of cards in all the decks) options', function() {
                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            });

                            expect(Object.keys(AdSettingsCtrl.firstPlacementOptions).length).toBe(5);
                            expect(AdSettingsCtrl.firstPlacementOptions['No ads']).toBe(-1);
                            expect(AdSettingsCtrl.firstPlacementOptions['After 3rd Video']).toBe(3);
                        });

                        describe('if the default is not present based on the number of slides in the MiniReel', function() {
                            beforeEach(function() {
                                settings.video.firstPlacement = 2;

                                initCtrl({
                                    type: 'minireels',
                                    settings: settings,
                                    data: [{
                                        data: {
                                            deck: [{}]
                                        }
                                    }]
                                });
                            });

                            it('should still include the default setting', function() {
                                expect(AdSettingsCtrl.firstPlacementOptions['After 2nd Video']).toBe(2);
                            });
                        });

                        describe('if the firstPlacement is undefined', function() {
                            beforeEach(function() {
                                settings.video.firstPlacement = undefined;
                                initCtrl({
                                    type: 'minireels',
                                    settings: settings,
                                    data: minireels
                                });
                            });

                            it('should not create a dropdown item for undefined', function() {
                                expect('After undefinedth Video' in AdSettingsCtrl.firstPlacementOptions).toBe(false);
                                expect('undefined' in AdSettingsCtrl.firstPlacementOptions).toBe(false);
                            });
                        });

                        describe('if the firstPlacement is -1', function() {
                            beforeEach(function() {
                                settings.video.firstPlacement = -1;
                                initCtrl({
                                    type: 'minireels',
                                    settings: settings,
                                    data: minireels
                                });
                            });

                            it('should not create some strange option', function() {
                                expect('After -1th Video' in AdSettingsCtrl.firstPlacementOptions).toBe(false);
                            });
                        });
                    });
                });

                describe('frequencyOptions', function() {
                    it('should show 11 options', function() {
                        initCtrl({
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        });

                        expect(Object.keys(AdSettingsCtrl.frequencyOptions).length).toBe(11);
                        expect(AdSettingsCtrl.frequencyOptions['No subsequent ads']).toBe(0);
                        expect(AdSettingsCtrl.frequencyOptions['After every video']).toBe(1);
                        expect(AdSettingsCtrl.frequencyOptions['After every 10th video']).toBe(10);
                    });
                });

                describe('skipOptions', function() {
                    it('should show 3 options', function() {
                        initCtrl({
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        });

                        expect(AdSettingsCtrl.skipOptions).toEqual({
                            'No, users cannot skip ads': false,
                            'Yes, after six seconds': 6,
                            'Yes, skip ads at any time': true
                        });
                    });
                });

                describe('currentTab', function() {
                    describe('if there is no tab for the current state', function() {
                        it('should be null', function() {
                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            });

                            setCurrentState('MR:New.Foo');

                            expect(AdSettingsCtrl.currentTab).toBeNull();
                        });
                    });

                    describe('if there is a tab for the current state', function() {
                        it('should be the tab for the current state', function() {
                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            });

                            AdSettingsCtrl.tabs.forEach(function(tab) {
                                setCurrentState(tab.sref);

                                expect(AdSettingsCtrl.currentTab).toBe(tab);
                            });
                        });
                    });
                });
            });

            describe('events', function() {
                describe('c6State:stateChange', function() {
                    [0, 1, 2].forEach(function(index) {
                        describe('with the state of the tab at index: ' + index, function() {
                            var tab,
                                state,
                                initialVisits;

                            beforeEach(function() {
                                initCtrl({
                                    type: 'minireels',
                                    settings: settings,
                                    data: minireels
                                });

                                tab = AdSettingsCtrl.tabs[index];
                                initialVisits = tab.visits;
                                state = {
                                    cName: tab.sref
                                };

                                c6State.emit('stateChange', state);
                            });

                            it('should bump up the visits of the corresponding tab', function() {
                                expect(tab.visits).toBe(initialVisits + 1);
                            });
                        });
                    });

                    describe('after the $scope is destroyed', function() {
                        var initialVisits;

                        beforeEach(function() {
                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            });

                            $scope.$destroy();
                            initialVisits = AdSettingsCtrl.tabs[2].visits;

                            c6State.emit('stateChange', { name: AdSettingsCtrl.baseState + '.autoplay' });
                        });

                        it('should not increment visits', function() {
                            expect(AdSettingsCtrl.tabs[2].visits).toBe(initialVisits);
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('isAsFarAs(tab)', function() {
                    beforeEach(function() {
                        Object.defineProperty(AdSettingsCtrl, 'currentTab', {
                            value: AdSettingsCtrl.tabs[1]
                        });
                    });

                    it('should be true if the currentTab is, or comes before, the currentTab', function() {
                        AdSettingsCtrl.tabs.forEach(function(tab, index) {
                            if (index <= 1) {
                                expect(AdSettingsCtrl.isAsFarAs(tab)).toBe(true);
                            } else {
                                expect(AdSettingsCtrl.isAsFarAs(tab)).toBe(false);
                            }
                        });
                    });
                });

                describe('tabIsValid', function() {
                    var tab;

                    describe('on the "frequency" tab', function() {
                        beforeEach(function() {
                            tab = AdSettingsCtrl.tabs[0];
                        });

                        describe('if there is no frequency || skip || firstPlacement', function() {
                            it('should be false', function() {
                                AdSettingsCtrl.frequency = undefined;
                                AdSettingsCtrl.skip = false;
                                AdSettingsCtrl.firstPlacement = 3;

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(false);

                                AdSettingsCtrl.frequency = 0;
                                AdSettingsCtrl.skip = true;
                                AdSettingsCtrl.firstPlacement = undefined;

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(false);

                                AdSettingsCtrl.frequency = 3;
                                AdSettingsCtrl.skip = undefined;
                                AdSettingsCtrl.firstPlacement = 0;

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(false);
                            });
                        });

                        describe('if there is frequency && skip && firstPlacement', function() {
                            it('should be true', function() {
                                AdSettingsCtrl.frequency = 0;
                                AdSettingsCtrl.skip = false;
                                AdSettingsCtrl.firstPlacement = 0;

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(true);
                            });
                        });
                    });

                    describe('on the "video server" tab', function() {
                        beforeEach(function() {
                            tab = AdSettingsCtrl.tabs[1];
                        });

                        describe('if there is no video waterfall', function() {
                            it('should be false', function() {
                                AdSettingsCtrl.model.settings.video.waterfall = '';

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(false);
                            });
                        });

                        describe('if there is frequency && skip && firstPlacement', function() {
                            it('should be true', function() {
                                AdSettingsCtrl.model.settings.video.waterfall = 'cinema6';

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(true);
                            });
                        });
                    });

                    describe('on the "display server" tab', function() {
                        beforeEach(function() {
                            tab = AdSettingsCtrl.tabs[2];
                        });

                        describe('if there is no display waterfall', function() {
                            it('should be false', function() {
                                AdSettingsCtrl.model.settings.display.waterfall = '';

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(false);
                            });
                        });

                        describe('if there is frequency && skip && firstPlacement', function() {
                            it('should be true', function() {
                                AdSettingsCtrl.model.settings.display.waterfall = 'cinema6';

                                expect(AdSettingsCtrl.tabIsValid(tab)).toBe(true);
                            });
                        });
                    });
                });

                describe('formIsValid', function() {
                    describe('when any settings are missing', function() {
                        it('should return false', function() {
                            AdSettingsCtrl.frequency = undefined;
                            AdSettingsCtrl.skip = false;
                            AdSettingsCtrl.firstPlacement = 3;
                            AdSettingsCtrl.model.settings.video.waterfall = 'cinema6';
                            AdSettingsCtrl.model.settings.display.waterfall = 'cinema6';

                            expect(AdSettingsCtrl.formIsValid()).toBe(false);

                            AdSettingsCtrl.frequency = 3;
                            AdSettingsCtrl.skip = false;
                            AdSettingsCtrl.firstPlacement = 3;
                            AdSettingsCtrl.model.settings.video.waterfall = undefined;
                            AdSettingsCtrl.model.settings.display.waterfall = 'cinema6';

                            expect(AdSettingsCtrl.formIsValid()).toBe(false);

                            AdSettingsCtrl.frequency = 3;
                            AdSettingsCtrl.skip = false;
                            AdSettingsCtrl.firstPlacement = 3;
                            AdSettingsCtrl.model.settings.video.waterfall = 'cinema6';
                            AdSettingsCtrl.model.settings.display.waterfall = undefined;

                            expect(AdSettingsCtrl.formIsValid()).toBe(false);
                        });
                    });

                    describe('when all settings are defined', function() {
                        it('should return true', function() {
                            AdSettingsCtrl.frequency = 3;
                            AdSettingsCtrl.skip = false;
                            AdSettingsCtrl.firstPlacement = 3;
                            AdSettingsCtrl.model.settings.video.waterfall = 'cinema6';
                            AdSettingsCtrl.model.settings.display.waterfall = 'cinema6';

                            expect(AdSettingsCtrl.formIsValid()).toBe(true);
                        });
                    });
                });

                describe('prevTab()', function() {
                    beforeEach(function() {
                        initCtrl({
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        });
                    });

                    describe('when there is a previous tab', function() {
                        it('should go to the next tab state', function() {
                            setCurrentState('MR:AdManager.Settings.VideoServer');

                            AdSettingsCtrl.prevTab();

                            expect(c6State.goTo).toHaveBeenCalledWith(AdSettingsCtrl.tabs[0].sref);
                        });
                    });

                    describe('when there is not a next tab', function() {
                        it('should do nothing', function() {
                            var previousGoToCalls = c6State.goTo.calls.count();

                            setCurrentState('MR:AdManager.Settings.Frequency');

                            AdSettingsCtrl.prevTab();

                            expect(c6State.goTo.calls.count()).toBe(previousGoToCalls);
                        });
                    });
                });

                describe('nextTab()', function() {
                    beforeEach(function() {
                        initCtrl({
                            type: 'minireels',
                            settings: settings,
                            data: minireels
                        });
                    });

                    describe('when there is a next tab', function() {
                        it('should go to the next tab state', function() {
                            setCurrentState('MR:AdManager.Settings.Frequency');

                            AdSettingsCtrl.nextTab();

                            expect(c6State.goTo).toHaveBeenCalledWith(AdSettingsCtrl.tabs[1].sref);
                        });
                    });

                    describe('when there is not a next tab', function() {
                        it('should do nothing', function() {
                            var previousGoToCalls = c6State.goTo.calls.count();

                            setCurrentState('MR:AdManager.Settings.DisplayServer');

                            AdSettingsCtrl.nextTab();

                            expect(c6State.goTo.calls.count()).toBe(previousGoToCalls);
                        });
                    });
                });

                describe('save()', function() {
                    beforeEach(function() {
                        settings.video.frequency = 3;
                        AdSettingsCtrl.frequency = 3;
                    });

                    describe('when editing an Org', function() {
                        it('should put the settings on the org and save', function() {
                            var goToCallCount,
                                saveDeferred = $q.defer(),
                                org = {
                                    id: 'org1',
                                    save: jasmine.createSpy('org.save()').and.returnValue(saveDeferred.promise)
                                };

                            initCtrl({
                                type: 'org',
                                settings: settings,
                                data: {id: 'o-1'}
                            }, org);

                            goToCallCount = c6State.goTo.calls.count();

                            AdSettingsCtrl.save();

                            expect(PortalCtrl.model.org.adConfig).toEqual(settings);
                            expect(org.save).toHaveBeenCalled();
                            expect(c6State.goTo.calls.count()).toEqual(goToCallCount);

                            $scope.$apply(function() {
                                saveDeferred.resolve();
                            });

                            expect(c6State.goTo.calls.count()).toEqual(goToCallCount + 1);
                        });

                        it('should handle incomplete adConfig', function() {
                            var saveDeferred = $q.defer(),
                                org = {
                                    id: 'org1',
                                    save: jasmine.createSpy('org.save()').and.returnValue(saveDeferred.promise),
                                    adConfig: {
                                        video: {},
                                        display: {}
                                    }
                                };

                            initCtrl({
                                type: 'org',
                                settings: settings,
                                data: {id: 'o-1'}
                            }, org);

                            AdSettingsCtrl.save();

                            expect(PortalCtrl.model.org.adConfig).toEqual(settings);
                        });
                    });

                    describe('when editing minireel(s)', function() {
                        it('should put the settings on each minireel and save', function() {
                            var goToCallCount,
                                saveDeferred = $q.defer();

                            minireels.forEach(function(minireel) {
                                minireel.save = jasmine.createSpy('exp.save()').and.returnValue(saveDeferred.promise);
                            });

                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            });

                            goToCallCount = c6State.goTo.calls.count();

                            AdSettingsCtrl.save();

                            minireels.forEach(function(minireel) {
                                expect(minireel.data.adConfig).toEqual(settings);
                                expect(minireel.save).toHaveBeenCalled();
                            });

                            expect(c6State.goTo.calls.count()).toEqual(goToCallCount);

                            $scope.$apply(function() {
                                saveDeferred.resolve();
                            });

                            expect(c6State.goTo.calls.count()).toEqual(goToCallCount + 1);
                        });

                        it('should handle incomplete adConfig', function() {
                            var saveDeferred = $q.defer(),
                                org = {
                                    id: 'org1',
                                    save: jasmine.createSpy('org.save()').and.returnValue(saveDeferred.promise),
                                    adConfig: {
                                        video: {},
                                        display: {}
                                    }
                                };

                            minireels.forEach(function(minireel) {
                                minireel.save = jasmine.createSpy('exp.save()').and.returnValue(saveDeferred.promise);
                            });

                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            }, org);

                            AdSettingsCtrl.save();

                            minireels.forEach(function(minireel) {
                                expect(minireel.data.adConfig).toEqual(settings);
                            });

                            minireels.forEach(function(minireel) {
                                minireel.data.adConfig = {
                                    video: {},
                                    display: {}
                                };
                            });

                            AdSettingsCtrl.save();

                            minireels.forEach(function(minireel) {
                                expect(minireel.data.adConfig).toEqual(settings);
                            });
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('firstPlacement', function() {
                    describe('when set to -1', function() {
                        it('should set the frequency to 0', function() {
                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            });

                            AdSettingsCtrl.frequency = 5;

                            $scope.$apply(function() {
                                AdSettingsCtrl.firstPlacement = -1;
                            });

                            expect(AdSettingsCtrl.frequency).toBe(0);
                        });
                    });

                    describe('when set to anything except -1', function() {
                        it('should do nothing', function() {
                            initCtrl({
                                type: 'minireels',
                                settings: settings,
                                data: minireels
                            });

                            AdSettingsCtrl.frequency = 5;

                            $scope.$apply(function() {
                                AdSettingsCtrl.firstPlacement = 5;
                            });

                            expect(AdSettingsCtrl.frequency).toBe(5);
                        });
                    });
                });
            });
        });
    });
}());
