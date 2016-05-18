define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.Cards state', function() {
        var c6State,
            campaignCreatives;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignCreatives = c6State.get('MR:Campaign.Cards');
            });
        });

        afterAll(function() {
            c6State = null;
            campaignCreatives = null;
        });

        it('should exist', function() {
            expect(campaignCreatives).toEqual(jasmine.any(Object));
        });
    });
});
