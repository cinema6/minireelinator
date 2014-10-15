define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Endcap state', function() {
        var c6State,
            SettingsService,
            EditorService,
            sponsorMiniReel,
            sponsorMiniReelEndcap;

        var minireel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
                EditorService = $injector.get('EditorService');
            });

            SettingsService.register('MR::user', {
                minireelDefaults: {
                    splash: {
                        ratio: '1-1',
                        theme: 'img-text-overlay',
                        source: 'specified'
                    }
                }
            }, {
                localSync: false
            });

            sponsorMiniReel = c6State.get('MR:SponsorMiniReel');
            sponsorMiniReel.cModel = {
                data: {
                    splash: {
                        ratio: '1-1',
                        theme: 'img-text-overlay',
                        source: 'specified'
                    },
                    deck: [
                        {
                            data: {}
                        },
                        {
                            data: {}
                        },
                        {
                            data: {}
                        }
                    ]
                }
            };
            minireel = EditorService.open(sponsorMiniReel.cModel);

            sponsorMiniReelEndcap = c6State.get('MR:SponsorMiniReel.Endcap');
        });

        it('should exist', function() {
            expect(sponsorMiniReelEndcap).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = sponsorMiniReelEndcap.model();
            });

            it('should be the last card in the minireel', function() {
                expect(result).toBe(minireel.data.deck[minireel.data.deck.length - 1]);
            });
        });
    });
});
