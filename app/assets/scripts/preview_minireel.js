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

        .controller('PreviewMiniReelController', [function() {}]);
});
