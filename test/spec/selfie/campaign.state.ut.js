define(['app'], function(appModule) {
    'use strict';

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
                ConfirmDialogService;

            var card,
                categories,
                campaign,
                logos,
                paymentMethods;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');
                    SelfieLogoService = $injector.get('SelfieLogoService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');

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
                        links: {}
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

                    selfieState = c6State.get('Selfie');
                    selfieState.cModel = {
                        advertiser: {},
                        org: {
                            id: 'o-123'
                        }
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

            describe('_campaign', function() {
                it('should be null', function() {
                    expect(campaignState._campaign).toBe(null);
                });
            });

            describe('beforeModel()', function() {
                it('should put the card and campaign on the state object', function() {
                    var pojo = campaign.pojoify();

                    campaignState.cParent.campaign = campaign;

                    campaignState.beforeModel();

                    expect(campaignState.card).toEqual(pojo.cards[0]);
                    expect(campaignState.campaign).toEqual(pojo);
                    expect(campaignState.advertiser).toEqual(selfieState.cModel.advertiser);
                    expect(campaignState._campaign).toEqual(campaign);
                });
            });

            describe('model()', function() {
                it('should find all categories and logos', function() {
                    var success = jasmine.createSpy('success()'),
                        failure = jasmine.createSpy('failure()');

                    spyOn(cinema6.db, 'findAll').and.callFake(function(type) {
                        if (type === 'category') {
                            return $q.when(categories);
                        }
                        if (type === 'paymentMethod') {
                            return $q.when(paymentMethods);
                        }
                    });
                    spyOn(SelfieLogoService, 'getLogos').and.returnValue($q.when(logos));

                    $rootScope.$apply(function() {
                        campaignState.model().then(success, failure);
                    });
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('category');
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                    expect(SelfieLogoService.getLogos).toHaveBeenCalled();
                    expect(success).toHaveBeenCalledWith({
                        categories: categories,
                        logos: logos,
                        paymentMethods: paymentMethods
                    });
                });
            });

            describe('afterModel()', function() {
                describe('when there is a Primary Payment Method', function() {
                    it('should add it to the campaign if the campaign does not have one', function() {
                        campaignState.campaign = campaign;

                        paymentMethods[1].default = true;

                        campaignState.afterModel({ paymentMethods: paymentMethods });

                        expect(campaignState.campaign.paymentMethod).toEqual('pay-2');
                    });

                    it('should not overwrite an existing payment on the campaign', function() {
                        campaign.paymentMethod = paymentMethods[2].token;
                        campaignState.campaign = campaign;

                        paymentMethods[1].default = true;

                        campaignState.afterModel({ paymentMethods: paymentMethods });

                        expect(campaignState.campaign.paymentMethod).toEqual(paymentMethods[2].token);
                    });
                });

                describe('when there is no Primary Payment Method', function() {
                    it('should leave paymentMethod undefined', function() {
                        campaignState.campaign = campaign;

                        campaignState.afterModel({ paymentMethods: [] });

                        expect(campaignState.campaign.paymentMethod).toEqual(undefined);
                    });

                    it('should not overwrite an existing payment on the campaign', function() {
                        campaign.paymentMethod = paymentMethods[2].token;
                        campaignState.campaign = campaign;

                        campaignState.afterModel({ paymentMethods: [] });

                        expect(campaignState.campaign.paymentMethod).toEqual(paymentMethods[2].token);
                    });
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
                });

                describe('when campaign is not in draft', function() {
                    it('should resolve the promise', function() {
                        campaign.status = 'active';
                        campaignState._campaign = campaign;

                        $rootScope.$apply(function() {
                            campaignState.exit().then(success, failure);
                        });

                        expect(success).toHaveBeenCalled();
                        expect(campaignState.saveCampaign).not.toHaveBeenCalled();
                    });
                });

                describe('when the campaign is a draft', function() {
                    beforeEach(function() {
                        campaign.status = 'draft';
                        campaignState._campaign = campaign;

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
            });
        });
    });
});