define (['app'], function(appModule) {
    'use strict';

    describe('Portal State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            AuthService,
            portal;

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.value('$location', {
                    absUrl: function() {}
                });
            });
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');
            });

            portal = c6State.get('Portal');
        });

        it('should exist', function() {
            expect(portal).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                spyOn(AuthService, 'checkStatus');
            });

            describe('if the user is logged in', function() {
                var user;

                beforeEach(function() {
                    user = {
                        email: 'josh@cinema6.com'
                    };

                    AuthService.checkStatus.and.returnValue($q.when(user));
                    $rootScope.$apply(function() {
                        portal.model().then(success, failure);
                    });
                });

                it('should return the user', function() {
                    expect(success).toHaveBeenCalledWith(user);
                });
            });

            describe('if the user is not logged in', function() {
                beforeEach(function() {
                    AuthService.checkStatus.and.returnValue($q.reject('BLEGH'));
                    spyOn(c6State, 'goTo');
                    $rootScope.$apply(function() {
                        portal.model().then(success, failure);
                    });
                });

                it('should reject', function() {
                    expect(failure).toHaveBeenCalledWith('BLEGH');
                });

                it('should transition to the login state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Login', null, null, true);
                });
            });
        });

        describe('enter()', function() {
            var user;

            beforeEach(function() {
                user = {
                    applications: ['e-efaa765476bd5b']
                };

                spyOn(c6State, 'goTo');

                portal.cModel = user;
                $rootScope.$apply(function() {
                    portal.enter();
                });
            });

            it('should go to the "Apps" state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Apps', null, null, true);
            });
        });
    });
});
