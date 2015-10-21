define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignPaymentController', function() {
        var $rootScope,
            $controller,
            $scope,
            $q,
            SelfieCampaignPaymentCtrl,
            PaymentService,
            cinema6;

        var paymentMethods,
            campaign,
            newMethod;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCampaignPaymentCtrl = $controller('SelfieCampaignPaymentController', { $scope: $scope });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                PaymentService = $injector.get('PaymentService');
                cinema6 = $injector.get('cinema6');

                campaign = {
                    id: 'cam-123'
                };
                paymentMethods = [
                    {
                        id: 'pay-1',
                        token: 'pay-1'
                    },
                    {
                        id: 'pay-2',
                        token: 'pay-2'
                    },
                    {
                        id: 'pay-3',
                        token: 'pay-3'
                    }
                ];
                newMethod = cinema6.db.create('paymentMethod');

                spyOn(cinema6.db, 'create').and.callFake(function(type, data) {
                    newMethod.paymentMethodNonce = data.paymentMethodNonce;
                    newMethod.cardholderName = data.cardholderName;
                    newMethod.makeDefault = data.makeDefault;

                    return newMethod;
                });
                spyOn(PaymentService, 'getToken').and.returnValue($q.when('1234-4321'));

                $scope = $rootScope.$new();
                $scope.SelfieCampaignCtrl = {
                    paymentMethods: paymentMethods,
                    campaign: campaign
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignPaymentCtrl).toEqual(jasmine.any(Object));
        });

        it('should get a token for Paypal button and put it on the Ctrl', function() {
            expect(PaymentService.getToken).toHaveBeenCalled();
            expect(SelfieCampaignPaymentCtrl.paypalToken).toBe('1234-4321');
        });

        describe('methods', function() {
            describe('addCard()', function() {
                beforeEach(function() {
                    PaymentService.getToken.calls.reset();

                    $scope.$apply(function() {
                        SelfieCampaignPaymentCtrl.addCard();
                    });
                });

                it('should get a token for the credit card modal', function() {
                    expect(PaymentService.getToken).toHaveBeenCalled();
                });

                it('when token is fetched it should be added to the Ctrl and show the modal', function() {
                    expect(SelfieCampaignPaymentCtrl.creditCardToken).toBe('1234-4321');
                    expect(SelfieCampaignPaymentCtrl.showModal).toBe(true);
                });
            });

            describe('cancel()', function() {
                it('should hide the modal', function() {
                    SelfieCampaignPaymentCtrl.showModal = true;

                    SelfieCampaignPaymentCtrl.cancel();

                    expect(SelfieCampaignPaymentCtrl.showModal).toBe(false);
                });
            });

            describe('success(method)', function() {
                var braintreeObject, savedMethod;

                beforeEach(function() {
                    braintreeObject = {
                        nonce: '888-888-888',
                        cardholderName: 'Johnny Testmonkey',
                        makeDefault: true
                    };

                    savedMethod = {
                        token: '111-111-111',
                        cardholderName: 'Johnny Testmonkey',
                        default: true,
                        last4: '1234'
                    };

                    spyOn(newMethod, 'save').and.returnValue($q.when(savedMethod));

                    $scope.$apply(function() {
                        SelfieCampaignPaymentCtrl.success(braintreeObject);
                    });
                });

                it('should create a new payment method DB model', function() {
                    expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {
                        paymentMethodNonce: braintreeObject.nonce,
                        cardholderName: braintreeObject.cardholderName,
                        makeDefault: braintreeObject.makeDefault
                    });
                    expect(newMethod).toEqual(jasmine.objectContaining({
                        paymentMethodNonce: braintreeObject.nonce,
                        cardholderName: braintreeObject.cardholderName,
                        makeDefault: braintreeObject.makeDefault
                    }));
                });

                it('should save the new method', function() {
                    expect(newMethod.save).toHaveBeenCalled();
                });

                it('should add the method to Campaign Ctl', function() {
                    expect($scope.SelfieCampaignCtrl.paymentMethods.indexOf(savedMethod) > -1).toBe(true);
                    expect(paymentMethods.indexOf(savedMethod) > -1).toBe(true);
                });

                it('should add the new method to the campaign', function() {
                    expect($scope.SelfieCampaignCtrl.campaign.paymentMethod).toBe(savedMethod.token);
                    expect(campaign.paymentMethod).toBe(savedMethod.token);
                });

                it('should remove the modal', function() {
                    expect(SelfieCampaignPaymentCtrl.showModal).toBe(false);
                });
            });
        });
    });
});