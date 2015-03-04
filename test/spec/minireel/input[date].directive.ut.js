define(['minireel/app', 'jquery'], function(appModule, $) {
    'use strict';

    describe('<input type="date" />', function() {
        var $rootScope,
            $compile,
            $scope,
            $form,
            $input;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $form = $('<form name="form"></form>');
                $input = $('<input name="date" type="date" ng-model="date" />');

                $form.append($input);

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $compile($form)($scope);
                });
            });
        });

        it('should not apply to inputs of other types', function() {
            $scope.$apply(function() {
                $input = $compile('<input name="date" type="text" ng-model="foo" />')($scope);
            });
            $input.val('bar');
            $input.trigger('change');
            expect($scope.foo).toBe('bar');
        });

        it('should not break if no ng-model is specified', function() {
            expect(function() {
                $scope.$apply(function() {
                    $input = $compile('<input name="date" type="date" />')($scope);
                });
            });
        });

        describe('when the input value changes', function() {
            beforeEach(function() {
                $input.val('2015-02-05');
                $input.trigger('change');
            });

            it('should data-bind from the input to the model', function() {
                expect($scope.date).toEqual(new Date('2015-02-05'));
                expect($scope.form.date.$error.valid).toBe(false);
            });

            describe('if the field is empty', function() {
                beforeEach(function() {
                    $input.val('');
                    $input.trigger('change');
                });

                it('should make the prop null', function() {
                    expect($scope.date).toBeNull();
                });

                it('should not mark the date as invalid', function() {
                    expect($scope.form.date.$error.valid).toBe(false);
                });
            });

            describe('if an invalid string is supplied', function() {
                beforeEach(function() {
                    $input.val('201');
                    $input.trigger('change');
                });

                it('should be undefined', function() {
                    expect($scope.date).toBeUndefined();
                });

                it('should set an error', function() {
                    expect($scope.form.date.$error.valid).toBe(true);
                });
            });

            describe('if an invalid date is supplied', function() {
                beforeEach(function() {
                    $input.val('2015-13-02');
                    $input.trigger('change');
                });

                it('should be undefined', function() {
                    expect($scope.date).toBeUndefined();
                });

                it('should set an error', function() {
                    expect($scope.form.date.$error.valid).toBe(true);
                });
            });
        });

        describe('when the model changes', function() {
            beforeEach(function() {
                $scope.$apply(function() {
                    $scope.date = new Date('2013-03-14');
                });
            });

            it('should update the input', function() {
                expect($input.val()).toBe('2013-03-14');
            });

            describe('if changed to something falsy', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.date = null;
                    });
                });

                it('should clear the input', function() {
                    expect($input.val()).toBe('');
                });
            });

            describe('if changed to an invalid date', function() {
                it('should throw an error', function() {
                    var date = new Date('8923hrf4');

                    expect(function() {
                        $scope.$apply(function() {
                            $scope.date = date;
                        });
                    }).toThrow(new Error('[' + date + '] is not a valid Date.'));
                });
            });

            describe('if changed to somethy truthy that is not a date', function() {
                it('should throw an error', function() {
                    expect(function() {
                        $scope.$apply(function() {
                            $scope.date = 'foo';
                        });
                    }).toThrow(new Error('[foo] is not a valid Date.'));
                });
            });
        });
    });
});
