define (['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    var copy = angular.copy;

    return angular.module('c6.app.previewMiniReel', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('PreviewMiniReel', ['$location',
            function                                 ( $location ) {
                this.templateUrl = 'views/preview_minireel.html';
                this.controller = 'PreviewMiniReelController';
                this.controllerAs = 'PreviewMiniReelCtrl';

                this.model = function() {
                    return copy($location.search());
                };
            }]);
        }])

        .controller('PreviewMiniReelController', [function() {}])

        .directive('c6Embed', ['$window','$compile',
        function              ( $window , $compile ) {
            var pending = $window.c6.pending || ($window.c6.pending = []);

            function link(scope, $element) {
                scope.$watchCollection('config', function(config) {
                    var id = Math.random().toString(34).slice(2);

                    $element.empty();

                    if (!config) { return; }

                    pending.push(id);

                    $compile([
                        '<script ',
                        Object.keys(config).map(function(attr) {
                            return [attr, config[attr]]
                                .filter(function(item, index) {
                                    return index === 0 || item !== true;
                                })
                                .map(function(item, index) {
                                    return index === 0 ?
                                        ('data-' + item) : ('"' + item + '"');
                                });
                        })
                        .concat([
                            ['id', id],
                            ['src', scope.src]
                        ])
                        .map(function(pairs) {
                            return pairs.join('=');
                        })
                        .join(' '),
                        '></script>'
                    ].join(''))(scope)
                        .appendTo($element);
                });
            }

            return {
                restrict: 'E',
                link: link,
                scope: {
                    config: '=',
                    src: '@'
                }
            };
        }]);
});
