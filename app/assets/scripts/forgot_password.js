define( ['angular','login','c6_state'],
function( angular , login , c6State  ) {
    'use strict';

    return angular.module('c6.app.forgotPassword', [login.name, c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('ForgotPassword', [function() {
                this.templateUrl = 'views/forgot_password.html';
                this.controller = 'ForgotPasswordController';
                this.controllerAs = 'ForgotPasswordCtrl';

                this.model = function() {
                    return {
                        email: ''
                    };
                };
            }]);
        }])

        .controller('ForgotPasswordController', ['AuthService','$q',
        function                                ( AuthService , $q ) {
            var self = this;

            function nullify(object, props) {
                props.forEach(function(prop) {
                    object[prop] = null;
                });

                return object;
            }

            this.wasSuccessful = null;
            this.errorMessage = null;

            this.submit = function() {
                nullify(this, ['wasSuccessful', 'errorMessage']);

                return AuthService.requestPasswordReset(this.model.email)
                    .then(function onSuccess(message) {
                        self.wasSuccessful = true;
                        return message;
                    })
                    .catch(function onError(error) {
                        self.wasSuccessful = false;
                        return $q.reject(self.errorMessage = error);
                    });
            };
        }]);
});
