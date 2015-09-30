define( ['angular','c6_state','account/password','account/email'],
function( angular , c6State  , password         , email         ) {
    'use strict';

    return angular.module('c6.app.account', [c6State.name, password.name, email.name])
        .config(['c6StateProvider',
        function(c6StateProvider ) {
            c6StateProvider.state('Account', ['c6State',
            function                         ( c6State ) {
                this.templateUrl = 'views/account/app.html';
                this.controller = 'AccountController';
                this.controllerAs = 'AccountCtrl';

                this.model = function() {
                    return this.cParent.cModel;
                };
                this.enter = function() {
                    c6State.goTo('Account:Password', null, null, true);
                };
                this.title = function() {
                    return 'Cinema6: Account Settings';
                };
            }]);

            c6StateProvider.map('Account', function() {
                this.route('/password', 'Account:Password');
                this.route('/email', 'Account:Email');
            });
        }])

        .controller('AccountController', [function() {}])

        .service('AccountService', ['c6UrlMaker','$http','$q','$timeout',
        function                   ( c6UrlMaker , $http , $q , $timeout ) {

            function handleError(err) {
                return $q.reject((err && err.data) || err || 'Unable to complete request');
            }

            function pick(prop) {
                return function(object) {
                    return object[prop];
                };
            }

            function requestWrapper(promise) {
                var deferred = $q.defer(),
                    cancelTimeout;

                (promise || $q.reject('Unable to resolve request'))
                    .then(function(data) {
                        $timeout.cancel(cancelTimeout);
                        deferred.resolve(data);
                    }, function(err) {
                        if (!err) {
                            err = 'Unable to locate failed';
                        }
                        $timeout.cancel(cancelTimeout);
                        deferred.reject(err);
                    });

                cancelTimeout = $timeout(function() {
                    deferred.reject('Request timed out.');
                },10000);

                return deferred.promise;
            }

            this.changeEmail = function(email,password,newEmail){
                var body = {
                    email       : email,
                    password    : password,
                    newEmail    : newEmail
                };

                return requestWrapper($http({
                    method       : 'POST',
                    url          : c6UrlMaker('account/user/email','api'),
                    data         : body
                })).then(pick('data'))
                .catch(handleError);
            };

            this.changePassword = function(email,password,newPassword) {
                var body = {
                    email       : email,
                    password    : password,
                    newPassword : newPassword
                };

                return requestWrapper($http({
                    method       : 'POST',
                    url          : c6UrlMaker('account/user/password','api'),
                    data         : body
                })).then(pick('data'))
                .catch(handleError);
            };

            this.getOrg = function(orgId){
                return requestWrapper($http({
                    method: 'GET',
                    url: c6UrlMaker('account/org/' + orgId,'api')
                })).then(pick('data'))
                .catch(handleError);
            };

            this.confirmUser = function(id, token) {
                return requestWrapper($http({
                    method: 'POST',
                    url: c6UrlMaker('account/users/confirm/'+id,'api'),
                    data: { token: token }
                })).then(pick('data'))
                .catch(handleError);
            };

            this.resendActivation = function() {
                return requestWrapper($http({
                    method: 'POST',
                    url: c6UrlMaker('account/users/resendActivation','api'),
                    data: {}
                })).then(pick('data'))
                .catch(handleError);
            };

            this.signUp = function(user) {
                return requestWrapper($http({
                    method: 'POST',
                    url: c6UrlMaker('account/users/signup','api'),
                    data: user
                })).then(pick('data'))
                .catch(handleError);
            };

        }]);
});
