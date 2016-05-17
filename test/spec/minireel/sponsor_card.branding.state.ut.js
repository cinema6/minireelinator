define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Branding state', function() {
        var c6State,
            sponsorCardBranding;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCardBranding = c6State.get('MR:SponsorCard.Branding');
        });

        afterAll(function() {
            c6State = null;
            sponsorCardBranding = null;
        });

        it('should exist', function() {
            expect(sponsorCardBranding).toEqual(jasmine.any(Object));
        });
    });
});
