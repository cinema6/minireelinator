define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Campaign.MiniReel.Playback','MR:Edit:Campaign.MiniReel.Playback'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                creativesMiniReelPlayback;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');

                    creativesNewMiniReelPlayback = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(creativesNewMiniReelPlayback).toEqual(jasmine.any(Object));
            });
        });
    });
});
