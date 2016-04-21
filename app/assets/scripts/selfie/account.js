define( ['angular','c6_state','../minireel/mixins/PaginatedListState',
         '../minireel/mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState                    ,
          PaginatedListController ) {
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
                    redirectTo: '&',
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
            c6StateProvider.state('Selfie:SignUp', ['$location','SettingsService',
            function                               ( $location , SettingsService ) {
                this.templateUrl = 'views/selfie/sign_up.html';
                this.controller = 'SelfieSignUpController';
                this.controllerAs = 'SelfieSignUpCtrl';

                this.beforeModel = function() {
                    var referral = $location.search().ref,
                        promotion = $location.search().promotion;

                    SettingsService.register('Selfie::referral', { referral: referral }, {
                        localSync: referral || true,
                        validateLocal: function(local) {
                            return local === true;
                        }
                    });

                    SettingsService.register('Selfie::promotion', { promotion: promotion }, {
                        localSync: promotion || true,
                        validateLocal: function(local) {
                            return local === true;
                        }
                    });
                };

                this.model = function() {
                    var ref = SettingsService.getReadOnly('Selfie::referral').referral,
                        promotion = SettingsService.getReadOnly('Selfie::promotion').promotion;

                    return {
                        email: '',
                        password: '',
                        company: '',
                        firstName: '',
                        lastName: '',
                        referralCode: ref,
                        promotion: promotion
                    };
                };
            }]);
        }])

        .controller('SelfieSignUpController', ['AccountService','c6State','cState',
        function                              ( AccountService , c6State , cState ) {
            var SelfieSignUpCtrl = this;

            this.formOnly = (/Form/).test(cState.cName);
            this.errors = {
                show: false
            };

            this.submit = function() {
                var requiredProps = [
                        'firstName','lastName','company','email','password'
                    ].filter(function(prop) {
                        SelfieSignUpCtrl.errors[prop] = !SelfieSignUpCtrl.model[prop];
                        return SelfieSignUpCtrl.errors[prop];
                    });

                if (requiredProps.length) {
                    SelfieSignUpCtrl.errors.show = true;
                    return;
                }

                SelfieSignUpCtrl.errors.show = false;

                AccountService.signUp(this.model)
                    .then(function(user) {
                        c6State.goTo((SelfieSignUpCtrl.formOnly ?
                            'Selfie:SignUpSuccess:Frame' :
                            'Selfie:SignUpSuccess:Full'),
                            [user]
                        );
                    })
                    .catch(function(err) {
                        // failure, we should tell the user why
                        // and highlight bad fields
                        SelfieSignUpCtrl.message = 'There was a problem, ' + err;
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
                                                         'intercom',
        function                                        ( c6State , AuthService , AccountService ,
                                                          intercom ) {
            var SelfieResendActivationCtrl = this;

            this.error = null;

            this.resend = function() {
                return AccountService.resendActivation()
                    .then(function() {
                        // probably want to put a success message on the Ctrl
                        // and tell the user to check their email
                        SelfieResendActivationCtrl.error = null;
                        SelfieResendActivationCtrl.model = 'We have sent you an email with ' +
                            'a new confirmation link!';
                    })
                    .catch(function() {
                        SelfieResendActivationCtrl.error = true;
                        SelfieResendActivationCtrl.model = 'There was a problem resending ' +
                            'a new activation link';
                    });
            };

            this.logout = function() {
                return AuthService.logout()
                    .then(function transition() {
                        intercom('shutdown');
                        return c6State.goTo('Selfie:Login', null, {});
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:ConfirmAccount', ['$location','c6State',
                                                            'AccountService','$q',
            function                                       ( $location , c6State ,
                                                             AccountService , $q ) {
                var id = $location.search().id,
                    token = $location.search().token;

                this.model = function() {
                    return AccountService.confirmUser(id, token)
                        .then(function() {
                            c6State.goTo('Selfie:Login', null, {reason:2});
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
            c6StateProvider.state('Selfie:Account', ['c6State','cinema6','$q','PaymentService',
            function                                ( c6State , cinema6 , $q , PaymentService ) {
                var SelfieAccountState = this;

                this.templateUrl = 'views/selfie/account.html';
                this.controller = 'SelfieAccountController';
                // need 'AccoutnCtrl' for the existing Ctrls to work
                this.controllerAs = 'AccountCtrl';

                this.model = function() {
                    return c6State.get('Selfie').cModel;
                };

                this.afterModel = function() {
                    return $q.all({
                        methods: cinema6.db.findAll('paymentMethod'),
                        balance: PaymentService.getBalance()
                    }).then(function(promises) {
                        SelfieAccountState.paymentMethods = promises.methods;
                    });
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:Account:Overview');
                };
            }]);
        }])

        .controller('SelfieAccountController', ['cState','AddFundsModalService',
                                                'cinema6','NotificationService',
        function                               ( cState , AddFundsModalService ,
                                                 cinema6 , NotificationService ) {
            var self = this;

            this.initWithModel = function(model) {
                this.model = model;
                this.paymentMethods = cState.paymentMethods;
            };

            Object.defineProperties(this, {
                primaryMethod: {
                    get: function() {
                        return (this.paymentMethods || []).filter(function(method) {
                            return method.default;
                        })[0];
                    }
                }
            });

            this.addFunds = function() {
                AddFundsModalService.display()
                    .then(function() {
                        NotificationService.display('You successfully added funds to your account');
                        return cinema6.db.findAll('paymentMethod');
                    })
                    .then(function(paymentMethods) {
                        self.paymentMethods = paymentMethods;
                        cState.paymentMethods = paymentMethods;
                    });
            };
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

        .controller('SelfieAccountDetailsController', ['cState','c6State',
        function                                      ( cState , c6State ) {
            var user = cState.cParent.cModel,
                SelfieAccountDetailsCtrl = this;

            this.error = null;
            this.user = user.pojoify();

            this.save = function() {
                return user._update(this.user).save()
                    .then(function() {
                        c6State.goTo('Selfie:Account');
                    }, function() {
                        SelfieAccountDetailsCtrl.error = 'There was a problem saving your details';
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Payment', [function() {
                this.templateUrl = 'views/selfie/account/payment.html';
                this.controller = 'SelfieAccountPaymentController';
                this.controllerAs = 'SelfieAccountPaymentCtrl';

                this.model = function() {
                    return this.cParent.paymentMethods;
                };
            }]);
        }])

        .controller('SelfieAccountPaymentController', ['c6State','cinema6','c6AsyncQueue',
                                                       'ConfirmDialogService',
        function                                      ( c6State , cinema6 , c6AsyncQueue ,
                                                        ConfirmDialogService ) {
            var SelfieAccountPaymentCtrl = this,
                queue = c6AsyncQueue();

            function handleError(action, error) {
                ConfirmDialogService.display({
                    prompt: 'There was an a problem '+action+' your payment method: '+error.data,
                    affirm: 'OK',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    }
                });
            }

            this.refreshModel = function() {
                return cinema6.db.findAll('paymentMethod')
                    .then(function(methods) {
                        SelfieAccountPaymentCtrl.model = methods;
                    });
            };

            this.confirmPrimary = function(method) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this your primary payment method?',
                    affirm: 'Yes, Make primary',
                    cancel: 'No',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        ConfirmDialogService.close();

                        SelfieAccountPaymentCtrl.makeDefault(method);
                    })
                });
            };

            this.makeDefault = function(method) {
                method.makeDefault = true;
                method.cardholderName = undefined;

                method.save()
                    .then(this.refreshModel, function(err) {
                        handleError('updating', err);
                    });
            };

            this.edit = function(method) {
                c6State.goTo('Selfie:Account:Payment:Edit', [method]);
            };

            this.confirmDelete = function(method) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this payment method?',
                    affirm: 'Yes, Delete',
                    cancel: 'No',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        ConfirmDialogService.close();

                        SelfieAccountPaymentCtrl.delete(method);
                    })
                });
            };

            this.delete = function(method) {
                method.erase()
                    .then(this.refreshModel, function(err) {
                        handleError('deleting', err);
                    });
            };

            this.paypalSuccess = function(method) {
                var paypalMethod = cinema6.db.create('paymentMethod', {
                    paymentMethodNonce: method.nonce
                });

                paypalMethod.save()
                    .then(this.refreshModel, function(err) {
                        handleError('saving', err);
                    });
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
            var SelfieAccountPaymentCtrl = $scope.SelfieAccountPaymentCtrl;

            this.initWithModel = function(model) {
                this.model = model;
                this.token = cState.token;
                SelfieAccountPaymentCtrl.pendingCreditCard = false;
            };

            this.success = function(method) {
                extend(this.model, {
                    cardholderName: method.cardholderName,
                    paymentMethodNonce: method.nonce,
                    makeDefault: method.makeDefault
                });

                return this.model.save()
                    .then(SelfieAccountPaymentCtrl.refreshModel)
                    .then(function() {
                        return c6State.goTo('Selfie:Account:Payment');
                    });
            };

            this.cancel = function() {
                return c6State.goTo('Selfie:Account:Payment');
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Payment:Edit', ['cinema6','c6State',
                                                                  'PaymentService',
            function                                             ( cinema6 , c6State ,
                                                                   PaymentService ) {
                var SelfieAccountPaymentEditState = this;

                this.templateUrl = 'views/selfie/account/payment/edit.html';
                this.controller = 'SelfieAccountPaymentEditController';
                this.controllerAs = 'SelfieAccountPaymentEditCtrl';

                this.model = function(params) {
                    var allMethods = this.cParent.cModel;

                    return allMethods.filter(function(method) {
                        return method.id === params.id;
                    })[0];
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
            var SelfieAccountPaymentCtrl = $scope.SelfieAccountPaymentCtrl;

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

                return this.model.save()
                    .then(SelfieAccountPaymentCtrl.refreshModel)
                    .then(function() {
                        return c6State.goTo('Selfie:Account:Payment');
                    });
            };

            this.cancel = function() {
                return c6State.goTo('Selfie:Account:Payment');
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Account:Payment:History', ['$injector','paginatedDbList',
                                                                     'PaymentService',
                                                                     'SpinnerService',
            function                                                ( $injector , paginatedDbList ,
                                                                      PaymentService ,
                                                                      SpinnerService ) {
                var self = this;

                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/selfie/account/payment/history.html';
                this.controller = 'SelfieAccountPaymentHistoryController';
                this.controllerAs = 'SelfieAccountPaymentHistoryCtrl';

                this.model = function() {
                    SpinnerService.display();

                    return paginatedDbList('transaction', {
                        sort: 'created,-1'
                    }, this.limit, this.page).ensureResolution()
                        .finally(function() {
                            SpinnerService.close();
                        });
                };

                this.afterModel = function() {
                    return PaymentService.getBalance()
                        .then(function(accounting) {
                            self.accounting = accounting;
                        });
                };
            }]);
        }])

        .controller('SelfieAccountPaymentHistoryController', ['$injector','cState','$scope',
                                                              'AddFundsModalService',
                                                              'NotificationService',
        function                                             ( $injector , cState , $scope ,
                                                               AddFundsModalService ,
                                                               NotificationService ) {
            var self = this;

            $injector.invoke(PaginatedListController, this, {
                cState: cState,
                $scope: $scope
            });

            this.initWithModel = function(model) {
                this.model = model;
                this.accounting = cState.accounting;
            };

            this.addFunds = function() {
                AddFundsModalService.display()
                    .then(function() {
                        NotificationService.display('You successfully added funds to your account');
                        self.model.refresh();
                    });
            };
        }]);
});