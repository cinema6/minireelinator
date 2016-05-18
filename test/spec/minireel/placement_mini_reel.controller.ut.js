define(['minireel/sponsor'], function(sponsorModule) {
    'use strict';

    describe('PlacementMiniReelController', function() {
        var $rootScope,
            $controller,
            $scope,
            PlacementMiniReelCtrl;

        var minireel;

        beforeEach(function() {
            minireel = {
                data: {
                    deck: [
                        {
                            title: 'Cinema6'
                        },
                        {
                            title: 'Is'
                        },
                        {
                            title: 'Located'
                        },
                        {
                            title: 'In'
                        },
                        {
                            title: 'Princeton'
                        },
                        {
                            title: 'NJ'
                        },
                        {
                            title: null,
                            label: 'Recap'
                        }
                    ]
                }
            };

            module(sponsorModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    PlacementMiniReelCtrl = $controller('PlacementMiniReelController', {
                        $scope: $scope
                    });
                    PlacementMiniReelCtrl.initWithModel(minireel);
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $scope = null;
            PlacementMiniReelCtrl = null;
            minireel = null;
        });

        it('should exist', function() {
            expect(PlacementMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the minireel', function() {
                    expect(PlacementMiniReelCtrl.model).toBe(minireel);
                });
            });

            describe('placementOptions', function() {
                it('should be a hash of places where the card can go', function() {
                    expect(PlacementMiniReelCtrl.placementOptions).toEqual({
                        'Before "Cinema6"': 0,
                        'Before "Is"': 1,
                        'Before "Located"': 2,
                        'Before "In"': 3,
                        'Before "Princeton"': 4,
                        'Before "NJ"': 5,
                        'Before Recap': 6
                    });
                });
            });

            describe('placement', function() {
                it('should be 0', function() {
                    expect(PlacementMiniReelCtrl.placement).toBe(0);
                });
            });
        });
    });
});
