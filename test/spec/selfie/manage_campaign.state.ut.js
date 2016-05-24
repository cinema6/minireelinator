define(['app'], function(appModule) {
    'use strict';

    ['Selfie:All:Manage:Campaign','Selfie:Pending:Manage:Campaign'].forEach(function(stateName) {
        describe('Selfie:Manage:Campaign State', function() {
            var $rootScope,
                $q,
                campaignState,
                selfieState,
                newCampaignState,
                c6State,
                cinema6,
                MiniReelService,
                PaymentService,
                CampaignService;

            var card,
                categories,
                campaign,
                updateRequest,
                user,
                advertiser,
                stats,
                schema;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');
                    PaymentService = $injector.get('PaymentService');
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
                        links: {},
                        targeting: {
                            interests: []
                        }
                    };
                    updateRequest = {
                        id: 'ur-123',
                        data: {
                            id: 'cam-123',
                            status: 'pending',
                            name: 'My Campaign',
                            targeting: {
                                interests: []
                            }
                        }
                    };
                    user = {
                        id: 'u-123',
                        org: 'o-123'
                    };
                    advertiser = {
                        id: 'a-123'
                    };
                    stats = [];
                    schema = {};

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
                    campaignState = c6State.get(stateName);
                });
            });

            afterAll(function() {
                $rootScope = null;
                $q = null;
                campaignState = null;
                selfieState = null;
                newCampaignState = null;
                c6State = null;
                cinema6 = null;
                MiniReelService = null;
                PaymentService = null;
                CampaignService = null;
                card = null;
                categories = null;
                campaign = null;
                updateRequest = null;
                user = null;
                advertiser = null;
                stats = null;
                schema = null;
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
                var success, failure, updateRequestDeferred, advertiserDeferred;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                    updateRequestDeferred = $q.defer();
                    advertiserDeferred = $q.defer();

                    spyOn(CampaignService, 'getSchema').and.returnValue($q.when(schema));
                    spyOn(CampaignService, 'getAnalytics').and.returnValue($q.when(stats));
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

                    it('should find the updateRequest and the advertiser for the org of the campaign creator', function() {
                        expect(cinema6.db.find).toHaveBeenCalledWith('updateRequest', 'cam-123:ur-123');
                        expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', campaign.advertiserId);
                    });

                    it('should request analytics and schema', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({ids: campaign.id});
                        expect(CampaignService.getSchema).toHaveBeenCalled();
                    });

                    describe('when the requests are successful', function() {
                        it('should return the model object', function() {
                            $rootScope.$apply(function() {
                                updateRequestDeferred.resolve(updateRequest);
                                advertiserDeferred.resolve(advertiser);
                            });

                            expect(success).toHaveBeenCalledWith({
                                updateRequest: updateRequest,
                                advertiser: advertiser,
                                schema: schema,
                                stats: stats
                            });
                        });
                    });

                    describe('when any request fails', function() {
                        it('should trigger failure', function() {
                            $rootScope.$apply(function() {
                                updateRequestDeferred.resolve(updateRequest);
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

                    it('should find the advertiser for the org of the campaign creator', function() {
                        expect(cinema6.db.find).not.toHaveBeenCalledWith('updateRequest', jasmine.any(String));
                        expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', campaign.advertiserId);
                    });

                    it('should request analytics and schema', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({ids: campaign.id});
                        expect(CampaignService.getSchema).toHaveBeenCalled();
                    });

                    describe('when the requests are successful', function() {
                        it('should return the model object', function() {
                            $rootScope.$apply(function() {
                                advertiserDeferred.resolve(advertiser);
                            });

                            expect(success).toHaveBeenCalledWith({
                                updateRequest: null,
                                advertiser: advertiser,
                                schema: schema,
                                stats: stats
                            });
                        });
                    });

                    describe('when any request fails', function() {
                        it('should trigger failure', function() {
                            $rootScope.$apply(function() {
                                advertiserDeferred.reject('Not Found');
                            });

                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('afterModel()', function() {
                var interestsDeferred, model, interests;

                beforeEach(function() {
                    interestsDeferred = $q.defer();

                    spyOn(PaymentService, 'getBalance').and.returnValue($q.when({}));
                    spyOn(cinema6.db, 'findAll').and.returnValue(interestsDeferred.promise);

                    model = {
                        updateRequest: updateRequest,
                        schema: schema
                    };

                    interests = [
                        {
                            id: 'cat-1'
                        },
                        {
                            id: 'cat-2'
                        }
                    ];
                });

                it('should set the isAdmin flag on the state', function() {
                    campaignState.afterModel(model);

                    expect(campaignState.isAdmin).toBe(true);
                    expect(campaignState.updateRequest).toBe(updateRequest);
                    expect(campaignState.schema).toBe(schema);
                });

                it('should get the account balance', function() {
                    campaignState.afterModel(model);
                    expect(PaymentService.getBalance).toHaveBeenCalled();
                });

                describe('when there is an update request', function() {
                    it('should fetch the categories and put them on the state', function() {
                        updateRequest.data.targeting.interests = ['cat-1','cat-3'];

                        campaign.targeting.interests = ['cat-2'];
                        campaignState.campaign = campaign;

                        campaignState.afterModel(model);

                        expect(cinema6.db.findAll).toHaveBeenCalledWith('category', { ids: 'cat-1,cat-3'});

                        $rootScope.$apply(function() {
                            interestsDeferred.resolve(interests);
                        });

                        expect(campaignState.interests).toBe(interests);
                    });

                    it('should not fetch any interests if there are none', function() {
                        updateRequest.data.targeting.interests = [];

                        campaign.targeting.interests = ['cat-2'];
                        campaignState.campaign = campaign;

                        campaignState.afterModel(model);

                        expect(cinema6.db.findAll).not.toHaveBeenCalledWith('category', jasmine.any(Object));
                    });
                });

                describe('when there is no an update request', function() {
                    it('should fetch the categories of the campaign and put them on the state', function() {
                        model.updateRequest = null;

                        campaign.targeting.interests = ['cat-1','cat-3'];
                        campaignState.campaign = campaign;

                        campaignState.afterModel(model);

                        expect(cinema6.db.findAll).toHaveBeenCalledWith('category', { ids: 'cat-1,cat-3'});

                        $rootScope.$apply(function() {
                            interestsDeferred.resolve(interests);
                        });

                        expect(campaignState.interests).toBe(interests);
                    });

                    it('should not fetch any interests if there are none', function() {
                        model.updateRequest = null;

                        campaign.targeting.interests = [];
                        campaignState.campaign = campaign;

                        campaignState.afterModel(model);

                        expect(cinema6.db.findAll).not.toHaveBeenCalledWith('category', jasmine.any(Object));
                    });
                });
            });

            describe('enter()', function() {
                var model;

                beforeEach(function() {
                    model = {
                        updateRequest: updateRequest
                    };
                    spyOn(c6State, 'goTo');
                });

                it('should go to the Selfie:Manage:Campaign:Manage state if user is not an admin', function() {
                    selfieState.cModel.entitlements.adminCampaigns = false;

                    campaignState.afterModel(model);
                    campaignState.enter();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Manage', null, null, true);
                });

                it('shoud go to the Selfie:Manage:Campaign:Manage state if user is an admin and campaign does not have an update request', function() {
                    selfieState.cModel.entitlements.adminCampaigns = true;

                    campaignState.afterModel(model);
                    campaignState.updateRequest = null;
                    campaignState.enter();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Manage', null, null, true);
                });

                it('shoud go to the Selfie:Manage:Campaign:Admin state if user is an admin and campaign has an update request', function() {
                    selfieState.cModel.entitlements.adminCampaigns = true;

                    campaignState.afterModel(model);
                    campaignState.enter();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Admin', null, null, true);
                });
            });
        });
    });
});
