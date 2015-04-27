define(['app', 'minireel/mixins/WizardController'], function(appModule, WizardController) {
    'use strict';

    describe('CampaignMiniReelController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            CampaignMiniReelState,
            MiniReelService,
            $scope,
            CampaignCtrl,
            CampaignMiniReelsCtrl,
            CampaignMiniReelCtrl;

        var minireel,
            campaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');

                CampaignMiniReelState = c6State.get('MR:New:Campaign.MiniReel');
                minireel = CampaignMiniReelState.minireel = cinema6.db.create('experience', {
                    data: {
                        collateral: {
                            splash: null
                        },
                        links: {},
                        params: {},
                        branding: null,
                        deck: []
                    }
                });
                CampaignMiniReelState.cModel = minireel.pojoify();
                CampaignMiniReelState.metaData = {};

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignCtrl = $scope.CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign = cinema6.db.create('campaign', {
                        id: 'cam-68e5c18c986d47',
                        links: {},
                        logos: {
                            square: null
                        },
                        miniReels: [],
                        cards: [],
                        brand: 'Diageo'
                    }));

                    CampaignMiniReelsCtrl = $scope.CampaignMiniReelsCtrl = $controller('CampaignMiniReelsController', {
                        $scope: $scope
                    });

                    CampaignMiniReelCtrl = $scope.CampaignMiniReelCtrl = $controller('CampaignMiniReelController', {
                        $scope: $scope,
                        cState: CampaignMiniReelState
                    });
                    CampaignMiniReelCtrl.initWithModel(CampaignMiniReelState.cModel);
                });
            });
        });

        it('should exist', function() {
            expect(CampaignMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            expect(Object.keys(CampaignMiniReelCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        }));

        describe('properties', function() {
            describe('model', function() {
                it('should be the state\'s model', function() {
                    expect(CampaignMiniReelCtrl.model).toBe(CampaignMiniReelState.cModel);
                });

                it('should only use Campaign brand if not set on minireel', function() {
                    expect(CampaignMiniReelCtrl.model.data.params.sponsor).toBe(CampaignCtrl.model.brand);

                    CampaignMiniReelState.cModel.data.params.sponsor = 'Custom';
                    CampaignMiniReelCtrl.initWithModel(CampaignMiniReelState.cModel);

                    expect(CampaignMiniReelCtrl.model.data.params.sponsor).toBe('Custom')
                });
            });

            describe('tabs', function() {
                it('should be an array of tabs to display in the sidebar', function() {
                    expect(CampaignMiniReelCtrl.tabs).toEqual([
                        {
                            name: 'General',
                            sref: 'MR:Campaign.MiniReel.General'
                        },
                        {
                            name: 'MiniReel Type',
                            sref: 'MR:Campaign.MiniReel.Type'
                        },
                        {
                            name: 'Playback Settings',
                            sref: 'MR:Campaign.MiniReel.Playback'
                        }
                    ]);
                });
            });


            describe('validDate', function() {
                it('should be true if endDate is null', function() {
                    CampaignMiniReelCtrl.campaignData.endDate = null;
                    expect(CampaignMiniReelCtrl.validDate).toBe(true);
                });

                it('should false if endDate is undefined', function() {
                    CampaignMiniReelCtrl.campaignData.endDate = void 0;
                    expect(CampaignMiniReelCtrl.validDate).toBeFalsy();
                });

                it('should be true if the endDate is in the future', function() {
                    var now = new Date(),
                        tomorrow = new Date(now.getTime() + 24 * 60 *60 * 1000);

                    CampaignMiniReelCtrl.campaignData.endDate = tomorrow;
                    expect(CampaignMiniReelCtrl.validDate).toBe(true);
                });

                it('should be false if the endDate is in the past', function() {
                    var now = new Date(),
                        yesterday = new Date(now.getTime() - 24 * 60 *60 * 1000);

                    CampaignMiniReelCtrl.campaignData.endDate = yesterday;
                    expect(CampaignMiniReelCtrl.validDate).toBeFalsy();
                });
            });
        });

        describe('methods', function() {
            describe('confirm()', function() {
                var publishDeferred,
                    success, failure;

                beforeEach(function() {
                    publishDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(MiniReelService, 'publish').and.returnValue(publishDeferred.promise);

                    $scope.$apply(function() {
                        CampaignMiniReelCtrl.confirm().then(success, failure);
                    });
                });

                it('should publish the minireel', function() {
                    expect(MiniReelService.publish).toHaveBeenCalledWith(minireel);
                });

                describe('when the minireel has been published', function() {
                    var saveDeferred;

                    beforeEach(function() {
                        saveDeferred = $q.defer();
                        spyOn(CampaignCtrl, 'save').and.returnValue(saveDeferred.promise);
                        spyOn(CampaignMiniReelsCtrl, 'add').and.callThrough();

                        CampaignMiniReelCtrl.campaignData.endDate = new Date();
                        CampaignMiniReelCtrl.campaignData.name = 'My Campaign';

                        $scope.$apply(function() {
                            minireel.id = 'e-c8feedca3a1567';
                            publishDeferred.resolve(minireel);
                        });
                    });

                    it('should add the minireel to the campaign', function() {
                        expect(CampaignMiniReelsCtrl.add).toHaveBeenCalledWith(minireel, {
                            endDate: CampaignMiniReelCtrl.campaignData.endDate,
                            name: CampaignMiniReelCtrl.campaignData.name
                        });
                    });

                    it('should save the campaign', function() {
                        expect(CampaignCtrl.save).toHaveBeenCalled();
                    });

                    describe('after the campaign has been saved', function() {
                        beforeEach(function() {
                            spyOn(c6State, 'goTo').and.callFake(function(stateName) {
                                return $q.when(c6State.get(stateName));
                            });
                        });

                        describe('and the minireel is New', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    saveDeferred.resolve(campaign);
                                });
                            });

                            it('should go to the editor with that minireel loaded', function() {
                                expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', [minireel], {
                                    campaign: campaign.id
                                });
                            });

                            it('should resolve to the minireel', function() {
                                expect(success).toHaveBeenCalledWith(minireel);
                            });
                        });

                        describe('and the minireel settings are being Edited', function() {
                            beforeEach(function() {
                                CampaignMiniReelState.cName = 'MR:Edit:Campaign.MiniReel';

                                $scope.$apply(function() {
                                    saveDeferred.resolve(campaign);
                                });
                            });

                            it('should go back to the list of Sponsored MiniReels', function() {
                                expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.MiniReels');
                            });

                            it('should resolve to the minireel', function() {
                                expect(success).toHaveBeenCalledWith(minireel);
                            });
                        });
                    });
                });
            });
        });
    });
});
