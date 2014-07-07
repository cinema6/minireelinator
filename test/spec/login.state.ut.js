define(['app'], function(appModule) {
    'use strict';

    describe('Login State', function() {
        var c6State,
            $rootScope,
            $q,
            AuthService,
            login;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');
            });

            login = c6State.get('Login');
        });

        it('should exist', function() {
            expect(login).toEqual(jasmine.any(Object));
        });

        describe('beforeModel()', function() {
            var success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                spyOn(AuthService, 'checkStatus');
            });

            describe('if the user is not logged in', function() {
                beforeEach(function() {
                    AuthService.checkStatus.and.returnValue($q.reject('BLEGH'));

                    $rootScope.$apply(function() {
                        login.beforeModel().then(success, failure);
                    });
                });

                it('should return null in a promise', function() {
                    expect(success).toHaveBeenCalledWith('BLEGH');
                });
            });

            describe('if the user is logged in', function() {
                var user;

                beforeEach(function() {
                    user = {
                        email: 'josh@minzner.org'
                    };

                    AuthService.checkStatus.and.returnValue($q.when(user));
                    spyOn(c6State, 'goTo');

                    $rootScope.$apply(function() {
                        login.beforeModel().then(success, failure);
                    });
                });

                it('should reject the promise with the user', function() {
                    expect(failure).toHaveBeenCalledWith(user);
                });

                it('should kick off a transition to the "Portal" state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Portal', [user]);
                });
            });
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = login.model();
            });

            it('should return an empty login model', function() {
                expect(result).toEqual({
                    email: '',
                    password: ''
                });
            });
        });
    });
});
