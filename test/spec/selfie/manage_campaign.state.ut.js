define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Manage:Campaign State', function() {
        var $rootScope,
            $q,
            campaignState,
            selfieState,
            newCampaignState,
            c6State,
            cinema6,
            MiniReelService;

        var card,
            categories,
            campaign,
            paymentMethods,
            updateRequest;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                card = cinema6.db.create('card', MiniReelService.createCard('video'));
                categories = [
                    {
                        id: 'cat-1'
                    },
                    {
                        id: 'cat-2'
                    },
                    {
                        id: 'cat-3'
                    }
                ];
                campaign = {
                    id: 'cam-123',
                    cards: [],
                    links: {}
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
                updateRequest = {
                    id: 'ur-123',
                    data: {
                        id: 'cam-123',
                        status: 'pending',
                        name: 'My Campaign'
                    }
                };

                selfieState = c6State.get('Selfie');
                selfieState.cModel = {
                    advertiser: {},
                    org: {
                        id: 'o-123'
                    },
                    entitlements: {
                        adminCampaigns: true
                    }
                };
                campaignState = c6State.get('Selfie:Manage:Campaign');
            });
        });

        it('should exist', function() {
            expect(campaignState).toEqual(jasmine.any(Object));
        });

        describe('card', function() {
            it('should be null', function() {
                expect(campaignState.card).toBe(null);
            });
        });

        describe('campaign', function() {
            it('should be null', function() {
                expect(campaignState.campaign).toBe(null);
            });
        });

        describe('beforeModel()', function() {
            it('should put the card and campaign on the state object', function() {
                campaignState.cParent.campaign = campaign;
                campaignState.cParent.card = card;

                campaignState.beforeModel();

                expect(campaignState.card).toEqual(card);
                expect(campaignState.campaign).toEqual(campaign);
            });
        });

        describe('model()', function() {
            var success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');
                spyOn(cinema6.db, 'findAll').and.returnValue($q.when(paymentMethods));
                spyOn(cinema6.db, 'find').and.returnValue($q.when(updateRequest));

                campaignState.campaign = campaign;
                campaign.org = 'o-999';
            });

            describe('when the campaign has an updateRequest', function() {
                it('should find the updateRequest and the paymentMethods for the org of the campaign creator', function() {
                    campaign.updateRequest = 'ur-123';

                    $rootScope.$apply(function() {
                        campaignState.model().then(success, failure);
                    });
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod', {org: 'o-999'});
                    expect(cinema6.db.find).toHaveBeenCalledWith('updateRequest', 'cam-123:ur-123');
                    expect(success).toHaveBeenCalledWith({
                        paymentMethods: paymentMethods,
                        updateRequest: updateRequest
                    });
                });
            });

            describe('when the campaign does not have an updateRequest', function() {
                it('should find the paymentMethods for the org of the campaign creator', function() {
                    $rootScope.$apply(function() {
                        campaignState.model().then(success, failure);
                    });
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod', {org: 'o-999'});
                    expect(cinema6.db.find).not.toHaveBeenCalled();
                    expect(success).toHaveBeenCalledWith({
                        paymentMethods: paymentMethods,
                        updateRequest: null
                    });
                });
            });
        });

        describe('afterModel()', function() {
            it('should set the isAdmin flag on the state', function() {
                var model = {
                    paymentMethods: paymentMethods,
                    updateRequest: updateRequest
                };

                campaignState.afterModel(model);

                expect(campaignState.isAdmin).toBe(true);
                expect(campaignState.updateRequest).toBe(updateRequest)
            });
        });

        describe('enter()', function() {
            var model;

            beforeEach(function() {
                model = {
                    paymentMethods: paymentMethods,
                    updateRequest: updateRequest
                };
                spyOn(c6State, 'goTo');
            });

            it('shoud go to the Selfie:Manage:Campaign:Manage state if user is not an admin', function() {
                selfieState.cModel.entitlements.adminCampaigns = false;

                campaignState.afterModel(model);
                campaignState.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Manage');
            });

            it('shoud go to the Selfie:Manage:Campaign:Admin state if user is an admin', function() {
                selfieState.cModel.entitlements.adminCampaigns = true;

                campaignState.afterModel(model);
                campaignState.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Admin');
            });
        });
    });
});