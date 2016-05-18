define(['minireel/app', 'cryptojs'], function(appModule, cryptojs) {
    'use strict';

    describe('gravatarFilter(email)', function() {
        var gravatarFilter;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                gravatarFilter = $injector.get('gravatarFilter');
            });
        });

        afterAll(function() {
            gravatarFilter = null;
        });

        it('should return a gravatar for the email', function() {
            expect(gravatarFilter(' Josh@Minzner.org ')).toBe('//www.gravatar.com/avatar/' + cryptojs.MD5('josh@minzner.org').toString(cryptojs.enc.Hex));
        });
    });
});
