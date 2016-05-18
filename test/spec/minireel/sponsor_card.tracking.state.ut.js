define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorCard.Tracking state', function() {
        var c6State,
            sponsorCardTracking;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            sponsorCardTracking = c6State.get('MR:SponsorCard.Tracking');
        });

        afterAll(function() {
            c6State = null;
            sponsorCardTracking = null;
        });

        it('should exist', function() {
            expect(sponsorCardTracking).toEqual(jasmine.any(Object));
        });
    });
});
