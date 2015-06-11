define(['app','minireel/mixins/PaginatedListController'], function(appModule, PaginatedListController) {
    'use strict';

    describe('CampaignsController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            ConfirmDialogService,
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
                    model = paginatedDbList('campaign', {}, 50);
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SelfieCampaignsCtrl = $controller('CampaignsController', {
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
    });
});
