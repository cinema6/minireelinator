define(['app', 'minireel/mixins/WizardController'], function(appModule, WizardController) {
    'use strict';

    describe('MiniReelGroupController', function() {
        var $rootScope,
            $controller,
            c6State,
            $scope,
            MiniReelGroupState,
            CampaignMiniReelGroupsCtrl,
            MiniReelGroupCtrl;

        var group;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                MiniReelGroupState = c6State.get('MR:New:MiniReelGroup');
                group = MiniReelGroupState.group = {
                    label: 'THE Group',
                    miniReels: [],
                    cards: []
                };
                MiniReelGroupState.cModel = MiniReelGroupState.model();

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignMiniReelGroupsCtrl = $scope.CampaignMiniReelGroupsCtrl = $controller('CampaignMiniReelGroupsController', {
                        $scope: $scope
                    });
                    CampaignMiniReelGroupsCtrl.model = [];

                    MiniReelGroupCtrl = $scope.MiniReelGroupCtrl = $controller('MiniReelGroupController', {
                        $scope: $scope,
                        cState: MiniReelGroupState
                    });
                    MiniReelGroupCtrl.model = MiniReelGroupState.cModel;
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            c6State = null;
            $scope = null;
            MiniReelGroupState = null;
            CampaignMiniReelGroupsCtrl = null;
            MiniReelGroupCtrl = null;
            group = null;
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
                    spyOn(MiniReelGroupState, 'updateGroup').and.callThrough();
                    spyOn(CampaignMiniReelGroupsCtrl, 'add').and.callThrough();
                    spyOn(c6State, 'goTo');

                    MiniReelGroupCtrl.model.label = 'Different Label';

                    $scope.$apply(function() {
                        MiniReelGroupCtrl.save();
                    });
                });

                it('should update the group', function() {
                    expect(MiniReelGroupState.updateGroup).toHaveBeenCalled();
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
