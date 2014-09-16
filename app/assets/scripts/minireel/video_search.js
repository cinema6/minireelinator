define( ['angular','c6_state','minireel/services'],
function( angular , c6State  , services          ) {
    'use strict';

    return angular.module('c6.app.minireel.editor.videoSearch', [c6State.name, services.name])
        .controller('VideoSearchController', ['$scope','VideoSearchService','MiniReelService',
                                              'c6State',
        function                             ( $scope , VideoSearchService , MiniReelService ,
                                               c6State ) {
            var self = this,
                EditorCtrl = $scope.EditorCtrl;

            this.query = {
                query: '',
                sites: {
                    youtube: true,
                    vimeo: true,
                    dailymotion: true
                },
                hd: false
            };
            this.result = null;
            this.currentPreview = null;
            this.sites = {
                youtube: 'YouTube',
                vimeo: 'Vimeo',
                dailymotion: 'Dailymotion'
            };
            this.showQueryDropdown = false;

            this.toggleProp = function(object, prop) {
                if (arguments.length < 2) {
                    prop = object;
                    object = this;
                }

                object[prop] = !object[prop];
            };

            this.toggleQueryDropdown = function() {
                return this.toggleProp('showQueryDropdown');
            };

            this.search = function() {
                return VideoSearchService.find({
                    query: this.query.query,
                    hd: this.query.hd || undefined,
                    sites: ['youtube', 'vimeo', 'dailymotion']
                        .filter(function(site) {
                            return !!this.query.sites[site];
                        }, this)
                        .join(',')
                }).then(function assign(result) {
                    /* jshint boss:true */
                    return (self.result = result);
                });
            };

            this.preview = function(video) {
                /* jshint boss:true */
                return this.currentPreview = video;
            };

            this.addVideo = function(video) {
                var card = MiniReelService.createCard('video');

                card.title = video.title;
                card.note = video.description;
                card.data.service = video.site;
                card.data.videoid = video.videoid;

                return c6State.$emitThroughStates('VideoSearchCtrl:addVideo', card);
            };

            this.idFor = (function() {
                var cache = [];

                function generateId(video) {
                    return cache[cache.push({
                        video: video,
                        id: (Math.random() + 1).toString(36).substring(5)
                    }) - 1].id;
                }

                return function(video) {
                    return cache.reduce(function(id, item) {
                        return item.video === video ? item.id : id;
                    }, null) || generateId(video);
                };
            }());

            this.close = function() {
                EditorCtrl.toggleSearch();
                return this.preview(null);
            };

            this.setupDraggables = function(DragCtrl) {
                DragCtrl.on('draggableAdded', function(draggable) {
                    var $clone = null;

                    draggable
                        .on('begin', function() {
                            $clone = draggable.$element.clone();

                            $clone.removeClass('c6-dragging');
                            draggable.$element.after($clone);
                        })
                        .on('end', function() {
                            $clone.remove();
                        });
                });
            };
        }]);
});
