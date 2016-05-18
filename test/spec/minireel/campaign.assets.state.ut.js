define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.Assets state', function() {
        var c6State,
            campaignAssets;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignAssets = c6State.get('MR:Campaign.Assets');
            });
        });

        afterAll(function() {
            c6State = null;
            campaignAssets = null;
        });

        it('should exist', function() {
            expect(campaignAssets).toEqual(jasmine.any(Object));
        });
    });
});
