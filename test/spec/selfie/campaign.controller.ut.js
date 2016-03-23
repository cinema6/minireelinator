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
            CampaignService,
            MiniReelService,
            ConfirmDialogService,
            SelfieCampaignSummaryService,
            SelfieCampaignCtrl,
            SoftAlertService,
            intercom;

        var cState,
            campaign,
            card,
            categories,
            logos,
            paymentMethods,
            advertiser,
            user,
            targetingCostData;

        var saveCampaignDeferred,
            debouncedFns;

        function compileCtrl(cState, model) {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieCampaignCtrl = $controller('SelfieCampaignController', {
                    $scope: $scope,
                    cState: cState
                });
                SelfieCampaignCtrl.initWithModel(model);
            });
        }

        beforeEach(function() {
            debouncedFns = [];

            intercom = jasmine.createSpy('intercom');

            module(appModule.name, ['$provide', function($provide) {
                $provide.value('intercom', intercom);
            }]);
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
                CampaignService = $injector.get('CampaignService');
                MiniReelService = $injector.get('MiniReelService');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
                SoftAlertService = $injector.get('SoftAlertService');
                SelfieCampaignSummaryService = $injector.get('SelfieCampaignSummaryService');
            });

            targetingCostData = {
                categories: {
                    areEqual: true,
                    geo: 0.1,
                    demo: 0.1,
                    interests: 0.1
                }
            };

            spyOn(CampaignService, 'getTargetingCost').and.returnValue(targetingCostData);

            advertiser = {
                id: 'a-123',
                defaultLogos: {
                    square: '/square-logo.jpg'
                }
            };
            card = deepExtend(MiniReelService.createCard('video'), {
                id: undefined,
                campaignId: undefined,
                campaign: {
                    minViewTime: 3
                },
                sponsored: true,
                collateral: {
                    logo: advertiser.defaultLogos && advertiser.defaultLogos.square ?
                        advertiser.defaultLogos.square :
                        undefined
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
            campaign = cinema6.db.create('selfieCampaign', {
                id: 'cam-123',
                advertiserId: 'a-123',
                name: undefined,
                pricing: {},
                status: 'draft',
                application: 'selfie',
                advertiserDisplayName: 'My Company',
                paymentMethod: undefined,
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
                },
                cards: [ card ]
            });
            categories = [];
            logos = [];
            paymentMethods = [
                {
                    token: 'pay-123',
                    default: true
                }
            ];
            user = {
                id: 'u-123'
            };

            cState = {
                _campaign: campaign,
                campaign: campaign.pojoify(),
                card: campaign.cards[0],
                advertiser: advertiser,
                user: user,
                paymentOptional: false,
                saveCampaign: jasmine.createSpy('cState.saveCampaign()'),
                saveUpdateRequest: jasmine.createSpy('cState.saveUpdateRequest()')
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

        describe('properties', function() {
            describe('disableVideoTitleOverwrite', function() {
                it('should be false', function() {
                    expect(SelfieCampaignCtrl.disableVideoTitleOverwrite).toBe(false);
                });
            });

            describe('shouldSave', function() {
                describe('when the viewer is the creator', function() {
                    beforeEach(function() {
                        SelfieCampaignCtrl.isCreator = true;
                    });

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

                describe('when the viewer is not the creator', function() {
                    it('should be false', function() {
                        SelfieCampaignCtrl.isCreator = false;
                        SelfieCampaignCtrl.campaign.status = 'draft';
                        SelfieCampaignCtrl.campaign.name = 'Something Else';

                        expect(SelfieCampaignCtrl.shouldSave).toBe(false);
                    });
                });
            });

            describe('canSubmit', function() {
                it('should only be true when required propeties are set', function() {
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.validation.budget = false;
                    SelfieCampaignCtrl.validation.radius = false;

                    SelfieCampaignCtrl.campaign.name = 'Campaign Name';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.campaign.advertiserDisplayName = 'Sponsor Name';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.campaign.paymentMethod = 'pay-8987628376786';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.data.service = 'youtube';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.data.videoid = '123456';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.links.Website = 'http://cinema6.com';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.title = 'Some headline!';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.params.action = {
                        type: 'button',
                        label: 'Learn More'
                    };
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.card.links.Action = 'http://cinema6.com';
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.validation.budget = true;
                    expect(SelfieCampaignCtrl.canSubmit).toBe(false);

                    SelfieCampaignCtrl.validation.radius = true;
                    expect(SelfieCampaignCtrl.canSubmit).toBe(true);
                });
            });

            describe('validation', function() {
                it('should be defined by default', function() {
                    expect(SelfieCampaignCtrl.validation.budget).toBe(true);
                    expect(SelfieCampaignCtrl.validation.radius).toBe(true);
                    expect(SelfieCampaignCtrl.validation.show).toBe(false);
                    expect(SelfieCampaignCtrl.validation.sections).toEqual(jasmine.any(Object));
                });

                describe('sections', function() {
                    it('should be an object containing validity of each section', function() {
                        expect(SelfieCampaignCtrl.validation.sections.section1).toBe(false);
                        cState.campaign.name = 'My Campaign';
                        expect(SelfieCampaignCtrl.validation.sections.section1).toBe(true);

                        expect(SelfieCampaignCtrl.validation.sections.section2).toBe(false);
                        cState.campaign.advertiserDisplayName = 'Advertiser Name';
                        cState.card.links.Website = 'http://cinema6.com';
                        expect(SelfieCampaignCtrl.validation.sections.section2).toBe(true);

                        expect(SelfieCampaignCtrl.validation.sections.section3).toBe(false);
                        cState.card.data.service = 'Youtube';
                        cState.card.data.videoid = 'xjh46ej';
                        expect(SelfieCampaignCtrl.validation.sections.section3).toBe(true);

                        expect(SelfieCampaignCtrl.validation.sections.section4).toBe(false);
                        cState.card.title = 'My Headline!';
                        cState.card.links.Action = 'http://cinema6.com';
                        cState.card.params.action = {
                            type: 'button',
                            label: 'Learn More'
                        };
                        expect(SelfieCampaignCtrl.validation.sections.section4).toBe(true);

                        expect(SelfieCampaignCtrl.validation.sections.section5).toBe(true);
                        SelfieCampaignCtrl.validation.radius = false;
                        expect(SelfieCampaignCtrl.validation.sections.section5).toBe(false);

                        SelfieCampaignCtrl.validation.budget = false;
                        SelfieCampaignCtrl.validation.dailyLimit = false;
                        expect(SelfieCampaignCtrl.validation.sections.section6).toBe(false);
                        SelfieCampaignCtrl.validation.budget = true;
                        SelfieCampaignCtrl.validation.dailyLimit = false;
                        expect(SelfieCampaignCtrl.validation.sections.section6).toBe(false);
                        SelfieCampaignCtrl.validation.budget = false;
                        SelfieCampaignCtrl.validation.dailyLimit = true;
                        expect(SelfieCampaignCtrl.validation.sections.section6).toBe(false);
                        SelfieCampaignCtrl.validation.budget = true;
                        SelfieCampaignCtrl.validation.dailyLimit = true;
                        expect(SelfieCampaignCtrl.validation.sections.section6).toBe(true);

                        SelfieCampaignCtrl.paymentOptional = false;
                        expect(SelfieCampaignCtrl.validation.sections.section7).toBe(false);
                        SelfieCampaignCtrl.paymentOptional = true;
                        expect(SelfieCampaignCtrl.validation.sections.section7).toBe(true);
                        SelfieCampaignCtrl.paymentOptional = false;
                        cState.campaign.paymentMethod = 'pay-123';
                        expect(SelfieCampaignCtrl.validation.sections.section7).toBe(true);

                        expect(SelfieCampaignCtrl.validation.sections.section8).toBe(true);
                    });
                });
            });

            describe('isClean', function() {
                it('should be true if the campaign bound in the UI equals the proxy campaign', function() {
                    expect(SelfieCampaignCtrl.isClean).toBe(true);

                    SelfieCampaignCtrl.campaign.name = 'New Name!';

                    expect(SelfieCampaignCtrl.isClean).toBe(false);

                    SelfieCampaignCtrl.campaign.name = undefined;

                    expect(SelfieCampaignCtrl.isClean).toBe(true);
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
                        SelfieCampaignCtrl.paymentMethods = null;

                        SelfieCampaignCtrl.initWithModel({ categories: categories, logos: logos, paymentMethods: paymentMethods });
                    });

                    expect(SelfieCampaignCtrl.card).toEqual(cState.card);
                    expect(SelfieCampaignCtrl.campaign).toEqual(cState.campaign);
                    expect(SelfieCampaignCtrl.advertiser).toEqual(cState.advertiser);
                    expect(SelfieCampaignCtrl.logos).toEqual(logos);
                    expect(SelfieCampaignCtrl.categories).toEqual(categories);
                    expect(SelfieCampaignCtrl.paymentMethods).toEqual(paymentMethods);
                    expect(SelfieCampaignCtrl._proxyCard).toEqual(copy(cState.card));
                    expect(SelfieCampaignCtrl._proxyCampaign).toEqual(copy(cState.campaign));
                    expect(SelfieCampaignCtrl.originalCampaign).toEqual(campaign);
                    expect(SelfieCampaignCtrl.user).toEqual(user);
                    expect(SelfieCampaignCtrl.paymentOptional).toEqual(cState.paymentOptional);
                    expect(SelfieCampaignCtrl.targetingCost).toEqual(targetingCostData);
                });
            });

            describe('save()', function() {
                beforeEach(function() {
                    saveCampaignDeferred = $q.defer();

                    cState.saveCampaign.and.returnValue(saveCampaignDeferred.promise);

                    spyOn(SoftAlertService, 'display');

                    SelfieCampaignCtrl.save();
                });

                it('should display the soft alert', function() {
                    expect(SoftAlertService.display).toHaveBeenCalledWith({
                        success: true,
                        action: 'saving'
                    });
                });

                it('should broadcast a WillSave event', function() {
                    spyOn($scope, '$broadcast');

                    SelfieCampaignCtrl.save();

                    expect($scope.$broadcast).toHaveBeenCalled();
                });

                it('should save the campaign', function() {
                    expect(cState.saveCampaign).toHaveBeenCalled();
                });

                describe('after the campaign saves', function() {
                    it('should update the proxy cards and campaigns', function() {
                        $scope.$apply(function() {
                            saveCampaignDeferred.resolve(SelfieCampaignCtrl.campaign);
                        });

                        expect(SelfieCampaignCtrl._proxyCard).toEqual(SelfieCampaignCtrl.campaign.cards[0]);
                        expect(SelfieCampaignCtrl._proxyCampaign).toEqual(SelfieCampaignCtrl.campaign);

                        expect(SelfieCampaignCtrl._proxyCard).not.toBe(SelfieCampaignCtrl.campaign.cards[0]);
                        expect(SelfieCampaignCtrl._proxyCampaign).not.toBe(SelfieCampaignCtrl.campaign);
                    });

                    it('should display the "saved" soft alert', function() {
                        $scope.$apply(function() {
                            saveCampaignDeferred.resolve(SelfieCampaignCtrl.campaign);
                        });

                        expect(SoftAlertService.display).toHaveBeenCalledWith({
                            success: true,
                            action: 'saved',
                            timer: 3500
                        });
                    });
                });

                describe('when campaign save fails', function() {
                    it('should display "failed" soft alert', function() {
                        $scope.$apply(function() {
                            saveCampaignDeferred.reject('ERROR');
                        });

                        expect(SoftAlertService.display).toHaveBeenCalledWith({
                            success: false,
                            timer: 3500
                        });
                    });
                });
            });

            describe('submit()', function() {
                var saveDeferred, updateRequestDeferred, updateRequest;

                beforeEach(function() {
                    updateRequest = {};
                    saveDeferred = $q.defer();
                    updateRequestDeferred = $q.defer();

                    cState.saveCampaign.and.returnValue(saveDeferred.promise);

                    spyOn(c6State, 'goTo');
                    spyOn(ConfirmDialogService, 'display');
                    spyOn(SelfieCampaignSummaryService, 'display');
                    spyOn(SelfieCampaignSummaryService, 'close');
                    spyOn(SelfieCampaignSummaryService, 'pending');
                    spyOn(campaign, 'pojoify').and.callThrough();
                    spyOn(cinema6.db, 'create').and.callFake(function(type, obj) {
                        updateRequest.data = obj.data;
                        updateRequest.campaign = obj.campaign;
                        updateRequest.save = jasmine.createSpy('update.save()').and.returnValue(updateRequestDeferred.promise);
                        return updateRequest;
                    });
                });

                it('should set validation.show to true to trigger error states', function() {
                    expect(SelfieCampaignCtrl.validation.show).toBe(false);

                    SelfieCampaignCtrl.submit();

                    expect(SelfieCampaignCtrl.validation.show).toBe(true);
                    expect(cState.saveCampaign).not.toHaveBeenCalled();
                    expect(cinema6.db.create).not.toHaveBeenCalled();
                });

                describe('when the campaign can submit', function() {
                    beforeEach(function() {
                        cState.campaign.name = 'Campaign Name';
                        cState.campaign.advertiserDisplayName = 'Advertiser Name';
                        cState.campaign.paymentMethod = 'pay-123';
                        cState.card.links.Website = 'http://cinema6.com';
                        cState.card.data.service = 'Youtube';
                        cState.card.data.videoid = 'xh653bs8';
                        cState.card.title = 'My Headline!';
                        cState.card.links.Action = 'http://cinema6.com';
                        cState.card.params.action = {
                            type: 'button',
                            label: 'Learn More'
                        };

                        SelfieCampaignCtrl.validation.budget = true;
                    });

                    describe('when campaign is a draft', function() {
                        var onAffirm, onCancel;

                        beforeEach(function() {
                            cState._campaign.status = 'draft';
                            cState.campaign.status = 'draft';

                            SelfieCampaignCtrl.submit();

                            onAffirm = SelfieCampaignSummaryService.display.calls.mostRecent().args[0].onAffirm;
                            onCancel = SelfieCampaignSummaryService.display.calls.mostRecent().args[0].onCancel;
                        });

                        it('should should the campaign summary', function() {
                            expect(SelfieCampaignSummaryService.display).toHaveBeenCalled();
                        });

                        describe('onAffirm()', function() {
                            beforeEach(function() {
                                onAffirm();
                            });

                            it('should be wrapped in a c6AsyncQueue', function() {
                                expect(debouncedFns).toContain(onAffirm);
                            });

                            it('should set summary save to pending', function() {
                                expect(SelfieCampaignSummaryService.pending).toHaveBeenCalledWith(true);
                            });

                            it('should save the campaign', function() {
                                expect(cState.saveCampaign).toHaveBeenCalled();
                            });

                            describe('when the save succeeds', function() {
                                var expectedData;

                                beforeEach(function() {
                                    cState._campaign.id = 'cam-123';

                                    expectedData = campaign.pojoify();
                                    expectedData.status = 'active';

                                    $rootScope.$apply(function() {
                                        saveDeferred.resolve();
                                    });
                                });

                                it('should pojoify the master campaign', function() {
                                    expect(campaign.pojoify).toHaveBeenCalled();
                                });

                                it('should create an update request with campaign.status = "active"', function() {
                                    expect(cinema6.db.create).toHaveBeenCalledWith('updateRequest', {
                                        campaign: 'cam-123',
                                        data: jasmine.objectContaining(expectedData)
                                    });
                                });

                                it('should save the update request', function() {
                                    expect(updateRequest.save).toHaveBeenCalled();
                                });

                                describe('when the update request save succeeds', function() {
                                    it('should change the status on the campaign bound in the UI', function() {
                                        expect(SelfieCampaignCtrl.campaign.status).toBe('draft');

                                        $rootScope.$apply(function() {
                                            updateRequestDeferred.resolve(updateRequest);
                                        });

                                        expect(SelfieCampaignCtrl.campaign.status).toBe('pending');
                                    });

                                    it('should send intercom a "submitCampaign" event with metadata', function() {
                                        $rootScope.$apply(function() {
                                            updateRequestDeferred.resolve(updateRequest);
                                        });

                                        expect(intercom).toHaveBeenCalledWith('trackEvent', 'submitCampaign', {
                                            campaignId: cState._campaign.id,
                                            campaignName: cState._campaign.name,
                                            advertiserId: cState._campaign.advertiserId,
                                            advertiserName: cState._campaign.advertiserDisplayName
                                        });
                                    });

                                    it('should go to the dashboard', function() {
                                        $rootScope.$apply(function() {
                                            updateRequestDeferred.resolve(updateRequest);
                                        });

                                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                                    });

                                    it('should set the allowExit flag on the cState', function() {
                                        $rootScope.$apply(function() {
                                            updateRequestDeferred.resolve(updateRequest);
                                        });

                                        expect(cState.allowExit).toBe(true);
                                    });
                                });

                                describe('when update request fails', function() {
                                    beforeEach(function() {
                                        $rootScope.$apply(function() {
                                            updateRequestDeferred.reject({data:'Error!'});
                                        });
                                    });

                                    it('should not send intercom a "submitCampaign" event with metadata', function() {
                                        expect(intercom).not.toHaveBeenCalled();
                                    });

                                    it('should close the summary', function() {
                                        expect(SelfieCampaignSummaryService.close).toHaveBeenCalled();
                                    });

                                    it('should set summary pending to false', function() {
                                        expect(SelfieCampaignSummaryService.pending).toHaveBeenCalledWith(false);
                                    });

                                    it('should show an error modal', function() {
                                        expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toEqual('There was a problem processing your request: Error!');
                                    });
                                });
                            });
                        });
                    });

                    describe('when campaign is not a draft', function() {
                        describe('when the campaign has not been edited', function() {
                            beforeEach(function() {
                                cState._campaign.status = 'paused';
                                SelfieCampaignCtrl.campaign.status = 'paused';
                                SelfieCampaignCtrl._proxyCampaign = SelfieCampaignCtrl.campaign;

                                SelfieCampaignCtrl.submit();
                            });

                            it('should alert the user that nothing has changed, and do nothing', function() {
                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toEqual('No changes have been detected.')
                            });
                        });

                        describe('when the campaign has been edited', function() {
                            beforeEach(function() {
                                cState._campaign.status = 'paused';
                                cState.campaign.status = 'paused';
                                cState.campaign.id = 'cam-123';
                                cState.campaign.name = 'Something else!';
                            });

                            describe('when the campaign has a pending update request', function() {
                                var onAffirm, onCancel;

                                beforeEach(function() {
                                    cState.saveUpdateRequest.and.returnValue(updateRequestDeferred.promise);
                                    cState.updateRequest = { id: 'ur-123' };

                                    SelfieCampaignCtrl.submit();

                                    onAffirm = SelfieCampaignSummaryService.display.calls.mostRecent().args[0].onAffirm;
                                    onCancel = SelfieCampaignSummaryService.display.calls.mostRecent().args[0].onCancel;
                                });

                                it('should show the campaign summary', function() {
                                    expect(SelfieCampaignSummaryService.display).toHaveBeenCalled();
                                });

                                describe('onAffirm()', function() {
                                    beforeEach(function() {
                                        $rootScope.$apply(function() {
                                            onAffirm();
                                        });
                                    });

                                    it('should set summary save to pending', function() {
                                        expect(SelfieCampaignSummaryService.pending).toHaveBeenCalledWith(true);
                                    });

                                    it('should save the updateRequest', function() {
                                        expect(cState.saveUpdateRequest).toHaveBeenCalled();
                                    });

                                    it('should not create a new update request', function() {
                                        expect(cinema6.db.create).not.toHaveBeenCalled();
                                    });

                                    describe('after the update request is saved', function() {
                                        beforeEach(function() {
                                            $rootScope.$apply(function() {
                                                updateRequestDeferred.resolve({
                                                    data: SelfieCampaignCtrl.campaign,
                                                    campaign: 'cam-123'
                                                });
                                            });
                                        });

                                        it('should not send intercom a "submitCampaign" event with metadata', function() {
                                            expect(intercom).not.toHaveBeenCalled();
                                        });

                                        it('should set summary pending to false and close it', function() {
                                            expect(SelfieCampaignSummaryService.pending).toHaveBeenCalledWith(false);
                                            expect(SelfieCampaignSummaryService.close).toHaveBeenCalled();
                                        });

                                        it('should not modify the status on the campaign bound in the UI', function() {
                                            expect(SelfieCampaignCtrl.campaign.status).toBe('paused');
                                        });

                                        it('should go to the dashboard', function() {
                                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                                        });

                                        it('should set the allowExit flag on the cState', function() {
                                            expect(cState.allowExit).toBe(true);
                                        });
                                    });

                                    describe('when update request fails', function() {
                                        beforeEach(function() {
                                            $rootScope.$apply(function() {
                                                updateRequestDeferred.reject({data:'Error!'});
                                            });
                                        });

                                        it('should close the summary', function() {
                                            expect(SelfieCampaignSummaryService.close).toHaveBeenCalled();
                                        });

                                        it('should set summary pending to false', function() {
                                            expect(SelfieCampaignSummaryService.pending).toHaveBeenCalledWith(false);
                                        });

                                        it('should show an error modal', function() {
                                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toEqual('There was a problem processing your request: Error!');
                                        });
                                    });
                                });
                            });

                            describe('when the campaign does not have a pending update request', function() {
                                var onAffirm, onCancel;

                                beforeEach(function() {
                                    SelfieCampaignCtrl.submit();

                                    $rootScope.$apply(function() {
                                        saveDeferred.resolve();
                                    });

                                    onAffirm = SelfieCampaignSummaryService.display.calls.mostRecent().args[0].onAffirm;
                                    onCancel = SelfieCampaignSummaryService.display.calls.mostRecent().args[0].onCancel;
                                });

                                it('should show the campaign summary', function() {
                                    expect(SelfieCampaignSummaryService.display).toHaveBeenCalled();
                                });

                                describe('onAffirm()', function() {
                                    beforeEach(function() {
                                        $rootScope.$apply(function() {
                                            onAffirm();
                                        });
                                    });

                                    it('should set summary save to pending', function() {
                                        expect(SelfieCampaignSummaryService.pending).toHaveBeenCalledWith(true);
                                    });

                                    it('should not save the campaign', function() {
                                        expect(cState.saveCampaign).not.toHaveBeenCalled();
                                    });

                                    describe('when the campaign does not have a pending update request', function() {
                                        it('should not pojoify the master campaign', function() {
                                            expect(campaign.pojoify).not.toHaveBeenCalled();
                                        });

                                        it('should create an update request without modifying the current status', function() {
                                            expect(cinema6.db.create).toHaveBeenCalledWith('updateRequest', {
                                                campaign: 'cam-123',
                                                data: cState.campaign
                                            });
                                        });

                                        it('should save the update request', function() {
                                            expect(updateRequest.save).toHaveBeenCalled();
                                        });

                                        describe('when the update request save succeeds', function() {
                                            it('should not modify the status on the campaign bound in the UI', function() {
                                                expect(SelfieCampaignCtrl.campaign.status).toBe('paused');

                                                $rootScope.$apply(function() {
                                                    updateRequestDeferred.resolve(updateRequest);
                                                });

                                                expect(SelfieCampaignCtrl.campaign.status).toBe('paused');
                                            });

                                            it('should go to the dashboard', function() {
                                                $rootScope.$apply(function() {
                                                    updateRequestDeferred.resolve(updateRequest);
                                                });

                                                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                                            });

                                            it('should set the allowExit flag on the cState', function() {
                                                $rootScope.$apply(function() {
                                                    updateRequestDeferred.resolve(updateRequest);
                                                });

                                                expect(cState.allowExit).toBe(true);
                                            });
                                        });

                                        describe('when update request fails', function() {
                                            beforeEach(function() {
                                                $rootScope.$apply(function() {
                                                    updateRequestDeferred.reject({data:'Error!'});
                                                });
                                            });

                                            it('should close the summary', function() {
                                                expect(SelfieCampaignSummaryService.close).toHaveBeenCalled();
                                            });

                                            it('should set summary pending to false', function() {
                                                expect(SelfieCampaignSummaryService.pending).toHaveBeenCalledWith(false);
                                            });

                                            it('should show an error modal', function() {
                                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toEqual('There was a problem processing your request: Error!');
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
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

            describe('copy()', function() {
                var newCampaign, newCampaignDeferred;

                beforeEach(function() {
                    newCampaignDeferred = $q.defer();

                    SelfieCampaignCtrl.user = user;
                    SelfieCampaignCtrl.advertiser = advertiser;

                    spyOn(c6State, 'goTo');
                    spyOn(CampaignService, 'create').and.callFake(function(_campaign) {
                        newCampaign = angular.copy(_campaign);
                        newCampaign.save = jasmine.createSpy('campaign.save()')
                            .and.returnValue(newCampaignDeferred.promise);
                        return newCampaign;
                    });
                    spyOn(ConfirmDialogService, 'display');

                    SelfieCampaignCtrl.copy();
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(SelfieCampaignCtrl.copy);
                });

                it('should set pendingCopy to true', function() {
                    expect(SelfieCampaignCtrl.pendingCopy).toBe(true);
                });

                it('should create a new campaign with the current campaign', function() {
                    expect(CampaignService.create).toHaveBeenCalledWith(SelfieCampaignCtrl.campaign, user, advertiser);
                });

                it('should save the new campaign', function() {
                    expect(newCampaign.save).toHaveBeenCalled();
                });

                describe('when the new campaign is saved', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            newCampaignDeferred.resolve(newCampaign);
                        });
                    });

                    it('should not show an error modal', function() {
                        expect(ConfirmDialogService.display).not.toHaveBeenCalled();
                    });

                    it('should go to EditCampaign state with the new campaign', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:EditCampaign', [newCampaign]);
                    });

                    it('should remove pendingCopy flag', function() {
                        expect(SelfieCampaignCtrl.pendingCopy).toBe(false);
                    });
                });

                describe('when the request fails', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            newCampaignDeferred.reject({data: 'Error!'});
                        });
                    });

                    it('should not go to EditCampaign state with the new campaign', function() {
                        expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:EditCampaign', [newCampaign]);
                    });

                    it('should show an error modal', function() {
                        expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toEqual('There was a problem processing your request: Error!');
                    });

                    it('should remove pendingCopy flag', function() {
                        expect(SelfieCampaignCtrl.pendingCopy).toBe(false);
                    });
                });
            });

            describe('delete()', function() {
                var onAffirm;

                beforeEach(function() {
                    spyOn(ConfirmDialogService, 'display');
                    spyOn(campaign, 'erase').and.returnValue($q.when(null));
                    spyOn(c6State, 'goTo');

                    SelfieCampaignCtrl.delete();

                    onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                });

                it('should show a confirmation dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                });

                describe('onAffirm()', function() {
                    it('should be wrapped in a c6AsyncQueue', function() {
                        expect(debouncedFns).toContain(onAffirm);
                    });

                    it('should erase the campaign and go to the dashboard', function() {
                        $rootScope.$apply(function() {
                            onAffirm();
                        });

                        expect(campaign.erase).toHaveBeenCalled();
                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard');
                    });

                    it('should show an error modal if erase fails', function() {
                        ConfirmDialogService.display.calls.reset();

                        campaign.erase.and.returnValue($q.reject({data:'Error!'}));

                        $rootScope.$apply(function() {
                            onAffirm();
                        });

                        expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toEqual('There was a problem processing your request: Error!');
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('campaign properties', function() {
                beforeEach(function() {
                    SelfieCampaignCtrl.isCreator = true;
                    spyOn(SelfieCampaignCtrl, 'autoSave');
                    spyOn($scope, '$broadcast');
                });

                describe('when campaign should auto save', function() {
                    it('pricing.budget changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.budget = 3000;
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('pricing.dailyLimit changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.dailyLimit = 50;
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('targeting.geo.states changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.geo.states = ['Arizona'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('targeting.geo.dmas changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.geo.dmas = ['Chicago'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('targeting.demographics.age changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.demographics.age = ['18-24'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('targeting.demographics.gender changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.demographics.gender = ['male'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('targeting.demographics.income changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.demographics.income = ['0-49000'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('targeting.interests changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.interests = ['Cars','Convertibles'];
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
                            it('should reload preview', function() {
                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });
                    });

                    describe('advertiserDisplayName changes', function() {
                        it('should trigger an autosave', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.campaign.advertiserDisplayName = 'New Advertiser';
                            });

                            expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                        });

                        describe('when the card has a service type and video id', function() {
                            it('should reload preview', function() {
                                SelfieCampaignCtrl.card.data.service = 'youtube';
                                SelfieCampaignCtrl.card.data.videoid = '123';

                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'New Advertiser';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });

                        describe('when the card has no service type and video id', function() {
                            it('should reload preview', function() {
                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'New Advertiser';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });
                    });
                });

                describe('when campaign should not auto save', function() {
                    beforeEach(function() {
                        SelfieCampaignCtrl.campaign.status = 'active';
                    });


                    it('pricing.budget changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.budget = 3000;
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('pricing.dailyLimit changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.pricing.dailyLimit = 50;
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('targeting.geo.states changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.geo.states = ['Arizona'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('targeting.geo.dmas changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.geo.dmas = ['Chicago'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('targeting.demographics.age changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.demographics.age = ['18-24'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('targeting.demographics.gender changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.demographics.gender = ['male'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('targeting.demographics.income changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.demographics.income = ['0-49000'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    it('targeting.interests changes should not trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.campaign.targeting.interests = ['Cars','Convertibles'];
                        });

                        expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                    });

                    describe('name changes', function() {
                        it('should not trigger an autosave', function() {
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
                            it('should reload preview', function() {
                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.name = 'Campaign Name!';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });
                    });

                    describe('advertiserDisplayName changes', function() {
                        it('should not trigger an autosave', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.campaign.advertiserDisplayName = 'Advertiser Name';
                            });

                            expect(SelfieCampaignCtrl.autoSave).not.toHaveBeenCalled();
                        });

                        describe('when the card has a service type and video id', function() {
                            it('should reload preview', function() {
                                SelfieCampaignCtrl.card.data.service = 'youtube';
                                SelfieCampaignCtrl.card.data.videoid = '123';

                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.advertiserDisplayName = 'Advertiser Name';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });

                        describe('when the card has no service type and video id', function() {
                            it('should reload preview', function() {
                                $scope.$apply(function() {
                                    SelfieCampaignCtrl.campaign.advertiserDisplayName = 'Advertiser Name';
                                });

                                expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
                            });
                        });
                    });
                });
            });

            describe('card properties', function() {
                beforeEach(function() {
                    SelfieCampaignCtrl.isCreator = true;
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

                        it(prop + ' changes should reload preview if card has no service and id', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card[prop] = 'something';
                            });

                            expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
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

                    it('links changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.links.Facebook = 'http://facebook.com';
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('shareLinks changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.shareLinks.facebook = 'http://facebook.com';
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('logo changes should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.collateral.logo = 'newlogo.jpg';
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

                        it(prop + ' changes should reload preview if card has no service and id', function() {
                            $scope.$apply(function() {
                                SelfieCampaignCtrl.card.params.action = {};
                                SelfieCampaignCtrl.card.params.action[prop] = 'something';
                            });

                            expect($scope.$broadcast).toHaveBeenCalledWith('loadPreview');
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

                    it('startDate should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.campaign.startDate = '2016-08-05T15:38:55.613Z';
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });

                    it('endDate should trigger an autosave', function() {
                        $scope.$apply(function() {
                            SelfieCampaignCtrl.card.campaign.endDate = '2016-08-05T15:38:55.613Z';
                        });

                        expect(SelfieCampaignCtrl.autoSave).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});