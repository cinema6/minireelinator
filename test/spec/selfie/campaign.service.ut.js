define(['app', 'minireel/services', 'c6uilib', 'c6_defines'], function(appModule, servicesModule, c6uilib, c6Defines) {
    'use strict';

    describe('CampaignService', function() {
        var $rootScope,
            cinema6,
            c6State,
            MiniReelService,
            CampaignService,
            NormalizationService,
            $q,
            $httpBackend,
            $filter;

        var dbModel,
            campaign,
            cardTemplate,
            application,
            selfie,
            user,
            advertiser;

        function num(num) {
            return parseFloat($filter('number')(num, 2));
        }

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
                $filter = $injector.get('$filter');

                spyOn(NormalizationService, 'normalize').and.callThrough();

                user = {
                    id: 'u-123',
                    advertiser: {
                        id: 'a-123'
                    },
                    company: 'Best Company Ever'
                };

                advertiser = {
                    id: 'a-123'
                };

                application = c6State.get('Application');
                application.name = 'Selfie';
                selfie = c6State.get('Selfie');
                selfie.cModel = {
                    id: 'u-111',
                    advertiser: {
                        id: 'a-111'
                    },
                    company: 'My Company, Inc.'
                };
            });
        });

        afterAll(function() {
            $rootScope = null;
            cinema6 = null;
            c6State = null;
            MiniReelService = null;
            CampaignService = null;
            NormalizationService = null;
            $q = null;
            $httpBackend = null;
            $filter = null;
            dbModel = null;
            campaign = null;
            cardTemplate = null;
            application = null;
            selfie = null;
            user = null;
            advertiser = null;
        });

        it('should be defined', function() {
            expect(CampaignService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('create(campaign, user, advertiser)', function() {
                describe('when creating a new campaign', function() {
                    var result, cardResult;

                    beforeEach(function() {
                        result = CampaignService.create(null, null, advertiser);
                        cardResult = result.cards[0];
                    });

                    it('should create a new card', function() {
                        expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                    });

                    it('should initialize a new campaign', function() {
                        expect(cinema6.db.create).toHaveBeenCalledWith('selfieCampaign', {});
                    });

                    it('should normalize the new campaign with the DB Model as the target', function() {
                        expect(NormalizationService.normalize).toHaveBeenCalledWith(jasmine.any(Object), null, dbModel);
                    });

                    it('should return a campaign with proper defaults', function() {
                        expect(result).toEqual(jasmine.objectContaining({
                            advertiserId: advertiser.id,
                            name: undefined,
                            pricing: {},
                            application: 'selfie',
                            advertiserDisplayName: selfie.cModel.company,
                            targeting: {
                                geo: {
                                    states: [],
                                    dmas: [],
                                    zipcodes: {
                                        codes: []
                                    }
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
                            action: {
                                type: 'button',
                                label: 'Learn More'
                            }
                        });
                        expect(cardResult.data).toEqual(jasmine.objectContaining({
                            autoadvance: false,
                            controls: true,
                            autoplay: true,
                            moat: undefined
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
                        expect(result.pricing).toEqual(existingCampaign.pricing);
                        expect(result.advertiserDisplayName).toEqual(existingCampaign.advertiserDisplayName);
                        expect(result.advertiserId).toEqual(existingCampaign.advertiserId);

                        expect(result.name).toEqual(existingCampaign.name + ' (Copy)');
                        expect(result.application).toEqual('selfie');
                    });

                    it('should be a new campaign object', function() {
                        expect(result).toEqual(dbModel);
                    });
                });

                describe('when passing in a user', function() {
                    it('should use that data', function() {
                        var result = CampaignService.create(null, user, advertiser);

                        expect(result.advertiserDisplayName).toEqual(user.company);
                    });
                });
            });

            describe('normalize(campaign, user)', function() {
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

                describe('when passing in a user', function() {
                    it('should use that user data', function() {
                        var result = CampaignService.normalize(campaign, user);

                        expect(result.advertiserDisplayName).toEqual(user.company);
                    });
                });
            });

            describe('previewUrlOf(campaign)', function() {
                describe('when campaign has no video', function() {
                    it('should be false', function() {
                        var campaign = {
                            id: 'cam-123',
                            cards: [
                                {
                                    id: 'rc-123',
                                    data: {}
                                }
                            ]
                        };

                        expect(CampaignService.previewUrlOf(campaign)).toBe(false);
                    });
                });

                describe('when campaign has a video', function() {
                    var campaign;

                    beforeEach(function() {
                        campaign = {
                            id: 'cam-123',
                            cards: [
                                {
                                    id: 'rc-123',
                                    data: {
                                        service: 'youtube',
                                        videoid: '12345'
                                    }
                                }
                            ]
                        };
                    });

                    describe('when user is running locally or in staging', function() {
                        it('should be /preview-staging/?previewSource=platform&campaign=[id]', function() {
                            c6Defines.kDebug = true;

                            expect(CampaignService.previewUrlOf(campaign)).toBe('//reelcontent.com/preview-staging/?previewSource=platform&campaign=cam-123');
                        });
                    });

                    describe('when user is running in production', function() {
                        it('should be /preview/?previewSource=platform&campaign=[id]', function() {
                            c6Defines.kDebug = false;

                            expect(CampaignService.previewUrlOf(campaign)).toBe('//reelcontent.com/preview/?previewSource=platform&campaign=cam-123');
                        });
                    });
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

                it('should request the schema', function() {
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

            describe('getZip(zip)', function() {
                var success, failure, zip;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    zip = {
                        status: 'active',
                        country: 'US',
                        zipcode: '12345',
                        city: 'Princeton',
                        stateName: 'New Jersey',
                        stateCode: 'NJ',
                        countyName: 'Mercer',
                        countyCode: '123',
                        loc: []
                    };
                });

                it('should request the zip', function() {
                    $httpBackend.expectGET('/api/geo/zipcodes/12345')
                        .respond(200, zip);

                    CampaignService.getZip('12345').then(success, failure);

                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(zip);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject the promise if the request fails', function() {
                    $httpBackend.expectGET('/api/geo/zipcodes/12345')
                        .respond(404, 'NOT FOUND');

                    CampaignService.getZip('12345').then(success, failure);

                    $httpBackend.flush();

                    expect(success).not.toHaveBeenCalledWith(zip);
                    expect(failure).toHaveBeenCalled();
                });
            });

            describe('getOrgs()', function() {
                var success, failure, orgs;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    orgs = [
                        {
                            id: 'o-111'
                        },
                        {
                            id: 'o-222'
                        },
                        {
                            id: 'o-333'
                        }
                    ];
                });

                it('should request stats for a single campaign and return an array', function() {
                    $httpBackend.expectGET('/api/account/orgs?fields=id,name')
                        .respond(200, orgs);

                    CampaignService.getOrgs().then(success, failure);

                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(orgs);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject the promise if the request fails', function() {
                    $httpBackend.expectGET('/api/account/orgs?fields=id,name')
                        .respond(404, 'NOT FOUND');

                    CampaignService.getOrgs().then(success, failure);

                    $httpBackend.flush();

                    expect(success).not.toHaveBeenCalledWith(orgs);
                    expect(failure).toHaveBeenCalled();
                });
            });

            describe('hasCampaigns', function() {
                var success, failure, campaigns;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    campaigns = [{id: 'cam-123'}];
                });

                it('should return true if there is a campaign', function() {
                    $httpBackend.expectGET('/api/campaigns?limit=1&fields=id')
                        .respond(200, campaigns);

                    CampaignService.hasCampaigns().then(success, failure);

                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(true);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should return false if there is no campaign', function() {
                    $httpBackend.expectGET('/api/campaigns?limit=1&fields=id')
                        .respond(200, []);

                    CampaignService.hasCampaigns().then(success, failure);

                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(false);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject the promise if the request fails', function() {
                    $httpBackend.expectGET('/api/campaigns?limit=1&fields=id')
                        .respond(404, 'NOT FOUND');

                    CampaignService.hasCampaigns().then(success, failure);

                    $httpBackend.flush();

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalled();
                });
            });

            describe('getAnalytics(query)', function() {
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
                        $httpBackend.expectGET('/api/analytics/campaigns?endDate=2016-01-22&ids=cam-1,cam-2&startDate=2016-01-12')
                            .respond(200, stats);

                        CampaignService.getAnalytics({
                            ids: 'cam-1,cam-2',
                            startDate: '2016-01-12',
                            endDate: '2016-01-22'
                        }).then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith(stats);
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if the request fails', function() {
                        $httpBackend.expectGET('/api/analytics/campaigns?ids=cam-1,cam-2')
                            .respond(404, 'NOT FOUND');

                        CampaignService.getAnalytics({ids: 'cam-1,cam-2'}).then(success, failure);

                        $httpBackend.flush();

                        expect(success).not.toHaveBeenCalledWith(stats);
                        expect(failure).toHaveBeenCalled();
                    });
                });

                describe('when fetching a single campaign', function() {
                    it('should request stats for a single campaign and return an array', function() {
                        $httpBackend.expectGET('/api/analytics/campaigns?endDate=2016-01-22&ids=cam-1&startDate=2016-01-12')
                            .respond(200, [stats[0]]);

                        CampaignService.getAnalytics({
                            ids: 'cam-1',
                            startDate: '2016-01-12',
                            endDate: '2016-01-22'
                        }).then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith( [ stats[0] ] );
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if the request fails', function() {
                        $httpBackend.expectGET('/api/analytics/campaigns?ids=cam-1')
                            .respond(404, 'NOT FOUND');

                        CampaignService.getAnalytics({ids: 'cam-1'}).then(success, failure);

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

            describe('getTargetingCost(schema)', function() {
                describe('when pricing for main targeting categories are all equal', function() {
                    it('should contain an object with pricing data', function() {
                        var schema = {
                            pricing: {
                                cost: {
                                    __base: 0.05,
                                    __pricePerGeo: 0.00,
                                    __priceForGeoTargeting: 0.01,
                                    __pricePerDemo: 0.00,
                                    __priceForDemoTargeting: 0.01,
                                    __priceForInterests: 0.01
                                }
                            }
                        };

                        var result = CampaignService.getTargetingCost(schema);

                        expect(result.categories).toEqual({
                            areEqual: true,
                            geo: 0.01,
                            demo: 0.01,
                            interests: 0.01
                        });
                    });
                });

                describe('when pricing for main targeting categories are not all equal', function() {
                    it('should contain an object with pricing data', function() {
                        var schema = {
                            pricing: {
                                cost: {
                                    __base: 0.05,
                                    __pricePerGeo: 0.00,
                                    __priceForGeoTargeting: 0.01,
                                    __pricePerDemo: 0.00,
                                    __priceForDemoTargeting: 0.02,
                                    __priceForInterests: 0.01
                                }
                            }
                        };

                        var result = CampaignService.getTargetingCost(schema);

                        expect(result.categories).toEqual({
                            areEqual: false,
                            geo: 0.01,
                            demo: 0.02,
                            interests: 0.01
                        });
                    });
                });

                describe('when pricing for targeting sub-categories are all equal', function() {
                    it('should contain an object with pricing data', function() {
                        var schema = {
                            pricing: {
                                cost: {
                                    __base: 0.05,
                                    __pricePerGeo: 0.01,
                                    __priceForGeoTargeting: 0.00,
                                    __pricePerDemo: 0.01,
                                    __priceForDemoTargeting: 0.00,
                                    __priceForInterests: 0.01
                                }
                            }
                        };

                        var result = CampaignService.getTargetingCost(schema);

                        expect(result.subcategories).toEqual({
                            areEqual: true,
                            geo: 0.01,
                            demo: 0.01,
                            interests: 0.01
                        });
                    });
                });

                describe('when pricing for targeting sub-categories are not all equal', function() {
                    it('should contain an object with pricing data', function() {
                        var schema = {
                            pricing: {
                                cost: {
                                    __base: 0.05,
                                    __pricePerGeo: 0.01,
                                    __priceForGeoTargeting: 0.00,
                                    __pricePerDemo: 0.02,
                                    __priceForDemoTargeting: 0.00,
                                    __priceForInterests: 0.01
                                }
                            }
                        };

                        var result = CampaignService.getTargetingCost(schema);

                        expect(result.subcategories).toEqual({
                            areEqual: false,
                            geo: 0.01,
                            demo: 0.02,
                            interests: 0.01
                        });
                    });
                });
            });

            describe('getCpv(campaign, schema)', function() {
                describe('when pricing is FOR demo, geo and interests', function() {
                    it('should add $.01 each for demo, location, interests', function() {
                        var campaign = {
                                targeting: {
                                    geo: {
                                        states: [],
                                        dmas: [],
                                        zipcodes: {
                                            codes: []
                                        }
                                    },
                                    demographics: {
                                        age: [],
                                        income: [],
                                        gender: []
                                    },
                                    interests: []
                                }
                            },
                            schema = {
                                pricing: {
                                    cost: {
                                        __base: 0.05,
                                        __pricePerGeo: 0.00,
                                        __priceForGeoTargeting: 0.01,
                                        __pricePerDemo: 0.00,
                                        __priceForDemoTargeting: 0.01,
                                        __priceForInterests: 0.01
                                    }
                                }
                            };

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.05);

                        campaign.targeting.geo.states.push('Arizona');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.geo.states.push('Alabama');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.geo.dmas.push('Chicago');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.geo.dmas.push('New York City');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.geo.zipcodes.codes.push('11231');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.geo.zipcodes.codes.push('56732');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.interests.push('comedy');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.07);

                        campaign.targeting.interests.push('entertainment');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.07);

                        campaign.targeting.demographics.age.push('18-24');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.demographics.age.push('25-40');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.demographics.income.push('20,000-50,000');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.demographics.income.push('120,000-150,000');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.demographics.gender.push('Male');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.demographics.gender.push('Male');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);
                    });
                });

                describe('when pricing is PER demo, geo and interest', function() {
                    it('should add $.01 each per demo, location, interests', function() {
                        var campaign = {
                                targeting: {
                                    geo: {
                                        states: [],
                                        dmas: [],
                                        zipcodes: {
                                            codes: []
                                        }
                                    },
                                    demographics: {
                                        age: [],
                                        income: [],
                                        gender: []
                                    },
                                    interests: []
                                }
                            },
                            schema = {
                                pricing: {
                                    cost: {
                                        __base: 0.05,
                                        __pricePerGeo: 0.01,
                                        __priceForGeoTargeting: 0.00,
                                        __pricePerDemo: 0.01,
                                        __priceForDemoTargeting: 0.00,
                                        __priceForInterests: 0.01
                                    }
                                }
                            };

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.05);

                        campaign.targeting.geo.states.push('Arizona');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.geo.states.push('Alabama');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.06);

                        campaign.targeting.geo.dmas.push('Chicago');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.07);

                        campaign.targeting.geo.dmas.push('New York City');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.07);

                        campaign.targeting.geo.zipcodes.codes.push('12878');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.geo.zipcodes.codes.push('12879');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.interests.push('comedy');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.09);

                        campaign.targeting.interests.push('entertainment');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.09);

                        campaign.targeting.demographics.age.push('18-24');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.10);

                        campaign.targeting.demographics.age.push('25-40');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.10);

                        campaign.targeting.demographics.income.push('20,000-50,000');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.11);

                        campaign.targeting.demographics.income.push('120,000-150,000');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.11);

                        campaign.targeting.demographics.gender.push('Male');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.12);

                        campaign.targeting.demographics.gender.push('Male');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.12);
                    });
                });

                describe('when pricing is PER and FOR demo, geo and interest', function() {
                    it('should add $.01 each per demo, location, interests', function() {
                        var campaign = {
                                targeting: {
                                    geo: {
                                        states: [],
                                        dmas: [],
                                        zipcodes: {
                                            codes: []
                                        }
                                    },
                                    demographics: {
                                        age: [],
                                        income: [],
                                        gender: []
                                    },
                                    interests: []
                                }
                            },
                            schema = {
                                pricing: {
                                    cost: {
                                        __base: 0.05,
                                        __pricePerGeo: 0.01,
                                        __priceForGeoTargeting: 0.01,
                                        __pricePerDemo: 0.01,
                                        __priceForDemoTargeting: 0.01,
                                        __priceForInterests: 0.01
                                    }
                                }
                            };

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.05);

                        campaign.targeting.geo.states.push('Arizona');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.07);

                        campaign.targeting.geo.states.push('Alabama');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.07);

                        campaign.targeting.geo.dmas.push('Chicago');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.geo.dmas.push('New York City');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.08);

                        campaign.targeting.interests.push('comedy');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.09);

                        campaign.targeting.interests.push('entertainment');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.09);

                        campaign.targeting.demographics.age.push('18-24');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.11);

                        campaign.targeting.demographics.age.push('25-40');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.11);

                        campaign.targeting.demographics.income.push('20,000-50,000');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.12);

                        campaign.targeting.demographics.income.push('120,000-150,000');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.12);

                        campaign.targeting.demographics.gender.push('Male');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.13);

                        campaign.targeting.demographics.gender.push('Male');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.13);

                        campaign.targeting.geo.zipcodes.codes.push('12878');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.14);

                        campaign.targeting.geo.zipcodes.codes.push('12879');

                        expect(num(CampaignService.getCpv(campaign, schema))).toBe(0.14);
                    });
                });
            });

            describe('getSummary(config)', function() {
                var campaign, interests;

                beforeEach(function() {
                    campaign = {
                        cards: [
                            {
                                campaign: {
                                    startDate: undefined,
                                    endDate: undefined
                                }
                            }
                        ],
                        targeting: {
                            demographics: {
                                age: ['18-24','25-36'],
                                income: [],
                                gender: ['Male']
                            },
                            geo: {
                                states: ['Alabama','Alaska'],
                                dmas: ['NYC'],
                                zipcodes: {
                                    codes: ['11231','11019','12345']
                                }
                            },
                            interests: ['cat-1','cat-3']
                        },
                        pricing: {},
                        advertiserDisplayName: 'Ny Company'
                    };

                    interests = [
                        {
                            id: 'cat-1',
                            label: 'Comedy'
                        },
                        {
                            id: 'cat-2',
                            label: 'Cars'
                        },
                        {
                            id: 'cat-3',
                            label: 'Technology'
                        },
                        {
                            id: 'cat-4',
                            label: 'Cooking'
                        }
                    ];
                });

                describe('when campaign is not defined', function() {
                    it('should do nothing', function() {
                        var result = CampaignService.getSummary({
                            campaign: undefined,
                            interests: interests
                        });

                        expect(result).toEqual(undefined);
                    });
                });

                describe('when campaign is defined', function() {
                    var result;

                    beforeEach(function() {
                        result = CampaignService.getSummary({
                            campaign: campaign,
                            interests: interests
                        });
                    });

                    it('should generate pricing object', function() {
                        expect(result.pricing).toEqual(campaign.pricing);
                    });

                    it('should generate advertiser name', function() {
                        expect(result.advertiser).toEqual(campaign.advertiserDisplayName);
                    });

                    it('should generate demographics data', function() {
                        expect(result.demographics).toEqual({
                            age: {
                                name: 'Age',
                                list: '18-24, 25-36'
                            },
                            gender: {
                                name: 'Gender',
                                list: 'Male'
                            },
                            income: {
                                name: 'Income',
                                list: ''
                            }
                        });
                    });

                    it('should generate geo data', function() {
                        expect(result.geo).toEqual({
                            states: {
                                name: 'States',
                                list: 'Alabama, Alaska'
                            },
                            dmas: {
                                name: 'DMA',
                                list: 'NYC'
                            },
                            zipcodes: {
                                name: 'Zip Codes',
                                list: '11231, 11019, 12345'
                            }
                        });
                    });

                    it('should set duration based on start and end date', function() {
                        expect(result.duration).toEqual('Once approved, run until stopped.');

                        campaign.cards[0].campaign.startDate = '2015-06-26T05:01:00.000Z';

                        result = CampaignService.getSummary({
                            campaign: campaign,
                            interests: interests
                        });

                        expect(result.duration).toEqual('06/26/2015 until stopped.');

                        campaign.cards[0].campaign.endDate = '2015-07-26T05:01:00.000Z';

                        result = CampaignService.getSummary({
                            campaign: campaign,
                            interests: interests
                        });

                        expect(result.duration).toEqual('06/26/2015 to 07/26/2015');

                        campaign.cards[0].campaign.startDate = undefined;

                        result = CampaignService.getSummary({
                            campaign: campaign,
                            interests: interests
                        });

                        expect(result.duration).toEqual('Once approved until 07/26/2015');
                    });

                    describe('when passing interests', function() {
                        it('should generate interest list', function() {
                            expect(result.interests).toEqual('Comedy, Technology');
                        });
                    });

                    describe('when not passing interests', function() {
                        it('should simply return the campaign interest ids', function() {
                            result = CampaignService.getSummary({
                                campaign: campaign,
                                interests: null
                            });

                            expect(result.interests).toEqual('cat-1, cat-3');
                        });
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
                                title: 'original title',
                                links: {
                                    Facebook: 'https://www.facebook.com/pages/Diageo/108265212535624',
                                    Twitter: 'https://twitter.com/Diageo_News'
                                }
                            }
                        ]
                    };
                    updatedCampaign = {
                        id: 'c-123',
                        cards: [
                            {
                                title: 'updated title',
                                links: {
                                    Facebook: 'https://www.facebook.com/pages/Diageo/108265212535624',
                                    Website: 'http://www.cottonusa.org/'
                                }
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
                        title: 'original title',
                        links: {
                            Facebook: 'https://www.facebook.com/pages/Diageo/108265212535624',
                            Twitter: 'https://twitter.com/Diageo_News'
                        }
                    }, {
                        title: 'updated title',
                        links: {
                            Facebook: 'https://www.facebook.com/pages/Diageo/108265212535624',
                            Website: 'http://www.cottonusa.org/'
                        }
                    }, 'Card');
                });

                it('should return a summary of changes', function() {
                    expect(result).toEqual([{
                        originalValue: 'original title',
                        updatedValue: 'updated title',
                        key: 'title',
                        type: 'Card'
                    }, {
                        originalValue: 'https://twitter.com/Diageo_News',
                        updatedValue: undefined,
                        key: 'links.Twitter',
                        type: 'Card'
                    }, {
                        originalValue: undefined,
                        updatedValue: 'http://www.cottonusa.org/',
                        key: 'links.Website',
                        type: 'Card'
                    }]);
                });
            });
        });
    });
});
