define(['app','angular'], function(appModule, angular) {
    'use strict';

    var copy = angular.copy;

    describe('AddFundsModalController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            cinema6,
            PaymentService,
            AddFundsModalService,
            AddFundsModalCtrl;

        var model,
            newMethod;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                AddFundsModalCtrl = $controller('AddFundsModalController', { $scope: $scope, AddFundsModalService: AddFundsModalService });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
                AddFundsModalService = $injector.get('AddFundsModalService');
            });

            model = {
                show: true,
                deposit: null,
                pending: false,
                token: '123-xyz',
                newMethod: cinema6.db.create('paymentMethod', {}),
                methods: [],
                showCreditCardForm: true,
                chosenMethod: undefined
            };

            AddFundsModalService = {
                model: model,
                resolve: jasmine.createSpy('resolve()'),
                cancel: jasmine.createSpy('cancel()')
            };

            compileCtrl();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            $q = null;
            cinema6 = null;
            PaymentService = null;
            AddFundsModalService = null;
            AddFundsModalCtrl = null;
            model = null;
            newMethod = null;
        });

        it('should exist', function() {
            expect(AddFundsModalCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('newPaymentType', function() {
                it('should be "creditcard"', function() {
                    expect(AddFundsModalCtrl.newPaymentType).toBe('creditcard');
                });
            });

            describe('model', function() {
                it('should be the model from the AddFundsModalService', function() {
                    expect(AddFundsModalCtrl.model).toBe(AddFundsModalService.model);
                });
            });

            describe('canSubmit', function() {
                describe('when there is no chosen method', function() {
                    it('should be false', function() {
                        AddFundsModalCtrl.model.methods.push({});
                        AddFundsModalCtrl.model.methods.push({});
                        AddFundsModalCtrl.model.deposit = 50;

                        AddFundsModalCtrl.model.chosenMethod = undefined;
                        expect(AddFundsModalCtrl.canSubmit).toBe(false);

                        AddFundsModalCtrl.model.chosenMethod = {};
                        expect(AddFundsModalCtrl.canSubmit).toBe(true);
                    });
                });

                describe('when there are no methods to choose from', function() {
                    it('should be true so the credit card form can be submitted', function() {
                        AddFundsModalCtrl.model.chosenMethod = undefined;
                        AddFundsModalCtrl.model.deposit = 50;

                        AddFundsModalCtrl.model.methods = [];
                        expect(AddFundsModalCtrl.canSubmit).toBe(true);

                        AddFundsModalCtrl.model.methods = [{}];
                        expect(AddFundsModalCtrl.canSubmit).toBe(false);
                    });
                });

                describe('when deposit is not defined or is less than 1', function() {
                    it('should be false', function() {
                        AddFundsModalCtrl.model.methods.push({});
                        AddFundsModalCtrl.model.chosenMethod = {};

                        AddFundsModalCtrl.model.deposit = null;
                        expect(AddFundsModalCtrl.canSubmit).toBe(false);

                        AddFundsModalCtrl.model.deposit = 10;
                        expect(AddFundsModalCtrl.canSubmit).toBe(true);

                        AddFundsModalCtrl.model.deposit = 0.25;
                        expect(AddFundsModalCtrl.canSubmit).toBe(false);

                        AddFundsModalCtrl.model.deposit = 1;
                        expect(AddFundsModalCtrl.canSubmit).toBe(true);
                    });
                });
            });

            describe('validDeposit', function() {
                describe('when deposit is not set', function() {
                    it('should be true', function() {
                        AddFundsModalCtrl.model.deposit = null;

                        expect(AddFundsModalCtrl.validDeposit).toBe(true);
                    });
                });

                describe('when deposit is 0', function() {
                    it('should be false', function() {
                        AddFundsModalCtrl.model.deposit = 0;

                        expect(AddFundsModalCtrl.validDeposit).toBe(false);
                    });
                });

                describe('when deposit is > 1', function() {
                    it('should be false', function() {
                        AddFundsModalCtrl.model.deposit = 0.25;

                        expect(AddFundsModalCtrl.validDeposit).toBe(false);
                    });
                });

                describe('when deposit is <= 1', function() {
                    it('should be true', function() {
                        AddFundsModalCtrl.model.deposit = 1;

                        expect(AddFundsModalCtrl.validDeposit).toBe(true);

                        AddFundsModalCtrl.model.deposit = 100;

                        expect(AddFundsModalCtrl.validDeposit).toBe(true);
                    });
                });
            });
        });

        describe('methods', function() {
            describe('makeDeposit()', function() {
                beforeEach(function() {
                    spyOn(AddFundsModalCtrl, 'makePayment');
                });

                describe('when credit card form is visible', function() {
                    it('should set the pending confirmation flag to true because credit form is being submitted to braintree', function() {
                        AddFundsModalCtrl.model.showCreditCardForm = true;
                        AddFundsModalCtrl.pendingConfirmation = false;

                        AddFundsModalCtrl.makeDeposit();

                        expect(AddFundsModalCtrl.pendingConfirmation).toBe(true);
                        expect(AddFundsModalCtrl.makePayment).not.toHaveBeenCalled();
                    });
                });

                describe('when credit card form is not in view', function() {
                    it('should make the payment', function() {
                        AddFundsModalCtrl.model.showCreditCardForm = false;
                        AddFundsModalCtrl.pendingConfirmation = false;

                        AddFundsModalCtrl.makeDeposit();

                        expect(AddFundsModalCtrl.pendingConfirmation).toBe(true);
                        expect(AddFundsModalCtrl.makePayment).toHaveBeenCalled();
                    });
                });
            });

            describe('makePayment()', function() {
                var paymentDeferred, balanceDeferred;

                beforeEach(function() {
                    paymentDeferred = $q.defer();
                    balanceDeferred = $q.defer();

                    spyOn(PaymentService, 'makePayment').and.returnValue(paymentDeferred.promise);
                    spyOn(PaymentService, 'getBalance').and.returnValue(balanceDeferred.promise);
                    spyOn(AddFundsModalCtrl, 'resolve');

                    AddFundsModalCtrl.model.chosenMethod = { token: 'my-default-method' };
                    AddFundsModalCtrl.model.deposit = 50;

                    AddFundsModalCtrl.makePayment();
                });

                it('should make a payment', function() {
                    expect(PaymentService.makePayment).toHaveBeenCalledWith('my-default-method', 50);
                });

                describe('when payment resolves', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            paymentDeferred.resolve();
                        });
                    });

                    it('should refetch account balance', function() {
                        expect(PaymentService.getBalance).toHaveBeenCalled();
                    });

                    it('should close the modal regardless of balance check request', function() {
                        it('should close the modal', function() {
                            expect(AddFundsModalCtrl.resolve).toHaveBeenCalled();
                            expect(AddFundsModalCtrl.pendingConfirmation).toBe(false);
                            expect(AddFundsModalCtrl.paymentMethodError).toBeFalsy();
                        });
                    });

                    describe('when balance is resolved', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                balanceDeferred.resolve();
                            });
                        });

                        it('should close the modal', function() {
                            expect(AddFundsModalCtrl.resolve).toHaveBeenCalled();
                            expect(AddFundsModalCtrl.pendingConfirmation).toBe(false);
                            expect(AddFundsModalCtrl.paymentMethodError).toBeFalsy();
                        });
                    });
                });

                describe('when payment fails', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            paymentDeferred.reject();
                        });
                    });

                    it('should not refetch account balance', function() {
                        expect(PaymentService.getBalance).not.toHaveBeenCalled();
                    });

                    it('should not close the modal', function() {
                        expect(AddFundsModalCtrl.resolve).not.toHaveBeenCalled();
                    });

                    it('should set pending confirmation to false', function() {
                        expect(AddFundsModalCtrl.pendingConfirmation).toBe(false);
                    });

                    it('should set paymentMethodError to true', function() {
                        expect(AddFundsModalCtrl.paymentMethodError).toBe(true);
                    });
                });
            });

            describe('addCreditCard()', function() {
                it('should set newPaymentType to "creditcard" and show credit card form', function() {
                    AddFundsModalCtrl.newPaymentType = 'paypal';
                    AddFundsModalCtrl.model.showCreditCardForm = false;

                    AddFundsModalCtrl.addCreditCard();
                    expect(AddFundsModalCtrl.newPaymentType).toBe('creditcard');
                    expect(AddFundsModalCtrl.model.showCreditCardForm).toBe(true);
                });
            });

            describe('success(method)', function() {
                var saveDeferred, makePaymentDeferred, savedMethod, newMethod;

                beforeEach(function() {
                    makePaymentDeferred = $q.defer();
                    saveDeferred = $q.defer();
                    newMethod = {};

                    spyOn(AddFundsModalCtrl.model.newMethod, 'save').and.returnValue(saveDeferred.promise);
                    spyOn(AddFundsModalCtrl, 'makePayment').and.returnValue(makePaymentDeferred.promise);
                    spyOn(cinema6.db, 'create').and.returnValue(newMethod);

                    savedMethod = copy(AddFundsModalCtrl.model.newMethod);

                    AddFundsModalCtrl.model.showCreditCardForm = true;
                    AddFundsModalCtrl.paymentMethodError = false;
                    AddFundsModalCtrl.pendingConfirmation = true;

                    AddFundsModalCtrl.success({
                        cardholderName: 'Sammy Selfie',
                        nonce: '123-xyz'
                    });
                });

                it('should add cardholderName and paymentMethodNonce to the new method', function() {
                    expect(AddFundsModalCtrl.model.newMethod.cardholderName).toBe('Sammy Selfie');
                    expect(AddFundsModalCtrl.model.newMethod.paymentMethodNonce).toBe('123-xyz');
                });

                it('should save the newMethod', function() {
                    expect(AddFundsModalCtrl.model.newMethod.save).toHaveBeenCalled();
                });

                describe('when the save resolves but can not be submitted yet', function() {
                    beforeEach(function() {
                        savedMethod.type = undefined;

                        $scope.$apply(function() {
                            saveDeferred.resolve(savedMethod);
                        });
                    });

                    it('should hide credit card form', function() {
                        expect(AddFundsModalCtrl.model.showCreditCardForm).toBe(false);
                    });

                    it('should add newMethod to the existing methods array', function() {
                        expect(AddFundsModalCtrl.model.methods).toContain(savedMethod);
                    });

                    it('should make newMethod the chosen method', function() {
                        expect(AddFundsModalCtrl.model.chosenMethod).toBe(savedMethod);
                    });

                    it('should create a new method', function() {
                        expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {});
                        expect(AddFundsModalCtrl.model.newMethod).toEqual(newMethod);
                    });

                    it('should not make the payment', function() {
                        expect(AddFundsModalCtrl.makePayment).not.toHaveBeenCalled();
                    });
                });

                describe('when the save resolves and it is a credit card and user can submit', function() {
                    beforeEach(function() {
                        savedMethod.type = 'creditCard';
                        AddFundsModalCtrl.model.deposit = 100;

                        $scope.$apply(function() {
                            saveDeferred.resolve(savedMethod);
                        });
                    });

                    it('should make the payment', function() {
                        expect(AddFundsModalCtrl.makePayment).toHaveBeenCalled();
                    });

                    describe('when payment resolves', function() {
                        it('should set pendingConfirmation to false', function() {
                            $scope.$apply(function() {
                                makePaymentDeferred.resolve();
                            });

                            expect(AddFundsModalCtrl.pendingConfirmation).toBe(false);
                            expect(AddFundsModalCtrl.paymentMethodError).toBe(false);
                        });
                    });

                    describe('when payment fails', function() {
                        it('should set pendingConfirmation to false', function() {
                            $scope.$apply(function() {
                                makePaymentDeferred.reject();
                            });

                            expect(AddFundsModalCtrl.pendingConfirmation).toBe(false);
                            expect(AddFundsModalCtrl.paymentMethodError).toBe(true);
                        });
                    });
                });

                describe('when save fails', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            saveDeferred.reject();
                        });
                    });

                    it('should set paymentMethodError to true', function() {
                        expect(AddFundsModalCtrl.paymentMethodError).toBe(true);
                    });

                    it('should not hide credit card form', function() {
                        expect(AddFundsModalCtrl.model.showCreditCardForm).toBe(true);
                    });

                    it('should not add newMethod to the existing methods array', function() {
                        expect(AddFundsModalCtrl.model.methods).not.toContain(savedMethod);
                    });

                    it('should not make newMethod the chosen method', function() {
                        expect(AddFundsModalCtrl.chosenMethod).not.toBe(savedMethod);
                    });

                    it('should not create a new method', function() {
                        expect(cinema6.db.create).not.toHaveBeenCalledWith('paymentMethod', {});
                        expect(AddFundsModalCtrl.model.newMethod).not.toEqual(newMethod);
                    });

                    it('should not make the payment', function() {
                        expect(AddFundsModalCtrl.makePayment).not.toHaveBeenCalled();
                    });
                });
            });

            describe('failure()', function() {
                it('should set pendingConfirmation to false', function() {
                    AddFundsModalCtrl.pendingConfirmation = true;

                    AddFundsModalCtrl.failure();

                    expect(AddFundsModalCtrl.pendingConfirmation).toBe(false);
                });
            });

            describe('resolve()', function() {
                it('should close the modal and resolve the service', function() {
                    spyOn(AddFundsModalCtrl, 'close');

                    AddFundsModalCtrl.resolve();

                    expect(AddFundsModalCtrl.close).toHaveBeenCalled();
                    expect(AddFundsModalService.resolve).toHaveBeenCalled();
                });
            });

            describe('cancel()', function() {
                it('should close the modal and cancel the service', function() {
                    spyOn(AddFundsModalCtrl, 'close');

                    AddFundsModalCtrl.cancel();

                    expect(AddFundsModalCtrl.close).toHaveBeenCalled();
                    expect(AddFundsModalService.cancel).toHaveBeenCalled();
                });
            });

            describe('close()', function() {
                it('should hide modal, reset error and pending flags and close the modal', function() {
                    AddFundsModalCtrl.model.show = true;
                    AddFundsModalCtrl.paymentMethodError = true;
                    AddFundsModalCtrl.pendingConfirmation = true;

                    AddFundsModalCtrl.close();

                    expect(AddFundsModalCtrl.model.show).toBe(false);
                    expect(AddFundsModalCtrl.paymentMethodError).toBe(false);
                    expect(AddFundsModalCtrl.pendingConfirmation).toBe(false);
                });
            });
        });
    });
});
