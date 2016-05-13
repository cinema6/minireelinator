define(['app'], function(appModule) {
    'use strict';

    describe('CampaignFundingService', function() {
        var c6State,
            $rootScope,
            $q,
            CampaignFundingService,
            cinema6,
            CampaignService,
            PaymentService,
            paymentModel,
            paymentMethods,
            SelfieState;

        var success,
            failure,
            paymentMethodsDeferred,
            creditCheckDeferred,
            summary,
            balance,
            token;

        var campaign,
            originalCampaign,
            updateRequest,
            schema,
            interests,
            onClose,
            onCancel,
            onSuccess;

        function initFund() {
            CampaignFundingService.fund({
                onClose: onClose,
                onCancel: onCancel,
                onSuccess: onSuccess,
                originalCampaign: originalCampaign,
                updateRequest: updateRequest,
                campaign: campaign,
                interests: interests,
                schema: schema
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');

                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
                CampaignService = $injector.get('CampaignService');
                CampaignFundingService = $injector.get('CampaignFundingService');
            });

            paymentMethods = [];
            paymentMethodsDeferred = $q.defer();
            paymentModel = cinema6.db.create('paymentMethod', {});
            creditCheckDeferred = $q.defer();
            summary = {};
            balance = {};
            token = '1234-4321';

            success = jasmine.createSpy('success');
            failure = jasmine.createSpy('failure');

            spyOn(c6State, 'goTo');
            spyOn(cinema6.db, 'create').and.returnValue(paymentModel);
            spyOn(cinema6.db, 'findAll').and.returnValue(paymentMethodsDeferred.promise);
            spyOn(PaymentService, 'getToken').and.returnValue($q.when(token));
            spyOn(PaymentService, 'getBalance').and.returnValue($q.when(balance));
            spyOn(PaymentService, 'creditCheck').and.returnValue(creditCheckDeferred.promise);
            spyOn(CampaignService, 'getSummary').and.returnValue(summary);
            spyOn(CampaignService, 'getCpv').and.returnValue(0.05);

            SelfieState = c6State.get('Selfie');
            SelfieState.cModel = {
                entitlements: {
                    paymentOptional: false
                }
            };

            interests = [];
            updateRequest = undefined;
            originalCampaign = {
                id: 'cam-123',
                org: 'org-123',
                status: 'draft',
                pricing: {
                    budget: 50
                }
            };
            campaign = {
                pricing: {
                    budget: 100
                }
            };
            schema = {};
            onClose = jasmine.createSpy('onClose()');
            onCancel = jasmine.createSpy('onCancel()');
            onSuccess = jasmine.createSpy('onSuccess()');
        });

        it('should exist', function() {
            expect(CampaignFundingService).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be a computed property', function() {
                    expect(CampaignFundingService.model).toEqual({});

                    expect(function() {
                        CampaignFundingService.model = {};
                    }).toThrow();
                });
            });
        });

        describe('fund(config)', function() {
            describe('setting props model props', function() {
                it('should default some values', function() {
                    initFund();

                    expect(CampaignFundingService.model.campaign).toBe(campaign);
                    expect(CampaignFundingService.model.updateRequest).toBe(updateRequest);
                    expect(CampaignFundingService.model.originalCampaign).toBe(originalCampaign);
                    expect(CampaignFundingService.model.schema).toBe(schema);
                    expect(CampaignFundingService.model.interests).toBe(interests);
                    expect(CampaignFundingService.model.onCancel).toBe(onCancel);
                    expect(CampaignFundingService.model.onClose).toBe(onClose);
                    expect(CampaignFundingService.model.onSuccess).toBe(onSuccess);

                    expect(CampaignFundingService.model.show).toBe(true);
                    expect(CampaignFundingService.model.loading).toBe(true);
                    expect(CampaignFundingService.model.showDepositView).toBe(true);
                    expect(CampaignFundingService.model.newPaymentType).toBe('creditcard');
                });

                describe('model.isDraft', function() {
                    it('should be true if original campaign is a draft', function() {
                        originalCampaign.status = 'draft';

                        initFund();

                        expect(CampaignFundingService.model.isDraft).toBe(true);
                    });

                    it('should be false if original campaign is not a draft', function() {
                        originalCampaign.status = 'pending';

                        initFund();

                        expect(CampaignFundingService.model.isDraft).toBe(false);
                    });
                });

                describe('model.newBudget', function() {
                    it('should be the new campaign budget', function() {
                        campaign.pricing.budget = 5156;
                        originalCampaign.pricing.budget = 111;

                        initFund();

                        expect(CampaignFundingService.model.newBudget).toBe(5156);
                    });
                });

                describe('model.oldBudget', function() {
                    describe('when there is an updateRequest', function() {
                        it('should be the budget on the updateRequest', function() {
                            updateRequest = {
                                data: {
                                    id: 'cam-123',
                                    pricing: {
                                        budget: 1256
                                    }
                                }
                            };
                            campaign.pricing.budget = 111;

                            initFund();

                            expect(CampaignFundingService.model.oldBudget).toBe(1256);
                        });
                    });

                    describe('when there is not an updateRequest', function() {
                        it('should be the budget on the original campaign', function() {
                            updateRequest = undefined;
                            originalCampaign.pricing.budget = 7523;
                            campaign.pricing.budget = 111;

                            initFund();

                            expect(CampaignFundingService.model.oldBudget).toBe(7523);
                        });
                    });
                });

                describe('model.budgetChange', function() {
                    describe('when the campaign is a draft', function() {
                        it('should equal the whole budget', function() {
                            originalCampaign.status = 'draft';
                            originalCampaign.pricing.budget = 111;
                            campaign.pricing.budget = 222;

                            initFund();

                            expect(CampaignFundingService.model.budgetChange).toBe(222);
                        });
                    });

                    describe('when the campaign is not a draft', function() {
                        it('should equal the difference between new and old budget', function() {
                            originalCampaign.status = 'pending';
                            originalCampaign.pricing.budget = 100;
                            campaign.pricing.budget = 300;

                            initFund();

                            expect(CampaignFundingService.model.budgetChange).toBe(200);
                        });
                    });
                });
            });

            it('should request a token', function() {
                initFund();

                expect(PaymentService.getToken).toHaveBeenCalled();
            });

            it('should get the account balance', function() {
                initFund();

                expect(PaymentService.getBalance).toHaveBeenCalled();
            });

            it('should initialize a new payment method', function() {
                initFund();

                expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {});
            });

            it('should request all existing payment methods', function() {
                initFund();

                expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
            });

            it('should request a credit check with the campaign id, org id and new budget', function() {
                originalCampaign.id = 'cam-123';
                originalCampaign.org = 'org-123';
                campaign.pricing.budget = 1259;

                initFund();

                expect(PaymentService.creditCheck).toHaveBeenCalledWith(
                    originalCampaign.id,
                    originalCampaign.org,
                    campaign.pricing.budget
                );
            });

            describe('when all requests resolve', function() {
                beforeEach(function() {
                    initFund();
                });

                describe('setting model props', function() {
                    it('should add data from the responses', function() {
                        $rootScope.$apply(function() {
                            creditCheckDeferred.resolve({
                                depositAmount: 1267
                            });
                            paymentMethodsDeferred.resolve(paymentMethods);
                        });

                        expect(CampaignFundingService.model.loading).toBe(false);
                        expect(CampaignFundingService.model.token).toBe(token);
                        expect(CampaignFundingService.model.newMethod).toBe(paymentModel);
                        expect(CampaignFundingService.model.accounting).toBe(PaymentService.balance);
                        expect(CampaignFundingService.model.minDeposit).toBe(1267);
                        expect(CampaignFundingService.model.deposit).toBe(1267);
                        expect(CampaignFundingService.model.paymentMethods).toBe(paymentMethods);
                        expect(CampaignFundingService.model.cpv).toBe(0.05);
                        expect(CampaignFundingService.model.summary).toBe(summary);

                        expect(CampaignService.getCpv).toHaveBeenCalledWith(campaign, schema);
                        expect(CampaignService.getSummary).toHaveBeenCalledWith({
                            campaign: campaign,
                            interests: interests
                        });
                    });
                });

                describe('when user has no payment methods and paymentOptional entitlement', function() {
                    describe('when there is a minDeposit required', function() {
                        it('should set skipDeposit to false and showDepositView to true and showCreditCardForm to true', function() {
                            SelfieState.cModel.entitlements.paymentOptional = true;

                            $rootScope.$apply(function() {
                                creditCheckDeferred.resolve({
                                    depositAmount: 200
                                });
                                paymentMethodsDeferred.resolve([]);
                            });

                            expect(CampaignFundingService.model.skipDeposit).toBe(false);
                            expect(CampaignFundingService.model.showDepositView).toBe(true);
                            expect(CampaignFundingService.model.showCreditCardForm).toBe(true);
                        });
                    });

                    describe('when there is no minDeposit', function() {
                        it('should set the skipDposit to true even when there are no paymentMethods', function() {
                            SelfieState.cModel.entitlements.paymentOptional = true;

                            $rootScope.$apply(function() {
                                creditCheckDeferred.resolve({
                                    depositAmount: 0
                                });
                                paymentMethodsDeferred.resolve([]);
                            });

                            expect(CampaignFundingService.model.skipDeposit).toBe(true);
                            expect(CampaignFundingService.model.showDepositView).toBe(false);
                            expect(CampaignFundingService.model.showCreditCardForm).toBe(true);
                        });
                    });
                });

                describe('when there are no paymentMethods', function() {
                    it('should set skipDeposit flag to false even though there is no minDeposit', function() {
                        $rootScope.$apply(function() {
                            creditCheckDeferred.resolve({
                                depositAmount: 0
                            });
                            paymentMethodsDeferred.resolve([]);
                        });

                        expect(CampaignFundingService.model.minDeposit).toBeFalsy();
                        expect(CampaignFundingService.model.skipDeposit).toBe(false);
                        expect(CampaignFundingService.model.showDepositView).toBe(true);
                        expect(CampaignFundingService.model.showCreditCardForm).toBe(true);
                    });
                });

                describe('when there are existing paymentMethods', function() {
                    describe('when there is no minDeposit', function() {
                        it('should set skipDeposit flag to true', function() {
                            paymentMethods.push({}, {default: true}, {});

                            $rootScope.$apply(function() {
                                creditCheckDeferred.resolve({
                                    depositAmount: 0
                                });
                                paymentMethodsDeferred.resolve(paymentMethods);
                            });

                            expect(CampaignFundingService.model.paymentMethods).toBe(paymentMethods);
                            expect(CampaignFundingService.model.paymentMethod).toBe(paymentMethods[1]);
                            expect(CampaignFundingService.model.skipDeposit).toBe(true);
                            expect(CampaignFundingService.model.showDepositView).toBe(false);
                            expect(CampaignFundingService.model.showCreditCardForm).toBe(false);
                        });
                    });

                    describe('when there is a minDeposit', function() {
                        it('should set skipDeposit flag to false', function() {
                            paymentMethods.push({}, {}, {default: true}, {});

                            $rootScope.$apply(function() {
                                creditCheckDeferred.resolve({
                                    depositAmount: 800
                                });
                                paymentMethodsDeferred.resolve(paymentMethods);
                            });

                            expect(CampaignFundingService.model.paymentMethods).toBe(paymentMethods);
                            expect(CampaignFundingService.model.paymentMethod).toBe(paymentMethods[2]);
                            expect(CampaignFundingService.model.skipDeposit).toBe(false);
                            expect(CampaignFundingService.model.showDepositView).toBe(true);
                            expect(CampaignFundingService.model.showCreditCardForm).toBe(false);
                        });
                    });
                });
            });
        });
    });
});
