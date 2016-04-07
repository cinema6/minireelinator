define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignFundController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            $q,
            cinema6,
            PaymentService,
            CampaignService,
            SelfieCampaignFundCtrl;

        var paymentMethods,
            campaign,
            saveDeferred,
            summary;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                CampaignService = $injector.get('CampaignService');
            });

            PaymentService = {
                balance: {}
            };

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

            cState = {
                cParent: {
                    cName: 'Selfie:Campaign'
                },
                token: '1234-4321',
                newMethod: {
                    save: jasmine.createSpy('newMethod.save()').and.returnValue(saveDeferred.promise)
                },
                calculateBudgetChange: jasmine.createSpy('cState.calculateBudgetChange()').and.returnValue(100),
                _updateRequest: {},
                _campaign: {},
                campaign: {},
                schema: {},
            };

            spyOn(CampaignService, 'getCpv').and.returnValue(0.08);
            spyOn(CampaignService, 'getSummary').and.returnValue(summary);
            spyOn(c6State, 'goTo');

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieCampaignFundCtrl = $controller('SelfieCampaignFundController', {cState: cState, $scope: $scope, PaymentService: PaymentService});
            });
        });

        it('should exist', function() {
            expect(SelfieCampaignFundCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('depositError', function() {
                describe('when a minimum deposit is required', function() {
                    describe('when deposit is not set', function() {
                        it('should return 1', function() {
                            SelfieCampaignFundCtrl.minDeposit = 50;

                            SelfieCampaignFundCtrl.deposit = undefined;
                            expect(SelfieCampaignFundCtrl.depositError).toBe(1);

                            SelfieCampaignFundCtrl.deposit = undefined;
                            expect(SelfieCampaignFundCtrl.depositError).toBe(1);
                        });
                    });

                    describe('when deposit is less than minimum', function() {
                        it('should return 1', function() {

                        });
                    });

                    describe('when deposit is greater than or equal to minimum', function() {
                        it('should return false', function() {

                        });
                    });
                });

                describe('when a minimum deposit is not required', function() {

                });
            });
        });

        describe('methods', function() {
            describe('initWithModel()', function() {
                it('add the model and the token', function() {
                    spyOn(SelfieCampaignFundCtrl, 'calculateMinDeposit').and.returnValue(50);

                    SelfieCampaignFundCtrl.initWithModel({
                        paymentMethods: paymentMethods
                    });

                    expect(SelfieCampaignFundCtrl.paymentMethods).toBe(paymentMethods);
                    expect(SelfieCampaignFundCtrl.campaign).toBe(cState.campaign);
                    expect(SelfieCampaignFundCtrl._campaign).toBe(cState._campaign);
                    expect(SelfieCampaignFundCtrl._updateRequest).toBe(cState._updateRequest);
                    expect(SelfieCampaignFundCtrl.paymentMethod).toBe(paymentMethods[0]);
                    expect(SelfieCampaignFundCtrl.token).toBe(cState.token);
                    expect(SelfieCampaignFundCtrl.schema).toBe(cState.schema);
                    expect(SelfieCampaignFundCtrl.accounting).toBe(PaymentService.balance);
                    expect(SelfieCampaignFundCtrl.minDeposit).toEqual(50);
                    expect(SelfieCampaignFundCtrl.calculateMinDeposit).toHaveBeenCalled();
                    expect(SelfieCampaignFundCtrl.budgetChange).toEqual(100);
                    expect(cState.calculateBudgetChange).toHaveBeenCalled();
                    expect(SelfieCampaignFundCtrl).toEqual(jasmine.objectContaining(summary));
                    expect(SelfieCampaignFundCtrl.cpv).toEqual(0.08);
                    expect(SelfieCampaignFundCtrl.type).toEqual('creditcard');
                });
            });

            describe('calculateMinDeposit()', function() {
                describe('when budget change is greater than 0', function() {
                    describe('when availableFunds are less than budget change', function() {
                        it('should be the difference', function() {
                            cState.calculateBudgetChange.and.returnValue(100);
                            SelfieCampaignFundCtrl.accounting = {
                                remainingFunds: 20
                            };

                            expect(SelfieCampaignFundCtrl.calculateMinDeposit()).toEqual(80);
                        });
                    });

                    describe('when availableFunds are greater than budget change', function() {
                        it('should be the difference', function() {
                            cState.calculateBudgetChange.and.returnValue(100);
                            SelfieCampaignFundCtrl.accounting = {
                                remainingFunds: 200
                            };

                            expect(SelfieCampaignFundCtrl.calculateMinDeposit()).toEqual(0);
                        });
                    });
                });

                describe('when budget change is less than or equal to 0', function() {
                    it('should be 0', function() {
                        cState.calculateBudgetChange.and.returnValue(0);
                        SelfieCampaignFundCtrl.accounting = {
                            remainingFunds: 100
                        };

                        expect(SelfieCampaignFundCtrl.calculateMinDeposit()).toEqual(0);

                        cState.calculateBudgetChange.and.returnValue(-50);

                        expect(SelfieCampaignFundCtrl.calculateMinDeposit()).toEqual(0);
                    });
                });
            });

            describe('confirm()', function() {
                describe('when there is no paymentMethod', function() {
                    it('should set pending to true', function() {
                        SelfieCampaignFundCtrl.paymentMethod = undefined;

                        expect(SelfieCampaignFundCtrl.pending).toBeFalsy();

                        SelfieCampaignFundCtrl.confirm();

                        expect(SelfieCampaignFundCtrl.pending).toBe(true);
                    });
                });

                describe('when there is a paymentMethod', function() {
                    it('should ensure deposit is set and should go to Selfie:Campaign:Fund:Confirm state', function() {
                        SelfieCampaignFundCtrl.paymentMethod = paymentMethods[0];
                        SelfieCampaignFundCtrl.deposit = undefined;

                        SelfieCampaignFundCtrl.confirm();

                        expect(SelfieCampaignFundCtrl.deposit).toBe(0);
                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign:Fund:Confirm');
                    });
                });
            });

            describe('success(method)', function() {
                var braintreeObject;

                beforeEach(function() {
                    braintreeObject = {
                        cardholderName: 'Johnny Testmonkey',
                        nonce: '1234-4321'
                    };

                    SelfieCampaignFundCtrl.paymentMethodError = true;
                    SelfieCampaignFundCtrl.pending = true;

                    SelfieCampaignFundCtrl.newMethod = cState.newMethod;
                    SelfieCampaignFundCtrl.paymentMethods = paymentMethods;

                    $scope.$apply(function() {
                        SelfieCampaignFundCtrl.success(braintreeObject);
                    });
                });

                it('should add the cardholderName, nonce and makeDefault props to the model', function() {
                    expect(SelfieCampaignFundCtrl.newMethod).toEqual(jasmine.objectContaining({
                        cardholderName: braintreeObject.cardholderName,
                        paymentMethodNonce: braintreeObject.nonce
                    }));
                });

                it('should remove payment error flag', function() {
                    expect(SelfieCampaignFundCtrl.paymentMethodError).toBe(false);
                });

                it('should save the model', function() {
                    expect(SelfieCampaignFundCtrl.newMethod.save).toHaveBeenCalled();
                });

                describe('when save succeeds', function() {
                    describe('when type is creditCard', function() {
                        beforeEach(function() {
                            SelfieCampaignFundCtrl.newMethod.type = 'creditCard';

                            $rootScope.$apply(function() {
                                saveDeferred.resolve(SelfieCampaignFundCtrl.newMethod)
                            });
                        });

                        it('should add the method to the payment methods array and set it as the chosen payment method', function() {
                            expect(SelfieCampaignFundCtrl.paymentMethods).toContain(SelfieCampaignFundCtrl.newMethod);
                            expect(SelfieCampaignFundCtrl.paymentMethod).toBe(SelfieCampaignFundCtrl.newMethod);
                        });

                        it('should ensure that deposit is defaulted to 0 if undefined', function() {
                            expect(SelfieCampaignFundCtrl.deposit).toBe(0);
                        });

                        it('should go to the Selfie:Campaign:Fund:Confirm state', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign:Fund:Confirm');
                        });

                        it('should set pending to false', function() {
                            expect(SelfieCampaignFundCtrl.pending).toBe(false);
                        });
                    });

                    describe('when type is paypal', function() {
                        beforeEach(function() {
                            SelfieCampaignFundCtrl.newMethod.type = 'paypal';

                            $rootScope.$apply(function() {
                                saveDeferred.resolve(SelfieCampaignFundCtrl.newMethod)
                            });
                        });

                        it('should add the method to the payment methods array and set it as the chosen payment method', function() {
                            expect(SelfieCampaignFundCtrl.paymentMethods).toContain(SelfieCampaignFundCtrl.newMethod);
                            expect(SelfieCampaignFundCtrl.paymentMethod).toBe(SelfieCampaignFundCtrl.newMethod);
                        });

                        it('should ensure that deposit is defaulted to 0 if undefined', function() {
                            expect(SelfieCampaignFundCtrl.deposit).toBe(0);
                        });

                        it('should not go to the Selfie:Campaign:Fund:Confirm state', function() {
                            expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:Campaign:Fund:Confirm');
                        });

                        it('should set pending to false', function() {
                            expect(SelfieCampaignFundCtrl.pending).toBe(false);
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
                        expect(SelfieCampaignFundCtrl.paymentMethodError).toBe(true);
                    });

                    it('should set pending top false', function() {
                        expect(SelfieCampaignFundCtrl.pending).toBe(false);
                    });
                });
            });

            describe('cancel()', function() {
                it('should go to Selfie:Campaign state', function() {
                    SelfieCampaignFundCtrl.cancel();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign');
                });
            });

            describe('goBack()', function() {
                describe('when budget has not changed', function() {
                    it('should go to Selfie:Campaign state', function() {
                        cState.budgetHasChanged = false;

                        SelfieCampaignFundCtrl.goBack();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign');
                    });
                });

                describe('when budget has changed', function() {
                    it('should go to Selfie:Campaign:Fund:Deposit state', function() {
                        cState.budgetHasChanged = true;

                        SelfieCampaignFundCtrl.goBack();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaign:Fund:Deposit');
                    });
                });
            });

            describe('failure()', function() {
                it('should set pending to false', function() {
                    SelfieCampaignFundCtrl.pending = true;

                    SelfieCampaignFundCtrl.failure();

                    expect(SelfieCampaignFundCtrl.pending).toBe(false);
                });
            });
        });
    });
});