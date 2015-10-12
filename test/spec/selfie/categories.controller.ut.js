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
                    contentCategories: {
                        primary: null
                    }
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
            describe('category', function() {
                it('should come from the campaign or be null', function() {
                    expect(SelfieCategoriesCtrl.category).toEqual(null);

                    campaign.contentCategories.primary = 'entertainment';

                    compileCtrl();

                    expect(SelfieCategoriesCtrl.category).toBe(categories[1]);
                });
            });
        });

        describe('$watchers', function() {
            describe('category', function() {
                it('should set category on the campaign', function() {
                    expect(campaign.contentCategories.primary).toEqual(null);

                    $scope.$apply(function() {
                        SelfieCategoriesCtrl.category = categories[1];
                    });

                    expect(campaign.contentCategories.primary).toEqual('entertainment');

                    $scope.$apply(function() {
                        SelfieCategoriesCtrl.category = categories[0];
                    });

                    expect(campaign.contentCategories.primary).toEqual('comedy');
                });
            });
        });
    });
});