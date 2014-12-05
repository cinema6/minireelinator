define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaigns state', function() {
        var c6State,
            campaigns;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaigns = c6State.get('MR:Campaigns');
            });
        });

        it('should exist', function() {
            expect(campaigns).toEqual(jasmine.any(Object));
        });
    });
});
