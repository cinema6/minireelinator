define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.app.minireel.campaign', [])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaigns', [function() {

            }]);
        }]);
});
