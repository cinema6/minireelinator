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

        describe('when check-view is defined', function() {
            it('should add the class if model is falsy but view is truthy', function() {
                // This occurs when input is invalid. Angular sets ng-model to undefined until it's valid
                // so adding the "filled" class based on checking ng-model will fail.

                $scope.$apply(function() {
                    $input = $compile('<input c6-fill-check check-view="true" ng-model="value" type="email">')($scope);
                });

                $input.val('F');
                $input.trigger('change');

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

            describe('when the model is updated programmatically and value is 0', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.value = 0;
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