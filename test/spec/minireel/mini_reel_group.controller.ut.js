define(['minireel/campaign', 'minireel/mixins/WizardController'], function(campaignModule, WizardController) {
    'use strict';

    describe('MiniReelGroupController', function() {
        var $rootScope,
            $controller,
            c6State,
            $scope,
            CampaignMiniReelGroupsCtrl,
            MiniReelGroupCtrl;

        var group;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignMiniReelGroupsCtrl = $scope.CampaignMiniReelGroupsCtrl = $controller('CampaignMiniReelGroupsController', {
                        $scope: $scope
                    });
                    CampaignMiniReelGroupsCtrl.model = [];

                    MiniReelGroupCtrl = $scope.MiniReelGroupCtrl = $controller('MiniReelGroupController', {
                        $scope: $scope
                    });
                    group = MiniReelGroupCtrl.model = {
                        label: 'THE Group',
                        miniReels: [],
                        cards: []
                    };
                });
            });
        });

        it('should exist', function() {
            expect(MiniReelGroupCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            expect(Object.keys(MiniReelGroupCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        }));

        describe('properties', function() {
            describe('tabs', function() {
                it('should be an array of tabs', function() {
                    expect(MiniReelGroupCtrl.tabs).toEqual([
                        {
                            name: 'General',
                            sref: 'MR:MiniReelGroup.General'
                        },
                        {
                            name: 'Cards',
                            sref: 'MR:MiniReelGroup.Cards'
                        },
                        {
                            name: 'MiniReels',
                            sref: 'MR:MiniReelGroup.MiniReels'
                        }
                    ]);
                });
            });
        });

        describe('methods', function() {
            describe('save()', function() {
                beforeEach(function() {
                    spyOn(CampaignMiniReelGroupsCtrl, 'add').and.callThrough();
                    spyOn(c6State, 'goTo');

                    $scope.$apply(function() {
                        MiniReelGroupCtrl.save();
                    });
                });

                it('should add the group to the campaign', function() {
                    expect(CampaignMiniReelGroupsCtrl.add).toHaveBeenCalledWith(group);
                });

                it('should go to the "MR:Campaign.MiniReelGroups" state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.MiniReelGroups');
                });
            });
        });
    });
});
