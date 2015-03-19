define(['app'], function(appModule) {
    'use strict';

    describe('CampaignGeneralController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            CampaignCtrl,
            CampaignGeneralCtrl;

        var campaign,
            categories;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');

                campaign = cinema6.db.create('campaign', {
                    categories: ['food', 'vehicles']
                });

                categories = [
                    {
                        label: 'Food & Drink',
                        name: 'food'
                    },
                    {
                        label: 'Humor & Comedy',
                        name: 'humor'
                    },
                    {
                        label: 'Art',
                        name: 'art'
                    },
                    {
                        label: 'Cars & Autos',
                        name: 'vehicles'
                    },
                    {
                        label: 'Music & Entertainment',
                        name: 'music'
                    }
                ].map(function(data) {
                    return cinema6.db.create('category', data);
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignCtrl = $scope.CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.model = campaign;

                    CampaignGeneralCtrl = $controller('CampaignGeneralController', {
                        $scope: $scope
                    });
                    CampaignGeneralCtrl.initWithModel(categories, categories);
                });
            });
        });

        it('should exist', function() {
            expect(CampaignGeneralCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('categories', function() {
                it('should be the model', function() {
                    expect(CampaignGeneralCtrl.categories).toBe(categories);
                });
            });
        });
    });
});
