define(['app'], function(appModule) {
    'use strict';

    describe('ResetPassword state', function() {
        var c6State,
            resetPassword;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                resetPassword = c6State.get('ResetPassword');
            });
        });

        afterAll(function() {
            c6State = null;
            resetPassword = null;
        });

        it('should exist', function() {
            expect(resetPassword).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = resetPassword.model();
            });

            it('should be a model with a passwords array', function() {
                expect(result).toEqual({
                    passwords: [null, null]
                });
            });
        });
    });
});
