define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.MiniReelGroups state', function() {
        var c6State,
            cinema6,
            campaign,
            campaignMiniReelGroups;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');

                campaign = c6State.get('MR:Campaign');
                campaignMiniReelGroups = c6State.get('MR:Campaign.MiniReelGroups');
            });
        });

        it('should exist', function() {
            expect(campaignMiniReelGroups).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                campaign.cModel = cinema6.db.create('campaign', {
                    miniReelGroups: []
                });

                result = campaignMiniReelGroups.model();
            });

            it('should return the campaign\'s miniReelGroups array', function() {
                expect(result).toBe(campaign.cModel.miniReelGroups);
            });
        });
    });
});
