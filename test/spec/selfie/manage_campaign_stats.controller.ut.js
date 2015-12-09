define(['app'], function(appModule) {
    'use strict';

    describe('SelfieManageCampaignStatsController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieManageCampaignStatsCtrl;

        function compileCtrl(SelfieManageCampaignCtrl) {
            $scope = $rootScope.$new();
            $scope.SelfieManageCampaignCtrl = SelfieManageCampaignCtrl;
            $scope.$apply(function() {
                SelfieManageCampaignStatsCtrl = $controller('SelfieManageCampaignStatsController', {
                    $scope: $scope
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
            });

            compileCtrl({
                stats: []
            });
        });

        it('should exist', function() {
            expect(SelfieManageCampaignStatsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('totalClicks', function() {
                describe('when campaign has no stats', function() {
                    it('should be 0', function() {
                        expect(SelfieManageCampaignStatsCtrl.totalClicks).toBe(0);
                    });
                });

                describe('when campaignn has link stats', function() {
                    it('should add them up', function() {
                        compileCtrl({
                            stats: [
                                {
                                    summary: {
                                        linkClicks: {
                                            action: 1,
                                            youtube: 2,
                                            facebook: 3,
                                            twitter: 4
                                        }
                                    }
                                }
                            ]
                        });

                        expect(SelfieManageCampaignStatsCtrl.totalClicks).toBe(1 + 2 + 3 + 4);
                    });
                });
            });

            describe('totalShares', function() {
                describe('when campaign has no stats', function() {
                    it('should be 0', function() {
                        expect(SelfieManageCampaignStatsCtrl.totalShares).toBe(0);
                    });
                });

                describe('when campaignn has share stats', function() {
                    it('should add them up', function() {
                        compileCtrl({
                            stats: [
                                {
                                    summary: {
                                        shareClicks: {
                                            facebook: 1,
                                            twitter: 2,
                                            pinterest: 3
                                        }
                                    }
                                }
                            ]
                        });

                        expect(SelfieManageCampaignStatsCtrl.totalShares).toBe(1 + 2 + 3);
                    });
                });
            });
        });
    });
});