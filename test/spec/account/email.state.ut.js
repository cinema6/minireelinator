define(['app'], function(appModule) {
    'use strict';

    describe('Email state', function() {
        var c6State,
            email;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            email = c6State.get('Account:Email');
        });

        it('should exist', function() {
            expect(email).toEqual(jasmine.any(Object));
        });
    });
});
