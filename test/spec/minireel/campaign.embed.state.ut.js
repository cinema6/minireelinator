(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('CampaignEmbedState', function() {
            var CampaignEmbedState,
                c6State;

            ['MR:Campaign.MiniReels.Embed', 'MR:Campaign.Placements.Embed'].forEach(function(instance) {
                describe(instance, function() {
                    beforeEach(function() {
                        module(appModule.name);

                        inject(function($injector) {
                            c6State = $injector.get('c6State');
                            CampaignEmbedState = c6State.get(instance);
                        });
                    });

                    it('should exist', function() {
                        expect(CampaignEmbedState).toEqual(jasmine.any(Object));
                    });
                });
            });
        });
    });
}());