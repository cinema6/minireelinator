define(['app', 'minireel/services', 'c6uilib'], function(appModule, servicesModule, c6uilib) {
    'use strict';

    describe('CampaignService', function() {
        var $rootScope,
            cinema6,
            c6State,
            MiniReelService,
            CampaignService,
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
            describe('create(type)', function() {
                describe('when type === campaign', function() {
                    var result;

                    beforeEach(function() {
                        result = CampaignService.create('campaign');
                    });

                    it('should create a new campaign', function() {
                        expect(cinema6.db.create).toHaveBeenCalledWith('selfieCampaign', {
                            advertiserId: selfie.cModel.advertiser.id,
                            customerId: selfie.cModel.customer.id,
                            name: null,
                            cards: [],
                            pricing: {},
                            status: 'draft',
                            application: 'selfie',
                            advertiserDisplayName: selfie.cModel.company,
                            contentCategories: {
                                primary: null
                            },
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
                            }
                        });
                    });

                    it('should be a new campaign object', function() {
                        expect(result).toEqual(dbModel);
                    });
                });

                describe('when type === card', function() {
                    var result;

                    beforeEach(function() {
                        result = CampaignService.create('card');
                    });

                    it('should create a new card', function() {
                        expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                        expect(cinema6.db.create).toHaveBeenCalledWith('card', cardTemplate);
                    });

                    it('should add Selfie default values', function() {
                        expect(result.id).toBe(undefined);
                        expect(result.campaignId).toBe(undefined);
                        expect(result.campaign.minViewTime).toBe(3);
                        expect(result.sponsored).toBe(true);
                        expect(result.collateral.logo).toBe(null);
                        expect(result.links).toEqual({});
                        expect(result.params).toEqual({
                            ad: true,
                            action: null
                        });
                        expect(result.data).toEqual(jasmine.objectContaining({
                            autoadvance: false,
                            controls: false,
                            autoplay: true,
                            skip: 30
                        }));
                    });

                    it('should add campaign data', function() {
                        expect(result).toEqual(dbModel);
                    });
                });
            });

            describe('find(id)', function() {
                var model,
                    success, failure;

                beforeEach(function() {
                    model = {
                        id: 'cam-c3fd97889f4fb9',
                        name: 'My Campaign',
                        cards: [{
                            item: {
                                id: 'rc-123'
                            }
                        }]
                    };

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(cinema6.db, 'find').and.returnValue($q.when(model));

                    $rootScope.$apply(function() {
                        CampaignService.find(model.id).then(success, failure);
                    });
                });

                it('should find the campaign', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('selfieCampaign', model.id);
                });

                it('should ensure that properties are defined with defualt values', function() {
                    expect(success).toHaveBeenCalledWith(jasmine.objectContaining(model));
                    expect(success).toHaveBeenCalledWith(jasmine.objectContaining({
                        pricing: {},
                        advertiserDisplayName: selfie.cModel.company,
                        contentCategories: {},
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
                        }
                    }));
                });
            });
        });
    });
});