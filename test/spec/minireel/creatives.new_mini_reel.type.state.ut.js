define(['app'], function(appModule) {
    'use strict';

    describe('MR:Creatives.NewMiniReel.Type state', function() {
        var c6State,
            miniReel,
            creativesNewMiniReelType;

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

                creativesNewMiniReelType = c6State.get('MR:Creatives.NewMiniReel.Type');
            });
        });

        it('should exist', function() {
            expect(creativesNewMiniReelType).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = creativesNewMiniReelType.model();
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
