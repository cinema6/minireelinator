define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Cards state', function() {
        var c6State,
            sponsorMiniReelCards;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorMiniReelCards = c6State.get('MR:SponsorMiniReel.Cards');
        });

        it('should exist', function() {
            expect(sponsorMiniReelCards).toEqual(jasmine.any(Object));
        });
    });
});
