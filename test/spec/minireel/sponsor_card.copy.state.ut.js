define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Copy state', function() {
        var c6State,
            sponsorCardCopy;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCardCopy = c6State.get('MR:SponsorCard.Copy');
        });

        it('should exist', function() {
            expect(sponsorCardCopy).toEqual(jasmine.any(Object));
        });
    });
});
