define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCategoriesController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieCategoriesCtrl;

        var campaign,
            categories;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCategoriesCtrl = $controller('SelfieCategoriesController', { $scope: $scope });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                campaign = {
                    pricing: {},
                    geoTargeting: [],
                    categories: []
                };

                categories = [
                    {
                        name: 'comedy',
                        label: 'Comedy'
                    },
                    {
                        name: 'entertainment',
                        label: 'Entertainment'
                    }
                ];

                $scope = $rootScope.$new();
                $scope.campaign = campaign;
                $scope.categories = categories;

            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCategoriesCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('categories', function() {
                it('should include a "None" option', function() {
                    expect(SelfieCategoriesCtrl.categories[0]).toEqual({
                        name: 'none', label: 'No Category Targeting'
                    });

                    expect(SelfieCategoriesCtrl.categories).toContain({
                        name: 'comedy', label: 'Comedy'
                    });

                    expect(SelfieCategoriesCtrl.categories).toContain({
                        name: 'entertainment', label: 'Entertainment'
                    });
                });
            });

            describe('category', function() {
                it('should come from the campaign or default to "None"', function() {
                    expect(SelfieCategoriesCtrl.category).toEqual({
                        name: 'none', label: 'No Category Targeting'
                    });
                    expect(SelfieCategoriesCtrl.category).toBe(SelfieCategoriesCtrl.categories[0]);

                    campaign.categories.push('entertainment');

                    compileCtrl();

                    expect(SelfieCategoriesCtrl.category).toBe(SelfieCategoriesCtrl.categories[2]);
                });
            });
        });

        describe('$watchers', function() {
            describe('category', function() {
                it('should set category on the campaign', function() {
                    expect(campaign.categories).toEqual([]);

                    $scope.$apply(function() {
                        SelfieCategoriesCtrl.category = SelfieCategoriesCtrl.categories[2];
                    });

                    expect(campaign.categories).toEqual(['entertainment']);

                    $scope.$apply(function() {
                        SelfieCategoriesCtrl.category = SelfieCategoriesCtrl.categories[0];
                    });

                    expect(campaign.categories).toEqual([]);
                });
            });
        });
    });
});