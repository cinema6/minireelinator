define(['app'], function(appModule) {
    'use strict';

    describe('SelfieBudgetController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieBudgetCtrl;

        var campaign;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.campaign = campaign;
            $scope.validation = {
                budget: true
            };
            $scope.$apply(function() {
                SelfieBudgetCtrl = $controller('SelfieBudgetController', { $scope: $scope });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                campaign = {
                    pricing: {},
                    targeting: {
                        geo: {
                            states: [],
                            dmas: []
                        },
                        interests: []
                    }
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
                it('should add $.50 each for interests, states and DMAs', function() {
                    expect(SelfieBudgetCtrl.cpv).toBe(50);

                    campaign.targeting.geo.states.push('Arizona');

                    expect(SelfieBudgetCtrl.cpv).toBe(50.5);

                    campaign.targeting.geo.states.push('Alabama');

                    expect(SelfieBudgetCtrl.cpv).toBe(50.5);

                    campaign.targeting.geo.dmas.push('Chicago');

                    expect(SelfieBudgetCtrl.cpv).toBe(51);

                    campaign.targeting.geo.dmas.push('New York City');

                    expect(SelfieBudgetCtrl.cpv).toBe(51);

                    campaign.targeting.interests.push('comedy');

                    expect(SelfieBudgetCtrl.cpv).toBe(51.5);
                });
            });

            describe('validBudget', function() {
                it('should be true if not set or is set between 50 and 20,000', function() {
                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 100;

                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 25;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = 15000;

                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 25000;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);
                });
            });

            describe('dailyLimitError', function() {
                it('should be false if budget and limit are not defined or if the limit is between the 1.5% to 100% of the budget', function() {
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 50;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 2;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 100;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);
                });

                it('should contain an error message if limit is set but budget is not or the limit is not between 1.5% to 100% of total budget', function() {
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);

                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.limit = 20;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe('Please enter your Total Budget first');

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 1;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe('Must be greater than 1.5% of the Total Budget');

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.limit = 101;
                    expect(SelfieBudgetCtrl.dailyLimitError).toBe('Must be less than Total Budget');
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
                expect($scope.validation.budget).toBe(false);

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
                expect($scope.validation.budget).toBe(false);

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