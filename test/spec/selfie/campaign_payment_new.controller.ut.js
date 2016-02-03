define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignPaymentNewController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            $q,
            cinema6,
            SelfieCampaignPaymentNewCtrl;

        var paymentMethods,
            campaign;

        function PaymentMethod(token) {
            var self = this;
            this.token = token;
            this.save = jasmine.createSpy('save()').and.returnValue($q.when(self));
            this.erase = jasmine.createSpy('erase()').and.returnValue($q.when(self));
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
            });

            paymentMethods = [
                new PaymentMethod('pay-111'),
                new PaymentMethod('pay-222'),
                new PaymentMethod('pay-333')
            ];

            campaign = {
                id: 'cam-111'
            };

            cState = {
                token: '1234-4321'
            };

            $scope = $rootScope.$new();
            $scope.SelfieCampaignCtrl = {
                paymentMethods: paymentMethods,
                campaign: campaign
            };
            $scope.$apply(function() {
                SelfieCampaignPaymentNewCtrl = $controller('SelfieCampaignPaymentNewController', {cState: cState, $scope: $scope});
            });
        });

        it('should exist', function() {
            expect(SelfieCampaignPaymentNewCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel()', function() {
                it('add the model and the token', function() {
                    var model = new PaymentMethod('pay-123');

                    SelfieCampaignPaymentNewCtrl.initWithModel(model);

                    expect(SelfieCampaignPaymentNewCtrl.model).toBe(model);
                    expect(SelfieCampaignPaymentNewCtrl.token).toBe(cState.token);
                    expect($scope.SelfieCampaignCtrl.pendingCreditCard).toBe(false);
                });
            });

            describe('success(method)', function() {
                var model, braintreeObject;

                beforeEach(function() {
                    model = new PaymentMethod('pay-444');

                    braintreeObject = {
                        cardholderName: 'Johnny Testmonkey',
                        nonce: '1234-4321',
                        makeDefault: false
                    };

                    spyOn(c6State, 'goTo');

                    SelfieCampaignPaymentNewCtrl.initWithModel(model);

                    $scope.$apply(function() {
                        SelfieCampaignPaymentNewCtrl.success(braintreeObject);
                    });
                });

                it('should add the cardholderName, nonce and makeDefault props to the model', function() {
                    expect(model).toEqual(jasmine.objectContaining({
                        cardholderName: braintreeObject.cardholderName,
                        paymentMethodNonce: braintreeObject.nonce,
                        makeDefault: braintreeObject.makeDefault
                    }));
                });

                it('should save the model', function() {
                    expect(model.save).toHaveBeenCalled();
                });

                it('should add the new method to the parent model', function() {
                    expect($scope.SelfieCampaignCtrl.paymentMethods.indexOf(model) > -1).toBe(true);
                });

                it('should set the paymentMethod on the campaign', function() {
                    expect(campaign.paymentMethod).toBe('pay-444');
                });

                it('should go to the Selfie:Campaign state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign');
                });
            });

            describe('cancel()', function() {
                it('should go to Selfie:Campaign state', function() {
                    spyOn(c6State, 'goTo');

                    SelfieCampaignPaymentNewCtrl.cancel();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign');
                });
            });
        });
    });
});