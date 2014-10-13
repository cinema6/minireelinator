define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Links state', function() {
        var c6State,
            MiniReelService,
            sponsorCard,
            sponsorCardLinks;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');
            });

            sponsorCard = c6State.get('MR:SponsorCard');
            sponsorCard.cModel = MiniReelService.createCard('video');

            sponsorCardLinks = c6State.get('MR:SponsorCard.Links');
        });

        it('should exist', function() {
            expect(sponsorCardLinks).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = sponsorCardLinks.model();
            });

            it('should be the card\'s links', function() {
                expect(result).toBe(sponsorCard.cModel.links);
            });
        });
    });
});
