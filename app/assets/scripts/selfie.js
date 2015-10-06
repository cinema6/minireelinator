define( ['angular','c6_state','c6uilib','./selfie/account'],
function( angular , c6State  , c6uilib , account   ) {
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

        .controller('SelfieController', ['AuthService','c6State',
        function                        ( AuthService , c6State ) {
            this.initWithModel = function(model) {
                this.model = model;
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
            c6StateProvider.state('Selfie:Apps', ['c6State','cinema6','$q',
            function                             ( c6State , cinema6 , $q ) {
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

                    c6State.goTo('Error', [
                        'You do not have any supported experiences!'
                    ], null, true);
                };
            }]);
        }]);
});
