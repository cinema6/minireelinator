define( ['angular','c6_state','c6ui','fn_utils'],
function( angular , c6State  , c6ui , fnUtils  ) {
    'use strict';

    return angular.module('c6.app.portal', [c6State.name, c6ui.name, fnUtils.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Portal', ['$q','cinema6','c6State',
            function                        ( $q , cinema6 , c6State ) {
                this.templateUrl = 'views/portal.html';

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
                    c6State.goTo('Apps', [this.cModel.applications]);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Apps', ['c6State','cinema6','fn',
            function                      ( c6State , cinema6 , fn ) {
                this.enter = function() {
                    var goTo = fn.partial(fn.call)(c6State, 'goTo'),
                        goToMiniReel = fn.partial(goTo)('MiniReel'),
                        goToError = fn.partial(goTo)('Error'),
                        wrapArgsInArrays = fn.partial(fn.transformArgs)(fn.toArray),
                        isMiniReel = fn.partial(fn.is)('mini-reel-maker');

                    function validate(app) {
                        return fn.promiseOn(isMiniReel(app.appUri))
                            .then(
                                fn.value(app),
                                fn.value(fn.rejectify('User has no compatible apps!'))
                            );
                    }

                    cinema6.db.find('experience', fn.first(this.cModel))
                        .then(validate)
                        .then(wrapArgsInArrays(goToMiniReel))
                        .catch(wrapArgsInArrays(goToError));
                };
            }]);
        }]);
});
