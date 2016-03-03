define(['app'], function(appModule) {
    'use strict';

    describe('range-slider directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $input,
            $timeout;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $timeout = $injector.get('$timeout');

                $scope = $rootScope.$new();
            });
        });

        describe('when max is greater than 100', function() {
            it('should properly set the value in UI', function() {
                $scope.value = 130;
                $scope.max = 130;

                $scope.$apply(function() {
                    $input = $compile('<input range-slider ng-model="value" type="range" min="10" max="{{max}}">')($scope);
                });

                // angular bug where the value is defaulted before the max is set
                expect($input.val()).toEqual('100');

                $timeout.flush();

                expect($input.val()).toEqual('130');
            });
        });

        describe('when max is less than 100', function() {
            it('will be properly set already', function() {
                $scope.value = 30;
                $scope.max = 30;

                $scope.$apply(function() {
                    $input = $compile('<input range-slider ng-model="value" type="range" min="10" max="{{max}}">')($scope);
                });

                expect($input.val()).toEqual('30');

                $timeout.flush();

                expect($input.val()).toEqual('30');
            });
        });
    });
});