define(['app','angular'], function(appModule, angular) {
    'use strict';

    var copy = angular.copy;

    describe('CampaignFundingController', function() {
        var $rootScope,
            $controller,
            c6State,
            model,
            $scope,
            $q,
            cinema6,
            PaymentService,
            CampaignFundingService,
            CampaignFundingCtrl;

        var paymentMethods,
            campaign,
            saveDeferred,
            summary;

        var debouncedFns;

        beforeEach(function() {
            debouncedFns = [];

            module(appModule.name);
            module(function($provide) {
                $provide.decorator('c6AsyncQueue', function($delegate) {
                    return jasmine.createSpy('c6AsyncQueue()').and.callFake(function() {
                        var queue = $delegate.apply(this, arguments);
                        var debounce = queue.debounce;
                        spyOn(queue, 'debounce').and.callFake(function() {
                            var fn = debounce.apply(queue, arguments);
                            debouncedFns.push(fn);
                            return fn;
                        });
                        return queue;
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
            });

            paymentMethods = [
                {
                    token: 'pay-111',
                    default: true
                },
                {
                    token: 'pay-222'
                }
            ];

            campaign = {
                id: 'cam-111'
            };

            summary = {
                duration: 'Run until stopped'
            };

            saveDeferred = $q.defer();

            model = {
                token: '1234-4321',
                newMethod: {
                    save: jasmine.createSpy('newMethod.save()').and.returnValue(saveDeferred.promise)
                },
                isDraft: true,
                budgetChange: 80,
                campaign: {},
                schema: {},
                interests: {},
                skipDeposit: false,
                accounting: {},
                minDeposit: 80,
                paymentMethods: paymentMethods,
                paymentMethod: paymentMethods[0],
                onClose: jasmine.createSpy('onClose()'),
                onCancel: jasmine.createSpy('onCancel()'),
                onSuccess: jasmine.createSpy('onSuccess()')
            };

            CampaignFundingService = {
                model: model
            };

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                CampaignFundingCtrl = $controller('CampaignFundingController', {
                    CampaignFundingService: CampaignFundingService,
                    $scope: $scope
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            c6State = null;
            model = null;
            $scope = null;
            $q = null;
            cinema6 = null;
            PaymentService = null;
            CampaignFundingService = null;
            CampaignFundingCtrl = null;
            paymentMethods = null;
            campaign = null;
            saveDeferred = null;
            summary = null;
        });

        it('should exist', function() {
            expect(CampaignFundingCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the CampaignFundingService.model', function() {
                    expect(CampaignFundingCtrl.model).toBe(CampaignFundingService.model);
                });
            });

            describe('depositError', function() {
                describe('when a minimum deposit is required', function() {
                    describe('when deposit is not set', function() {
                        it('should return 1', function() {
                            CampaignFundingCtrl.model.minDeposit = 50;

                            CampaignFundingCtrl.model.deposit = undefined;
                            expect(CampaignFundingCtrl.depositError).toBe(1);

                            CampaignFundingCtrl.model.deposit = 60;
                            expect(CampaignFundingCtrl.depositError).toBe(false);
                        });
                    });

                    describe('when deposit is less than minimum', function() {
                        it('should return 1', function() {
                            CampaignFundingCtrl.model.minDeposit = 50;

                            CampaignFundingCtrl.model.deposit = 30;
                            expect(CampaignFundingCtrl.depositError).toBe(1);

                            CampaignFundingCtrl.model.deposit = 60;
                            expect(CampaignFundingCtrl.depositError).toBe(false);
                        });
                    });

                    describe('when deposit is greater than or equal to minimum', function() {
                        it('should return false', function() {
                            CampaignFundingCtrl.model.minDeposit = 50;

                            CampaignFundingCtrl.model.deposit = 30;
                            expect(CampaignFundingCtrl.depositError).toBe(1);

                            CampaignFundingCtrl.model.deposit = 50;
                            expect(CampaignFundingCtrl.depositError).toBe(false);

                            CampaignFundingCtrl.model.deposit = 50;
                            expect(CampaignFundingCtrl.depositError).toBe(false);
                        });
                    });
                });

                describe('when a minimum deposit is not required', function() {
                    describe('when deposit is less than 1', function() {
                        it('should return 2', function() {
                            CampaignFundingCtrl.model.minDeposit = 0;

                            CampaignFundingCtrl.model.deposit = 0.5;
                            expect(CampaignFundingCtrl.depositError).toBe(2);

                            CampaignFundingCtrl.model.deposit = 0;
                            expect(CampaignFundingCtrl.depositError).toBe(false);

                            CampaignFundingCtrl.model.deposit = 50;
                            expect(CampaignFundingCtrl.depositError).toBe(false);
                        });
                    });

                    describe('when deposit is undefined', function() {
                        it('should return false', function() {
                            CampaignFundingCtrl.model.minDeposit = 0;

                            CampaignFundingCtrl.model.deposit = undefined;
                            expect(CampaignFundingCtrl.depositError).toBe(false);

                            CampaignFundingCtrl.model.deposit = 0;
                            expect(CampaignFundingCtrl.depositError).toBe(false);

                            CampaignFundingCtrl.model.deposit = 50;
                            expect(CampaignFundingCtrl.depositError).toBe(false);
                        });
                    });
                });
            });
        });

        describe('methods', function() {
            describe('close()', function() {
                it('should go call model.onClose()', function() {
                    CampaignFundingCtrl.paymentError = true;
                    CampaignFundingCtrl.model.show = true;

                    CampaignFundingCtrl.close();

                    expect(CampaignFundingCtrl.paymentError).toBe(false);
                    expect(CampaignFundingCtrl.model.show).toBe(false);
                    expect(model.onClose).toHaveBeenCalled();
                });
            });

            describe('cancel()', function() {
                it('should go call model.onCancel()', function() {
                    CampaignFundingCtrl.paymentError = true;
                    CampaignFundingCtrl.model.show = true;

                    CampaignFundingCtrl.cancel();

                    expect(CampaignFundingCtrl.paymentError).toBe(false);
                    expect(CampaignFundingCtrl.model.show).toBe(false);
                    expect(model.onCancel).toHaveBeenCalled();
                });
            });

            describe('confirm()', function() {
                var paymentDeferred, successDeferred;

                beforeEach(function() {
                    paymentDeferred = $q.defer();
                    successDeferred = $q.defer();

                    spyOn(PaymentService, 'makePayment').and.returnValue(paymentDeferred.promise);
                    CampaignFundingCtrl.model.onSuccess.and.returnValue(successDeferred.promise);

                    CampaignFundingCtrl.paymentError = false;
                    CampaignFundingCtrl.confirmationPending = false;
                    CampaignFundingCtrl.model.show = true;
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(CampaignFundingCtrl.confirm);
                });

                describe('when making a deposit', function() {
                    it('should make a payment', function() {
                        CampaignFundingCtrl.model.deposit = 1278;

                        CampaignFundingCtrl.confirm();

                        expect(CampaignFundingCtrl.confirmationPending).toBe(true);
                        expect(PaymentService.makePayment).toHaveBeenCalledWith('pay-111', 1278);
                    });
                });

                describe('when not making a deposit', function() {
                    it('should make a payment', function() {
                        CampaignFundingCtrl.model.deposit = 0;

                        CampaignFundingCtrl.confirm();

                        expect(CampaignFundingCtrl.confirmationPending).toBe(true);
                        expect(PaymentService.makePayment).not.toHaveBeenCalledWith('pay-111', 1278);
                    });
                });

                describe('when payment succeeds', function() {
                    beforeEach(function() {
                        CampaignFundingCtrl.model.deposit = 50;

                        CampaignFundingCtrl.confirm();

                        $scope.$apply(function() {
                            paymentDeferred.resolve();
                        });
                    });

                    it('should call model.onSuccess()', function() {
                        expect(CampaignFundingCtrl.model.onSuccess).toHaveBeenCalled();
                    });

                    describe('when onSuccess succeeds', function() {
                        it('should set model.show  and confirmationPending flag to false', function() {
                            $scope.$apply(function() {
                                successDeferred.resolve();
                            });

                            expect(CampaignFundingCtrl.model.show).toBe(false);
                            expect(CampaignFundingCtrl.confirmationPending).toBe(false);
                        });
                    });

                    describe('when onSuccess fails', function() {
                        it('should set model.show to false', function() {
                            $scope.$apply(function() {
                                successDeferred.reject();
                            });

                            expect(CampaignFundingCtrl.model.show).toBe(false);
                            expect(CampaignFundingCtrl.confirmationPending).toBe(false);
                        });
                    });
                });

                describe('when payment fails', function() {
                    beforeEach(function() {
                        CampaignFundingCtrl.model.deposit = 50;

                        CampaignFundingCtrl.confirm();

                        $scope.$apply(function() {
                            paymentDeferred.reject();
                        });
                    });

                    it('should set paymentError to true', function() {
                        expect(CampaignFundingCtrl.paymentError).toBe(true);
                    });

                    it('should set confirmationPending to false', function() {
                        expect(CampaignFundingCtrl.confirmationPending).toBe(false);
                    });
                });
            });

            describe('nextStep()', function() {
                describe('when showCreditCardForm is true', function() {
                    it('should set newMethodPending to true', function() {
                        CampaignFundingCtrl.model.showCreditCardForm = true;

                        expect(CampaignFundingCtrl.newMethodPending).toBeFalsy();

                        CampaignFundingCtrl.nextStep();

                        expect(CampaignFundingCtrl.newMethodPending).toBe(true);
                    });
                });

                describe('when showCreditCardForm is false', function() {
                    it('should ensure deposit is set and should set showDepositView to false', function() {
                        CampaignFundingCtrl.model.showCreditCardForm = false;
                        CampaignFundingCtrl.model.showDepositView = true;
                        CampaignFundingCtrl.model.deposit = undefined;

                        CampaignFundingCtrl.nextStep();

                        expect(CampaignFundingCtrl.model.deposit).toBe(0);
                        expect(CampaignFundingCtrl.model.showDepositView).toBe(false);
                    });
                });
            });

            describe('successfulPaymentMethod(method)', function() {
                var braintreeObject, newMethod, savedMethod;

                beforeEach(function() {
                    braintreeObject = {
                        cardholderName: 'Johnny Testmonkey',
                        nonce: '1234-4321'
                    };

                    CampaignFundingCtrl.paymentMethodError = true;
                    CampaignFundingCtrl.newMethodPending = true;
                    CampaignFundingCtrl.model.showCreditCardForm = true;
                    CampaignFundingCtrl.model.showDepositView = true;

                    CampaignFundingCtrl.model.newMethod = model.newMethod;
                    CampaignFundingCtrl.model.paymentMethods = paymentMethods;

                    newMethod = {};
                    spyOn(cinema6.db, 'create').and.returnValue(newMethod);
                    savedMethod = copy(CampaignFundingCtrl.model.newMethod);

                    $scope.$apply(function() {
                        CampaignFundingCtrl.successfulPaymentMethod(braintreeObject);
                    });
                });

                it('should add the cardholderName, nonce and makeDefault props to the model', function() {
                    expect(CampaignFundingCtrl.model.newMethod).toEqual(jasmine.objectContaining({
                        cardholderName: braintreeObject.cardholderName,
                        paymentMethodNonce: braintreeObject.nonce
                    }));
                });

                it('should remove payment error flag', function() {
                    expect(CampaignFundingCtrl.paymentMethodError).toBe(false);
                });

                it('should save the model', function() {
                    expect(CampaignFundingCtrl.model.newMethod.save).toHaveBeenCalled();
                });

                describe('when save succeeds', function() {
                    describe('when type is creditCard', function() {
                        beforeEach(function() {
                            savedMethod.type = 'creditCard';

                            $rootScope.$apply(function() {
                                saveDeferred.resolve(savedMethod);
                            });
                        });

                        it('should set showCreditCardForm to false', function() {
                            expect(CampaignFundingCtrl.model.showCreditCardForm).toBe(false);
                        });

                        it('should create a new payment method and add it to Ctrl', function() {
                            expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {});
                            expect(CampaignFundingCtrl.model.newMethod).toBe(newMethod);
                        });

                        it('should add the method to the payment methods array and set it as the chosen payment method', function() {
                            expect(CampaignFundingCtrl.model.paymentMethods).toContain(savedMethod);
                            expect(CampaignFundingCtrl.model.paymentMethod).toBe(savedMethod);
                        });

                        it('should ensure that deposit is defaulted to 0 if undefined', function() {
                            expect(CampaignFundingCtrl.model.deposit).toBe(0);
                        });

                        it('should set showDepositView to false', function() {
                            expect(CampaignFundingCtrl.model.showDepositView).toBe(false);
                        });

                        it('should set newMethodPending to false', function() {
                            expect(CampaignFundingCtrl.newMethodPending).toBe(false);
                        });
                    });

                    describe('when type is paypal', function() {
                        beforeEach(function() {
                            savedMethod.type = 'paypal';

                            $rootScope.$apply(function() {
                                saveDeferred.resolve(savedMethod);
                            });
                        });

                        it('should set showCreditCardForm to false', function() {
                            expect(CampaignFundingCtrl.model.showCreditCardForm).toBe(false);
                        });

                        it('should create a new payment method and add it to Ctrl', function() {
                            expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {});
                            expect(CampaignFundingCtrl.model.newMethod).toBe(newMethod);
                        });

                        it('should add the method to the payment methods array and set it as the chosen payment method', function() {
                            expect(CampaignFundingCtrl.model.paymentMethods).toContain(savedMethod);
                            expect(CampaignFundingCtrl.model.paymentMethod).toBe(savedMethod);
                        });

                        it('should ensure that deposit is defaulted to 0 if undefined', function() {
                            expect(CampaignFundingCtrl.model.deposit).toBe(0);
                        });

                        it('should not set showDepositView to false', function() {
                            expect(CampaignFundingCtrl.model.showDepositView).toBe(true);
                        });

                        it('should set newMethodPending to false', function() {
                            expect(CampaignFundingCtrl.newMethodPending).toBe(false);
                        });
                    });
                });

                describe('when save fails', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            saveDeferred.reject();
                        });
                    });

                    it('should set payment error flag', function() {
                        expect(CampaignFundingCtrl.paymentMethodError).toBe(true);
                    });

                    it('should set newMethodPending top false', function() {
                        expect(CampaignFundingCtrl.newMethodPending).toBe(false);
                    });
                });
            });

            describe('goBack()', function() {
                beforeEach(function() {
                    spyOn(CampaignFundingCtrl, 'cancel');
                });

                describe('when budget has not changed', function() {
                    it('should call cancel()', function() {
                        CampaignFundingCtrl.model.skipDeposit = true;

                        CampaignFundingCtrl.goBack();

                        expect(CampaignFundingCtrl.cancel).toHaveBeenCalled();
                    });
                });

                describe('when budget has changed', function() {
                    it('should set showDepositView to true', function() {
                        CampaignFundingCtrl.model.skipDeposit = false;
                        CampaignFundingCtrl.model.showDepositView = false;

                        CampaignFundingCtrl.goBack();

                        expect(CampaignFundingCtrl.cancel).not.toHaveBeenCalled();
                        expect(CampaignFundingCtrl.model.showDepositView).toBe(true);
                    });
                });
            });

            describe('failedPaymentmethod()', function() {
                it('should set pending to false', function() {
                    CampaignFundingCtrl.newMethodPending = true;

                    CampaignFundingCtrl.failedPaymentmethod();

                    expect(CampaignFundingCtrl.newMethodPending).toBe(false);
                });
            });
        });
    });
});
