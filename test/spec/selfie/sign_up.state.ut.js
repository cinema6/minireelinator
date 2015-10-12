define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:SignUp State', function() {
        var c6State,
            $rootScope,
            $q,
            signUp;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                $q = $injector.get('$q');
            });

            signUp = c6State.get('Selfie:SignUp');
        });

        it('should exist', function() {
            expect(signUp).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = signUp.model();
            });

            it('should return an empty signUp model', function() {
                expect(result).toEqual({
                    email: '',
                    password: '',
                    company: '',
                    firstName: '',
                    lastName: ''
                });
            });
        });
    });
});
