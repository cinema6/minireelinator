define(['app', 'minireel/mixins/WizardController'], function(appModule, WizardController) {
    'use strict';

    describe('CreativesNewMiniReelController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            MiniReelService,
            $scope,
            CampaignCtrl,
            CampaignCreativesCtrl,
            CreativesNewMiniReelCtrl;


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

                    CampaignCreativesCtrl = $scope.CampaignCreativesCtrl = $controller('CampaignCreativesController', {
                        $scope: $scope
                    });

                    CreativesNewMiniReelCtrl = $scope.CreativesNewMiniReelCtrl = $controller('CreativesNewMiniReelController', {
                        $scope: $scope
                    });
                    minireel = CreativesNewMiniReelCtrl.model = cinema6.db.create('experience', {
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
            expect(CreativesNewMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            expect(Object.keys(CreativesNewMiniReelCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        }));

        describe('properties', function() {
            describe('tabs', function() {
                it('should be an array of tabs to display in the sidebar', function() {
                    expect(CreativesNewMiniReelCtrl.tabs).toEqual([
                        {
                            name: 'General',
                            sref: 'MR:Creatives.NewMiniReel.General'
                        },
                        {
                            name: 'MiniReel Type',
                            sref: 'MR:Creatives.NewMiniReel.Type'
                        },
                        {
                            name: 'Playback Settings',
                            sref: 'MR:Creatives.NewMiniReel.Playback'
                        }
                    ]);
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
                        CreativesNewMiniReelCtrl.confirm().then(success, failure);
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
                        spyOn(CampaignCreativesCtrl, 'add').and.callThrough();

                        $scope.$apply(function() {
                            minireel.id = 'e-c8feedca3a1567';
                            publishDeferred.resolve(minireel);
                        });
                    });

                    it('should add the minireel to the campaign', function() {
                        expect(CampaignCreativesCtrl.add).toHaveBeenCalledWith(minireel);
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
