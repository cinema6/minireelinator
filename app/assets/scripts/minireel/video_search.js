define( ['angular','c6_state','minireel/services'],
function( angular , c6State  , services          ) {
    'use strict';

    var jqLite = angular.element;

    return angular.module('c6.app.minireel.editor.videoSearch', [c6State.name, services.name])
        .controller('VideoSearchController', ['$scope','VideoSearchService','MiniReelService',
                                              'c6State','$document','$q','VideoService',
        function                             ( $scope , VideoSearchService , MiniReelService ,
                                               c6State , $document , $q , VideoService ) {
            var self = this,
                EditorCtrl = $scope.EditorCtrl;

            function setError(error) {
                self.error = error;

                return $q.reject(error);
            }

            this.siteItems = [
                {
                    label: 'YouTube',
                    value: 'youtube'
                },
                {
                    label: 'Vimeo',
                    value: 'vimeo'
                },
                {
                    label: 'Dailymotion',
                    value: 'dailymotion'
                },
                {
                    label: 'AOL On',
                    value: 'aol'
                },
                {
                    label: 'Yahoo! Screen',
                    value: 'yahoo'
                }
            ];
            this.sites = this.siteItems.reduce(function(sites, item) {
                sites[item.value] = item.label;
                return sites;
            }, {});
            this.query = {
                query: '',
                sites: this.siteItems.reduce(function(sites, item) {
                    sites[item.value] = true;
                    return sites;
                }, {}),
                hd: false
            };
            this.scrollPosition = {
                y: 0
            };
            this.result = null;
            this.error = null;
            this.currentPreview = null;
            this.showQueryDropdown = false;
            Object.defineProperties(this, {
                addButtonText: {
                    get: function() {
                        return c6State.isActive(c6State.get('MR:EditCard')) ?
                            'Add to Slide' : 'Create Slide';
                    }
                }
            });

            this.embedCodeFor = function() {
                return VideoService.embedCodeFromData.apply(VideoService, arguments);
            };

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
                if (!this.query.query) {
                    return $q.when(null);
                }

                this.error = null;

                return VideoSearchService.find({
                    query: this.query.query,
                    hd: this.query.hd || undefined,
                    sites: Object.keys(this.sites)
                        .filter(function(site) {
                            return !!this.query.sites[site];
                        }, this)
                        .join(',')
                }).then(function assign(result) {
                    self.scrollPosition.y = 0;

                    /* jshint boss:true */
                    return (self.result = result);
                }, setError);
            };

            ['next', 'prev'].forEach(function(method) {
                this[method + 'Page'] = function() {
                    this.error = null;
                    this.togglePreview(null);

                    return this.result[method]()
                        .then(function scroll(result) {
                            self.scrollPosition.y = 0;

                            return result;
                        }, setError);
                };
            }, this);

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
