define( ['angular','c6uilib','cryptojs','c6_defines'],
function( angular , c6uilib , cryptojs , c6Defines  ) {
    'use strict';

    var forEach = angular.forEach,
        copy = angular.copy,
        isNumber = angular.isNumber,
        isUndefined = angular.isUndefined,
        isDefined = angular.isDefined,
        extend = angular.extend,
        isFunction = angular.isFunction,
        fromJson = angular.fromJson,
        toJson = angular.toJson,
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

    function toCamelcase(string) {
        var words = string.split('_');

        return words.slice(0, 1)
            .concat(words.slice(1)
                .map(capitalize))
            .join('');
    }

    function camelcaseify(object) {
        return mapObject(object, function(value, key) {
            return [
                toCamelcase(key),
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

    return angular.module('c6.app.minireel.services', [c6uilib.name])
        .service('YQLService', ['$http','$q',
        function               ( $http , $q ) {
            this.query = function(query) {
                return $http.get('https://query.yahooapis.com/v1/public/yql', {
                    params: {
                        format: 'json',
                        q: query
                    }
                }).then(function(response) {
                    return response.data.query.results;
                }, function(response) {
                    return $q.reject(response.data.error.description);
                });
            };
        }])

        .service('OpenGraphService', ['YQLService','$q',
        function                     ( YQLService , $q ) {
            var multiTypes = ['image', 'audio', 'video'];

            this.getData = function(page) {
                return YQLService.query(
                    'select * from html where url="' +
                        page +
                        '" and xpath="//head//meta" and compat="html5"'
                ).then(function(result) {
                    var ogTags = ((result && result.meta) || [])
                        // just get the open graph meta tags
                        .filter(function(tag) {
                            return (/^og:/).test(tag.property);
                        })
                        .map(function(tag) {
                            var parts = tag.property.replace(/^og:/, '')
                                .split(':')
                                .map(toCamelcase);

                            // Create an object to represent each open graph directive.
                            // This tag <meta property="og:image:width" content="600" />
                            // will produce the following object:
                            // {
                            //     group: 'image',
                            //     prop: 'width',
                            //     value: 600
                            // }
                            return {
                                group: parts[0],
                                prop: parts[1] || 'value',
                                value: parseFloat(tag.content) || tag.content
                            };
                        }),
                        // Get all tags that have single values
                        singleOgTags = ogTags.filter(function(tag) {
                            return multiTypes.indexOf(tag.group) < 0;
                        }),
                        multiOgTags = multiTypes.map(function(type) {
                            // Group together tags that can have multiple values (arrays).
                            //
                            // These tags:
                            // {
                            //     group: 'image',
                            //     prop: 'value',
                            //     value: 'foo.jpg'
                            // },
                            // {
                            //     group: 'image',
                            //     prop: 'width',
                            //     value: 800
                            // },
                            // {
                            //     group: 'image',
                            //     prop: 'height',
                            //     value: 600
                            // },
                            // {
                            //     group: 'image',
                            //     prop: 'value',
                            //     value: 'bar.jpg'
                            // },
                            // {
                            //     group: 'image',
                            //     prop: 'type',
                            //     value: 'image/jpg'
                            // }
                            //
                            // Will produce the following object:
                            // {
                            //     group: 'image',
                            //     items: [
                            //         {
                            //             value: 'foo.jpg',
                            //             width: 800,
                            //             height: 600
                            //         },
                            //         {
                            //             value: 'bar.jpg',
                            //             type: 'image/jpg'
                            //         }
                            //     ]
                            // }
                            return {
                                group: type + 's',
                                items: ogTags.filter(function(tag) {
                                    return tag.group === type;
                                }).reduce(function(array, tag) {
                                    var item = array[array.length - 1];

                                    if (!item || tag.prop in item) {
                                        item = array[array.push({}) - 1];
                                    }

                                    item[tag.prop] = tag.value;

                                    return array;
                                }, [])
                            };
                        });

                    if (ogTags.length < 1) {
                        return $q.reject(new Error('Cannot find OpenGraph data for ' + page + '.'));
                    }

                    return singleOgTags.reduce(function(result, tag) {
                        // Copy single-value open graph tags to the final result object
                        (result[tag.group] || (result[tag.group] = {}))[tag.prop] = tag.value;
                        return result;
                    }, multiOgTags.reduce(function(result, tag) {
                        // Copy multi-value open graph tags to the final result object
                        if (tag.items.length > 0) {
                            result[tag.group] = tag.items;
                        }

                        return result;
                    }, {}));
                });
            };
        }])

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

        .factory('paginatedDbList', ['scopePromise','cinema6',
        function                    ( scopePromise , cinema6 ) {
            function extend() {
                var objects = Array.prototype.slice.call(arguments);

                return objects.reduce(function(result, object) {
                    return Object.keys(object).reduce(function(result, key) {
                        result[key] = object[key];
                        return result;
                    }, result);
                }, {});
            }

            function value(val) {
                return function() {
                    return val;
                };
            }

            function copyProps(props, from, to) {
                props.forEach(function(prop) {
                    to[prop] = from[prop];
                });

                return to;
            }

            function PaginatedList(type, query, limit, page) {
                this.type = type;
                this.query = extend(query);
                this.limit = limit;

                this.goTo(page);
            }
            PaginatedList.prototype = {
                ensureResolution: function() {
                    return this.items.ensureResolution()
                        .then(value(this));
                },

                update: function(query, limit) {
                    this.query = extend(query);
                    this.limit = limit;

                    return this.goTo(1);
                },
                goTo: function(page) {
                    var list = this,
                        limit = this.limit,
                        previousItems = this.items || {
                            value: [],
                            page: {},
                            selected: []
                        };

                    this.page = page;

                    this.items = scopePromise(cinema6.db.findAll(this.type, extend(this.query, {
                        limit: this.limit,
                        skip: (this.page - 1) * this.limit
                    })), previousItems.value);
                    copyProps(['page', 'selected'], previousItems, this.items);

                    this.items.ensureResolution()
                        .then(function(items) {
                            var info = items.value.meta.items;

                            items.page = {
                                current: ((info.start - 1) / limit) + 1,
                                total: Math.ceil(info.total / limit)
                            };
                            list.selectNone();
                        });

                    return this;
                },
                next: function() {
                    return this.goTo(this.page + 1);
                },
                prev: function() {
                    return this.goTo(Math.max(this.page - 1, 1));
                },
                refresh: function() {
                    return this.goTo(this.page);
                },

                selectAll: function(_predicate) {
                    var predicate = _predicate || value(true);

                    /* jshint boss:true */
                    return (this.items.selected = this.items.value.map(function() {
                        return !!predicate.apply(null, arguments);
                    }));
                },
                selectNone: function() {
                    return this.selectAll(value(false));
                },
                getSelected: function() {
                    return this.items.value.filter(function(item, index) {
                        return this[index];
                    }, this.items.selected);
                },
                areAllSelected: function(predicate) {
                    return this.items.value
                        .filter(predicate || value(true))
                        .map(function(item) {
                            return this.items.selected[this.items.value.indexOf(item)];
                        }, this)
                        .indexOf(false) < 0;
                }
            };

            return function(type, query, limit, page) {
                return new PaginatedList(type, query, limit, page || 1);
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
                                return card.thumb ? {
                                    large: card.thumb
                                } : VideoThumbnailService.getThumbsFor(
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

        .service('VoteService', ['cinema6','$q',
        function                ( cinema6 , $q ) {
            /**
             * Accepts an array of cards and a ballot.
             *
             * Returns a new ballot object for the given cards (using the values of the existing
             * ballot, if present.)
             */
            function ballotFor(cards, existingBallot) {
                return cards.reduce(function(ballot, card) {
                    var existingVotes = existingBallot[card.id] || [];

                    ballot[card.id] = card.ballot.choices.map(function(choice, index) {
                        return existingVotes[index] || 0;
                    });
                    return ballot;
                }, {});
            }

            /**
             * Accepts an optional id.
             *
             * If the id is provided, the election with that id will be fetched from the DB.
             * If the id is not provided, a new election will be created.
             */
            function getElection(id) {
                return id ?
                    cinema6.db.findAll('election', { id: id })
                        .then(function extractSingle(elections) {
                            return elections[0];
                        }) :
                    $q.when(cinema6.db.create('election', {
                        ballot: {}
                    }));
            }

            /**
             * The function is meant to be called in the .then() method of a promise.
             *
             * The function updateBallot() returns will update an item's election's ballot with a
             * proper ballot configuration for the cards provided.
             */
            function updateBallot(cards) {
                return function(item) {
                    var ballot = item.election.ballot;

                    copy(ballotFor(cards, ballot), ballot);

                    return item;
                };
            }

            /**
             * This method synchronizes a Card with the vote service. It will create/update
             * elections as necessary.
             */
            this.syncCard = function(card) {
                var ballot = card.ballot;

                if (!ballot || ballot.choices.length < 1 || !!ballot.election) {
                    return $q.when(card);
                }

                return cinema6.db.create('election', (function() {
                    var data = { ballot: {} };
                    data.ballot[card.id] = card.ballot.choices.map(function() { return 0; });
                    return data;
                }())).save().then(function(election) {
                    card.ballot.election = election.id;
                    return card;
                });
            };

            /**
             * This method synchronizes a MiniReel with the vote service. It will create/update
             * elections as necessary.
             */
            this.syncMiniReel = function(minireel) {
                function getItems(minireel) {
                    var deck = minireel.data.deck;

                    return $q.all([
                        // Create/fetch the election for the MiniReel.
                        $q.all({
                            data: minireel.data,
                            election: getElection(minireel.data.election)
                        }).then(updateBallot(deck.filter(function(card) {
                            return card.ballot && !card.sponsored;
                        }))) // Update ballot based on latest card data.
                    ].concat(deck.filter(function(card) {
                        return card.ballot && card.sponsored;
                    }).map(function(card) {
                        // Create/fetch the election for each sponsored card.
                        return $q.all({
                            data: card.ballot,
                            election: getElection(card.ballot.election)
                        }).then(updateBallot([card])); // Update ballot based on latest card data.
                    }))).then(function filterElections(items) {
                        // Filter out any "empty" elections (to prevent creating unneeded
                        // elections.)
                        return items.filter(function(item) {
                            return Object.keys(item.election.ballot).length > 0;
                        });
                    });
                }

                return getItems(minireel)
                    .then(function(items) {
                        return $q.all(items.map(function(item) {
                            // Save every created election
                            return item.election.save()
                                .then(function saveElection(election) {
                                    // Update the card/minireel with the election id.
                                    item.data.election = election.id;
                                });
                        }));
                    }).then(function resolveToMR() {
                        return minireel;
                    });
            };
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

        .service('VideoThumbnailService', ['$q','$cacheFactory','$http','VideoService',
                                           'OpenGraphService',
        function                          ( $q , $cacheFactory , $http , VideoService ,
                                            OpenGraphService ) {
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

            _private.fetchOpenGraphThumbs = function(service, videoid) {
                return OpenGraphService.getData(VideoService.urlFromData(service, videoid))
                    .then(function(data) {
                        var image = data.images[0].value;

                        return {
                            small: image,
                            large: image
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
                        case 'yahoo':
                        case 'aol':
                        case 'rumble':
                            return new ThumbModel(_private.fetchOpenGraphThumbs(service, videoid));
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

        .service('ImageThumbnailService', ['$q', '$cacheFactory', '$http',
        function                          ( $q ,  $cacheFactory,   $http) {
            var _private = {},
                cache = $cacheFactory('ImageThumbnailService:models');

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

            _private.fetchFlickrThumbs = function(imageid) {
                var flickrKey = c6Defines.kFlickrDataApiKey;
                var request = 'https://www.flickr.com/services/rest/?' +
                    'method=flickr.photos.getSizes&' +
                    'format=json&api_key=' + flickrKey + '&' +
                    'photo_id=' + imageid + '&' +
                    'jsoncallback=JSON_CALLBACK';
                return $http.jsonp(request, {cache: true})
                    .then(function(json) {
                        if(json.data.sizes) {
                            var sizes = json.data.sizes.size;
                            if(sizes.length > 1) {
                                var thumbs = {
                                    small: sizes[0].source,
                                    large: sizes[1].source
                                };
                                for(var i=0;i<sizes.length;i++) {
                                    if(sizes[i].label === 'Thumbnail') {
                                        thumbs = {
                                            small: sizes[i].source,
                                            large: sizes[i+1].source
                                        };
                                        break;
                                    }
                                }
                                return thumbs;
                            }
                        }
                        return $q.reject();
                    });
            };

            _private.fetchGettyThumbs = function(imageid) {
                return {
                    small: '//embed-cdn.gettyimages.com/xt/' + imageid +
                        '.jpg?v=1&g=fs1|0|DV|33|651&s=1',
                    large: '//embed-cdn.gettyimages.com/xt/' + imageid +
                        '.jpg?v=1&g=fs1|0|DV|33|651&s=1'
                };
            };

            this.getThumbsFor = function(service, imageid) {
                var key = service + ':' + imageid;

                return cache.get(key) ||
                    cache.put(key, (function() {
                        switch (service) {
                        case 'flickr':
                            return new ThumbModel(_private.fetchFlickrThumbs(imageid));
                        case 'getty':
                            return new ThumbModel($q.when(_private.fetchGettyThumbs(imageid)));
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
            this.urlFromData = function(service, id) {
                switch (service) {

                case 'youtube':
                    return 'https://www.youtube.com/watch?v=' + id;
                case 'vimeo':
                    return 'http://vimeo.com/' + id;
                case 'dailymotion':
                    return 'http://www.dailymotion.com/video/' + id;
                case 'aol':
                    return 'http://on.aol.com/video/' + id;
                case 'yahoo':
                    return 'https://screen.yahoo.com/' + id + '.html';
                case 'rumble':
                    return 'https://rumble.com/' + id + '.html';

                }
            };

            this.dataFromUrl = function(url) {
                var parsed = c6UrlParser(url),
                    service = (parsed.hostname.match(
                        /youtube|dailymotion|vimeo|aol|yahoo|rumble/
                    ) || [])[0],
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
                        },
                        aol: function(url) {
                            return (url.pathname.match(/[^\/]+$/) || [null])[0];
                        },
                        yahoo: function(url) {
                            return (url.pathname
                                .match(/[^/]+(?=(\.html))/) || [null])[0];
                        },
                        rumble: function(url) {
                            return (url.pathname
                                .match(/[^/]+(?=(\.html))/) || [null])[0];
                        }
                    };

                function params(search) {
                    return search.split('&')
                        .map(function(pair) {
                            return pair.split('=')
                                .map(decodeURIComponent);
                        })
                        .reduce(function(params, pair) {
                            params[pair[0]] = pair[1];

                            return params;
                        }, {});
                }

                if (!service) { return null; }

                id = idFetchers[service](parsed);

                if (!id) { return null; }

                return {
                    service: service,
                    id: id
                };
            };

            this.embedIdFromVideoId = function(service, videoid) {
                switch (service) {
                case 'rumble':
                    return videoid.match(/^[^-]+/)[0]
                        .replace(/^v/, '8.');

                default:
                    return videoid;
                }
            };

            this.embedCodeFromData = function(service, id) {
                function aolSrc(id) {
                    return 'http://pshared.5min.com/Scripts/PlayerSeed.js?' +
                        'sid=281&width=560&height=450&playList=' + (id.match(/\d+$/) || [])[0];
                }

                function yahooSrc(id) {
                    return 'https://screen.yahoo.com/' + id + '.html?' +
                        'format=embed';
                }

                switch (service) {
                case 'aol':
                    return [
                        '<div style="text-align:center">',
                        '    <script src="' + aolSrc(id) + '"></script>',
                        '    <br/>',
                        '</div>'
                    ].join('\n');
                case 'yahoo':
                    return [
                        '<iframe width="100%"',
                        '    height="100%"',
                        '    scrolling="no"',
                        '    frameborder="0"',
                        '    src="' + yahooSrc(id) + '"',
                        '    allowfullscreen="true"',
                        '    mozallowfullscreen="true"',
                        '    webkitallowfullscreen="true"',
                        '    allowtransparency="true">',
                        '</iframe>'
                    ].join('\n');
                }
            };
        }])

        .service('ImageService', ['$http', '$q',
        function                 ( $http , $q) {

            var _private = {};

            // This function converts a base 58 number to base 10
            _private.decodeBase58 = function(num) {
                var digits = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
                var result = 0;
                if(!num || !num.length) {
                    return -1;
                }
                for(var i=0;i<num.length;i++) {
                    var digit = num[num.length - 1 - i];
                    if(!digit) {
                        return -1;
                    }
                    var index = digits.indexOf(digit);
                    if(index === -1) {
                        return -1;
                    }
                    result += (index * Math.pow(58, i));
                }
                return result;
            };

            // This function converts a base 10 number to base 58
            _private.encodeBase58 = function(num) {
                if(num === null || isNaN(num) || num < 0) {
                    return -1;
                }
                var digits = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
                var n = num, r = 0;
                var result = '';
                do {
                    r = n % 58;
                    n = Math.floor(n / 58);
                    result = digits[r] + result;
                } while(n>0);
                return result;
            };

            // This function uses Flickr's API to get the information necessary to construct the
            // image's source url
            _private.getFlickrEmbedInfo = function(imageid) {
                var flickrKey = c6Defines.kFlickrDataApiKey;
                var request = 'https://www.flickr.com/services/rest/?' +
                    'method=flickr.photos.getSizes&' +
                    'format=json&api_key=' + flickrKey + '&' +
                    'photo_id=' + imageid + '&' +
                    'jsoncallback=JSON_CALLBACK';
                return $http.jsonp(request, {cache: true}).
                    then(function(json) {
                        if(json.data.sizes) {
                            var sizes = json.data.sizes.size;
                            if(sizes.length > 1) {
                                var largest = sizes[sizes.length-1];
                                return {
                                    src: largest.source,
                                    width: largest.width,
                                    height: largest.height
                                };
                            }
                        }
                        return $q.reject('There was a problem retrieving the image from Flickr.');
                    }, function() {
                        return $q.reject('There was a problem contacting Flickr.');
                    });
            };

            // This function uses GettyImages' oEmbed API endpoint to fetch the embed code for an
            // image
            _private.getGettyEmbedInfo = function(imageid) {
                var request = '//embed.gettyimages.com/oembed?' +
                    'url=' + encodeURIComponent('http://gty.im/' + imageid);
                return $http.get(request, {cache: true}).
                    then(function(json) {
                        var embedCode = json.data.html;
                        if(embedCode) {
                            var srcRegex = new RegExp('"\\/\\/embed.gettyimages.com\\/' +
                                'embed\\/\\d+\\?\\S+"');
                            var src = embedCode.match(srcRegex)[0];
                            var width = embedCode.match(/width="\d+/)[0];
                            var height = embedCode.match(/height="\d+/)[0];
                            return {
                                src: src.substr(1,src.length-2),
                                width: width.replace('width="', ''),
                                height: height.replace('height="', '')
                            };
                        }
                        return $q.reject('There was a problem retrieving the image from ' +
                            'GettyImages.');
                    }, function() {
                        return $q.reject('There was a problem contacting GettyImages.');
                    });
            };

            // Takes as an argument a url, checks to see if it's of a recognizable form,
            // and returns information that was parsed from it.
            this.dataFromUrl = function(url) {
                var serviceRecognizers = {
                    flickr: {
                        patterns: [
                            {
                                urlFormat: /flickr.com\/photos\/.+\/\d+(?=\/?)/,
                                idFetcher: function(url) {
                                    return url.replace(/flickr.com\/photos\/.+\//, '');
                                }
                            },
                            {
                                urlFormat: new RegExp('flic.kr\\/p\\/' +
                                    '[123456789abcdefghijkmnopqrstuvwxyz' +
                                    'ABCDEFGHJKLMNPQRSTUVWXYZ]+(?=\\/?)'),
                                idFetcher: function(url) {
                                    return _private.decodeBase58(
                                        url.replace(/flic.kr\/p\//, '')
                                    ).toString();
                                }
                            }
                        ]
                    },
                    getty: {
                        patterns: [
                            {
                                urlFormat: new RegExp('gettyimages.com\\/detail\\/([a-z]+-)?' +
                                    'photo\\/[^\\/]+\\/\\d+(?=\\/?)'),
                                idFetcher: function(url) {
                                    return url.replace(new RegExp('gettyimages.com\\/detail\\/' +
                                        '([a-z]+-)?photo\\/[^\\/]+\\/'), '');
                                }
                            },
                            {
                                urlFormat: /gty.im\/\d+(?=\/?$)/,
                                idFetcher: function(url) {
                                    return url.replace(/gty.im\//, '');
                                }
                            }
                        ]
                    }
                };

                // Read the service recognizers json and check for a recognized service
                // If a recognized service is found, then fetch it's image id
                var services = Object.keys(serviceRecognizers);
                for(var i=0;i<services.length;i++) {
                    var serviceName = services[i];
                    var service = serviceRecognizers[serviceName];
                    var patterns = service.patterns;
                    for(var j=0;j<patterns.length;j++) {
                        var match = (url.match(patterns[j].urlFormat) || [])[0];
                        if(match) {
                            var result = {
                                service: serviceName,
                                imageid: patterns[j].idFetcher(match)
                            };
                            return result;
                        }
                    }
                }
                return {
                    service: null,
                    imageid: null
                };
            };

            // Uses service specific APIs to aquire information that
            // cannot be obtained simply by parsing the image's URL
            this.getEmbedInfo = function(service, imageid) {
                switch(service) {
                    case 'flickr':
                        return _private.getFlickrEmbedInfo(imageid)
                            .then(function(imageInfo) {
                                return {
                                    src: imageInfo.src,
                                    width: imageInfo.width,
                                    height: imageInfo.height
                                };
                            });
                    case 'getty':
                        return _private.getGettyEmbedInfo(imageid)
                            .then(function(iframeInfo) {
                                return {
                                    src: iframeInfo.src,
                                    width: iframeInfo.width,
                                    height: iframeInfo.height
                                };
                            });
                    default:
                        return $q.when({
                            src: null,
                            width: null,
                            height: null
                        });
                }
            };

            this.urlFromData = function(service, imageid) {
                if(!imageid) {
                    return null;
                }
                switch(service) {
                    case 'flickr':
                        return 'https://flic.kr/p/' + _private.encodeBase58(parseInt(imageid));
                    case 'getty':
                        return 'http://gty.im/' + imageid;
                    default:
                        return null;
                }
            };

            if (window.c6.kHasKarma) { this._private = _private; }
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
                                     'SettingsService','VideoService','ImageThumbnailService',
                                     'VideoThumbnailService', 'ImageService', 'OpenGraphService',
        function                    ( $window , cinema6 , $q , VoteService , c6State ,
                                      SettingsService , VideoService , ImageThumbnailService,
                                      VideoThumbnailService,   ImageService,   OpenGraphService ) {
            var ngCopy = angular.copy;

            var self = this,
                app = c6State.get('Application'),
                application = c6State.get(app.name);

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
                var template, dataTemplates, articleDataTemplate,
                    imageDataTemplate, videoDataTemplate,
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
                        case 'rumble':
                        case 'adUnit':
                        case 'embedded':
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
                    label: function(card) {
                        return [
                            card.sponsored ? 'Sponsored' : null,
                            (function() {
                                switch (this.type) {
                                case 'article':
                                    return 'Article';
                                case 'image':
                                    return 'Image';
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
                                case 'displayAd':
                                    return 'Display Ad';
                                case 'wildcard':
                                    return 'Sponsored Card Placeholder';

                                default:
                                    return null;
                                }
                            }.call(this))
                        ].filter(function(word) {
                            return !!word;
                        }).join(' ') || null;
                    },
                    view: function() {
                        switch (this.type) {
                        case 'video':
                        case 'videoBallot':
                            return 'video';
                        case 'displayAd':
                            return 'display_ad';

                        default:
                            return this.type;
                        }
                    },
                    ad: function(card) {
                        return card.ad || (/^(ad)$/).test(card.type);
                    },
                    placementId: copy(null),
                    templateUrl: copy(null),
                    sponsored: function(card) {
                        switch (this.type) {
                        case 'wildcard':
                            return true;

                        default:
                            return card.sponsored || false;
                        }
                    },
                    campaign: copy({
                        campaignId: null,
                        advertiserId: null,
                        minViewTime: null,
                        countUrls: [],
                        clickUrls: []
                    }),
                    collateral: copy({}),
                    thumb: function(card) {
                        return (card.thumbs && card.thumbs.large) || null;
                    },
                    links: function(card) {
                        switch (card.type) {
                        case 'displayAd':
                            return {};
                        default:
                            return card.links || {};
                        }
                    },
                    params: copy({})
                };

                // articleDataTemplate: this is the base template for all
                // article cards.
                articleDataTemplate = {
                    src: copy(null),
                    thumbUrl: function(data) {
                        if(data.thumbs) {
                            return data.thumbs.large;
                        } else {
                            return null;
                        }
                    }
                };

                // imageDataTemplate: this is the base template for all
                // image cards.
                imageDataTemplate = {
                    service: copy(null),
                    imageid: copy(null)
                };

                // videoDataTemplate: this is the base template for all
                // video cards.
                videoDataTemplate = {
                    skip: function(data) {
                        if (!isDefined(data.skip)) {
                            return 'anytime';
                        }

                        if ((/^(anytime|never|delay)$/).test(data.skip)) {
                            return data.skip;
                        }

                        switch (data.skip) {
                        case true:
                            return 'anytime';
                        case false:
                            return 'never';
                        case 6:
                            return 'delay';

                        default:
                            return data.skip;
                        }
                    },
                    controls: copy(true),
                    autoplay: copy(null),
                    autoadvance: copy(null),
                    survey: function(data, key, card) {
                        return (card.modules || []).indexOf('post') > -1 ?
                            (card.ballot || null) : null;
                    },
                    service: function(data, key, card) {
                        var type = card.type;

                        return data.service ||
                            (type.search(/^(youtube|dailymotion|vimeo|adUnit|rumble)$/) > -1 ?
                                type : null);
                    },
                    videoid: function(data, key, card) {
                        switch (card.type) {
                        case 'adUnit':
                            return toJson({
                                vast: data.vast,
                                vpaid: data.vpaid
                            });
                        case 'rumble':
                            return data.siteid || null;
                        default:
                            return data.videoid || null;
                        }
                    },
                    start: trimmer(),
                    end: trimmer(),
                    moat: copy(null)
                };

                // dataTemplates: configuration for the "data" section of
                // every card, organized by card type.
                // IMPORTANT: when this configuration is read, every function
                // will be called with three arguments: a reference to the,
                // card's data, the current property key and a reference to
                // the card.
                dataTemplates = {
                    article: articleDataTemplate,
                    image: imageDataTemplate,
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
                        autoplay: value(true),
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
                    text: {},
                    displayAd: {
                        size: value('300x250')
                    },
                    recap: {},
                    wildcard: {}
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

            function shouldHaveDisplayAd(card, enabling) {
                if ((/text|links|displayAd/).test(card.type)) { return false; }

                if (!!card.placementId) { return true; }

                if (card.sponsored || card.type === 'adUnit') { return false; }

                return enabling;
            }

            function enableModule(card, module) {
                var modules = card.modules || [];

                if (modules.indexOf(module) > -1) { return; }

                modules.push(module);
            }

            function disableModule(card, module) {
                if (!card.modules) { return; }

                card.modules = card.modules.filter(function(cardModule) {
                    return cardModule !== module;
                });
            }

            this.enableDisplayAds = function(minireel) {
                minireel.data.deck.forEach(function(card) {
                    if (shouldHaveDisplayAd(card, true)) {
                        enableModule(card, 'displayAd');
                    } else {
                        disableModule(card, 'displayAd');
                    }
                });

                return minireel;
            };

            this.disableDisplayAds = function(minireel) {
                minireel.data.deck.forEach(function(card) {
                    if (shouldHaveDisplayAd(card, false)) {
                        enableModule(card, 'displayAd');
                    } else {
                        disableModule(card, 'displayAd');
                    }
                });

                return minireel;
            };

            this.enablePreview = function(minireel) {
                minireel.access = 'public';

                return minireel.save();
            };

            this.disablePreview = function(minireel) {
                minireel.access = 'private';

                return minireel.save();
            };

            this.previewUrlOf = function(minireel) {
                if (minireel.access === 'public') {
                    var path;
                    if (c6Defines.kDebug) {
                        path = '//staging.cinema6.com';
                    } else {
                        path = 'http://cinema6.com';
                    }
                    path = path + '/preview?id=' + encodeURIComponent(minireel.id);
                    return path;
                } else {
                    return null;
                }
            };

            this.publish = function(minireel) {
                function saveElection(minireel) {
                    return VoteService.syncMiniReel(minireel);
                }

                return saveElection(minireel)
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

            this.convertCardForEditor = function(card) {
                return $q.when(makeCard(card));
            };

            this.convertForEditor = function(minireel, target) {
                function convertDeck(minireel) {
                    return $q.all(minireel.data.deck.
                        filter(function(card) {
                            return card.type !== 'ad';
                        })
                        .map(self.convertCardForEditor));
                }

                function convertMinireel(deck) {
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
                        autoadvance: minireel.data.autoadvance,
                        election: minireel.data.election,
                        adConfig: minireel.data.adConfig,
                        sponsored: minireel.data.sponsored || false,
                        links: minireel.data.links || {},
                        params: minireel.data.params || {},
                        placementId: minireel.data.placementId,
                        campaign: minireel.data.campaign || {},
                        collateral: minireel.data.collateral ||
                            { splash: null },
                        splash: minireel.data.splash ||
                            { ratio: '3-2', source: 'generated', theme: 'img-text-overlay' },
                        deck: deck,
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

                    if (!model.categories) { model.categories = []; }

                    return model;
                }

                return convertDeck(minireel).then(convertMinireel);
            };

            this.create = function(toCopy) {
                var userSettings = SettingsService.getReadOnly('MR::user'),
                    orgSettings = SettingsService.getReadOnly('MR::org'),
                    user = application.cModel;

                function fetchTemplate(user) {
                    var org = user.org;

                    return $q.when(toCopy ? toCopy.pojoify() :
                        {
                            type: 'minireel',
                            org: org.id,
                            appUri: 'mini-reel-player',
                            categories: [],
                            data: {
                                title: null,
                                mode: orgSettings.minireelDefaults.mode,
                                autoplay: orgSettings.minireelDefaults.autoplay,
                                autoadvance: true,
                                sponsored: false,
                                campaign: {},
                                splash: {
                                    source: 'generated',
                                    ratio: userSettings.minireelDefaults.splash.ratio,
                                    theme: userSettings.minireelDefaults.splash.theme
                                },
                                collateral: {
                                    splash: null
                                },
                                params: {},
                                links: {},
                                deck: [self.createCard('recap')]
                            }
                        });
                }

                function createMinireel(template) {
                    var minireel = cinema6.db.create('experience', template),
                        title = minireel.data.title;

                    delete minireel.id;
                    delete minireel.data.election;
                    minireel.data.title = toCopy ? (title + ' (copy)') : null;
                    minireel.status = 'pending';
                    minireel.access = 'public';
                    minireel.data.deck.forEach(function(card) {
                        card.id = generateId('rc');

                        if (card.ballot) {
                            delete card.ballot.election;
                        }
                    });

                    return minireel;
                }

                return fetchTemplate(user)
                    .then(createMinireel);
            };

            this.convertCardForPlayer = function(card, _minireel) {
                var dataTemplates, cardBases, cardType, dataType,
                    org = application.cModel.org,
                    minireel = _minireel || {
                        data: {
                            mode: null,
                            deck: []
                        }
                    },
                    displayAdsEnabled = (minireel &&
                        minireel.data.adConfig &&
                        minireel.data.adConfig.display.enabled) ||
                        (org &&
                        org.adConfig &&
                        org.adConfig.display.enabled),
                    newCard = {
                        data: {}
                    };

                function camelSource(source) {
                    switch(source) {

                    case 'youtube':
                        return 'YouTube';
                    case 'dailymotion':
                        return 'DailyMotion';
                    case 'aol':
                        return 'AOL On';
                    case 'yahoo':
                        return 'Yahoo! Screen';
                    case 'flickr':
                        return 'Flickr';
                    case 'getty':
                        return 'gettyimages';
                    case 'adUnit':
                        return undefined;
                    default:
                        return (source || undefined) &&
                            source.charAt(0).toUpperCase() + source.slice(1);
                    }
                }

                function getCardType(card) {
                    switch (card.type) {
                    case 'image':
                        return 'image';
                    case 'video':
                    case 'videoBallot':
                        return 'video';
                    default:
                        return card.type;
                    }
                }

                function getDataType(card) {
                    switch (card.type) {
                    case 'video':
                    case 'videoBallot':
                        switch (card.data.service) {
                        case 'yahoo':
                        case 'aol':
                            return 'embedded';
                        default:
                            return card.data.service;
                        }
                        break;
                    default:
                        return card.type;
                    }
                }

                function skipValue() {
                    return function(data) {
                        switch (data.skip) {
                        case 'anytime':
                            return true;
                        case 'never':
                            return false;
                        case 'delay':
                            return 6;
                        default:
                            return data.skip;
                        }
                    };
                }

                function hideSourceValue() {
                    return function(data, prop, card) {
                        return card.sponsored || undefined;
                    };
                }

                function hrefValue() {
                    return function(data) {
                        return VideoService.urlFromData(data.service, data.videoid);
                    };
                }

                function thumbsValue() {
                    return function(data) {
                        return VideoThumbnailService.getThumbsFor(data.service, data.videoid)
                            .ensureFulfillment()
                            .then(function(thumbs) {
                                return {
                                    small: thumbs.small,
                                    large: thumbs.large
                                };
                            });
                    };
                }

                function imageThumbsValue() {
                    return function(data) {
                        return ImageThumbnailService.getThumbsFor(data.service, data.imageid)
                            .ensureFulfillment()
                            .then(function(thumbs) {
                                return {
                                    small: thumbs.small,
                                    large: thumbs.large
                                };
                            });
                    };
                }

                function articleThumbsValue() {
                    return function(data) {
                        return OpenGraphService.getData(data.src)
                            .then(function(ogData) {
                                if(ogData.images &&
                                   ogData.images.length > 0 &&
                                   ogData.images[0].value) {
                                    var thumbUrl = ogData.images[0].value;
                                    return {
                                        small: thumbUrl,
                                        large: thumbUrl
                                    };
                                } else {
                                    return {
                                        small: null,
                                        large: null
                                    };
                                }
                            })
                            .catch(function() {
                                return {
                                    small: null,
                                    large: null
                                };
                            });
                    };
                }

                var embedInfo = null;
                function embedValue(key) {
                    return function(data) {
                        if(embedInfo) {
                            return embedInfo[key];
                        } else {
                            return ImageService.getEmbedInfo(data.service, data.imageid)
                                .then(function(info) {
                                    embedInfo = info;
                                    return embedInfo[key];
                                });
                        }
                    };
                }

                function imageHrefValue() {
                    return function(data) {
                        return ImageService.urlFromData(data.service, data.imageid);
                    };
                }

                dataTemplates = {
                    article: {
                        src: copy(null),
                        thumbs: articleThumbsValue()
                    },
                    image: {
                        imageid: copy(null),
                        service: copy(null),
                        src: embedValue('src'),
                        href: imageHrefValue(),
                        width: embedValue('width'),
                        height: embedValue('height'),
                        source: function(data) {
                            return camelSource(data.service);
                        },
                        thumbs: imageThumbsValue()
                    },
                    youtube: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        controls: copy(),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        modestbranding: value(0),
                        rel: value(0),
                        start: trimmer(),
                        end: trimmer(),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: thumbsValue(),
                        moat: copy(null)
                    },
                    vimeo: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        start: trimmer(),
                        end: trimmer(),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: thumbsValue(),
                        moat: copy(null)
                    },
                    dailymotion: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        controls: copy(),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        start: trimmer(),
                        end: trimmer(),
                        related: value(0),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: thumbsValue(),
                        moat: copy(null)
                    },
                    rumble: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        start: trimmer(),
                        end: trimmer(),
                        siteid: function(data) {
                            return data.videoid;
                        },
                        videoid: function(data) {
                            return VideoService.embedIdFromVideoId('rumble', data.videoid);
                        },
                        href: hrefValue(),
                        thumbs: thumbsValue(),
                        moat: copy(null)
                    },
                    adUnit: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        controls: copy(),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        vast: function(data) {
                            return (fromJson(data.videoid) || {}).vast;
                        },
                        vpaid: function(data) {
                            return (fromJson(data.videoid) || {}).vpaid;
                        },
                        thumbs: value(null),
                        moat: copy(null)
                    },
                    embedded: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        start: trimmer(),
                        end: trimmer(),
                        service: copy(),
                        videoid: copy(null),
                        code: function(data) {
                            return VideoService.embedCodeFromData(data.service, data.videoid);
                        },
                        href: hrefValue(),
                        thumbs: thumbsValue(),
                        moat: copy(null)
                    },
                    ad: {
                        autoplay: copy(true),
                        source: copy('cinema6'),
                        skip: skipValue()
                    },
                    links: {
                        links: copy([])
                    },
                    displayAd: {
                        size: copy('300x250')
                    }
                };

                cardBases = {
                    article: {
                        id: copy(),
                        type: value('article'),
                        title: copy(null),
                        note: value(null),
                        modules: value([]),
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: copy(),
                        params: copy(),
                        thumbs: function(card) {
                            return (card.thumb || null) && {
                                small: card.thumb,
                                large: card.thumb
                            };
                        }
                    },
                    image: {
                        id: copy(),
                        type: value('image'),
                        title: copy(null),
                        note: copy(null),
                        modules: value([]),
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: copy(),
                        params: copy()
                    },
                    text: {
                        id: copy(),
                        type: copy(),
                        title: copy(null),
                        note: copy(null),
                        modules: value([]),
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: copy(),
                        params: copy()
                    },
                    video: {
                        id: copy(),
                        type: function(card) {
                            var service = card.data.service;

                            switch (service) {
                            case 'yahoo':
                            case 'aol':
                                return 'embedded';
                            default:
                                return service || card.type;
                            }
                        },
                        title: copy(null),
                        note: copy(null),
                        source: function(card) {
                            return camelSource(card.data.service);
                        },
                        modules: function(card) {
                            var modules = {
                                'ballot': function() { return card.type === 'videoBallot'; },
                                'displayAd': function() {
                                    var shouldAlwaysHaveDisplayAd = !!card.placementId,
                                        canHaveDisplayAd = displayAdsEnabled &&
                                            !card.sponsored && card.data.service !== 'adUnit';

                                    return shouldAlwaysHaveDisplayAd || canHaveDisplayAd;
                                },
                                'post': function() {
                                    return minireel.data.deck.length === 1 || card.data.survey;
                                }
                            };

                            return Object.keys(modules)
                                .filter(function(module) {
                                    return modules[module]();
                                });
                        },
                        ballot: function(card) {
                            return card.data.ballot || card.data.survey || undefined;
                        },
                        thumbs: function(card) {
                            return (card.thumb || null) && {
                                small: card.thumb,
                                large: card.thumb
                            };
                        },
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: copy(),
                        params: function(card) {
                            var params = copy({}).apply(this, arguments);

                            if (card.sponsored) {
                                params.ad = params.ad !== false;
                            }

                            return params;
                        }
                    },
                    ad: {
                        id: copy(),
                        type: value('ad'),
                        ad: value(true),
                        modules: value(['displayAd']),
                        placementId: copy(null)
                    },
                    links: {
                        id: copy(),
                        type: value('links'),
                        title: copy(null),
                        note: copy(null),
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: copy(),
                        params: copy()
                    },
                    recap: {
                        id: copy(),
                        type: copy(),
                        title: function() {
                            return 'Recap of ' + minireel.data.title;
                        },
                        note: copy(),
                        modules: function(card) {
                            return (card.placementId || (displayAdsEnabled && !card.sponsored)) ?
                                ['displayAd'] :
                                [];
                        },
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: copy(),
                        params: copy()
                    },
                    displayAd: {
                        id: copy(),
                        type: value('displayAd'),
                        title: copy(null),
                        note: copy(null),
                        modules: value([]),
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: function() {
                            return minireel.data.links;
                        },
                        thumbs: function() {
                            var logo = minireel.data.collateral.logo;

                            return {
                                small: logo,
                                large: logo
                            };
                        },
                        params: function() {
                            return {
                                sponsor: minireel.data.params.sponsor
                            };
                        }
                    },
                    wildcard: {
                        id: copy(),
                        type: value('wildcard')
                    }
                };

                function createCard() {
                    cardType = getCardType(card);
                    dataType = getDataType(card);


                    function createCardBase() {
                        var base = cardBases[cardType];
                        if(!base) {
                            return [];
                        }
                        return Object.keys(base).map(function(key) {
                            var fn = base[key];
                            return $q.when(fn(card, key, card))
                                .then(function(value) {
                                    if(isDefined(value)) {
                                        newCard[key] = value;
                                    }
                                });
                        });
                    }

                    function createCardData() {
                        var template = dataTemplates[dataType];
                        if(!template) {
                            return [];
                        }
                        return Object.keys(template).map(function(key) {
                            var fn = template[key];
                            return $q.when(fn((card.data || {}), key, card))
                                .then(function(value) {
                                    if(isDefined(value) && value !== null) {
                                        newCard.data[key] = value;
                                    }
                                });
                        });
                    }

                    return $q.all(createCardBase().concat(createCardData()))
                        .then(function() {
                            return newCard;
                        });
                }

                return createCard();
            };

            this.convertForPlayer = function(minireel, target) {
                function convertDeck(minireel) {
                    return $q.all(minireel.data.deck.map(function(card) {
                        return self.convertCardForPlayer(card, minireel);
                    }));
                }

                function convertMinireel(deck) {
                    forEach(minireel.data.ads, function(card, _index) {
                        var index = parseInt(_index);

                        deck.splice(index, 0, card);
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

                    target.data.deck = deck;

                    return target;
                }

                return convertDeck(minireel).then(convertMinireel);
            };

            this.getSkipValue = function(skipString) {
                switch (skipString) {
                case 'anytime':
                    return true;
                case 'never':
                    return false;
                case 'delay':
                    return 6;
                default:
                    return skipString;
                }
            };
        }]);
});
