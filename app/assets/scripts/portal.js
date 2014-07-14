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
                            c6State.goTo('Login');
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
                        });
                };
                this.enter = function() {
                    c6State.goTo('Apps');
                };
            }]);
        }])

        .controller('PortalController', ['AuthService','c6State',
        function                        ( AuthService , c6State ) {
            this.logout = function() {
                return AuthService.logout()
                    .then(function transition() {
                        return c6State.goTo('Login');
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Apps', ['c6State','cinema6','fn','$q',
            function                      ( c6State , cinema6 , fn , $q ) {
                this.model = function() {
                    var applications = this.cParent.cModel.applications;

                    return $q.all(applications.map(function(id) {
                        return cinema6.db.find('experience', id);
                    }));
                };
                this.enter = function() {
                    var goTo = fn.partial(fn.call)(c6State, 'goTo'),
                        goToMiniReel = fn.partial(goTo)('MiniReel'),
                        goToError = fn.partial(goTo)('Error'),
                        experience = fn.first(this.cModel),
                        isMiniReel = fn.partial(fn.is)('mini-reel-maker');

                    if (isMiniReel(experience.appUri)) {
                        goToMiniReel([experience]);
                    } else {
                        goToError(['You do not have any supported experiences!']);
                    }
                };
            }]);
        }]);
});
