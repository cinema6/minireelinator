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
            MiniReelService,
            CampaignService;

        var card,
            categories,
            campaign,
            paymentMethods,
            updateRequest,
            stats,
            user,
            advertiser;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');
                CampaignService = $injector.get('CampaignService');

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
                    advertiserId: 'a-123',
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
                stats = [];
                user = {
                    id: 'u-123',
                    org: 'o-123'
                };
                advertiser = {
                    id: 'a-123'
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
                campaignState.cParent.user = user;

                campaignState.beforeModel();

                expect(campaignState.card).toEqual(card);
                expect(campaignState.campaign).toEqual(campaign);
                expect(campaignState.user).toEqual(user);
            });
        });

        describe('model()', function() {
            var success, failure, updateRequestDeferred, advertiserDeferred, paymentMethodsDeferred, statsDeferred;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');
                updateRequestDeferred = $q.defer();
                advertiserDeferred = $q.defer();
                paymentMethodsDeferred = $q.defer();
                statsDeferred = $q.defer();

                spyOn(cinema6.db, 'findAll').and.returnValue(paymentMethodsDeferred.promise);
                spyOn(cinema6.db, 'find').and.callFake(function(type) {
                    var response;

                    switch(type) {
                        case 'updateRequest':
                            response = updateRequestDeferred.promise;
                            break;
                        case 'advertiser':
                            response = advertiserDeferred.promise;
                            break;
                    }

                    return response;
                });
                spyOn(CampaignService, 'getAnalytics').and.returnValue(statsDeferred.promise);

                campaignState.campaign = campaign;
                campaign.org = 'o-999';
            });

            describe('when the campaign has an updateRequest', function() {
                beforeEach(function() {
                    campaign.updateRequest = 'ur-123';

                    $rootScope.$apply(function() {
                        campaignState.model().then(success, failure);
                    });
                });

                it('should find the updateRequest, the stats, and the advertiser and paymentMethods for the org of the campaign creator', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod', {org: 'o-999'});
                    expect(cinema6.db.find).toHaveBeenCalledWith('updateRequest', 'cam-123:ur-123');
                    expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', campaign.advertiserId);
                    expect(CampaignService.getAnalytics).toHaveBeenCalledWith(campaign.id);
                });

                describe('when the requests are successful', function() {
                    it('should return the model object', function() {
                        $rootScope.$apply(function() {
                            updateRequestDeferred.resolve(updateRequest);
                            paymentMethodsDeferred.resolve(paymentMethods);
                            statsDeferred.resolve(stats);
                            advertiserDeferred.resolve(advertiser);
                        });

                        expect(success).toHaveBeenCalledWith({
                            paymentMethods: paymentMethods,
                            updateRequest: updateRequest,
                            stats: stats,
                            advertiser: advertiser
                        });
                    });
                });

                describe('when any request fails', function() {
                    it('should trigger failure', function() {
                        $rootScope.$apply(function() {
                            updateRequestDeferred.resolve(updateRequest);
                            paymentMethodsDeferred.resolve(paymentMethods);
                            statsDeferred.resolve(stats);
                            advertiserDeferred.reject('Not Found');
                        });

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });

            describe('when the campaign does not have an updateRequest', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        campaignState.model().then(success, failure);
                    });
                });

                it('should find the paymentMethods for the org of the campaign creator', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod', {org: 'o-999'});
                    expect(cinema6.db.find).not.toHaveBeenCalledWith('updateRequest', jasmine.any(String));
                    expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', campaign.advertiserId);
                    expect(CampaignService.getAnalytics).toHaveBeenCalledWith(campaign.id);
                });

                describe('when the requests are successful', function() {
                    it('should return the model object', function() {
                        $rootScope.$apply(function() {
                            paymentMethodsDeferred.resolve(paymentMethods);
                            statsDeferred.resolve(stats);
                            advertiserDeferred.resolve(advertiser);
                        });

                        expect(success).toHaveBeenCalledWith({
                            paymentMethods: paymentMethods,
                            updateRequest: null,
                            stats: stats,
                            advertiser: advertiser
                        });
                    });
                });

                describe('when any request fails', function() {
                    it('should trigger failure', function() {
                        $rootScope.$apply(function() {
                            paymentMethodsDeferred.resolve(paymentMethods);
                            statsDeferred.resolve(stats);
                            advertiserDeferred.reject('Not Found');
                        });

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('afterModel()', function() {
            it('should set the isAdmin flag on the state', function() {
                var model = {
                    paymentMethods: paymentMethods,
                    updateRequest: updateRequest,
                    stats: stats
                };

                campaignState.afterModel(model);

                expect(campaignState.isAdmin).toBe(true);
                expect(campaignState.updateRequest).toBe(updateRequest)
            });

            it('should set the hasStats flag on the state', function() {
                var model = {
                    paymentMethods: paymentMethods,
                    updateRequest: updateRequest,
                    stats: stats
                };

                campaignState.afterModel(model);

                expect(campaignState.hasStats).toBe(false);

                stats.push({});

                campaignState.afterModel(model);

                expect(campaignState.hasStats).toBe(true);
            });
        });

        describe('enter()', function() {
            var model;

            beforeEach(function() {
                model = {
                    paymentMethods: paymentMethods,
                    updateRequest: updateRequest,
                    stats: stats
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