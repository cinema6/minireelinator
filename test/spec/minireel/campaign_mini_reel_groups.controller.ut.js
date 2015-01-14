define(['app'], function(appModule) {
    'use strict';

    describe('CampaignMiniReelGroupsController', function() {
        var $rootScope,
            $controller,
            $scope,
            CampaignMiniReelGroupsCtrl;

        var groups;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignMiniReelGroupsCtrl = $scope.CampaignMiniReelGroupsCtrl = $controller('CampaignMiniReelGroupsController', {
                        $scope: $scope
                    });
                    groups = CampaignMiniReelGroupsCtrl.model = [];
                });
            });
        });

        it('should exist', function() {
            expect(CampaignMiniReelGroupsCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('remove(group)', function() {
                var removed;

                beforeEach(function() {
                    groups.push(
                        {
                            label: 'Group 1'
                        },
                        {
                            label: 'Group 2'
                        },
                        {
                            label: 'Group 3'
                        }
                    );

                    CampaignMiniReelGroupsCtrl.remove(removed = groups[1]);
                });

                it('should remove the group', function() {
                    expect(groups.length).toBe(2);
                    expect(groups).not.toContain(removed);
                });
            });
        });
    });
});
