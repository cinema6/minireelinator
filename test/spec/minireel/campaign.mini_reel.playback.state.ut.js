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

                    creativesMiniReelPlayback = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(creativesMiniReelPlayback).toEqual(jasmine.any(Object));
            });
        });
    });
});
