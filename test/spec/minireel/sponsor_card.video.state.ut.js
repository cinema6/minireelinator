define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Video state', function() {
        var c6State,
            sponsorCard,
            sponsorCardVideo;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCard = c6State.get('MR:SponsorCard');
            sponsorCard.cModel = {};
            sponsorCardVideo = c6State.get('MR:SponsorCard.Video');
        });

        afterAll(function() {
            c6State = null;
            sponsorCard = null;
            sponsorCardVideo = null;
        });

        it('should exist', function() {
            expect(sponsorCardVideo).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = sponsorCardVideo.model();
            });

            it('should return the parent\'s model', function() {
                expect(result).toBe(sponsorCard.cModel);
            });
        });
    });
});
