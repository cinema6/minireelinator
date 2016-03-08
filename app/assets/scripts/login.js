define( ['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    return angular.module('c6.app.login', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Login', [function() {
                this.templateUrl = 'views/login.html';
                this.controller = 'LoginController';
                this.controllerAs = 'LoginCtrl';

                this.model = function() {
                    return {
                        email: '',
                        password: ''
                    };
                };
            }]);
        }])

        .controller('LoginController', ['$q','AuthService','c6State','$location',
        function                       ( $q , AuthService , c6State , $location ) {
            var ApplicationState = c6State.get('Application'),
                LoginCtrl = this;

            this.error = null;
            this.redirectTo = null;

            this.submit = function() {
                var self = this;

                function validate(model) {
                    if (model.email && model.password) {
                        return $q.when(model);
                    } else {
                        return $q.reject('Email and password required.');
                    }
                }

                function login(model) {
                    return AuthService.login(model.email, model.password);
                }

                function goToApp(user) {
                    var path = LoginCtrl.redirectTo;

                    if (path && path !== '/') {
                        $location.path(path).replace();
                    } else {
                        c6State.goTo(ApplicationState.name, [user], {}, true);
                    }

                    return user;
                }

                function writeError(error) {
                    self.error = error;
                    return $q.reject(error);
                }

                return validate(this.model)
                    .then(login)
                    .then(goToApp)
                    .catch(writeError);
            };
        }])

        .service('AuthService',['c6UrlMaker','$http','$q','$timeout','cinema6',
        function               ( c6UrlMaker , $http , $q , $timeout , cinema6 ) {
            function returnData(response) {
                return response.data;
            }

            function returnRejectedData(response) {
                return $q.reject(response.data);
            }

            function handleAuthSuccess(user) {
                var requests = {};

                if (user.org) {
                    requests.org = cinema6.db.find('org', user.org);
                }

                if (user.advertiser) {
                    requests.advertiser = cinema6.db.find('advertiser', user.advertiser);
                }

                return $q.all(requests)
                    .then(function(promises) {
                        user.org = promises.org;
                        user.advertiser = promises.advertiser;

                        return cinema6.db.push('user', user.id, user);
                    });
            }

            this.resetPassword = function(userId, token, password) {
                return $http.post(c6UrlMaker('auth/password/reset', 'api'), {
                    id: userId,
                    token: token,
                    newPassword: password
                }, {
                    timeout: 10000
                })
                .then(returnData, returnRejectedData)
                .then(handleAuthSuccess);
            };

            this.requestPasswordReset = function(email, targetApp) {
                return $http.post(c6UrlMaker('auth/password/forgot', 'api'), {
                    email: email,
                    target: targetApp
                }, {
                    timeout: 10000
                })
                .then(returnData, returnRejectedData);
            };

            this.login = function(email,password){
                var body = {
                    email    : email,
                    password : password
                };

                return $http({
                    method       : 'POST',
                    url          : c6UrlMaker('auth/login','api'),
                    data         : body,
                    timeout      : 10000
                })
                .then(returnData, returnRejectedData)
                .then(handleAuthSuccess);
            };

            this.checkStatus = function() {
                return $http({
                    method       : 'GET',
                    url          : c6UrlMaker('auth/status','api'),
                    timeout      : 10000
                })
                .then(returnData, returnRejectedData)
                .then(handleAuthSuccess);
            };

            this.logout = function(){
                var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout;

                $http({
                    method       : 'POST',
                    url          : c6UrlMaker('auth/logout','api'),
                    timeout      : deferredTimeout.promise
                })
                .success(function(data ){
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data){
                    if (!data){
                        data = 'Logout failed';
                    } else
                    if (data.error) {
                        data = data.error;
                    }
                    $timeout.cancel(cancelTimeout);
                    deferred.reject(data);
                });

                cancelTimeout = $timeout(function(){
                    deferredTimeout.resolve();
                    deferred.reject('Request timed out.');
                },10000);

                return deferred.promise;
            };
        }]);
});
