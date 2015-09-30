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

            this.changeEmail = function(email,password,newEmail){
                var body = {
                    email       : email,
                    password    : password,
                    newEmail    : newEmail
                };

                return $http({
                    method       : 'POST',
                    url          : c6UrlMaker('account/user/email','api'),
                    data         : body,
                    timeout      : 10000
                }).then(pick('data'))
                .catch(handleError);
            };

            this.changePassword = function(email,password,newPassword) {
                var body = {
                    email       : email,
                    password    : password,
                    newPassword : newPassword
                };

                return $http({
                    method       : 'POST',
                    url          : c6UrlMaker('account/user/password','api'),
                    data         : body,
                    timeout      : 10000
                }).then(pick('data'))
                .catch(handleError);
            };

            this.confirmUser = function(id, token) {
                return $http({
                    method: 'POST',
                    url: c6UrlMaker('account/users/confirm/'+id,'api'),
                    data: { token: token },
                    timeout: 10000
                }).then(pick('data'))
                .catch(handleError);
            };

            this.resendActivation = function() {
                return $http({
                    method: 'POST',
                    url: c6UrlMaker('account/users/resendActivation','api'),
                    data: {},
                    timeout: 10000
                }).then(pick('data'))
                .catch(handleError);
            };

            this.signUp = function(user) {
                return $http({
                    method: 'POST',
                    url: c6UrlMaker('account/users/signup','api'),
                    data: user,
                    timeout: 10000
                }).then(pick('data'))
                .catch(handleError);
            };

        }]);
});
