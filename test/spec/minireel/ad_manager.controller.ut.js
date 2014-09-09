(function() {
    'use strict';

    define(['minireel/ad_manager', 'app', 'angular'], function(adModule, appModule, angular) {
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
                PortalCtrl,
                MiniReelCtrl,
                MiniReelService,
                scopePromise,
                model;

            var user,
                config;

            function instantiate() {
                $scope = $rootScope.$new();

                $scope.$apply(function() {
                    PortalCtrl = $scope.PortalCtrl = $controller('PortalController', {
                        $scope: $scope
                    });
                    PortalCtrl.model = user;

                    MiniReelCtrl = $scope.MiniReelCtrl = $controller('MiniReelController', {
                        $scope: $scope
                    });
                    MiniReelCtrl.model = config;

                    AdManagerCtrl = $controller('AdManagerController', {
                        $scope: $scope,
                        cState: cState
                    });
                    AdManagerCtrl.model = model;
                });

                return AdManagerCtrl;
            }

            beforeEach(function() {
                module(adModule.name);
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    scopePromise = $injector.get('scopePromise');

                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');

                    c6State = $injector.get('c6State');

                    cState = c6State.get('MR:AdManager');
                    cState.filter = 'foo';

                    model = scopePromise($q.defer().promise, [
                        {
                            status: 'active'
                        },
                        {
                            status: 'pending'
                        },
                        {
                            status: 'active'
                        },
                        {
                            status: 'pending'
                        }
                    ]);
                    model.selected = model.value.map(function() {
                        return false;
                    });

                    $scope = $rootScope.$new();

                    user = {
                        org: {
                            id: 'org1'
                        },
                        permissions: {
                            orgs: {},
                            experiences: {}
                        }
                    };

                    config = {
                        data: {
                            /* jshint quotmark:false */
                            "modes": [
                                {
                                    "modes": [
                                        {
                                            "name": "No Companion Ad",
                                            "value": "lightbox"
                                        },
                                        {
                                            "name": "With Companion Ad",
                                            "value": "lightbox-ads"
                                        }
                                    ]
                                },
                                {
                                    "modes": [
                                        {
                                            "name": "Light Text",
                                            "value": "light"
                                        },
                                        {
                                            "name": "Heavy Text",
                                            "value": "full"
                                        }
                                    ]
                                }
                            ]
                            /* jshint quotmark:single */
                        }
                    };

                    spyOn(cState.cParent, 'getMiniReelList');

                    AdManagerCtrl = instantiate();
                });
            });

            it('should exist', function() {
                expect(AdManagerCtrl).toEqual(jasmine.any(Object));
            });

            describe('$events', function() {
                describe('$destroy', function() {
                    beforeEach(function() {
                        AdManagerCtrl.filter = 'active';

                        $scope.$destroy();
                    });

                    it('should set the filter on the state', function() {
                        expect(cState.filter).toBe(AdManagerCtrl.filter);
                    });
                });
            });

            describe('$watchers', function() {
                describe('props that will refetch the model', function() {
                    var scopedPromise;

                    beforeEach(function() {
                        scopedPromise = scopePromise($q.defer().promise);
                        cState.cParent.getMiniReelList.and.returnValue(scopedPromise);

                        $scope.$apply(function() {
                            AdManagerCtrl.page = 3;
                        });

                        model = AdManagerCtrl.model;
                    });

                    describe('this.filter', function() {
                        ['all', 'active', 'pending'].forEach(function(status) {
                            describe('when changed to ' + status, function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        AdManagerCtrl.filter = status;
                                    });
                                });

                                it('should get a new model', function() {
                                    expect(cState.cParent.getMiniReelList).toHaveBeenCalledWith(status, AdManagerCtrl.limit, 1, model);
                                    expect(AdManagerCtrl.model).toBe(scopedPromise);
                                });
                            });
                        });
                    });

                    describe('this.limit', function() {
                        beforeEach(function() {
                            cState.cParent.getMiniReelList.calls.reset();

                            $scope.$apply(function() {
                                AdManagerCtrl.limit = 100;
                            });
                        });

                        it('should get a new model', function() {
                            expect(cState.cParent.getMiniReelList).toHaveBeenCalledWith(AdManagerCtrl.filter, 100, 1, model);
                            expect(cState.cParent.getMiniReelList.calls.count()).toBe(1);
                            expect(AdManagerCtrl.model).toBe(scopedPromise);
                        });

                        it('should still make a request if the page is already 1', function() {
                            cState.cParent.getMiniReelList.calls.reset();
                            $scope.$apply(function() {
                                AdManagerCtrl.limit = 20;
                            });

                            expect(cState.cParent.getMiniReelList).toHaveBeenCalledWith(AdManagerCtrl.filter, 20, 1, jasmine.any(Object));
                        });

                        it('should set the ManagerCtrl.page back to 1', function() {
                            expect(AdManagerCtrl.page).toBe(1);
                        });
                    });

                    describe('this.page', function() {
                        var page;

                        beforeEach(function() {
                            $scope.$apply(function() {
                                page = ++AdManagerCtrl.page;
                            });
                        });

                        it('should get a new model', function() {
                            expect(cState.cParent.getMiniReelList).toHaveBeenCalledWith(AdManagerCtrl.filter, AdManagerCtrl.limit, page, model);
                            expect(AdManagerCtrl.model).toBe(scopedPromise);
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('canEditDefaults', function() {
                    describe('if the user can\'t edit org ad settings', function() {
                        it('should be false', function() {
                            expect(AdManagerCtrl.canEditDefaults).toBe(false);
                        });
                    });

                    describe('if the user can edit org ad settings', function() {
                        beforeEach(function() {
                            user.permissions.orgs.editAdConfig = 'org';
                            AdManagerCtrl = instantiate();
                        });

                        it('should be true', function() {
                            expect(AdManagerCtrl.canEditDefaults).toBe(true);
                        });
                    });
                });

                describe('canEditMiniReel', function() {
                    describe('if the user can\'t edit experience ad settings', function() {
                        it('should be false', function() {
                            expect(AdManagerCtrl.canEditMiniReel).toBe(false);
                        });
                    });

                    describe('if the user can edit experience ad settings', function() {
                        beforeEach(function() {
                            user.permissions.experiences.editAdConfig = 'org';
                            AdManagerCtrl = instantiate();
                        });

                        it('should be true', function() {
                            expect(AdManagerCtrl.canEditMiniReel).toBe(true);
                        });
                    });
                });

                describe('filter', function() {
                    it('should be initialized as the state\'s filter', function() {
                        expect(AdManagerCtrl.filter).toBe(cState.filter);
                    });
                });

                describe('limit', function() {
                    it('should be initialized as the state\'s limit', function() {
                        expect(AdManagerCtrl.limit).toBe(cState.limit);
                    });
                });

                describe('page', function() {
                    it('should be initialized as the state\'s page', function() {
                        expect(AdManagerCtrl.page).toBe(cState.page);
                    });
                });

                describe('limits', function() {
                    it('should be an array of the available limits', function() {
                        expect(AdManagerCtrl.limits).toEqual([20, 50, 100]);
                    });
                });

                describe('allAreSelected', function() {
                    describe('getting', function() {
                        describe('if all are selected', function() {
                            beforeEach(function() {
                                model.selected = model.value.map(function() {
                                    return true;
                                });
                            });

                            it('should be true', function() {
                                expect(AdManagerCtrl.allAreSelected).toBe(true);
                            });
                        });

                        describe('if all are not selected', function() {
                            beforeEach(function() {
                                model.selected = [true, true, true, false];
                            });

                            it('should be false', function() {
                                expect(AdManagerCtrl.allAreSelected).toBe(false);
                            });
                        });
                    });

                    describe('setting', function() {
                        describe('to true', function() {
                            beforeEach(function() {
                                model.selected = model.value.map(function() {
                                    return false;
                                });

                                AdManagerCtrl.allAreSelected = true;
                            });

                            it('should select everything', function() {
                                expect(model.selected).toEqual(model.value.map(function() {
                                    return true;
                                }));
                            });
                        });

                        describe('to false', function() {
                            beforeEach(function() {
                                model.selected = model.value.map(function() {
                                    return true;
                                });

                                AdManagerCtrl.allAreSelected = false;
                            });

                            it('should select everything', function() {
                                expect(model.selected).toEqual(model.value.map(function() {
                                    return false;
                                }));
                            });
                        });
                    });
                });

                describe('dropDowns', function() {
                    it('should have a drop down object for every drop down on the page', function() {
                        expect(AdManagerCtrl.dropDowns).toEqual({
                            select: {
                                shown: false
                            }
                        });
                    });

                    describe('DropDownModel() show() method', function() {
                        it('should set "shown" to true', function() {
                            forEach(AdManagerCtrl.dropDowns, function(dropDown) {
                                dropDown.show();

                                expect(dropDown.shown).toBe(true);
                            });
                        });
                    });

                    describe('DropDownModel() hide() method', function() {
                        it('should set "shown" to false', function() {
                            forEach(AdManagerCtrl.dropDowns, function(dropDown) {
                                dropDown.shown = true;

                                dropDown.hide();

                                expect(dropDown.shown).toBe(false);
                            });
                        });
                    });

                    describe('DropDownModel() toggle() method', function() {
                        it('should toggle the shown property', function() {
                            forEach(AdManagerCtrl.dropDowns, function(dropDown) {
                                dropDown.toggle();
                                expect(dropDown.shown).toBe(true);

                                dropDown.toggle();
                                expect(dropDown.shown).toBe(false);
                            });
                        });
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

                describe('modeNameFor(minireel)', function() {
                    it('should return the name of the mode for the given minireel', function() {
                        minireel.data.mode = 'full';

                        expect(AdManagerCtrl.modeNameFor(minireel)).toBe('Heavy Text');

                        minireel.data.mode = 'light';
                        expect(AdManagerCtrl.modeNameFor(minireel)).toBe('Light Text');

                        minireel.data.mode = 'lightbox';
                        expect(AdManagerCtrl.modeNameFor(minireel)).toBe('No Companion Ad');

                        minireel.data.mode = 'lightbox-ads';
                        expect(AdManagerCtrl.modeNameFor(minireel)).toBe('With Companion Ad');
                    });
                });

                describe('selectAll()', function() {
                    beforeEach(function() {
                        AdManagerCtrl.selectAll();
                    });

                    it('should make the selected array all true', function() {
                        expect(model.selected).toEqual(model.value.map(function() {
                            return true;
                        }));
                    });
                });

                describe('selectNone()', function() {
                    beforeEach(function() {
                        model.selected = model.value.map(function() {
                            return true;
                        });

                        AdManagerCtrl.selectNone();
                    });

                    it('should make the selected array all false', function() {
                        expect(model.selected).toEqual(model.value.map(function() {
                            return false;
                        }));
                    });
                });

                describe('selectAllWithStatus(status)', function() {
                    ['active', 'pending'].forEach(function(status) {
                        describe('when called with "' + status + '"', function() {
                            beforeEach(function() {
                                AdManagerCtrl.selectAllWithStatus(status);
                            });

                            it('should set the selected array to an array of true/falses that correspond to the minireel statuses', function() {
                                expect(model.selected).toEqual(model.value.map(function(minireel) {
                                    return minireel.status === status;
                                }));
                            });
                        });
                    });
                });

                describe('getSelected()', function() {
                    var result;

                    beforeEach(function() {
                        model.selected = [true, true, false, true];
                        model.value = [
                            {
                                status: 'active'
                            },
                            {
                                status: 'pending'
                            },
                            {
                                status: 'active'
                            },
                            {
                                status: 'pending'
                            }
                        ];

                        result = AdManagerCtrl.getSelected();
                    });

                    it('should return an array of only the selected MiniReels', function() {
                        var minireels = model.value;

                        expect(result).toEqual([minireels[0], minireels[1], minireels[3]]);
                    });

                    describe('if a status is provided', function() {
                        beforeEach(function() {
                            model.selected = [true, false, false, true];
                        });

                        it('should only return selected MiniReels of that status', function() {
                            expect(AdManagerCtrl.getSelected('active')).toEqual([model.value[0]]);

                            expect(AdManagerCtrl.getSelected('pending')).toEqual([model.value[3]]);
                        });
                    });
                });

                describe('areAllSelected(status)', function() {
                    describe('if no status is provided', function() {
                        it('should return a bool indicating if all minireels are selected', function() {
                            model.selected = [true, true, false, true];
                            expect(AdManagerCtrl.areAllSelected()).toBe(false);

                            model.selected = model.value.map(function() {
                                return true;
                            });
                            expect(AdManagerCtrl.areAllSelected()).toBe(true);
                        });
                    });

                    describe('if a status is provided', function() {
                        beforeEach(function() {
                            model.value = [
                                {
                                    status: 'active'
                                },
                                {
                                    status: 'pending'
                                },
                                {
                                    status: 'active'
                                },
                                {
                                    status: 'pending'
                                }
                            ];
                        });

                        it('should return a bool indicating if all minireels of that type are selected', function() {
                            model.selected = [true, true, false, true];
                            expect(AdManagerCtrl.areAllSelected('active')).toBe(false);

                            model.selected = [true, false, true, true];
                            expect(AdManagerCtrl.areAllSelected('active')).toBe(true);
                        });
                    });
                });

                describe('previewUrlOf(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            id: 'e-f0124e276d1474',
                            access: 'public',
                            data: {
                                title: 'My MiniReel',
                                splash: {
                                    theme: 'img-text-overlay',
                                    ratio: '16-9'
                                },
                                branding: 'urbantimes'
                            }
                        };
                    });

                    it('should be a full preview URL', function() {
                        expect(AdManagerCtrl.previewUrlOf(minireel)).toBe(MiniReelService.previewUrlOf(minireel, '/#/preview/minireel'));
                    });
                });

                describe('settingsTypeOf(minireel)', function() {
                    it('should be Default if there is no adConfig or static ad cards', function() {
                        expect(AdManagerCtrl.settingsTypeOf(minireel)).toBe('Default');
                    });

                    it('should be Custom if there is an adConfig with ads, or static ad cards', function() {
                        minireel.data.adConfig = {
                            video: {
                                firstPlacement: 3,
                                frequency: 3,
                                skip: 6,
                                waterfall: 'cinema6'
                            },
                            display: {
                                waterfall: 'cinema6'
                            }
                        };
                        expect(AdManagerCtrl.settingsTypeOf(minireel)).toBe('Custom');

                        delete minireel.data.adConfig;

                        expect(AdManagerCtrl.settingsTypeOf(minireel)).toBe('Default');

                        minireel.data.deck.push({ad:true});

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

                    it('should be No Ads if firstplacement is -1 and frequency is 0', function() {
                        minireel.data.adConfig = {
                            video: {
                                frequency: 0,
                                firstPlacement: -1,
                                waterfall: 'cinema6',
                                skip: 6
                            },
                            display: {
                                waterfall: 'cinema6'
                            }
                        };
                        expect(AdManagerCtrl.settingsTypeOf(minireel)).toBe('No Ads');
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

                describe('editOrgSettings()', function() {
                    it('should go to Settings state and pass default settings to be edited', function() {
                        spyOn(c6State, 'goTo');

                        AdManagerCtrl.editOrgSettings();

                        expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                            type: 'org',
                            settings: {
                                video: {
                                    frequency: 0,
                                    firstPlacement: 2,
                                    waterfall: 'cinema6',
                                    skip: 6
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            },
                            data: {
                                id: 'org1'
                            }
                        }]);
                    });

                    it('should go to Settings state and pass the Org settings if defined', function() {
                        spyOn(c6State, 'goTo');

                        PortalCtrl.model.org.adConfig = {
                            video: {
                                frequency: 3,
                                firstPlacement: 1,
                                waterfall: 'publisher',
                                skip: false
                            },
                            display: {
                                waterfall: 'cinema6'
                            }
                        };

                        AdManagerCtrl.editOrgSettings();

                        expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                            type: 'org',
                            settings: {
                                video: {
                                    frequency: 3,
                                    firstPlacement: 1,
                                    waterfall: 'publisher',
                                    skip: false
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            },
                            data: {
                                id: 'org1',
                                adConfig: {
                                    video: {
                                        frequency: 3,
                                        firstPlacement: 1,
                                        waterfall: 'publisher',
                                        skip: false
                                    },
                                    display: {
                                        waterfall: 'cinema6'
                                    }
                                }
                            }
                        }]);
                    });
                });

                describe('editSettings(minireels)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');
                    });

                    describe('when editing a single minireel', function() {
                        it('should pass the settings to be edited', function() {
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

                            AdManagerCtrl.editSettings([minireel]);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                type: 'minireels',
                                settings: {
                                    video: {
                                        frequency: 2,
                                        firstPlacement: 1,
                                        waterfall: 'publisher',
                                        skip: 6
                                    },
                                    display: {
                                        waterfall: 'cinema6'
                                    }
                                },
                                data: [minireel]
                            }]);
                        });
                    });

                    describe('when editing multiple minireels', function() {
                        it('should find matching settings and pass them to the Settings state', function() {
                            // round 1: same stetings
                            var minireels = [
                                {
                                    id: 'e-1',
                                    data: {
                                        adConfig: {
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
                                    }
                                },
                                {
                                    id: 'e-2',
                                    data: {
                                        adConfig: {
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
                                    }
                                }
                            ];

                            AdManagerCtrl.editSettings(minireels);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                type: 'minireels',
                                settings: {
                                    video: {
                                        frequency: 3,
                                        firstPlacement: 2,
                                        waterfall: 'publisher',
                                        skip: 6
                                    },
                                    display: {
                                        waterfall: 'cinema6'
                                    }
                                },
                                data: minireels
                            }]);

                            // round 2: different settings
                            minireels = [
                                {
                                    id: 'e-1',
                                    data: {
                                        adConfig: {
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
                                    }
                                },
                                {
                                    id: 'e-2',
                                    data: {
                                        adConfig: {
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
                                    }
                                }
                            ];

                            AdManagerCtrl.editSettings(minireels);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                type: 'minireels',
                                settings: {
                                    video: {
                                        frequency: undefined,
                                        firstPlacement: undefined,
                                        waterfall: undefined,
                                        skip: undefined
                                    },
                                    display: {
                                        waterfall: undefined
                                    }
                                },
                                data: minireels
                            }]);

                            // round 3: some shared settings
                            minireels = [
                                {
                                    id: 'e-1',
                                    data: {
                                        adConfig: {
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
                                    }
                                },
                                {
                                    id: 'e-2',
                                    data: {
                                        adConfig: {
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
                                    }
                                }
                            ];

                            AdManagerCtrl.editSettings(minireels);

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:AdManager.Settings', [{
                                type: 'minireels',
                                settings: {
                                    video: {
                                        frequency: 2,
                                        firstPlacement: undefined,
                                        waterfall: 'cinema6',
                                        skip: 6
                                    },
                                    display: {
                                        waterfall: undefined
                                    }
                                },
                                data: minireels
                            }]);
                        });
                    });
                });

                describe('useDefaultSettings()', function() {
                    it('should go through all selected minireels and delete static ad cards and adConfig blocks', function() {
                        var onAffirm, onCancel,
                            minireels = [
                                {
                                    id: 'e-1',
                                    data: {
                                        adConfig: {},
                                        deck: [
                                            {
                                                ad: true
                                            }
                                        ]
                                    },
                                    save: jasmine.createSpy('minireel.save()')
                                },
                                {
                                    id: 'e-2',
                                    data: {
                                        adConfig: {},
                                        deck: [
                                            {
                                                ad: true
                                            },
                                            {
                                                ad: true
                                            }
                                        ]
                                    },
                                    save: jasmine.createSpy('minireel.save()')
                                },
                                {
                                    id: 'e-3',
                                    data: {
                                        adConfig: {},
                                        deck: []
                                    },
                                    save: jasmine.createSpy('minireel.save()')
                                }
                            ];


                        spyOn(ConfirmDialogService, 'display');
                        AdManagerCtrl.useDefaultSettings(minireels);

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;

                        expect(ConfirmDialogService.display).toHaveBeenCalled();

                        onAffirm();

                        minireels.forEach(function(minireel) {
                            expect(minireel.data.adConfig).toBe(null);
                            expect(minireel.data.deck.length).toBe(0);
                            expect(minireel.save).toHaveBeenCalled();
                        });
                    });
                });

                describe('removeAds()', function() {
                    it('should display a ConfirmDialogService', function() {
                        var onAffirm, onCancel,
                            minireels = [
                            {
                                id: 'e-1',
                                data: {
                                    adConfig: {
                                        video: {
                                            frequency: 2,
                                            firstPlacement: 2,
                                            waterfall: 'cinema6',
                                            skip: 6
                                        },
                                        display: {
                                            waterfall: 'publisher'
                                        }
                                    },
                                    deck: [
                                        {
                                            ad: true
                                        }
                                    ]
                                },
                                save: jasmine.createSpy('minireel.save()')
                            },
                            {
                                id: 'e-2',
                                data: {
                                    adConfig: {
                                        video: {
                                            frequency: 0,
                                            firstPlacement: 3,
                                            waterfall: 'publisher',
                                            skip: 6
                                        },
                                        display: {
                                            waterfall: 'publisher'
                                        }
                                    },
                                    deck: [
                                        {
                                            ad: true
                                        },
                                        {
                                            ad: true
                                        }
                                    ]
                                },
                                save: jasmine.createSpy('minireel.save()')
                            },
                            {
                                id: 'e-3',
                                data: {
                                    deck: []
                                },
                                save: jasmine.createSpy('minireel.save()')
                            }
                        ];

                        spyOn(ConfirmDialogService, 'display');
                        AdManagerCtrl.removeAds(minireels);

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;

                        expect(ConfirmDialogService.display).toHaveBeenCalled();

                        onAffirm();

                        minireels.forEach(function(minireel) {
                            expect(minireel.data.adConfig.video.firstPlacement).toBe(-1);
                            expect(minireel.data.adConfig.video.frequency).toBe(0);
                            expect(minireel.data.deck.length).toBe(0);
                            expect(minireel.save).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
