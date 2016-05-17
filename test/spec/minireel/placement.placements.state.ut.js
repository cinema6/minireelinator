define(['app'], function(appModule) {
    'use strict';

    describe('MR:Placement.Placements state', function() {
        var c6State,
            placementPlacements;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            placementPlacements = c6State.get('MR:Placement.Placements');
        });

        afterAll(function() {
            c6State = null;
            placementPlacements = null;
        });

        it('should exist', function() {
            expect(placementPlacements).toEqual(jasmine.any(Object));
        });
    });
});
