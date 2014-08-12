define(['app'], function(appModule) {
    'use strict';

    describe('MR:VideoSearch state', function() {
        var c6State,
            videoSearch;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                videoSearch = c6State.get('MR:VideoSearch');
            });
        });

        it('should exist', function() {
            expect(videoSearch).toEqual(jasmine.any(Object));
        });
    });
});
