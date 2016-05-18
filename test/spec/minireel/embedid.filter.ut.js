define(['minireel/app'], function(appModule) {
    'use strict';

    describe('embedid filter', function() {
        var VideoService,
            embedid;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                VideoService = $injector.get('VideoService');
                embedid = $injector.get('embedidFilter');
            });
        });

        afterAll(function() {
            VideoService = null;
            embedid = null;
        });

        it('should exist', function() {
            expect(embedid).toEqual(jasmine.any(Function));
        });

        it('should proxy to VideoService.embedIdFromVideoId()', function() {
            [
                ['48ru394r', 'youtube'],
                ['123653446', 'vimeo'],
                ['748f34rr', 'dailymotion'],
                ['v2zdp3-ed-sheeran-dont-one-man-a-capella-parody-cover-tyler-mancuso', 'rumble']
            ].forEach(function(args) {
                expect(embedid.apply(null, args)).toBe(VideoService.embedIdFromVideoId(args[1], args[0]));
            });
        });
    });
});
