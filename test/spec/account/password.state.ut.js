define(['app'], function(appModule) {
    'use strict';

    describe('Password State', function() {
        var c6State,
            password;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            password = c6State.get('Account:Password');
        });

        it('should exist', function() {
            expect(password).toEqual(jasmine.any(Object));
        });
    });
});
