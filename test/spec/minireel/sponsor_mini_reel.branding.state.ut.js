define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Branding state', function() {
        var c6State,
            sponsorMiniReelBranding;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorMiniReelBranding = c6State.get('MR:SponsorMiniReel.Branding');
        });

        it('should exist', function() {
            expect(sponsorMiniReelBranding).toEqual(jasmine.any(Object));
        });
    });
});
