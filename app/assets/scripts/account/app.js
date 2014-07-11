define( ['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    var copy = angular.copy;

    return angular.module('c6.app.account', [c6State.name])
        .config(['c6StateProvider',
        function(c6StateProvider ) {
            c6StateProvider.state('Account', [function() {
                this.templateUrl = 'views/account/app.html';
                this.controller = 'AccountController';
                this.controllerAs = 'AccountCtrl';

                this.model = function() {
                    return copy(this.cParent.cModel);
                };
            }]);
        }])

        .controller('AccountController', [function() {}]);
});
