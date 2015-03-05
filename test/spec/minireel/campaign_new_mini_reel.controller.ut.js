define(['app', 'minireel/mixins/WizardController'], function(appModule, WizardController) {
    'use strict';

    describe('CampaignNewMiniReelController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            MiniReelService,
            $scope,
            CampaignCtrl,
            CampaignMiniReelsCtrl,
            CampaignNewMiniReelCtrl;


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
                        cards: []
                    }));

                    CampaignMiniReelsCtrl = $scope.CampaignMiniReelsCtrl = $controller('CampaignMiniReelsController', {
                        $scope: $scope
                    });

                    CampaignNewMiniReelCtrl = $scope.CampaignNewMiniReelCtrl = $controller('CampaignNewMiniReelController', {
                        $scope: $scope
                    });
                    minireel = CampaignNewMiniReelCtrl.model = cinema6.db.create('experience', {
                        data: {
                            collateral: {
                                splash: null
                            },
                            links: {},
                            params: {},
                            deck: []
                        }
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CampaignNewMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            expect(Object.keys(CampaignNewMiniReelCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        }));

        describe('properties', function() {
            describe('tabs', function() {
                it('should be an array of tabs to display in the sidebar', function() {
                    expect(CampaignNewMiniReelCtrl.tabs).toEqual([
                        {
                            name: 'General',
                            sref: 'MR:Campaign.NewMiniReel.General'
                        },
                        {
                            name: 'MiniReel Type',
                            sref: 'MR:Campaign.NewMiniReel.Type'
                        },
                        {
                            name: 'Playback Settings',
                            sref: 'MR:Campaign.NewMiniReel.Playback'
                        }
                    ]);
                });
            });

            describe('endDate', function() {
                it('should be null', function() {
                    expect(CampaignNewMiniReelCtrl.endDate).toBeNull();
                });
            });

            describe('name', function() {
                it('should be null', function() {
                    expect(CampaignNewMiniReelCtrl.name).toBeNull();
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
                        CampaignNewMiniReelCtrl.confirm().then(success, failure);
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

                        CampaignNewMiniReelCtrl.endDate = new Date();
                        CampaignNewMiniReelCtrl.name = 'My Campaign';

                        $scope.$apply(function() {
                            minireel.id = 'e-c8feedca3a1567';
                            publishDeferred.resolve(minireel);
                        });
                    });

                    it('should add the minireel to the campaign', function() {
                        expect(CampaignMiniReelsCtrl.add).toHaveBeenCalledWith(minireel, {
                            endDate: CampaignNewMiniReelCtrl.endDate,
                            name: CampaignNewMiniReelCtrl.name
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
                });
            });
        });
    });
});
