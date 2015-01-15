define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.Creatives state', function() {
        var c6State,
            campaignCreatives;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignCreatives = c6State.get('MR:Campaign.Creatives');
            });
        });

        it('should exist', function() {
            expect(campaignCreatives).toEqual(jasmine.any(Object));
        });
    });
});
