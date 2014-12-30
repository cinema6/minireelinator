define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.Placements state', function() {
        var c6State,
            campaignPlacements;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignPlacements = c6State.get('MR:Campaign.Placements');
            });
        });

        it('should exist', function() {
            expect(campaignPlacements).toEqual(jasmine.any(Object));
        });
    });
});
