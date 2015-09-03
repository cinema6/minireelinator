define(['app'], function(appModule) {
    'use strict';

    describe('SelfieGeotargetingController', function() {
        var $rootScope,
            $scope,
            $controller,
            GeoService,
            SelfieGeotargetingCtrl;

        var campaign;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieGeotargetingCtrl = $controller('SelfieGeotargetingController', { $scope: $scope, GeoService: GeoService });
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

                GeoService = {
                    usa: [
                        'Alabama',
                        'Alaska',
                        'Arizona',
                        'Arkansas'
                    ]
                };

                $scope = $rootScope.$new();
                $scope.campaign = campaign;
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieGeotargetingCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('geoOptions', function() {
                it('should contain the U.S. States', function() {
                    expect(SelfieGeotargetingCtrl.geoOptions).toContain({
                        state: 'Alabama', country: 'usa'
                    });

                    expect(SelfieGeotargetingCtrl.geoOptions).toContain({
                        state: 'Arizona', country: 'usa'
                    });
                });
            });

            describe('geo', function() {
                it('should be the state(s) from the campaign', function() {
                    expect(SelfieGeotargetingCtrl.geo).toEqual([]);

                    campaign.geoTargeting.push({state: 'Arizona'});
                    campaign.geoTargeting.push({state: 'Alabama'});

                    compileCtrl();

                    expect(SelfieGeotargetingCtrl.geo).toEqual([
                        {
                            state: 'Alabama', country: 'usa'
                        },
                        {
                            state: 'Arizona', country: 'usa'
                        }
                    ]);
                });
            });
        });

        describe('$watchers', function() {
            describe('geo', function() {
                it('should set the geoTargeting on the campaign', function() {
                    expect(campaign.geoTargeting).toEqual([]);

                    $scope.$apply(function() {
                        SelfieGeotargetingCtrl.geo = [ SelfieGeotargetingCtrl.geoOptions[2],  SelfieGeotargetingCtrl.geoOptions[3]];
                    });

                    expect(campaign.geoTargeting).toEqual([{ state: 'Arizona' }, { state: 'Arkansas' }]);

                    $scope.$apply(function() {
                        SelfieGeotargetingCtrl.geo = [];
                    });

                    expect(campaign.geoTargeting).toEqual([]);
                });
            });
        });
    });
});