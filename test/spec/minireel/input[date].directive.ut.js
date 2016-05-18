define(['minireel/app', 'jquery'], function(appModule, $) {
    'use strict';

    describe('<input type="date" />', function() {
        var $rootScope,
            $compile,
            $scope,
            $form,
            $input;

        var TzDate;

        function compileForm(_$input) {
            $form = $('<form name="form"></form>');
            $input = _$input;

            $form.append($input);

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                $compile($form)($scope);
            });
        }

        beforeEach(function() {
            module(appModule.name);

            TzDate = angular.mock.TzDate;
            spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(360);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                compileForm($('<input name="date" type="date" ng-model="date" />'));
            });
        });

        afterEach(function() {
            $form.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            $scope = null;
            $form = null;
            $input = null;
            TzDate = null;
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

        describe('if the time attribute is defined', function() {
            it('should properly handle timezone difference from UTC', function() {
                compileForm($('<input name="date" type="date" time="23:59" ng-model="date" />'));

                $input.val('2015-02-05');
                $input.trigger('change');

                expect($scope.date).toEqual(new Date('2015-02-06T05:59:00.000Z'));
                expect($scope.form.date.$error.valid).toBe(false);
            });
        });

        describe('if the time attribute is not defined', function() {
            it('should default to midnight, 00:00, and properly handle timezone difference from UTC', function() {
                compileForm($('<input name="date" type="date" ng-model="date" />'));

                $input.val('2015-02-05');
                $input.trigger('change');

                expect($scope.date).toEqual(new Date('2015-02-05T06:00:00.000Z'));
                expect($scope.form.date.$error.valid).toBe(false);
            });
        });

        describe('when the input value changes', function() {
            beforeEach(function() {
                $input.val('2015-02-05');
                $input.trigger('change');
            });

            it('should data-bind from the input to the model', function() {
                expect($scope.date).toEqual(new Date('2015-02-05T06:00:00.000Z'));
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
                Date.prototype.getTimezoneOffset.and.callThrough();

                $scope.$apply(function() {
                    $scope.date = new TzDate(6,'1990-06-26T05:00:00.000Z');
                });
            });

            it('should update the input and properly handle timezone differnce form UTC', function() {
                expect($input.val()).toBe('1990-06-25');
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
