define(['app'], function(appModule) {
    'use strict';

    describe('Account state', function() {
        var c6State,
            portal,
            account;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            portal = c6State.get('Portal');
            portal.cModel = {
                id: 'u-5dbb38ce1f2def'
            };
            account = c6State.get('Account');
        });

        it('should exist', function() {
            expect(account).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = account.model();
            });

            it('should be the user', function() {
                expect(result).toBe(portal.cModel);
            });
        });
    });
});
