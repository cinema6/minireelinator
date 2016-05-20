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
            CampaignFundingService,
            SelfieManageCampaignCtrl;

        var cState,
            campaign,
            card,
            categories,
            updateRequest,
            user,
            advertiser,
            interests,
            stats;

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
                CampaignFundingService = $injector.get('CampaignFundingService');
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
                application: 'selfie',
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
            stats = [];

            cState = {
                cParent: {
                    cName: 'Selfie:All:CampaignDashboard'
                },
                campaign: campaign,
                card: card,
                interests: interests,
                schema: {}
            };

            compileCtrl(cState, {
                categories: categories,
                updateRequest: updateRequest,
                stats: stats
            });
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            $q = null;
            c6State = null;
            cinema6 = null;
            CampaignService = null;
            ConfirmDialogService = null;
            MiniReelService = null;
            CampaignFundingService = null;
            SelfieManageCampaignCtrl = null;
            cState = null;
            campaign = null;
            card = null;
            categories = null;
            updateRequest = null;
            user = null;
            advertiser = null;
            interests = null;
            debouncedFns = null;
            stats = null;
        });

        it('should exist', function() {
            expect(SelfieManageCampaignCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('canSubmit', function() {
                it('should be false if campaign has not changed', function() {
                    compileCtrl(cState, {
                        categories: categories,
                        stats: stats
                    });

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(false);

                    SelfieManageCampaignCtrl.campaign.pricing.budget = 100;

                    expect(SelfieManageCampaignCtrl.canSubmit).toBe(true);
                });
            });

            describe('canEdit', function() {
                it('should be true if there is no update request', function() {
                    SelfieManageCampaignCtrl.updateRequest = undefined;

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(true);
                });

                it('should be true if there is an update request with a status that is not canceled', function() {
                    SelfieManageCampaignCtrl.updateRequest = {
                        data: {
                            status: 'active'
                        }
                    };

                    expect(SelfieManageCampaignCtrl.canEdit).toBe(true);
                });

                it('should be false there is an update request with a status of canceled', function() {
                    SelfieManageCampaignCtrl.updateRequest = {
                        data: {
                            status: 'canceled'
                        }
                    };
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

            describe('validRenewal', function() {
                describe('when there is no renewalCampaign object', function() {
                    it('should be false', function() {
                        SelfieManageCampaignCtrl.renewalCampaign = null;

                        expect(SelfieManageCampaignCtrl.validRenewal).toBe(false);
                    });
                });

                describe('when there is a renewalCampaign object', function() {
                    describe('when the status is outOfBudget', function() {
                        it('should be false if the new budget is not greater than current budget', function() {
                            campaign.pricing.budget = 100;
                            SelfieManageCampaignCtrl.campaign = campaign.pojoify();

                            campaign.status = 'outOfBudget';
                            SelfieManageCampaignCtrl.renewalCampaign = campaign.pojoify();

                            SelfieManageCampaignCtrl.validation = {
                                budget: true,
                                dailyLimit: true,
                                startDate: true,
                                endDate: true
                            };

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(false);

                            SelfieManageCampaignCtrl.renewalCampaign.pricing.budget = 110;

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(true);
                        });
                    });
                    describe('when the status is not outOfBudget', function() {
                        it('should rely on the validation object', function() {
                            campaign.status = 'active';
                            SelfieManageCampaignCtrl.renewalCampaign = campaign.pojoify();

                            SelfieManageCampaignCtrl.validation = {
                                budget: true,
                                dailyLimit: true,
                                startDate: true,
                                endDate: true
                            };

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(true);

                            SelfieManageCampaignCtrl.validation.budget = false;

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(false);

                            SelfieManageCampaignCtrl.validation.budget = true;
                            SelfieManageCampaignCtrl.validation.dailyLimit = false;

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(false);

                            SelfieManageCampaignCtrl.validation.dailyLimit = true;
                            SelfieManageCampaignCtrl.validation.startDate = false;

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(false);

                            SelfieManageCampaignCtrl.validation.startDate = true;
                            SelfieManageCampaignCtrl.validation.endDate = false;

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(false);

                            SelfieManageCampaignCtrl.validation.endDate = true;

                            expect(SelfieManageCampaignCtrl.validRenewal).toBe(true);
                        });
                    });
                });
            });

            describe('renewalText', function() {
                describe('when campaign status is pending, active or paused', function() {
                    it('should be "Extend"', function() {
                        SelfieManageCampaignCtrl.campaign = campaign;

                        campaign.status = 'pending';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Extend');

                        campaign.status = 'active';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Extend');

                        campaign.status = 'paused';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Extend');

                        campaign.status = 'expired';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Restart');
                    });
                });

                describe('when campaign status is expired, canceled or outOfBudget', function() {
                    it('should be "Restart"', function() {
                        SelfieManageCampaignCtrl.campaign = campaign;

                        campaign.status = 'expired';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Restart');

                        campaign.status = 'canceled';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Restart');

                        campaign.status = 'outOfBudget';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Restart');

                        campaign.status = 'pending';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Extend');
                    });
                });

                describe('when campaign status is anything else', function() {
                    it('should be "Extend"', function() {
                        SelfieManageCampaignCtrl.campaign = campaign;

                        campaign.status = 'draft';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Extend');

                        campaign.status = 'something';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Extend');

                        campaign.status = 'outOfBudget';

                        expect(SelfieManageCampaignCtrl.renewalText).toBe('Restart');
                    });
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

            describe('setSummary()', function() {
                var summary;

                beforeEach(function() {
                    summary = {};

                    SelfieManageCampaignCtrl.campaign = campaign;

                    spyOn(CampaignService, 'getSummary').and.returnValue(summary);
                });

                describe('when there is an updateRequest', function() {
                    it('should use it to fetch a summary', function() {
                        updateRequest = { data: {} };

                        SelfieManageCampaignCtrl.updateRequest = updateRequest;

                        SelfieManageCampaignCtrl.setSummary();

                        expect(CampaignService.getSummary).toHaveBeenCalledWith({
                            campaign: SelfieManageCampaignCtrl.updateRequest.data,
                            interests: cState.interests
                        });

                        expect(SelfieManageCampaignCtrl.summary).toBe(summary);
                    });
                });

                describe('when there is no updateRequest', function() {
                    it('should use the campaign to fetch a summary', function() {
                        SelfieManageCampaignCtrl.updateRequest = null;

                        SelfieManageCampaignCtrl.setSummary();

                        expect(CampaignService.getSummary).toHaveBeenCalledWith({
                            campaign: SelfieManageCampaignCtrl.campaign,
                            interests: cState.interests
                        });

                        expect(SelfieManageCampaignCtrl.summary).toBe(summary);
                    });
                });
            });

            describe('initWithModel(model)', function() {
                it('should set properties on the Ctrl', function() {
                    var statsObject = {
                        summary: {
                            totalSpend: 100
                        }
                    };

                    stats.push(statsObject);

                    spyOn(SelfieManageCampaignCtrl, 'setSummary');

                    $scope.$apply(function() {
                        SelfieManageCampaignCtrl.card = null;
                        SelfieManageCampaignCtrl.campaign = null;
                        SelfieManageCampaignCtrl.categories = null;
                        SelfieManageCampaignCtrl._proxyCampaign = null;

                        SelfieManageCampaignCtrl.initWithModel({categories: categories, updateRequest: updateRequest, advertiser: advertiser, stats: stats});
                    });

                    expect(SelfieManageCampaignCtrl.card).toEqual(card);
                    expect(SelfieManageCampaignCtrl.campaign).toEqual(campaign);
                    expect(SelfieManageCampaignCtrl.categories).toEqual(categories);
                    expect(SelfieManageCampaignCtrl.updateRequest).toEqual(updateRequest);
                    expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(campaign));
                    expect(SelfieManageCampaignCtrl.interests).toBe(cState.interests);
                    expect(SelfieManageCampaignCtrl.schema).toBe(cState.schema);
                    expect(SelfieManageCampaignCtrl.stats).toBe(statsObject);
                    expect(SelfieManageCampaignCtrl.setSummary).toHaveBeenCalled();
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

                        SelfieManageCampaignCtrl.initWithModel({updateRequest: updateRequest, stats: stats});
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

                        SelfieManageCampaignCtrl.initWithModel({updateRequest: null, stats: stats});
                    });

                    it('should use the card on the campaign', function() {
                        SelfieManageCampaignCtrl.initWithModel({updateRequest: null, stats: stats});

                        expect(SelfieManageCampaignCtrl.card).toBe(card);
                    });

                    it('should use the campaign to fetch a summary', function() {
                        SelfieManageCampaignCtrl.initWithModel({updateRequest: null, stats: stats});

                        expect(CampaignService.getSummary).toHaveBeenCalledWith({
                            campaign: campaign,
                            interests: interests
                        });

                        expect(SelfieManageCampaignCtrl.summary).toBe(summary);
                    });
                });
            });

            describe('initRenew()', function() {
                describe('when there is an update request', function() {
                    beforeEach(function() {
                        updateRequest = {
                            data: {
                                cards: [
                                    {
                                        campaign: {
                                            startDate: '2015-03-26T00:00:00.000Z',
                                            endDate: '2015-05-26T00:00:00.000Z'
                                        }
                                    }
                                ],
                                statusHistory: [
                                    {
                                        status: 'outOfBudget',
                                        date: '2015-06-26T00:00:00.000Z'
                                    },
                                    {
                                        status: 'expired',
                                        date: '2015-05-26T00:00:00.000Z'
                                    },
                                    {
                                        status: 'active',
                                        date: '2015-06-26T00:00:00.000Z'
                                    }
                                ]
                            }
                        };
                        updateRequest.pojoify = jasmine.createSpy('pojoify()').and.returnValue(updateRequest);

                        spyOn(campaign, 'pojoify');

                        SelfieManageCampaignCtrl.updateRequest = updateRequest;
                        SelfieManageCampaignCtrl.campaign = campaign;

                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });
                    });

                    it('should be wrapped in a c6AsyncQueue', function() {
                        expect(debouncedFns).toContain(SelfieManageCampaignCtrl.initRenew);
                    });

                    it('should set renewalCampaign to be the data from a pojoified update request', function() {
                        expect(SelfieManageCampaignCtrl.renewalCampaign).toEqual(updateRequest.pojoify().data);
                    });

                    it('should not pojoify the actual campaign', function() {
                        expect(campaign.pojoify).not.toHaveBeenCalled();
                    });

                    it('should set the expiration date from the status history', function() {
                        updateRequest.data.status = 'outOfBudget';
                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });

                        expect(SelfieManageCampaignCtrl.expirationDate).toEqual('2015-06-26T00:00:00.000Z');

                        updateRequest.data.status = 'expired';
                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });

                        expect(SelfieManageCampaignCtrl.expirationDate).toEqual('2015-05-26T00:00:00.000Z');

                        updateRequest.data.status = 'paused';
                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });

                        expect(SelfieManageCampaignCtrl.expirationDate).toEqual(undefined);
                    });

                    it('should set a validation object', function() {
                        expect(SelfieManageCampaignCtrl.validation).toEqual({
                            budget: true,
                            startDate: true,
                            endDate: true,
                            show: false
                        });
                    });

                    it('should set modal rending flags to true', function() {
                        expect(SelfieManageCampaignCtrl.renderModal).toBe(true);
                        expect(SelfieManageCampaignCtrl.showModal).toBe(true);
                    });

                    describe('when status is "expired"', function() {
                        it('should remove start and end dates', function() {
                            updateRequest.data.status = 'expired';
                            SelfieManageCampaignCtrl.initRenew();

                            expect(SelfieManageCampaignCtrl.renewalCampaign.cards[0].campaign.startDate).toBe(undefined);
                            expect(SelfieManageCampaignCtrl.renewalCampaign.cards[0].campaign.endDate).toBe(undefined);
                        });
                    });
                });

                describe('when there is no update request', function() {
                    beforeEach(function() {
                        campaign.cards[0].campaign = {
                            startDate: '2015-03-26T00:00:00.000Z',
                            endDate: '2015-05-26T00:00:00.000Z'
                        };
                        campaign.statusHistory = [
                            {
                                status: 'outOfBudget',
                                date: '2015-06-26T00:00:00.000Z'
                            },
                            {
                                status: 'expired',
                                date: '2015-05-26T00:00:00.000Z'
                            },
                            {
                                status: 'active',
                                date: '2015-06-26T00:00:00.000Z'
                            }
                        ];

                        spyOn(campaign, 'pojoify').and.returnValue(campaign);

                        SelfieManageCampaignCtrl.updateRequest = null;
                        SelfieManageCampaignCtrl.campaign = campaign;

                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });
                    });

                    it('should be wrapped in a c6AsyncQueue', function() {
                        expect(debouncedFns).toContain(SelfieManageCampaignCtrl.initRenew);
                    });

                    it('should set renewalCampaign to be the data from a pojoified update request', function() {
                        expect(SelfieManageCampaignCtrl.renewalCampaign).toEqual(campaign.pojoify());
                    });

                    it('should set the expiration date from the status history', function() {
                        campaign.status = 'outOfBudget';
                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });

                        expect(SelfieManageCampaignCtrl.expirationDate).toEqual('2015-06-26T00:00:00.000Z');

                        campaign.status = 'expired';
                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });

                        expect(SelfieManageCampaignCtrl.expirationDate).toEqual('2015-05-26T00:00:00.000Z');

                        campaign.status = 'paused';
                        $scope.$apply(function() {
                            SelfieManageCampaignCtrl.initRenew();
                        });

                        expect(SelfieManageCampaignCtrl.expirationDate).toEqual(undefined);
                    });

                    it('should set a validation object', function() {
                        expect(SelfieManageCampaignCtrl.validation).toEqual({
                            budget: true,
                            startDate: true,
                            endDate: true,
                            show: false
                        });
                    });

                    it('should set modal rending flags to true', function() {
                        expect(SelfieManageCampaignCtrl.renderModal).toBe(true);
                        expect(SelfieManageCampaignCtrl.showModal).toBe(true);
                    });

                    describe('when status is "expired"', function() {
                        it('should remove start and end dates', function() {
                            campaign.status = 'expired';
                            SelfieManageCampaignCtrl.initRenew();

                            expect(SelfieManageCampaignCtrl.renewalCampaign.cards[0].campaign.startDate).toBe(undefined);
                            expect(SelfieManageCampaignCtrl.renewalCampaign.cards[0].campaign.endDate).toBe(undefined);
                        });
                    });
                });
            });

            describe('destroyRenewModal()', function() {
                it('should set the render modal flags to false and null out existing renewalCampaign', function() {
                    SelfieManageCampaignCtrl.renewalCampaign = campaign.pojoify();
                    SelfieManageCampaignCtrl.renderModal = true;
                    SelfieManageCampaignCtrl.showModal = true;

                    SelfieManageCampaignCtrl.destroyRenewModal();

                    expect(SelfieManageCampaignCtrl.showModal).toBe(false);
                    expect(SelfieManageCampaignCtrl.renderModal).toBe(false);
                    expect(SelfieManageCampaignCtrl.renewalCampaign).toBe(null);
                });
            });

            describe('confirmRenewal()', function() {
                beforeEach(function() {
                    SelfieManageCampaignCtrl.campaign.id = 'cam-123';
                    spyOn(SelfieManageCampaignCtrl.campaign, 'pojoify').and.callThrough();

                    spyOn(CampaignFundingService, 'fund');
                    spyOn(SelfieManageCampaignCtrl, 'setSummary');
                    spyOn(SelfieManageCampaignCtrl, 'destroyRenewModal');
                });

                it('should be wrapped in a c6AsyncQueue', function() {
                    expect(debouncedFns).toContain(SelfieManageCampaignCtrl.confirmRenewal);
                });

                describe('when there is an updateRequest', function() {
                    var updateRequestSaveDeferred;

                    beforeEach(function() {
                        updateRequestSaveDeferred = $q.defer();

                        updateRequest = {
                            id: 'cam-123:ur-1234',
                            data: {},
                            save: jasmine.createSpy('save()').and.returnValue(updateRequestSaveDeferred.promise)
                        }

                        SelfieManageCampaignCtrl.updateRequest = updateRequest;
                        SelfieManageCampaignCtrl.renewalCampaign = copy(updateRequest.data);

                        SelfieManageCampaignCtrl.confirmRenewal();
                    });

                    it('should set showModal flag to false', function() {
                        expect(SelfieManageCampaignCtrl.showModal).toBe(false);
                    });

                    it('should call CampaignFundingService.fund() with configuration', function() {
                        expect(CampaignFundingService.fund).toHaveBeenCalledWith({
                            onClose: jasmine.any(Function),
                            onCancel: jasmine.any(Function),
                            onSuccess: jasmine.any(Function),
                            originalCampaign: SelfieManageCampaignCtrl.campaign,
                            updateRequest: SelfieManageCampaignCtrl.updateRequest,
                            campaign: SelfieManageCampaignCtrl.renewalCampaign,
                            interests: SelfieManageCampaignCtrl.interests,
                            schema: SelfieManageCampaignCtrl.schema,
                            depositCancelButtonText: 'Back'
                        });
                    });

                    describe('funding service callbacks', function() {
                        var onClose, onCancel, onSuccess;

                        beforeEach(function() {
                            onClose = CampaignFundingService.fund.calls.mostRecent().args[0].onClose;
                            onCancel = CampaignFundingService.fund.calls.mostRecent().args[0].onCancel;
                            onSuccess = CampaignFundingService.fund.calls.mostRecent().args[0].onSuccess;
                        });

                        describe('onClose()', function() {
                            it('should destroy the modal', function() {
                                onClose();
                                expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                            });
                        });

                        describe('onCancel()', function() {
                            it('should show the modal again', function() {
                                onCancel();
                                expect(SelfieManageCampaignCtrl.showModal).toBe(true);
                            });
                        });

                        describe('onSuccess()', function() {
                            ['pending','active','paused','outOfBudget','expired','canceled'].forEach(function(status) {
                                describe('when the campaign status is ' + status, function() {
                                    beforeEach(function() {
                                        spyOn(cinema6.db, 'create');

                                        SelfieManageCampaignCtrl.renewalCampaign.status = status;

                                        campaign.pojoify.calls.reset();

                                        onSuccess();
                                    });

                                    it('should set the status to pending if the status is expired, outOfBudget or canceled', function() {
                                        if ((/expired|outOfBudget|canceled/).test(status)) {
                                            expect(SelfieManageCampaignCtrl.renewalCampaign.status).toBe('pending');
                                        }
                                    });

                                    it('should put the renewalCampaign on the updateRequest and save', function() {
                                        expect(SelfieManageCampaignCtrl.updateRequest.data).toBe(SelfieManageCampaignCtrl.renewalCampaign);
                                        expect(SelfieManageCampaignCtrl.updateRequest.save).toHaveBeenCalled();
                                        expect(cinema6.db.create).not.toHaveBeenCalled();
                                        expect(SelfieManageCampaignCtrl.campaign.pojoify).not.toHaveBeenCalled();
                                    });

                                    describe('when the update request saves', function() {
                                        describe('when updateRequest status is not approved', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    updateRequestSaveDeferred.resolve(SelfieManageCampaignCtrl.updateRequest);
                                                });
                                            });

                                            it('should put the id on the campaign', function() {
                                                expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe('ur-1234');
                                            });

                                            it('should put the updateRequest on the Ctrl and cState', function() {
                                                expect(cState.updateRequest).toBe(SelfieManageCampaignCtrl.updateRequest);
                                            });

                                            it('should set the campaign status to "pending" if the update request data has "pending" status', function() {
                                                if ((/expired|outOfBudget|canceled/).test(status)) {
                                                    expect(SelfieManageCampaignCtrl.campaign.status).toBe('pending');
                                                }
                                            });

                                            it('should update the _proxyCampaign', function() {
                                                expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                            });

                                            it('should reset the summary and destroy the modal', function() {
                                                expect(SelfieManageCampaignCtrl.setSummary).toHaveBeenCalled();
                                                expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                                            });
                                        });

                                        describe('when the update request status is approved', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    SelfieManageCampaignCtrl.updateRequest.status = 'approved';
                                                    updateRequestSaveDeferred.resolve(SelfieManageCampaignCtrl.updateRequest);
                                                });
                                            });

                                            it('should put not the id on the campaign', function() {
                                                expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe(undefined);
                                            });

                                            it('should put the updateRequest on the Ctrl and cState', function() {
                                                expect(SelfieManageCampaignCtrl.updateRequest).toBeDefined();
                                                expect(cState.updateRequest).toBeFalsy();
                                            });

                                            it('should set the campaign status to "pending" if the update request data has "pending" status', function() {
                                                expect(SelfieManageCampaignCtrl.campaign.status).toBe('draft');
                                            });

                                            it('should reset the summary and destroy the modal', function() {
                                                expect(SelfieManageCampaignCtrl.setSummary).toHaveBeenCalled();
                                                expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                                            });
                                        });
                                    });

                                    describe('when the update request fails', function() {
                                        it('should display an error modal', function() {
                                            $scope.$apply(function() {
                                                updateRequestSaveDeferred.reject('BAD');
                                            });

                                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                                        });

                                        it('should reset the summary and destroy the modal', function() {
                                            $scope.$apply(function() {
                                                updateRequestSaveDeferred.reject('BAD');
                                            });

                                            expect(SelfieManageCampaignCtrl.setSummary).not.toHaveBeenCalled();
                                            expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

                describe('when there is not an updateRequest', function() {
                    beforeEach(function() {
                        SelfieManageCampaignCtrl.updateRequest = null;
                        SelfieManageCampaignCtrl.renewalCampaign = campaign.pojoify();
                        campaign.pojoify.calls.reset();

                        SelfieManageCampaignCtrl.confirmRenewal();
                    });

                    it('should set showModal flag to false', function() {
                        expect(SelfieManageCampaignCtrl.showModal).toBe(false);
                    });

                    it('should call CampaignFundingService.fund() with configuration', function() {
                        expect(CampaignFundingService.fund).toHaveBeenCalledWith({
                            onClose: jasmine.any(Function),
                            onCancel: jasmine.any(Function),
                            onSuccess: jasmine.any(Function),
                            originalCampaign: SelfieManageCampaignCtrl.campaign,
                            updateRequest: null,
                            campaign: SelfieManageCampaignCtrl.renewalCampaign,
                            interests: SelfieManageCampaignCtrl.interests,
                            schema: SelfieManageCampaignCtrl.schema,
                            depositCancelButtonText: 'Back'
                        });
                    });

                    describe('funding service callbacks', function() {
                        var onClose, onCancel, onSuccess;

                        beforeEach(function() {
                            onClose = CampaignFundingService.fund.calls.mostRecent().args[0].onClose;
                            onCancel = CampaignFundingService.fund.calls.mostRecent().args[0].onCancel;
                            onSuccess = CampaignFundingService.fund.calls.mostRecent().args[0].onSuccess;
                        });

                        describe('onClose()', function() {
                            it('should destroy the modal', function() {
                                onClose();
                                expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                            });
                        });

                        describe('onCancel()', function() {
                            it('should show the modal again', function() {
                                onCancel();
                                expect(SelfieManageCampaignCtrl.showModal).toBe(true);
                            });
                        });

                        describe('onSuccess()', function() {
                            var updateRequestDeferred;

                            beforeEach(function() {
                                updateRequest = {};
                                updateRequestDeferred = $q.defer();

                                spyOn(cinema6.db, 'create').and.callFake(function(type, obj) {
                                    updateRequest.status = 'pending';
                                    updateRequest.id = 'cam-123:ur-1234';
                                    updateRequest.data = obj.data;
                                    updateRequest.campaign = obj.campaign;
                                    updateRequest.save = jasmine.createSpy('update.save()').and.returnValue(updateRequestDeferred.promise);
                                    return updateRequest;
                                });
                            });

                            ['pending','active','paused','outOfBudget','expired','canceled'].forEach(function(status) {
                                describe('when the campaign status is ' + status, function() {
                                    beforeEach(function() {
                                        SelfieManageCampaignCtrl.renewalCampaign.status = status;


                                        onSuccess();
                                    });

                                    it('should set the status to pending if the status is expired, outOfBudget or canceled', function() {
                                        if ((/expired|outOfBudget|canceled/).test(status)) {
                                            expect(SelfieManageCampaignCtrl.renewalCampaign.status).toBe('pending');
                                        }
                                    });

                                    it('should create an update request with the renewalCampaign data and save it', function() {
                                        expect(cinema6.db.create).toHaveBeenCalledWith('updateRequest', {
                                            data: SelfieManageCampaignCtrl.renewalCampaign,
                                            campaign: SelfieManageCampaignCtrl.campaign.id
                                        });

                                        expect(updateRequest.save).toHaveBeenCalled();
                                        expect(SelfieManageCampaignCtrl.campaign.pojoify).not.toHaveBeenCalled();
                                        expect(SelfieManageCampaignCtrl.updateRequest).toBe(null);
                                    });

                                    describe('when the update request saves', function() {
                                        describe('when updateRequest status is not approved', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    updateRequestDeferred.resolve(updateRequest);
                                                });
                                            });

                                            it('should put the id on the campaign', function() {
                                                expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe('ur-1234');
                                            });

                                            it('should put the updateRequest on the Ctrl and cState', function() {
                                                expect(SelfieManageCampaignCtrl.updateRequest).toEqual(updateRequest)
                                                expect(cState.updateRequest).toEqual(updateRequest);
                                            });

                                            it('should set the campaign status to "pending" if the update request data has "pending" status', function() {
                                                if ((/expired|outOfBudget|canceled/).test(status)) {
                                                    expect(SelfieManageCampaignCtrl.campaign.status).toBe('pending');
                                                }
                                            });

                                            it('should update the _proxyCampaign', function() {
                                                expect(SelfieManageCampaignCtrl._proxyCampaign).toEqual(copy(SelfieManageCampaignCtrl.campaign));
                                            });

                                            it('should reset the summary and destroy the modal', function() {
                                                expect(SelfieManageCampaignCtrl.setSummary).toHaveBeenCalled();
                                                expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                                            });
                                        });

                                        describe('when the update request status is approved', function() {
                                            beforeEach(function() {
                                                $scope.$apply(function() {
                                                    updateRequest.status = 'approved';
                                                    updateRequestDeferred.resolve(updateRequest);
                                                });
                                            });

                                            it('should put not the id on the campaign', function() {
                                                expect(SelfieManageCampaignCtrl.campaign.updateRequest).toBe(undefined);
                                            });

                                            it('should put the updateRequest on the Ctrl and cState', function() {
                                                expect(SelfieManageCampaignCtrl.updateRequest).toBeFalsy();
                                                expect(cState.updateRequest).toBeFalsy();
                                            });

                                            it('should set the campaign status to "pending" if the update request data has "pending" status', function() {
                                                expect(SelfieManageCampaignCtrl.campaign.status).toBe('draft');
                                            });

                                            it('should reset the summary and destroy the modal', function() {
                                                expect(SelfieManageCampaignCtrl.setSummary).toHaveBeenCalled();
                                                expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                                            });
                                        });
                                    });

                                    describe('when the update request fails', function() {
                                        it('should display an error modal', function() {
                                            $scope.$apply(function() {
                                                updateRequestDeferred.reject('BAD');
                                            });

                                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                                        });

                                        it('should reset the summary and destroy the modal', function() {
                                            $scope.$apply(function() {
                                                updateRequestDeferred.reject('BAD');
                                            });

                                            expect(SelfieManageCampaignCtrl.setSummary).not.toHaveBeenCalled();
                                            expect(SelfieManageCampaignCtrl.destroyRenewModal).toHaveBeenCalled();
                                        });
                                    });
                                });
                            });
                        });
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
                        stats: stats
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
                    campaign.pricing.budget = 100;

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
                                                    updateRequest.data = SelfieManageCampaignCtrl.updateRequest.data;

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
                                                    updateRequest.data = SelfieManageCampaignCtrl.updateRequest.data;

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
                                                updateRequest.data = SelfieManageCampaignCtrl.updateRequest.data;

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
                                            eraseDeferred.resolve(null);
                                        });

                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, {pending: 'true'}, true);
                                    });
                                });

                                describe('when parent dashboard state is All', function() {
                                    it('should go to Selfie:All:CampaignDashboard', function() {
                                        cState.cParent.cName = 'Selfie:All:CampaignDashboard';

                                        $rootScope.$apply(function() {
                                            eraseDeferred.resolve(null);
                                        });

                                        expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName, null, null, true);
                                    });
                                });

                                describe('regardless of parent dashboard state', function() {
                                    beforeEach(function() {
                                        $rootScope.$apply(function() {
                                            eraseDeferred.resolve(null);
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
