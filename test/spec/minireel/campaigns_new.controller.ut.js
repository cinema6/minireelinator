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

        var campaign, advertisers,
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
                    logos: {
                        square: null
                    },
                    links: {},
                    miniReels: [],
                    cards: [],
                    targetMiniReels: []
                });
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
                });
            });
        });

        it('should exist', function() {
            expect(CampaignsNewCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel()', function() {
                beforeEach(function() {
                    CampaignsNewCtrl.initWithModel(model, model);
                });

                it('should put the campaign and advertisers on the Ctrl', function() {
                    expect(CampaignsNewCtrl.model).toBe(campaign);
                });

                describe('the advertiserOptions', function() {
                    it('should be an object of advertisers keyed by their name', function() {
                        expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                            'None': null,
                            'Smirnoff': advertisers[0],
                            'Captain Morgan': advertisers[1],
                            'Ketel One': advertisers[2]
                        });
                    });

                    describe('when advertisers are blacklisted', function() {
                        it('should not show them as options', function() {
                            $scope.MiniReelCtrl.model.data.blacklists.advertisers = ['a-a057764cb53d45','a-676edfc8aee43c'];

                            CampaignsNewCtrl.initWithModel(model, model);

                            expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                                None: null,
                                'Captain Morgan': advertisers[1]
                            });
                        });
                    });
                });
            });

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

                    CampaignsNewCtrl.initWithModel(model, model);

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
