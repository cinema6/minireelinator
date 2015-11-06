define(['app', 'minireel/services', 'c6uilib'], function(appModule, servicesModule, c6uilib) {
    'use strict';

    describe('CampaignService', function() {
        var $rootScope,
            cinema6,
            c6State,
            MiniReelService,
            CampaignService,
            NormalizationService,
            $q,
            $httpBackend;

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
                $httpBackend = $injector.get('$httpBackend');

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

            describe('getSchema', function() {
                var success, failure, schema;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    schema = {
                        pricing: {
                            cost: {},
                            budget: {},
                            dailyLimit: {}
                        }
                    };
                });

                it('should request stats for a single campaign and return an array', function() {
                    $httpBackend.expectGET('/api/campaigns/schema?personalized=true')
                        .respond(200, schema);

                    CampaignService.getSchema().then(success, failure);

                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(schema);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject the promise if the request fails', function() {
                    $httpBackend.expectGET('/api/campaigns/schema?personalized=true')
                        .respond(404, 'NOT FOUND');

                    CampaignService.getSchema().then(success, failure);

                    $httpBackend.flush();

                    expect(success).not.toHaveBeenCalledWith(schema);
                    expect(failure).toHaveBeenCalled();
                });
            });

            describe('getAnalytics(ids)', function() {
                var success, failure, stats;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    stats = [
                        {
                            campaignId: 'cam-1',
                            summary: {
                                views: 100,
                                totalSpend: '10.00'
                            }
                        },
                        {
                            campaignId: 'cam-2',
                            summary: {
                                views: 2000,
                                totalSpend: '500.50'
                            }
                        }
                    ];
                });

                describe('when fetching multiple campaigns', function() {
                    it('should request stats for multiple campaigns and return an array', function() {
                        $httpBackend.expectGET('/api/analytics/campaigns/?ids=cam-1,cam-2')
                            .respond(200, stats);

                        CampaignService.getAnalytics('cam-1,cam-2').then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith(stats);
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if the request fails', function() {
                        $httpBackend.expectGET('/api/analytics/campaigns/?ids=cam-1,cam-2')
                            .respond(404, 'NOT FOUND');

                        CampaignService.getAnalytics('cam-1,cam-2').then(success, failure);

                        $httpBackend.flush();

                        expect(success).not.toHaveBeenCalledWith(stats);
                        expect(failure).toHaveBeenCalled();
                    });
                });

                describe('when fetching a single campaign', function() {
                    it('should request stats for a single campaign and return an array', function() {
                        $httpBackend.expectGET('/api/analytics/campaigns/cam-1')
                            .respond(200, stats[0]);

                        CampaignService.getAnalytics('cam-1').then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith( [ stats[0] ] );
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if the request fails', function() {
                        $httpBackend.expectGET('/api/analytics/campaigns/cam-1')
                            .respond(404, 'NOT FOUND');

                        CampaignService.getAnalytics('cam-1').then(success, failure);

                        $httpBackend.flush();

                        expect(success).not.toHaveBeenCalledWith( [ stats[0] ] );
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });

            describe('getUserData(ids)', function() {
                var success, failure, users, usersHash;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    users = [
                        {
                            id: 'u-1',
                            firstName: 'Johnny',
                            lastName: 'Testmonkey',
                            company: 'Tester, LLC'
                        },
                        {
                            id: 'u-2',
                            firstName: 'Brent',
                            lastName: 'Rambo',
                            company: 'Rambo, Inc.'
                        },
                        {
                            id: 'u-3',
                            firstName: 'Turtle',
                            lastName: 'Monster',
                            company: 'Monster, Inc.'
                        }
                    ];

                    usersHash = {
                        'u-1': {
                            id: 'u-1',
                            firstName: 'Johnny',
                            lastName: 'Testmonkey',
                            company: 'Tester, LLC'
                        },
                        'u-2': {
                            id: 'u-2',
                            firstName: 'Brent',
                            lastName: 'Rambo',
                            company: 'Rambo, Inc.'
                        },
                        'u-3': {
                            id: 'u-3',
                            firstName: 'Turtle',
                            lastName: 'Monster',
                            company: 'Monster, Inc.'
                        }
                    };
                });

                describe('when fetching multiple users', function() {
                    it('should request users and return a hash keyed by id', function() {
                        $httpBackend.expectGET('/api/account/users?ids=u-1,u-2,u-3&fields=firstName,lastName,company')
                            .respond(200, users);

                        CampaignService.getUserData('u-1,u-2,u-3').then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith(usersHash);
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if the request fails', function() {
                        $httpBackend.expectGET('/api/account/users?ids=u-1,u-2,u-3&fields=firstName,lastName,company')
                            .respond(404, 'NOT FOUND');

                        CampaignService.getUserData('u-1,u-2,u-3').then(success, failure);

                        $httpBackend.flush();

                        expect(success).not.toHaveBeenCalledWith(usersHash);
                        expect(failure).toHaveBeenCalled();
                    });
                });

                describe('when fetching a single campaign', function() {
                    it('should request the user and return a hash', function() {
                        var singleUser = users[1],
                            singleHash = {
                                'u-2': usersHash['u-2']
                            };

                        $httpBackend.expectGET('/api/account/users/u-2?fields=firstName,lastName,company')
                            .respond(200, singleUser);

                        CampaignService.getUserData('u-2').then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith(singleHash);
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if the request fails', function() {
                        $httpBackend.expectGET('/api/account/users/u-2?fields=firstName,lastName,company')
                            .respond(404, 'NOT FOUND');

                        CampaignService.getUserData('u-2').then(success, failure);

                        $httpBackend.flush();

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });

            describe('campaignDiffSummary', function() {
                var originalCampaign, updatedCampaign, result;

                beforeEach(function() {
                    spyOn(CampaignService, '_generateSummary').and.callThrough();
                    originalCampaign = {
                        id: 'c-123',
                        cards: [
                            {
                                title: 'original title'
                            }
                        ]
                    };
                    updatedCampaign = {
                        id: 'c-123',
                        cards: [
                            {
                                title: 'updated title'
                            }
                        ]
                    };
                    result = CampaignService.campaignDiffSummary(originalCampaign, updatedCampaign, 'Campaign', 'Card');
                });

                it('should generate a summary of campaign differences', function() {
                    expect(CampaignService._generateSummary).toHaveBeenCalledWith({
                        id: 'c-123'
                    }, {
                        id: 'c-123'
                    }, 'Campaign');
                });

                it('should generate a summary of card differences', function() {
                    expect(CampaignService._generateSummary).toHaveBeenCalledWith({
                        title: 'original title'
                    }, {
                        title: 'updated title'
                    }, 'Card');
                });

                it('should return a summary of changes', function() {
                    expect(result).toEqual([{
                        originalValue: 'original title',
                        updatedValue: 'updated title',
                        key: 'title',
                        type: 'Card'
                    }]);
                });
            });
        });
    });
});
