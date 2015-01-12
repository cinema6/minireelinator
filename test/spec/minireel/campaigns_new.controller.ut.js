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
                    CampaignsCtrl = $scope.CampaignsCtrl = $controller('CampaignsController', {
                        $scope: $scope,
                        cState: c6State.get('MR:Campaigns')
                    });
                    CampaignsCtrl.model = paginatedDbList('campaign', {});

                    CampaignsNewCtrl = $controller('CampaignsNewController', {
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
                                        name: 'Diageo'
                                    },
                                    {
                                        name: 'Activision'
                                    },
                                    {
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
                });
            });
        });

        describe('methods', function() {
            var saveDeffered,
                success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                saveDeffered = $q.defer();

                spyOn(campaign, 'save').and.returnValue(saveDeffered.promise);

                $scope.$apply(function() {
                    CampaignsNewCtrl.save().then(success, failure);
                });
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
