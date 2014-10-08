define( ['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    return angular.module('c6.app.account.email', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Account:Email', [function() {
                this.templateUrl = 'views/account/email.html';
                this.controller = 'EmailController';
                this.controllerAs = 'EmailCtrl';
            }]);
        }])

        .controller('EmailController', ['$scope','AccountService',
        function                       ( $scope , AccountService ) {
            var AccountCtrl = $scope.AccountCtrl,
                self = this;

            this.email = null;
            this.password = '';
            this.lastMessage = null;
            this.pattern = /^\w+.*\w@\w.*\.\w{2,}$/;
            this.submit = function() {
                this.lastMessage = null;

                return AccountService.changeEmail(
                    AccountCtrl.model.email,
                    this.password,
                    this.email
                ).then(function updateUser() {
                    self.lastMessage = 'Email has been changed.';
                    AccountCtrl.model.email = self.email;
                }).catch(function fail(error) {
                    self.lastMessage = 'Email change failed: ' + error;
                });
            };
        }]);
});
