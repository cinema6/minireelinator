define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    var forEach = angular.forEach,
        isObject = angular.isObject,
        copy = angular.copy,
        extend = angular.extend;

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
            updateRequest,
            interests;

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

            interests = [
                { id: 'cat-123', label: 'cat: meow', externalId: 'IAB-1' },
                { id: 'cat-456', label: 'cat: purr', externalId: 'IAB-2' }
            ];
            spyOn(cinema6.db, 'findAll').and.returnValue($q.when(interests));

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
                appllication: 'selfie',
                targeting: {
                    interests: interests
                }
            });
            updateRequest = {
                id: 'ur-12345',
                status: 'pending',
                data: {
                    name: 'Updated Name',
                    categories: [],
                    cards: [{
                        title: 'Updated Title',
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
                        },
                        targeting: {
                            interests: interests
                        }
                    }],
                    pricing: {},
                    geoTargeting: [],
                    status: 'draft',
                    appllication: 'selfie',
                    targeting: {
                        interests: ['cat-123', 'cat-456']
                    }
                },
                save: jasmine.createSpy('save()').and.returnValue($q.when())
            };

            cState = {
                cParent: {
                    cName: 'Selfie:All:CampaignDashboard'
                },
                campaign: campaign,
                updateRequest: updateRequest,
                saveUpdateRequest: jasmine.createSpy('saveUpdateRequest()').and.returnValue($q.when())
            };

            compileCtrl(cState, {});
        });

        it('should exist', function() {
            expect(SelfieManageCampaignAdminCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel()', function() {
                describe('when there is an updateRequest', function() {
                    it('should set properties on the Ctrl', function() {
                        expect(SelfieManageCampaignAdminCtrl.showApproval).toBe(true);
                        expect(SelfieManageCampaignAdminCtrl.campaign).toEqual(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).not.toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).toEqual(updateRequest.data);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign.name).toBe('Updated Name');
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0].title).toBe('Updated Title');
                        expect(SelfieManageCampaignAdminCtrl.previewCard).not.toBe(SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0]);
                        expect(SelfieManageCampaignAdminCtrl.previewCard).toEqual(copy(SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0]));
                        expect(SelfieManageCampaignAdminCtrl.rejectionReason).toBe('');
                        expect(SelfieManageCampaignAdminCtrl.error).toBe(null);
                    });

                    describe('hasDuration', function() {
                        it('should be true if card has duration', function() {
                            expect(SelfieManageCampaignAdminCtrl.hasDuration).toBe(false);

                            updateRequest.data.cards[0].data.duration = 30;
                            card.data.duration = undefined;

                            compileCtrl(cState, {});

                            expect(SelfieManageCampaignAdminCtrl.hasDuration).toBe(true);
                        });
                    });
                });

                describe('when there is no updateRequest', function() {
                    beforeEach(function() {
                        cState.updateRequest = null;
                        compileCtrl(cState, {});
                    })

                    it('should set properties on the Ctrl', function() {
                        expect(SelfieManageCampaignAdminCtrl.showApproval).toBe(false);
                        expect(SelfieManageCampaignAdminCtrl.campaign).toEqual(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).toBe(campaign);
                        expect(SelfieManageCampaignAdminCtrl.updatedCampaign).toEqual(campaign);
                        expect(SelfieManageCampaignAdminCtrl.previewCard).toBe(null);
                        expect(SelfieManageCampaignAdminCtrl.rejectionReason).toBe('');
                    });

                    describe('hasDuration', function() {
                        it('should be true if card has duration', function() {
                            expect(SelfieManageCampaignAdminCtrl.hasDuration).toBe(false);

                            card.data.duration = 30;

                            compileCtrl(cState, {});

                            expect(SelfieManageCampaignAdminCtrl.hasDuration).toBe(true);
                        });
                    });
                });
            });

            describe('approveCampaign()', function() {
                describe('when parent dashboard state is Pending', function() {
                    it('should go to Selfie:Pending:CampaignDashboard', function() {
                        cState.cParent.cName = 'Selfie:Pending:CampaignDashboard';

                        SelfieManageCampaignAdminCtrl.approveCampaign();
                        $scope.$digest();

                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                    });
                });

                describe('when parent dashboard state is All', function() {
                    it('should go to Selfie:All:CampaignDashboard', function() {
                        cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                        SelfieManageCampaignAdminCtrl.approveCampaign();
                        $scope.$digest();

                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                    });
                });

                it('should update and save the updateRequest', function() {
                    SelfieManageCampaignAdminCtrl.approveCampaign();
                    $scope.$digest();
                    expect(cState.saveUpdateRequest).toHaveBeenCalledWith({
                        data: SelfieManageCampaignAdminCtrl.updatedCampaign,
                        status: 'approved'
                    });
                });

                it('should set the error property if a problem occurs', function() {
                    cState.saveUpdateRequest.and.returnValue($q.reject({ data: 'epic fail' }));
                    SelfieManageCampaignAdminCtrl.approveCampaign();
                    $scope.$digest();
                    expect(SelfieManageCampaignAdminCtrl.error).toBe('There was a problem approving the campaign: epic fail');
                    expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:CampaignDashboard');
                });
            });

            describe('rejectCampaign()', function() {
                describe('when parent dashboard state is Pending', function() {
                    it('should go to Selfie:Pending:CampaignDashboard', function() {
                        cState.cParent.cName = 'Selfie:Pending:CampaignDashboard';

                        SelfieManageCampaignAdminCtrl.rejectCampaign();
                        $scope.$digest();

                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                    });
                });

                describe('when parent dashboard state is All', function() {
                    it('should go to Selfie:All:CampaignDashboard', function() {
                        cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                        SelfieManageCampaignAdminCtrl.rejectCampaign();
                        $scope.$digest();

                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                    });
                });

                it('should update and save the updateRequest', function() {
                    SelfieManageCampaignAdminCtrl.rejectionReason = 'fix your campaign';
                    SelfieManageCampaignAdminCtrl.rejectCampaign();
                    $scope.$digest();
                    expect(cState.saveUpdateRequest).toHaveBeenCalledWith({
                        status: 'rejected',
                        rejectionReason: 'fix your campaign'
                    });
                });

                it('should set the error property if a problem occurs', function() {
                    cState.saveUpdateRequest.and.returnValue($q.reject({ data: 'epic fail' }));
                    SelfieManageCampaignAdminCtrl.rejectCampaign();
                    $scope.$digest();
                    expect(SelfieManageCampaignAdminCtrl.error).toBe('There was a problem rejecting the campaign: epic fail');
                    expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:CampaignDashboard');
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
                });

                it('should load the card preview', function() {
                    $scope.$apply(function() {
                        SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0].note = 'B flat';
                    });
                    var updatedCard = SelfieManageCampaignAdminCtrl.updatedCampaign.cards[0];
                    expect(SelfieManageCampaignAdminCtrl._loadPreview).toHaveBeenCalledWith(updatedCard);
                });
            });
        });
    });
});
