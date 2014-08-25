(function() {
    'use strict';

    define(['minireel/ad_manager', 'app'], function(adModule, appModule) {
        /* global angular:true */
        var forEach = angular.forEach;

        describe('AdManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                cState,
                ConfirmDialogService,
                AdManagerCtrl,
                Portal,
                model,
                experiences;

            beforeEach(function() {
                model = [];
                /* jshint quotmark:false */
                experiences = [
                    {
                        id: "e2e-getquery1",
                        status: "active",
                        access: "public",
                        user: "e2e-user",
                        org: "e2e-org",
                        type: "foo",
                        data: {
                            deck: [
                                {
                                    id: 'c-1'
                                },
                                {
                                    id: 'c-2',
                                    ad: true
                                },
                                {
                                    id: 'c-3'
                                }
                            ]
                        }
                    },
                    {
                        id: "e2e-getquery2",
                        status: "inactive",
                        access: "private",
                        user: "e2e-user",
                        org: "not-e2e-org",
                        type: "foo",
                        data: {
                            deck: [
                                {
                                    id: 'c-1'
                                },
                                {
                                    id: 'c-2'
                                },
                                {
                                    id: 'c-3'
                                }
                            ]
                        }
                    },
                    {
                        id: "e2e-getquery3",
                        status: "active",
                        access: "public",
                        user: "not-e2e-user",
                        org: "e2e-org",
                        type: "bar",
                        data: {
                            deck: [
                                {
                                    id: 'c-1'
                                },
                                {
                                    id: 'c-2',
                                    ad: true
                                },
                                {
                                    id: 'c-3'
                                }
                            ]
                        }
                    },
                    {
                        id: "e2e-getquery4",
                        status: "inactive",
                        access: "private",
                        user: "not-e2e-user",
                        org: "not-e2e-org",
                        data: {
                            deck: [
                                {
                                    id: 'c-1'
                                },
                                {
                                    id: 'c-2',
                                },
                                {
                                    id: 'c-3'
                                }
                            ]
                        }
                    }
                ];
                /* jshint quotmark:single */

                module(adModule.name);
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');

                    ConfirmDialogService = $injector.get('ConfirmDialogService');

                    c6State = $injector.get('c6State');

                    Portal = c6State.get('Portal');
                    Portal.cModel = {
                        org: {
                            id: 'org1'
                        }
                    };

                    cState = c6State.get('MR:AdManager');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        AdManagerCtrl = $controller('AdManagerController', { $scope: $scope, cState: cState });
                        AdManagerCtrl.model = model;
                    });
                });
            });

            describe('$watch', function() {
                describe('cState.cModel', function() {
                    it('should set up the experienceMap for UI binding', function() {
                        $scope.$apply(function() {
                            cState.cModel = experiences;
                        });

                        forEach(experiences, function(val, key) {
                            expect(AdManagerCtrl.experienceMap[val.id]).toEqual({selected: false});
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('selectedExperiences', function() {
                    it('should contain all selected experiences', function() {
                        $scope.$apply(function() {
                            cState.cModel = experiences;
                        });

                        expect(AdManagerCtrl.selectedExperiences).toEqual([]);

                        AdManagerCtrl.experienceMap['e2e-getquery1'].selected = true;
                        expect(AdManagerCtrl.selectedExperiences.length).toBe(1);
                        expect(AdManagerCtrl.selectedExperiences[0]).toEqual(experiences[0]);

                        AdManagerCtrl.experienceMap['e2e-getquery4'].selected = true;
                        expect(AdManagerCtrl.selectedExperiences.length).toBe(2);
                        expect(AdManagerCtrl.selectedExperiences[1]).toEqual(experiences[3]);

                        AdManagerCtrl.experienceMap['e2e-getquery1'].selected = false;
                        expect(AdManagerCtrl.selectedExperiences.length).toBe(1);
                        expect(AdManagerCtrl.selectedExperiences[0]).toEqual(experiences[3]);
                    });
                });
            });

            describe('methods', function() {
                var minireel;

                beforeEach(function() {
                    minireel = {
                        id: 'e-1',
                        data: {
                            deck: [
                                    {
                                        id: 'c-1'
                                    },
                                    {
                                        id: 'c-2',
                                    },
                                    {
                                        id: 'c-3'
                                    },
                                    {
                                        id: 'c-4'
                                    },
                                    {
                                        id: 'c-5',
                                    },
                                    {
                                        id: 'c-6'
                                    },
                                    {
                                        id: 'c-7'
                                    },
                                    {
                                        id: 'c-8',
                                    },
                                    {
                                        id: 'c-9'
                                    }
                                ]
                        }
                    };
                });

                describe('settingsTypeOf(minireel)', function() {
                    it('should be Default if there is no adConfig', function() {
                        expect(AdManagerCtrl.settingsTypeOf(minireel)).toBe('Default');
                    });

                    it('should be Custom if there is an adConfig', function() {
                        minireel.data.adConfig = {};
                        expect(AdManagerCtrl.settingsTypeOf(minireel)).toBe('Custom');
                    });

                    it('should be Custom even if the adConfig matches the Org\'s adConfig', function() {
                        minireel.data.adConfig = {
                            video: {
                                frequency: 0,
                                firstPlacement: 2,
                                waterfall: 'cinema6',
                                skip: 6
                            },
                            display: {
                                waterfall: 'cinema6'
                            }
                        };
                        expect(AdManagerCtrl.settingsTypeOf(minireel)).toBe('Custom');
                    });
                });

                describe('adCountOf(minireel)', function() {
                    it('should return the number of static ad cards if they exist', function() {
                        minireel.data.deck[1].ad = true;
                        minireel.data.deck[4].ad = true;

                        expect(AdManagerCtrl.adCountOf(minireel)).toBe(2);
                    });

                    it('should calculate based on system defaults if no adConfig', function() {
                        expect(AdManagerCtrl.adCountOf(minireel)).toBe(1);
                    });

                    it('should calculate based on minireel config if set', function() {
                        minireel.data.adConfig = {
                            video: {
                                frequency: 1,
                                firstPlacement: 1,
                            }
                        };

                        expect(AdManagerCtrl.adCountOf(minireel)).toBe(8);

                        minireel.data.adConfig = {
                            video: {
                                frequency: 1,
                                firstPlacement: -1,
                            }
                        };

                        expect(AdManagerCtrl.adCountOf(minireel)).toBe(0);
                    });
                });

                describe('editSettings(type, minireel)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        $scope.$apply(function() {
                            cState.cModel = experiences;
                        });
                    });

                    describe('when editing Org defaults', function() {
                        it('should go to Settings state and pass the settings to be edited', function() {
                            AdManagerCtrl.editSettings('org', null);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                video: {
                                    frequency: 0,
                                    firstPlacement: 2,
                                    waterfall: 'cinema6',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }]);
                        });
                    });

                    describe('when editing a single minireel', function() {
                        it('should mark the minireel as "selected" and pass the settings to be edited', function() {
                            minireel.id = 'e2e-getquery1';
                            minireel.data.adConfig = {
                                video: {
                                    frequency: 2,
                                    firstPlacement: 1,
                                    waterfall: 'publisher',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            };

                            AdManagerCtrl.editSettings('minireel', minireel);

                            expect(AdManagerCtrl.experienceMap['e2e-getquery1'].selected).toBe(true);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                video: {
                                    frequency: 2,
                                    firstPlacement: 1,
                                    waterfall: 'publisher',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }]);
                        });
                    });

                    describe('when editing multiple minireels', function() {
                        it('should find matching settings and pass them to the Settings state', function() {
                            // round 1: same stetings

                            cState.cModel[0].data.adConfig = {
                                video: {
                                    frequency: 3,
                                    firstPlacement: 2,
                                    waterfall: 'publisher',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }

                            cState.cModel[1].data.adConfig = {
                                video: {
                                    frequency: 3,
                                    firstPlacement: 2,
                                    waterfall: 'publisher',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }

                            AdManagerCtrl.experienceMap['e2e-getquery1'].selected = true;
                            AdManagerCtrl.experienceMap['e2e-getquery2'].selected = true;

                            AdManagerCtrl.editSettings('minireels', null);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                video: {
                                    frequency: 3,
                                    firstPlacement: 2,
                                    waterfall: 'publisher',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }]);

                            // round 2: different settings

                            cState.cModel[0].data.adConfig = {
                                video: {
                                    frequency: 1,
                                    firstPlacement: 3,
                                    waterfall: 'publisher',
                                    skip: true
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }

                            cState.cModel[1].data.adConfig = {
                                video: {
                                    frequency: 3,
                                    firstPlacement: 2,
                                    waterfall: 'cinema6',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'publisher'
                                }
                            }

                            AdManagerCtrl.experienceMap['e2e-getquery1'].selected = true;
                            AdManagerCtrl.experienceMap['e2e-getquery2'].selected = true;

                            AdManagerCtrl.editSettings('minireels', null);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                video: {
                                    frequency: undefined,
                                    firstPlacement: undefined,
                                    waterfall: undefined,
                                    skip: undefined
                                },
                                display: {
                                    waterfall: undefined
                                }
                            }]);

                            // round 3: some shared settings

                            cState.cModel[0].data.adConfig = {
                                video: {
                                    frequency: 2,
                                    firstPlacement: 3,
                                    waterfall: 'cinema6',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            }

                            cState.cModel[1].data.adConfig = {
                                video: {
                                    frequency: 2,
                                    firstPlacement: 2,
                                    waterfall: 'cinema6',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'publisher'
                                }
                            }

                            AdManagerCtrl.experienceMap['e2e-getquery1'].selected = true;
                            AdManagerCtrl.experienceMap['e2e-getquery2'].selected = true;

                            AdManagerCtrl.editSettings('minireels', null);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                video: {
                                    frequency: 2,
                                    firstPlacement: undefined,
                                    waterfall: 'cinema6',
                                    skip: 6
                                },
                                display: {
                                    waterfall: undefined
                                }
                            }]);
                        });
                    });
                });

                describe('saveSettings(settings)', function() {
                    // TODO
                });

                describe('useDefaultSettings()', function() {
                    it('should go through all selected minireels and delete static ad cards and adConfig blocks', function() {
                        experiences[0].data.adConfig = {};
                        experiences[1].data.adConfig = {};
                        experiences[3].data.adConfig = {};

                        $scope.$apply(function() {
                            cState.cModel = experiences;
                        });

                        AdManagerCtrl.experienceMap['e2e-getquery1'].selected = true;
                        AdManagerCtrl.experienceMap['e2e-getquery2'].selected = true;
                        AdManagerCtrl.experienceMap['e2e-getquery4'].selected = true;

                        AdManagerCtrl.useDefaultSettings();

                        expect(cState.cModel[0].data.deck.length).toBe(2);
                        expect(cState.cModel[0].data.adConfig).not.toBeDefined();

                        expect(cState.cModel[1].data.adConfig).not.toBeDefined();

                        expect(cState.cModel[3].data.adConfig).not.toBeDefined();
                    });
                });

                describe('removeAds()', function() {
                    it('should display a ConfirmDialogService', function() {
                        var onAffirm, onCancel;

                        $scope.$apply(function() {
                            cState.cModel = experiences;
                        });

                        AdManagerCtrl.experienceMap['e2e-getquery1'].selected = true;
                        AdManagerCtrl.experienceMap['e2e-getquery2'].selected = true;

                        spyOn(ConfirmDialogService, 'display');
                        AdManagerCtrl.removeAds();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;

                        expect(ConfirmDialogService.display).toHaveBeenCalled();

                        onAffirm();

                        expect(cState.cModel[0].data.deck.length).toBe(2);
                        expect(cState.cModel[0].data.adConfig.video.firstPlacement).toBe(-1);
                        expect(cState.cModel[1].data.adConfig.video.firstPlacement).toBe(-1);
                    });
                });
            });
        });
    });
}());