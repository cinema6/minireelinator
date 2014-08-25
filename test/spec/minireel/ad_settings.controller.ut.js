(function() {
    'use strict';

    define(['minireel/ad_manager','app'], function(adModule, appModule) {
        ddescribe('AdSettingsController', function() {
            var $rootScope,
                $scope,
                $controller,
                PortalCtrl,
                MiniReelCtrl,
                c6State,
                cState,
                AdSettingsCtrl,
                model,
                settings,
                initCtrl;

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
                        waterfall: 'cinema6'
                    }
                };

                module(adModule.name);
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

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

            describe('initialization', function() {
                it('should go to Ad Manager if there is no model to bind', function() {
                    initCtrl();
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager');
                });

                it('should go to Frequency tab if there is a model', function() {
                    initCtrl(settings);
                    expect(c6State.goTo).not.toHaveBeenCalledWith('MR:AdManager');
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings.Frequency');
                });
            });

            describe('properties', function() {
                describe('adChoices', function() {
                    it('should enable options based on org data', function() {
                        initCtrl(settings, {
                            id: 'org1',
                            waterfalls: {
                                video: ['cinema6','publisher','publisher-cinema6'],
                                display: ['cinema6','publisher']
                            }
                        });

                        expect(AdSettingsCtrl.adChoices.video.length).toBe(3);
                        expect(AdSettingsCtrl.adChoices.display.length).toBe(2);
                    });
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
                });
            });

            describe('frequency', function() {
                it('should bind to UI value if set', function() {
                    initCtrl(settings);
                    expect(AdSettingsCtrl.frequency).toEqual({
                        label: 'Only show the first ad',
                        value: 0
                    });

                    settings.video.frequency = 3;

                    initCtrl(settings);
                    expect(AdSettingsCtrl.frequency).toEqual({
                        label: 'After every 3rd video',
                        value: 3
                    });

                    settings.video.frequency = void 0;

                    initCtrl(settings);
                    expect(AdSettingsCtrl.frequency).not.toBeDefined();
                });
            });

            describe('firstPlacement', function() {
                it('should bind to UI value if set', function() {
                    initCtrl(settings);
                    expect(AdSettingsCtrl.firstPlacement).toEqual({
                        label: 'After 2nd video',
                        value: 2
                    });

                    settings.video.firstPlacement = -1;

                    initCtrl(settings);
                    expect(AdSettingsCtrl.firstPlacement).toEqual({
                        label: 'No ads',
                        value: -1
                    });

                    settings.video.firstPlacement = void 0;

                    initCtrl(settings);
                    expect(AdSettingsCtrl.firstPlacement).not.toBeDefined();
                });
            });

            describe('settings', function() {
                it('should contain all settings in digestible format', function() {
                    initCtrl(settings);
                    expect(AdSettingsCtrl.settings).toEqual({
                        video: {
                            firstPlacement: 2,
                            frequency: 0,
                            waterfall: 'cinema6',
                            skip: 6
                        },
                        display: {
                            waterfall: 'cinema6'
                        }
                    });

                    settings.video.frequency = void 0;
                    settings.video.waterfall = void 0;
                    settings.display.waterfall = void 0;

                    initCtrl(settings);
                    expect(AdSettingsCtrl.settings).toEqual({
                        video: {
                            firstPlacement: 2,
                            frequency: undefined,
                            waterfall: undefined,
                            skip: 6
                        },
                        display: {
                            waterfall: undefined
                        }
                    });
                });
            });
        });
    });
}());