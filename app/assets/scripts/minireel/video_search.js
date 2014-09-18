define( ['angular','c6_state','minireel/services'],
function( angular , c6State  , services          ) {
    'use strict';

    var jqLite = angular.element;

    return angular.module('c6.app.minireel.editor.videoSearch', [c6State.name, services.name])
        .controller('VideoSearchController', ['$scope','VideoSearchService','MiniReelService',
                                              'c6State','$document',
        function                             ( $scope , VideoSearchService , MiniReelService ,
                                               c6State , $document ) {
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

            this.togglePreview = function(video) {
                /* jshint boss:true */
                return this.currentPreview = (this.currentPreview === video ?
                    null : video);
            };

            this.addVideo = function(video, id) {
                var card = MiniReelService.createCard('video');

                card.data.service = video.site;
                card.data.videoid = video.videoid;

                return c6State.$emitThroughStates('VideoSearchCtrl:addVideo', card, id);
            };

            (function() {
                var cache = [];

                function generateId(video) {
                    return cache[cache.push({
                        video: video,
                        id: (Math.random() + 1).toString(36).substring(5)
                    }) - 1].id;
                }

                this.idFor = function(video) {
                    return cache.reduce(function(id, item) {
                        return item.video === video ? item.id : id;
                    }, null) || generateId(video);
                };

                this.videoWithID = function(id) {
                    return cache.reduce(function(video, item) {
                        return item.id === id ? item.video : video;
                    }, null);
                };
            }.call(this));

            this.close = function() {
                EditorCtrl.toggleSearch();
                return this.togglePreview(null);
            };

            this.setupDraggables = function(DragCtrl) {
                var document = $document[0];

                function findDropZoneId($element) {
                    var matcher = (/^((rc-[a-z0-9]{14})|(new-slide)|(edit-card-modal))$/),
                        id = $element.attr('id');

                    if (matcher.test(id) || $element.length < 1) {
                        return id || null;
                    } else {
                        return findDropZoneId($element.parent());
                    }
                }

                function handleDraggableDropStart(draggable, origin) {
                    var id = findDropZoneId(jqLite(document.elementFromPoint(
                        origin.x, origin.y
                    )));

                    if ((/^((new-slide)|(edit-card-modal))$/).test(id)) {
                        self.addVideo(self.videoWithID(draggable.id));
                    } else if (id) {
                        self.addVideo(self.videoWithID(draggable.id), id);
                    }
                }

                DragCtrl.on('draggableAdded', function(draggable) {
                    var $clone = null;

                    draggable
                        .on('begin', function() {
                            $clone = draggable.$element.clone();

                            $clone.removeClass('c6-dragging');
                            draggable.$element.after($clone);
                        })
                        .on('dropStart', function(draggable, origin) {
                            var display = draggable.$element.css('display');

                            draggable.$element.css('display', 'none');
                            handleDraggableDropStart(draggable, origin);
                            draggable.$element.css('display', display);
                        })
                        .on('end', function() {
                            $clone.remove();
                        });
                });
            };

            $scope.$on('EditorCtrl:searchQueued', function($event, query) {
                self.query.query = query;
                self.search();
            });
        }]);
});
