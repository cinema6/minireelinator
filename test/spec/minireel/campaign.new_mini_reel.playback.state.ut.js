define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.NewMiniReel.Playback state', function() {
        var c6State,
            creativesNewMiniReelPlayback;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                creativesNewMiniReelPlayback = c6State.get('MR:Campaign.NewMiniReel.Playback');
            });
        });

        it('should exist', function() {
            expect(creativesNewMiniReelPlayback).toEqual(jasmine.any(Object));
        });
    });
});
