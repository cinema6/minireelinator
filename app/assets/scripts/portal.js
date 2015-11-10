define( ['angular','c6_state','c6uilib'],
function( angular , c6State  , c6uilib ) {
    'use strict';

    return angular.module('c6.app.portal', [c6State.name, c6uilib.name])
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
            c6StateProvider.state('Apps', ['c6State','cinema6','$q','$window','c6Defines',
            function                      ( c6State , cinema6 , $q , $window , c6Defines ) {
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
                        minireel = experiences['mini-reel-maker'];

                    if (minireel) {
                        return c6State.goTo('MiniReel', [minireel], null, true);
                    }

                    $window.location.href = c6Defines.kPlatformHome;
                };
            }]);
        }]);
});
