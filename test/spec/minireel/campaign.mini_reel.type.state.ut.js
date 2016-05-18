define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Campaign.MiniReel.Type','MR:Edit:Campaign.MiniReel.Type'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                miniReel,
                creativesMiniReelType;

            var appConfig;

            beforeEach(function() {
                appConfig = {
                    data: {
                        modes: [
                            {
                                name: 'View in a lightbox',
                                value: 'lightbox',
                                modes: [
                                    {
                                        name: 'Lightbox Player',
                                        value: 'lightbox'
                                    },
                                    {
                                        name: 'Lightbox, with Playlist',
                                        disabled: false,
                                        value: 'lightbox-playlist'
                                    }
                                ]
                            },
                            {
                                name: 'View within the web page',
                                value: 'inline',
                                modes: [
                                    {
                                        name: 'Embedded',
                                        value: 'light'
                                    },
                                    {
                                        name: 'Embedded, Heavy Text',
                                        value: 'full',
                                        deprecated: true
                                    }
                                ]
                            }
                        ],
                    }
                };

                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');

                    miniReel = c6State.get('MiniReel');
                    miniReel.cModel = appConfig;

                    creativesMiniReelType = c6State.get(stateName);
                });
            });

            afterAll(function() {
                c6State = null;
                miniReel = null;
                creativesMiniReelType = null;
                appConfig = null;
            });

            it('should exist', function() {
                expect(creativesMiniReelType).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    result = creativesMiniReelType.model();
                });

                it('should return an array of all the possible modes', function() {
                    var modes = appConfig.data.modes;

                    expect(result).toEqual([
                        modes[0].modes[0],
                        modes[0].modes[1],
                        modes[1].modes[0]
                    ]);
                });
            });
        });
    });
});
