define (['angular','c6ui','templates'],
function( angular , c6ui , templates ) {
    'use strict';

    var isArray = angular.isArray;

    return angular.module('c6.app.ui', [templates.name, c6ui.name])
        .directive('c6Dropdown', ['c6Computed','$compile',
        function                 ( c6Computed , $compile ) {
            function link(scope, $element, attrs, Controller, transclude) {
                var c = c6Computed(scope),
                    $transcludeTarget = $element.find('c6-transclude');

                scope.showDropDown = false;
                c(scope, 'list', function() {
                    return this.options ? ((isArray(this.options) ?
                        this.options.map(function(option) {
                            return [option, option];
                        }) :
                        Object.keys(scope.options).map(function(label) {
                            return [label, this[label]];
                        }, scope.options))) : [];
                }, ['options']);
                Object.defineProperty(scope, 'label', {
                    get: function() {
                        var value = this.value;

                        return this.list.reduce(function(label, option) {
                            return option[1] === value ? option[0] : label;
                        }, null);
                    }
                });

                scope.setValue = function(value) {
                    scope.value = value;
                };

                transclude(scope, function($clone) {
                    var $label = $clone.text() ?
                        $clone : $compile('<span>{{label}}</span>')(scope);

                    $transcludeTarget.append($label);
                });
            }

            return {
                scope: {
                    value: '=',
                    options: '='
                },
                restrict: 'E',
                templateUrl: 'views/directives/c6_dropdown.html',
                link: link,
                transclude: true
            };
        }]);
});
