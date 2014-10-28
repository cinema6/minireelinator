define(['app'], function(appModule) {
    'use strict';

    describe('MR:Placement.Standalone state', function() {
        var c6State,
            placementStandalone;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            placementStandalone = c6State.get('MR:Placement.Standalone');
        });

        it('should exist', function() {
            expect(placementStandalone).toEqual(jasmine.any(Object));
        });
    });
});
