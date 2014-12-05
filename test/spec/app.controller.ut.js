define(['app', 'version'], function(appModule, version) {
    'use strict';

    describe('AppController', function() {
        var $rootScope,
            $controller,
            $scope,
            AppCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    AppCtrl = $controller('AppController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(AppCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('version', function() {
                it('should be the version in the version module', function() {
                    expect(AppCtrl.version).toBe(version);
                });
            });
        });
    });
});
