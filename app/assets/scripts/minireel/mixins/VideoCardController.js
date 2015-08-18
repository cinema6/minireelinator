define ([],
function() {
    'use strict';

    VideoCardController.$inject = ['VideoService'];
    function VideoCardController  ( VideoService ) {
        (function() {
            var val;

            Object.defineProperty(this, 'videoUrl', {
                enumerable: true,
                configurable: true,
                get: function() {
                    var service = this.model.data.service,
                        id = this.model.data.videoid;

                    return VideoService.urlFromData(service, id) || val;
                },
                set: function(value) {
                    var info = VideoService.dataFromText(value) || {
                        service: null,
                        id: null
                    };

                    val = value;

                    this.model.data.service = info.service;
                    this.model.data.videoid = info.id;
                }
            });
        }.call(this));
    }

    return VideoCardController;
});
