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
                    expect(SelfieCampaignsCtrl.sort).toBe('lastUpdated,-1');

                    SelfieCampaignsCtrl.toggleSort('lastUpdated');

                    expect(SelfieCampaignsCtrl.sort).toBe('lastUpdated,1');

                    SelfieCampaignsCtrl.toggleSort('name');

                    expect(SelfieCampaignsCtrl.sort).toBe('name,-1');
                });
            });

            describe('doSearch(text)', function() {
                it('should set/remove the text on the Ctrl', function() {
                    expect(SelfieCampaignsCtrl.search).toBe(undefined);

                    SelfieCampaignsCtrl.doSearch('something');

                    expect(SelfieCampaignsCtrl.search).toBe('something');

                    SelfieCampaignsCtrl.doSearch('');

                    expect(SelfieCampaignsCtrl.search).toBe(undefined);
                });
            });

            describe('initWithModel(model)', function() {
                it('should put the model on the Ctrl', function() {
                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.model).toEqual(model);
                });

                it('should add the filters to the Ctrl', function() {
                    SelfieCampaignsCtrl.filter = 'active,error';
                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.filters).toEqual([
                        { name: 'Draft', id: 'draft', checked: false },
                        { name: 'Pending', id: 'pending', checked: false },
                        { name: 'Approved', id: 'approved', checked: false },
                        { name: 'Active', id: 'active', checked: true },
                        { name: 'Paused', id: 'paused', checked: false },
                        { name: 'Error', id: 'error', checked: true }
                    ]);
                });

                describe('adding the metaData', function() {
                    var statsDeferred, thumbDeferred, usersDeferred;

                    beforeEach(function() {
                        statsDeferred = $q.defer();
                        thumbDeferred = {
                            ensureFulfillment: jasmine.createSpy('ensureFulfillment')
                                .and.returnValue($q.when({large: 'large-thumb.jpg'}))
                        };
                        usersDeferred = $q.defer();

                        spyOn(CampaignService, 'getAnalytics').and.returnValue(statsDeferred.promise);
                        spyOn(ThumbnailService, 'getThumbsFor').and.returnValue(thumbDeferred);
                        spyOn(CampaignService, 'getUserData').and.returnValue(usersDeferred.promise);

                        model.items.value = [
                            {
                                id: 'cam-1',
                                user: 'u-1',
                                cards: [
                                    {
                                        params: {},
                                        collateral: {},
                                        data: {}
                                    }
                                ]
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
                                ]
                            }
                        ];

                        $scope.$apply(function() {
                            SelfieCampaignsCtrl.initWithModel(model);
                        });
                    });

                    it('should contain metaData for each campaign', function() {
                        expect(SelfieCampaignsCtrl.metaData['cam-1']).toEqual({
                            sponsor: undefined,
                            logo: undefined,
                            thumb: null
                        });

                        expect(SelfieCampaignsCtrl.metaData['cam-2']).toEqual({
                            sponsor: 'Diageo',
                            logo: 'diageo.jpg',
                            thumb: 'thumb.jpg'
                        });
                    });

                    describe('when the card does not have a custom thumb', function() {
                        it('should get thumbs from Thumbnail Service', function() {
                            expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', '123');
                            expect(SelfieCampaignsCtrl.metaData['cam-3']).toEqual({
                                sponsor: 'Diageo',
                                logo: 'diageo.jpg',
                                thumb: 'large-thumb.jpg'
                            });
                        });
                    });

                    describe('adding campaign stats', function() {
                        it('should call the campaign service', function() {
                            expect(CampaignService.getAnalytics).toHaveBeenCalledWith('cam-1,cam-2,cam-3');
                        });

                        describe('when stats are returned', function() {
                            it('should add data for each campaign', function() {
                                var stats = [
                                    {
                                        campaignId: 'cam-1',
                                        summary: {
                                            views: 100,
                                            totalSpend: '10.00'
                                        }
                                    },
                                    {
                                        campaignId: 'cam-3',
                                        summary: {
                                            views: 2000,
                                            totalSpend: '500.50'
                                        }
                                    }
                                ];

                                $scope.$apply(function() {
                                    statsDeferred.resolve(stats)
                                });

                                expect(SelfieCampaignsCtrl.metaData['cam-1']).toEqual({
                                    sponsor: undefined,
                                    logo: undefined,
                                    thumb: null,
                                    stats: {
                                        views: 100,
                                        spend: '10.00'
                                    }
                                });
                                expect(SelfieCampaignsCtrl.metaData['cam-2']).toEqual({
                                    sponsor: 'Diageo',
                                    logo: 'diageo.jpg',
                                    thumb: 'thumb.jpg'
                                });
                                expect(SelfieCampaignsCtrl.metaData['cam-3']).toEqual({
                                    sponsor: 'Diageo',
                                    logo: 'diageo.jpg',
                                    thumb: 'large-thumb.jpg',
                                    stats: {
                                        views: 2000,
                                        spend: '500.50'
                                    }
                                });
                            });
                        });
                    });

                    describe('add the user data', function() {
                        it('should not happen if user is not admin', function() {
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

                            describe('when userData is returned', function() {
                                it('should add it to the meta data object', function() {
                                    var userHash = {
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
                                        usersDeferred.resolve(userHash);
                                    });

                                    expect(SelfieCampaignsCtrl.metaData['cam-1'].user).toEqual({
                                        firstName: 'Johnny',
                                        lastName: 'Testmonkey',
                                        company: 'Tester, LLC'
                                    });
                                    expect(SelfieCampaignsCtrl.metaData['cam-2'].user).toEqual({
                                        firstName: 'Brent',
                                        lastName: 'Rambo',
                                        company: 'Rambo, Inc.'
                                    });
                                    expect(SelfieCampaignsCtrl.metaData['cam-3'].user).toEqual({
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

            describe('toggleFilter()', function() {
                it('should update the filter query param based on which options are checked', function() {
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
                });
            });
        });

        describe('$scope events', function() {
            describe('$on PaginatedListHasUpdated', function() {
                describe('adding the metaData', function() {
                    var statsDeferred, thumbDeferred;

                    beforeEach(function() {
                        statsDeferred = $q.defer();
                        thumbDeferred = {
                            ensureFulfillment: jasmine.createSpy('ensureFulfillment')
                                .and.returnValue($q.when({large: 'large-thumb.jpg'}))
                        };

                        spyOn(CampaignService, 'getAnalytics').and.returnValue(statsDeferred.promise);
                        spyOn(ThumbnailService, 'getThumbsFor').and.returnValue(thumbDeferred);

                        model.items.value = [
                            {
                                id: 'cam-1',
                                cards: [
                                    {
                                        params: {},
                                        collateral: {},
                                        data: {}
                                    }
                                ]
                            },
                            {
                                id: 'cam-2',
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
                            }
                        ];

                        SelfieCampaignsCtrl.initWithModel(model);

                        model.emit('PaginatedListHasUpdated');

                        $scope.$digest();
                    });

                    it('should contain metaData for each campaign', function() {
                        expect(SelfieCampaignsCtrl.metaData['cam-1']).toEqual({
                            sponsor: undefined,
                            logo: undefined,
                            thumb: null
                        });

                        expect(SelfieCampaignsCtrl.metaData['cam-2']).toEqual({
                            sponsor: 'Diageo',
                            logo: 'diageo.jpg',
                            thumb: 'thumb.jpg'
                        });
                    });

                    it('should call for stats', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith('cam-1,cam-2');
                    });
                });
            });
        });
    });
});
