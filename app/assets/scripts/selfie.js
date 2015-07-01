define( ['angular','c6_state','c6uilib'],
function( angular , c6State  , c6uilib ) {
    'use strict';

    return angular.module('c6.app.selfie', [c6State.name, c6uilib.name])
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
                            c6State.goTo('Login', null, null, true);
                            return $q.reject(reason);
                        });
                };
                this.enter = function() {
                    c6State.goTo('Selfie:Apps', null, null, true);
                };
            }]);
        }])

        .controller('SelfieController', ['AuthService','c6State','CSSLoadingService',
        function                        ( AuthService , c6State , CSSLoadingService ) {

            CSSLoadingService.load([
                'http://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300ita' +
                    'lic,400italic,600italic,700italic|Roboto+Condensed:300italic,300',
                'http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
                'styles/selfie/select2.min.css',
                'styles/selfie/css-wizardry-grids.css',
                'styles/selfie/c6selfie__base.css'
            ]);

            this.initWithModel = function(model) {
                this.model = model;
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
        }])

        .service('CSSLoadingService', ['$document',
        function                      ( $document ) {
            this.load = function() {
                Array.prototype.slice.call(arguments)
                    .reduce(function(result, arg) {
                        (Array.isArray(arg) ? arg : [arg])
                            .forEach(function(path) {
                                result.push(path);
                            });
                        return result;
                    }, [])
                    .forEach(function(filepath) {
                        var file = document.createElement('link');
                        file.setAttribute('rel', 'stylesheet');
                        file.setAttribute('type', 'text/css');
                        file.setAttribute('href', filepath);

                        $document.find('head').append(file);
                    });
            };
        }]);
});
