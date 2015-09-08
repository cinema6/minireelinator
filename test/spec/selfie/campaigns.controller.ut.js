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
            SelfieCampaignsCtrl;

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

                campaigns = c6State.get('Selfie:Campaigns');

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
            describe('initWithModel(model)', function() {
                beforeEach(function() {
                    model.items.value = [
                        {
                            id: 'cam-1',
                            cards: [
                                {
                                    item: {
                                        params: {},
                                        collateral: {},
                                        data: {}
                                    }
                                }
                            ]
                        },
                        {
                            id: 'cam-2',
                            cards: [
                                {
                                    item: {
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
                                }
                            ]
                        }
                    ];
                });

                it('should add the model', function() {
                    SelfieCampaignsCtrl.initWithModel(model);

                    expect(SelfieCampaignsCtrl.model).toEqual(model);
                });

                it('should add metaData for each campaign', function() {
                    SelfieCampaignsCtrl.initWithModel(model);

                    $scope.$digest();

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
                        var promise = {
                            ensureFulfillment: jasmine.createSpy('ensureFulfillment').and.returnValue($q.when({large: 'large-thumb.jpg'}))
                        };

                        spyOn(ThumbnailService, 'getThumbsFor').and.returnValue(promise);

                        delete model.items.value[1].cards[0].item.thumb;

                        SelfieCampaignsCtrl.initWithModel(model);

                        $scope.$digest();

                        expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', '123');
                        expect(SelfieCampaignsCtrl.metaData['cam-2']).toEqual({
                            sponsor: 'Diageo',
                            logo: 'diageo.jpg',
                            thumb: 'large-thumb.jpg'
                        });
                    });
                });
            });

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
        });
    });
});
