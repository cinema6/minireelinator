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
                        email: '',
                        target: 'portal'
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

                return AuthService.requestPasswordReset(this.model.email, this.model.target)
                    .then(function onSuccess(message) {
                        self.wasSuccessful = true;
                        return message;
                    })
                    .catch(function onError(error) {
                        self.wasSuccessful = false;
                        return $q.reject(self.errorMessage = error);
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('ResetPassword', [function() {
                this.templateUrl = 'views/reset_password.html';
                this.controller = 'ResetPasswordController';
                this.controllerAs = 'ResetPasswordCtrl';

                this.queryParams = {
                    userId: '&id',
                    token: '&'
                };

                this.model = function() {
                    return {
                        passwords: [null, null]
                    };
                };
            }]);
        }])

        .controller('ResetPasswordController', ['AuthService','c6State','$q',
        function                               ( AuthService , c6State , $q ) {
            var self = this,
                ApplicationState = c6State.get('Application');

            // Set by c6State via query parameters
            this.userId = null;
            this.token = null;

            this.pattern = /(^\S+$)()/;
            this.errorMessage = null;

            this.submit = function() {
                this.errorMessage = null;

                return AuthService.resetPassword(this.userId, this.token, this.model.passwords[0])
                    .then(function proceed(user) {
                        c6State.goTo(ApplicationState.name, [user], null, true);
                        return user;
                    })
                    .catch(function onError(error) {
                        return $q.reject(self.errorMessage = error);
                    });
            };
        }]);
});
