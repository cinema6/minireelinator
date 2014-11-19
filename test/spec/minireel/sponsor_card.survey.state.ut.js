define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Survey state', function() {
        var c6State,
            sponsorCardSurvey;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                sponsorCardSurvey = c6State.get('MR:SponsorCard.Survey');
            });
        });

        it('should exist', function() {
            expect(sponsorCardSurvey).toEqual(jasmine.any(Object));
        });
    });
});
