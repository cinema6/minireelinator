define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.DisplayAd state', function() {
        var c6State,
            SettingsService,
            EditorService,
            sponsorMiniReel,
            sponsorMiniReelDisplayAd;

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

            sponsorMiniReelDisplayAd = c6State.get('MR:SponsorMiniReel.DisplayAd');
        });

        it('should exist', function() {
            expect(sponsorMiniReelDisplayAd).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = sponsorMiniReelDisplayAd.model();
            });

            it('should be the deck', function() {
                expect(result).toBe(minireel.data.deck);
            });
        });
    });
});
