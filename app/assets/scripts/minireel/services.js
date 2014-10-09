define( ['angular','c6ui','cryptojs'],
function( angular , c6ui , cryptojs ) {
    'use strict';

    var forEach = angular.forEach,
        ngCopy = angular.copy,
        isNumber = angular.isNumber,
        isUndefined = angular.isUndefined,
        isDefined = angular.isDefined,
        extend = angular.extend,
        isFunction = angular.isFunction,
        fromJson = angular.fromJson,
        isArray = angular.isArray;

    function mapObject(object, fn) {
        return Object.keys(object)
            .reduce(function(result, key) {
                var data = fn(object[key], key, object);

                result[data[0]] = data[1];

                return result;
            }, {});
    }

    function capitalize(word) {
        return word.slice(0, 1).toUpperCase() + word.slice(1);
    }

    function camelcaseify(object) {
        return mapObject(object, function(value, key) {
            var words = key.split('_');

            return [
                words.slice(0, 1)
                    .concat(words.slice(1)
                        .map(capitalize))
                    .join(''),
                value
            ];
        });
    }

    function flatten() {
        var args = Array.prototype.slice.call(arguments),
            lengths = args.map(function(array) { return array.length; }),
            longestArray = args[lengths.indexOf(Math.max.apply(null, lengths))];

        return longestArray.map(function(item, index) {
            return args.reduce(function(result, array) {
                return array[index] || result;
            }, null);
        });
    }

    return angular.module('c6.app.minireel.services', [c6ui.name])
        .factory('requireCJS', ['$http','$cacheFactory','$q',
        function               ( $http , $cacheFactory , $q ) {
            var cache = $cacheFactory('requireCJS');

            return function(src) {
                return $q.when(
                    cache.get(src) ||
                    cache.put(src, $http.get(src)
                        .then(function getModule(response) {
                            var module = {
                                exports: {}
                            };

                            /* jshint evil:true */
                            eval(response.data);
                            /* jshint evil:false */

                            return module.exports;
                        }))
                );
            };
        }])

        .factory('scopePromise', ['$q',
        function                 ( $q ) {
            function ScopedPromise(promise, initialValue) {
                var self = this,
                    myPromise = promise
                        .then(function setValue(value) {
                            self.value = value;
                            return self;
                        }, function setError(reason) {
                            self.error = reason;
                            return $q.reject(self);
                        });

                this.promise = promise;

                this.value = initialValue;
                this.error = null;

                this.ensureResolution = function() {
                    return myPromise;
                };
            }

            return function(promise, initialValue) {
                return new ScopedPromise(promise, initialValue || null);
            };
        }])

        .provider('CollateralService', [function() {
            var defaultCollageWidth = null,
                ratios = [];

            this.defaultCollageWidth = function(width) {
                defaultCollageWidth = width;

                return this;
            };

            this.ratios = function(ratioData) {
                ratios = ratioData;

                return this;
            };

            this.$get = ['FileService','$http','VideoThumbnailService','$q',
            function    ( FileService , $http , VideoThumbnailService , $q ) {
                function CollateralService() {
                    function CollageResult(response) {
                        forEach(response, function(data) {
                            this[data.ratio] = '/' + data.path;
                        }, this);
                    }
                    CollageResult.prototype = {
                        toString: function() {
                            return Object.keys(this).map(function(ratio) {
                                return this[ratio];
                            }, this).join(',');
                        }
                    };

                    this.set = function(key, file, experience) {
                        var promise;

                        function setResult(response) {
                            var data = experience.data;

                            (data.collateral || (data.collateral = {}))[key] =
                                '/' + response.data[0].path;

                            return experience;
                        }

                        function updateProgress(progress) {
                            promise.progress = progress;

                            return progress;
                        }

                        file = FileService.open(file);
                        file.name = key;

                        promise = FileService.upload(
                            '/api/collateral/files/' + experience.id + '?noCache=true',
                            [file]
                        ).then(setResult, null, updateProgress);

                        return promise;
                    };

                    this.generateCollage = function(options) {
                        var minireel = options.minireel,
                            name = options.name,
                            width = options.width || defaultCollageWidth,
                            allRatios = options.allRatios,
                            cache = isUndefined(options.cache) ? true : options.cache,
                            ratio = minireel.data.splash.ratio.split('-');

                        function fetchThumbs(minireel) {
                            return $q.all(minireel.data.deck.map(function(card) {
                                return VideoThumbnailService.getThumbsFor(
                                    card.data.service,
                                    card.data.videoid
                                ).ensureFulfillment();
                            })).then(function map(thumbs) {
                                return thumbs.map(function(thumb) {
                                    return thumb.large;
                                }).filter(function(src) {
                                    return !!src;
                                });
                            });
                        }

                        function generateCollage(thumbs) {
                            return $http.post('/api/collateral/splash/' + minireel.id, {
                                imageSpecs: allRatios ?
                                ratios.map(function(ratio) {
                                    var ratioData = ratio.split('-');

                                    return {
                                        name: name + '--' + ratio,
                                        width: width,
                                        height: width * (ratioData[1] / ratioData[0]),
                                        ratio: ratio
                                    };
                                }) :
                                [
                                    {
                                        name: name,
                                        width: width,
                                        height: width * (ratio[1] / ratio[0]),
                                        ratio: ratio.join('-')
                                    }
                                ],
                                thumbs: thumbs
                            }, {
                                params: cache ? null : {
                                    noCache: true
                                }
                            }).then(function returnResult(response) {
                                return new CollageResult(response.data);
                            });
                        }

                        return fetchThumbs(minireel)
                            .then(generateCollage);
                    };
                }

                return new CollateralService();
            }];
        }])

        .service('FileService', ['$window','$q','$rootScope',
        function                ( $window , $q , $rootScope ) {
            var URL = $window.URL,
                FormData = $window.FormData,
                XMLHttpRequest = $window.XMLHttpRequest;

            var wrappers = [];

            function FileWrapper(file) {
                this.file = file;
                this.url = URL.createObjectURL(file);
                this.name = file.name;
            }
            FileWrapper.prototype = {
                close: function() {
                    URL.revokeObjectURL(this.url);

                    wrappers.splice(wrappers.indexOf(this), 1);
                }
            };

            this.open = function(file) {
                function findWrapperForFile(file) {
                    return wrappers.filter(function(wrapper) {
                        return wrapper.file === file;
                    })[0];
                }

                return findWrapperForFile(file) ||
                    wrappers[wrappers.push(new FileWrapper(file)) - 1];
            };

            this.upload = function(url, fileWrappers) {
                var deferred = $q.defer(),
                    data = new FormData(),
                    xhr = new XMLHttpRequest();

                forEach(fileWrappers, function(wrapper, index) {
                    data.append('image' + index, wrapper.file, wrapper.name);
                });

                xhr.open('POST', url);

                xhr.onreadystatechange = function() {
                    if (xhr.readyState < 4) { return; }

                    $rootScope.$apply(function() {
                        var data;

                        try {
                            data = fromJson(xhr.response);
                        } catch(e) {
                            data = xhr.response;
                        }

                        deferred[ xhr.status < 400 ?
                            'resolve' : 'reject']({
                                data: data,
                                status: xhr.status,
                                statusText: xhr.statusText
                            });
                    });
                };
                xhr.upload.onprogress = function(event) {
                    $rootScope.$apply(function() {
                        var progress = {
                            uploaded: event.loaded
                        };

                        if (event.lengthComputable) {
                            progress.total = event.total;
                            progress.complete = progress.uploaded / progress.total;
                        }

                        deferred.notify(progress);
                    });
                };

                xhr.send(data);

                return deferred.promise;
            };
        }])

        .service('VoteService', ['cinema6','$q','$log',
        function                ( cinema6 , $q , $log ) {
            function hasElectionData(deck){
                var hasData = false;
                forEach(deck,function(card){
                    if ((!hasData) &&
                        ((card.modules || []).indexOf('ballot') >= 0) &&
                        (card.ballot) &&
                        (card.ballot.choices)) {
                        $log.info('Card has ballot data:',card);
                        hasData = true;
                    }
                });
                return hasData;
            }

            function generateData(deck, election) {
                var useArrayStorage = true;

                function cardWithId(id) {
                    return deck.filter(function(card) {
                        return card.id === id;
                    })[0];
                }

                election = election || {
                    ballot: {}
                };

                forEach(election.ballot,function(vals){
                    if ((useArrayStorage === true) && (!isArray(vals))){
                        useArrayStorage = false;
                    }
                });

                forEach(deck, function(card) {
                    var item;

                    if ((card.modules || []).indexOf('ballot') < 0) {
                        return;
                    }

                    item = election.ballot[card.id] || (useArrayStorage ? [] : {});

                    forEach(card.ballot.choices, function(choice,index) {
                        if (angular.isArray(item)){
                            item[index] = item[index] || 0;
                        } else {
                            item[choice] = item[choice] || 0;
                        }
                    });

                    election.ballot[card.id] = item;
                });

                forEach(Object.keys(election.ballot), function(id) {
                    var card = cardWithId(id),
                        shouldHaveBallot = !!card && (card.modules || []).indexOf('ballot') > -1;

                    if (!shouldHaveBallot) {
                        delete election.ballot[id];
                    }
                });

                return election;
            }

            this.initialize = function(minireel) {
                $log.info('Attempt initialize minireel election');
                if (hasElectionData(minireel.data.deck) === false){
                    $log.info('Minireel has no election data, return without create');
                    return $q.when(null);
                }
                $log.info('Minireel has election data, create');
                return cinema6.db.create('election', generateData(minireel.data.deck))
                    .save()
                    .then(function attachId(election) {
                        minireel.data.election = election.id;

                        return election;
                    });
            };

            this.update = function(minireel) {
                $log.info('Attempt update minireel election: ' + minireel.data.election);
                if (hasElectionData(minireel.data.deck) === false){
                    $log.info('Minireel has no election data, return without update');
                    return $q.when(null);
                }
                $log.info('Minireel has no election data, update');
                return cinema6.db.findAll('election', { id: minireel.data.election })
                    .then(function updateElection(elections) {
                        return generateData(minireel.data.deck, elections[0]);
                    })
                    .then(function saveElection(election) {
                        if (election) {
                            return election.save();
                        } else {
                            return null;
                        }
                    });
            };
        }])

        .provider('YouTubeDataService', [function() {
            var apiKey = null;

            function identity(arg) {
                return arg;
            }

            function first(array) {
                return array[0];
            }

            // Example duration: "PT4H6M33S"
            // Further comments show the return value of each step in
            // the chain if this string was passed to this function.
            function durationToSeconds(duration) {
                // Get all numerical parts of duration as an array
                return duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/).slice(1) // ["4", "6", "33"]
                    // If any durations are not specified, default them to 0
                    .map(function(num) {
                        return num || 0;
                    })
                    // Convert strings to numbers
                    .map(parseFloat) // [4, 6, 33]
                    // Reverse the numbers
                    .reverse() // [33, 6, 4]
                    // Now, first item is seconds, second item is
                    // minutes, third item is hours. Convert to seconds:
                    .reduce(function(total, next, index) {
                        var multiplyer = Math.pow(60, index);

                        return total + (next * multiplyer);
                    }, 0); // 14793
            }

            function returnData(response) {
                return response.data;
            }

            function returnItems(data) {
                return data.items;
            }

            function processItem(item) {
                var properties = {
                    'contentDetails.duration': durationToSeconds
                };

                forEach(properties, function(fn, prop) {
                    var parts = prop.split('.'),
                        finalProp = parts.pop(),
                        object = parts.reduce(function(object, part) {
                            return object && object[part];
                        }, item);

                    if (object && object.hasOwnProperty(finalProp)) {
                        object[finalProp] = fn(object[finalProp]);
                    }
                });

                return item;
            }

            function processAllItems(items) {
                return items.map(processItem);
            }

            // Returns a new object with all the props/values of
            // "object" and the props/values of "defs" if "object" does
            // not have that property
            function defaults(defs, object) {
                // Get an array of the properties of the defaults and of
                // the provided object
                return Object.keys(defs).concat(Object.keys(object))
                    // Remove duplicate properties
                    .filter(function(prop, index, self) {
                        return self.indexOf(prop) === index;
                    })
                    .reduce(function(built, prop) {
                        // Create an object that has the default values
                        // if necessary
                        if (object.hasOwnProperty(prop)) {
                            built[prop] = object[prop];
                        } else {
                            built[prop] = defs[prop];
                        }

                        return built;
                    }, {});
            }

            Videos.$inject = ['get','expectResult'];
            function Videos  ( get , expectResult ) {
                this.list = function(config) {
                    var manyVideos = isArray(config.id),
                        // If "part" is not provided, set default to
                        // "snippet"
                        params = defaults({
                            part: 'snippet'
                        }, Object.keys(config).reduce(function(params, prop) {
                            var value = config[prop];

                            // Convert any arrays in the config to a CSV
                            // string
                            params[prop] = isArray(value) ? value.join(',') : value;
                            return params;
                        }, {}));

                    return get('videos', { params: params })
                        .then(returnData)
                        .then(returnItems)
                        .then(processAllItems)
                        .then(manyVideos ? identity : first)
                        .then(manyVideos ? identity : expectResult({
                            code: 404,
                            message: 'No video was found.'
                        }));
                };
            }

            this.apiKey = function(key) {
                /* jshint boss:true */
                return (apiKey = key);
            };

            this.$get = ['$injector','$http','$q',
            function    ( $injector , $http , $q ) {
                var locals = {
                    get: get,
                    expectResult: expectResult
                };

                function expectResult(message) {
                    return function(value) {
                        return isDefined(value) ? value : $q.reject(message);
                    };
                }

                function get(_url, config) {
                    var url = 'https://www.googleapis.com/youtube/v3/' + _url;

                    config.params.key = apiKey;

                    return $http.get(url, config);
                }

                return {
                    videos: $injector.instantiate(Videos, locals)
                };
            }];
        }])

        .service('VimeoDataService', ['$http',
        function                     ( $http ) {
            function first(array) {
                return array[0];
            }

            function returnData(response) {
                return response.data;
            }

            function processProperty(prop, value) {
                switch (prop) {
                    case 'tags':
                        return value.split(/,\s*/);
                    default:
                        return value;
                }
            }

            function processObject(object) {
                return mapObject(object, function(value, key) {
                    return [key, processProperty(key, value)];
                });
            }

            this.getVideo = function(id) {
                return $http.get('//vimeo.com/api/v2/video/' + id + '.json')
                    .then(returnData)
                    .then(first)
                    .then(camelcaseify)
                    .then(processObject);
            };
        }])

        .service('DailymotionDataService', ['$http',
        function                           ( $http ) {
            function snakecaseify(string) {
                return string.match(/[A-Z]?[^A-Z]+/g)
                    .map(function(word) { return word.toLowerCase(); })
                    .join('_');
            }

            function returnData(response) {
                return response.data;
            }

            function processProperty(prop, value) {
                switch (prop) {
                case 'createdTime':
                    return new Date(value * 1000);
                default:
                    return value;
                }
            }

            function processObject(object) {
                return mapObject(object, function(value, key) {
                    return [key, processProperty(key, value)];
                });
            }

            function VideoFetcher(id) {
                this.id = id;
            }
            VideoFetcher.prototype = {
                get: function(query) {
                    return $http.get('https://api.dailymotion.com/video/' + this.id, {
                        params: mapObject(query, function(value, key) {
                            return [
                                snakecaseify(key),
                                isArray(value) ?
                                    value.map(snakecaseify).join(',') :
                                    value
                            ];
                        })
                    }).then(returnData)
                        .then(camelcaseify)
                        .then(processObject);
                }
            };

            this.video = function(id) {
                return new VideoFetcher(id);
            };
        }])

        .service('VideoDataService', ['$q','YouTubeDataService','VimeoDataService',
                                      'DailymotionDataService',
        function                     ( $q , YouTubeDataService , VimeoDataService ,
                                       DailymotionDataService ) {
            this.getVideos = function(config) {
                function idsOfType(list, type) {
                    return list.map(function(pair) {
                        return pair[0] === type ? pair[1] : null;
                    });
                }

                function resolveFromYouTube(list) {
                    function YouTubeResult(data) {
                        this.service = 'youtube';

                        this.views = parseInt(data.statistics.viewCount);
                    }

                    return YouTubeDataService.videos.list({
                        part: ['statistics'],
                        id: list.filter(function(id) {
                            return !!id;
                        })
                    }).then(function(videos) {
                        return list.map(function(id) {
                            return id && new YouTubeResult(videos.shift());
                        });
                    });
                }

                function resolveFromVimeo(list) {
                    function VimeoResult(data) {
                        this.service = 'vimeo';

                        this.views = data.statsNumberOfPlays;
                    }

                    return $q.all(list.map(function(id) {
                        return id && VimeoDataService.getVideo(id)
                            .then(function(data) {
                                return new VimeoResult(data);
                            });
                    }));
                }

                function resolveFromDailymotion(list) {
                    function DailymotionResult(data) {
                        this.service = 'dailymotion';

                        this.views = data.viewsTotal;
                    }

                    return $q.all(list.map(function(id) {
                        return id && DailymotionDataService.video(id).get({
                            fields: ['viewsTotal']
                        }).then(function(data) {
                            return new DailymotionResult(data);
                        });
                    }));
                }

                return $q.all([
                    resolveFromYouTube(idsOfType(config, 'youtube')),
                    resolveFromVimeo(idsOfType(config, 'vimeo')),
                    resolveFromDailymotion(idsOfType(config, 'dailymotion'))
                ]).then(function(results) {
                    return flatten.apply(null, results);
                });
            };
        }])

        .service('VideoThumbnailService', ['$q','$cacheFactory','$http',
        function                          ( $q , $cacheFactory , $http ) {
            var _private = {},
                cache = $cacheFactory('VideoThumbnailService:models');

            function ThumbModel(promise) {
                var self = this;

                this.small = null;
                this.large = null;

                this.ensureFulfillment = function() {
                    return promise;
                };

                promise = promise.then(function setThumbs(thumbs) {
                    self.small = thumbs.small;
                    self.large = thumbs.large;

                    return self;
                });
            }

            _private.fetchYouTubeThumbs = function(videoid) {
                return $q.when({
                    small: '//img.youtube.com/vi/' + videoid + '/2.jpg',
                    large: '//img.youtube.com/vi/' + videoid + '/0.jpg'
                });
            };

            _private.fetchVimeoThumbs = function(videoid) {
                return $http.get('//vimeo.com/api/v2/video/' + videoid + '.json')
                    .then(function handleResponse(response) {
                        var data = response.data[0];

                        return {
                            /* jshint camelcase:false */
                            small: data.thumbnail_small,
                            large: data.thumbnail_large
                            /* jshint camelcase:true */
                        };
                    });
            };

            _private.fetchDailyMotionThumbs = function(videoid) {
                return $http.get(
                    'https://api.dailymotion.com/video/' +
                    videoid +
                    '?fields=thumbnail_120_url,thumbnail_url&ssl_assets=1'
                ).then(function handleResponse(response) {
                    var data = response.data;

                    return {
                        /* jshint camelcase:false */
                        small: data.thumbnail_120_url,
                        large: data.thumbnail_url
                        /* jshint camelcase:true */
                    };
                });
            };

            this.getThumbsFor = function(service, videoid) {
                var key = service + ':' + videoid;

                return cache.get(key) ||
                    cache.put(key, (function() {
                        switch (service) {
                        case 'youtube':
                            return new ThumbModel(_private.fetchYouTubeThumbs(videoid));
                        case 'vimeo':
                            return new ThumbModel(_private.fetchVimeoThumbs(videoid));
                        case 'dailymotion':
                            return new ThumbModel(_private.fetchDailyMotionThumbs(videoid));
                        default:
                            return new ThumbModel($q.when({
                                small: null,
                                large: null
                            }));
                        }
                    }()));
            };

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .service('VideoErrorService', ['YouTubeDataService','$q','$cacheFactory',
        function                      ( YouTubeDataService , $q , $cacheFactory ) {
            var cache = $cacheFactory('VideoErrorServiceCache');

            function VideoError(promise) {
                var self = this;

                this.code = null;
                this.message = null;
                this.present = false;

                promise.then(function(error) {
                    if (!error) { return; }

                    error.forEach(function(part, index) {
                        self[this[index]] = part;
                    }, ['code', 'message']);
                    self.present = true;
                });
            }

            function checkForYouTubeErrors(videoid) {
                return YouTubeDataService.videos.list({
                    id: videoid,
                    part: ['status']
                }).then(function(data) {
                    if (!data.status.embeddable) {
                        return [403, 'Embedding disabled by request'];
                    }

                    return null;
                }).catch(function(error) {
                    return [error.code, error.message];
                });
            }

            this.getErrorFor = function(service, videoid) {
                var cacheId = service + ':' + videoid;

                return cache.get(cacheId) ||
                    cache.put(cacheId, new VideoError((function() {
                        switch (service) {
                        case 'youtube':
                            return checkForYouTubeErrors(videoid);
                        default:
                            return $q.when(null);
                        }
                    }())));
            };
        }])

        .service('VideoService', ['c6UrlParser',
        function                 ( c6UrlParser ) {
            var VideoService = this;

            this.createVideoUrl = function(computed, ctrl, ctrlName) {
                ctrl.videoUrlBuffer = '';

                computed(ctrl, 'videoUrl', function(url) {
                    var data = this.model.data,
                        service = data.service,
                        id = data.videoid,
                        self = this;

                    function setVideoData(url) {
                        var info = VideoService.dataFromUrl(url) || {
                            service: null,
                            id: null
                        };

                        data.service = info.service;
                        data.videoid = info.id;

                        self.videoUrlBuffer = url;

                        return url;
                    }

                    if (arguments.length) {
                        return setVideoData(url);
                    }

                    if (!service || !id) {
                        return this.videoUrlBuffer;
                    }

                    return VideoService.urlFromData(service, id);
                }, [
                    ctrlName + '.model.data.service',
                    ctrlName + '.model.data.videoid',
                    ctrlName + '.videoUrlBuffer'
                ]);
            };

            this.urlFromData = function(service, id) {
                switch (service) {

                case 'youtube':
                    return 'https://www.youtube.com/watch?v=' + id;
                case 'vimeo':
                    return 'http://vimeo.com/' + id;
                case 'dailymotion':
                    return 'http://www.dailymotion.com/video/' + id;

                }
            };

            this.dataFromUrl = function(url) {
                var parsed = c6UrlParser(url),
                    service = (parsed.hostname.match(/youtube|dailymotion|vimeo/) || [])[0],
                    id,
                    idFetchers = {
                        youtube: function(url) {
                            return params(url.search).v;
                        },
                        vimeo: function(url) {
                            return url.pathname.replace(/^\//, '');
                        },
                        dailymotion: function(url) {
                            var pathname = url.pathname;

                            if (pathname.search(/^\/video\//) < 0) {
                                return null;
                            }

                            return (pathname
                                .replace(/\/video\//, '')
                                .match(/[a-zA-Z0-9]+/) || [])[0];
                        }
                    };

                function params(search) {
                    var pairs = search.split('&'),
                        object = {};

                    forEach(pairs, function(pair) {
                        pair = pair.split('=');

                        object[pair[0]] = pair[1];
                    });

                    return object;
                }

                if (!service) { return null; }

                id = idFetchers[service](parsed);

                if (!id) { return null; }

                return {
                    service: service,
                    id: id
                };
            };
        }])

        .service('VideoSearchService', ['$http','c6UrlMaker','$q','VideoDataService',
        function                       ( $http , c6UrlMaker , $q , VideoDataService ) {
            function VideoSearchResult(videos, _meta) {
                var meta = _meta || {
                    query: this.query,
                    limit: this.limit,
                    skipped: this.before,
                    numResults: this.length,
                    totalResults: this.total
                };

                this.visited = this.visited || {};

                this.query = meta.query;
                this.limit = meta.limit || meta.numResults;

                this.before = meta.skipped;
                this.length = meta.numResults;
                this.total = meta.totalResults;
                this.after = this.total - (this.before + this.length);

                this.pages = Math.ceil(this.total / this.length);
                this.position = (this.before / (this.limit || 1)) + 1;

                this.videos = this.visited[visitedKey(this.before, this.length)] = videos;

                return this;
            }
            VideoSearchResult.prototype = {
                next: function() {
                    return this.page(this.position + 1);
                },
                prev: function() {
                    return this.page(this.position - 1);
                },
                page: function(num) {
                    var self = this,
                        query = this.query, limit = this.limit,
                        toSkip = (num - 1) * limit,
                        existing = this.visited[visitedKey(toSkip, limit)];

                    if (existing) {
                        return $q.when(VideoSearchResult.call(this, existing, {
                            limit: limit,
                            query: query,
                            skipped: toSkip,
                            numResults: limit,
                            totalResults: this.total
                        }));
                    }

                    return find(query, limit, toSkip)
                        .then(function update(data) {
                            return VideoSearchResult.call(self, data.items, data.meta);
                        })
                        .then(extendWithMoreData);
                }
            };

            function merge(object1, object2) {
                return Object.keys(object1).concat(Object.keys(object2))
                    .reduce(function(merged, prop) {
                        merged[prop] = [object1, object2].reduce(function(result, object) {
                            return object.hasOwnProperty(prop) ? object[prop] : result;
                        }, null);
                        return merged;
                    }, {});
            }

            function visitedKey(skipped, size) {
                return skipped + '-' + (skipped + size);
            }

            function find(query, limit, skip) {
                return $http.get(c6UrlMaker('search/videos', 'api'), {
                    params: merge(query, { limit: limit, skip: skip || 0 })
                }).then(function transform(response) {
                    var data = response.data;

                    return {
                        meta: merge(data.meta, {
                            limit: limit,
                            query: query
                        }),
                        items: data.items
                    };
                }, function(response) {
                    return $q.reject(response.data);
                });
            }

            function extendWithMoreData(result) {
                VideoDataService.getVideos(result.videos.map(function(video) {
                    return [video.site, video.videoid];
                })).then(function(data) {
                    return VideoSearchResult.call(result, result.videos.map(function(video, index) {
                        return extend(video, data[index]);
                    }));
                });

                return result;
            }

            this.find = function(query, limit, skip) {
                if (!query.sites) {
                    return $q.when(new VideoSearchResult([], {
                        query: query,
                        skipped: 0,
                        numResults: 0,
                        totalResults: 0
                    }));
                }

                return find(query, limit, skip)
                    .then(function wrap(data) {
                        return new VideoSearchResult(data.items, data.meta);
                    })
                    .then(extendWithMoreData);
            };
        }])

        .service('MiniReelService', ['$window','cinema6','$q','VoteService','c6State',
                                     'SettingsService','c6UrlParser',
        function                    ( $window , cinema6 , $q , VoteService , c6State ,
                                      SettingsService , c6UrlParser ) {
            var self = this,
                portal = c6State.get('Portal');

            function generateId(prefix) {
                return prefix + '-' +
                    cryptojs.SHA1(
                        $window.navigator.userAgent +
                        $window.Date.now() +
                        Math.random($window.Date.now())
                    ).toString(cryptojs.enc.Hex).substr(0, 14);
            }

            /******************************************************\
             * * * * * * * * * * HELPER FUNCTIONS * * * * * * * * *
            \******************************************************/
            // Copy the value from the raw source with an optional
            // default.
            function copy(def) {
                return function(data, key) {
                    var value = data[key];

                    return isUndefined(value) ?
                        def : ngCopy(value);
                };
            }

            // Used for copying the start/end times off of the
            // cards. This is needed because the start/end for
            // Dailymotion must be "undefined" rather than
            // "null".
            function trimmer() {
                return function(data, key, card) {
                    var value = data[key],
                        def = (card.type === 'dailymotion') ?
                            undefined : null;

                    return isNumber(value) ?
                        value : def;
                };
            }

            // Simply use the provided value.
            function value(val) {
                return function() {
                    return val;
                };
            }

            function makeCard(rawData, base) {
                var template, dataTemplates, videoDataTemplate,
                    dataTemplate,
                    card = base || {
                        data: {}
                    };

                /******************************************************\
                 * * * * * * * * CONFIGURATION DEFINITION * * * * * * *
                \******************************************************/
                // template: this is for every property of every card with the
                // exception of the "data" object.
                // IMPORTANT: when this configuration is read, every function
                // will be called with three arguments: a reference to the card,
                // the current property key and another reference to the card
                // (for the sake of consistency.)
                template = {
                    id: copy(),
                    type: function(card) {
                        switch(card.type) {

                        case 'youtube':
                        case 'vimeo':
                        case 'dailymotion':
                            return 'video' + ((card.modules.indexOf('ballot') > -1) ?
                                'Ballot' : '');
                        default:
                            return card.type || null;

                        }
                    },
                    title: function(card) {
                        switch (card.type) {
                        case 'ad':
                            return 'Advertisement';
                        case 'recap':
                            return null;
                        default:
                            return card.title || null;
                        }
                    },
                    note: copy(null),
                    label: function() {
                        switch (this.type) {
                        case 'video':
                            return 'Video';
                        case 'videoBallot':
                            return 'Video + Questionnaire';
                        case 'ad':
                            return 'Advertisement';
                        case 'links':
                            return 'Suggested Links';
                        case 'intro':
                            return 'Intro';
                        case 'recap':
                            return 'Recap';
                        case 'text':
                            return 'Text';

                        default:
                            return null;
                        }
                    },
                    view: function() {
                        switch (this.type) {
                        case 'video':
                        case 'videoBallot':
                            return 'video';

                        default:
                            return this.type;
                        }
                    },
                    ad: function(card) {
                        return card.ad || card.type === 'ad';
                    },
                    displayAdSource: copy(null)
                };

                // videoDataTemplate: this is the base template for all
                // video cards.
                videoDataTemplate = {
                    service: function(data, key, card) {
                        var type = card.type;

                        return data.service ||
                            (type.search(/^(youtube|dailymotion|vimeo)$/) > -1 ?
                                type : null);
                    },
                    videoid: copy(null),
                    start: trimmer(),
                    end: trimmer()
                };

                // dataTemplates: configuration for the "data" section of
                // every card, organized by card type.
                // IMPORTANT: when this configuration is read, every function
                // will be called with three arguments: a reference to the,
                // card's data, the current property key and a reference to
                // the card.
                dataTemplates = {
                    video: videoDataTemplate,
                    videoBallot: extend(ngCopy(videoDataTemplate), {
                        ballot: function(data, key, card) {
                            return card.ballot || {
                                prompt: null,
                                choices: []
                            };
                        }
                    }),
                    ad: {
                        autoplay: copy(true),
                        source: copy(null),
                        skip: function(data) {
                            if (isUndefined(data.skip)) {
                                return 'anytime';
                            }

                            return isNumber(data.skip) ? 'delay' :
                                (data.skip ? 'anytime' : 'never');
                        }
                    },
                    links: {
                        links: copy([])
                    },
                    text: {}
                };

                /******************************************************\
                 * * * * * * * * * READ CONFIGURATION * * * * * * * * *
                \******************************************************/
                // Use the template defined above to populate the
                // properties of the card.
                forEach(template, function(fn, key) {
                    card[key] = fn.call(card, rawData, key, rawData);
                });

                // Use the dataTemplates defined above to populate
                // the data object of the card.
                dataTemplate = dataTemplates[card.type];
                forEach(dataTemplate, function(fn, key) {
                    card.data[key] = fn.call(card.data, (rawData.data || {}), key, rawData);
                });
                forEach(card.data, function(value, key) {
                    if (!dataTemplate.hasOwnProperty(key)) {
                        delete card.data[key];
                    }
                });

                return card;
            }

            this.modeCategoryOf = function(minireel, categories) {
                var result = {},
                    modeValue = minireel && minireel.data.mode;

                forEach(categories || [], function(category) {
                    forEach(category.modes, function(mode) {
                        if (mode.value === modeValue) {
                            result = category;
                        }
                    });
                });

                return result;
            };

            this.modeDataOf = function(minireel, categories) {
                var result;

                forEach(categories, function(category) {
                    forEach(category.modes, function(mode) {
                        if (mode.value === minireel.data.mode) {
                            result = mode;
                        }
                    });
                });

                return result;
            };

            this.adChoicesOf = function(org, data) {
                var w = org.waterfalls,
                    d = data,
                    choices = {};

                angular.forEach(w, function(waterfallArray, type) {
                    var choiceKey = type + 'AdSources';

                    choices[type] = d[choiceKey].filter(function(x) {
                        return w[type].indexOf(x.value) > -1;
                    });
                });

                return choices;
            };

            this.findCard = function(deck, id) {
                return deck.filter(function(card) {
                    return card.id === id;
                })[0];
            };

            this.setCardType = function(card, type) {
                card.type = type;
                card.ad = undefined;

                return makeCard(card, card);
            };

            this.createCard = function(type) {
                return makeCard({
                    id: generateId('rc'),
                    type: type
                });
            };

            this.enablePreview = function(minireel) {
                minireel.access = 'public';

                return minireel.save();
            };

            this.disablePreview = function(minireel) {
                minireel.access = 'private';

                return minireel.save();
            };

            this.previewUrlOf = function(minireel, path) {
                var splash = minireel.data.splash;

                return minireel.access === 'public' ?
                    c6UrlParser([
                        path + '?',
                        [
                            ['preload'],
                            ['exp', minireel.id],
                            ['title', minireel.data.title],
                            ['splash', splash.theme + ':' + splash.ratio.replace('-', '/')]
                        ].map(function(pair) {
                            return pair.map(encodeURIComponent)
                                .join('=');
                        })
                        .join('&')
                    ].join('')).href :
                    null;
            };

            this.publish = function(minireel) {
                function saveElection(minireel) {
                    function returnMiniReel(){
                        return minireel;
                    }

                    if (minireel.data.election) {
                        return VoteService.update(minireel)
                            .then(returnMiniReel);
                    }

                    return VoteService.initialize(minireel)
                        .then(returnMiniReel);
                }

                return $q.when(saveElection(minireel))
                    .then(function setActive(minireel) {
                        minireel.status = 'active';

                        return minireel;
                    })
                    .then(function save(minireel) {
                        return minireel.save();
                    });
            };

            this.unpublish = function(minireel) {
                minireel.status = 'pending';

                return minireel.save();
            };

            this.erase = function(minireel) {
                return minireel.erase();
            };

            this.convertForEditor = function(minireel, target) {
                var model = target || {};

                // Make sure the target is empty
                forEach(target, function(value, key) {
                    delete target[key];
                });

                model.data = {
                    title: minireel.data.title,
                    mode: minireel.data.mode,
                    branding: minireel.data.branding,
                    autoplay: minireel.data.autoplay,
                    election: minireel.data.election,
                    adConfig: minireel.data.adConfig,
                    sponsored: minireel.data.sponsored || false,
                    links: minireel.data.links || {},
                    collateral: minireel.data.collateral ||
                        { splash: null },
                    splash: minireel.data.splash ||
                        { ratio: '3-2', source: 'generated', theme: 'img-text-overlay' },
                    deck: minireel.data.deck.
                        filter(function(card) {
                            return card.type !== 'ad';
                        })
                        .map(function(card) {
                            return makeCard(card);
                        }),
                    ads: minireel.data.deck
                        .reduce(function(ads, card, index) {
                            if (card.ad) {
                                ads[index] = card;
                            }

                            return ads;
                        }, {})
                };

                // Loop through the experience and copy everything but
                // the "data" object.
                forEach(minireel, function(value, key) {
                    if (key !== 'data' && !isFunction(value)) {
                        model[key] = value;
                    }
                });

                return model;
            };

            this.create = function(toCopy) {
                var userSettings = SettingsService.getReadOnly('MR::user'),
                    orgSettings = SettingsService.getReadOnly('MR::org'),
                    user = portal.cModel;

                function fetchTemplate(user) {
                    var org = user.org;

                    return $q.when(toCopy ? toCopy.pojoify() :
                        {
                            type: 'minireel',
                            org: org.id,
                            appUri: 'rumble',
                            data: {
                                title: null,
                                mode: orgSettings.minireelDefaults.mode,
                                autoplay: orgSettings.minireelDefaults.autoplay,
                                sponsored: false,
                                splash: {
                                    source: 'generated',
                                    ratio: userSettings.minireelDefaults.splash.ratio,
                                    theme: userSettings.minireelDefaults.splash.theme
                                },
                                collateral: {
                                    splash: null
                                },
                                deck: [self.createCard('recap')]
                            }
                        });
                }

                function createMinireel(template) {
                    var minireel = cinema6.db.create('experience', template),
                        title = minireel.data.title;

                    delete minireel.id;
                    minireel.data.title = toCopy ? (title + ' (copy)') : null;
                    minireel.status = 'pending';
                    minireel.access = 'public';

                    return minireel;
                }

                return fetchTemplate(user)
                    .then(createMinireel);
            };

            this.convertCard = function(card, minireel) {
                var dataTemplates, cardBases, cardType, dataType,
                    mode = minireel.data.mode,
                    newCard = {
                        data: {}
                    };

                function camelSource(source) {
                    switch(source) {

                    case 'youtube':
                        return 'YouTube';
                    case 'vimeo':
                        return 'Vimeo';
                    case 'dailymotion':
                        return 'DailyMotion';
                    }
                }

                function getCardType(card) {
                    if(card.ad) {
                        return 'ad';
                    }
                    if(card.type.indexOf('video') > -1) {
                        return 'video';
                    } else {
                        // currently this will only be 'miniReel' or 'intro'
                        // but the intro slide is already being skipped
                        // and is never passed to convertCard()
                        return card.type;
                    }
                }

                function getDataType(card) {
                    if(card.type === 'links' || card.type === 'ad') {
                        return card.type;
                    }
                    if(card.type.indexOf('video') > -1) {
                        return card.data.service;
                    }
                }

                dataTemplates = {
                    youtube: {
                        modestbranding: value(0),
                        rel: value(0),
                        start: trimmer(),
                        end: trimmer(),
                        videoid: copy(null)
                    },
                    vimeo: {
                        start: trimmer(),
                        end: trimmer(),
                        videoid: copy(null)
                    },
                    dailymotion: {
                        start: trimmer(),
                        end: trimmer(),
                        related: value(0),
                        videoid: copy(null)
                    },
                    ad: {
                        autoplay: copy(false),
                        source: copy('cinema6'),
                        skip: function(data) {
                            switch (data.skip) {
                            case 'anytime':
                                return true;
                            case 'never':
                                return false;
                            case 'delay':
                                return 6;
                            }
                        }
                    },
                    links: {
                        links: copy([])
                    }
                };

                cardBases = {
                    text: {
                        id: copy(),
                        type: copy(),
                        title: copy(null),
                        note: copy(null),
                        modules: value([]),
                        displayAdSource: copy('cinema6')
                    },
                    video: {
                        id: copy(),
                        type: function(card) {
                            return card.data.service || card.type;
                        },
                        title: copy(null),
                        note: copy(null),
                        source: function(card) {
                            return camelSource(card.data.service);
                        },
                        modules: function(card) {
                            var modules = card.type === 'videoBallot' ? ['ballot'] : [];
                            if(mode === 'lightbox-ads') {
                                modules.push('displayAd');
                            }
                            return modules;
                        },
                        ballot: function(card) {
                            return card.data.ballot;
                        },
                        displayAdSource: copy('cinema6')
                    },
                    ad: {
                        id: copy(),
                        type: value('ad'),
                        ad: value(true),
                        modules: value(['displayAd']),
                        displayAdSource: copy('cinema6')
                    },
                    links: {
                        id: copy(),
                        type: value('links'),
                        title: copy(null),
                        note: copy(null),
                        displayAdSource: copy('cinema6')
                    },
                    recap: {
                        id: copy(),
                        type: copy(),
                        title: function() {
                            return 'Recap of ' + minireel.data.title;
                        },
                        note: copy(),
                        modules: function() {
                            return mode === 'lightbox-ads' ? ['displayAd'] : [];
                        },
                        displayAdSource: copy('cinema6')
                    }
                };

                cardType = getCardType(card);
                dataType = getDataType(card);

                forEach(cardBases[cardType], function(fn, key) {
                    var value = fn(card, key, card);

                    if (isDefined(value)) {
                        newCard[key] = fn(card, key, card);
                    }
                });

                forEach(dataTemplates[dataType], function(fn, key) {
                    var value = fn((card.data || {}), key, card);
                    if(isDefined(value) && value !== null) {
                        newCard.data[key] = value;
                    }
                });

                return newCard;
            };

            this.convertForPlayer = function(minireel, target) {
                var deck = minireel.data.deck,
                    convertedDeck = deck.map(function(card) {
                        return self.convertCard(card, minireel);
                    });

                forEach(minireel.data.ads, function(card, _index) {
                    var index = parseInt(_index);

                    convertedDeck.splice(index, 0, card);
                });

                target = target || {};

                forEach(minireel, function(value, key) {
                    if (key !== 'data') {
                        target[key] = value;
                    } else {
                        target[key] = {};
                    }
                });
                forEach(minireel.data, function(value, key) {
                    if (key === 'ads') { return; }

                    target.data[key] = value;
                });

                target.data.deck = convertedDeck;

                return target;
            };
        }]);
});
