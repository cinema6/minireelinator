define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:ForgotPassword State', function() {
        var c6State,
            forgotPassword;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            forgotPassword = c6State.get('Selfie:ForgotPassword');
        });

        afterAll(function() {
            c6State = null;
            forgotPassword = null;
        });

        it('should exist', function() {
            expect(forgotPassword).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = forgotPassword.model();
            });

            it('should return an object with an email property', function() {
                expect(result).toEqual({
                    email: '',
                    target: 'selfie'
                });
            });
        });
    });
});
