define(['app'], function(appModule) {
    'use strict';

    var copy = angular.copy;

    ['Selfie:New:Campaign', 'Selfie:Edit:Campaign'].forEach(function(stateName) {
        describe('Selfie:Campaign State', function() {
            var $rootScope,
                $q,
                campaignState,
                selfieState,
                newCampaignState,
                c6State,
                cinema6,
                MiniReelService,
                SelfieLogoService,
                CampaignService,
                ConfirmDialogService,
                SpinnerService,
                intercom,
                PaymentService;

            var card,
                categories,
                campaign,
                logos,
                updateRequest,
                advertiser,
                user;

            beforeEach(function() {
                intercom = jasmine.createSpy('intercom');

                module(appModule.name, ['$provide', function($provide) {
                    $provide.value('intercom', intercom);
                }]);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');
                    SelfieLogoService = $injector.get('SelfieLogoService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    CampaignService = $injector.get('CampaignService');
                    SpinnerService = $injector.get('SpinnerService');
                    PaymentService = $injector.get('PaymentService');

                    card = MiniReelService.createCard('video');
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
                    campaign = cinema6.db.create('selfieCampaign', {
                        id: 'cam-123',
                        cards: [card],
                        links: {},
                        targeting: {
                            interests: [],
                            demographics: {
                                age: []
                            }
                        }
                    });
                    updateRequest = cinema6.db.create('updateRequest', {
                        id: 'ur-123',
                        data: campaign.pojoify(),
                        campaign: campaign.id
                    });
                    logos = [
                        {
                            name: 'logo1',
                            src: 'logo1.jpg'
                        },
                        {
                            name: 'logo2',
                            src: 'logo2.png'
                        }
                    ];
                    advertiser = {
                        id: 'a-123'
                    };
                    user = {
                        id: 'u-123',
                        org: {
                            id: 'o-123'
                        },
                        entitlements: {}
                    };

                    selfieState = c6State.get('Selfie');
                    selfieState.cModel = {
                        advertiser: {},
                        org: {
                            id: 'o-123'
                        },
                        id: 'u-123',
                        entitlements: {}
                    };
                    campaignState = c6State.get(stateName);
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

            describe('updateRequest', function() {
                it('should be null', function() {
                    expect(campaignState.updateRequest).toBe(null);
                });
            });

            describe('_campaign', function() {
                it('should be null', function() {
                    expect(campaignState._campaign).toBe(null);
                });
            });

            describe('_updateRequest', function() {
                it('should be null', function() {
                    expect(campaignState._updateRequest).toBe(null);
                });
            });

            describe('allowExit', function() {
                it('should be false', function() {
                    expect(campaignState.allowExit).toBe(false);
                });
            });

            describe('beforeModel()', function() {
                describe('when there is a pending update request', function() {
                    beforeEach(function() {
                        campaignState.cParent.updateRequest = updateRequest;
                        campaignState.cParent.campaign = campaign;
                        campaignState.cParent.advertiser = advertiser;
                        campaignState.cParent.user = user;

                        campaignState.beforeModel();
                    });

                    it('should put the updateRequest on the state object', function() {
                        expect(campaignState.updateRequest).toEqual(updateRequest.pojoify());
                        expect(campaignState._updateRequest).toEqual(updateRequest);
                    });

                    it('the campaign and card should come from the updateRequest', function() {
                        expect(campaignState.campaign).toEqual(updateRequest.data);
                        expect(campaignState.card).toEqual(updateRequest.data.cards[0]);
                    });

                    it('the advertiser, user and original campaign should be set', function() {
                        expect(campaignState.advertiser).toEqual(advertiser);
                        expect(campaignState.user).toEqual(user);
                        expect(campaignState._campaign).toEqual(campaign);
                    });
                });

                describe('when there is not a pending update request', function() {
                    beforeEach(function() {
                        campaignState.cParent.updateRequest = null;
                        campaignState.cParent.campaign = campaign;
                        campaignState.cParent.advertiser = advertiser;
                        campaignState.cParent.user = user;

                        campaignState.beforeModel();
                    });

                    it('should put the updateRequest on the state object', function() {
                        expect(campaignState.updateRequest).toEqual(null);
                        expect(campaignState._updateRequest).toEqual(null);
                    });

                    it('the campaign and card should come from the pojoified campaign', function() {
                        var pojo = campaign.pojoify();

                        expect(campaignState.campaign).toEqual(pojo);
                        expect(campaignState.card).toEqual(pojo.cards[0]);
                    });

                    it('the advertiser and original campaign should be set', function() {
                        expect(campaignState.advertiser).toEqual(advertiser);
                        expect(campaignState.user).toEqual(user);
                        expect(campaignState._campaign).toEqual(campaign);
                    });
                });

                describe('isCreator', function() {
                    it('should be true if campaign has no user (new campaign) or if user matches', function() {
                        var _campaign;

                        campaignState.cParent.user = user;

                        _campaign = copy(campaign);
                        delete _campaign.user;
                        campaignState.cParent.campaign = _campaign;
                        campaignState.beforeModel();
                        expect(campaignState.isCreator).toBe(true);

                        _campaign = copy(campaign);
                        _campaign.user = 'u-123';
                        campaignState.cParent.campaign = _campaign;
                        campaignState.beforeModel();
                        expect(campaignState.isCreator).toBe(true);

                        _campaign = copy(campaign);
                        _campaign.user = 'u-xxx';
                        campaignState.cParent.campaign = _campaign;
                        campaignState.beforeModel();
                        expect(campaignState.isCreator).toBe(false);
                    });
                });
            });

            describe('model()', function() {
                var success, failure, analyticsDeferred, analytics;

                beforeEach(function() {
                    analyticsDeferred = $q.defer();
                    analytics = [];

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(cinema6.db, 'findAll').and.returnValue($q.when(categories));
                    spyOn(SelfieLogoService, 'getLogos').and.returnValue($q.when(logos));
                    spyOn(SpinnerService, 'display');
                    spyOn(SpinnerService, 'close');
                    spyOn(CampaignService, 'getAnalytics').and.returnValue(analyticsDeferred.promise);
                });

                describe('when campaign has no id and is not a draft', function() {
                    it('should not get analytics', function() {
                        campaign.id = undefined;
                        campaign.status = 'pending';
                        campaignState.campaign = campaign;
                        campaignState._campaign = campaign;
                        campaignState.user = user;

                        $rootScope.$apply(function() {
                            campaignState.model();
                        });

                        expect(CampaignService.getAnalytics).not.toHaveBeenCalled();
                    });
                });

                describe('when the _campaign status is draft and has an id', function() {
                    it('should not get analytics', function() {
                        campaign.id = 'cam-123';
                        campaign.status = 'draft';
                        campaignState.campaign = campaign;
                        campaignState._campaign = campaign;
                        campaignState.user = user;

                        $rootScope.$apply(function() {
                            campaignState.model();
                        });

                        expect(CampaignService.getAnalytics).not.toHaveBeenCalled();
                    });
                });

                describe('when the campaign has an id and is not draft', function() {
                    it('should not get analytics', function() {
                        campaign.id = 'cam-123';
                        campaign.status = 'pending';
                        campaignState.campaign = campaign;
                        campaignState._campaign = campaign;
                        campaignState.user = user;

                        $rootScope.$apply(function() {
                            campaignState.model();
                        });

                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({ids: campaign.id });
                    });
                });

                describe('when campaign has an org', function() {
                    it('should get payment methods for that org and all interests and logos', function() {
                        campaign.org = 'o-99999';
                        campaignState.campaign = campaign;
                        campaignState._campaign = campaign;

                        $rootScope.$apply(function() {
                            campaignState.model().then(success, failure);
                            analyticsDeferred.resolve(analytics);
                        });

                        expect(cinema6.db.findAll).toHaveBeenCalledWith('category', {type: 'interest'});
                        expect(SelfieLogoService.getLogos).toHaveBeenCalledWith(campaign.org);
                        expect(success).toHaveBeenCalledWith({
                            categories: categories,
                            logos: logos,
                            stats: analytics
                        });

                        expect(SpinnerService.display).toHaveBeenCalled();
                        expect(SpinnerService.close).toHaveBeenCalled();
                    });
                });

                describe('when campaign does not have an org', function() {
                    it('should get payment methods for the current users org and all interests and logos', function() {
                        delete campaign.org;
                        campaignState.campaign = campaign;
                        campaignState.user = user;
                        campaignState._campaign = campaign;

                        $rootScope.$apply(function() {
                            campaignState.model().then(success, failure);
                            analyticsDeferred.resolve(analytics);
                        });

                        expect(cinema6.db.findAll).toHaveBeenCalledWith('category', {type: 'interest'});
                        expect(SelfieLogoService.getLogos).toHaveBeenCalledWith(user.org.id);
                        expect(success).toHaveBeenCalledWith({
                            categories: categories,
                            logos: logos,
                            stats: analytics
                        });

                        expect(SpinnerService.display).toHaveBeenCalled();
                        expect(SpinnerService.close).toHaveBeenCalled();
                    });
                });

                describe('when a request fails', function() {
                    it('should still close the spinner', function() {
                        campaign.org = 'o-99999';
                        campaignState.campaign = campaign;
                        campaignState.user = user;
                        campaignState._campaign = campaign;

                        spyOn(c6State, 'goTo');
                        SelfieLogoService.getLogos.and.returnValue($q.reject());

                        $rootScope.$apply(function() {
                            campaignState.model().then(success, failure);
                            analyticsDeferred.resolve(analytics);
                        });

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                        expect(SpinnerService.display).toHaveBeenCalled();
                        expect(SpinnerService.close).toHaveBeenCalled();
                    });
                });
            });

            describe('afterModel()', function() {
                it('should get the user campaign schema and put it on the state', function() {
                    var schema = {
                        pricing: {
                            cost:{

                            }
                        }
                    };
                    spyOn(PaymentService, 'getBalance').and.returnValue($q.when({}));
                    spyOn(CampaignService, 'getSchema').and.returnValue($q.when(schema));

                    $rootScope.$apply(function() {
                        campaignState.afterModel();
                    });

                    expect(PaymentService.getBalance).toHaveBeenCalled();
                    expect(CampaignService.getSchema).toHaveBeenCalled();
                    expect(campaignState.schema).toEqual(schema);
                });
            });

            describe('exit()', function() {
                var success, failure, saveDeferred;

                beforeEach(function() {
                    saveDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(campaignState, 'saveCampaign').and.returnValue(saveDeferred.promise);
                    spyOn(ConfirmDialogService, 'display');

                    campaignState._campaign = campaign;
                    campaignState.campaign = campaign.pojoify();
                });

                describe('when master campaign is not in draft', function() {
                    describe('when master campaign is a new draft without a status yet', function() {
                        it('should resolve the promise immediately', function() {
                            campaignState._campaign.status = undefined;

                            $rootScope.$apply(function() {
                                campaignState.exit().then(success, failure);
                            });

                            expect(success).toHaveBeenCalled();
                            expect(campaignState.saveCampaign).not.toHaveBeenCalled();
                        });
                    });

                    describe('when allowExit is true', function() {
                        it('should resolve the promise immediately', function() {
                            campaignState.allowExit = true;

                            $rootScope.$apply(function() {
                                campaignState.exit().then(success, failure);
                            });

                            expect(success).toHaveBeenCalled();
                            expect(campaignState.saveCampaign).not.toHaveBeenCalled();
                        });
                    });

                    describe('when master campaign has a status but is clean and unchanged', function() {
                        it('should resolve the promise immediately', function() {
                            campaignState._campaign.status = 'active';
                            campaignState.campaign.status = 'active';

                            $rootScope.$apply(function() {
                                campaignState.exit().then(success, failure);
                            });

                            expect(success).toHaveBeenCalled();
                            expect(campaignState.saveCampaign).not.toHaveBeenCalled();
                        });
                    });

                    describe('when campaign has a status and has been edited', function() {
                        var onAffirm, onCancel, prompt;

                        beforeEach(function() {
                            campaignState._campaign.status = 'active';

                            campaignState.campaign.name = 'Updated Name!';

                            $rootScope.$apply(function() {
                                campaignState.exit().then(success, failure);
                            });

                            onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                            onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                            prompt = ConfirmDialogService.display.calls.mostRecent().args[0].prompt;
                        });

                        it('should alert the user before leaving', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(prompt).toEqual('Are you sure you want to leave? You will lose your changes if you continue.');
                        });

                        describe('onAffirm()', function() {
                            it('should resolve the promise', function() {
                                $rootScope.$apply(function() {
                                    onAffirm();
                                });

                                expect(success).toHaveBeenCalled();
                                expect(campaignState.saveCampaign).not.toHaveBeenCalled();
                            });
                        });

                        describe('onCancel()', function() {
                            it('should reject the promise', function() {
                                $rootScope.$apply(function() {
                                    onCancel();
                                });

                                expect(success).not.toHaveBeenCalled();
                                expect(failure).toHaveBeenCalled();
                                expect(campaignState.saveCampaign).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('when the campaign is a draft', function() {
                    beforeEach(function() {
                        campaignState._campaign.status = 'draft';
                        delete campaignState.campaign.status;

                        $rootScope.$apply(function() {
                            campaignState.exit().then(success, failure);
                        });
                    });

                    it('should call saveCampaign', function() {
                        expect(campaignState.saveCampaign).toHaveBeenCalled();
                    });

                    describe('if the save succeeds', function() {
                        it('should return the promise', function() {
                            $rootScope.$apply(function() {
                                saveDeferred.resolve();
                            });

                            expect(success).toHaveBeenCalled();
                        });
                    });

                    describe('if the save fails', function() {
                        var onAffirm, onCancel;

                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                saveDeferred.reject();
                            });

                            onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                            onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                        });

                        it('should display an alert', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });

                        describe('onAffirm', function() {
                            it('should reject the exit() promise, keeping the user in this state', function() {
                                $rootScope.$apply(function() {
                                    onAffirm();
                                });

                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('onAffirm', function() {
                            it('should resolve the promise, causing the user to proceed to the desired state', function() {
                                $rootScope.$apply(function() {
                                    onCancel();
                                });

                                expect(success).toHaveBeenCalled();
                            });
                        });
                    });
                });
            });

            describe('saveUpdateRequest()', function() {
                var success, failure, serverChange;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    serverChange = 0;

                    spyOn(updateRequest, 'save').and.callFake(function() {
                        // make some change to the DB Model that the UI doesn't know about
                        updateRequest.data.cards[0].data.change = ++serverChange;

                        return $q.when(updateRequest);
                    });

                    // put the DB Model on the state
                    campaignState._updateRequest = updateRequest;

                    // put the pojo on the state for the Ctrl to use
                    campaignState.updateRequest = updateRequest.pojoify();
                });

                it('should update the campaign DB Model with the current campaign data and save', function() {
                    campaignState.updateRequest.data.name = 'New Campaign';

                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest().then(success, failure);
                    });

                    expect(updateRequest.save).toHaveBeenCalled();
                    expect(campaignState._updateRequest.data.name).toEqual('New Campaign');
                });

                it('should maintain data returned from the server in addition to UI updates', function() {
                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest();
                    });
                    expect(campaignState._updateRequest.data.cards[0].data.change).toEqual(1);

                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest();
                    });
                    expect(campaignState._updateRequest.data.cards[0].data.change).toEqual(2);

                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest();
                    });
                    expect(campaignState._updateRequest.data.cards[0].data.change).toEqual(3);

                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest();
                    });
                    expect(campaignState._updateRequest.data.cards[0].data.change).toEqual(4);
                });

                it('should return the pojoified campaign without the server updates', function() {
                    campaignState.updateRequest.data.name = 'New Campaign';

                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest().then(success, failure);
                    });

                    expect(success).toHaveBeenCalledWith(campaignState.updateRequest);
                });

                it('should not extend the cards array objects', function() {
                    campaignState.updateRequest.data.cards[0] = {};

                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest().then(success, failure);
                    });

                    expect(campaignState._updateRequest.data.cards[0].id).toEqual(card.id);
                    expect(campaignState._updateRequest.data.cards[0].type).toEqual(card.type);
                    expect(campaignState._updateRequest.data.cards[0].data).toEqual(jasmine.any(Object));
                });

                it('should overwrite the targeting arrays', function() {
                    campaignState._updateRequest.data.targeting.interests.push('comedy');
                    campaignState._updateRequest.data.targeting.interests.push('entertainment');
                    campaignState.updateRequest.data.targeting.interests = [];

                    campaignState._updateRequest.data.targeting.demographics.age.push('18-24');
                    campaignState._updateRequest.data.targeting.demographics.age.push('25-34');
                    campaignState.updateRequest.data.targeting.demographics.age = [];

                    $rootScope.$apply(function() {
                        campaignState.saveUpdateRequest().then(success, failure);
                    });

                    expect(campaignState._updateRequest.data.targeting.interests).toEqual([]);
                    expect(campaignState._updateRequest.data.targeting.demographics.age).toEqual([]);
                });
            });

            describe('saveCampaign()', function() {
                var success, failure, serverChange;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    serverChange = 0;

                    spyOn(campaign, 'save').and.callFake(function() {
                        // make some change to the DB Model that the UI doesn't know about
                        campaign.change = ++serverChange;

                        return $q.when(campaign);
                    });

                    // put the DB Model on the state
                    campaignState._campaign = campaign;

                    // put the pojo on the state for the Ctrl to use
                    campaignState.campaign = campaign.pojoify();
                });

                it('should not save if _campaign is erased', function() {
                    campaignState._campaign._erased = true;

                    $rootScope.$apply(function() {
                        campaignState.saveCampaign().then(success, failure);
                    });

                    expect(campaign.save).not.toHaveBeenCalled();
                    expect(success).toHaveBeenCalledWith(campaignState.campaign);
                });

                it('should not save if _campaign is not a draft', function() {
                    campaignState.campaign.status = 'pending';

                    $rootScope.$apply(function() {
                        campaignState.saveCampaign().then(success, failure);
                    });

                    expect(campaign.save).not.toHaveBeenCalled();
                    expect(success).toHaveBeenCalledWith(campaignState.campaign);
                });


                it('should not save if user is not the creator', function() {
                    campaignState.isCreator = false;

                    $rootScope.$apply(function() {
                        campaignState.saveCampaign().then(success, failure);
                    });

                    expect(campaign.save).not.toHaveBeenCalled();
                    expect(success).toHaveBeenCalledWith(campaignState.campaign);
                });

                describe('when the campaign should actually save', function() {
                    beforeEach(function() {
                        campaignState.isCreator = true;
                    });

                    it('should update the campaign DB Model with the current campaign data and save', function() {
                        campaignState.campaign.name = 'New Campaign';

                        $rootScope.$apply(function() {
                            campaignState.saveCampaign().then(success, failure);
                        });

                        expect(campaign.save).toHaveBeenCalled();
                        expect(campaignState._campaign.name).toEqual('New Campaign');
                    });

                    it('should maintain data returned from the server in addition to UI updates', function() {
                        $rootScope.$apply(function() {
                            campaignState.saveCampaign();
                        });
                        expect(campaignState._campaign.change).toEqual(1);

                        $rootScope.$apply(function() {
                            campaignState.saveCampaign();
                        });
                        expect(campaignState._campaign.change).toEqual(2);

                        $rootScope.$apply(function() {
                            campaignState.saveCampaign();
                        });
                        expect(campaignState._campaign.change).toEqual(3);

                        $rootScope.$apply(function() {
                            campaignState.saveCampaign();
                        });
                        expect(campaignState._campaign.change).toEqual(4);
                    });

                    it('should return the pojoified campaign without the server updates', function() {
                        campaignState.campaign.name = 'New Campaign';

                        $rootScope.$apply(function() {
                            campaignState.saveCampaign().then(success, failure);
                        });

                        expect(success).toHaveBeenCalledWith(campaignState.campaign);
                    });

                    it('should not extend the cards array objects', function() {
                        campaignState.campaign.cards[0] = {};

                        $rootScope.$apply(function() {
                            campaignState.saveCampaign().then(success, failure);
                        });

                        expect(campaignState._campaign.cards[0]).toEqual(card);
                    });

                    it('should overwrite the targeting arrays', function() {
                        campaignState._campaign.targeting.interests.push('comedy');
                        campaignState._campaign.targeting.interests.push('entertainment');
                        campaignState.campaign.targeting.interests = [];

                        campaignState._campaign.targeting.demographics.age.push('18-24');
                        campaignState._campaign.targeting.demographics.age.push('25-34');
                        campaignState.campaign.targeting.demographics.age = [];

                        $rootScope.$apply(function() {
                            campaignState.saveCampaign().then(success, failure);
                        });

                        expect(campaignState._campaign.targeting.interests).toEqual([]);
                        expect(campaignState._campaign.targeting.demographics.age).toEqual([]);
                    });

                    describe('intercom tracking', function() {
                        describe('when campaign is new', function() {
                            it('should send a "createCampaign" event with metadata', function() {
                                campaignState._campaign.status = undefined;
                                campaignState.campaign.status = undefined;

                                campaignState._campaign.id = 'cam-123';
                                campaignState._campaign.name = undefined;
                                campaignState._campaign.advertiserId = 'a-123';
                                campaignState._campaign.advertiserDisplayName = undefined;

                                $rootScope.$apply(function() {
                                    campaignState.saveCampaign();
                                });

                                expect(intercom).toHaveBeenCalledWith('trackEvent', 'createCampaign', {
                                    campaignId: 'cam-123',
                                    campaignName: null,
                                    advertiserId: 'a-123',
                                    advertiserName: null
                                });
                            });
                        });

                        describe('when campaign is not new', function() {
                            describe('when "updateCampaign" has not yet been fired', function() {
                                it('should send an "updateCampaign" event with metadata', function() {
                                    campaignState._campaign.status = 'draft';
                                    campaignState.campaign.status = undefined;

                                    campaignState._campaign.id = 'cam-123';
                                    campaignState._campaign.name = 'My Campaign';
                                    campaignState._campaign.advertiserId = 'a-123';
                                    campaignState._campaign.advertiserDisplayName = 'Toyota';

                                    $rootScope.$apply(function() {
                                        campaignState.saveCampaign();
                                    });

                                    expect(intercom).toHaveBeenCalledWith('trackEvent', 'updateCampaign', {
                                        campaignId: 'cam-123',
                                        campaignName: 'My Campaign',
                                        advertiserId: 'a-123',
                                        advertiserName: 'Toyota'
                                    });
                                });
                            });

                            describe('when "updateCampaign" has fired and meta data has not changed', function() {
                                it('should only send one "updateCampaign" event with metadata', function() {
                                    campaignState._campaign.status = 'draft';
                                    campaignState.campaign.status = 'draft';

                                    campaignState._campaign.id = 'cam-123';
                                    campaignState._campaign.name = 'My Campaign';
                                    campaignState._campaign.advertiserId = 'a-123';
                                    campaignState._campaign.advertiserDisplayName = 'Toyota';


                                    $rootScope.$apply(function() {
                                        campaignState.saveCampaign();
                                    });

                                    expect(intercom).toHaveBeenCalledWith('trackEvent', 'updateCampaign', {
                                        campaignId: 'cam-123',
                                        campaignName: 'My Campaign',
                                        advertiserId: 'a-123',
                                        advertiserName: 'Toyota'
                                    });

                                    expect(campaignState.intercomData).toEqual({
                                        campaignId: 'cam-123',
                                        campaignName: 'My Campaign',
                                        advertiserId: 'a-123',
                                        advertiserName: 'Toyota'
                                    });

                                    $rootScope.$apply(function() {
                                        campaignState.saveCampaign();
                                    });

                                    $rootScope.$apply(function() {
                                        campaignState.saveCampaign();
                                    });

                                    expect(intercom.calls.count()).toBe(1);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
