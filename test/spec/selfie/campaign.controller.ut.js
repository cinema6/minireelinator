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

    describe('SelfieCampaignController', function() {
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

            cState = {
                campaign: campaign,
                card: card,
                advertiser: advertiser
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
                describe('when campaign status is not defined', function() {
                    it('should be false until a property changes', function() {
                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                        SelfieCampaignCtrl.campaign.name = 'Something Else';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(true);
                    });
                });

                describe('when campaign status is not "draft"', function() {
                    it('should be false even if properties change', function() {
                        SelfieCampaignCtrl.campaign.status = 'active';
                        SelfieCampaignCtrl.campaign.name = 'Something Else';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                    });

                    it('should be false even if properties change', function() {
                        SelfieCampaignCtrl.campaign.status = 'active';
                        SelfieCampaignCtrl.campaign.name = 'Something Else';
                        SelfieCampaignCtrl.card.title = 'Something';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                    });
                });

                describe('when the campaign status is "draft"', function() {
                    it('should be false until a property changes', function() {
                        SelfieCampaignCtrl.campaign.status = 'draft';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                        SelfieCampaignCtrl.campaign.name = 'Something Else';
                        expect(SelfieCampaignCtrl.shouldSave).toBe(true);
                    });
                });
            });

            describe('canSubmit', function() {
                it('should only be true when required propeties are set', function() {
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.validation.budget = false;

                    SelfieCampaignCtrl.campaign.name = 'Campaign Name';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.params.sponsor = 'Sponsor Name';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.data.service = 'youtube';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.data.videoid = '123456';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.validation.budget = true;
                    expect(SelfieCampaignCtrl.canSubmit).toBe(true);
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
                        saveCardDeferred = $q.defer();

                        spyOn(SelfieCampaignCtrl.campaign, 'save').and.returnValue(saveCampaignDeferred.promise);
                        spyOn(SelfieCampaignCtrl.card, 'save').and.returnValue(saveCardDeferred.promise);

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

                        it('should save the card', function() {
                            expect(SelfieCampaignCtrl.card.save).toHaveBeenCalled();
                        });

                        describe('after the card is saved', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    card.id = 'rc-123';

                                    saveCardDeferred.resolve(card);
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
                        saveCardDeferred = $q.defer();

                        spyOn(SelfieCampaignCtrl.campaign, 'save').and.returnValue(saveCampaignDeferred.promise);
                        spyOn(SelfieCampaignCtrl.card, 'save').and.returnValue(saveCardDeferred.promise);

                        SelfieCampaignCtrl.save();
                    });

                    it('should save the card first', function() {
                        expect(SelfieCampaignCtrl.card.save).toHaveBeenCalled();
                    });

                    it('should not save the campaign yet', function() {
                        expect(SelfieCampaignCtrl.campaign.save).not.toHaveBeenCalled();
                    });

                    describe('after card is saved', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                saveCardDeferred.resolve(card);
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

            describe('submit()', function() {
                var saveDeferred;

                beforeEach(function() {
                    saveDeferred = $q.defer();

                    spyOn(c6State, 'goTo');
                    spyOn(SelfieCampaignCtrl, 'save').and.returnValue(saveDeferred.promise);
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(SelfieCampaignCtrl.submit);
                });

                it('should save the campaign/card and return to dashboard on success', function() {
                    SelfieCampaignCtrl.submit();

                    expect(SelfieCampaignCtrl.save).toHaveBeenCalled();
                    expect(c6State.goTo).not.toHaveBeenCalled();

                    $scope.$apply(function() {
                        saveDeferred.resolve();
                    });

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                });
            });

            describe('autoSave()', function() {
                it('should call save after a 5 second debounce', function() {
                    expect(c6Debounce).toHaveBeenCalled();
                    expect(c6Debounce.debouncedFn).not.toHaveBeenCalled();

                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();
                    SelfieCampaignCtrl.autoSave();

                    $timeout.flush(5000);

                    expect(c6Debounce.debouncedFn).toHaveBeenCalled();
                    expect(c6Debounce.debouncedFn.calls.count()).toBe(1);
                });
            });
        });

        describe('$watchers', function() {
            describe('campaign properties', function() {
                beforeEach(function() {
                    spyOn(SelfieCampaignCtrl, 'autoSave');
                    spyOn($scope, '$broadcast');
                });

                describe('when campaign should auto save', function() {
                    it('category changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.categories = [{name: 'Comedy'}];
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('geoTargeting changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.geoTargeting = [{state: 'Arizona'}];
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('budget changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.budget = 3000;
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('geoTargeting changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.dailyLimit = 50;
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    describe('name changes', function() {
                        it('should trigger an autosave', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                            });

                            expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                        });

                        describe('when the card has a service type and video id', function() {
                            it('should reload preview', function() {
                                SelfieCampaignCtrl.card.data.service = 'youtube';
                                SelfieCampaignCtrl.card.data.videoid = '123';

                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });

                        describe('when the card has no service type and video id', function() {
                            it('should not reload preview', function() {
                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                                });

                                expect($scope.$broadcast).not.toHaveBeenCalledWith('loadPreview');
                            });
                        });
                    });
                });

                describe('when campaign should not auto save', function() {
                    beforeEach(function() {
                        SelfieCampaignCtrl.campaign.status = 'active';
                    });

                    it('category changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.categories = [{name: 'Comedy'}];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('geoTargeting changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.geoTargeting = [{state: 'Arizona'}];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('budget changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.budget = 3000;
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('geoTargeting changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.dailyLimit = 50;
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    describe('name changes', function() {
                        it('should trigger not an autosave', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                            });

                            expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                        });

                        describe('when the card has a service type and video id', function() {
                            it('should reload preview', function() {
                                SelfieCampaignCtrl.card.data.service = 'youtube';
                                SelfieCampaignCtrl.card.data.videoid = '123';

                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });

                        describe('when the card has no service type and video id', function() {
                            it('should not reload preview', function() {
                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                                });

                                expect($scope.$broadcast).not.toHaveBeenCalledWith('loadPreview');
                            });
                        });
                    });
                });
            });

            describe('card properties', function() {
                beforeEach(function() {
                    spyOn(SelfieCampaignCtrl, 'autoSave');
                    spyOn($scope, '$broadcast');
                });

                describe('when card should auto save', function() {
                    ['title','note','thumb'].forEach(function(prop) {
                        it(prop + ' changes should trigger an autosave', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card[prop] = 'something';
                            });

                            expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                        });

                        it(prop + ' changes should not reload preview if card has no service and id', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card[prop] = 'something';
                            });

                            expect($scope.$broadcast).not.toHaveBeenCalledWith('loadPreview');
                        });


                        it(prop + ' changes should reload preview if card has service and id', function() {
                            SelfieCampaignCtrl.card.data.service = 'youtube';
                            SelfieCampaignCtrl.card.data.videoid = '123';

                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card[prop] = 'something';
                            });

                            expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                        });
                    });

                    it('logo changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.collateral.logo = 'newlogo.jpg';
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('sponsor name changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.params.sponsor = 'New Sponsor';
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    ['label','type'].forEach(function(prop) {
                        it('action ' + prop + ' changes should trigger and autosave', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card.params.action = {};
                                SelfieCampaignCtrl.card.params.action[prop] = 'something';
                            });

                            expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                        });

                        it(prop + ' changes should not reload preview if card has no service and id', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card.params.action = {};
                                SelfieCampaignCtrl.card.params.action[prop] = 'something';
                            });

                            expect($scope.$broadcast).not.toHaveBeenCalledWith('loadPreview');
                        });


                        it(prop + ' changes should reload preview if card has service and id', function() {
                            SelfieCampaignCtrl.card.data.service = 'youtube';
                            SelfieCampaignCtrl.card.data.videoid = '123';

                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card.params.action = {};
                                SelfieCampaignCtrl.card.params.action[prop] = 'something';
                            });

                            expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                        });
                    });

                    it('service and id changes should tigger an autosave and reload a preview', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.data.service = 'youtube';
                            SelfieCampaignCtrl.card.data.videoid = '123';
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                        expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                    });

                    it('service and id changes should not trigger a preview reload if null', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.data.service = null;
                            SelfieCampaignCtrl.card.data.videoid = null;
                        });

                        expect($scope.$broadcast).not.toHaveBeenCalledWith('loadPreview');
                    });
                });
            });
        });
    });
});