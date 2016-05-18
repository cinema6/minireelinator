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

        afterAll(function() {
            c6State = null;
            $rootScope = null;
            $q = null;
            AuthService = null;
            login = null;
        });

        it('should exist', function() {
            expect(login).toEqual(jasmine.any(Object));
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
