define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignTargetingController', function() {
        var $rootScope,
            $scope,
            $controller,
            GeoService,
            SelfieCampaignCtrl,
            SelfieCampaignTargetingCtrl;

        var campaign;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCampaignTargetingCtrl = $controller('SelfieCampaignTargetingController', { $scope: $scope, GeoService: GeoService });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                campaign = {
                    pricing: {},
                    geoTargeting: [],
                    categories: []
                };

                GeoService = {
                    usa: [
                        'Alabama',
                        'Alaska',
                        'Arizona',
                        'Arkansas'
                    ]
                };

                $scope = $rootScope.$new();
                $scope.SelfieCampaignCtrl = {
                    campaign: campaign,
                    categories: [
                        {
                            name: 'comedy',
                            label: 'Comedy'
                        },
                        {
                            name: 'entertainment',
                            label: 'Entertainment'
                        }
                    ]
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignTargetingCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('budget', function() {
                it('should be the budget from the campaign or default to null', function() {
                    expect(SelfieCampaignTargetingCtrl.budget).toBe(null);

                    campaign.pricing.budget = 3000;

                    compileCtrl();

                    expect(SelfieCampaignTargetingCtrl.budget).toBe(3000);
                });
            });

            describe('limit', function() {
                it('should be the dailyLimit from the campaign or default to null', function() {
                    expect(SelfieCampaignTargetingCtrl.limit).toBe(null);

                    campaign.pricing.dailyLimit = 100;

                    compileCtrl();

                    expect(SelfieCampaignTargetingCtrl.limit).toBe(100);
                });
            });

            describe('categories', function() {
                it('should include a "None" option', function() {
                    expect(SelfieCampaignTargetingCtrl.categories[0]).toEqual({
                        name: 'none', label: 'No Category Targeting'
                    });

                    expect(SelfieCampaignTargetingCtrl.categories).toContain({
                        name: 'comedy', label: 'Comedy'
                    });

                    expect(SelfieCampaignTargetingCtrl.categories).toContain({
                        name: 'entertainment', label: 'Entertainment'
                    });
                });
            });

            describe('category', function() {
                it('should come from the campaign or default to "None"', function() {
                    expect(SelfieCampaignTargetingCtrl.category).toEqual({
                        name: 'none', label: 'No Category Targeting'
                    });
                    expect(SelfieCampaignTargetingCtrl.category).toBe(SelfieCampaignTargetingCtrl.categories[0]);

                    campaign.categories.push('entertainment');

                    compileCtrl();

                    expect(SelfieCampaignTargetingCtrl.category).toBe(SelfieCampaignTargetingCtrl.categories[2]);
                });
            });

            describe('geoOptions', function() {
                it('should contain the U.S. States', function() {
                    expect(SelfieCampaignTargetingCtrl.geoOptions).toContain({
                        state: 'Alabama', country: 'usa'
                    });

                    expect(SelfieCampaignTargetingCtrl.geoOptions).toContain({
                        state: 'Arizona', country: 'usa'
                    });
                });
            });

            describe('geo', function() {
                it('should be the state(s) from the campaign', function() {
                    expect(SelfieCampaignTargetingCtrl.geo).toEqual([]);

                    campaign.geoTargeting.push({state: 'Arizona'});
                    campaign.geoTargeting.push({state: 'Alabama'});

                    compileCtrl();

                    expect(SelfieCampaignTargetingCtrl.geo).toEqual([
                        {
                            state: 'Alabama', country: 'usa'
                        },
                        {
                            state: 'Arizona', country: 'usa'
                        }
                    ]);
                });
            });

            describe('cpv', function() {
                it('should add $.50 each for categories and geo service', function() {
                    expect(SelfieCampaignTargetingCtrl.cpv).toBe(50);

                    campaign.geoTargeting.push({state: 'Arizona'});

                    expect(SelfieCampaignTargetingCtrl.cpv).toBe(50.5);

                    campaign.geoTargeting.push({state: 'Alabama'});

                    expect(SelfieCampaignTargetingCtrl.cpv).toBe(50.5);

                    SelfieCampaignTargetingCtrl.category = SelfieCampaignTargetingCtrl.geoOptions[1];

                    expect(SelfieCampaignTargetingCtrl.cpv).toBe(51);
                });
            });

            describe('validBudget', function() {
                it('should be true if not set or is set between 50 and 20,000', function() {
                    expect(SelfieCampaignTargetingCtrl.validBudget).toBe(true);

                    SelfieCampaignTargetingCtrl.budget = 100;

                    expect(SelfieCampaignTargetingCtrl.validBudget).toBe(true);

                    SelfieCampaignTargetingCtrl.budget = 25;

                    expect(SelfieCampaignTargetingCtrl.validBudget).toBe(false);

                    SelfieCampaignTargetingCtrl.budget = 15000;

                    expect(SelfieCampaignTargetingCtrl.validBudget).toBe(true);

                    SelfieCampaignTargetingCtrl.budget = 25000;

                    expect(SelfieCampaignTargetingCtrl.validBudget).toBe(false);
                });
            });

            describe('dailyLimitError', function() {
                it('should be false if budget and limit are not defined or if the limit is between the 1.5% to 100% of the budget', function() {
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe(false);

                    SelfieCampaignTargetingCtrl.budget = 100;
                    SelfieCampaignTargetingCtrl.limit = 50;
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe(false);

                    SelfieCampaignTargetingCtrl.budget = 100;
                    SelfieCampaignTargetingCtrl.limit = 2;
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe(false);

                    SelfieCampaignTargetingCtrl.budget = 100;
                    SelfieCampaignTargetingCtrl.limit = 100;
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe(false);
                });

                it('should contain an error message if limit is set but budget is not or the limit is not between 1.5% to 100% of total budget', function() {
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe(false);

                    SelfieCampaignTargetingCtrl.budget = null;
                    SelfieCampaignTargetingCtrl.limit = 20;
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe('Please enter your Total Budget first');

                    SelfieCampaignTargetingCtrl.budget = 100;
                    SelfieCampaignTargetingCtrl.limit = 1;
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe('Must be greater than 1.5% of the Total Budget');

                    SelfieCampaignTargetingCtrl.budget = 100;
                    SelfieCampaignTargetingCtrl.limit = 101;
                    expect(SelfieCampaignTargetingCtrl.dailyLimitError).toBe('Must be less than Total Budget');
                });
            });
        });

        describe('$watchers', function() {
            describe('geo', function() {
                it('should set the geoTargeting on the campaign', function() {
                    expect(campaign.geoTargeting).toEqual([]);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.geo = [ SelfieCampaignTargetingCtrl.geoOptions[2],  SelfieCampaignTargetingCtrl.geoOptions[3]];
                    });

                    expect(campaign.geoTargeting).toEqual([{ state: 'Arizona' }, { state: 'Arkansas' }]);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.geo = [];
                    });

                    expect(campaign.geoTargeting).toEqual([]);
                });
            });

            describe('category', function() {
                it('should set category on the campaign', function() {
                    expect(campaign.categories).toEqual([]);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.category = SelfieCampaignTargetingCtrl.categories[2];
                    });

                    expect(campaign.categories).toEqual(['entertainment']);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.category = SelfieCampaignTargetingCtrl.categories[0];
                    });

                    expect(campaign.categories).toEqual([]);
                });
            });

            describe('budget and limit', function() {
                it('should set the budget and daily limit on the campaign if valid', function() {
                    expect(campaign.pricing.budget).toBeUndefined();
                    expect(campaign.pricing.dailyLimit).toBeUndefined();

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.budget = 3000;
                    });

                    expect(campaign.pricing.budget).toBe(3000);
                    expect(campaign.pricing.dailyLimit).toBe(null);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.limit = 100;
                    });

                    expect(campaign.pricing.budget).toBe(3000);
                    expect(campaign.pricing.dailyLimit).toBe(100);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.limit = 500000;
                    });

                    expect(campaign.pricing.budget).toBe(3000);
                    expect(campaign.pricing.dailyLimit).toBe(100);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.limit = 300;
                    });

                    expect(campaign.pricing.budget).toBe(3000);
                    expect(campaign.pricing.dailyLimit).toBe(300);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.budget = 3000000;
                    });

                    expect(campaign.pricing.budget).toBe(3000);
                    expect(campaign.pricing.dailyLimit).toBe(300);

                    $scope.$apply(function() {
                        SelfieCampaignTargetingCtrl.budget = 5000;
                    });

                    expect(campaign.pricing.budget).toBe(5000);
                    expect(campaign.pricing.dailyLimit).toBe(300);
                });
            });
        });
    });
});