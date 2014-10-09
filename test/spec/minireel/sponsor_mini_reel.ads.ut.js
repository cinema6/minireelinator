define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Ads state', function() {
        var c6State,
            sponsorMiniReelAds;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorMiniReelAds = c6State.get('MR:SponsorMiniReel.Ads');
        });

        it('should exist', function() {
            expect(sponsorMiniReelAds).toEqual(jasmine.any(Object));
        });
    });
});
