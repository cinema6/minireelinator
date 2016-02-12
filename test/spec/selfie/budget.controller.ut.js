define(['app'], function(appModule) {
    'use strict';

    describe('SelfieBudgetController', function() {
        var $rootScope,
            $scope,
            $controller,
            $filter,
            SelfieBudgetCtrl;

        var campaign;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.schema = {
                pricing: {
                    budget: {
                        __min:50,
                        __max:20000
                    },
                    dailyLimit: {
                        __percentMin:0.015,
                        __percentMax:1,
                        __percentDefault:0.03
                    },
                    cost: {
                        __base: 0.05,
                        __pricePerGeo: 0.00,
                        __priceForGeoTargeting: 0.01,
                        __pricePerDemo: 0.00,
                        __priceForDemoTargeting: 0.01,
                        __priceForInterests: 0.01
                    }
                }
            };
            $scope.campaign = campaign;
            $scope.validation = {
                budget: true
            };
            $scope.$apply(function() {
                SelfieBudgetCtrl = $controller('SelfieBudgetController', { $scope: $scope });
            });
        }

        function num(num) {
            return parseFloat($filter('number')(num, 2));
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $filter = $injector.get('$filter');

                campaign = {
                    pricing: {},
                    targeting: {
                        geo: {
                            states: [],
                            dmas: [],
                            zipcodes: {
                                codes: []
                            }
                        },
                        demographics: {
                            age: [],
                            income: [],
                            gender: []
                        },
                        interests: []
                    },
                    cards: [
                        {   }
                    ]
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieBudgetCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('budget', function() {
                it('should be the budget from the campaign or default to null', function() {
                    expect(SelfieBudgetCtrl.budget).toBe(null);

                    campaign.pricing.budget = 3000;

                    compileCtrl();

                    expect(SelfieBudgetCtrl.budget).toBe(3000);
                });
            });

            describe('limit', function() {
                it('should be the dailyLimit from the campaign or default to null', function() {
                    expect(SelfieBudgetCtrl.limit).toBe(null);

                    campaign.pricing.dailyLimit = 100;

                    compileCtrl();

                    expect(SelfieBudgetCtrl.limit).toBe(100);
                });
            });

            describe('cpv', function() {
                it('should add $.01 each for demo, location, interests', function() {
                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.05);

                    campaign.targeting.geo.states.push('Arizona');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.06);

                    campaign.targeting.geo.states.push('Alabama');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.06);

                    campaign.targeting.geo.dmas.push('Chicago');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.06);

                    campaign.targeting.geo.dmas.push('New York City');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.06);

                    campaign.targeting.interests.push('comedy');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.07);

                    campaign.targeting.interests.push('entertainment');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.07);

                    campaign.targeting.demographics.age.push('18-24');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.08);

                    campaign.targeting.demographics.age.push('25-40');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.08);

                    campaign.targeting.demographics.income.push('20,000-50,000');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.08);

                    campaign.targeting.demographics.income.push('120,000-150,000');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.08);

                    campaign.targeting.demographics.gender.push('Male');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.08);

                    campaign.targeting.demographics.gender.push('Male');

                    expect(num(SelfieBudgetCtrl.cpv)).toBe(0.08);
                });
            });

            describe('validBudget', function() {
                it('should be true if not set and validation.show is false or is set between 50 and 20,000', function() {
                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 100;

                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 25;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = 15000;

                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 25000;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = null;
                    expect(SelfieBudgetCtrl.validBudget).toBe(true);
                    $scope.validation.show = true;
                    expect(SelfieBudgetCtrl.validBudget).toBe(false);
                });
            });

            describe('budgetError', function() {
                it('should be false if within the limits or have a status code number when true', function() {
                    expect(SelfieBudgetCtrl.budgetError).toBe(false);

                    SelfieBudgetCtrl.budget = 20;
                    expect(SelfieBudgetCtrl.budgetError).toBe(1);

                    SelfieBudgetCtrl.budget = 200000000;
                    expect(SelfieBudgetCtrl.budgetError).toBe(2);

                    SelfieBudgetCtrl.budget = 200.123;
                    expect(SelfieBudgetCtrl.budgetError).toBe(3);

                    SelfieBudgetCtrl.budget = null;
                    $scope.validation.show = true;
                    expect(SelfieBudgetCtrl.budgetError).toBe(4);

                    SelfieBudgetCtrl.budget = 2000;
                    expect(SelfieBudgetCtrl.budgetError).toBe(false);
                });
            });

            describe('dailyLimitError', function() {
                it('should be false if budget and limit are not defined or if the limit is between the 1.5% to 100% of the budget and is a valid decimal', function() {
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 50;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);
                    expect($scope.validation.dailyLimit).toBe(true);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 2;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);
                    expect($scope.validation.dailyLimit).toBe(true);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 100;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);
                    expect($scope.validation.dailyLimit).toBe(true);

                    SelfieBudgetCtrl.budget = 100.25;
                    SelfieBudgetCtrl.limit = 50.50;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);
                    expect($scope.validation.dailyLimit).toBe(true);
                });

                it('should contain an error status number if limit is set but budget is not or the limit is not between 1.5% to 100% of total budget', function() {
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);

                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.limit = 20;
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual({ code: 1 });
                    expect($scope.validation.dailyLimit).toBe(false);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 1;
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual({ code: 2 });
                    expect($scope.validation.dailyLimit).toBe(false);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 101;
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual({ code: 3 });
                    expect($scope.validation.dailyLimit).toBe(false);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 20.123;
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual({ code: 4 });
                    expect($scope.validation.dailyLimit).toBe(false);
                });

                it('should have error code and min value if flight dates do not work with daily limit', function() {
                    var today = new Date(),
                        tomorrow = new Date(),
                        threeDays = new Date(),
                        sevenDays = new Date();

                    tomorrow.setDate(today.getDate() + 1);
                    threeDays.setDate(today.getDate() + 3);
                    sevenDays.setDate(today.getDate() + 7);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 10;
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);
                    expect($scope.validation.dailyLimit).toBe(true);

                    campaign.cards[0].campaign = {
                        endDate: threeDays.toISOString()
                    };

                    expect($scope.validation.dailyLimit).toBe(false);
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual({
                        code: 5,
                        min: 100 / 2
                    });

                    campaign.cards[0].campaign = {
                        startDate: threeDays.toISOString(),
                        endDate: sevenDays.toISOString()
                    };

                    expect($scope.validation.dailyLimit).toBe(false);
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual({
                        code: 5,
                        min: 100 / 4
                    });

                    SelfieBudgetCtrl.limit = 50;
                    expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);
                    expect($scope.validation.dailyLimit).toBe(true);
                });
            });
        });

        describe('$scope properties', function() {
            describe('validation.budget', function() {
                it('should be false if budget and limit are not set', function() {
                    expect($scope.validation.budget).toBe(false);
                });

                it('should be true if budget and limit are set', function() {
                    campaign.pricing.budget = 1000;
                    campaign.pricing.dailyLimit = 100;

                    compileCtrl();

                    expect($scope.validation.budget).toBe(true);
                });
            });
        });

        describe('setBudget()', function() {
            it('should set the budget and limit on the campaign if valid', function() {
                expect(campaign.pricing.budget).toBeUndefined();
                expect(campaign.pricing.dailyLimit).toBeUndefined();

                SelfieBudgetCtrl.budget = 300000000;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(undefined);
                expect(campaign.pricing.dailyLimit).toBe(undefined);
                expect($scope.validation.budget).toBe(false);

                SelfieBudgetCtrl.budget = 3000;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(3000);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(true);

                SelfieBudgetCtrl.limit = 3000000;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(3000);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(false);

                SelfieBudgetCtrl.limit = 300;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(3000);
                expect(campaign.pricing.dailyLimit).toBe(300);
                expect($scope.validation.budget).toBe(true);

                SelfieBudgetCtrl.limit = null;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(3000);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(true);

                SelfieBudgetCtrl.budget = 3000000000;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(3000);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(false);

                SelfieBudgetCtrl.budget = 5000;
                SelfieBudgetCtrl.limit = 500;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(5000);
                expect(campaign.pricing.dailyLimit).toBe(500);
                expect($scope.validation.budget).toBe(true);
            });
        });
    });
});