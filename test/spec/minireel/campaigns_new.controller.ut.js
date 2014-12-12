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
                advertisers = [
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
                    advertisers: advertisers
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

            describe('advertisers', function() {
                it('should be the advertiser', function() {
                    expect(CampaignsNewCtrl.advertisers).toBe(advertisers);
                });
            });

            describe('advertiserOptions', function() {
                it('should be an object of advertisers keyed by their name', function() {
                    expect(CampaignsNewCtrl.advertiserOptions).toEqual({
                        'None': null,
                        vehicles: advertisers[0],
                        education: advertisers[1],
                        howto: advertisers[2]
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
