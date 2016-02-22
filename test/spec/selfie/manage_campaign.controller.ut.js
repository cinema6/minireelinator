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
            CampaignService,
            ConfirmDialogService,
            MiniReelService,
            SelfieManageCampaignCtrl;

        var cState,
            campaign,
            card,
            categories,
            paymentMethods,
            updateRequest,
            user,
            advertiser,
            interests;

        var debouncedFns;

        function compileCtrl(cState, model) {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieManageCampaignCtrl = $controller('SelfieManageCampaignController', {
                    $scope: $scope,
                    cState: cState
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
                CampaignService = $injector.get('CampaignService');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
                MiniReelService = $injector.get('MiniReelService');
            });

            spyOn(ConfirmDialogService, 'display');
            spyOn(ConfirmDialogService, 'close');
            spyOn(ConfirmDialogService, 'pending');

            c6State.get('Selfie').cModel = {
                entitlements: {
                    adminCampaigns: true
                }
            };

            card = deepExtend(MiniReelService.createCard('video'), {
                campaign: {
                    minViewTime: 3
                },
                sponsored: true,
                collateral: {
                },
                links: {},
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
                name: undefined,
                pricing: {},
                status: 'draft',
                appllication: 'selfie',
                advertiserDisplayName: 'My Company',
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
            paymentMethods = [];
            updateRequest = null;
            user = {
                id: 'u-123'
            };
            advertiser = {
                id: 'a-123'
            };
            interests = [
                {
                    id: 'cat-1'
                },
                {
                    id: 'cat-2'
                }
            ];

            cState = {
                cParent: {
                    cName: 'Selfie:All:CampaignDashboard'
                },
                campaign: campaign,
                card: card,
                interests: interests
            };

            compileCtrl(cState, {
                categories: categories,
                paymentMethods: paymentMethods,
                updateRequest: updateRequest
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
            });

            describe('canEdit', function() {
                it('should be true if status is pending, active or paused', function() {
                    expect(SelfieManageCampaignCtrl.canEdit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'pending';

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'active';

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'paused';

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'expired';

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(false);
                });

                it('should be true if status is active or paused and has update request that is not canceling', function() {
                    SelfieManageCampaignCtrl.updateRequest = {
                        data: {
                            status: 'canceled'
                        }
                    };
                    expect(SelfieManageCampaignCtrl.canEdit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'active';

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(false);

                    SelfieManageCampaignCtrl.updateRequest.data.status = 'paused';

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(true);
                });
            });

            describe('canCancel', function() {
                it('should be true if status is active or paused and has no update request', function() {
                    expect(SelfieManageCampaignCtrl.canCancel).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'pending';

                    expect(SelfieManageCampaignCtrl.canCancel).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'active';

                    expect(SelfieManageCampaignCtrl.canCancel).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'paused';

                    expect(SelfieManageCampaignCtrl.canCancel).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'expired';

                    expect(SelfieManageCampaignCtrl.canCancel).toBe(false);
                });

                it('should be true if status is active or paused and has update request that is not canceling', function() {
                    SelfieManageCampaignCtrl.updateRequest = {
                        data: {
                            status: 'canceled'
                        }
                    };
                    expect(SelfieManageCampaignCtrl.canCancel).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'active';

                    expect(SelfieManageCampaignCtrl.canCancel).toBe(false);

                    SelfieManageCampaignCtrl.updateRequest.data.status = 'paused';

                    expect(SelfieManageCampaignCtrl.canCancel).toBe(true);
                });
            });

            describe('canDelete', function() {
                it('should be true if status is active or paused', function() {
                    expect(SelfieManageCampaignCtrl.canDelete).toBe(false);

                    SelfieManageCampaignCtrl.campaign.status = 'pending';

                    expect(SelfieManageCampaignCtrl.canDelete).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'expired';

                    expect(SelfieManageCampaignCtrl.canDelete).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'canceled';

                    expect(SelfieManageCampaignCtrl.canDelete).toBe(true);

                    SelfieManageCampaignCtrl.campaign.status = 'active';

                    expect(SelfieManageCampaignCtrl.canDelete).toBe(false);
                });
            });
        });

        describe('methods', function() {
            describe('backToDashboard()', function() {
                beforeEach(function() {
                    spyOn(c6State, 'goTo');
                });

                describe('when parent dashboard state is Pending', function() {
                    it('should go to Selfie:Pending:CampaignDashboard', function() {
                        cState.cParent.cName = 'Selfie:Pending:CampaignDashboard';

                        SelfieManageCampaignCtrl.backToDashboard();

                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                    });
                });

                describe('when parent dashboard state is All', function() {
                    it('should go to Selfie:All:CampaignDashboard', function() {
                        cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                        SelfieManageCampaignCtrl.backToDashboard();

                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                    });
                });
            });

            describe('initWithModel(model)', function() {
                it('should set properties on the Ctrl', function() {
                    $scope.$apply(function() {
                        SelfieManageCampaignCtrl.card = null;
                        SelfieManageCampaignCtrl.campaign = null;
                        SelfieManageCampaignCtrl.categories = null;
                        SelfieManageCampaignCtrl.paymentMethods = null;
                        SelfieManageCampaignCtrl._proxyCampaign = null;

                        SelfieManageCampaignCtrl.initWithModel({categories: categories, paymentMethods: paymentMethods, updateRequest: updateRequest, advertiser: advertiser});
                    });

                    expect(SelfieManageCampaignCtrl.card).toEqual(card);
                    expect(SelfieManageCampaignCtrl.campaign).toEqual(campaign);
                    expect(SelfieManageCampaignCtrl.categories).toEqual(categories);
                    expect(SelfieManageCampaignCtrl.paymentMethods).toEqual(paymentMethods);
                    expect(SelfieManageCampaignCtrl.updateRequest).toEqual(updateRequest);
                    expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(campaign));
                });

                describe('when there is an updateRequest', function() {
                    var summary, updateCard;

                    beforeEach(function() {
                        summary = {};

                        updateCard = {
                            id: 'some-card'
                        };

                        updateRequest = {
                            data: {
                                cards: [updateCard]
                            }
                        };

                        spyOn(CampaignService, 'getSummary').and.returnValue(summary);

                        SelfieManageCampaignCtrl.initWithModel({updateRequest: updateRequest});
                    });

                    it('should use the card on it', function() {
                        expect(SelfieManageCampaignCtrl.card).toBe(updateCard);
                    });

                    it('should use it to fetch a summary', function() {
                        expect(CampaignService.getSummary).toHaveBeenCalledWith({
                            campaign: updateRequest.data,
                            interests: interests
                        });

                        expect(SelfieManageCampaignCtrl.summary).toBe(summary);
                    });
                });

                describe('when there is no updateRequest', function() {
                    var summary;

                    beforeEach(function() {
                        summary = {};

                        spyOn(CampaignService, 'getSummary').and.returnValue(summary);

                        SelfieManageCampaignCtrl.initWithModel({updateRequest: null});
                    });

                    it('should use the card on the campaign', function() {
                        SelfieManageCampaignCtrl.initWithModel({updateRequest: null});

                        expect(SelfieManageCampaignCtrl.card).toBe(card);
                    });

                    it('should use the campaign to fetch a summary', function() {
                        SelfieManageCampaignCtrl.initWithModel({updateRequest: null});

                        expect(CampaignService.getSummary).toHaveBeenCalledWith({
                            campaign: campaign,
                            interests: interests
                        });

                        expect(SelfieManageCampaignCtrl.summary).toBe(summary);
                    });
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
                                describe('when there is no existing update request', function() {
                                    var expectedData;

                                    beforeEach(function() {
                                        expectedData = SelfieManageCampaignCtrl.campaign.pojoify();
                                        expectedData.status = statusFor(action);

                                        onAffirm();
                                    });

                                    it('should be wrapped in a c6AsyncQueue', function() {
                                        expect(debouncedFns).toContain(onAffirm);
                                    });

                                    it('should set pending flag', function() {
                                        expect(ConfirmDialogService.pending).toHaveBeenCalledWith(true);
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
                                            updateRequest.id = 'cam-123:ur-1234';

                                            $rootScope.$apply(function() {
                                                updateRequestDeferred.resolve(updateRequest);
                                            });
                                        });

                                        it('should add the updateRequest id to the campaign', function() {
                                            expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe('ur-1234');
                                        });

                                        it('should add the updateRequest to the controller and state', function() {
                                            expect(SelfieManageCampaignCtrl.updateRequest).toEqual(updateRequest);
                                            expect(cState.updateRequest).toEqual(updateRequest);
                                        });

                                        it('should update proxy campaign', function() {
                                            expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                        });
                                    });

                                    describe('when the update request fails', function() {
                                        beforeEach(function() {
                                            ConfirmDialogService.display.calls.reset();

                                            $rootScope.$apply(function() {
                                                updateRequestDeferred.reject({data: 'Error!'});
                                            });
                                        });

                                        it('should close the dialog', function() {
                                            expect(ConfirmDialogService.close).toHaveBeenCalled()
                                            expect(ConfirmDialogService.pending).toHaveBeenCalledWith(false);
                                        });

                                        it('should open a new error dialog', function() {
                                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                                        });
                                    });
                                });

                                describe('when there is an existing update request', function() {
                                    beforeEach(function() {
                                        SelfieManageCampaignCtrl.updateRequest = {
                                            id: 'ur-123',
                                            data: {
                                                name: 'My Campaign',
                                                status: 'paused',
                                                cards: []
                                            },
                                            save: jasmine.createSpy('updateRequest.save()').and.returnValue(updateRequestDeferred.promise)
                                        };

                                        onAffirm();
                                    });

                                    it('should be wrapped in a c6AsyncQueue', function() {
                                        expect(debouncedFns).toContain(onAffirm);
                                    });

                                    it('should set pending flag', function() {
                                        expect(ConfirmDialogService.pending).toHaveBeenCalledWith(true);
                                    });

                                    it('should not create an update request', function() {
                                        expect(cinema6.db.create).not.toHaveBeenCalledWith();
                                    });

                                    it('should save the updateRequest', function() {
                                        expect(SelfieManageCampaignCtrl.updateRequest.save).toHaveBeenCalled();
                                    });

                                    describe('when updateRequest status is approved', function() {
                                        describe('when parent dashboard state is Pending', function() {
                                            describe('if action is cancel', function() {
                                                it('should go to Selfie:Pending:CampaignDashboard', function() {
                                                    cState.cParent.cName = 'Selfie:Pending:CampaignDashboard';

                                                    updateRequest.status = 'approved';

                                                    $rootScope.$apply(function() {
                                                        updateRequestDeferred.resolve(updateRequest);
                                                    });

                                                    if (action === 'cancel') {
                                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                                                    } else {
                                                        expect(c6State.goTo).not.toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                                                    }
                                                });
                                            });
                                        });

                                        describe('when parent dashboard state is All', function() {
                                            describe('if action is cancel', function() {
                                                it('should go to Selfie:All:CampaignDashboard', function() {
                                                    cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                                                    updateRequest.status = 'approved';

                                                    $rootScope.$apply(function() {
                                                        updateRequestDeferred.resolve(updateRequest);
                                                    });

                                                    if (action === 'cancel') {
                                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                                                    } else {
                                                        expect(c6State.goTo).not.toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                                                    }
                                                });
                                            });
                                        });

                                        describe('regardless of parent dashboard state', function() {
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
                                    });

                                    describe('when updateRequest status is not approved', function() {
                                        describe('when parent dashboard state is Pending', function() {
                                            describe('if action is cancel', function() {
                                                it('should go to Selfie:Pending:CampaignDashboard', function() {
                                                    cState.cParent.cName = 'Selfie:Pending:CampaignDashboard';

                                                    updateRequest.status = 'pending';
                                                    updateRequest.id = 'cam-123:ur-1234';

                                                    $rootScope.$apply(function() {
                                                        updateRequestDeferred.resolve(updateRequest);
                                                    });

                                                    if (action === 'cancel') {
                                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                                                    } else {
                                                        expect(c6State.goTo).not.toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                                                    }
                                                });
                                            });
                                        });

                                        describe('when parent dashboard state is All', function() {
                                            describe('if action is cancel', function() {
                                                it('should go to Selfie:All:CampaignDashboard', function() {
                                                    cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                                                    updateRequest.status = 'pending';
                                                    updateRequest.id = 'cam-123:ur-1234';

                                                    $rootScope.$apply(function() {
                                                        updateRequestDeferred.resolve(updateRequest);
                                                    });

                                                    if (action === 'cancel') {
                                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                                                    } else {
                                                        expect(c6State.goTo).not.toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                                                    }
                                                });
                                            });
                                        });

                                        describe('regardless of parent dashboard state', function() {
                                            beforeEach(function() {
                                                updateRequest.status = 'pending';
                                                updateRequest.id = 'cam-123:ur-1234';

                                                $rootScope.$apply(function() {
                                                    updateRequestDeferred.resolve(updateRequest);
                                                });
                                            });

                                            it('should add the updateRequest id to the campaign', function() {
                                                expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe('ur-1234');
                                            });

                                            it('should add the updateRequest to the controller and state', function() {
                                                expect(SelfieManageCampaignCtrl.updateRequest).toEqual(updateRequest);
                                                expect(cState.updateRequest).toEqual(updateRequest);
                                            });

                                            it('should update proxy campaign', function() {
                                                expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                            });
                                        });
                                    });

                                    describe('when the update request fails', function() {
                                        beforeEach(function() {
                                            ConfirmDialogService.display.calls.reset();

                                            $rootScope.$apply(function() {
                                                updateRequestDeferred.reject({data: 'Error!'});
                                            });
                                        });

                                        it('should close the dialog', function() {
                                            expect(ConfirmDialogService.close).toHaveBeenCalled()
                                            expect(ConfirmDialogService.pending).toHaveBeenCalledWith(false);
                                        });

                                        it('should open a new error dialog', function() {
                                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                                        });
                                    });
                                });
                            });
                        });
                    });

                    describe('delete', function() {
                        var eraseDeferred;

                        beforeEach(function() {
                            eraseDeferred = $q.defer();
                            spyOn(campaign, 'erase').and.returnValue(eraseDeferred.promise);
                            // spyOn(c6State, 'goTo');
                            SelfieManageCampaignCtrl.update('delete');

                            onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                            onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                        });

                        it('should show a confirmation dialog', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });

                        describe('onAffirm()', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    onAffirm();
                                });
                            });

                            it('should be wrapped in a c6AsyncQueue', function() {
                                expect(debouncedFns).toContain(onAffirm);
                            });

                            it('should set pending flag', function() {
                                expect(ConfirmDialogService.pending).toHaveBeenCalledWith(true);
                            });

                            it('should call erase()', function() {
                                expect(campaign.erase).toHaveBeenCalled();
                            });

                            describe('when erase request succeeds', function() {
                                describe('when parent dashboard state is Pending', function() {
                                    it('should not go to Selfie:Pending:CampaignDashboard', function() {
                                        cState.cParent.cName = 'Selfie:Pending:CampaignDashboard';

                                        $rootScope.$apply(function() {
                                            eraseDeferred.resolve(campaign);
                                        });

                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                                    });
                                });

                                describe('when parent dashboard state is All', function() {
                                    it('should go to Selfie:All:CampaignDashboard', function() {
                                        cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                                        $rootScope.$apply(function() {
                                            eraseDeferred.resolve(campaign);
                                        });

                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                                    });
                                });

                                describe('regardless of parent dashboard state', function() {
                                    beforeEach(function() {
                                        $rootScope.$apply(function() {
                                            eraseDeferred.resolve(campaign);
                                        });
                                    });

                                    it('should not create an update request', function() {
                                        expect(cinema6.db.create).not.toHaveBeenCalledWith();
                                    });

                                    it('should update proxy campaign', function() {
                                        expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                    });
                                });
                            });

                            describe('when erase request fails', function() {
                                describe('when parent dashboard state is Pending', function() {
                                    it('should not go to Selfie:Pending:CampaignDashboard', function() {
                                        ConfirmDialogService.display.calls.reset();

                                        cState.cParent.cName = 'Selfie:Pending:CampaignDashboard';

                                        $rootScope.$apply(function() {
                                            eraseDeferred.reject('Failed');
                                        });

                                        expect(c6State.goTo).not.toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                                    });
                                });

                                describe('when parent dashboard state is All', function() {
                                    it('should go to Selfie:All:CampaignDashboard', function() {
                                        ConfirmDialogService.display.calls.reset();

                                        cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                                        $rootScope.$apply(function() {
                                            eraseDeferred.reject('Failed');
                                        });

                                        expect(c6State.goTo).not.toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                                    });
                                });

                                describe('regardless of parent dashboard state', function() {
                                    beforeEach(function() {
                                        ConfirmDialogService.display.calls.reset();

                                        $rootScope.$apply(function() {
                                            eraseDeferred.reject('Failed');
                                        });
                                    });

                                    it('should not create an update request', function() {
                                        expect(cinema6.db.create).not.toHaveBeenCalledWith();
                                    });

                                    it('should not update proxy campaign', function() {
                                        expect(SelfieManageCampaignCtrl._proxyCampaign).not.toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                    });

                                    it('should show an error dialog', function() {
                                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            describe('updatePaymentMethod()', function() {
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
                    expect(debouncedFns).toContain(SelfieManageCampaignCtrl.updatePaymentMethod);
                });

                it('should do nothing if canSubmit is false', function() {
                    SelfieManageCampaignCtrl.updatePaymentMethod();

                    expect(cinema6.db.create).not.toHaveBeenCalled();
                });

                it('should create an update request', function() {
                    SelfieManageCampaignCtrl.campaign.paymentMethod = 'pay-8888';

                    SelfieManageCampaignCtrl.updatePaymentMethod();

                    $scope.$digest();

                    expect(cinema6.db.create).toHaveBeenCalledWith('updateRequest', {
                        data: {
                            paymentMethod: 'pay-8888'
                        },
                        campaign: 'cam-123'
                    });
                });
            });

            describe('copy()', function() {
                var newCampaign, newCampaignDeferred;

                beforeEach(function() {
                    newCampaignDeferred = $q.defer();

                    SelfieManageCampaignCtrl.user = user;
                    SelfieManageCampaignCtrl.advertiser = advertiser;

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

                it('should set pendingCopy flag', function() {
                    expect(SelfieManageCampaignCtrl.pendingCopy).toBe(true);
                });

                it('should create a new campaign with a pojoified campaign', function() {
                    expect(SelfieManageCampaignCtrl.campaign.pojoify).toHaveBeenCalled();
                    expect(CampaignService.create).toHaveBeenCalledWith(SelfieManageCampaignCtrl.campaign.pojoify(), user, advertiser);
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

                    it('should go to EditCampaign state with the new campaign', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:EditCampaign', [newCampaign]);
                    });

                    it('should remove pendingCopy flag', function() {
                        expect(SelfieManageCampaignCtrl.pendingCopy).toBe(false);
                    });
                });

                describe('when the request fails', function() {
                    beforeEach(function() {
                        ConfirmDialogService.display.calls.reset();

                        $rootScope.$apply(function() {
                            newCampaignDeferred.reject('Error!');
                        });
                    });

                    it('should not go to EditCampaign state with the new campaign', function() {
                        expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:EditCampaign', [newCampaign]);
                    });

                    it('should open an error dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    it('should remove pendingCopy flag', function() {
                        expect(SelfieManageCampaignCtrl.pendingCopy).toBe(false);
                    });
                });
            });

            describe('edit(campaign)', function() {
                beforeEach(function() {
                    spyOn(c6State, 'goTo');

                    SelfieManageCampaignCtrl.edit(SelfieManageCampaignCtrl.campaign);
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(SelfieManageCampaignCtrl.edit);
                });

                it('should go to EditCampaign with the campaign', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:EditCampaign', [SelfieManageCampaignCtrl.campaign]);
                });
            });
        });
    });
});
