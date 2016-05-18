define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Position state', function() {
        var c6State,
            sponsorCardPosition;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCardPosition = c6State.get('MR:SponsorCard.Position');
        });

        afterAll(function() {
            c6State = null;
            sponsorCardPosition = null;
        });

        it('should exist', function() {
            expect(sponsorCardPosition).toEqual(jasmine.any(Object));
        });
    });
});
