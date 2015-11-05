define(['app'], function(appModule) {
    'use strict';

    describe('SelfieDemographicsController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieDemographicsCtrl;

        var campaign,
            categories;

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

        describe('properties', function() {
            describe('gender', function() {
                it('should come from the campaign or be None', function() {
                    expect(SelfieDemographicsCtrl.gender).toEqual('None');

                    campaign.targeting.demographics.gender.push('Male');

                    compileCtrl();

                    expect(SelfieDemographicsCtrl.gender).toEqual('Male');
                });
            });
        });

        describe('$watchers', function() {
            describe('gender', function() {
                it('should set gender on the campaign', function() {
                    expect(campaign.targeting.demographics.gender).toEqual([]);

                    $scope.$apply(function() {
                        SelfieDemographicsCtrl.gender = 'Male';
                    });

                    expect(campaign.targeting.demographics.gender).toEqual(['Male']);

                    $scope.$apply(function() {
                        SelfieDemographicsCtrl.gender = 'Female';
                    });

                    expect(campaign.targeting.demographics.gender).toEqual(['Female']);

                    $scope.$apply(function() {
                        SelfieDemographicsCtrl.gender = 'None';
                    });

                    expect(campaign.targeting.demographics.gender).toEqual([]);
                });
            });
        });
    });
});