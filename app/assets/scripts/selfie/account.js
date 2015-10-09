define( ['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    return angular.module('c6.app.selfie.account', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Login', [function() {
                this.templateUrl = 'views/selfie/login.html';
                this.controller = 'LoginController';
                this.controllerAs = 'LoginCtrl';

                this.queryParams = {
                    reason: '&'
                };

                this.model = function() {
                    return {
                        email: '',
                        password: ''
                    };
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:ForgotPassword', [function() {
                this.templateUrl = 'views/selfie/forgot_password.html';
                this.controller = 'ForgotPasswordController';
                this.controllerAs = 'ForgotPasswordCtrl';

                this.model = function() {
                    return {
                        email: '',
                        target: 'selfie'
                    };
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:ResetPassword', [function() {
                this.templateUrl = 'views/selfie/reset_password.html';
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

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:SignUp', [function() {
                this.templateUrl = 'views/selfie/sign_up.html';
                this.controller = 'SelfieSignUpController';
                this.controllerAs = 'SelfieSignUpCtrl';

                this.model = function() {
                    return {
                        email: '',
                        password: '',
                        company: '',
                        firstName: '',
                        lastName: ''
                    };
                };
            }]);
        }])

        .controller('SelfieSignUpController', ['AccountService','c6State',
        function                              ( AccountService , c6State ) {
            var SelfieSignUpCtrl = this;

            this.errors = {};

            this.submit = function() {
                var requiredProps = [
                        'firstName','lastName','company','email','password'
                    ].filter(function(prop) {
                        SelfieSignUpCtrl.errors[prop] = !SelfieSignUpCtrl.model[prop];
                        return SelfieSignUpCtrl.errors[prop];
                    });

                if (requiredProps.length) { return; }

                AccountService.signUp(this.model)
                    .then(function(user) {
                        c6State.goTo('Selfie:SignUpSuccess',[user]);
                    })
                    .catch(function(err) {
                        // failure, we should tell the user why
                        // and highlight bad fields
                        SelfieSignUpCtrl.message = 'Failed, ' + err;
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:SignUpSuccess', [function() {
                this.templateUrl = 'views/selfie/sign_up_success.html';
                this.controller = 'GenericController';
                this.controllerAs = 'SelfieSignUpSuccessCtrl';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:ResendActivation', [function() {
                this.templateUrl = 'views/selfie/resend_activation.html';
                this.controller = 'SelfieResendActivationController';
                this.controllerAs = 'SelfieResendActivationCtrl';
            }]);
        }])

        .controller('SelfieResendActivationController', ['c6State','AuthService','AccountService',
        function                                        ( c6State , AuthService , AccountService) {
            var SelfieResendActivationCtrl = this;
            this.resend = function() {
                return AccountService.resendActivation()
                    .then(function() {
                        // probably want to put a success message on the Ctrl
                        // and tell the user to check their email
                        SelfieResendActivationCtrl.model = 'We have sent you an email with ' +
                            'a new confirmation link!';
                    })
                    .catch(function() {
                        SelfieResendActivationCtrl.model = 'There was a problem resending ' +
                            'a new activation link';
                    });
            };

            this.logout = function() {
                return AuthService.logout()
                    .then(function transition() {
                        return c6State.goTo('Selfie:Login', null, {});
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:ConfirmAccount', ['$location','c6State',
                                                            'AccountService',
            function                                       ( $location , c6State ,
                                                             AccountService ) {
                var id = $location.search().userId,
                    token = $location.search().token;

                this.model = function() {
                    return AccountService.confirmUser(id, token)
                        .catch(function() {
                            // if the confirmation fails go to Login page with message
                            // telling the user that confirmation has failed, but that
                            // they can login and resend an activation link
                            c6State.goTo('Selfie:Login', null, {reason:0});
                        });
                };

                this.enter = function() {
                    // confirmation was a success, so being them to login screen
                    // for initial login.
                    return c6State.goTo('Selfie:Login', null, {reason:1});
                };
            }]);
        }]);
});