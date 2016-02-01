define(['app','minireel/mixins/PaginatedListController'], function(appModule, PaginatedListController) {
    'use strict';

    describe('CampaignsController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            ConfirmDialogService,
            ThumbnailService,
            paginatedDbList,
            $scope,
            SelfieCampaignsCtrl,
            CampaignService;

        var campaigns,
            model;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
                paginatedDbList = $injector.get('paginatedDbList');
                ThumbnailService = $injector.get('ThumbnailService');
                CampaignService = $injector.get('CampaignService');

                campaigns = c6State.get('Selfie:Campaigns');
                campaigns.isAdmin = false;
                campaigns.cParent = {
                    hasAdvertisers: false
                };
                campaigns.sort = 'lastUpdated,-1';
                campaigns.filter = 'draft,pending,active,paused,canceled,expired,error';
                campaigns.params = {
                    filter: 'draft,pending,active,paused,canceled,expired,error',
                    filterBy: 'statuses',
                    sort: 'lastUpdated,-1',
                    search: null
                };

                spyOn(cinema6.db, 'findAll').and.returnValue((function() {
                    var items = [];
                    items.meta = {
                        items: {
                            start: 1,
                            end: 0,
                            total: 0
                        }
                    };

                    return $q.when(items);
                }()));

                $rootScope.$apply(function() {
                    model = paginatedDbList('selfieCampaign', {}, 50);
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SelfieCampaignsCtrl = $controller('SelfieCampaignsController', {
                        $scope: $scope,
                        cState: campaigns
                    });
                    SelfieCampaignsCtrl.model = model;
                });
            });
        });

        it('should exist', function() {
            expect(SelfieCampaignsCtrl).toEqual(jasmine.any(Object));
        });

        it('should apply the PaginatedListController mixin', inject(function($injector) {
            expect(SelfieCampaignsCtrl).toEqual(jasmine.objectContaining($injector.instantiate(PaginatedListController, {
                $scope: $scope,
                cState: campaigns
            })));
        }));

        describe('properties', function() {
            describe('allStatusesChecked', function() {
                it('should be true when all statues are checked', function() {
                    SelfieCampaignsCtrl.filters = [
                        { name: 'Draft', id: 'draft', checked: true },
                        { name: 'Pending', id: 'pending', checked: false },
                        { name: 'Active', id: 'active', checked: true },
                        { name: 'Paused', id: 'paused', checked: false },
                        { name: 'Error', id: 'error', checked: true }
                    ];

                    expect(SelfieCampaignsCtrl.allStatusesChecked).toBe(false);

                    SelfieCampaignsCtrl.filters = [
                        { name: 'Draft', id: 'draft', checked: true },
                        { name: 'Pending', id: 'pending', checked: true },
                        { name: 'Active', id: 'active', checked: true },
                        { name: 'Paused', id: 'paused', checked: true },
                        { name: 'Error', id: 'error', checked: true }
                    ];

                    expect(SelfieCampaignsCtrl.allStatusesChecked).toBe(true);
                });
            });
        });

        describe('methods', function() {
            describe('remove(campaigns)', function() {
                var campaigns,
                    campaign1EraseDeferred, campaign2EraseDeferred,
                    config;

                beforeEach(function() {
                    campaign1EraseDeferred = $q.defer();
                    campaign2EraseDeferred = $q.defer();

                    campaigns = [
                        {
                            erase: jasmine.createSpy('erase()').and.returnValue(campaign1EraseDeferred.promise)
                        },
                        {
                            erase: jasmine.createSpy('erase()').and.returnValue(campaign2EraseDeferred.promise)
                        }
                    ];

                    spyOn(ConfirmDialogService, 'display');

                    $scope.$apply(function() {
                        SelfieCampaignsCtrl.remove(campaigns);
                    });

                    config = ConfirmDialogService.display.calls.mostRecent().args[0];
                });

                it('should open a confirmation dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                        prompt: jasmine.any(String),
                        affirm: jasmine.any(String),
                        cancel: jasmine.any(String),
                        onCancel: jasmine.any(Function),
                        onAffirm: jasmine.any(Function)
                    });
                });

                describe('if the dialog is canceled', function() {
                    beforeEach(function() {
                        spyOn(ConfirmDialogService, 'close');

                        config.onCancel();
                    });

                    it('should close the dialog', function() {
                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });
                });

                describe('if the dialog is affirmed', function() {
                    beforeEach(function() {
                        spyOn(ConfirmDialogService, 'close');

                        $scope.$apply(function() {
                            config.onAffirm();
                        });
                    });

                    it('should close the dialog', function() {
                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });

                    it('should erase all the campaigns', function() {
                        campaigns.forEach(function(campaign) {
                            expect(campaign.erase).toHaveBeenCalled();
                        });
                    });

                    describe('when the erases are done', function() {
                        var refreshDeferred;

                        beforeEach(function() {
                            refreshDeferred = $q.defer();

                            spyOn(model, 'refresh').and.returnValue(refreshDeferred.promise);

                            [campaign1EraseDeferred, campaign2EraseDeferred].forEach(function(deferred) {
                                $scope.$apply(function() {
                                    deferred.resolve(null);
                                });
                            });
                        });

                        it('should refresh the list', function() {
                            expect(model.refresh).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('editStateFor(campaign)', function() {
                describe('when status is "draft"', function() {
                    it('should be Selfie:EditCampaign', function() {
                        var campaign = {
                            id: 'cam-111',
                            cards: [{}],
                            status: 'draft'
                        };

                        expect(SelfieCampaignsCtrl.editStateFor(campaign)).toBe('Selfie:EditCampaign');
                    });
                });

                describe('when status is not "draft"', function() {
                    it('should be Selfie:ManageCampaign', function() {
                        var campaign = {
                            id: 'cam-111',
                            cards: [{}],
                            status: 'active'
                        };

                        expect(SelfieCampaignsCtrl.editStateFor(campaign)).toBe('Selfie:ManageCampaign');
                    });
                });
            });

            describe('toggleSort(property)', function() {
                it('should toggle the direction of the sort (-1 or 1)', function() {
                    SelfieCampaignsCtrl.params = {};

                    expect(SelfieCampaignsCtrl.sort).toBe('lastUpdated,-1');

                    SelfieCampaignsCtrl.toggleSort('lastUpdated');

                    expect(SelfieCampaignsCtrl.sort).toBe('lastUpdated,1');
                    expect(SelfieCampaignsCtrl.params.sort).toBe('lastUpdated,1');

                    SelfieCampaignsCtrl.toggleSort('name');

                    expect(SelfieCampaignsCtrl.sort).toBe('name,-1');
                    expect(SelfieCampaignsCtrl.params.sort).toBe('name,-1');
                });
            });

            describe('doSearch(text)', function() {
                it('should set/remove the text on the Ctrl', function() {
                    SelfieCampaignsCtrl.params = {};
                    expect(SelfieCampaignsCtrl.search).toBe(undefined);

                    SelfieCampaignsCtrl.doSearch('something');

                    expect(SelfieCampaignsCtrl.search).toBe('something');
                    expect(SelfieCampaignsCtrl.params.search).toBe('something');

                    SelfieCampaignsCtrl.doSearch('');

                    expect(SelfieCampaignsCtrl.search).toBe(undefined);
                    expect(SelfieCampaignsCtrl.params.search).toBe(undefined);
                });
            });

            describe('initWithModel(model)', function() {
                it('should put the model on the Ctrl', function() {
                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.model).toEqual(model);
                });

                it('should put the hasAdvertisers flag on the Ctrl', function() {
                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.hasAdvertisers).toEqual(false);

                    campaigns.cParent.hasAdvertisers = true;

                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.hasAdvertisers).toEqual(true);
                });

                it('should put the params object on the Ctrl', function() {
                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.params).toEqual(campaigns.params);
                });

                it('should put any saved search text on the Ctrl', function() {
                    campaigns.params.search = 'Hello';

                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.searchText).toEqual(campaigns.params.search);
                });

                it('should add the filters to the Ctrl', function() {
                    SelfieCampaignsCtrl.filter = 'active,error';
                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.filters).toEqual([
                        { name: 'Draft', id: 'draft', checked: false },
                        { name: 'Pending', id: 'pending', checked: false },
                        { name: 'Active', id: 'active', checked: true },
                        { name: 'Paused', id: 'paused', checked: false },
                        { name: 'Canceled', id: 'canceled', checked: false },
                        { name: 'Expired', id: 'expired', checked: false },
                        { name: 'Error', id: 'error', checked: true }
                    ]);
                });

                describe('adding the data', function() {
                    var statsDeferred, thumbDeferred, usersDeferred, updateRequestsDeferred, updateRequests;

                    beforeEach(function() {
                        updateRequestsDeferred = $q.defer();
                        statsDeferred = $q.defer();
                        thumbDeferred = {
                            ensureFulfillment: jasmine.createSpy('ensureFulfillment')
                                .and.returnValue($q.when({large: 'large-thumb.jpg'}))
                        };
                        usersDeferred = $q.defer();

                        spyOn(CampaignService, 'getAnalytics').and.returnValue(statsDeferred.promise);
                        spyOn(ThumbnailService, 'getThumbsFor').and.returnValue(thumbDeferred);
                        spyOn(CampaignService, 'getUserData').and.returnValue(usersDeferred.promise);
                        spyOn(CampaignService, 'previewUrlOf').and.callThrough();
                        cinema6.db.findAll.and.returnValue(updateRequestsDeferred.promise);

                        model.items.value = [
                            {
                                id: 'cam-1',
                                user: 'u-1',
                                updateRequest: 'ur-111',
                                cards: [
                                    {
                                        params: {},
                                        collateral: {},
                                        data: {}
                                    }
                                ],
                                pricing: {
                                    budget: 100,
                                    dailyLimit: 10
                                }
                            },
                            {
                                id: 'cam-2',
                                user: 'u-2',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Diageo'
                                        },
                                        collateral: {
                                            logo: 'diageo.jpg'
                                        },
                                        data: {
                                            service: 'youtube',
                                            videoid: '123'
                                        },
                                        thumb: 'thumb.jpg'
                                    }
                                ]
                            },
                            {
                                id: 'cam-3',
                                user: 'u-3',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Diageo'
                                        },
                                        collateral: {
                                            logo: 'diageo.jpg'
                                        },
                                        data: {
                                            service: 'youtube',
                                            videoid: '123'
                                        }
                                    }
                                ],
                                pricing: {
                                    budget: 1000
                                }
                            },
                            {
                                id: 'cam-4',
                                user: 'u-3',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Toyota'
                                        },
                                        collateral: {
                                            logo: 'toyota.jpg'
                                        },
                                        data: {
                                            service: 'vimeo',
                                            videoid: 'xyz'
                                        }
                                    }
                                ],
                                pricing: {
                                    budget: 1000,
                                    dailyLimit: 500
                                }
                            },
                            {
                                id: 'cam-5',
                                user: 'u-3',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Honda'
                                        },
                                        collateral: {
                                            logo: 'honda.jpg'
                                        },
                                        data: {
                                            service: 'vimeo',
                                            videoid: '789'
                                        }
                                    }
                                ],
                                pricing: {
                                    budget: 1000,
                                    dailyLimit: 500
                                }
                            }
                        ];

                        updateRequests = [
                            {
                                id: 'ur-111',
                                campaign: 'cam-1',
                                data: {
                                    id: 'cam-1',
                                    user: 'u-1',
                                    cards: [
                                        {
                                            id: 'rc-1',
                                            params: {},
                                            collateral: {
                                                logo: 'newlogo.jpg'
                                            },
                                            data: {}
                                        }
                                    ],
                                    pricing: {
                                        budget: 500,
                                        dailyLimit: 100
                                    }
                                }
                            }
                        ];

                        $scope.$apply(function() {
                            SelfieCampaignsCtrl.initWithModel(model);
                        });
                    });

                    it('should contain data for each campaign', function() {
                        expect(SelfieCampaignsCtrl.data['cam-1']).toEqual({
                            campaign: model.items.value[0],
                            previewUrl: false
                        });

                        expect(SelfieCampaignsCtrl.data['cam-2']).toEqual({
                            campaign: model.items.value[1],
                            previewUrl: jasmine.any(String)
                        });

                        expect(SelfieCampaignsCtrl.data['cam-3']).toEqual({
                            campaign: model.items.value[2],
                            previewUrl: jasmine.any(String)
                        });

                        expect(SelfieCampaignsCtrl.data['cam-4']).toEqual({
                            campaign: model.items.value[3],
                            previewUrl: jasmine.any(String)
                        });

                        expect(SelfieCampaignsCtrl.data['cam-5']).toEqual({
                            campaign: model.items.value[4],
                            previewUrl: jasmine.any(String)
                        });
                    });

                    it('should get the preview url of each campaign', function() {
                        model.items.value.forEach(function(campaign) {
                            expect(CampaignService.previewUrlOf).toHaveBeenCalledWith(campaign);
                        });
                    });

                    it('should request any updateRequests found on the campaigns', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('updateRequest', {ids: 'ur-111'});
                    });

                    it('should call the campaign service for stats', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({ids: 'cam-1,cam-2,cam-3,cam-4,cam-5'});
                    });

                    it('should not load user data if user is not admin', function() {
                        expect(CampaignService.getUserData).not.toHaveBeenCalled();
                    });

                    describe('when user is an admin', function() {
                        beforeEach(function() {
                            campaigns.isAdmin = true;

                            $scope.$apply(function() {
                                SelfieCampaignsCtrl.initWithModel(model);
                            });
                        });

                        it('should request user data', function() {
                            expect(CampaignService.getUserData).toHaveBeenCalledWith('u-1,u-2,u-3');
                        });

                        describe('when all the requests resolve', function() {
                            var stats, userHash;

                            beforeEach(function() {
                                stats = [
                                    {
                                        campaignId: 'cam-1',
                                        summary: {
                                            views: 100,
                                            totalSpend: '10.00',
                                            linkClicks: {
                                                facebook: 10,
                                                twitter: 20,
                                                youtube: 30,
                                                website: 40,
                                                action: 50
                                             },
                                             shareClicks: {
                                                facebook: 60,
                                                twitter: 70
                                             }
                                        },
                                        today: {
                                            views: 23,
                                            totalSpend: '1.1200',
                                            linkClicks: {
                                                facebook: 1,
                                                twitter: 2,
                                                youtube: 3,
                                                website: 4,
                                                action: 5
                                             },
                                             shareClicks: {
                                                facebook: 6,
                                                twitter: 7
                                             }
                                        }
                                    },
                                    {
                                        campaignId: 'cam-3',
                                        summary: {
                                            views: 2000,
                                            totalSpend: '500.50',
                                            linkClicks: {},
                                            shareClicks: {}
                                        },
                                        today: {
                                            views: 236,
                                            totalSpend: '18.1200',
                                            linkClicks: {},
                                            shareClicks: {}
                                        }
                                    },
                                    {
                                        campaignId: 'cam-4',
                                        summary: {
                                            views: 2000,
                                            totalSpend: '0.0000',
                                            linkClicks: {},
                                            shareClicks: {}
                                        },
                                        today: {
                                            views: 0,
                                            totalSpend: '0.0000',
                                            linkClicks: {},
                                            shareClicks: {}
                                        }
                                    },
                                    {
                                        campaignId: 'cam-5',
                                        summary: {
                                            views: 2000,
                                            totalSpend: '200.50',
                                            linkClicks: {},
                                            shareClicks: {}
                                        },
                                        today: {
                                            views: 236,
                                            totalSpend: '20.2500',
                                            linkClicks: {},
                                            shareClicks: {}
                                        }
                                    }
                                ];

                                userHash = {
                                    'u-1': {
                                        firstName: 'Johnny',
                                        lastName: 'Testmonkey',
                                        company: 'Tester, LLC'
                                    },
                                    'u-2': {
                                        firstName: 'Brent',
                                        lastName: 'Rambo',
                                        company: 'Rambo, Inc.'
                                    },
                                    'u-3': {
                                        firstName: 'Turtle',
                                        lastName: 'Monster',
                                        company: 'Monster, Inc.'
                                    }
                                };

                                $scope.$apply(function() {
                                    updateRequestsDeferred.resolve(updateRequests);
                                    statsDeferred.resolve(stats)
                                    usersDeferred.resolve(userHash);
                                });
                            });

                            it('should use the updateRequest as the campaign', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].campaign).toEqual(updateRequests[0].data);
                            });

                            it('should add logo if defined', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].logo).toEqual(updateRequests[0].data.cards[0].collateral.logo);
                                expect(SelfieCampaignsCtrl.data['cam-2'].logo).toEqual(model.items.value[1].cards[0].collateral.logo);
                                expect(SelfieCampaignsCtrl.data['cam-3'].logo).toEqual(model.items.value[2].cards[0].collateral.logo);
                            });

                            describe('when card has custom thumb', function() {
                                it('should add it to the data', function() {
                                    expect(SelfieCampaignsCtrl.data['cam-2'].thumb).toEqual(model.items.value[1].cards[0].thumb);
                                });
                            });

                            describe('when the card does not have a custom thumb', function() {
                                it('should get thumbs from Thumbnail Service', function() {
                                    expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', '123', {
                                        service: 'youtube',
                                        videoid: '123'
                                    });
                                    expect(SelfieCampaignsCtrl.data['cam-3'].thumb).toEqual('large-thumb.jpg');
                                });
                            });

                            it('should add stats for each campaign', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].stats).toEqual({
                                    total: {
                                        views: 100,
                                        spend: 10,
                                        budget: 500,
                                        remaining: 2,
                                        interactions: 280
                                    },
                                    today: {
                                        views: 23,
                                        spend: 1.12,
                                        budget: 100,
                                        remaining: 1.12,
                                        interactions: 28
                                    }
                                });
                                expect(SelfieCampaignsCtrl.data['cam-2'].stats).toEqual(undefined);
                                expect(SelfieCampaignsCtrl.data['cam-3'].stats).toEqual({
                                    total: {
                                        views: 2000,
                                        spend: 500.50,
                                        budget: 1000,
                                        remaining: 50.05,
                                        interactions: 0
                                    },
                                    today: {
                                        views: 236,
                                        spend: 18.12,
                                        budget: null,
                                        remaining: null,
                                        interactions: 0
                                    }
                                });
                                expect(SelfieCampaignsCtrl.data['cam-4'].stats).toEqual({
                                    total: {
                                        views: 2000,
                                        spend: 0,
                                        budget: 1000,
                                        remaining: 100,
                                        interactions: 0
                                    },
                                    today: {
                                        views: 0,
                                        spend: 0,
                                        budget: 500,
                                        remaining: 100,
                                        interactions: 0
                                    }
                                });
                                expect(SelfieCampaignsCtrl.data['cam-5'].stats).toEqual({
                                    total: {
                                        views: 2000,
                                        spend: 200.50,
                                        budget: 1000,
                                        remaining: 20.05,
                                        interactions: 0
                                    },
                                    today: {
                                        views: 236,
                                        spend: 20.25,
                                        budget: 500,
                                        remaining: 4.05,
                                        interactions: 0
                                    }
                                });
                            });

                            it('should add user data to the data object', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].user).toEqual({
                                    firstName: 'Johnny',
                                    lastName: 'Testmonkey',
                                    company: 'Tester, LLC'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-2'].user).toEqual({
                                    firstName: 'Brent',
                                    lastName: 'Rambo',
                                    company: 'Rambo, Inc.'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-3'].user).toEqual({
                                    firstName: 'Turtle',
                                    lastName: 'Monster',
                                    company: 'Monster, Inc.'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-4'].user).toEqual({
                                    firstName: 'Turtle',
                                    lastName: 'Monster',
                                    company: 'Monster, Inc.'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-5'].user).toEqual({
                                    firstName: 'Turtle',
                                    lastName: 'Monster',
                                    company: 'Monster, Inc.'
                                });
                            });
                        });
                    });
                });
            });

            describe('toggleFilter()', function() {
                it('should update the filter query param based on which options are checked', function() {
                    SelfieCampaignsCtrl.params = {};

                    SelfieCampaignsCtrl.filters = [
                        { name: 'Draft', id: 'draft', checked: true },
                        { name: 'Pending', id: 'pending', checked: false },
                        { name: 'Approved', id: 'approved', checked: true },
                        { name: 'Active', id: 'active', checked: true },
                        { name: 'Paused', id: 'paused', checked: false },
                        { name: 'Error', id: 'error', checked: true }
                    ];

                    SelfieCampaignsCtrl.toggleFilter();

                    expect(SelfieCampaignsCtrl.filter).toEqual('draft,approved,active,error');
                    expect(SelfieCampaignsCtrl.params.filter).toEqual('draft,approved,active,error');
                });
            });

            describe('toggleAllStatuses(bool)', function() {
                describe('when bool === true', function() {
                    it('should mark all the statuses as checked and should call toggleFilter()', function() {
                        spyOn(SelfieCampaignsCtrl, 'toggleFilter');

                        SelfieCampaignsCtrl.filters = [
                            { name: 'Draft', id: 'draft', checked: false },
                            { name: 'Pending', id: 'pending', checked: false },
                            { name: 'Approved', id: 'approved', checked: true },
                            { name: 'Active', id: 'active', checked: true },
                            { name: 'Paused', id: 'paused', checked: false },
                            { name: 'Error', id: 'error', checked: true }
                        ];

                        SelfieCampaignsCtrl.toggleAllStatuses(true);

                        SelfieCampaignsCtrl.filters.forEach(function(status) {
                            expect(status.checked).toBe(true);
                        });

                        expect(SelfieCampaignsCtrl.toggleFilter).toHaveBeenCalled();
                    });
                });

                describe('when bool === false', function() {
                    it('should mark all the statuses as checked and should call toggleFilter()', function() {
                        spyOn(SelfieCampaignsCtrl, 'toggleFilter');

                        SelfieCampaignsCtrl.filters = [
                            { name: 'Draft', id: 'draft', checked: false },
                            { name: 'Pending', id: 'pending', checked: false },
                            { name: 'Approved', id: 'approved', checked: true },
                            { name: 'Active', id: 'active', checked: true },
                            { name: 'Paused', id: 'paused', checked: false },
                            { name: 'Error', id: 'error', checked: true }
                        ];

                        SelfieCampaignsCtrl.toggleAllStatuses(false);

                        SelfieCampaignsCtrl.filters.forEach(function(status) {
                            expect(status.checked).toBe(false);
                        });

                        expect(SelfieCampaignsCtrl.toggleFilter).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('$scope events', function() {
            describe('$on PaginatedListHasUpdated', function() {
                describe('adding the data', function() {
                    var statsDeferred, thumbDeferred, usersDeferred, updateRequestsDeferred, updateRequests;

                    beforeEach(function() {
                        updateRequestsDeferred = $q.defer();
                        statsDeferred = $q.defer();
                        thumbDeferred = {
                            ensureFulfillment: jasmine.createSpy('ensureFulfillment')
                                .and.returnValue($q.when({large: 'large-thumb.jpg'}))
                        };
                        usersDeferred = $q.defer();

                        spyOn(CampaignService, 'getAnalytics').and.returnValue(statsDeferred.promise);
                        spyOn(ThumbnailService, 'getThumbsFor').and.returnValue(thumbDeferred);
                        spyOn(CampaignService, 'getUserData').and.returnValue(usersDeferred.promise);
                        spyOn(CampaignService, 'previewUrlOf').and.callThrough();
                        cinema6.db.findAll.and.returnValue(updateRequestsDeferred.promise);

                        model.items.value = [];
                        SelfieCampaignsCtrl.initWithModel(model);

                        model.items.value = [
                            {
                                id: 'cam-1',
                                user: 'u-1',
                                updateRequest: 'ur-111',
                                cards: [
                                    {
                                        params: {},
                                        collateral: {},
                                        data: {}
                                    }
                                ],
                                pricing: {
                                    budget: 100,
                                    dailyLimit: 10
                                }
                            },
                            {
                                id: 'cam-2',
                                user: 'u-2',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Diageo'
                                        },
                                        collateral: {
                                            logo: 'diageo.jpg'
                                        },
                                        data: {
                                            service: 'youtube',
                                            videoid: '123'
                                        },
                                        thumb: 'thumb.jpg'
                                    }
                                ]
                            },
                            {
                                id: 'cam-3',
                                user: 'u-3',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Diageo'
                                        },
                                        collateral: {
                                            logo: 'diageo.jpg'
                                        },
                                        data: {
                                            service: 'youtube',
                                            videoid: '123'
                                        }
                                    }
                                ],
                                pricing: {
                                    budget: 1000
                                }
                            },
                            {
                                id: 'cam-4',
                                user: 'u-3',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Toyota'
                                        },
                                        collateral: {
                                            logo: 'toyota.jpg'
                                        },
                                        data: {
                                            service: 'vimeo',
                                            videoid: 'xyz'
                                        }
                                    }
                                ],
                                pricing: {
                                    budget: 1000,
                                    dailyLimit: 500
                                }
                            },
                            {
                                id: 'cam-5',
                                user: 'u-3',
                                cards: [
                                    {
                                        params: {
                                            sponsor: 'Honda'
                                        },
                                        collateral: {
                                            logo: 'honda.jpg'
                                        },
                                        data: {
                                            service: 'vimeo',
                                            videoid: '789'
                                        }
                                    }
                                ],
                                pricing: {
                                    budget: 1000,
                                    dailyLimit: 500
                                }
                            }
                        ];

                        updateRequests = [
                            {
                                id: 'ur-111',
                                campaign: 'cam-1',
                                data: {
                                    id: 'cam-1',
                                    user: 'u-1',
                                    cards: [
                                        {
                                            id: 'rc-1',
                                            params: {},
                                            collateral: {
                                                logo: 'newlogo.jpg'
                                            },
                                            data: {}
                                        }
                                    ],
                                    pricing: {
                                        budget: 500,
                                        dailyLimit: 100
                                    }
                                }
                            }
                        ];

                        $scope.$apply(function() {
                            model.emit('PaginatedListHasUpdated');
                        });
                    });

                    it('should contain data for each campaign', function() {
                        expect(SelfieCampaignsCtrl.data['cam-1']).toEqual({
                            campaign: model.items.value[0],
                            previewUrl: false
                        });

                        expect(SelfieCampaignsCtrl.data['cam-2']).toEqual({
                            campaign: model.items.value[1],
                            previewUrl: jasmine.any(String)
                        });

                        expect(SelfieCampaignsCtrl.data['cam-3']).toEqual({
                            campaign: model.items.value[2],
                            previewUrl: jasmine.any(String)
                        });

                        expect(SelfieCampaignsCtrl.data['cam-4']).toEqual({
                            campaign: model.items.value[3],
                            previewUrl: jasmine.any(String)
                        });

                        expect(SelfieCampaignsCtrl.data['cam-5']).toEqual({
                            campaign: model.items.value[4],
                            previewUrl: jasmine.any(String)
                        });
                    });

                    it('should get the preview url of each campaign', function() {
                        model.items.value.forEach(function(campaign) {
                            expect(CampaignService.previewUrlOf).toHaveBeenCalledWith(campaign);
                        });
                    });

                    it('should request any updateRequests found on the campaigns', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('updateRequest', {ids: 'ur-111'});
                    });

                    it('should call the campaign service for stats', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({ids: 'cam-1,cam-2,cam-3,cam-4,cam-5'});
                    });

                    it('should not load user data if user is not admin', function() {
                        expect(CampaignService.getUserData).not.toHaveBeenCalled();
                    });

                    describe('when user is an admin', function() {
                        beforeEach(function() {
                            campaigns.isAdmin = true;

                            $scope.$apply(function() {
                                SelfieCampaignsCtrl.initWithModel(model);
                            });
                        });

                        it('should request user data', function() {
                            expect(CampaignService.getUserData).toHaveBeenCalledWith('u-1,u-2,u-3');
                        });

                        describe('when all the requests resolve', function() {
                            var stats, userHash;

                            beforeEach(function() {
                                stats = [
                                    {
                                        campaignId: 'cam-1',
                                        summary: {
                                            views: 100,
                                            totalSpend: '10.00',
                                            linkClicks: {
                                                facebook: 10,
                                                twitter: 20,
                                                youtube: 30,
                                                website: 40,
                                                action: 50
                                             },
                                             shareClicks: {
                                                facebook: 60,
                                                twitter: 70
                                             }
                                        },
                                        today: {
                                            views: 23,
                                            totalSpend: '1.1200',
                                            linkClicks: {
                                                facebook: 1,
                                                twitter: 2,
                                                youtube: 3,
                                                website: 4,
                                                action: 5
                                             },
                                             shareClicks: {
                                                facebook: 6,
                                                twitter: 7
                                             }
                                        }
                                    },
                                    {
                                        campaignId: 'cam-3',
                                        summary: {
                                            views: 2000,
                                            totalSpend: '500.50',
                                            linkClicks: {},
                                            shareClicks: {}
                                        },
                                        today: {
                                            views: 236,
                                            totalSpend: '18.1200',
                                            linkClicks: {},
                                            shareClicks: {}
                                        }
                                    },
                                    {
                                        campaignId: 'cam-4',
                                        summary: {
                                            views: 2000,
                                            totalSpend: '0.0000',
                                            linkClicks: {},
                                            shareClicks: {}
                                        },
                                        today: {
                                            views: 0,
                                            totalSpend: '0.0000',
                                            linkClicks: {},
                                            shareClicks: {}
                                        }
                                    },
                                    {
                                        campaignId: 'cam-5',
                                        summary: {
                                            views: 2000,
                                            totalSpend: '200.50',
                                            linkClicks: {},
                                            shareClicks: {}
                                        },
                                        today: {
                                            views: 236,
                                            totalSpend: '20.2500',
                                            linkClicks: {},
                                            shareClicks: {}
                                        }
                                    }
                                ];

                                userHash = {
                                    'u-1': {
                                        firstName: 'Johnny',
                                        lastName: 'Testmonkey',
                                        company: 'Tester, LLC'
                                    },
                                    'u-2': {
                                        firstName: 'Brent',
                                        lastName: 'Rambo',
                                        company: 'Rambo, Inc.'
                                    },
                                    'u-3': {
                                        firstName: 'Turtle',
                                        lastName: 'Monster',
                                        company: 'Monster, Inc.'
                                    }
                                };

                                $scope.$apply(function() {
                                    updateRequestsDeferred.resolve(updateRequests);
                                    statsDeferred.resolve(stats)
                                    usersDeferred.resolve(userHash);
                                });
                            });

                            it('should use the updateRequest as the campaign', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].campaign).toEqual(updateRequests[0].data);
                            });

                            it('should add logo if defined', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].logo).toEqual(updateRequests[0].data.cards[0].collateral.logo);
                                expect(SelfieCampaignsCtrl.data['cam-2'].logo).toEqual(model.items.value[1].cards[0].collateral.logo);
                                expect(SelfieCampaignsCtrl.data['cam-3'].logo).toEqual(model.items.value[2].cards[0].collateral.logo);
                            });

                            describe('when card has custom thumb', function() {
                                it('should add it to the data', function() {
                                    expect(SelfieCampaignsCtrl.data['cam-2'].thumb).toEqual(model.items.value[1].cards[0].thumb);
                                });
                            });

                            describe('when the card does not have a custom thumb', function() {
                                it('should get thumbs from Thumbnail Service', function() {
                                    expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', '123', {
                                        service: 'youtube',
                                        videoid: '123'
                                    });
                                    expect(SelfieCampaignsCtrl.data['cam-3'].thumb).toEqual('large-thumb.jpg');
                                });
                            });

                            it('should add stats for each campaign', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].stats).toEqual({
                                    total: {
                                        views: 100,
                                        spend: 10,
                                        budget: 500,
                                        remaining: 2,
                                        interactions: 280
                                    },
                                    today: {
                                        views: 23,
                                        spend: 1.12,
                                        budget: 100,
                                        remaining: 1.12,
                                        interactions: 28
                                    }
                                });
                                expect(SelfieCampaignsCtrl.data['cam-2'].stats).toEqual(undefined);
                                expect(SelfieCampaignsCtrl.data['cam-3'].stats).toEqual({
                                    total: {
                                        views: 2000,
                                        spend: 500.50,
                                        budget: 1000,
                                        remaining: 50.05,
                                        interactions: 0
                                    },
                                    today: {
                                        views: 236,
                                        spend: 18.12,
                                        budget: null,
                                        remaining: null,
                                        interactions: 0
                                    }
                                });
                                expect(SelfieCampaignsCtrl.data['cam-4'].stats).toEqual({
                                    total: {
                                        views: 2000,
                                        spend: 0,
                                        budget: 1000,
                                        remaining: 100,
                                        interactions: 0
                                    },
                                    today: {
                                        views: 0,
                                        spend: 0,
                                        budget: 500,
                                        remaining: 100,
                                        interactions: 0
                                    }
                                });
                                expect(SelfieCampaignsCtrl.data['cam-5'].stats).toEqual({
                                    total: {
                                        views: 2000,
                                        spend: 200.50,
                                        budget: 1000,
                                        remaining: 20.05,
                                        interactions: 0
                                    },
                                    today: {
                                        views: 236,
                                        spend: 20.25,
                                        budget: 500,
                                        remaining: 4.05,
                                        interactions: 0
                                    }
                                });
                            });

                            it('should add user data to the data object', function() {
                                expect(SelfieCampaignsCtrl.data['cam-1'].user).toEqual({
                                    firstName: 'Johnny',
                                    lastName: 'Testmonkey',
                                    company: 'Tester, LLC'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-2'].user).toEqual({
                                    firstName: 'Brent',
                                    lastName: 'Rambo',
                                    company: 'Rambo, Inc.'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-3'].user).toEqual({
                                    firstName: 'Turtle',
                                    lastName: 'Monster',
                                    company: 'Monster, Inc.'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-4'].user).toEqual({
                                    firstName: 'Turtle',
                                    lastName: 'Monster',
                                    company: 'Monster, Inc.'
                                });
                                expect(SelfieCampaignsCtrl.data['cam-5'].user).toEqual({
                                    firstName: 'Turtle',
                                    lastName: 'Monster',
                                    company: 'Monster, Inc.'
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
