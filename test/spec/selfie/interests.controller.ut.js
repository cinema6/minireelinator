define(['app'], function(appModule) {
    'use strict';

    describe('SelfieInterestsController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieInterestsCtrl;

        var campaign,
            categories;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieInterestsCtrl = $controller('SelfieInterestsController', {
                    $scope: $scope
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                campaign = {
                    targeting: {
                        interests: []
                    }
                };

                categories = [
                    {
                        id: 'int-111',
                        name: 'comedy',
                        label: 'Comedy'
                    },
                    {
                        id: 'int-112',
                        name: 'cars',
                        label: 'Cars'
                    },
                    {
                        id: 'int-113',
                        name: 'entertainment',
                        label: 'Entertainment'
                    },
                    {
                        id: 'int-114',
                        name: 'food',
                        label: 'Food'
                    }
                ];

                $scope = $rootScope.$new();
                $scope.schema = {
                    pricing: {
                        budget: {
                            __min:50,
                            __max:20000
                        },
                        dailyLimit: {
                            __percentMin:0.015,
                            __percentMax:1,
                            __percentDefault:0.03
                        },
                        cost: {
                            __base: 0.05,
                            __pricePerGeo: 0.01,
                            __pricePerDemo: 0.01,
                            __priceForInterests: 0.01
                        }
                    }
                };
                $scope.campaign = campaign;
                $scope.categories = categories;
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieInterestsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('interests', function() {
                it('should be the interest(s) from the campaign', function() {
                    expect(SelfieInterestsCtrl.interests).toEqual([]);

                    campaign.targeting.interests.push('int-113');
                    campaign.targeting.interests.push('int-111');

                    compileCtrl();

                    expect(SelfieInterestsCtrl.interests).toEqual([
                        {
                            id: 'int-111',
                            name: 'comedy',
                            label: 'Comedy'
                        },
                        {
                            id: 'int-113',
                            name: 'entertainment',
                            label: 'Entertainment'
                        }
                    ]);
                });
            });
        });

        describe('$watchers', function() {
            describe('interests', function() {
                it('should set the interests on the campaign', function() {
                    expect(campaign.targeting.interests).toEqual([]);

                    $scope.$apply(function() {
                        SelfieInterestsCtrl.interests = [ categories[2],  categories[3]];
                    });

                    expect(campaign.targeting.interests).toEqual(['int-113', 'int-114']);

                    $scope.$apply(function() {
                        SelfieInterestsCtrl.interests = [];
                    });

                    expect(campaign.targeting.interests).toEqual([]);
                });
            });
        });
    });
});