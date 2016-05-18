define(['app'], function(appModule) {
    'use strict';

    describe('parse-as-int directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $input;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
            });
        });

        afterEach(function() {
            $input.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            $scope = null;
            $input = null;
        });

        it('should convert input value to an integer when setting ng-model value', function() {
            $scope.$apply(function() {
                $input = $compile('<input parse-as-int ng-model="value" type="range">')($scope);
            });

            $scope.$apply(function() {
                $input.val('30');
                $input.trigger('change');
            });

            expect($scope.value).toEqual(30);
        });
    });
});
