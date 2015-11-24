define( ['angular','c6_state','c6uilib','c6_defines','./selfie/account'],
function( angular , c6State  , c6uilib , c6Defines , account   ) {
    'use strict';

    return angular.module('c6.app.selfie', [c6State.name, c6uilib.name, account.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie', ['$q','cinema6','c6State','AuthService',
            function                        ( $q , cinema6 , c6State , AuthService ) {
                this.templateUrl = 'views/selfie.html';
                this.controller = 'SelfieController';
                this.controllerAs = 'SelfieCtrl';

                this.model = function() {
                    return AuthService.checkStatus()
                        .catch(function redirect(reason) {
                            c6State.goTo('Selfie:Login', null, null, true);
                            return $q.reject(reason);
                        });
                };
                this.afterModel = function(user) {
                    // we need the status === 'new' check in afterModel() and enter()
                    // because there are multiple ways to enter the state,
                    // sometimes it's from another state/url, sometimes it's
                    // a page refresh...

                    if (user.status === 'new') {
                        c6State.goTo('Selfie:ResendActivation');
                    }
                };
                this.enter = function() {
                    if (this.cModel.status === 'new') {
                        c6State.goTo('Selfie:ResendActivation');
                    } else {
                        c6State.goTo('Selfie:Apps', null, null, true);
                    }
                };
            }]);
        }])

        .controller('SelfieController', ['$scope','AuthService','c6State','tracker',
        function                        ( $scope , AuthService , c6State , tracker ) {
            var self = this;

            this.initWithModel = function(model) {
                this.model = model;
            };

            this.logout = function() {
                return AuthService.logout()
                    .then(function transition() {
                        return c6State.goTo('Selfie:Login', null, {});
                    });
            };

            this.trackStateChange = function(state){
                tracker.pageview(state.cUrl, 'Platform - ' + state.cName);
            };

            c6State.on('stateChange', this.trackStateChange);

            tracker.create(c6Defines.kTracker.accountId,c6Defines.kTracker.config);

            $scope.$on('$destroy', function() {
                c6State.removeListener('stateChange', self.trackStateChange);
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Apps', ['c6State','cinema6','$q','$window','c6Defines',
                                                  'AuthService',
            function                             ( c6State , cinema6 , $q , $window , c6Defines ,
                                                   AuthService ) {
                this.model = function() {
                    var applications = this.cParent.cModel.applications;

                    return $q.all(applications.map(function(id) {
                        return cinema6.db.find('experience', id);
                    })).then(function(experiences) {
                        return experiences.reduce(function(result, experience) {
                            result[experience.appUri] = experience;
                            return result;
                        }, {});
                    });
                };
                this.enter = function() {
                    var experiences = this.cModel,
                        selfie = experiences.selfie;

                    if (selfie) {
                        return c6State.goTo('Selfie:App', [selfie], null, true);
                    }

                    return AuthService.logout().finally(function goToPortal() {
                        $window.location.href = c6Defines.kPortalHome;
                    });
                };
            }]);
        }]);
});
