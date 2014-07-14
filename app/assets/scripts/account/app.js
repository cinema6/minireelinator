define( ['angular','c6_state','account/password','account/email'],
function( angular , c6State  , password         , email         ) {
    'use strict';

    return angular.module('c6.app.account', [c6State.name, password.name, email.name])
        .config(['c6StateProvider',
        function(c6StateProvider ) {
            c6StateProvider.state('Account', [function() {
                this.templateUrl = 'views/account/app.html';
                this.controller = 'AccountController';
                this.controllerAs = 'AccountCtrl';

                this.model = function() {
                    return this.cParent.cModel;
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

            this.changeEmail = function(email,password,newEmail){
                var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                    body = {
                        email    : email,
                        password    : password,
                        newEmail    : newEmail,
                    };

                $http({
                    method       : 'POST',
                    url          : c6UrlMaker('account/user/email','api'),
                    data         : body,
                    timeout      : deferredTimeout.promise
                })
                .success(function(data ){
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data,status){
                    if (!data){
                        data = status;
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

            this.changePassword = function(email,password,newPassword) {
                var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                    body = {
                        email       : email,
                        password    : password,
                        newPassword : newPassword
                    };

                $http({
                    method       : 'POST',
                    url          : c6UrlMaker('account/user/password','api'),
                    data         : body,
                    timeout      : deferredTimeout.promise
                })
                .success(function(data ){
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data, status){
                    if (!data){
                        data = status;
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
            
            this.getOrg = function(orgId){
                var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                    url = c6UrlMaker('account/org/' + orgId,'api');

                $http({
                    method       : 'GET',
                    url          : url,
                    timeout      : deferredTimeout.promise
                })
                .success(function(data){
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data){
                    if (!data){
                        data = 'Unable to locate failed';
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
