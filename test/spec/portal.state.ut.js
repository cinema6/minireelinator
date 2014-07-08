define (['app', 'angular'], function(appModule, angular) {
    'use strict';

    var copy = angular.copy;

    describe('Portal State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            AuthService,
            portal;

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.value('$location', {});
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
                    expect(c6State.goTo).toHaveBeenCalledWith('Login');
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
                expect(c6State.goTo).toHaveBeenCalledWith('Apps');
            });
        });

        describe('afterModel()', function() {
            var success, failure,
                user, org,
                origUser;

            beforeEach(function() {
                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                org = {
                    id: 'o-e7fcd57733d708'
                };

                user = {
                    org: 'o-e7fcd57733d708',
                    applications: ['e-bc1ed2bce16aa3']
                };
                origUser = copy(user);

                spyOn(cinema6.db, 'find').and.returnValue($q.when(org));
            });

            [
                {
                    org: 'o-e7fcd57733d708',
                    applications: ['e-bc1ed2bce16aa3']
                },
                {
                    org: 'o-e7fcd57733d708'
                }
            ].forEach(function(user) {
                describe('if the user is ' + JSON.stringify(user), function() {
                    var orgId;

                    beforeEach(function() {
                        orgId = user.org;

                        $rootScope.$apply(function() {
                            portal.afterModel(user).then(success, failure);
                        });
                    });

                    it('should get the user\'s org', function() {
                        expect(cinema6.db.find).toHaveBeenCalledWith('org', orgId);
                    });

                    it('should attach the org to the user', function() {
                        expect(user.org).toBe(org);
                    });
                });
            });

            describe('if the user has no applications', function() {
                beforeEach(function() {
                    delete user.applications;

                    $rootScope.$apply(function() {
                        portal.afterModel(user).then(success, failure);
                    });
                });

                it('should give the user an empty applications array', function() {
                    expect(success).toHaveBeenCalledWith(user);
                    expect(user.applications).toEqual([]);
                });
            });

            describe('if the user has applications', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        portal.afterModel(user).then(success, failure);
                    });
                });

                it('should not overwrite them', function() {
                    expect(user.applications).toEqual(origUser.applications);
                });
            });
        });
    });
});
