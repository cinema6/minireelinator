define(['app'], function(appModule) {
    'use strict';

    describe('MR:Placement.MiniReel state', function() {
        var $rootScope,
            c6State,
            SettingsService,
            EditorService,
            placementMiniReel;

        var model;

        beforeEach(function() {
            model = {
                data: {
                    splash: {
                        ratio: '16-9',
                        theme: 'img-only',
                        source: 'generated'
                    },
                    deck: []
                }
            };

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
                EditorService = $injector.get('EditorService');
            });

            SettingsService.register('MR::user', {
                minireelDefaults: {
                    splash: {
                        ratio: '16-9',
                        theme: 'img-only',
                        source: 'generated'
                    }
                }
            }, {
                localSync: false
            });
            SettingsService.register('MR::org', {
                minireelDefaults: {
                    mode: 'lightbox-ads',
                    autoplay: true
                }
            }, {
                localSync: false
            });


            placementMiniReel = c6State.get('MR:Placement.MiniReel');
        });

        afterAll(function() {
            $rootScope = null;
            c6State = null;
            SettingsService = null;
            EditorService = null;
            placementMiniReel = null;
            model = null;
        });

        it('should exist', function() {
            expect(placementMiniReel).toEqual(jasmine.any(Object));
        });

        describe('afterModel()', function() {
            beforeEach(function() {
                spyOn(EditorService, 'open').and.callThrough();

                placementMiniReel.cModel = model;
                $rootScope.$apply(function() {
                    placementMiniReel.afterModel(model);
                });
            });

            it('should open the minireel', function() {
                expect(EditorService.open).toHaveBeenCalledWith(model);
            });

            it('should make the proxy the new model', function() {
                expect(placementMiniReel.cModel).toBe(EditorService.state.minireel);
            });
        });
    });
});
