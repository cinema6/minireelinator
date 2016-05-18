define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Ads state', function() {
        var c6State,
            sponsorCardAds;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCardAds = c6State.get('MR:SponsorCard.Ads');
        });

        afterAll(function() {
            c6State = null;
            sponsorCardAds = null;
        });

        it('should exist', function() {
            expect(sponsorCardAds).toEqual(jasmine.any(Object));
        });
    });
});
