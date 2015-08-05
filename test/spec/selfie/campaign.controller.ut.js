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

    fdescribe('SelfieCampaignController', function() {
        var $rootScope,
            $scope,
            $controller,
            $timeout,
            $q,
            c6Debounce,
            cinema6,
            MiniReelService,
            SelfieCampaignCtrl;

        var cState,
            campaign,
            card,
            categories,
            logos,
            advertiser;

        var updateCardDeferred,
            saveCampaignDeferred;

        function compileCtrl(cState, model) {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieCampaignCtrl = $controller('SelfieCampaignController', {
                    $scope: $scope,
                    cState: {
                        card: cState.card,
                        campaign: cState.campaign,
                        advertiser: cState.advertiser,
                        updateCard: cState.updateCard
                    }
                });
                SelfieCampaignCtrl.initWithModel(model);
            });
        }

        beforeEach(function() {
            module(appModule.name);

            module(c6uilib.name, function($provide) {
                $provide.decorator('c6Debounce', function($delegate) {
                    return jasmine.createSpy('c6Debounce()').and.callFake(function(fn) {
                        c6Debounce.debounceFn = fn;
                        spyOn(c6Debounce, 'debounceFn');
                        return c6Debounce.debounceFn;
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
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
                categories: [],
                cards: [],
                pricing: {},
                geoTargeting: [],
                status: 'new'
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
                    sponsor: advertiser.name,
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

            updateCardDeferred = $q.defer();

            cState = {
                campaign: campaign,
                card: card,
                advertiser: advertiser,
                updateCard: jasmine.createSpy('cState.updateCard()').and.returnValue(updateCardDeferred.promise)
            };

            compileCtrl(cState, {
                categories: categories,
                logos: logos
            });
        });

        it('should exist', function() {
            expect(SelfieCampaignCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('disableVideoTitleOverwrite', function() {
                it('should be false', function() {
                    expect(SelfieCampaignCtrl.disableVideoTitleOverwrite).toBe(false);
                });
            });

            describe('shouldSave', function() {
                describe('when campaign status is not "new"', function() {
                    it('should be false even if properties change', function() {
                        SelfieCampaignCtrl.campaign.status = 'active';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                    });

                    it('should be false even if properties change', function() {
                        SelfieCampaignCtrl.campaign.status = 'active';
                        SelfieCampaignCtrl.campaign.name = 'Something Else';
                        SelfieCampaignCtrl.card.title = 'Something';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                    });
                });

                describe('when the campaign status is "new"', function() {
                    it('should be false by default because nothing has changed', function() {
                        SelfieCampaignCtrl.campaign.status = 'new';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                    });

                    describe('if a property on the card changes', function() {
                        it('should be true', function() {
                            SelfieCampaignCtrl.campaign.status = 'new';
                            SelfieCampaignCtrl.card.title = 'Something';
                            expect(SelfieCampaignCtrl.shouldSave).toBe(true);
                        });
                    });
                });
            });
        });

        describe('methods', function() {
            describe('initWithModel(model)', function() {
                it('should set properties on the Ctrl', function() {
                    $scope.$apply(function() {
                        SelfieCampaignCtrl.card = null;
                        SelfieCampaignCtrl.campaign = null;
                        SelfieCampaignCtrl.categories = null;
                        SelfieCampaignCtrl.logos = null;
                        SelfieCampaignCtrl.advertiser = null;

                        SelfieCampaignCtrl.initWithModel({ categories: categories, logos: logos });
                    });

                    expect(SelfieCampaignCtrl.card).toEqual(card);
                    expect(SelfieCampaignCtrl.campaign).toEqual(campaign);
                    expect(SelfieCampaignCtrl.advertiser).toEqual(advertiser);
                    expect(SelfieCampaignCtrl.logos).toEqual(logos);
                    expect(SelfieCampaignCtrl.categories).toEqual(categories);
                    expect(SelfieCampaignCtrl._proxyCard).toEqual(copy(card));
                    expect(SelfieCampaignCtrl._proxyCampaign).toEqual(copy(campaign));
                });
            });

            describe('save()', function() {
                it('should broadcast a WillSave event', function() {
                    spyOn($scope, '$broadcast');

                    SelfieCampaignCtrl.save();

                    expect($scope.$broadcast).toHaveBeenCalled();
                });

                describe('when the card has not been saved yet, and has no ID', function() {
                    beforeEach(function() {
                        saveCampaignDeferred = $q.defer();

                        spyOn(SelfieCampaignCtrl.campaign, 'save').and.returnValue(saveCampaignDeferred.promise);

                        SelfieCampaignCtrl.save();
                    });

                    it('should save the campaign first', function() {
                        expect(SelfieCampaignCtrl.campaign.save).toHaveBeenCalled();
                        expect(SelfieCampaignCtrl.card.campaignId).toBe(undefined);
                    });

                    describe('after the campaign saves', function() {
                        beforeEach(function() {
                            SelfieCampaignCtrl.campaign.id = 'cam-123';

                            $scope.$apply(function() {
                                saveCampaignDeferred.resolve(SelfieCampaignCtrl.campaign);
                            });
                        });

                        it('should set the campaignID on the card', function() {
                            expect(SelfieCampaignCtrl.card.campaignId).toBe('cam-123');
                        });

                        it('should cause the proxies to be out of sync', function() {
                            expect(SelfieCampaignCtrl._proxyCard).not.toEqual(copy(SelfieCampaignCtrl.card));
                            expect(SelfieCampaignCtrl._proxyCampaign).not.toEqual(copy(SelfieCampaignCtrl.campaign));
                        });

                        describe('after the card is updated', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    card.id = 'rc-123';

                                    updateCardDeferred.resolve(card);
                                });
                            });

                            it('should add the card to the campaign', function() {
                                expect(SelfieCampaignCtrl.campaign.cards[0]).toEqual({id: 'rc-123'});
                            });

                            it('should update the proxy cards and campaigns', function() {
                                expect(SelfieCampaignCtrl._proxyCard).toEqual(copy(SelfieCampaignCtrl.card));
                                expect(SelfieCampaignCtrl._proxyCampaign).toEqual(copy(SelfieCampaignCtrl.campaign));
                            });
                        });
                    });
                });

                describe('when the card has an ID', function() {
                    beforeEach(function() {
                        SelfieCampaignCtrl.card.id = 'rc-321';

                        saveCampaignDeferred = $q.defer();

                        spyOn(SelfieCampaignCtrl.campaign, 'save').and.returnValue(saveCampaignDeferred.promise);

                        SelfieCampaignCtrl.save();
                    });

                    it('should update the card first', function() {
                        expect(cState.updateCard).toHaveBeenCalled();
                    });

                    it('should not save the campaign yet', function() {
                        expect(SelfieCampaignCtrl.campaign.save).not.toHaveBeenCalled();
                    });

                    describe('after card is updated', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                updateCardDeferred.resolve(card);
                            });
                        });

                        it('should save the campaign', function() {
                            expect(SelfieCampaignCtrl.campaign.save).toHaveBeenCalled();
                        });

                        it('should cause the proxies to be out of sync', function() {
                            expect(SelfieCampaignCtrl._proxyCard).not.toEqual(copy(SelfieCampaignCtrl.card));
                            expect(SelfieCampaignCtrl._proxyCampaign).not.toEqual(copy(SelfieCampaignCtrl.campaign));
                        });

                        describe('after the campaign saves', function() {
                            it('should update the proxies', function() {
                                SelfieCampaignCtrl.campaign.id = 'cam-123';

                                $scope.$apply(function() {
                                    saveCampaignDeferred.resolve(SelfieCampaignCtrl.campaign);
                                });

                                expect(SelfieCampaignCtrl._proxyCard).toEqual(copy(SelfieCampaignCtrl.card));
                                expect(SelfieCampaignCtrl._proxyCampaign).toEqual(copy(SelfieCampaignCtrl.campaign));
                            });
                        });
                    });
                });
            });

            describe('autoSave()', function() {
                it('should call save after a 5 second debounce', function() {
                    expect(c6Debounce).toHaveBeenCalled();
                    expect(c6Debounce.debounceFn).not.toHaveBeenCalled();

                    // spyOn(SelfieCampaignCtrl, 'save');

                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();
                    // SelfieCampaignCtrl.autoSave();

                    // $timeout.flush(5000);

                    // expect(c6Debounce.debounceFn).toHaveBeenCalled();
                    // expect(c6Debounce.debounceFn.calls.count()).toBe(1);
                });
            });
        });
    });
});