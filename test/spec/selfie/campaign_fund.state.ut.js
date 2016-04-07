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
                paymentMethods;

            var success,
                failure,
                paymentMethodsDeferred;

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

                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                spyOn(c6State, 'goTo');
                spyOn(cinema6.db, 'create').and.returnValue(paymentModel);
                spyOn(cinema6.db, 'findAll').and.returnValue(paymentMethodsDeferred.promise);
                spyOn(PaymentService, 'getToken').and.returnValue($q.when('1234-4321'));
                spyOn(PaymentService, 'getBalance').and.returnValue($q.when({}));

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

            describe('model()', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        FundState.model().then(success, failure);
                    });
                });

                it('should get account balance', function() {
                    expect(PaymentService.getBalance).toHaveBeenCalled();
                });

                it('should find all paymentMethods', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                });

                describe('when paymentMethods are found', function() {
                    it('should resolve', function() {
                        $rootScope.$apply(function() {
                            paymentMethodsDeferred.resolve([]);
                        });

                        expect(success).toHaveBeenCalledWith({
                            balance: {},
                            paymentMethods: []
                        });
                        expect(failure).not.toHaveBeenCalled();
                    });
                });

                describe('when request fails', function() {
                    it('should reject', function() {
                        $rootScope.$apply(function() {
                            paymentMethodsDeferred.reject();
                        });

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });

            describe('afterModel()', function() {
                beforeEach(function() {
                    spyOn(FundState, 'calculateBudgetChange').and.returnValue(100);
                });

                it('should add properties from the parent state', function() {
                    FundState.afterModel({
                        paymentMethods: []
                    });

                    expect(FundState._updateRequest).toBe(FundState.cParent._updateRequest);
                    expect(FundState._campaign).toBe(FundState.cParent._campaign);
                    expect(FundState.campaign).toBe(FundState.cParent.campaign);
                    expect(FundState.interests).toBe(FundState.cParent.cModel.categories);
                    expect(FundState.schema).toBe(FundState.cParent.schema);
                });

                it('should set the budgetHasChanged flag based on calculateBudgetChange', function() {
                    FundState.afterModel({
                        paymentMethods: []
                    });

                    expect(FundState.budgetHasChanged).toBe(true);

                    FundState.calculateBudgetChange.and.returnValue(0);

                    FundState.afterModel({
                        paymentMethods: []
                    });

                    expect(FundState.budgetHasChanged).toBe(false);
                });

                describe('when there are no paymentMethods', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            FundState.afterModel({
                                paymentMethods: []
                            });
                        });
                    });

                    it('should fetch a payment token', function() {
                        expect(PaymentService.getToken).toHaveBeenCalled();
                        expect(FundState.token).toEqual('1234-4321');
                    });

                    it('should create a payment method', function() {
                        expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {});
                        expect(FundState.newMethod).toEqual(paymentModel);
                    });
                });

                describe('when there are existing paymentMethods', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            FundState.afterModel({
                                paymentMethods: [{},{}]
                            });
                        });
                    });

                    it('should not fetch a payment token', function() {
                        expect(PaymentService.getToken).not.toHaveBeenCalled();
                        expect(FundState.token).toEqual(undefined);
                    });

                    it('should create a payment method', function() {
                        expect(cinema6.db.create).not.toHaveBeenCalledWith('paymentMethod', {});
                        expect(FundState.newMethod).toEqual(undefined);
                    });
                });
            });

            describe('enter()', function() {
                describe('when budget has changed', function() {
                    it('should go to Selfie:Campaign:Fund:Deposit state', function() {
                        FundState.budgetHasChanged = true;

                        FundState.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign:Fund:Deposit');
                    });
                });

                describe('when budget has not changed', function() {
                    it('should go to Selfie:Campaign:Fund:Confirm state', function() {
                        FundState.budgetHasChanged = false;

                        FundState.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign:Fund:Confirm');
                    });
                });
            });

            describe('calculateBudgetChange()', function() {
                beforeEach(function() {
                    FundState.afterModel({
                        paymentMethods: []
                    });
                });

                describe('when campaign is draft', function() {
                    it('should be the full campaign budget', function() {
                        expect(FundState.calculateBudgetChange()).toBe(100);
                    });
                });

                describe('when campaign is not draft', function() {
                    beforeEach(function() {
                        FundState.cParent._campaign.status = 'pending';
                    });

                    describe('when budget has not changed', function() {
                        it('should set budgetHasChanged flag to false', function() {
                            expect(FundState.calculateBudgetChange()).toBe(0);
                        });
                    });

                    describe('when budget has changed', function() {
                        it('should set budgetHasChanged flag to true', function() {
                            FundState.cParent._campaign.pricing.budget = 75;

                            expect(FundState.calculateBudgetChange()).toBe(25);
                        });
                    });

                    describe('when there is an updateRequest', function() {
                        describe('when budget has not changed', function() {
                            it('should set budgetHasChanged flag to false', function() {
                                FundState._updateRequest = {
                                    data: {
                                        pricing: {
                                            budget: 100
                                        }
                                    }
                                };

                                expect(FundState.calculateBudgetChange()).toBe(0);
                            });
                        });

                        describe('when budget has changed', function() {
                            it('should set budgetHasChanged flag to true', function() {
                                FundState._updateRequest = {
                                    data: {
                                        pricing: {
                                            budget: 25
                                        }
                                    }
                                };

                                expect(FundState.calculateBudgetChange()).toBe(75);
                            });
                        });
                    });
                });
            });
        });
    });
});
