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
            $timeout,
            $q,
            c6State,
            cinema6,
            MiniReelService,
            SelfieManageCampaignAdminCtrl,
            c6Debounce;

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
                    cState: cState
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
            module(c6uilib.name, function($provide) {
                $provide.decorator('c6Debounce', function($delegate) {
                    return jasmine.createSpy('c6Debounce()').and.callFake(function(fn, time) {
                        c6Debounce.debouncedFn = fn;
                        spyOn(c6Debounce, 'debouncedFn').and.callThrough();

                        return $delegate.call(null, c6Debounce.debouncedFn, time);
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $timeout = $injector.get('$timeout');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');
                c6Debounce = $injector.get('c6Debounce');
            });

            spyOn(c6State, 'goTo');

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
            campaign = cinema6.db.create('selfieCampaign', {
                name: null,
                categories: [],
                cards: [card],
                pricing: {},
                geoTargeting: [],
                status: 'draft',
                appllication: 'selfie'
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
                },
                save: jasmine.createSpy('save()').and.returnValue($q.when())
            };

            cState = {
                campaign: campaign,
                updateRequest: updateRequest
            };

            compileCtrl(cState, {});
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
                            SelfieManageCampaignAdminCtrl.initWithModel();
                        });
                    })

                    it('should set properties on the Ctrl', function() {
                        expect(SelfieManageCampaignAdminCtrl.showApproval).toBe(true);
                        expect(SelfieManageCampaignAdminCtrl.campaign).toEqual(campaign.pojoify());
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).not.toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign.name).toBe('Updated Name');
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0].title).toBe('Updated Title');
                        expect(SelfieManageCampaignAdminCtrl.previewCard).not.toBe(SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0]);
                        expect(SelfieManageCampaignAdminCtrl.previewCard).toEqual(copy(SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0]));
                        expect(SelfieManageCampaignAdminCtrl.rejectionReason).toBe('');
                    });
                });

                describe('when there is no updateRequest', function() {
                    beforeEach(function() {
                        cState.updateRequest = null;
                        compileCtrl(cState, {});

                        $scope.$apply(function() {
                            SelfieManageCampaignAdminCtrl.initWithModel();
                        });
                    })

                    it('should set properties on the Ctrl', function() {
                        expect(SelfieManageCampaignAdminCtrl.showApproval).toBe(false);
                        expect(SelfieManageCampaignAdminCtrl.campaign).toEqual(campaign.pojoify());
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).not.toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).toEqual(campaign.pojoify());
                        expect(SelfieManageCampaignAdminCtrl.previewCard).toBe(null);
                        expect(SelfieManageCampaignAdminCtrl.rejectionReason).toBe('');
                    });
                });
            });

            describe('approveCampaign()', function() {
                beforeEach(function() {
                    SelfieManageCampaignAdminCtrl.approveCampaign();
                    $scope.$digest();
                });

                it('should update and save the updateRequest', function() {
                    expect(updateRequest.data).toEqual(SelfieManageCampaignAdminCtrl.updatedCampaign);
                    expect(updateRequest.status).toBe('approved');
                    expect(updateRequest.save).toHaveBeenCalled();
                });

                it('should redirect to the campaign dashboard', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                });
            });

            describe('rejectCampaign()', function() {
                beforeEach(function() {
                    SelfieManageCampaignAdminCtrl.rejectionReason = 'fix your campaign';
                    SelfieManageCampaignAdminCtrl.rejectCampaign();
                    $scope.$digest();
                });

                it('should update and save the updateRequest', function() {
                    expect(updateRequest.status).toBe('rejected');
                    expect(updateRequest.rejectionReason).toBe('fix your campaign');
                    expect(updateRequest.save).toHaveBeenCalled();
                });

                it('should redirect to teh campaign dashboard', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                });
            });

            describe('_loadPreview(card)', function() {
                it('should debounce for 2 seconds', function() {
                    expect(c6Debounce.debouncedFn).not.toHaveBeenCalled();

                    var card = SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0];
                    for(var i=0;i<10;i++) {
                        SelfieManageCampaignAdminCtrl._loadPreview(card);
                    }

                    $timeout.flush(2000);

                    expect(c6Debounce.debouncedFn).toHaveBeenCalled();
                    expect(c6Debounce.debouncedFn.calls.count()).toBe(1);
                });

                it('should put a copy of the card on the controller and add the advertiserDisplayName', function() {
                    var decoratedCard = copy(SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0]);
                    decoratedCard.params.sponsor = campaign.advertiserDisplayName;

                    SelfieManageCampaignAdminCtrl._loadPreview();

                    $timeout.flush(2000);

                    expect(SelfieManageCampaignAdminCtrl.previewCard).toEqual(decoratedCard);
                });
            });
        });

        describe('$watchers', function() {
            describe('for an updated card', function() {
                beforeEach(function() {
                    spyOn(SelfieManageCampaignAdminCtrl, '_loadPreview');
                    $scope.$apply(function() {
                        SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0].note = 'B flat';
                    });
                });

                it('should load the card preview', function() {
                    var updatedCard = SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0];
                    expect(SelfieManageCampaignAdminCtrl._loadPreview).toHaveBeenCalledWith(updatedCard);
                });
            });
        });
    });
});
