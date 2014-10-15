define(['app'], function(appModule) {
    'use strict';

    describe('MR:Sponsor state', function() {
        var c6State,
            sponsor;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsor = c6State.get('MR:Sponsor');
        });

        it('should exist', function() {
            expect(sponsor).toEqual(jasmine.any(Object));
        });
    });
});
