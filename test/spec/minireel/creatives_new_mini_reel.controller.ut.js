define(['minireel/campaign', 'minireel/mixins/WizardController'], function(campaignModule, WizardController) {
    'use strict';

    describe('CreativesNewMiniReelController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            $scope,
            CampaignCtrl,
            CampaignCreativesCtrl,
            CreativesNewMiniReelCtrl;


        var minireel,
            campaign;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');

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
                var saveDeferred,
                    success, failure;

                beforeEach(function() {
                    saveDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(minireel, 'save').and.returnValue(saveDeferred.promise);

                    $scope.$apply(function() {
                        CreativesNewMiniReelCtrl.confirm().then(success, failure);
                    });
                });

                it('should save the minireel', function() {
                    expect(minireel.save).toHaveBeenCalledWith();
                });

                describe('when the minireel has been saved', function() {
                    beforeEach(function() {
                        spyOn(CampaignCreativesCtrl, 'add').and.callThrough();
                        spyOn(c6State, 'goTo').and.callFake(function(stateName) {
                            return $q.when(c6State.get(stateName));
                        });

                        $scope.$apply(function() {
                            minireel.id = 'e-c8feedca3a1567';
                            saveDeferred.resolve(minireel);
                        });
                    });

                    it('should add the minireel to the campaign', function() {
                        expect(CampaignCreativesCtrl.add).toHaveBeenCalledWith(minireel);
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
