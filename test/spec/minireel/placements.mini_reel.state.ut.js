define(['app'], function(appModule) {
    'use strict';

    describe('MR:Placements.MiniReel state', function() {
        var c6State,
            campaignPlacements,
            placementsMiniReel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignPlacements = c6State.get('MR:Campaign.Placements');
                placementsMiniReel = c6State.get('MR:Placements.MiniReel');
            });
        });

        it('should exist', function() {
            expect(placementsMiniReel).toEqual(jasmine.any(Object));
        });

        describe('serializeParams(model)', function() {
            var model, result;

            beforeEach(function() {
                model = {
                    minireel: {
                        id: 'e-80423ea68cbb41'
                    }
                };

                result = placementsMiniReel.serializeParams(model);
            });

            it('should return the id of the minireel', function() {
                expect(result).toEqual({
                    minireelId: model.minireel.id
                });
            });
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                var mrId = 'e-fc93c4b4bc6ee1';

                campaignPlacements.cModel = ['e-f18855c72caf68', mrId, 'e-015b77ad329744'].map(function(id) {
                    return {
                        minireel: {
                            id: id,
                            data: {
                                deck: []
                            }
                        },
                        cards: [
                            {
                                placeholder: {
                                    id: 'rc-8f8f81582f62ab'
                                },
                                wildcard: {
                                    id: 'rc-643f7afaf3bf92'
                                }
                            },
                            {
                                placeholder: {
                                    id: 'rc-cff9c01398df89'
                                },
                                wildcard: null
                            },
                            {
                                placeholder: {
                                    id: 'rc-7e4acbc58262fb'
                                },
                                wildcard: {
                                    id: 'rc-4506b2c0f51d61'
                                }
                            }
                        ]
                    };
                });

                result = placementsMiniReel.model({
                    minireelId: mrId
                });
            });

            it('should returnthe map entry with the provided minireel id', function() {
                var entry = campaignPlacements.cModel[1];

                expect(result).toBe(entry);
            });
        });
    });
});
