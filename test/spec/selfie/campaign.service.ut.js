define(['app', 'minireel/services', 'c6uilib'], function(appModule, servicesModule, c6uilib) {
    'use strict';

    describe('CampaignService', function() {
        var $rootScope,
            cinema6,
            c6State,
            MiniReelService,
            CampaignService,
            NormalizationService,
            $q;

        var dbModel,
            campaign,
            cardTemplate,
            application,
            selfie;

        beforeEach(function() {
            module(c6uilib.name, function($provide) {
                $provide.decorator('cinema6', function($delegate) {
                    var create = $delegate.db.create;

                    spyOn($delegate.db, 'create').and.callFake(function() {
                        return (dbModel = create.apply($delegate.db, arguments));
                    });

                    return $delegate;
                });
            });

            module(servicesModule.name, function($provide) {
                $provide.decorator('MiniReelService', function($delegate) {
                    var createCard = $delegate.createCard;

                    spyOn($delegate, 'createCard').and.callFake(function() {
                        return (cardTemplate = createCard.apply($delegate, arguments));
                    });

                    return $delegate;
                });
            });

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');
                $q = $injector.get('$q');
                CampaignService = $injector.get('CampaignService');
                NormalizationService = $injector.get('NormalizationService');

                spyOn(NormalizationService, 'normalize').and.callThrough();

                application = c6State.get('Application');
                application.name = 'Selfie';
                selfie = c6State.get('Selfie');
                selfie.cModel = {
                    advertiser: {
                        id: 'a-111'
                    },
                    customer: {
                        id: 'cus-111'
                    },
                    company: 'My Company, Inc.'
                };
            });
        });

        it('should be defined', function() {
            expect(CampaignService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('create(campaign)', function() {
                describe('when creating a new campaign', function() {
                    var result, cardResult;

                    beforeEach(function() {
                        result = CampaignService.create();
                        cardResult = result.cards[0];
                    });

                    it('should create a new card', function() {
                        expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                    });

                    it('should initialize a new campaign', function() {
                        expect(cinema6.db.create).toHaveBeenCalledWith('selfieCampaign', {});
                    });

                    it('should normalize the new campaign with the DB Model as the target', function() {
                        expect(NormalizationService.normalize).toHaveBeenCalledWith(jasmine.any(Object), undefined, dbModel);
                    });

                    it('should return a campaign with proper defaults', function() {
                        expect(result).toEqual(jasmine.objectContaining({
                            advertiserId: selfie.cModel.advertiser.id,
                            customerId: selfie.cModel.customer.id,
                            name: undefined,
                            pricing: {},
                            status: 'draft',
                            application: 'selfie',
                            advertiserDisplayName: selfie.cModel.company,
                            paymentMethod: undefined,
                            targeting: {
                                geo: {
                                    states: [],
                                    dmas: []
                                },
                                demographics: {
                                    age: [],
                                    gender: [],
                                    income: []
                                },
                                interests: []
                            },
                            cards: [cardResult]
                        }));
                    });

                    it('should add Selfie default values to the card', function() {
                        expect(cardResult.id).toBe(undefined);
                        expect(cardResult.campaignId).toBe(undefined);
                        expect(cardResult.campaign.minViewTime).toBe(3);
                        expect(cardResult.sponsored).toBe(true);
                        expect(cardResult.collateral.logo).toBe(undefined);
                        expect(cardResult.links).toEqual({});
                        expect(cardResult.params).toEqual({
                            ad: true,
                            action: null
                        });
                        expect(cardResult.data).toEqual(jasmine.objectContaining({
                            autoadvance: false,
                            controls: false,
                            autoplay: true,
                            skip: 30
                        }));
                    });

                    it('should be a new campaign object', function() {
                        expect(result).toEqual(dbModel);
                    });
                });

                describe('when copying an existing campaign', function() {
                    var result, cardResult, existingCampaign;

                    beforeEach(function() {
                        existingCampaign = {
                            id: 'cam-1234',
                            name: 'My Great Campaign',
                            advertiserId: 'a-1234',
                            customerId: 'cus-1234',
                            pricing: {
                                budget: 1000,
                                dailyLimit: 100
                            },
                            pricingHistory: [
                                {
                                    pricing: {
                                        model: 'cpv',
                                        cost: 0.1
                                    },
                                    userId: 'u-42f63f17d67d0c',
                                    user: 'sqmunson@gmail.com',
                                    date: '2015-10-27T14:33:12.032Z'
                                }
                            ],
                            statusHistory: [
                                {
                                    status: 'draft',
                                    userId: 'u-42f63f17d67d0c',
                                    user: 'sqmunson@gmail.com',
                                    date: '2015-10-27T14:33:12.029Z'
                                }
                            ],
                            advertiserDisplayName: 'My Brand',
                            paymentMethod: 'pay-1234',
                            targeting: {
                                geo: {
                                    states: ['alaska'],
                                    dmas: ['New York City']
                                },
                                demographics: {
                                    age: [],
                                    gender: ['male'],
                                    income: []
                                },
                                interests: ['cars','guns']
                            },
                            cards: [
                                {
                                    id: 'rc-1234',
                                    campaignId: 'cam-1234',
                                    campaign: {
                                        campaignId: 'cam-1234',
                                        advertiserId: 'a-123',
                                        minViewTime: 3,
                                        countUrls: [],
                                        clickUrls: []
                                    },
                                    data: {
                                        videoid: '12345',
                                        service: 'youtube'
                                    },
                                    links: {
                                        Action: 'http://nike.com'
                                    },
                                    params: {
                                        ad: true,
                                        action: {
                                            type: 'button',
                                            label: 'Buy this'
                                        }
                                    }
                                }
                            ]
                        };

                        result = CampaignService.create(existingCampaign);
                        cardResult = result.cards[0];
                    });

                    it('should initialize a new campaign', function() {
                        expect(cinema6.db.create).toHaveBeenCalledWith('selfieCampaign', {});
                    });

                    it('should normalize the new campaign with the DB Model as the target and the existing campaign as the base', function() {
                        expect(NormalizationService.normalize).toHaveBeenCalledWith(jasmine.any(Object), existingCampaign, dbModel);
                    });

                    it('should remove the bad card properties but leave the good ones when copying', function() {
                        expect(cardResult.id).toBe(undefined);
                        expect(cardResult.campaign).toEqual({ minViewTime: 3 });
                        expect(cardResult.campaignId).toBe(undefined);

                        expect(cardResult.links).toEqual(existingCampaign.cards[0].links);
                        expect(cardResult.data).toEqual(existingCampaign.cards[0].data);
                        expect(cardResult.params).toEqual(existingCampaign.cards[0].params);
                    });

                    it('should remove the bad props but leave the good ones on the campaign', function() {
                        expect(result.id).toEqual(undefined);
                        expect(result.statusHistory).toEqual(undefined);
                        expect(result.statusHistory).toEqual(undefined);

                        expect(result.targeting).toEqual(existingCampaign.targeting);
                        expect(result.paymentMethod).toEqual(existingCampaign.paymentMethod);
                        expect(result.pricing).toEqual(existingCampaign.pricing);
                        expect(result.advertiserDisplayName).toEqual(existingCampaign.advertiserDisplayName);
                        expect(result.advertiserId).toEqual(existingCampaign.advertiserId);
                        expect(result.customerId).toEqual(existingCampaign.customerId);

                        expect(result.name).toEqual(existingCampaign.name + ' (Copy)');
                        expect(result.status).toEqual('draft');
                        expect(result.application).toEqual('selfie');
                    });

                    it('should be a new campaign object', function() {
                        expect(result).toEqual(dbModel);
                    });
                });
            });

            describe('normalize(campaign)', function() {
                var campaign;

                beforeEach(function() {
                    campaign = {
                        id: 'c-123',
                        status: 'active',
                        name: 'My Campaign'
                    };
                });

                it('should use the NormalizationService', function() {
                    CampaignService.normalize(campaign);

                    expect(NormalizationService.normalize).toHaveBeenCalledWith(jasmine.any(Object), campaign, campaign);
                });

                it('should default the advertiserDisplayName to the users company name ', function() {
                    var result = CampaignService.normalize(campaign);

                    expect(result.advertiserDisplayName).toBe('My Company, Inc.');
                });
            });
        });
    });
});