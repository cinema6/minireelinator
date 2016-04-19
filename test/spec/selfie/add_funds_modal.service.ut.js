define(['app'], function(appModule) {
    'use strict';

    describe('AddFundsModalService', function() {
        var $rootScope,
            $q,
            cinema6,
            PaymentService,
            AddFundsModalService;

        var paymentMethod,
            paymentMethods,
            paymentMethodDeferred,
            paymentMethodsDeferred,
            tokenDeferred;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
                AddFundsModalService = $injector.get('AddFundsModalService');
            });

            paymentMethodsDeferred = $q.defer();
            paymentMethodDeferred = $q.defer();
            tokenDeferred = $q.defer();

            spyOn(cinema6.db, 'findAll').and.returnValue(paymentMethodsDeferred.promise);
            spyOn(cinema6.db, 'create').and.returnValue(paymentMethodDeferred.promise);
            spyOn(PaymentService, 'getToken').and.returnValue(tokenDeferred.promise);

            paymentMethods = [];
            paymentMethod = {};
        });

        it('should exist', function() {
            expect(AddFundsModalService).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be a computed property', function() {
                    expect(AddFundsModalService.model).toEqual({});

                    expect(function() {
                        AddFundsModalService.model = {};
                    }).toThrow();
                });
            });
        });

        describe('methods', function() {
            describe('display()', function() {
                beforeEach(function() {
                    AddFundsModalService.display();
                });

                it('should set model.show to true', function() {
                    expect(AddFundsModalService.model.show).toBe(true);
                });

                it('should set model.pending to true', function() {
                    expect(AddFundsModalService.model.pending).toBe(true);
                });

                it('should findAll payment methods', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                });

                it('should create a new paymentMethod', function() {
                    expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {});
                });

                it('should request a braintree client token', function() {
                    expect(PaymentService.getToken).toHaveBeenCalled();
                });

                describe('when the requests succeed', function() {
                    describe('when there are existing payment methods', function() {
                        beforeEach(function() {
                            paymentMethods = [
                                {
                                    id: 'pay-111'
                                },
                                {
                                    id: 'pay-222',
                                    default: true
                                },
                                {
                                    id: 'pay-333'
                                }
                            ];

                            $rootScope.$apply(function() {
                                paymentMethodDeferred.resolve(paymentMethod);
                                paymentMethodsDeferred.resolve(paymentMethods);
                                tokenDeferred.resolve('123-xyz');
                            });
                        });

                        it('should initialize deposit to null', function() {
                            expect(AddFundsModalService.model.deposit).toBe(null);
                        });

                        it('should set pending to false', function() {
                            expect(AddFundsModalService.model.pending).toBe(false);
                        });

                        it('should put token on the model', function() {
                            expect(AddFundsModalService.model.token).toBe('123-xyz');
                        });

                        it('should put the new method on the model', function() {
                            expect(AddFundsModalService.model.newMethod).toBe(paymentMethod);
                        });

                        it('should put the existing payment methods on the model', function() {
                            expect(AddFundsModalService.model.methods).toBe(paymentMethods);
                        });

                        it('should not show credit card form', function() {
                            expect(AddFundsModalService.model.showCreditCardForm).toBe(false);
                        });

                        it('should set the chosen method to the default payment method', function() {
                            expect(AddFundsModalService.model.chosenMethod).toBe(paymentMethods[1]);
                        });
                    });

                    describe('when there are no existing payment methods', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                paymentMethodDeferred.resolve(paymentMethod);
                                paymentMethodsDeferred.resolve(paymentMethods);
                                tokenDeferred.resolve('123-xyz');
                            });
                        });

                        it('should initialize deposit to null', function() {
                            expect(AddFundsModalService.model.deposit).toBe(null);
                        });

                        it('should set pending to false', function() {
                            expect(AddFundsModalService.model.pending).toBe(false);
                        });

                        it('should put token on the model', function() {
                            expect(AddFundsModalService.model.token).toBe('123-xyz');
                        });

                        it('should put the new method on the model', function() {
                            expect(AddFundsModalService.model.newMethod).toBe(paymentMethod);
                        });

                        it('should put the existing payment methods on the model', function() {
                            expect(AddFundsModalService.model.methods).toBe(paymentMethods);
                        });

                        it('should show credit card form', function() {
                            expect(AddFundsModalService.model.showCreditCardForm).toBe(true);
                        });

                        it('should set the chosen method to the default payment method', function() {
                            expect(AddFundsModalService.model.chosenMethod).toBe(undefined);
                        });
                    });
                });
            });

            describe('close()', function() {
                it('should resolve the promise returned by display()', function() {
                    var success = jasmine.createSpy('success()');

                    AddFundsModalService.display().then(success);

                    expect(success).not.toHaveBeenCalled();

                    $rootScope.$apply(function() {
                        AddFundsModalService.close();
                    });

                    expect(success).toHaveBeenCalled();
                });
            });
        });
    });
});