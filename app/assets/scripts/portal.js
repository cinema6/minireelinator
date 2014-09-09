define( ['angular','c6_state','c6ui'],
function( angular , c6State  , c6ui ) {
    'use strict';

    return angular.module('c6.app.portal', [c6State.name, c6ui.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Portal', ['$q','cinema6','c6State','AuthService',
            function                        ( $q , cinema6 , c6State , AuthService ) {
                this.templateUrl = 'views/portal.html';
                this.controller = 'PortalController';
                this.controllerAs = 'PortalCtrl';

                this.model = function() {
                    return AuthService.checkStatus()
                        .catch(function redirect(reason) {
                            c6State.goTo('Login', null, null, true);
                            return $q.reject(reason);
                        });
                };
                this.enter = function() {
                    c6State.goTo('Apps', null, null, true);
                };
            }]);
        }])

        .controller('PortalController', ['AuthService','c6State',
        function                        ( AuthService , c6State ) {
            this.initWithModel = function(model) {
                var permissions = model.permissions;

                this.model = model;

                this.enableAdManager = !!permissions.orgs.editAdConfig ||
                    !!permissions.experiences.editAdConfig;
            };

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
