define(['app'], function(appModule) {
    'use strict';

    describe('SelfieBudgetController', function() {
        var $rootScope,
            $scope,
            $controller,
            $filter,
            c6State,
            PaymentService,
            selfieAppState,
            SelfieBudgetCtrl;

        var campaign;

        function compileCtrl(scopeProps) {
            $scope = $rootScope.$new();
            angular.extend($scope, scopeProps);
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
                SelfieBudgetCtrl = $controller('SelfieBudgetController', { $scope: $scope, PaymentService: PaymentService });
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
                c6State = $injector.get('c6State');

                selfieAppState = c6State.get('Selfie:App');
                selfieAppState.cModel = {
                    data: {
                        hiatus: false
                    }
                };

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

                PaymentService = {
                    balance: {}
                };
            });

            compileCtrl();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            $filter = null;
            SelfieBudgetCtrl = null;
            selfieAppState = null;
            campaign = null;
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

            describe('totalBudget', function() {
                it('should be 0 if budget and additionalBudget are not set', function() {
                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.totalBudget).toBe(0);
                });

                it('should be the budget if additionalBudget is not set', function() {
                    SelfieBudgetCtrl.budget = 123.67;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.totalBudget).toBe(123.67);
                });

                it('should be the additionalBudget if budget is not set', function() {
                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.additionalBudget = 765.98;

                    expect(SelfieBudgetCtrl.totalBudget).toBe(765.98);
                });

                it('should be the sum of budget and additionalBudget when both are set', function() {
                    SelfieBudgetCtrl.budget = 100.45;
                    SelfieBudgetCtrl.additionalBudget = 20.16;

                    expect(SelfieBudgetCtrl.totalBudget).toBe(120.61);
                });
            });

            describe('validBudget', function() {
                it('should be true if budget and additionalBudget are not set and validation.show is false', function() {
                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    $scope.validation.show = true;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);
                });

                it('should be true if validation.show is true and there are no budget errors', function() {
                    $scope.validation.show = true;

                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 100.25;
                    SelfieBudgetCtrl.additionalBudget = 100.67;

                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    campaign.status = 'outOfBudget';
                    campaign.pricing.budget = 1000;

                    compileCtrl();

                    SelfieBudgetCtrl.budget = 1000.25;
                    expect(SelfieBudgetCtrl.validBudget).toBe(true);

                    SelfieBudgetCtrl.budget = 500;
                    SelfieBudgetCtrl.additionalBudget = 500.67;
                    expect(SelfieBudgetCtrl.validBudget).toBe(true);
                });

                it('should be false if there are budget errors', function() {
                    SelfieBudgetCtrl.budget = 10;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = 1000000;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = 100.345;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.additionalBudget = -100;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.additionalBudget = 100.567;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    SelfieBudgetCtrl.budget = 13000;
                    SelfieBudgetCtrl.additionalBudget = 13000;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    campaign.status = 'outOfBudget';
                    campaign.pricing.budget = 1000;

                    compileCtrl();

                    SelfieBudgetCtrl.budget = 999.25;
                    expect(SelfieBudgetCtrl.validBudget).toBe(false);
                });

                it('should be false if validation.show is true and there are budget errors', function() {
                    $scope.validation.show = true;

                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect(SelfieBudgetCtrl.validBudget).toBe(false);

                    campaign.status = 'outOfBudget';

                    SelfieBudgetCtrl.budget = 100.25;
                    SelfieBudgetCtrl.additionalBudget = null;

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

                    campaign.pricing.budget = 500;
                    campaign.status = 'outOfBudget';
                    compileCtrl();
                    expect(SelfieBudgetCtrl.budgetError).toBe(5);

                    SelfieBudgetCtrl.budget = 2000;
                    expect(SelfieBudgetCtrl.budgetError).toBe(false);

                    SelfieBudgetCtrl.budget = 300;
                    SelfieBudgetCtrl.additionalBudget = 300;
                    expect(SelfieBudgetCtrl.budgetError).toBe(false);
                });

                describe('when hiatus is true', function() {
                    beforeEach(function() {
                        selfieAppState.cModel.data.hiatus = true;

                        compileCtrl();
                    });

                    describe('when additionalBudget is greater than remainingFunds', function() {
                        it('should return error code 6', function() {
                            expect(SelfieBudgetCtrl.budgetError).toBe(false);

                            SelfieBudgetCtrl.additionalBudget = 100;
                            PaymentService.balance.remainingFunds = 75;

                            expect(SelfieBudgetCtrl.budgetError).toBe(6);
                        });
                    });

                    describe('when additionalBudget is less than or equal to remainingFunds', function() {
                        it('should be false', function() {
                            expect(SelfieBudgetCtrl.budgetError).toBe(false);

                            SelfieBudgetCtrl.additionalBudget = 100;
                            PaymentService.balance.remainingFunds = 100;

                            expect(SelfieBudgetCtrl.budgetError).toBe(false);

                            SelfieBudgetCtrl.additionalBudget = 100;
                            PaymentService.balance.remainingFunds = 125;

                            expect(SelfieBudgetCtrl.budgetError).toBe(false);
                        });
                    });

                    describe('when a budget increase is greater than remainingFunds', function() {
                        it('should return error code 6', function() {
                            campaign.pricing.budget = 100;
                            campaign.status = 'active';

                            compileCtrl();

                            expect(SelfieBudgetCtrl.budgetError).toBe(false);

                            SelfieBudgetCtrl.budget = 150;
                            PaymentService.balance.remainingFunds = 25;

                            expect(SelfieBudgetCtrl.budgetError).toBe(6);
                        });
                    });

                    describe('when a budget increase is less than or equal to remainingFunds', function() {
                        it('should be false', function() {
                            campaign.pricing.budget = 100;
                            campaign.status = 'active';

                            compileCtrl();

                            expect(SelfieBudgetCtrl.budgetError).toBe(false);

                            SelfieBudgetCtrl.budget = 150;
                            PaymentService.balance.remainingFunds = 50;

                            expect(SelfieBudgetCtrl.budgetError).toBe(false);

                            SelfieBudgetCtrl.budget = 100;
                            PaymentService.balance.remainingFunds = 60;

                            expect(SelfieBudgetCtrl.budgetError).toBe(false);
                        });
                    });

                    describe('when campaign is a draft', function() {
                        beforeEach(function() {
                            $scope.campaign.status = 'draft';
                        });

                        describe('when budget is greater than remainingFunds', function() {
                            it('should return error code 6', function() {
                                expect(SelfieBudgetCtrl.budgetError).toBe(false);

                                SelfieBudgetCtrl.budget = 100;
                                PaymentService.balance.remainingFunds = 75;

                                expect(SelfieBudgetCtrl.budgetError).toBe(6);
                            });
                        });

                        describe('when budget is les sthan or equal to remainingFunds', function() {
                            it('should be false', function() {
                                expect(SelfieBudgetCtrl.budgetError).toBe(false);

                                SelfieBudgetCtrl.budget = 100;
                                PaymentService.balance.remainingFunds = 100;

                                expect(SelfieBudgetCtrl.budgetError).toBe(false);

                                SelfieBudgetCtrl.budget = 100;
                                PaymentService.balance.remainingFunds = 125;

                                expect(SelfieBudgetCtrl.budgetError).toBe(false);
                            });
                        });
                    });
                });
            });

            describe('additionalBudgetError', function() {
                it('should be false if within the limits or have a status code number when true', function() {
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(false);

                    SelfieBudgetCtrl.additionalBudget = -20;
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(1);

                    SelfieBudgetCtrl.additionalBudget = 200000000;
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(2);

                    SelfieBudgetCtrl.budget = 15000;
                    SelfieBudgetCtrl.additionalBudget = 15000;
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(2);
                    SelfieBudgetCtrl.budget = null;

                    SelfieBudgetCtrl.additionalBudget = 200.123;
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(3);

                    SelfieBudgetCtrl.additionalBudget = 0;
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(false);

                    campaign.status = 'outOfBudget';
                    compileCtrl();
                    $scope.validation.show = true;
                    SelfieBudgetCtrl.additionalBudget = null;
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(4);

                    SelfieBudgetCtrl.additionalBudget = 2000;
                    expect(SelfieBudgetCtrl.additionalBudgetError).toBe(false);
                });

                describe('when hiatus is true', function() {
                    beforeEach(function() {
                        selfieAppState.cModel.data.hiatus = true;

                        compileCtrl();
                    });

                    describe('when additionalBudget is greater than remainingFunds', function() {
                        it('should return error code 5', function() {
                            expect(SelfieBudgetCtrl.additionalBudgetError).toBe(false);

                            SelfieBudgetCtrl.additionalBudget = 100;
                            PaymentService.balance.remainingFunds = 75;

                            expect(SelfieBudgetCtrl.additionalBudgetError).toBe(5);
                        });
                    });

                    describe('when additionalBudget is less than or equal to remainingFunds', function() {
                        it('should be false', function() {
                            expect(SelfieBudgetCtrl.additionalBudgetError).toBe(false);

                            SelfieBudgetCtrl.additionalBudget = 100;
                            PaymentService.balance.remainingFunds = 100;

                            expect(SelfieBudgetCtrl.additionalBudgetError).toBe(false);

                            SelfieBudgetCtrl.additionalBudget = 100;
                            PaymentService.balance.remainingFunds = 125;

                            expect(SelfieBudgetCtrl.additionalBudgetError).toBe(false);
                        });
                    });
                });
            });

            describe('dailyLimitError', function() {
                describe('when limit is set and budget is not', function() {
                    it('should return code 1', function() {
                        SelfieBudgetCtrl.limit = 50;
                        SelfieBudgetCtrl.budget = null;
                        SelfieBudgetCtrl.additionalBudget = null;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:1});

                        SelfieBudgetCtrl.limit = 50;
                        SelfieBudgetCtrl.budget = 100;
                        SelfieBudgetCtrl.additionalBudget = null;

                        expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);

                        SelfieBudgetCtrl.limit = 50;
                        SelfieBudgetCtrl.budget = null;
                        SelfieBudgetCtrl.additionalBudget = 100;

                        expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);
                    });
                });

                describe('when max is less than the minimum percentage of total budget', function() {
                    it('should return code 2 with the minimum value', function() {
                        SelfieBudgetCtrl.limit = 1;
                        SelfieBudgetCtrl.budget = 100;
                        SelfieBudgetCtrl.additionalBudget = 100;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:2, min: 200 * 0.015});

                        SelfieBudgetCtrl.limit = 1;
                        SelfieBudgetCtrl.budget = null;
                        SelfieBudgetCtrl.additionalBudget = 200;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:2, min: 200 * 0.015});

                        SelfieBudgetCtrl.limit = 1;
                        SelfieBudgetCtrl.budget = 200;
                        SelfieBudgetCtrl.additionalBudget = null;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:2, min: 200 * 0.015});

                        SelfieBudgetCtrl.limit = 3;
                        SelfieBudgetCtrl.budget = 100;
                        SelfieBudgetCtrl.additionalBudget = 100;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);
                    });
                });

                describe('when max is greater than total budget', function() {
                    it('should return code 3', function() {
                        SelfieBudgetCtrl.limit = 100;
                        SelfieBudgetCtrl.budget = 50;
                        SelfieBudgetCtrl.additionalBudget = null;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:3});

                        SelfieBudgetCtrl.limit = 100;
                        SelfieBudgetCtrl.budget = null;
                        SelfieBudgetCtrl.additionalBudget = 50;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:3});

                        SelfieBudgetCtrl.limit = 100;
                        SelfieBudgetCtrl.budget = 25;
                        SelfieBudgetCtrl.additionalBudget = 25;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:3});

                        SelfieBudgetCtrl.limit = 100;
                        SelfieBudgetCtrl.budget = 100;
                        SelfieBudgetCtrl.additionalBudget = null;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);

                        SelfieBudgetCtrl.limit = 100;
                        SelfieBudgetCtrl.budget = null;
                        SelfieBudgetCtrl.additionalBudget = 100;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);

                        SelfieBudgetCtrl.limit = 100;
                        SelfieBudgetCtrl.budget = 50;
                        SelfieBudgetCtrl.additionalBudget = 50;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);
                    });
                });

                describe('when max is not a valid decimal', function() {
                    it('should return code 4', function() {
                        SelfieBudgetCtrl.limit = 100.123;
                        SelfieBudgetCtrl.budget = 150;
                        SelfieBudgetCtrl.additionalBudget = null;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:4});

                        SelfieBudgetCtrl.limit = 100.123;
                        SelfieBudgetCtrl.budget = null;
                        SelfieBudgetCtrl.additionalBudget = 150;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:4});

                        SelfieBudgetCtrl.limit = 100.123;
                        SelfieBudgetCtrl.budget = 75;
                        SelfieBudgetCtrl.additionalBudget = 75;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:4});

                        SelfieBudgetCtrl.limit = 100.12;
                        SelfieBudgetCtrl.budget = 150;
                        SelfieBudgetCtrl.additionalBudget = null;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);

                        SelfieBudgetCtrl.limit = 100.12;
                        SelfieBudgetCtrl.budget = null;
                        SelfieBudgetCtrl.additionalBudget = 150;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);

                        SelfieBudgetCtrl.limit = 100.12;
                        SelfieBudgetCtrl.budget = 75;
                        SelfieBudgetCtrl.additionalBudget = 75;

                        expect(SelfieBudgetCtrl.dailyLimitError).toEqual(false);
                    });
                });

                describe('when there is an end date', function() {
                    var today, tomorrow, threeDays, sevenDays, tenDaysPast, tenDaysFuture;

                    beforeEach(function() {
                        today = new Date(),
                        tomorrow = new Date(),
                        threeDays = new Date(),
                        sevenDays = new Date();
                        tenDaysPast = new Date();
                        tenDaysFuture = new Date();

                        tomorrow.setDate(today.getDate() + 1);
                        threeDays.setDate(today.getDate() + 3);
                        sevenDays.setDate(today.getDate() + 7);
                        tenDaysPast.setDate(today.getDate() - 10);
                    });

                    describe('when there is no start date', function() {
                        it('should calculate starting tomorrow', function() {
                            SelfieBudgetCtrl.limit = 100;
                            SelfieBudgetCtrl.budget = 5000;
                            SelfieBudgetCtrl.additionalBudget = null;

                            campaign.cards[0].campaign = {
                                endDate: threeDays.toISOString()
                            };

                            // dividing budget by 2 days remaining
                            expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:5, min: 5000 / 2});

                            SelfieBudgetCtrl.limit = 100;
                            SelfieBudgetCtrl.budget = 2000;
                            SelfieBudgetCtrl.additionalBudget = 3000;

                            campaign.cards[0].campaign = {
                                endDate: threeDays.toISOString()
                            };

                            // dividing budget by 2 days remaining
                            expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:5, min: 5000 / 2});
                        });
                    });

                    describe('when start date is in the past', function() {
                        it('should calculate starting tomorrow', function() {
                            SelfieBudgetCtrl.limit = 100;
                            SelfieBudgetCtrl.budget = 5000;
                            SelfieBudgetCtrl.additionalBudget = null;

                            campaign.cards[0].campaign = {
                                endDate: threeDays.toISOString(),
                                startDate: tenDaysPast.toISOString()
                            };

                            // dividing budget by 2 days remaining
                            expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:5, min: 5000 / 2});

                            SelfieBudgetCtrl.limit = 100;
                            SelfieBudgetCtrl.budget = 2000;
                            SelfieBudgetCtrl.additionalBudget = 3000;

                            campaign.cards[0].campaign = {
                                endDate: threeDays.toISOString(),
                                startDate: tenDaysPast.toISOString()
                            };

                            // dividing budget by 2 days remaining
                            expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:5, min: 5000 / 2});
                        });
                    });

                    describe('when start date is in the future', function() {
                        it('should calculate using defined start date', function() {
                            SelfieBudgetCtrl.limit = 100;
                            SelfieBudgetCtrl.budget = 5000;
                            SelfieBudgetCtrl.additionalBudget = null;

                            campaign.cards[0].campaign = {
                                endDate: sevenDays.toISOString(),
                                startDate: threeDays.toISOString()
                            };

                            // dividing budget by 4 days
                            expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:5, min: 5000 / 4});

                            SelfieBudgetCtrl.limit = 100;
                            SelfieBudgetCtrl.budget = 2000;
                            SelfieBudgetCtrl.additionalBudget = 3000;

                            campaign.cards[0].campaign = {
                                endDate: sevenDays.toISOString(),
                                startDate: threeDays.toISOString()
                            };

                            // dividing budget by 4 days
                            expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:5, min: 5000 / 4});
                        });
                    });

                    describe('when the campaign has spent some budget', function() {
                        it('should factor it into the calculation', function() {
                            compileCtrl({
                                stats: { summary: { totalSpend: 100 } }
                            });

                            SelfieBudgetCtrl.limit = 100;
                            SelfieBudgetCtrl.budget = 5000;
                            SelfieBudgetCtrl.additionalBudget = null;

                            campaign.cards[0].campaign = {
                                endDate: sevenDays.toISOString(),
                                startDate: threeDays.toISOString()
                            };

                            // subtracting 100 spent from 5000 total budget
                            expect(SelfieBudgetCtrl.dailyLimitError).toEqual({code:5, min: 4900 / 4});
                        });
                    });
                });
            });

            describe('additionalBudget', function() {
                describe('when not increasing budget', function() {
                    it('should be undefined', function() {
                        compileCtrl();

                        expect(SelfieBudgetCtrl.additionalBudget).toBe(undefined);
                    });
                });

                describe('when increasing budget', function() {
                    describe('when there is still budget left', function() {
                        it('should default to 0', function() {
                            campaign.pricing.budget = 100;

                            var stats = {
                                summary: {
                                    totalSpend: 30
                                }
                            };

                            compileCtrl({
                                stats: stats,
                                increaseBudget: true
                            });

                            expect(SelfieBudgetCtrl.additionalBudget).toBe(0);
                        });
                    });

                    describe('when there is no budget left', function() {
                        it('should default to the minimum budget', function() {
                            campaign.pricing.budget = 100;

                            var stats = {
                                summary: {
                                    totalSpend: 100
                                }
                            };

                            compileCtrl({
                                stats: stats,
                                increaseBudget: true
                            });

                            expect(SelfieBudgetCtrl.additionalBudget).toEqual($scope.schema.pricing.budget.__min);
                        });
                    });
                });
            });

            describe('additionalBudgetRequired', function() {
                describe('when not increasing budget', function() {
                    it('should be false', function() {
                        compileCtrl();

                        expect(SelfieBudgetCtrl.additionalBudgetRequired).toBe(false);
                    });
                });

                describe('when increasing budget', function() {
                    describe('when there is still budget left', function() {
                        it('should be false', function() {
                            campaign.pricing.budget = 100;

                            var stats = {
                                summary: {
                                    totalSpend: 30
                                }
                            };

                            compileCtrl({
                                stats: stats,
                                increaseBudget: true
                            });

                            expect(SelfieBudgetCtrl.additionalBudgetRequired).toBe(false);
                        });
                    });

                    describe('when there is no budget left', function() {
                        it('should be true', function() {
                            campaign.pricing.budget = 100;

                            var stats = {
                                summary: {
                                    totalSpend: 100
                                }
                            };

                            compileCtrl({
                                stats: stats,
                                increaseBudget: true
                            });

                            expect(SelfieBudgetCtrl.additionalBudgetRequired).toEqual(true);
                        });
                    });
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

                it('should be false if budget is not valid', function() {
                    campaign.pricing.budget = 500;
                    campaign.status = 'outOfBudget';

                    compileCtrl();

                    expect($scope.validation.budget).toBe(false);
                });
            });

            describe('validation.dailyLimit', function() {
                it('should be true when daily limit error is false or code 5', function() {
                    var threeDays = new Date();
                    threeDays.setDate(threeDays.getDate() + 3);

                    SelfieBudgetCtrl.limit = 100;
                    SelfieBudgetCtrl.budget = null;
                    SelfieBudgetCtrl.additionalBudget = null;

                    expect($scope.validation.dailyLimit).toBe(false);

                    SelfieBudgetCtrl.limit = 10;
                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.additionalBudget = null;

                    campaign.cards[0].campaign = {
                        endDate: threeDays.toISOString()
                    };

                    expect(SelfieBudgetCtrl.dailyLimitError.code).toBe(5);
                    expect($scope.validation.dailyLimit).toBe(true);

                    SelfieBudgetCtrl.limit = 100;
                    SelfieBudgetCtrl.budget = 100;
                    SelfieBudgetCtrl.additionalBudget = null;

                    campaign.cards[0].campaign = {};

                    expect(SelfieBudgetCtrl.dailyLimitError).toBe(false);
                    expect($scope.validation.dailyLimit).toBe(true);
                });
            });
        });

        describe('setBudget()', function() {
            it('should set the budget and limit on the campaign if valid', function() {
                var threeDays = new Date();
                threeDays.setDate(threeDays.getDate() + 3);

                expect(campaign.pricing.budget).toBeUndefined();
                expect(campaign.pricing.dailyLimit).toBeUndefined();

                SelfieBudgetCtrl.budget = 3000000;
                SelfieBudgetCtrl.additionalBudget = 3000000;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(undefined);
                expect(campaign.pricing.dailyLimit).toBe(undefined);
                expect($scope.validation.budget).toBe(false);

                SelfieBudgetCtrl.budget = 3000.12;
                SelfieBudgetCtrl.additionalBudget = 3000.07;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(6000.19);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(true);

                SelfieBudgetCtrl.limit = 3000000;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(6000.19);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(false);

                SelfieBudgetCtrl.limit = 300;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(6000.19);
                expect(campaign.pricing.dailyLimit).toBe(300);
                expect($scope.validation.budget).toBe(true);

                SelfieBudgetCtrl.limit = null;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(6000.19);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(true);

                SelfieBudgetCtrl.budget = 3000000000;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(6000.19);
                expect(campaign.pricing.dailyLimit).toBe(null);
                expect($scope.validation.budget).toBe(false);

                SelfieBudgetCtrl.budget = 5000;
                SelfieBudgetCtrl.additionalBudget = null;
                SelfieBudgetCtrl.limit = 500;

                SelfieBudgetCtrl.setBudget();

                expect(campaign.pricing.budget).toBe(5000);
                expect(campaign.pricing.dailyLimit).toBe(500);
                expect($scope.validation.budget).toBe(true);

                SelfieBudgetCtrl.budget = 5000;
                SelfieBudgetCtrl.additionalBudget = 1000;
                SelfieBudgetCtrl.limit = 400;

                campaign.cards[0].campaign = {
                    endDate: threeDays.toISOString()
                };

                SelfieBudgetCtrl.setBudget();

                expect(SelfieBudgetCtrl.dailyLimitError.code).toBe(5);
                expect(campaign.pricing.budget).toBe(6000);
                expect(campaign.pricing.dailyLimit).toBe(400);
                expect($scope.validation.budget).toBe(true);
            });
        });
    });
});
