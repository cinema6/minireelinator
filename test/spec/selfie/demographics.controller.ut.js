define(['app'], function(appModule) {
    'use strict';

    describe('SelfieDemographicsController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieDemographicsCtrl,
            CampaignService;

        var campaign,
            categories,
            costData;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.schema = {
                pricing: {
                    cost: {
                        __base: 0.05,
                        __pricePerGeo: 0.01,
                        __pricePerDemo: 0.01,
                        __priceForInterests: 0.01
                    }
                }
            };
            $scope.campaign = campaign;
            $scope.categories = categories;

            $scope.$apply(function() {
                SelfieDemographicsCtrl = $controller('SelfieDemographicsController', { $scope: $scope });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                CampaignService = $injector.get('CampaignService');

                costData = {
                    categories: {
                        areEqual: true,
                        geo: 0.1,
                        demo: 0.1,
                        interests: 0.1
                    }
                };

                spyOn(CampaignService, 'getTargetingCost').and.returnValue(costData);

                campaign = {
                    targeting: {
                        demographics: {
                            gender: []
                        }
                    }
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieDemographicsCtrl).toEqual(jasmine.any(Object));
        });

        it('should get the targeting cost data', function() {
            expect(CampaignService.getTargetingCost).toHaveBeenCalled();
            expect(SelfieDemographicsCtrl.cost).toBe(costData);
        });

        describe('properties', function() {
            describe('gender', function() {
                it('should come from the campaign', function() {
                    expect(SelfieDemographicsCtrl.gender).toEqual([]);

                    campaign.targeting.demographics.gender.push('Male');

                    compileCtrl();

                    expect(SelfieDemographicsCtrl.gender).toEqual(['Male']);
                });
            });
        });

        describe('$watchers', function() {
            describe('gender', function() {
                it('should set gender on the campaign', function() {
                    expect(campaign.targeting.demographics.gender).toEqual([]);

                    $scope.$apply(function() {
                        SelfieDemographicsCtrl.gender = ['Male'];
                    });

                    expect(campaign.targeting.demographics.gender).toEqual(['Male']);

                    $scope.$apply(function() {
                        SelfieDemographicsCtrl.gender = ['Male','Female'];
                    });

                    expect(campaign.targeting.demographics.gender).toEqual(['Female']);

                    $scope.$apply(function() {
                        SelfieDemographicsCtrl.gender = [];
                    });

                    expect(campaign.targeting.demographics.gender).toEqual([]);
                });
            });
        });
    });
});