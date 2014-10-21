define(['app', 'jquery'], function(appModule, $) {
    'use strict';

    describe('<c6-dropdown>', function() {
        var $rootScope,
            $compile,
            $scope,
            $dropdown;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
            });

            $scope.options = null;
            $scope.dropdownValue = null;
            $scope.disabled = false;
            $scope.$apply(function() {
                $dropdown = $compile('<c6-dropdown options="options" value="dropdownValue" ng-disabled="disabled">This many: {{value}}.</c6-dropdown>')($scope);
            });
        });

        describe('button label', function() {
            describe('if there are element contents', function() {
                var $label;

                beforeEach(function() {
                    $label = $dropdown.find('.btn__label');
                });

                it('should transclude the label', function() {
                    $scope.$apply(function() {
                        $scope.dropdownValue = 30;
                    });
                    expect($label.text()).toBe('This many: 30.');

                    $scope.$apply(function() {
                        $scope.dropdownValue = 50;
                    });
                    expect($label.text()).toBe('This many: 50.');
                });
            });

            describe('if there are no element contents', function() {
                var $label;

                beforeEach(function() {
                    $scope.dropdownValue = null;
                    $scope.options = null;
                    $scope.$apply(function() {
                        $dropdown = $compile('<c6-dropdown options="options" value="dropdownValue"></c6-dropdown>')($scope);
                    });
                    $scope.$apply(function() {
                        $scope.dropdownValue = 50;
                        $scope.options = {
                            '20 items per page': 20,
                            '50 items per page': 50,
                            '100 items per page': 100
                        };
                    });
                    $label = $dropdown.find('.btn__label');
                });

                it('should take the label of the option', function() {
                    expect($label.text()).toBe('50 items per page');
                });
            });
        });

        describe('options', function() {
            var $options;

            describe('element', function() {
                var $list;

                beforeEach(function() {
                    $list = $dropdown.find('.ui__clickDropMenu');
                });

                it('should be hidden', function() {
                    expect($list.hasClass('ng-hide')).toBe(true);
                });

                describe('when the button is clicked', function() {
                    var $button;

                    beforeEach(function() {
                        $button = $dropdown.find('.ui__clickDrop');

                        $button.click();
                    });

                    it('should be shown', function() {
                        expect($list.hasClass('ng-hide')).toBe(false);
                    });

                    describe('when clicked again', function() {
                        beforeEach(function() {
                            $button.click();
                        });

                        it('should be hidden', function() {
                            expect($list.hasClass('ng-hide')).toBe(true);
                        });
                    });
                });

                describe('if the dropdown is disabled, when clicked', function() {
                    var $button;

                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.disabled = true;
                        });

                        $button = $dropdown.find('button');
                        $button.click();
                    });

                    it('should never show the list of options', function() {
                        expect($list.hasClass('ng-hide')).toBe(true);
                    });

                    describe('if reenabled', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.disabled = false;
                            });
                        });

                        it('should not show the list', function() {
                            expect($list.hasClass('ng-hide')).toBe(true);
                        });
                    });
                });
            });

            describe('as an array', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.options = [20, 50, 100];
                    });
                    $options = $dropdown.find('.ui__clickDropBtn');
                });

                it('should render a list of options', function() {

                    expect($options.length).toBe(3);

                    $scope.options.forEach(function(option, index) {
                        var $option = $($options[index]);

                        expect($option.text()).toEqual(option.toString());
                    });
                });

                describe('clicking', function() {
                    it('should set the value', function() {
                        $scope.options.forEach(function(option, index) {
                            var $option = $($options[index]);

                            $option.click();
                            expect($scope.dropdownValue).toBe(option);
                        });
                    });
                });

                describe('highlight', function() {
                    it('should be applied to the selected item', function() {
                        $scope.options.forEach(function(option, index) {
                            $scope.$apply(function() {
                                $scope.dropdownValue = option;
                            });

                            Array.prototype.slice.call($options).forEach(function(option, elIndex) {
                                var $option = $(option);

                                if (index === elIndex) {
                                    expect($option.hasClass('ui__clickDropBtn--current')).toBe(true);
                                } else {
                                    expect($option.hasClass('ui__clickDropBtn--current')).toBe(false);
                                }
                            });
                        });
                    });
                });
            });

            describe('as an object', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.options = {
                            '20 per page': 20,
                            '50 per page': 50,
                            '100 per page': 100
                        };
                    });
                    $options = $dropdown.find('.ui__clickDropBtn');
                });

                it('should render the list of options', function() {
                    expect($options.length).toBe(3);

                    Object.keys($scope.options).forEach(function(option, index) {
                        var $option = $($options[index]);

                        expect($option.text()).toBe(option);
                    });
                });

                describe('clicking', function() {
                    it('should set the value', function() {
                        Object.keys($scope.options).forEach(function(option, index) {
                            var $option = $($options[index]);

                            $option.click();
                            expect($scope.dropdownValue).toBe($scope.options[option]);
                        });
                    });
                });

                describe('highlight', function() {
                    it('should be applied to the selected item', function() {
                        Object.keys($scope.options).forEach(function(option, index) {
                            $scope.$apply(function() {
                                $scope.dropdownValue = $scope.options[option];
                            });

                            Array.prototype.slice.call($options).forEach(function(option, elIndex) {
                                var $option = $(option);

                                if (index === elIndex) {
                                    expect($option.hasClass('ui__clickDropBtn--current')).toBe(true);
                                } else {
                                    expect($option.hasClass('ui__clickDropBtn--current')).toBe(false);
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});
