define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Video state', function() {
        var c6State,
            sponsorCardVideo;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCardVideo = c6State.get('MR:SponsorCard.Video');
        });

        it('should exist', function() {
            expect(sponsorCardVideo).toEqual(jasmine.any(Object));
        });
    });
});
