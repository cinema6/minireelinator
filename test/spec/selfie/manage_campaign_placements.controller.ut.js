define(['app'], function(appModule) {
    'use strict';

    describe('SelfieManageCampaignPlacementsController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            cinema6,
            c6State,
            PlacementService,
            ConfirmDialogService,
            SelfieManageCampaignPlacementsCtrl;

        var placements,
            containers,
            campaign;

        var debouncedFns;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieManageCampaignPlacementsCtrl = $controller('SelfieManageCampaignPlacementsController', {
                    $scope: $scope
                });
            });
        }

        beforeEach(function() {
            debouncedFns = [];

            module(appModule.name, ['$provide', function($provide) {
                $provide.decorator('c6AsyncQueue', function($delegate) {
                    return jasmine.createSpy('c6AsyncQueue()').and.callFake(function() {
                        var queue = $delegate.apply(this, arguments);
                        var debounce = queue.debounce;
                        spyOn(queue, 'debounce').and.callFake(function() {
                            var fn = debounce.apply(queue, arguments);
                            debouncedFns.push(fn);
                            return fn;
                        });
                        return queue;
                    });
                });
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
                PlacementService = $injector.get('PlacementService');
            });

            campaign = {
                id: 'cam-123'
            };
            placements = [];
            containers = [
                {
                    id: 'con-111',
                    name: 'beeswax',
                    label: 'Beeswax',
                    defaultTagParams: {
                        mraid: {
                            apiRoot: 'http://platform.reelcontent.com/',
                            network: '${network}',
                            clickUrls: ['${click_url}'],
                            prebuffer: true,
                            forceOrientation: 'portrait'
                        },
                        vpaid: {
                            apiRoot: 'http://platform.reelcontent.com/',
                            uuid: '${user_id}',
                            playUrls: ['${play_url}','${PLAY}']
                        }
                    }
                },
                {
                    id: 'con-111',
                    name: 'pocketmath',
                    label: 'Pocketmath',
                    defaultTagParams: {
                        mraid: {
                            apiRoot: 'http://platform.reelcontent.com/',
                            uuid: '{{user}}',
                            playUrls: ['{{playurl}}','${PLAY}'],
                            prebuffer: false,
                            forceOrientation: 'landscape'
                        }
                    }
                }
            ];

            spyOn(PlacementService, 'generateParamsModel').and.returnValue({});
            spyOn(PlacementService, 'convertForSave').and.returnValue({});
            spyOn(ConfirmDialogService, 'display');
            spyOn(ConfirmDialogService, 'close');
            spyOn(c6State, 'goTo');

            compileCtrl();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            $q = null;
            cinema6 = null;
            c6State = null;
            PlacementService = null;
            ConfirmDialogService = null;
            SelfieManageCampaignPlacementsCtrl = null;
            placements = null;
            containers = null;
            campaign = null;
            debouncedFns = null;
        });

        it('should exist', function() {
            expect(SelfieManageCampaignPlacementsCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel(model)', function() {
                describe('when there are no existing placements', function() {
                    var newPlacement;

                    beforeEach(function() {
                        newPlacement = cinema6.db.create('placement', {
                            label: null,
                            tagType: null,
                            budget: {},
                            externalCost: {
                                event: 'view'
                            },
                            tagParams: {},
                            showInTag: {}
                        });

                        placements.push(newPlacement);

                        SelfieManageCampaignPlacementsCtrl.initWithModel({
                            campaign: campaign,
                            containers: containers,
                            placements: placements
                        });
                    });

                    it('should set ui array', function() {
                        expect(SelfieManageCampaignPlacementsCtrl.ui).toEqual(['type','autoplay','branding','countdown']);
                    });

                    it('should set campaign', function() {
                        expect(SelfieManageCampaignPlacementsCtrl.campaign).toBe(campaign);
                    });

                    it('should set containers', function() {
                        expect(SelfieManageCampaignPlacementsCtrl.containers).toBe(containers);
                    });

                    it('should generate a placement model for the UI', function() {
                        expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                            newPlacement.tagParams,
                            SelfieManageCampaignPlacementsCtrl.ui
                        );
                        expect(SelfieManageCampaignPlacementsCtrl.placements.length).toBe(1);
                        expect(SelfieManageCampaignPlacementsCtrl.placements[0]).toEqual({
                            tagTypes: [],
                            tagParams: {},
                            container: undefined,
                            model: newPlacement
                        });
                    });
                });

                describe('when there are existing placements', function() {
                    beforeEach(function() {
                        placements.push({
                            label: 'Placement 1',
                            tagType: 'vpaid',
                            budget: {},
                            externalCost: {},
                            tagParams: {
                                container: 'beeswax',
                                campaign: 'cam-123'
                            },
                            showInTag: {}
                        });

                        placements.push({
                            label: 'Placement 2',
                            tagType: 'mraid',
                            budget: {},
                            externalCost: {},
                            tagParams: {
                                container: 'pocketmath',
                                campaign: 'cam-123'
                            },
                            showInTag: {}
                        });

                        SelfieManageCampaignPlacementsCtrl.initWithModel({
                            campaign: campaign,
                            containers: containers,
                            placements: placements
                        });
                    });

                    it('should set ui array', function() {
                        expect(SelfieManageCampaignPlacementsCtrl.ui).toEqual(['type','autoplay','branding','countdown']);
                    });

                    it('should set campaign', function() {
                        expect(SelfieManageCampaignPlacementsCtrl.campaign).toBe(campaign);
                    });

                    it('should set containers', function() {
                        expect(SelfieManageCampaignPlacementsCtrl.containers).toBe(containers);
                    });

                    it('should generate placement models for the UI', function() {
                        expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                            placements[0].tagParams,
                            SelfieManageCampaignPlacementsCtrl.ui
                        );
                        expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                            placements[1].tagParams,
                            SelfieManageCampaignPlacementsCtrl.ui
                        );

                        expect(SelfieManageCampaignPlacementsCtrl.placements.length).toBe(2);

                        expect(SelfieManageCampaignPlacementsCtrl.placements[0]).toEqual({
                            tagTypes: ['mraid','vpaid'],
                            tagParams: {},
                            container: containers[0],
                            model: placements[0]
                        });

                        expect(SelfieManageCampaignPlacementsCtrl.placements[1]).toEqual({
                            tagTypes: ['mraid'],
                            tagParams: {},
                            container: containers[1],
                            model: placements[1]
                        });
                    });
                });
            });

            describe('setContainer(placement, container)', function() {
                it('should remove the current tagType on the placement and add TagType options from container', function() {
                    var placement = {
                        tagParams: {},
                        tagTypes: ['mraid','vpaid'],
                        container: containers[0],
                        model: {
                            id: 'pl-111',
                            tagType: 'mraid'
                        }
                    };

                    SelfieManageCampaignPlacementsCtrl.setContainer(placement, containers[1]);

                    expect(placement.model.tagType).toBe(undefined);
                    expect(placement.tagTypes).toEqual(['mraid']);
                });
            });

            describe('setTagType(type, placement)', function() {
                it('should generate a params model based on the container defaults', function() {
                    var paramsModel = {
                        defaults: {},
                        addedParams: [],
                        availableParams: []
                    };

                    var placement = {
                        tagParams: {},
                        tagTypes: ['mraid','vpaid'],
                        container: containers[0],
                        model: {}
                    };

                    PlacementService.generateParamsModel.and.returnValue(paramsModel);

                    SelfieManageCampaignPlacementsCtrl.setTagType('mraid', placement);

                    expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                        containers[0].defaultTagParams.mraid,
                        SelfieManageCampaignPlacementsCtrl.ui
                    );

                    expect(placement.tagParams).toBe(paramsModel);
                });
            });

            describe('addNewPlacement()', function() {
                it('should create a new placement model and add it to the placement array', function() {
                    var newPlacement = cinema6.db.create('placement', {
                        tagParams: {}
                    });

                    spyOn(cinema6.db, 'create').and.returnValue(newPlacement);

                    SelfieManageCampaignPlacementsCtrl.placements = [];

                    SelfieManageCampaignPlacementsCtrl.addNewPlacement();

                    expect(cinema6.db.create).toHaveBeenCalledWith('placement', {
                        label: null,
                        tagType: null,
                        budget: {},
                        externalCost: {},
                        tagParams: {},
                        showInTag: {}
                    });

                    expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                        newPlacement.tagParams,
                        SelfieManageCampaignPlacementsCtrl.ui
                    );

                    expect(SelfieManageCampaignPlacementsCtrl.placements.length).toBe(1);
                    expect(SelfieManageCampaignPlacementsCtrl.placements[0]).toEqual({
                        tagTypes: [],
                        tagParams: {},
                        container: undefined,
                        model: newPlacement
                    });
                });
            });

            describe('save()', function() {
                var saveDeferred, placement;

                beforeEach(function() {
                    saveDeferred = $q.defer();

                    placement = {
                        tagParams: {
                            params: [],
                            defaults: {},
                            addedParams: [],
                            availableParams: []
                        },
                        container: containers[0],
                        model: cinema6.db.create('placement', {
                            tagParams: {},
                            externalCost: {}
                        })
                    };

                    spyOn(placement.model, 'save').and.returnValue(saveDeferred.promise);

                    SelfieManageCampaignPlacementsCtrl.campaign = campaign;

                    SelfieManageCampaignPlacementsCtrl.save(placement);
                });

                it('should be a debounced function', function() {
                    expect(debouncedFns).toContain(SelfieManageCampaignPlacementsCtrl.save);
                });

                it('should convert the params for saving', function() {
                    expect(PlacementService.convertForSave).toHaveBeenCalledWith(placement.tagParams.params)
                });

                it('should set the container and campaign params', function() {
                    expect(placement.model.tagParams.container).toEqual(containers[0].name);
                    expect(placement.model.tagParams.campaign).toEqual(campaign.id);
                });

                it('should set the externalCost event property', function() {
                    expect(placement.model.externalCost.event).toEqual('view');
                });

                it('should save the model', function() {
                    expect(placement.model.save).toHaveBeenCalled();
                });

                describe('when save fails', function() {
                    it('should show an error modal', function() {
                        $scope.$apply(function() {
                            saveDeferred.reject('BAD');
                        });

                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                        expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toContain('There was a problem');
                        expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:Manage:Campaign:Placements:Tag', [placement.model]);
                    });
                });
            });

            describe('delete(placement)', function() {
                var placement, eraseDeferred, onAffirm, onCancel, prompt;

                beforeEach(function() {
                    placement = {
                        model: cinema6.db.create('placement', {})
                    };

                    eraseDeferred = $q.defer();

                    spyOn(placement.model, 'erase').and.returnValue(eraseDeferred.promise);
                    spyOn(SelfieManageCampaignPlacementsCtrl, 'addNewPlacement');

                    SelfieManageCampaignPlacementsCtrl.delete(placement);

                    onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                    onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    prompt = ConfirmDialogService.display.calls.mostRecent().args[0].prompt;
                });

                it('should display a dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                    expect(prompt).toContain('Are you sure you want to delete');
                });

                describe('onAffirm', function() {
                    beforeEach(function() {
                        onAffirm();
                    });

                    it('should be a debounced function', function() {
                        expect(debouncedFns).toContain(onAffirm);
                    });

                    it('should close the dialog', function() {
                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });

                    it('should erase the placement', function() {
                        expect(placement.model.erase).toHaveBeenCalled();
                    });

                    describe('when it is the only placement', function() {
                        beforeEach(function() {
                            SelfieManageCampaignPlacementsCtrl.placements = [placement];
                        });

                        describe('when the placement is successfully deleted', function() {
                            it('should remove the placement from the placements array and add a new, blank placement', function() {
                                $scope.$apply(function() {
                                    eraseDeferred.resolve();
                                });

                                expect(SelfieManageCampaignPlacementsCtrl.placements).not.toContain(placement);
                                expect(SelfieManageCampaignPlacementsCtrl.addNewPlacement).toHaveBeenCalled();
                            });
                        });

                        describe('when the delete request fails', function() {
                            it('should show an error modal', function() {
                                $scope.$apply(function() {
                                    eraseDeferred.reject('Failed');
                                });

                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toContain('There was a problem');
                            });
                        });
                    });

                    describe('when it not the only placement', function() {
                        beforeEach(function() {
                            SelfieManageCampaignPlacementsCtrl.placements = [{}, placement, {}];
                        });

                        describe('when the placement is successfully deleted', function() {
                            it('should remove the placement from the placements array', function() {
                                $scope.$apply(function() {
                                    eraseDeferred.resolve();
                                });

                                expect(SelfieManageCampaignPlacementsCtrl.placements).not.toContain(placement);
                                expect(SelfieManageCampaignPlacementsCtrl.addNewPlacement).not.toHaveBeenCalled();
                            });
                        });

                        describe('when the delete request fails', function() {
                            it('should show an error modal', function() {
                                $scope.$apply(function() {
                                    eraseDeferred.reject('Failed');
                                });

                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toContain('There was a problem');
                            });
                        });
                    });
                });

                describe('onCancel', function() {
                    it('should close the dialog', function() {
                        onCancel();

                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
