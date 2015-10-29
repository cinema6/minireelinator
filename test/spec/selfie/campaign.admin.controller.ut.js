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

    describe('SelfieCampaignAdminController', function() {
        var $rootScope,
            $scope,
            $controller,
            $timeout,
            $q,
            c6State,
            c6Debounce,
            cinema6,
            MiniReelService,
            SelfieCampaignCtrl;

        var cState,
            campaign,
            card,
            categories,
            logos,
            paymentMethods,
            advertiser;

        var saveCardDeferred,
            saveCampaignDeferred,
            debouncedFns;

        function compileCtrl(cState, model) {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieCampaignCtrl = $controller('SelfieCampaignController', {
                    $scope: $scope,
                    cState: {
                        card: cState.card,
                        campaign: cState.campaign,
                        advertiser: cState.advertiser
                    }
                });
                SelfieCampaignCtrl.initWithModel(model);
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

            module(c6uilib.name, function($provide) {
                $provide.decorator('c6Debounce', function($delegate) {
                    return jasmine.createSpy('c6Debounce()').and.callFake(function(fn, time) {
                        c6Debounce.debouncedFn = fn;
                        spyOn(c6Debounce, 'debouncedFn');

                        return $delegate.call(null, c6Debounce.debouncedFn, time);
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
                c6State = $injector.get('c6State');
                c6Debounce = $injector.get('c6Debounce');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');
            });

            advertiser = {
                id: 'a-123',
                defaultLogos: {
                    square: '/square-logo.jpg'
                }
            };
            campaign = cinema6.db.create('selfieCampaign', {
                name: null,
                cards: [],
                pricing: {},
                status: 'draft',
                appllication: 'selfie',
                advertiserDisplayName: 'My Company',
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
            card = deepExtend(cinema6.db.create('card', MiniReelService.createCard('video')), {
                id: undefined,
                campaignId: undefined,
                campaign: {
                    minViewTime: 3
                },
                sponsored: true,
                collateral: {
                    logo: advertiser.defaultLogos && advertiser.defaultLogos.square ?
                        advertiser.defaultLogos.square :
                        null
                },
                links: advertiser.defaultLinks || {},
                params: {
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
            logos = [];
            paymentMethods = [];

            cState = {
                campaign: campaign,
                card: card,
                advertiser: advertiser
            };

            compileCtrl(cState, {
                categories: categories,
                logos: logos,
                paymentMethods: paymentMethods
            });
        });

        it('should exist', function() {
            expect(SelfieCampaignCtrl).toEqual(jasmine.any(Object));
        });

    });
});
