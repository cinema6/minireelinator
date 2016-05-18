define(['app','angular'], function(appModule, angular) {
    'use strict';

    describe('c6-indeterminate directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $checkbox;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $checkbox = $compile('<input type="checkbox" c6-indeterminate="value">')($scope);
                });
            });
        });

        afterEach(function() {
            $checkbox.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            $scope = null;
            $checkbox = null;
        });

        describe('when value is "indeterminate"', function() {
            it('add the prop', function() {
                $scope.value = 'indeterminate';
                $scope.$digest();
                expect($checkbox.prop('indeterminate')).toBe(true);
            });
        });

        describe('when value is true', function() {
            it('should remove the property and mark it checked', function() {
                $scope.value = true;
                $scope.$digest();
                expect($checkbox.prop('indeterminate')).toBe(false);
                expect($checkbox.prop('checked')).toBe(true);
            });
        });

        describe('when value is false', function() {
            it('should remove the property and mark it unchecked', function() {
                $scope.value = false;
                $scope.$digest();
                expect($checkbox.prop('indeterminate')).toBe(false);
                expect($checkbox.prop('checked')).toBe(false);
            });
        });
    });
});
