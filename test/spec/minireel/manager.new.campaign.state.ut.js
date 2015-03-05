define(['app'], function(appModule) {
    'use strict';

    describe('MR:Settings.Campaign state', function() {
        var c6State,
            NewCampaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                NewCampaign = c6State.get('MR:Settings.Campaign');
            });
        });

        it('should exist', function() {
            expect(NewCampaign).toEqual(jasmine.any(Object));
        });
    });
});
