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
                SelfieGeotargetingCtrl = $controller('SelfieGeotargetingController', {
                    $scope: $scope,
                    GeoService: GeoService
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
                        geo: {
                            states: [],
                            dmas: []
                        }
                    }
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
            describe('stateOptions', function() {
                it('should contain the U.S. States', function() {
                    expect(SelfieGeotargetingCtrl.stateOptions).toContain({
                        state: 'Alabama', country: 'usa'
                    });

                    expect(SelfieGeotargetingCtrl.stateOptions).toContain({
                        state: 'Arizona', country: 'usa'
                    });
                });
            });

            describe('states', function() {
                it('should be the state(s) from the campaign', function() {
                    expect(SelfieGeotargetingCtrl.states).toEqual([]);

                    campaign.targeting.geo.states.push('Arizona');
                    campaign.targeting.geo.states.push('Alabama');

                    compileCtrl();

                    expect(SelfieGeotargetingCtrl.states).toEqual([
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
            describe('states', function() {
                it('should set the states on the campaign', function() {
                    expect(campaign.targeting.geo.states).toEqual([]);

                    $scope.$apply(function() {
                        SelfieGeotargetingCtrl.states = [ SelfieGeotargetingCtrl.stateOptions[2],  SelfieGeotargetingCtrl.stateOptions[3]];
                    });

                    expect(campaign.targeting.geo.states).toEqual(['Arizona', 'Arkansas']);

                    $scope.$apply(function() {
                        SelfieGeotargetingCtrl.states = [];
                    });

                    expect(campaign.targeting.geo.states).toEqual([]);
                });
            });
        });
    });
});