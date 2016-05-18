define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.Placements state', function() {
        var c6State,
            campaign,
            campaignPlacements;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaign = c6State.get('MR:Campaign');
                campaignPlacements = c6State.get('MR:Campaign.Placements');
            });
        });

        afterAll(function() {
            c6State = null;
            campaign = null;
            campaignPlacements = null;
        });

        it('should exist', function() {
            expect(campaignPlacements).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var staticCardMap,
                result;

            beforeEach(function() {
                staticCardMap = (campaign.cModel = {
                    staticCardMap: []
                }).staticCardMap;

                result = campaignPlacements.model();
            });

            it('should return the static card map', function() {
                expect(result).toBe(staticCardMap);
            });
        });
    });
});
