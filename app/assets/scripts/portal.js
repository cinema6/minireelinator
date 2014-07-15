define( ['angular','c6_state','c6ui','fn_utils'],
function( angular , c6State  , c6ui , fnUtils  ) {
    'use strict';

    return angular.module('c6.app.portal', [c6State.name, c6ui.name, fnUtils.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Portal', ['$q','cinema6','c6State','AuthService','fn',
            function                        ( $q , cinema6 , c6State , AuthService , fn ) {
                this.templateUrl = 'views/portal.html';
                this.controller = 'PortalController';
                this.controllerAs = 'PortalCtrl';

                this.model = function() {
                    return AuthService.checkStatus()
                        .catch(fn.onRejection(function redirect() {
                            c6State.goTo('Login', null, null, true);
                        }));
                };
                this.afterModel = function(user) {
                    return cinema6.db.find('org', user.org)
                        .then(function decorate(org) {
                            user.org = org;
                            return user;
                        })
                        .then(function validate(user) {
                            user.applications = user.applications || [];
                            return user;
                        })
                        .catch(fn.onRejection(function error(reason) {
                            c6State.goTo('Error', [
                                'There is a problem with your account. Please contact customer' +
                                ' service. Message: ' + reason
                            ], null, true);
                        }));
                };
                this.enter = function() {
                    c6State.goTo('Apps', null, null, true);
                };
            }]);
        }])

        .controller('PortalController', ['AuthService','c6State',
        function                        ( AuthService , c6State ) {
            this.logout = function() {
                return AuthService.logout()
                    .then(function transition() {
                        return c6State.goTo('Login', null, {});
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Apps', ['c6State','cinema6','$q',
            function                      ( c6State , cinema6 , $q ) {
                this.model = function() {
                    var applications = this.cParent.cModel.applications;

                    return $q.all(applications.map(function(id) {
                        return cinema6.db.find('experience', id);
                    }));
                };
                this.enter = function() {
                    var experience = this.cModel[0];

                    if (experience.appUri === 'mini-reel-maker') {
                        c6State.goTo('MiniReel', [experience], null, true);
                    } else {
                        c6State.goTo('Error', [
                            'You do not have any supported experiences!'
                        ], null, true);
                    }
                };
            }]);
        }]);
});
