define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Endcap state', function() {
        var c6State,
            sponsorMiniReelEndcap;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorMiniReelEndcap = c6State.get('MR:SponsorMiniReel.Endcap');
        });

        it('should exist', function() {
            expect(sponsorMiniReelEndcap).toEqual(jasmine.any(Object));
        });
    });
});
