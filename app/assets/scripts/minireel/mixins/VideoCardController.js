define (['angular'],
function( angular ) {
    'use strict';

    var extend = angular.extend;

    VideoCardController.$inject = ['VideoService'];
    function VideoCardController  ( VideoService ) {
        (function() {
            var val;

            Object.defineProperty(this, 'videoUrl', {
                enumerable: true,
                configurable: true,
                get: function() {
                    var data = this.model.data,
                        service = data.service,
                        id = data.videoid;

                    return VideoService.urlFromData(service, id, data) || val;
                },
                set: function(value) {
                    var info = VideoService.dataFromText(value) || {
                        service: null,
                        id: null,
                        data: { }
                    };

                    val = value;

                    this.model.data.service = info.service;
                    this.model.data.videoid = info.id;
                    extend(this.model.data, info.data);
                }
            });
        }.call(this));
    }

    return VideoCardController;
});
