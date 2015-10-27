define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignPaymentController', function() {
        var $rootScope,
            $controller,
            $scope,
            $q,
            SelfieCampaignPaymentCtrl,
            ConfirmDialogService,
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
                ConfirmDialogService = $injector.get('ConfirmDialogService');
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

        describe('methods', function() {
            describe('paypalSuccess(method)', function() {
                var braintreeObject, savedMethod, saveDeferred;

                beforeEach(function() {
                    braintreeObject = {
                        nonce: '888-888-888'
                    };

                    savedMethod = {
                        token: '111-111-111',
                        email: 'selfie@gmail.com'
                    };

                    saveDeferred = $q.defer();

                    spyOn(newMethod, 'save').and.returnValue(saveDeferred.promise);

                    $scope.$apply(function() {
                        SelfieCampaignPaymentCtrl.paypalSuccess(braintreeObject);
                    });
                });

                it('should create a new payment method DB model', function() {
                    expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {
                        paymentMethodNonce: braintreeObject.nonce
                    });
                    expect(newMethod).toEqual(jasmine.objectContaining({
                        paymentMethodNonce: braintreeObject.nonce
                    }));
                });

                it('should save the new method', function() {
                    expect(newMethod.save).toHaveBeenCalled();
                });

                describe('if the save succeeds', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            saveDeferred.resolve(savedMethod);
                        });
                    });

                    it('should add the method to Campaign Ctl', function() {
                        expect($scope.SelfieCampaignCtrl.paymentMethods.indexOf(savedMethod) > -1).toBe(true);
                        expect(paymentMethods.indexOf(savedMethod) > -1).toBe(true);
                    });

                    it('should add the new method to the campaign', function() {
                        expect($scope.SelfieCampaignCtrl.campaign.paymentMethod).toBe(savedMethod.token);
                        expect(campaign.paymentMethod).toBe(savedMethod.token);
                    });
                });

                describe('if the save fails', function() {
                    it('should display a dialog', function() {
                        spyOn(ConfirmDialogService, 'display');

                        $scope.$apply(function() {
                            saveDeferred.reject({data: 'There was an error!'});
                        });

                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});