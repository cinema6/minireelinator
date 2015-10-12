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
                        name: 'comedy',
                        label: 'Comedy'
                    },
                    {
                        name: 'cars',
                        label: 'Cars'
                    },
                    {
                        name: 'entertainment',
                        label: 'Entertainment'
                    },
                    {
                        name: 'food',
                        label: 'Food'
                    }
                ];

                $scope = $rootScope.$new();
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

                    campaign.targeting.interests.push('entertainment');
                    campaign.targeting.interests.push('comedy');

                    compileCtrl();

                    expect(SelfieInterestsCtrl.interests).toEqual([
                        {
                            name: 'comedy',
                            label: 'Comedy'
                        },
                        {
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

                    expect(campaign.targeting.interests).toEqual(['entertainment', 'food']);

                    $scope.$apply(function() {
                        SelfieInterestsCtrl.interests = [];
                    });

                    expect(campaign.targeting.interests).toEqual([]);
                });
            });
        });
    });
});