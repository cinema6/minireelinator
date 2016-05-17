define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.MiniReels state', function() {
        var c6State,
            campaignMiniReels;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignMiniReels = c6State.get('MR:Campaign.MiniReels');
            });
        });

        afterAll(function() {
            c6State = null;
            campaignMiniReels = null;
        });

        it('should exist', function() {
            expect(campaignMiniReels).toEqual(jasmine.any(Object));
        });
    });
});
