define( ['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    var extend = angular.extend;

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
            c6StateProvider.state('Selfie:ConfirmAccount', ['$location','c6State','cinema6',
                                                            'AccountService','$q',
            function                                       ( $location , c6State , cinema6 ,
                                                             AccountService , $q ) {
                var id = $location.search().id,
                    token = $location.search().token;

                this.model = function() {
                    return AccountService.confirmUser(id, token)
                        .then(function(user) {
                            return $q.all({
                                user: user,
                                org: cinema6.db.find('org', user.org),
                                advertiser: cinema6.db.find('advertiser', user.advertiser),
                                customer: cinema6.db.find('customer', user.customer)
                            });
                        })
                        .then(function(decoration) {
                            var user = decoration.user;
                            user.org = decoration.org;
                            user.advertiser = decoration.advertiser;
                            user.customer = decoration.customer;

                            return cinema6.db.push('user', user.id, user);
                        })
                        .then(function(user) {
                            c6State.goTo('Selfie', [user]);
                            return user;
                        })
                        .catch(function() {
                            // if the confirmation fails go to Login page with message
                            // telling the user that confirmation has failed, but that
                            // they can login and resend an activation link
                            c6State.goTo('Selfie:Login', null, {reason:1});

                            return $q.reject();
                        });
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account', ['c6State',
            function                                ( c6State ) {
                this.templateUrl = 'views/selfie/account.html';
                this.controller = 'GenericController';
                // need 'AccoutnCtrl' for the existing Ctrls to work
                this.controllerAs = 'AccountCtrl';

                this.model = function() {
                    return c6State.get('Selfie').cModel;
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:Account:Overview');
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Overview', [function() {
                this.templateUrl = 'views/selfie/account/overview.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Email', [function() {
                this.templateUrl = 'views/selfie/account/email.html';
                this.controller = 'EmailController';
                this.controllerAs = 'EmailCtrl';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Password', [function() {
                this.templateUrl = 'views/selfie/account/password.html';
                this.controller = 'PasswordController';
                this.controllerAs = 'PasswordCtrl';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Details', [function() {
                this.templateUrl = 'views/selfie/account/details.html';
                this.controller = 'SelfieAccountDetailsController';
                this.controllerAs = 'SelfieAccountDetailsCtrl';
            }]);
        }])

        .controller('SelfieAccountDetailsController', ['cState',
        function                                      ( cState ) {
            var user = cState.cParent.cModel,
                SelfieAccountDetailsCtrl = this;

            this.message = null;

            this.save = function() {
                user.save().then(function() {
                    SelfieAccountDetailsCtrl.message = 'Successfully updated your details!';
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Payment', ['cinema6','PaymentService',
            function                                        ( cinema6 , PaymentService ) {
                var SelfieAccountPaymentState = this;

                this.templateUrl = 'views/selfie/account/payment.html';
                this.controller = 'SelfieAccountPaymentController';
                this.controllerAs = 'SelfieAccountPaymentCtrl';

                this.model = function() {
                    return cinema6.db.findAll('paymentMethod');
                };

                this.afterModel = function() {
                    return PaymentService.getToken()
                        .then(function(token) {
                            // this token is for the paypal button that needs to be initialized
                            // with braintree as soon as the page is page loaded. Nothing needs
                            // to be initialized yet for Credit Card UI, that happens when a user
                            // "edits" or "adds" a credit card payment method
                            SelfieAccountPaymentState.token = token;
                        });
                };
            }]);
        }])

        .controller('SelfieAccountPaymentController', ['c6State','cinema6','cState','$scope',
        function                                      ( c6State , cinema6 , cState , $scope ) {
            var SelfieAccountPaymentCtrl = this;

            function refreshModel() {
                cinema6.db.findAll('paymentMethod')
                    .then(function(methods) {
                        SelfieAccountPaymentCtrl.model = methods;
                    });
            }

            this.initWithModel = function(model) {
                this.model = model;
                this.token = cState.token;
            };

            this.makeDefault = function(method) {
                method.makeDefault = true;
                method.cardholderName = undefined;

                method.save().then(refreshModel);
            };

            this.edit = function(method) {
                c6State.goTo('Selfie:Account:Payment:Edit', [method]);
            };

            this.delete = function(method) {
                method.erase().then(refreshModel);
            };

            this.paypalSuccess = function(method) {
                var paypalMethod = cinema6.db.create('paymentMethod', {
                    paymentMethodNonce: method.nonce
                });

                paypalMethod.save().then(refreshModel);
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Payment:New', ['cinema6','PaymentService',
            function                                            ( cinema6 , PaymentService ) {
                var SelfieAccountPaymentNewState = this;

                this.templateUrl = 'views/selfie/account/payment/new.html';
                this.controller = 'SelfieAccountPaymentNewController';
                this.controllerAs = 'SelfieAccountPaymentNewCtrl';

                this.model = function() {
                    return cinema6.db.create('paymentMethod', {
                        paymentMethodNonce: null,
                        cardholderName: null,
                        makeDefault: false
                    });
                };

                this.afterModel = function() {
                    return PaymentService.getToken()
                        .then(function(token) {
                            SelfieAccountPaymentNewState.token = token;
                        });
                };
            }]);
        }])

        .controller('SelfieAccountPaymentNewController', ['c6State','cinema6','cState','$scope',
        function                                         ( c6State , cinema6 , cState , $scope ) {
            var SelfieAccountPaymentCtrl = $scope.SelfieAccountPaymentCtrl,
                paymentMethods = SelfieAccountPaymentCtrl.model;

            this.initWithModel = function(model) {
                this.model = model;
                this.token = cState.token;
            };

            this.success = function(method) {
                extend(this.model, {
                    cardholderName: method.cardholderName,
                    paymentMethodNonce: method.nonce,
                    makeDefault: method.makeDefault
                });

                this.model.save()
                    .then(function(method) {
                        if (paymentMethods.indexOf(method) < 0) {
                            paymentMethods.unshift(method);
                        }

                        // after a new Primary method is added we aren't seeing
                        // the old one update when transitioning back to the Payment list.
                        // Somehow we need to get the list to refresh!
                        return c6State.goTo('Selfie:Account:Payment');
                    });
            };

            this.cancel = function() {
                return c6State.goTo('Selfie:Account:Payment');
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Payment:Edit', ['cinema6','c6State','PaymentService','$q',
            function                                             ( cinema6 , c6State , PaymentService , $q ) {
                var SelfieAccountPaymentEditState = this;

                this.templateUrl = 'views/selfie/account/payment/edit.html';
                this.controller = 'SelfieAccountPaymentEditController';
                this.controllerAs = 'SelfieAccountPaymentEditCtrl';

                this.model = function(params) {
                    var allMethods = this.cParent.cModel;

                    return allMethods.filter(function(method) {
                        return method.id === params.id;
                    })[0] || $q.reject();
                };

                this.afterModel = function() {
                    return PaymentService.getToken()
                        .then(function(token) {
                            SelfieAccountPaymentEditState.token = token;
                        });
                };
            }]);
        }])

        .controller('SelfieAccountPaymentEditController', ['c6State','cinema6','cState','$scope',
        function                                          ( c6State , cinema6 , cState , $scope ) {
            this.initWithModel = function(model) {
                this.model = model;
                this.token = cState.token;
            };

            this.success = function(method) {
                extend(this.model, {
                    cardholderName: method.cardholderName,
                    paymentMethodNonce: method.nonce,
                    makeDefault: method.makeDefault
                });

                this.model.save()
                    .then(function(method) {
                        return c6State.goTo('Selfie:Account:Payment');
                    });
            };

            this.cancel = function() {
                return c6State.goTo('Selfie:Account:Payment');
            };
        }]);
});