define(['app'], function(appModule) {
    'use strict';

    describe('Selfie State', function() {
        var $rootScope,
            $q,
            $location,
            c6State,
            cinema6,
            AuthService,
            selfie;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');
                $location = $injector.get('$location');
            });

            selfie = c6State.get('Selfie');
        });

        it('should exist', function() {
            expect(selfie).toEqual(jasmine.any(Object));
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
                        selfie.model().then(success, failure);
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
                    spyOn($location, 'path').and.returnValue('/campaigns');
                    $rootScope.$apply(function() {
                        selfie.model().then(success, failure);
                    });
                });

                it('should reject', function() {
                    expect(failure).toHaveBeenCalledWith('BLEGH');
                });

                it('should transition to the login state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Login', null, {redirectTo: '/campaigns'}, true);
                });
            });
        });

        describe('afterModel()', function() {
            it('should go to Selfie:ResendActivation if the user has status of "new"', function() {
                spyOn(c6State,'goTo');

                selfie.afterModel({status: 'active'});

                expect(c6State.goTo).not.toHaveBeenCalled();

                selfie.afterModel({status: 'new'});

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:ResendActivation');
            });
        });

        describe('enter()', function() {
            var user;

            beforeEach(function() {
                user = {
                    applications: ['e-efaa765476bd5b']
                };

                spyOn(c6State, 'goTo');
            });

            it('should go to the "Selfie:Apps" state', function() {
                selfie.cModel = user;
                $rootScope.$apply(function() {
                    selfie.enter();
                });
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Apps', null, null, true);
            });

            it('should go to the Selfie:ResendActivation if the user has status of "new"', function() {
                selfie.cModel = user;
                selfie.cModel.status = 'new';
                $rootScope.$apply(function() {
                    selfie.enter();
                });
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:ResendActivation');
            });
        });
    });
});