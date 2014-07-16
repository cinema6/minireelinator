(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('VideoState', function() {
            var $injector,
                c6State,
                VideoState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    VideoState = c6State.get('MR:EditCard.Video');
                });
            });

            it('should exist', function() {
                expect(VideoState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
