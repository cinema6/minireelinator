define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Login State', function() {
        var c6State,
            $rootScope,
            $q,
            login;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                $q = $injector.get('$q');
            });

            login = c6State.get('Selfie:Login');
        });

        it('should exist', function() {
            expect(login).toEqual(jasmine.any(Object));
        });

        it('should bind the "reason" query param', function() {
            expect(login.queryParams).toEqual({
                reason: '&'
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
