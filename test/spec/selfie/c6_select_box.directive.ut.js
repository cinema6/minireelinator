define(['app','angular','select2'], function(appModule, angular) {
    'use strict';

    describe('c6-select-box directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $timeout,
            $select,
            $;

        var options;

        beforeEach(function() {
            module(appModule.name);

            $ = angular.element;
            spyOn($.fn, 'select2');

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $timeout = $injector.get('$timeout');

                $scope = $rootScope.$new();

                options = [
                    {
                        label: 'Option Name',
                        src: '/image.jpg'
                    },
                    {
                        label: 'Another',
                        src: '/another.jpg'
                    }
                ];

                $scope.options = options;
                $scope.chosen = null;
            });
        });

        afterEach(function() {
            $select.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            $scope = null;
            $timeout = null;
            $select = null;
            $ = null;
        });

        describe('initiating select2 jquery plugin', function() {
            it('should call the select2 method', function() {
                $scope.$apply(function() {
                    $select = $compile('<select c6-select-box data-options="options" ng-model="chosen">')($scope);
                });

                $timeout.flush();

                expect($select.select2).toHaveBeenCalledWith(jasmine.objectContaining({minimumResultsForSearch: Infinity}));
            });

            it('should pass a configuration object if defined', function() {
                $scope.$apply(function() {
                    $select = $compile('<select c6-select-box data-options="options" config="{property1:\'value1\'}" ng-model="chosen">')($scope);
                });

                $timeout.flush();

                expect($select.select2).toHaveBeenCalledWith(jasmine.objectContaining({
                    property1: 'value1',
                    minimumResultsForSearch: Infinity
                }));
            });

            describe('when options contain thumbnails', function() {
                it('should add a method to the config for creating custom options with images', function() {
                    var formatFn, $option1, $option2;

                    $scope.$apply(function() {
                        $select = $compile('<select c6-select-box data-options="options" thumbnails="true" ng-model="chosen">')($scope);
                    });

                    $timeout.flush();

                    formatFn = $select.select2.calls.mostRecent().args[0].templateResult;
                    $option1 = formatFn({text:'Option Name'});
                    $option2 = formatFn({text:'Another'});

                    expect($option1.prop('outerHTML')).toEqual('<span><img src="/image.jpg"> Option Name</span>');
                    expect($option2.prop('outerHTML')).toEqual('<span><img src="/another.jpg"> Another</span>');
                });
            });

            describe('when "preselected" attribute is present', function() {
                it('should add the "filled" class', function() {
                    $scope.$apply(function() {
                        $select = $compile('<select c6-select-box data-options="options" preselected="true" ng-model="chosen">')($scope);
                    });

                    $timeout.flush();

                    expect($select.hasClass('form__fillCheck--filled')).toBe(true);
                });
            });

            describe('when an item is pre-selected', function() {
                beforeEach(function() {
                    $scope.chosen = $scope.options[0];
                });

                it('should add the "filled" class', function() {
                    $scope.$apply(function() {
                        $select = $compile('<select c6-select-box data-options="options" ng-options="option.label for option in options" ng-model="chosen">')($scope);
                    });

                    $timeout.flush();

                    expect($select.hasClass('form__fillCheck--filled')).toBe(true);
                });

                describe('when the "unselect-default" attribute is present', function() {
                    it('should not add the "filled" class', function() {
                        $scope.$apply(function() {
                            $select = $compile('<select c6-select-box data-options="options" unselect-default="true" ng-options="option.label for option in options" ng-model="chosen">')($scope);
                        });

                        $timeout.flush();

                        expect($select.hasClass('form__fillCheck--filled')).toBe(false);
                    });
                });
            });

            describe('opening the select dropdown', function() {
                it('should add the "filled" and "active" class', function() {
                    $scope.$apply(function() {
                        $select = $compile('<select c6-select-box unselect-default="true" data-options="options" ng-model="chosen" ng-options="option.label for option in options">')($scope);
                    });

                    $timeout.flush();

                    expect($select.hasClass('form__fillCheck--filled')).toBe(false);
                    expect($select.hasClass('ui--active')).toBe(false);

                    $select.trigger('select2:open');

                    expect($select.hasClass('form__fillCheck--filled')).toBe(true);
                    expect($select.hasClass('ui--active')).toBe(true);
                });
            });

            describe('closing the dropdown', function() {
                it('should remove the "active" class', function() {
                    $scope.$apply(function() {
                        $select = $compile('<select c6-select-box data-options="options" ng-model="chosen">')($scope);
                    });

                    $timeout.flush();

                    $select.trigger('select2:open');
                    expect($select.hasClass('ui--active')).toBe(true);

                    $select.trigger('select2:close');
                    expect($select.hasClass('ui--active')).toBe(false);
                });

                describe('when there is no value', function() {
                    it('should remove the "filled" class', function() {
                        $scope.$apply(function() {
                            $select = $compile('<select c6-select-box data-options="options" ng-model="chosen" ng-options="option.label for option in options">')($scope);
                        });

                        $timeout.flush();

                        $select.trigger('select2:open');

                        expect($select.hasClass('form__fillCheck--filled')).toBe(true);

                        $select.trigger('select2:close');

                        expect($select.hasClass('form__fillCheck--filled')).toBe(false);
                    });
                });

                describe('when it should hide the default option and the default option is chosen', function() {
                    it('should remove the "filled" class', function() {
                        $scope.chosen = $scope.options[0];

                        $scope.$apply(function() {
                            $select = $compile('<select c6-select-box data-options="options" unselect-default="true" ng-options="option.label for option in options" ng-model="chosen">')($scope);
                        });

                        $timeout.flush();

                        $select.trigger('select2:open');

                        expect($select.hasClass('form__fillCheck--filled')).toBe(true);

                        $select.trigger('select2:close');

                        expect($select.hasClass('form__fillCheck--filled')).toBe(false);
                    });
                });

                describe('when a selection has been made', function() {
                    it('should not remove the "filled" class', function() {
                        $scope.chosen = null;

                        $scope.$apply(function() {
                            $select = $compile('<select c6-select-box data-options="options" ng-options="option.label for option in options" ng-model="chosen">')($scope);
                        });

                        $timeout.flush();

                        expect($select.hasClass('form__fillCheck--filled')).toBe(false);

                        $select.trigger('select2:open');

                        expect($select.hasClass('form__fillCheck--filled')).toBe(true);

                        $scope.$apply(function() {
                            $scope.chosen = $scope.options[1];
                        });

                        $select.trigger('select2:close');

                        expect($select.hasClass('form__fillCheck--filled')).toBe(true);
                    });
                });
            });

            describe('when the selection (ie. model) changes programmatically', function() {
                it('should re-render the dropdown', function() {
                    $scope.$apply(function() {
                        $select = $compile('<select c6-select-box data-options="options" ng-model="chosen" ng-options="option.label for option in options">')($scope);
                    });


                    $timeout.flush();

                    $select.select2.calls.reset();

                    $scope.$apply(function() {
                        $scope.chosen = options[1];
                    });

                    $timeout.flush();

                    expect($select.select2).toHaveBeenCalledWith(jasmine.objectContaining({minimumResultsForSearch: Infinity}));
                });
            });

            describe('when the selection (ie. model) changes programmatically', function() {

            });
        });
    });
});
