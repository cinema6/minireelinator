define(['app'], function(appModule) {
    'use strict';

    describe('blur-validate directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $fieldset;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $fieldset = $compile('<fieldset blur-validate="my-input"><input id="my-input">')($scope);
                });
            });
        });

        describe('before the input comes into focus', function() {
            it('should not have the "ui--hasError" class', function() {
                expect($fieldset.hasClass('ui--hasError')).toBe(false);
            });
        });

        describe('when the input is in focus', function() {
            it('should not have the "ui--hasError" class', function() {
                var $input = $fieldset.find('#my-input');

                $scope.$apply(function() {
                    $input.focus();
                });

                expect($fieldset.hasClass('ui--hasError')).toBe(false);
            });
        });

        describe('when the input loses focus and has not value in it', function() {
            it('should add the "ui--hasError" class', function() {
                var $input = $fieldset.find('#my-input');

                $scope.$apply(function() {
                    $input.focus();
                });

                $scope.$apply(function() {
                    $input.blur();
                });

                expect($fieldset.hasClass('ui--hasError')).toBe(true);
            });
        });

        describe('when the input loses focus and has not value in it', function() {
            it('should add the "ui--hasError" class', function() {
                var $input = $fieldset.find('#my-input');

                $scope.$apply(function() {
                    $input.focus();
                    $input.val('something');
                });

                $scope.$apply(function() {
                    $input.blur();
                });

                expect($fieldset.hasClass('ui--hasError')).toBe(false);
            });
        });
    });
});