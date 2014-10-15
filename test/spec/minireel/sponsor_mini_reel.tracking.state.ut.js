define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Tracking state', function() {
        var c6State,
            sponsorMiniReelTracking;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorMiniReelTracking = c6State.get('MR:SponsorMiniReel.Tracking');
        });

        it('should exist', function() {
            expect(sponsorMiniReelTracking).toEqual(jasmine.any(Object));
        });
    });
});
