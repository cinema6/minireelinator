(function() {
    'use strict';

    var fromJson = angular.fromJson,
        jqLite = angular.element;

    angular.module('c6.mrmaker')
        .service('VimeoPlayerService', ['$q','$window','$rootScope','c6EventEmitter',
                                        'c6UrlParser',
        function                       ( $q , $window , $rootScope , c6EventEmitter ,
                                         c6UrlParser ) {
            var service = this;

            function delegateMessage(event) {
                var data = event.data,
                    origin = c6UrlParser(event.origin),
                    player;

                if (origin.hostname !== 'player.vimeo.com') { return; }

                data = fromJson(data);

                /* jshint camelcase:false */
                player = service.players[data.player_id];
                /* jshint camelcase:true */

                if (!player) { return; }

                $rootScope.$apply(function() {
                    player._handleMessage(data);
                });
            }

            this.players = {};

            this.Player = function($iframe) {
                var self = this,
                    pending = {},
                    src = c6UrlParser($iframe.attr('src')),
                    id = (src.search.match(/player_id=((\w|-)+)/) || [])[1];

                if (!id) {
                    throw new Error(
                        'Provided iFrame has no player_id specified in the search params.'
                    );
                }

                this._handleMessage = function(data) {
                    var method = data.method,
                        event = data.event,
                        value = data.value;

                    if (method) {
                        pending[method].resolve(value);
                        delete pending[method];
                    }

                    if (event) {
                        this.emit(event, data.data);
                    }
                };

                this.call = function(method, data) {
                    var deferred = pending[method] || $q.defer(),
                        message = {
                            method: method
                        };

                    if (arguments.length > 1) {
                        message.value = data;
                    }

                    $iframe[0].contentWindow.postMessage(
                        angular.toJson(message),
                        '*'
                    );

                    switch (method) {
                    case 'play':
                    case 'pause':
                    case 'seekTo':
                    case 'unload':
                    case 'setColor':
                    case 'setLoop':
                    case 'setVolume':
                        deferred.resolve();
                        break;

                    default:
                        pending[method] = deferred;
                    }

                    return deferred.promise;
                };

                c6EventEmitter(this);

                this.on('newListener', function(event) {
                    if (event.search(
                        /^(ready|newListener|removeListener)$/
                    ) > -1) { return; }

                    self.call('addEventListener', event);
                });

                $iframe.on('$destroy', function() {
                    delete service.players[id];
                });

                service.players[id] = this;
            };

            $window.addEventListener('message', delegateMessage, false);
        }])

        .directive('vimeoPlayer', ['VimeoPlayerService','c6EventEmitter',
        function                  ( VimeoPlayerService , c6EventEmitter ) {
            return {
                restrict: 'E',
                template: [
                    '<iframe id="{{id}}"',
                    '    src="about:blank"',
                    '    width="100%"',
                    '    height="100%"',
                    '    frameborder="0"',
                    '    webkitAllowFullScreen',
                    '    mozallowfullscreen',
                    '    allowFullScreen>',
                    '</iframe>'
                ].join('\n'),
                scope: {
                    videoid: '@',
                    id: '@'
                },
                link: function(scope, $element) {
                    var $iframe = $element.find('iframe');

                    function VideoPlayer($iframe) {
                        var self = this,
                            player = null,
                            hasPaused = false,
                            state;

                        function setupState() {
                            return {
                                buffered: 0,
                                currentTime: 0,
                                duration: 0,
                                ended: false,
                                paused: true,
                                readyState: -1,
                                seeking: false
                            };
                        }

                        function addEventListeners(player) {
                            player
                                .once('loadProgress', function() {
                                    state.readyState = 3;
                                    self.emit('canplay');
                                    self.emit('loadstart');
                                })
                                .on('loadProgress', function(data) {
                                    var percent = parseFloat(data.percent);

                                    if (percent >= 0.25) {
                                        state.readyState = 4;
                                        self.emit('canplaythrough');
                                        player.removeListener('loadProgress', this);
                                    }
                                })
                                .on('loadProgress', function(data) {
                                    var percent = parseFloat(data.percent);

                                    state.buffered = percent;
                                    self.emit('progress');
                                })
                                .on('finish', function() {
                                    state.ended = true;
                                    self.emit('ended');
                                })
                                .on('pause', function() {
                                    hasPaused = true;
                                    state.paused = true;

                                    self.emit('pause');
                                })
                                .on('play', function() {
                                    state.ended = false;
                                    state.paused = false;

                                    if (hasPaused) {
                                        self.emit('play');
                                    }

                                    self.emit('playing');
                                })
                                .on('seek', function() {
                                    state.seeking = false;
                                    self.emit('seeked');
                                })
                                .on('playProgress', function(data) {
                                    var time = parseFloat(data.seconds);

                                    state.currentTime = time;
                                    self.emit('timeupdate');
                                });
                        }

                        function removeEventListeners(player) {
                            [
                                'loadProgress',
                                'finish',
                                'pause',
                                'play',
                                'seek',
                                'playProgress'
                            ].forEach(function(event) {
                                player.removeAllListeners(event);
                            });
                        }

                        this.play = function() {
                            player.call('play');
                        };

                        this.pause = function() {
                            player.call('pause');
                        };

                        Object.defineProperties(this, {
                            buffered: {
                                get: function() {
                                    return state.buffered;
                                }
                            },
                            currentTime: {
                                get: function() {
                                    return state.currentTime;
                                },
                                set: function(time) {
                                    state.seeking = true;
                                    self.emit('seeking');
                                    player.call('seekTo', time);
                                }
                            },
                            duration: {
                                get: function() {
                                    return state.duration;
                                }
                            },
                            ended: {
                                get: function() {
                                    return state.ended;
                                }
                            },
                            paused: {
                                get: function() {
                                    return state.paused;
                                }
                            },
                            readyState: {
                                get: function() {
                                    return state.readyState;
                                }
                            },
                            seeking: {
                                get: function() {
                                    return state.seeking;
                                }
                            }
                        });


                        // When the video loaded into the player changes (or is initialized,) there
                        // are a few steps that need to be taken:
                        //
                        // 1. Reset the state of the player.
                        // 2. Change the src of the iframe to the new embed URL
                        // 3. Create a new Vimeo Player object (only on initialization.)
                        // 4. Remove all non-ready event listeners (if there is already a player.)
                        scope.$watch('videoid', function(videoid, lastVideoid) {
                            state = setupState();

                            $iframe.attr('src', '//player.vimeo.com/video/' +
                                videoid +
                                '?api=1&player_id=' +
                                scope.id);

                            // This will only happen on initialization. We'll continue to use this
                            // player object, even as the src of the iframe is changed.
                            if (videoid === lastVideoid) {
                                player = new VimeoPlayerService.Player($iframe);

                                player.on('ready', function() {
                                    state.readyState = 0;
                                    self.emit('ready');
                                    addEventListeners(player);

                                    player.call('getDuration')
                                        .then(function getDuration(duration) {
                                            state.readyState = 1;
                                            state.duration = duration;
                                            self.emit('loadedmetadata');
                                        });
                                });
                            } else {
                                // This only happens when the video is changed from one to another.
                                // We remove all the non-ready event listeners (they'll be readded
                                // when the iframe's new page loads and "ready" event is emitted
                                // again.)
                                removeEventListeners(player);
                            }
                        });

                        c6EventEmitter(this);
                    }

                    $element.data('video', new VideoPlayer($iframe));
                }
            };
        }])

        .directive('youtubePlayer', ['youtube','c6EventEmitter','$interval','$compile', '$http',
        function                    ( youtube , c6EventEmitter , $interval , $compile ,  $http ) {
            return {
                restrict: 'E',
                scope: {
                    videoid: '@'
                },
                template: [
                    '<iframe width="100%"',
                    '    height="100%"',
                    '    src="{{url}}"',
                    '    frameborder="0"',
                    '    allowfullscreen>',
                    '</iframe>'
                ].join('\n'),
                compile: function($element) {
                    // Grab the string template for this directive before angular compiles it.
                    var iframeTemplate = $element.html();

                    // Remove the iframe template from the DOM. It will be created when a
                    // VideoPlayer is created.
                    $element.empty();

                    return function postLink(scope, $element) {
                        function VideoPlayer(id) {
                            var self = this,
                                hasPaused = false,
                                currentTimeInterval = null,
                                player = null,
                                seekStartTime = null,
                                publicTime = 0,
                                state;

                            function setupState() {
                                return {
                                    currentTime: 0,
                                    duration: 0,
                                    ended: false,
                                    paused: true,
                                    seeking: false,
                                    readyState: -1
                                };
                            }

                            Object.defineProperties(this, {
                                currentTime: {
                                    get: function() {
                                        return state.currentTime;
                                    },
                                    set: function(time) {
                                        if (self.readyState < 1) {
                                            throw new Error(
                                                'Can\'t seek video. Haven\'t loaded metadata.'
                                            );
                                        }

                                        seekStartTime = state.currentTime;
                                        state.seeking = true;
                                        self.emit('seeking');
                                        player.seekTo(time);
                                    }
                                },
                                duration: {
                                    get: function() {
                                        return state.duration;
                                    }
                                },
                                ended: {
                                    get: function() {
                                        return state.ended;
                                    }
                                },
                                paused: {
                                    get: function() {
                                        return state.paused;
                                    }
                                },
                                readyState: {
                                    get: function() {
                                        return state.readyState;
                                    }
                                },
                                seeking: {
                                    get: function() {
                                        return state.seeking;
                                    }
                                },
                                videoid: {
                                    get: function() {
                                        return id;
                                    }
                                }
                            });

                            this.pause = function() {
                                player.pauseVideo();
                            };

                            this.play = function() {
                                player.playVideo();
                            };

                            c6EventEmitter(this);

                            // Whenever the video loaded into the player changes (or is
                            // initialized,) a few things need to happen:
                            //
                            // 1. Set the scope's "url" property to the correct URL to load into
                            //    the iframe.
                            // 2. Create a new iframe (using the string template saved during the
                            //    compile phase.)
                            // 3. Destroy the previous iframe (if there is one.)
                            // 4. Create a new YouTube Player object for the new video.
                            scope.$watch('videoid', function(id) {
                                var $iframe;

                                scope.url = 'https://www.youtube.com/embed/' +
                                    id +
                                    '?rel=0&enablejsapi=1';

                                state = setupState();

                                $http.get('//gdata.youtube.com/feeds/api/videos/'+
                                    id+'?v=2&alt=jsonc')
                                        .then(function(data){
                                            state.duration = data.data.data.duration;
                                            state.readyState = 1;
                                            self.emit('loadedmetadata');
                                        });

                                $iframe = $compile(iframeTemplate)(scope, function($iframe) {
                                    $element.append($iframe);
                                });

                                if (player) {
                                    jqLite(player.getIframe()).remove();
                                }

                                player = new youtube.Player($iframe[0], {
                                    events: {
                                        onReady: function onReady() {
                                            state.readyState = 0;
                                            self.emit('ready');

                                            currentTimeInterval = $interval(
                                                function pollCurrentTime() {
                                                    state.currentTime = player.getCurrentTime();

                                                    if (state.currentTime !== publicTime) {
                                                        publicTime = state.currentTime;
                                                        self.emit('timeupdate');
                                                    }

                                                    if (state.seeking) {
                                                        if (state.currentTime !== seekStartTime) {
                                                            state.seeking = false;
                                                            self.emit('seeked');
                                                        }
                                                    }
                                                },
                                                250
                                            );
                                        },
                                        onStateChange: function onStateChange(event) {
                                            var PlayerState = youtube.PlayerState;

                                            switch (event.data) {
                                            case PlayerState.PLAYING:
                                                state.ended = false;
                                                state.paused = false;

                                                if (state.readyState < 2) {
                                                    state.readyState = 3;
                                                    self.emit('canplay');
                                                }

                                                if (hasPaused) {
                                                    self.emit('play');
                                                }

                                                self.emit('playing');
                                                break;

                                            case PlayerState.ENDED:
                                                state.paused = true;
                                                state.ended = true;
                                                self.emit('ended');
                                                break;

                                            case PlayerState.PAUSED:
                                                state.paused = true;
                                                self.emit('pause');
                                                hasPaused = true;
                                                break;
                                            }
                                        }
                                    }
                                });

                                $iframe.on('$destroy', function() {
                                    $interval.cancel(currentTimeInterval);
                                    self.emit('destroy');
                                });
                            });
                        }

                        $element.data('video', new VideoPlayer(scope.videoid));
                    };
                }
            };
        }]);
}());
