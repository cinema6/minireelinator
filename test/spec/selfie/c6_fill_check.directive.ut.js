define(['app'], function(appModule) {
    'use strict';

    describe('c6-fill-check directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $timeout,
            $input;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $timeout = $injector.get('$timeout');

                $scope = $rootScope.$new();
            });
        });

        describe('when an input element has a value', function() {
            it('should add a class', function() {
                $scope.value = 'Filling in the input';
                $scope.$apply(function() {
                    $input = $compile('<input c6-fill-check ng-model="value" type="text">')($scope);
                });

                $timeout.flush();

                expect($input.hasClass('form__fillCheck--filled')).toBe(true);
            });
        });

        describe('when an input is empty', function() {
            beforeEach(function() {
                $scope.$apply(function() {
                    $input = $compile('<input c6-fill-check ng-model="value" type="text">')($scope);
                });

                $timeout.flush();
            });

            it('should not add the class', function() {
                expect($input.hasClass('form__fillCheck--filled')).toBe(false);
            });

            describe('when a value is added', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $input.val('Filled in!');
                        $input.trigger('change');
                    });
                });

                it('should add the class', function() {
                    expect($input.hasClass('form__fillCheck--filled')).toBe(true);
                });

                describe('when a value is removed', function() {
                    it('should remove the class', function() {
                        $scope.$apply(function() {
                            $input.val('');
                            $input.trigger('change');
                        });

                        expect($input.hasClass('form__fillCheck--filled')).toBe(false);
                    });
                });
            });

            describe('when the model is updated programmatically', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.value = 'Model Changed';
                    });
                });

                it('should add the class', function() {
                    expect($input.hasClass('form__fillCheck--filled')).toBe(true);
                });

                describe('when a value is removed', function() {
                    it('should remove the class', function() {
                        $scope.$apply(function() {
                            $scope.value = '';
                        });

                        expect($input.hasClass('form__fillCheck--filled')).toBe(false);
                    });
                });
            });
        });
    });
});