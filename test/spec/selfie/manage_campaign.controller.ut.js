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
            $q,
            c6State,
            cinema6,
            MiniReelService,
            CampaignService,
            ConfirmDialogService,
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
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');
                CampaignService = $injector.get('CampaignService');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
            });

            spyOn(ConfirmDialogService, 'display');
            spyOn(ConfirmDialogService, 'close');

            c6State.get('Selfie').cModel = {
                entitlements: {
                    adminCampaigns: true
                }
            };

            campaign = cinema6.db.create('selfieCampaign', {
                name: null,
                categories: [],
                cards: [],
                pricing: {},
                geoTargeting: [],
                status: 'draft',
                application: 'selfie',
                paymentMethod: undefined
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
                it('should be false if campaign has not changed', function() {
                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    campaign.paymentMethod = 'pay-1234';
                    campaign.updateRequest = undefined;

                    compileCtrl(cState, {
                        categories: categories,
                        paymentMethods: paymentMethods
                    });

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.paymentMethod = 'pay-99999';

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(true);
                });

                it('should be false if campaign does not have paymentMethod', function() {
                    campaign.paymentMethod = 'pay-1234';
                    campaign.updateRequest = undefined;

                    compileCtrl(cState, {
                        categories: categories,
                        paymentMethods: paymentMethods
                    });

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.paymentMethod = '';

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.paymentMethod = 'pay-11111';

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(true);
                });

                it('should be false if campaign has an updateRequest', function() {
                    campaign.paymentMethod = 'pay-1234';
                    campaign.updateRequest = 'ur-1234';

                    compileCtrl(cState, {
                        categories: categories,
                        paymentMethods: paymentMethods
                    });

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.paymentMethod = 'pay-1111';

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.updateRequest = undefined;

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(true);
                });
            });

            describe('isLocked', function() {
                it('should be true if status is expired or canceled or has an updateRequest', function() {
                    SelfieManageCampaignCtrl.campaign.status = 'draft';

                    expect(SelfieManageCampaignCtrl.isLocked).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'expired';

                    expect(SelfieManageCampaignCtrl.isLocked).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'paused';

                    expect(SelfieManageCampaignCtrl.isLocked).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'canceled';

                    expect(SelfieManageCampaignCtrl.isLocked).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'active';

                    expect(SelfieManageCampaignCtrl.isLocked).toBe(false);

                    SelfieManageCampaignCtrl.campaign.updateRequest = 'ur-1234';

                    expect(SelfieManageCampaignCtrl.isLocked).toBe(true);

                    SelfieManageCampaignCtrl.campaign.updateRequest = undefined;

                    expect(SelfieManageCampaignCtrl.isLocked).toBe(false);
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
                        SelfieManageCampaignCtrl._proxyCampaign = null;

                        SelfieManageCampaignCtrl.initWithModel({categories: categories, paymentMethods: paymentMethods});
                    });

                    expect(SelfieManageCampaignCtrl.card).toEqual(card);
                    expect(SelfieManageCampaignCtrl.campaign).toEqual(campaign);
                    expect(SelfieManageCampaignCtrl.categories).toEqual(categories);
                    expect(SelfieManageCampaignCtrl.paymentMethods).toEqual(paymentMethods);
                    expect(SelfieManageCampaignCtrl.showAdminTab).toBe(true);
                    expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(campaign));
                });
            });

            describe('safeUpdate()', function() {
                var updateRequest, updateRequestDeferred;

                beforeEach(function() {
                    updateRequest = {};
                    updateRequestDeferred = $q.defer();

                    campaign.id = 'cam-123';

                    compileCtrl(cState, {
                        categories: categories,
                        paymentMethods: paymentMethods
                    });

                    spyOn(cinema6.db, 'create').and.callFake(function(type, obj) {
                        updateRequest.data = obj.data;
                        updateRequest.campaign = obj.campaign;
                        updateRequest.save = jasmine.createSpy('update.save()').and.returnValue(updateRequestDeferred.promise);
                        return updateRequest;
                    });
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(SelfieManageCampaignCtrl.safeUpdate);
                });

                it('should do nothing if canSubmit is false', function() {
                    SelfieManageCampaignCtrl.safeUpdate();

                    expect(cinema6.db.create).not.toHaveBeenCalled();
                });

                it('should create an update request', function() {
                    SelfieManageCampaignCtrl.campaign.paymentMethod = 'pay-8888';

                    SelfieManageCampaignCtrl.safeUpdate();

                    expect(cinema6.db.create).toHaveBeenCalledWith('updateRequest', {
                        data: SelfieManageCampaignCtrl.campaign.pojoify(),
                        campaign: 'cam-123'
                    });
                });
            });

            describe('update(action)', function() {
                describe('action:', function() {
                    var onAffirm, onCancel, updateRequest, updateRequestDeferred;

                    function statusFor(action) {
                        switch (action) {
                        case 'pause':
                            return 'paused';
                        case 'resume':
                            return 'active';
                        case 'cancel':
                            return 'canceled';
                        }
                    }

                    beforeEach(function() {
                        updateRequest = {};
                        updateRequestDeferred = $q.defer();

                        SelfieManageCampaignCtrl.campaign.id = 'cam-123';

                        spyOn(c6State, 'goTo');
                        spyOn(SelfieManageCampaignCtrl.campaign, 'pojoify').and.callThrough();
                        spyOn(cinema6.db, 'create').and.callFake(function(type, obj) {
                            updateRequest.data = obj.data;
                            updateRequest.campaign = obj.campaign;
                            updateRequest.save = jasmine.createSpy('update.save()').and.returnValue(updateRequestDeferred.promise);
                            return updateRequest;
                        });
                    });

                    ['pause','resume','cancel'].forEach(function(action) {
                        describe(action, function() {
                            beforeEach(function() {
                                SelfieManageCampaignCtrl.update(action);

                                onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                                onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                            });

                            it('should show a confirmation dialog', function() {
                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                            });

                            describe('onAffirm()', function() {
                                var expectedData;

                                beforeEach(function() {
                                    expectedData = SelfieManageCampaignCtrl.campaign.pojoify();
                                    expectedData.status = statusFor(action);

                                    onAffirm();
                                });

                                it('should be wrapped in a c6AsyncQueue', function() {
                                    expect(debouncedFns).toContain(onAffirm);
                                });

                                it('should create an update request with a pojoified campaign', function() {
                                    expect(cinema6.db.create).toHaveBeenCalledWith('updateRequest', {
                                        data: expectedData,
                                        campaign: 'cam-123'
                                    });
                                });

                                it('should save the updateRequest', function() {
                                    expect(updateRequest.save).toHaveBeenCalled();
                                });

                                describe('when updateRequest status is approved', function() {
                                    beforeEach(function() {
                                        updateRequest.status = 'approved';

                                        $rootScope.$apply(function() {
                                            updateRequestDeferred.resolve(updateRequest);
                                        });
                                    });

                                    it('should not add the updateRequest id to the campaign', function() {
                                        expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe(undefined);
                                    });

                                    it('should update proxy campaign', function() {
                                        expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                    });
                                });

                                describe('when updateRequest status is not approved', function() {
                                    beforeEach(function() {
                                        updateRequest.status = 'pending';
                                        updateRequest.id = 'ur-1234';

                                        $rootScope.$apply(function() {
                                            updateRequestDeferred.resolve(updateRequest);
                                        });
                                    });

                                    it('should add the updateRequest id to the campaign', function() {
                                        expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe('ur-1234');
                                    });

                                    it('should update proxy campaign', function() {
                                        expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                    });
                                });
                            });
                        });
                    });
                });
            });

            describe('copy()', function() {
                var newCampaign, newCampaignDeferred;

                beforeEach(function() {
                    newCampaignDeferred = $q.defer();

                    spyOn(c6State, 'goTo');
                    spyOn(campaign, 'pojoify').and.callThrough();
                    spyOn(CampaignService, 'create').and.callFake(function(_campaign) {
                        newCampaign = angular.copy(_campaign);
                        newCampaign.save = jasmine.createSpy('campaign.save()')
                            .and.returnValue(newCampaignDeferred.promise);
                        return newCampaign;
                    });

                    SelfieManageCampaignCtrl.copy();
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(SelfieManageCampaignCtrl.copy);
                });

                it('should create a new campaign with a pojoified campaign', function() {
                    expect(SelfieManageCampaignCtrl.campaign.pojoify).toHaveBeenCalled();
                    expect(CampaignService.create).toHaveBeenCalledWith(SelfieManageCampaignCtrl.campaign.pojoify());
                });

                it('should save the new campaign', function() {
                    expect(newCampaign.save).toHaveBeenCalled();
                });

                describe('when the new campaign is saved', function() {
                    it('should go to EditCampaign state with the new campaign', function() {
                        $rootScope.$apply(function() {
                            newCampaignDeferred.resolve(newCampaign);
                        });

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:EditCampaign', [newCampaign]);
                    });
                });
            });

            describe('edit(campaign)', function() {
                var onAffirm, onCancel;

                beforeEach(function() {
                    spyOn(c6State, 'goTo');

                    SelfieManageCampaignCtrl.edit(SelfieManageCampaignCtrl.campaign);

                    onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                    onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                });

                it('should show a confirmation modal', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                });

                describe('onAffirm()', function() {
                    it('should be wrapped in a c6AsyncQueue', function() {
                        expect(debouncedFns).toContain(onAffirm);
                    });

                    it('should close the dialog', function() {
                        onAffirm();

                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });

                    it('should go to EditCampaign with the campaign', function() {
                        onAffirm();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:EditCampaign', [SelfieManageCampaignCtrl.campaign]);
                    });
                });

                describe('onCancel()', function() {
                    it('should close the dialog and not go anywhere', function() {
                        onCancel();

                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                        expect(c6State.goTo).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
