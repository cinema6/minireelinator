define( ['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    return angular.module('c6.app.account.password', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Account:Password', [function() {
                this.templateUrl = 'views/account/password.html';
                this.controller = 'PasswordController';
                this.controllerAs = 'PasswordCtrl';
            }]);
        }])

        .controller('PasswordController', ['$scope','AccountService',
        function                          ( $scope , AccountService ) {
            var AccountCtrl = $scope.AccountCtrl,
                self = this;

            function passwords() {
                return [null, null, null];
            }

            this.pattern = /(^\S+$)()/;
            this.lastMessage = null;
            this.passwords = passwords();

            this.submit = function() {
                this.lastMessage = null;

                return AccountService.changePassword(
                    AccountCtrl.model.email,
                    this.passwords[0],
                    this.passwords[1]
                ).then(function success() {
                    self.lastMessage = 'Password has been changed.';
                }).catch(function failure(error) {
                    self.lastMessage = 'Password change failed: ' + error;
                }).finally(function cleanup() {
                    self.passwords = passwords();
                });
            };
        }]);
});
