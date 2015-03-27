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

        var campaign, customers,
            model;

        beforeEach(function() {
            module(appModule.name);

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
                        id: 'a-a057764cb53d45',
                        name: 'vehicles',
                        label: 'Autos & Vehicles'
                    },
                    {
                        id: 'a-50480bdd7b3f55',
                        name: 'education',
                        label: 'Education'
                    },
                    {
                        id: 'a-676edfc8aee43c',
                        name: 'howto',
                        label: 'Howto & DIY'
                    }
                ];

                model = {
                    campaign: campaign,
                    customers: customers
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
                        vehicles: customers[0],
                        education: customers[1],
                        howto: customers[2]
                    });
                });

                describe('when customers are blacklisted', function() {
                    it('should not show them as options', function() {
                        $scope.MiniReelCtrl.model.data.blacklists.customers = ['a-a057764cb53d45','a-676edfc8aee43c'];

                        CampaignsNewCtrl.initWithModel(model, model);

                        expect(CampaignsNewCtrl.customerOptions).toEqual({
                            'None': null,
                            education: customers[1]
                        });
                    });
                });
            });

            describe('advertiserOptions', function() {
                describe('before the campaign has a customer', function() {
                    beforeEach(function() {
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
        });

        describe('methods', function() {
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
