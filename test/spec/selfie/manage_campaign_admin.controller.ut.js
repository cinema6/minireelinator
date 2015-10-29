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

    describe('SelfieManageCampaignAdminController', function() {
        var $rootScope,
            $scope,
            $controller,
            c6State,
            cinema6,
            MiniReelService,
            SelfieManageCampaignAdminCtrl;

        var cState,
            campaign,
            card,
            updateRequest;

        var debouncedFns;

        function compileCtrl(cState, model) {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieManageCampaignAdminCtrl = $controller('SelfieManageCampaignAdminController', {
                    $scope: $scope,
                    cState: {
                        card: cState.card,
                        campaign: cState.campaign
                    }
                });
                SelfieManageCampaignAdminCtrl.initWithModel(model);
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
            updateRequest = {
                id: 'ur-12345',
                status: 'pending',
                data: {
                    name: 'Updated Name',
                    cards: [
                        {
                            title: 'Updated Title'
                        }
                    ]
                }
            };

            cState = {
                campaign: campaign,
                card: card
            };

            compileCtrl(cState, {
                updateRequest: updateRequest
            });
        });

        it('should exist', function() {
            expect(SelfieManageCampaignAdminCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
        });

        describe('methods', function() {
            describe('initWithModel(model)', function() {

                describe('when there is an updateRequest', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            SelfieManageCampaignAdminCtrl.initWithModel({updateRequest: updateRequest});
                        });
                    })

                    it('should set properties on the Ctrl', function() {
                        expect(SelfieManageCampaignAdminCtrl.showApproval).toBe(true);
                        expect(SelfieManageCampaignAdminCtrl.campaign).toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.card).toBe(card);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).not.toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign.name).toBe('Updated Name');
                        expect(SelfieManageCampaignAdminCtrl.updatedCard).not.toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCard.title).toBe('Updated Title');
                        expect(SelfieManageCampaignAdminCtrl.previewCard).not.toBe(SelfieManageCampaignAdminCtrl.updatedCard);
                        expect(SelfieManageCampaignAdminCtrl.previewCard).toEqual(copy(SelfieManageCampaignAdminCtrl.updatedCard));
                        expect(SelfieManageCampaignAdminCtrl.rejectionReason).toBe('');
                    });
                });

                describe('when there is no updateRequest', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            SelfieManageCampaignAdminCtrl.initWithModel({updateRequest: null});
                        });
                    })

                    it('should set properties on the Ctrl', function() {
                        expect(SelfieManageCampaignAdminCtrl.showApproval).toBe(false);
                        expect(SelfieManageCampaignAdminCtrl.campaign).toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.card).toBe(card);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).not.toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).toEqual(copy(campaign));
                        expect(SelfieManageCampaignAdminCtrl.updatedCard).not.toBe(card);
                        expect(SelfieManageCampaignAdminCtrl.updatedCard).toEqual(copy(card));
                        expect(SelfieManageCampaignAdminCtrl.previewCard).toBe(null);
                        expect(SelfieManageCampaignAdminCtrl.rejectionReason).toBe('');
                    });
                });

            });
        });
    });
});
