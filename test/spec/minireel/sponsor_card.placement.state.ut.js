define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Placement state', function() {
        var c6State,
            sponsorCardPlacement;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCardPlacement = c6State.get('MR:SponsorCard.Placement');
        });

        afterAll(function() {
            c6State = null;
            sponsorCardPlacement = null;
        });

        it('should exist', function() {
            expect(sponsorCardPlacement).toEqual(jasmine.any(Object));
        });
    });
});
