define(['app'], function(appModule) {
    'use strict';

    ['Selfie:New:Campaign:Fund','Selfie:Edit:Campaign:Fund'].forEach(function(stateName) {
        describe('Selfie:Campaign:Fund State', function() {
            var c6State,
                $rootScope,
                $q,
                FundState,
                cinema6,
                PaymentService,
                paymentModel,
                paymentMethods,
                SelfieState;

            var success,
                failure,
                paymentMethodsDeferred,
                creditCheckDeferred;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    PaymentService = $injector.get('PaymentService');
                });

                paymentMethods = [];
                paymentMethodsDeferred = $q.defer();
                paymentModel = cinema6.db.create('paymentMethod', {});
                creditCheckDeferred = $q.defer();

                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                spyOn(c6State, 'goTo');
                spyOn(cinema6.db, 'create').and.returnValue(paymentModel);
                spyOn(cinema6.db, 'findAll').and.returnValue(paymentMethodsDeferred.promise);
                spyOn(PaymentService, 'getToken').and.returnValue($q.when('1234-4321'));
                spyOn(PaymentService, 'getBalance').and.returnValue($q.when({}));
                spyOn(PaymentService, 'creditCheck').and.returnValue(creditCheckDeferred.promise);

                SelfieState = c6State.get('Selfie');
                SelfieState.cModel = {
                    entitlements: {
                        paymentOptional: false
                    }
                };

                FundState = c6State.get(stateName);
                FundState.cParent = {
                    cModel: {
                        categories: []
                    },
                    _updateRequest: undefined,
                    _campaign: {
                        status: 'draft',
                        pricing: {
                            budget: 100
                        }
                    },
                    campaign: {
                        pricing: {
                            budget: 100
                        }
                    },
                    schema: {}
                }
            });

            it('should exist', function() {
                expect(FundState).toEqual(jasmine.any(Object));
            });

            describe('beforeModel()', function() {
                it('should add the campaign from the parent state', function() {
                    $rootScope.$apply(function() {
                        FundState.beforeModel();
                    });

                    expect(FundState.campaign).toEqual(FundState.cParent.campaign)
                });
            });

            describe('model()', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        FundState.beforeModel();
                        FundState.model().then(success, failure);
                    });
                });

                it('should get account balance', function() {
                    expect(PaymentService.getBalance).toHaveBeenCalled();
                });

                it('should check credit for campaign', function() {
                    expect(PaymentService.creditCheck).toHaveBeenCalledWith(FundState.campaign);
                });

                it('should find all paymentMethods', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                });

                describe('when paymentMethods are found and credit check fulfills', function() {
                    it('should resolve', function() {
                        $rootScope.$apply(function() {
                            paymentMethodsDeferred.resolve([]);
                            creditCheckDeferred.resolve({});
                        });

                        expect(success).toHaveBeenCalledWith({
                            balance: {},
                            paymentMethods: [],
                            creditCheck: {}
                        });
                        expect(failure).not.toHaveBeenCalled();
                    });
                });

                describe('when request fails', function() {
                    it('should reject', function() {
                        $rootScope.$apply(function() {
                            paymentMethodsDeferred.reject();
                            creditCheckDeferred.resolve({depositAmount: 0});
                        });

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });

            describe('afterModel()', function() {
                describe('when campaign is a draft', function() {
                    beforeEach(function() {
                        FundState.cParent._campaign.status = 'draft';
                        FundState.cParent._campaign.pricing.budget = 500;
                        FundState.cParent.campaign.pricing.budget = 500;

                        FundState.beforeModel();
                        FundState.afterModel({
                            paymentMethods: [],
                            balance: {},
                            creditCheck: {
                                depositAmount: 300
                            }
                        });
                    });

                    it('should set the budget change to the full campaign budget', function() {
                        expect(FundState.budgetChange).toBe(500);
                        expect(FundState.newBudget).toBe(500);
                        expect(FundState.oldBudget).toBe(500);
                    });

                    it('should set the isDraft flag to true', function() {
                        expect(FundState.isDraft).toBe(true);
                    });

                    it('should set minDeposit to depositAmount', function() {
                        expect(FundState.minDeposit).toBe(300);
                    });
                });

                describe('when campaign is not a draft', function() {
                    beforeEach(function() {
                        FundState.cParent._campaign.status = 'active';
                        FundState.cParent._campaign.pricing.budget = 200;
                        FundState.cParent.campaign.pricing.budget = 400;
                        FundState.beforeModel();
                    });

                    describe('when the campaign does not have a pending update request', function() {
                        beforeEach(function() {
                            FundState.afterModel({
                                paymentMethods: [],
                                balance: {},
                                creditCheck: {
                                    depositAmount: 100
                                }
                            });
                        });

                        it('should set the old budget to the budget from the original campaign', function() {
                            expect(FundState.budgetChange).toBe(200);
                            expect(FundState.newBudget).toBe(400);
                            expect(FundState.oldBudget).toBe(200);
                        });

                        it('should set the isDraft flag to false', function() {
                            expect(FundState.isDraft).toBe(false);
                        });

                        it('should set minDeposit to depositAmount', function() {
                            expect(FundState.minDeposit).toBe(100);
                        });
                    });

                    describe('when the campaign has a pending update request', function() {
                        beforeEach(function() {
                            FundState.cParent._updateRequest = {
                                data: {
                                    pricing: {
                                        budget: 300
                                    }
                                }
                            };

                            FundState.afterModel({
                                paymentMethods: [],
                                balance: {},
                                creditCheck: {
                                    depositAmount: 50
                                }
                            });
                        });

                        it('should set the old budget to the budget from the update request', function() {
                            expect(FundState.budgetChange).toBe(100);
                            expect(FundState.newBudget).toBe(400);
                            expect(FundState.oldBudget).toBe(300);
                        });

                        it('should set the isDraft flag to false', function() {
                            expect(FundState.isDraft).toBe(false);
                        });

                        it('should set minDeposit to depositAmount', function() {
                            expect(FundState.minDeposit).toBe(50);
                        });
                    });
                });

                it('should add properties from the parent state', function() {
                    FundState.beforeModel();
                    FundState.afterModel({
                        paymentMethods: [],
                        balance: {},
                        creditCheck: {
                            depositAmount: 0
                        }
                    });

                    expect(FundState.campaign).toBe(FundState.cParent.campaign);
                    expect(FundState.schema).toBe(FundState.cParent.schema);
                    expect(FundState.interests).toBe(FundState.cParent.cModel.categories);
                    expect(FundState.accounting).toBe(PaymentService.balance);
                });

                it('should fetch a payment token', function() {
                    $rootScope.$apply(function() {
                        FundState.beforeModel();
                        FundState.afterModel({
                            paymentMethods: [],
                            balance: {},
                            creditCheck: {
                                depositAmount: 0
                            }
                        });
                    });

                    expect(PaymentService.getToken).toHaveBeenCalled();
                    expect(FundState.token).toEqual('1234-4321');
                });

                it('should create a payment method', function() {
                    $rootScope.$apply(function() {
                        FundState.beforeModel();
                        FundState.afterModel({
                            paymentMethods: [],
                            balance: {},
                            creditCheck: {
                                depositAmount: 0
                            }
                        });
                    });

                    expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {});
                    expect(FundState.newMethod).toEqual(paymentModel);
                });

                describe('when user has no payment methods and paymentOptional entitlement', function() {
                    describe('when there is a minDeposit required', function() {
                        it('should set skipDeposit to false', function() {
                            $rootScope.$apply(function() {
                                SelfieState.cModel.entitlements.paymentOptional = true;

                                FundState.beforeModel();
                                FundState.afterModel({
                                    paymentMethods: [],
                                    balance: {},
                                    creditCheck: {
                                        depositAmount: 200
                                    }
                                });
                            });

                            expect(FundState.skipDeposit).toBe(false);
                        });
                    });

                    describe('when there is no minDeposit', function() {
                        it('should set the skipDposit to true even when there are no paymentMethods', function() {
                            $rootScope.$apply(function() {
                                SelfieState.cModel.entitlements.paymentOptional = true;

                                FundState.beforeModel();
                                FundState.afterModel({
                                    paymentMethods: [],
                                    balance: {},
                                    creditCheck: {
                                        depositAmount: 0
                                    }
                                });
                            });

                            expect(FundState.skipDeposit).toBe(true);
                        });
                    });
                });

                describe('when there are no paymentMethods', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            FundState.beforeModel();
                            FundState.afterModel({
                                paymentMethods: [],
                                balance: {},
                                creditCheck: {
                                    depositAmount: 0
                                }
                            });
                        });
                    });

                    it('should set skipDeposit flag to false even though there is no minDeposit', function() {
                        expect(FundState.minDeposit).toBeFalsy();
                        expect(FundState.skipDeposit).toBe(false);
                    });
                });

                describe('when there are existing paymentMethods', function() {
                    describe('when there is no minDeposit', function() {
                        it('should set skipDeposit flag to true', function() {
                            $rootScope.$apply(function() {
                                FundState.beforeModel();
                                FundState.afterModel({
                                    paymentMethods: [{},{}],
                                    balance: {},
                                    creditCheck: {
                                        depositAmount: 0
                                    }
                                });
                            });

                            expect(FundState.skipDeposit).toBe(true);
                        });
                    });

                    describe('when there is a minDeposit', function() {
                        it('should set skipDeposit flag to false', function() {
                            $rootScope.$apply(function() {
                                FundState.beforeModel();
                                FundState.afterModel({
                                    paymentMethods: [{},{}],
                                    balance: {},
                                    creditCheck: {
                                        depositAmount: 800
                                    }
                                });
                            });

                            expect(FundState.skipDeposit).toBe(false);
                        });
                    });
                });
            });

            describe('enter()', function() {
                describe('when skipDeposit is false', function() {
                    it('should go to Selfie:Campaign:Fund:Deposit state', function() {
                        FundState.skipDeposit = false;

                        FundState.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign:Fund:Deposit');
                    });
                });

                describe('when budget has not changed', function() {
                    it('should go to Selfie:Campaign:Fund:Confirm state', function() {
                        FundState.skipDeposit = true;

                        FundState.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign:Fund:Confirm');
                    });
                });
            });
        });
    });
});
