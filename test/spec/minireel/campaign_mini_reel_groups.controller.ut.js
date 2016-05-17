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

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $scope = null;
            CampaignMiniReelGroupsCtrl = null;
            groups = null;
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

            describe('add(group)', function() {
                var group;

                beforeEach(function() {
                    groups.push.apply(groups,
                        ['Group 1', 'Group 2', 'Group 3'].map(function(label) {
                            return {
                                label: label
                            };
                        })
                    );

                    group = {
                        label: 'Group 4'
                    };

                    CampaignMiniReelGroupsCtrl.add(group);
                });

                it('should add the group to the model', function() {
                    expect(groups.length).toBe(4);
                    expect(groups[3]).toBe(group);
                });

                describe('if called with a group that is already added', function() {
                    beforeEach(function() {
                        group = groups[2];

                        CampaignMiniReelGroupsCtrl.add(group);
                    });

                    it('should not add the group again', function() {
                        expect(groups.length).toBe(4);
                        expect(groups.indexOf(group)).toBe(groups.lastIndexOf(group));
                    });
                });
            });
        });
    });
});
