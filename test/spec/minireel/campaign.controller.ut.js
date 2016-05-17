define(['app'], function(appModule) {
    'use strict';

    describe('CampaignController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            $scope,
            ConfirmDialogService,
            CampaignCtrl,
            MiniReelCtrl;

        var campaign, debouncedFns;

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
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                ConfirmDialogService = $injector.get('ConfirmDialogService');

                MiniReelCtrl = {
                    model: {
                        data: {
                            campaigns: {
                                pricing: {
                                    dailyLimit: {
                                        min: 0,
                                        max: 999999999999.9999
                                    },
                                    budget: {
                                        min: 0,
                                        max: 999999999999.9999
                                    },
                                    cost: {
                                        min: 0,
                                        max: 9999.9999
                                    }
                                }
                            }
                        }
                    }
                };

                campaign = cinema6.db.create('campaign', {
                    id: 'e-48eec2c6b81060',
                    links: {
                        'Action': 'buynow.html',
                        'Facebook': 'fb.html'
                    },
                    logos: {
                        square: 'logo.jpg'
                    },
                    miniReels: [],
                    cards: [],
                    staticCardMap: [
                        {
                            cards: [
                                {
                                    placeholder: {},
                                    wildcard: {}
                                },
                                {
                                    placeholder: {},
                                    wildcard: {}
                                }
                            ],
                            minireel: {}
                        }
                    ],
                    brand: 'Diageo'
                });

                $scope = $rootScope.$new();
                $scope.AppCtrl = $controller('AppController', { cState: {} });
                $scope.MiniReelCtrl = MiniReelCtrl;
                $scope.$apply(function() {
                    CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope,
                        ConfirmDialogService: ConfirmDialogService
                    });
                    CampaignCtrl.initWithModel(campaign);
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $q = null;
            cinema6 = null;
            $scope = null;
            ConfirmDialogService = null;
            CampaignCtrl = null;
            MiniReelCtrl = null;
            campaign = null;
            debouncedFns = null;
        });

        it('should exist', function() {
            expect(CampaignCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the campaign', function() {
                    expect(CampaignCtrl.model).toBe(campaign);
                });

                it('should only use the campaign advertiser name if the brand property is set', function() {
                    expect(CampaignCtrl.model.brand).toEqual(campaign.brand);

                    delete campaign.brand;
                    campaign.advertiser = {name: 'Some Advertiser'};

                    CampaignCtrl.initWithModel(campaign);

                    expect(CampaignCtrl.model.brand).toEqual(campaign.advertiser.name);
                });

                it('should ensure a pricing object is set', function() {
                    expect(CampaignCtrl.model.pricing).toEqual({});
                });
            });

            describe('cleanModel', function() {
                it('should be a pojo copy of the model', function() {
                    expect(CampaignCtrl.cleanModel).toEqual(campaign.pojoify());
                });
            });

            describe('isClean', function() {
                describe('if the model has not been changed', function() {
                    it('should be true', function() {
                        expect(CampaignCtrl.isClean).toBe(true);
                    });
                });

                describe('if there is an item in the staticCardMap without a wildcard', function() {
                    beforeEach(function() {
                        campaign.staticCardMap[0].cards.push({ placeholder: {}, wildcard: null });
                    });

                    it('should be true', function() {
                        expect(CampaignCtrl.isClean).toBe(true);
                    });
                });

                describe('if the model is changed', function() {
                    beforeEach(function() {
                        campaign.miniReels.push({});
                    });

                    it('should be false', function() {
                        expect(CampaignCtrl.isClean).toBe(false);
                    });

                    describe('if the links are changed', function() {
                        beforeEach(function() {
                            CampaignCtrl.cleanModel = campaign.pojoify();

                            CampaignCtrl.links[0].href = 'http://new.href/';
                        });

                        it('should be false', function() {
                            expect(CampaignCtrl.isClean).toBe(false);
                        });
                    });
                });
            });

            describe('validLogo', function() {
                describe('if logo url is undefined', function() {
                    it('should be true', function() {
                        delete campaign.logos.square;
                        expect(CampaignCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is valid', function() {
                    it('should be true', function() {
                        campaign.logos.square = 'http://example.com/image.png';
                        expect(CampaignCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is not valid', function() {
                    it('should be false', function() {
                        campaign.logos.square = 'example.com/image.png';
                        expect(CampaignCtrl.validLogo).toBe(false);
                    });
                });
            });

            describe('validBudget', function() {
                it('should be false if budget is not set', function() {
                    campaign.pricing.budget = null;
                    expect(CampaignCtrl.validBudget).toBe(false);

                    campaign.pricing.budget = 3000;
                    expect(CampaignCtrl.validBudget).toBe(true);
                });

                it('should be true if budget is 0', function() {
                    campaign.pricing.budget = 0;
                    expect(CampaignCtrl.validBudget).toBe(true);
                });

                it('should be true if it is between 0 and 999999999999.9999, false otherwise', function() {
                    campaign.pricing.budget = 0;
                    expect(CampaignCtrl.validBudget).toBe(true);

                    campaign.pricing.budget = 999999;
                    expect(CampaignCtrl.validBudget).toBe(true);

                    campaign.pricing.budget = 99999999999999999999;
                    expect(CampaignCtrl.validBudget).toBe(false);
                });
            });

            describe('validLimit', function() {
                it('should be true if limit is not set', function() {
                    campaign.pricing.dailyLimit = null;
                    expect(CampaignCtrl.validLimit).toBe(true);
                });

                it('should be true if limit is 0', function() {
                    campaign.pricing.dailyLimit = 0;
                    expect(CampaignCtrl.validLimit).toBe(true);
                });

                it('should be true if it is between 0 and 999999999999.9999, false otherwise', function() {
                    campaign.pricing.dailyLimit = 0;
                    expect(CampaignCtrl.validLimit).toBe(true);

                    campaign.pricing.dailyLimit = 999999;
                    expect(CampaignCtrl.validLimit).toBe(true);

                    campaign.pricing.dailyLimit = 99999999999999999999;
                    expect(CampaignCtrl.validLimit).toBe(false);
                });
            });

            describe('validCost', function() {
                it('should be false if cost is not set', function() {
                    campaign.pricing.cost = null;
                    expect(CampaignCtrl.validCost).toBe(false);

                    campaign.pricing.cost = 3000;
                    expect(CampaignCtrl.validCost).toBe(true);
                });

                it('should be true if cost is 0', function() {
                    campaign.pricing.cost = 0;
                    expect(CampaignCtrl.validCost).toBe(true);
                });

                it('should be true if it is between 0 and 9999.9999, false otherwise', function() {
                    campaign.pricing.cost = 0;
                    expect(CampaignCtrl.validCost).toBe(true);

                    campaign.pricing.cost = 9999;
                    expect(CampaignCtrl.validCost).toBe(true);

                    campaign.pricing.cost = 99999999999999999;
                    expect(CampaignCtrl.validCost).toBe(false);
                });
            });

            describe('validPricing', function() {
                it('should be true if budget and cost are set', function() {
                    expect(CampaignCtrl.validPricing).toBe(false);

                    CampaignCtrl.model.pricing.budget = 3000;

                    expect(CampaignCtrl.validPricing).toBe(false);

                    CampaignCtrl.model.pricing.cost = 0.25;

                    expect(CampaignCtrl.validPricing).toBe(true);
                });
            });

            describe('links', function() {
                beforeEach(function() {
                    campaign.links = {
                        'Action': 'action.html',
                        'Website': 'website.html',
                        'My Custom Thang': 'blegh.html',
                        'Instagram': 'intergrem.html',
                        'Facebook': 'fb.html',
                        'Pinterest': '/share/pinterest.htm'
                    };

                    CampaignCtrl.initWithModel(campaign);
                });

                it('should be an array of links', function() {
                    expect(CampaignCtrl.links).toEqual([
                        {
                            name: 'Action',
                            href: 'action.html'
                        },
                        {
                            name: 'Website',
                            href: 'website.html'
                        },
                        {
                            name: 'Facebook',
                            href: 'fb.html'
                        },
                        {
                            name: 'Twitter',
                            href: null
                        },
                        {
                            name: 'YouTube',
                            href: null
                        },
                        {
                            name: 'Pinterest',
                            href: '/share/pinterest.htm'
                        },
                        {
                            name: 'My Custom Thang',
                            href: 'blegh.html'
                        },
                        {
                            name: 'Instagram',
                            href: 'intergrem.html'
                        }
                    ]);
                });

                describe('if there are no links', function() {
                    beforeEach(function() {
                        campaign.links = {};

                        CampaignCtrl.initWithModel(campaign);
                    });

                    it('should be the defaults', function() {
                        expect(CampaignCtrl.links).toEqual(['Action', 'Website', 'Facebook', 'Twitter', 'YouTube', 'Pinterest'].map(function(name) {
                            return {
                                name: name,
                                href: null
                            };
                        }));
                    });
                });
            });

            describe('pricingModels', function() {
                it('should be an array', function() {
                    expect(CampaignCtrl.pricingModels).toEqual(['CPV','CPM']);
                });
            });

            describe('pricingModel', function() {
                it('should reflect the campaign and default to CPV', function() {
                    expect(CampaignCtrl.pricingModel).toBe('CPV');

                    campaign.pricing = { model: 'cpm' };
                    CampaignCtrl.initWithModel(campaign);

                    expect(CampaignCtrl.pricingModel).toBe('CPM');
                });
            });
        });

        describe('methods', function() {
            describe('removeLink(link)', function() {
                var link;

                beforeEach(function() {
                    link = CampaignCtrl.links[1];

                    CampaignCtrl.removeLink(link);
                });

                it('should remove the link from the model', function() {
                    expect(CampaignCtrl.links).not.toContain(link);
                    expect(CampaignCtrl.links).toEqual(CampaignCtrl.links.filter(function(listLink) {
                        return link !== listLink;
                    }));
                });
            });

            describe('addLink(link)', function() {
                var origLinks, newLink;

                beforeEach(function() {
                    origLinks = CampaignCtrl.links.slice();
                    newLink = {
                        name: 'Foo',
                        href: 'foo.com'
                    };

                    CampaignCtrl.addLink(newLink);
                });

                it('should add the newLink to the model', function() {
                    expect(origLinks.length).toBeGreaterThan(0);

                    origLinks.forEach(function(link) {
                        expect(CampaignCtrl.links).toContain(link);
                    });
                    expect(CampaignCtrl.links).toContain(newLink);
                });
            });

            describe('updateLinks()', function() {
                beforeEach(function() {
                    CampaignCtrl.links = [
                        {
                            name: 'Action',
                            href: null
                        },
                        {
                            name: 'Website',
                            href: 'mysite.com'
                        },
                        {
                            name: 'Facebook',
                            href: ''
                        },
                        {
                            name: 'Twitter',
                            href: null
                        },
                        {
                            name: 'YouTube',
                            href: 'yt.com'
                        },
                        {
                            name: 'Pinterest',
                            href: null
                        }
                    ];

                    CampaignCtrl.updateLinks();
                });

                it('should update the campaign\'s links', function() {
                    expect(campaign.links).toEqual({
                        'Website': 'mysite.com',
                        'YouTube': 'yt.com'
                    });
                });
            });

            describe('updatePricing()', function() {
                it('should set the pricing model', function() {
                    expect(CampaignCtrl.model.pricing.model).toBe(undefined);

                    CampaignCtrl.updatePricing();

                    expect(CampaignCtrl.model.pricing.model).toBe('cpv');

                    CampaignCtrl.pricingModel = 'CPM';

                    CampaignCtrl.updatePricing();

                    expect(CampaignCtrl.model.pricing.model).toBe('cpm');
                });

                describe('when daily limit is not set', function() {
                    it('should not set the daily limit', function() {
                        expect(CampaignCtrl.model.pricing.dailyLimit).toBe(undefined);

                        CampaignCtrl.updatePricing();

                        expect(CampaignCtrl.model.pricing.dailyLimit).toBe(undefined);
                    });
                });

                describe('when the daily limit was set but is removed', function() {
                    it('should remove the property', function() {
                        CampaignCtrl.model.pricing.dailyLimit = 200;

                        CampaignCtrl.updatePricing();

                        expect(CampaignCtrl.model.pricing.dailyLimit).toBe(200);

                        CampaignCtrl.model.pricing.dailyLimit = null;

                        CampaignCtrl.updatePricing();

                        expect(CampaignCtrl.model.pricing.dailyLimit).toBe(undefined);

                        CampaignCtrl.model.pricing.dailyLimit = '';

                        CampaignCtrl.updatePricing();

                        expect(CampaignCtrl.model.pricing.dailyLimit).toBe(undefined);
                    });
                });

                describe('when the daily limit is set', function() {
                    it('should use it', function() {
                        CampaignCtrl.model.pricing.dailyLimit = 200;

                        CampaignCtrl.updatePricing();

                        expect(CampaignCtrl.model.pricing.dailyLimit).toBe(200);
                    });
                });
            });

            describe('save()', function() {
                var success, failure,
                    emptyPlaceholder,
                    saveDeferred;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    saveDeferred = $q.defer();

                    CampaignCtrl.links = [
                        {
                            name: 'Action',
                            href: null
                        },
                        {
                            name: 'Website',
                            href: 'mysite.com'
                        },
                        {
                            name: 'Facebook',
                            href: ''
                        },
                        {
                            name: 'Twitter',
                            href: null
                        },
                        {
                            name: 'YouTube',
                            href: 'yt.com'
                        },
                        {
                            name: 'Pinterest',
                            href: null
                        }
                    ];

                    emptyPlaceholder = {
                        wildcard: null,
                        placeholder: {}
                    };

                    campaign.cards.push({}, {});
                    campaign.staticCardMap[0].cards.push(emptyPlaceholder);

                    spyOn(campaign, 'save').and.returnValue(saveDeferred.promise);

                    $scope.$apply(function() {
                        CampaignCtrl.save().then(success, failure);
                    });
                });

                it('should be wrapped in a queue', function() {
                    expect(debouncedFns).toContain(CampaignCtrl.save);
                });

                it('should update the campaign\'s links', function() {
                    expect(campaign.links).toEqual({
                        'Website': 'mysite.com',
                        'YouTube': 'yt.com'
                    });
                });

                it('should remove any unfilled placeholders from the static card map', function() {
                    expect(campaign.staticCardMap[0].cards).not.toContain(emptyPlaceholder);
                    expect(campaign.staticCardMap[0].cards.length).not.toBe(0);
                });

                it('should save the campaign', function() {
                    expect(campaign.save).toHaveBeenCalled();
                });

                describe('when the campaign is done saving', function() {
                    beforeEach(function() {
                        spyOn($scope, '$broadcast').and.callThrough();

                        $scope.$apply(function() {
                            saveDeferred.resolve(campaign);
                        });
                    });

                    it('should update the cleanModel', function() {
                        expect(CampaignCtrl.cleanModel).toEqual(campaign.pojoify());
                    });

                    it('should resolve to the campaign', function() {
                        expect(success).toHaveBeenCalledWith(campaign);
                    });

                    it('should $broadcast the "CampaignCtrl:campaignDidSave" event', function() {
                        expect($scope.$broadcast).toHaveBeenCalledWith('CampaignCtrl:campaignDidSave');
                    });
                });

                describe('when campaign cannot be saved', function() {
                    beforeEach(function() {
                        spyOn(ConfirmDialogService, 'display');
                        $scope.$apply(function() {
                            saveDeferred.reject('Bad request');
                        });
                    });

                    it('should show a dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    it('should reject the save', function() {
                        expect(failure).toHaveBeenCalledWith('Bad request');
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('pricingModel', function() {
                it('should set the pricing model on the campaign', function() {
                    expect(CampaignCtrl.pricingModel).toBe('CPV');

                    expect(CampaignCtrl.model.pricing.model).toBe(undefined);

                    $scope.$apply(function() {
                        CampaignCtrl.pricingModel = 'CPM';
                    });

                    expect(CampaignCtrl.model.pricing.model).toBe('cpm');

                    $scope.$apply(function() {
                        CampaignCtrl.pricingModel = 'CPV';
                    });

                    expect(CampaignCtrl.model.pricing.model).toBe('cpv');
                });
            });
        });
    });
});
