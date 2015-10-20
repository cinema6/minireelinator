define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    var forEach = angular.forEach,
        isObject = angular.isObject,
        copy = angular.copy;

    function deepExtend(target, extension) {
        forEach(extension, function(extensionValue, prop) {
            var targetValue = target[prop];

            if (isObject(extensionValue) && isObject(targetValue)) {
                deepExtend(targetValue, extensionValue);
            } else {
                target[prop] = copy(extensionValue);
            }
        });

        return target;
    }

    describe('SelfieManageCampaignController', function() {
        var $rootScope,
            $scope,
            $controller,
            c6State,
            cinema6,
            MiniReelService,
            SelfieManageCampaignCtrl;

        var cState,
            campaign,
            card,
            categories,
            paymentMethods;

        var debouncedFns;

        function compileCtrl(cState, model) {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieManageCampaignCtrl = $controller('SelfieManageCampaignController', {
                    $scope: $scope,
                    cState: {
                        card: cState.card,
                        campaign: cState.campaign
                    }
                });
                SelfieManageCampaignCtrl.initWithModel(model);
            });
        }

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
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');
            });

            campaign = cinema6.db.create('selfieCampaign', {
                name: null,
                categories: [],
                cards: [],
                pricing: {},
                geoTargeting: [],
                status: 'draft',
                appllication: 'selfie'
            });
            card = deepExtend(cinema6.db.create('card', MiniReelService.createCard('video')), {
                id: undefined,
                campaignId: undefined,
                campaign: {
                    minViewTime: 3
                },
                sponsored: true,
                collateral: {
                    logo: null
                },
                links: {},
                params: {
                    sponsor: 'Advertiser Name',
                    ad: true,
                    action: null
                },
                data: {
                    autoadvance: false,
                    controls: false,
                    autoplay: true,
                    skip: 30
                }
            });
            categories = [];
            paymentMethods = [];

            cState = {
                campaign: campaign,
                card: card
            };

            compileCtrl(cState, {
                categories: categories,
                paymentMethods: paymentMethods
            });
        });

        it('should exist', function() {
            expect(SelfieManageCampaignCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('canSubmit', function() {
                it('should only be true when required propeties are set', function() {
                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.validation.budget = false;

                    SelfieManageCampaignCtrl.campaign.name = 'Campaign Name';
                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.validation.budget = true;
                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(true);
                });
            });
        });

        describe('methods', function() {
            describe('initWithModel(model)', function() {
                it('should set properties on the Ctrl', function() {
                    $scope.$apply(function() {
                        SelfieManageCampaignCtrl.card = null;
                        SelfieManageCampaignCtrl.campaign = null;
                        SelfieManageCampaignCtrl.categories = null;
                        SelfieManageCampaignCtrl.paymentMethods = null;

                        SelfieManageCampaignCtrl.initWithModel({categories: categories, paymentMethods: paymentMethods});
                    });

                    expect(SelfieManageCampaignCtrl.card).toEqual(card);
                    expect(SelfieManageCampaignCtrl.campaign).toEqual(campaign);
                    expect(SelfieManageCampaignCtrl.categories).toEqual(categories);
                    expect(SelfieManageCampaignCtrl.paymentMethods).toEqual(paymentMethods);
                });
            });

            describe('update()', function() {
                beforeEach(function() {
                    spyOn(SelfieManageCampaignCtrl.campaign, 'save');
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(SelfieManageCampaignCtrl.update);
                });

                it('should save the campaign/card and return to dashboard on success', function() {
                    SelfieManageCampaignCtrl.update();

                    expect(SelfieManageCampaignCtrl.campaign.save).toHaveBeenCalled();
                });
            });
        });
    });
});