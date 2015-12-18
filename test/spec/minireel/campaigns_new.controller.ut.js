define(['app'], function(appModule) {
    'use strict';

    describe('CampaignsNewController', function() {
        var $rootScope,
            $q,
            $controller,
            cinema6,
            c6State,
            paginatedDbList,
            $scope,
            CampaignsCtrl,
            CampaignsNewCtrl;

        var campaign, customers, advertisers,
            model, debouncedFns;

        beforeEach(function() {
            debouncedFns = [];

            module(appModule.name);
            module(function($provide) {
                $provide.decorator('c6AsyncQueue', function($delegate) {
                    return jasmine.createSpy('c6AsyncQueue()').and.callFake(function() {
                        var queue = $delegate.apply(this, arguments);
                        var debounce = queue.debounce;
                        spyOn(queue, 'debounce').and.callFake(function() {
                            var fn = debounce.apply(queue, arguments);
                            debouncedFns.push(fn);
                            return fn;
                        });
                        return queue;
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                paginatedDbList = $injector.get('paginatedDbList');

                campaign = cinema6.db.create('campaign', {
                    name: null,
                    categories: [],
                    minViewTime: -1,
                    advertiser: null,
                    brand: null,
                    customer: null,
                    logos: {
                        square: null
                    },
                    links: {},
                    miniReels: [],
                    cards: [],
                    targetMiniReels: []
                });
                customers = [
                    {
                        id: 'cus-a057764cb53d45',
                        name: 'Brightroll'
                    },
                    {
                        id: 'cus-50480bdd7b3f55',
                        name: 'Prudential'
                    },
                    {
                        id: 'cus-676edfc8aee43c',
                        name: 'Diageo'
                    }
                ];
                advertisers = [
                    {
                        id: 'a-a057764cb53d45',
                        name: 'Smirnoff'
                    },
                    {
                        id: 'a-50480bdd7b3f55',
                        name: 'Captain Morgan'
                    },
                    {
                        id: 'a-676edfc8aee43c',
                        name: 'Ketel One'
                    }
                ];

                model = {
                    campaign: campaign,
                    customers: customers,
                    advertisers: advertisers
                };

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    spyOn(cinema6.db, 'findAll').and.returnValue($q.when((function() {
                        var items = [];
                        items.meta = { items: {} };

                        return items;
                    }())));
                    $scope.MiniReelCtrl = {
                        model: {
                            data: {
                                blacklists: {
                                    customers: [],
                                    advertisers: []
                                }
                            }
                        }
                    };
                    CampaignsCtrl = $scope.CampaignsCtrl = $controller('CampaignsController', {
                        $scope: $scope,
                        cState: c6State.get('MR:Campaigns')
                    });
                    CampaignsCtrl.model = paginatedDbList('campaign', {});

                    CampaignsNewCtrl = $scope.CampaignsNewCtrl = $controller('CampaignsNewController', {
                        $scope: $scope
                    });
                    CampaignsNewCtrl.initWithModel(model, model);
                });
            });
        });

        it('should exist', function() {
            expect(CampaignsNewCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the campaign', function() {
                    expect(CampaignsNewCtrl.model).toBe(campaign);
                });
            });

            describe('customers', function() {
                it('should be the advertiser', function() {
                    expect(CampaignsNewCtrl.customers).toBe(customers);
                });
            });

            describe('customerOptions', function() {
                it('should be an object of customers keyed by their name', function() {
                    expect(CampaignsNewCtrl.customerOptions).toEqual({
                        'None': null,
                        'Brightroll': customers[0],
                        'Prudential': customers[1],
                        'Diageo': customers[2]
                    });
                });

                describe('when customers are blacklisted', function() {
                    it('should not show them as options', function() {
                        $scope.MiniReelCtrl.model.data.blacklists.customers = ['cus-a057764cb53d45','cus-676edfc8aee43c'];

                        CampaignsNewCtrl.initWithModel(model, model);

                        expect(CampaignsNewCtrl.customerOptions).toEqual({
                            'None': null,
                            'Prudential': customers[1]
                        });
                    });
                });
            });

            describe('advertiserOptions', function() {
                describe('when there are customers', function() {
                    describe('before the campaign has a customer', function() {
                        beforeEach(function() {
                            CampaignsNewCtrl.advertisers = [];

                            $scope.$apply(function() {
                                campaign.customer = null;
                            });
                        });

                        it('should not list any options', function() {
                            expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                                None: null
                            });
                        });
                    });

                    describe('when the campaign has a customer', function() {
                        var customer;

                        beforeEach(function() {
                            $scope.$apply(function() {
                                customer = campaign.customer = {
                                    id: 'cus-eacd637506f15c',
                                    advertisers: [
                                        {
                                            id: '1',
                                            name: 'Diageo'
                                        },
                                        {
                                            id: '2',
                                            name: 'Activision'
                                        },
                                        {
                                            id: '3',
                                            name: 'Ubisoft'
                                        }
                                    ]
                                };
                            });
                        });

                        it('should be an object of advertisers keyed by their name', function() {
                            expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                                None: null,
                                Diageo: customer.advertisers[0],
                                Activision: customer.advertisers[1],
                                Ubisoft: customer.advertisers[2]
                            });
                        });

                        describe('when advertisers are blacklisted', function() {
                            it('should not show them as options', function() {
                                $scope.MiniReelCtrl.model.data.blacklists.advertisers = ['1','3'];

                                expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                                    None: null,
                                    Activision: customer.advertisers[1]
                                });
                            });
                        });
                    });
                });

                describe('when there are no customer available', function() {
                    it('should default to the full list of advertisers', function() {
                        $scope.$apply(function() {
                            campaign.customer = null;
                        });

                        expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                            'None': null,
                            'Smirnoff': advertisers[0],
                            'Captain Morgan': advertisers[1],
                            'Ketel One': advertisers[2]
                        });
                    });

                    describe('when the campaign has an undecorated customer', function() {
                        it('should be be the full list of advertisers', function() {
                            $scope.$apply(function() {
                                campaign.customer = 'cus-123';
                            });

                            expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                                'None': null,
                                'Smirnoff': advertisers[0],
                                'Captain Morgan': advertisers[1],
                                'Ketel One': advertisers[2]
                            });
                        });
                    });
                });
            });
        });

        describe('methods', function() {
            describe('save()', function() {
                var saveDeffered, advertiser,
                    success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    advertiser = cinema6.db.create('advertiser', {
                        defaultLinks: {
                            Facebook: 'https://www.facebook.com/pages/Diageo/108265212535624',
                            Twitter: 'https://twitter.com/Diageo_News'
                        },
                        defaultLogos: {
                            square: 'http://i.imgur.com/YbBIFZv.png'
                        },
                        name: 'Diageo'
                    });

                    saveDeffered = $q.defer();

                    campaign.advertiser = advertiser;
                    spyOn(campaign, 'save').and.returnValue(saveDeffered.promise);

                    $scope.$apply(function() {
                        CampaignsNewCtrl.save().then(success, failure);
                    });
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(CampaignsNewCtrl.save);
                });

                it('should inherit links and logos from the advertiser', function() {
                    expect(campaign).toEqual(jasmine.objectContaining({
                        links: jasmine.objectContaining(advertiser.defaultLinks),
                        logos: jasmine.objectContaining(advertiser.defaultLogos),
                        miniReels: [],
                        cards: [],
                        brand: advertiser.name
                    }));
                });

                it('should save the campaign', function() {
                    expect(campaign.save).toHaveBeenCalled();
                });

                describe('when the campaign is saved', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        $scope.$apply(function() {
                            saveDeffered.resolve(campaign);
                        });
                    });

                    it('should go to the MR:Campaign state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign', [campaign]);
                    });
                });
            });
        });
    });
});
