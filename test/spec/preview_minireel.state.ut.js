define(['app'], function(appModule) {
    'use strict';

    describe('PreviewMiniReel state', function() {
        var c6State,
            $location,
            previewMiniReel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                $location = $injector.get('$location');
            });

            previewMiniReel = c6State.get('PreviewMiniReel');
        });

        it('should exist', function() {
            expect(previewMiniReel).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                spyOn($location, 'search').and.returnValue({
                    exp: 'e-66d87b2a7dbf25',
                    preload: true,
                    splash: 'img-only:1/1'
                });

                result = previewMiniReel.model();
            });

            it('should be a copy of the query params', function() {
                expect(result).toEqual($location.search());
                expect(result).not.toBe($location.search());
            });
        });
    });
});
