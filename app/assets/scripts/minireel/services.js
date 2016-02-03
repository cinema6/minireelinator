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
        isObject = angular.isObject,
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

        .factory('paginatedDbList', ['scopePromise','cinema6','$rootScope','c6EventEmitter',
        function                    ( scopePromise , cinema6 , $rootScope , c6EventEmitter ) {
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

                c6EventEmitter(this);

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

                    list.emit('PaginatedListWillUpdate');

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
                        })
                        .finally(function() {
                            list.emit('PaginatedListHasUpdated');
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

            this.$get = ['FileService','$http', 'ThumbnailService',
                         '$q',
            function    ( FileService , $http ,  ThumbnailService ,
                          $q ) {
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

                    function returnPath(response) {
                        var result;

                        if (response.data instanceof Array) {
                            result = response.data[0].path;
                        } else {
                            result = response.data.path;
                        }
                        return result;
                    }

                    this.uploadFromUri = function(uri) {
                        return $http.post('/api/collateral/uri', { uri: uri })
                            .then(returnPath);
                    };

                    this.uploadFromFile = function(file) {
                        var promise;

                        function updateProgress(progress) {
                            promise.progress = progress;

                            return progress;
                        }

                        file = FileService.open(file);

                        promise = FileService.upload('/api/collateral/files', [ file ])
                            .then(returnPath, null, updateProgress);

                        return promise;
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

                        promise = FileService.upload(
                            '/api/collateral/files',
                            [file]
                        ).then(setResult, null, updateProgress);

                        return promise;
                    };

                    this.generateCollage = function(options) {
                        var minireel = options.minireel,
                            name = options.name,
                            width = options.width || defaultCollageWidth,
                            allRatios = options.allRatios,
                            ratio = minireel.data.splash.ratio.split('-');

                        function fetchThumbs(minireel) {
                            return $q.all(minireel.data.deck.map(function(card) {
                                if(card.thumb) {
                                    return {
                                        large: card.thumb
                                    };
                                } else {
                                    var data = card.data;
                                    var service = data.service || card.type;
                                    var id = data.videoid || data.imageid || data.id;

                                    return ThumbnailService.getThumbsFor(service, id, data)
                                        .ensureFulfillment();
                                }
                            })).then(function map(thumbs) {
                                return thumbs.map(function(thumb) {
                                    return thumb.large;
                                }).filter(function(src) {
                                    return !!src;
                                });
                            });
                        }

                        function generateCollage(thumbs) {
                            return $http.post('/api/collateral/splash', {
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
                            }).then(function returnResult(response) {
                                return new CollageResult(response.data);
                            });
                        }

                        return fetchThumbs(minireel)
                            .then(generateCollage);
                    };

                    this.websiteData = function(uri) {
                        var encoded = encodeURIComponent(uri),
                            whitelist = ['facebook','twitter','instagram','youtube','pinterest','vimeo'];

                        return $http.get('/api/collateral/website-data?uri=' + encoded)
                            .then(function(resp) {
                                var data = resp.data,
                                    links = data.links,
                                    logo = data.images.profile,
                                    valid = !!logo,
                                    _links = {};

                                forEach(links, function(link, key) {
                                    if (whitelist.indexOf(key) > -1) {
                                        _links[key] = link;

                                        if (link) { valid = true; }
                                    }
                                });

                                if (valid) {
                                    resp.data.links = _links;
                                    return resp.data;
                                } else {
                                    // if no links or logos are found
                                    // we're considering that a failure
                                    return $q.reject('No logo or social links found');
                                }
                            });
                    };
                }

                return new CollateralService();
            }];
        }])

        .service('CollateralUploadService', [ '$cacheFactory', '$http',
        function                            (  $cacheFactory ,  $http ) {
            var cache = $cacheFactory('CollateralUploadService:models');

            function returnPath(response) {
                var result;
                if(response.data instanceof Array) {
                    result = response.data[0].path;
                } else {
                    result = response.data.path;
                }
                return '/' + result;
            }

            this.uploadFromUri = function(uri) {
                var key = 'uri/' + uri;
                return cache.get(key) || cache.put(key, (function() {
                    return $http.post('/api/collateral/uri', { uri: uri })
                        .then(returnPath);
                }()));
            };
        }])

        .service('FileService', ['$window','$q','$rootScope','SelfieLoginDialogService',
        function                ( $window , $q , $rootScope , SelfieLoginDialogService ) {
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
                        var _data;

                        try {
                            _data = fromJson(xhr.response);
                        } catch(e) {
                            _data = xhr.response;
                        }

                        if (xhr.status === 401) {
                            return SelfieLoginDialogService.display()
                                .then(function() {
                                    xhr.open('POST', url);
                                    xhr.send(data);
                                });
                        }

                        deferred[ xhr.status < 400 ?
                            'resolve' : 'reject']({
                                data: _data,
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

        .service('ThumbnailService', ['$q', '$http', '$cacheFactory', 'VideoService',
                                      'OpenGraphService',
        function                     ( $q ,  $http ,  $cacheFactory ,  VideoService ,
                                       OpenGraphService ) {
            var _private = {},
                cache = $cacheFactory('ThumbnailService:models');

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

            _private.fetchVzaarThumbs = function(id) {
                var thumbnailUrl = 'https://view.vzaar.com/' + id + '/thumb';
                return {
                    small: thumbnailUrl,
                    large: thumbnailUrl
                };
            };

            _private.fetchWistiaThumbs = function(id) {
                var videoUrl = VideoService.urlFromData('wistia', id, { hostname: 'wistia.com' });
                var request = 'https://fast.wistia.com/oembed?url=' + encodeURIComponent(videoUrl);
                return $http.get(request, {cache: true})
                    .then(function(json) {
                        if(json.status === 200) {
                            return {
                                /* jshint camelcase:false */
                                small: json.data.thumbnail_url,
                                large: json.data.thumbnail_url
                                /* jshint camelcase:true */
                            };
                        }
                        return $q.reject();
                    });
            };

            _private.fetchJWPlayerThumbs = function(id) {
                function thumbUrl(id, width) {
                    return 'https://content.jwplatform.com/thumbs/' +
                        videoId + '-' + width + '.jpg';
                }

                var videoId = id.split('-')[0];
                return {
                    small: thumbUrl(videoId, '320'),
                    large: thumbUrl(videoId, '720')
                };
            };

            _private.fetchInstagramThumbs = function(id) {
                var instagramKey = c6Defines.kInstagramDataApiKey;
                var request = 'https://api.instagram.com/v1/media/shortcode/' + id +
                              '?client_id=' + instagramKey + '&callback=JSON_CALLBACK';
                return $http.jsonp(request, {cache: true})
                    .then(function(json) {
                        if(json.status === 200 && json.data.meta.code === 200) {
                            return {
                                small: json.data.data.images.thumbnail.url,
                                /* jshint camelcase:false */
                                large: json.data.data.images.low_resolution.url
                                /* jshint camelcase:true */
                            };
                        }
                        return $q.reject();
                    });
            };

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

            _private.fetchWebThumbs = function(imageid) {
                return {
                    small: imageid,
                    large: imageid
                };
            };

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

            _private.fetchKalturaThumbs = function(videoid, partnerid) {
                function getThumb(width) {
                    return 'https://cdnapisec.kaltura.com/p/' + partnerid +
                        '/thumbnail/entry_id/' + videoid + '/width/' + width;
                }
                return {
                    small: getThumb(270),
                    large: getThumb(540)
                };
            };

            this.getThumbsFor = function(service, id, data) {
                var key = service + ':' + id;
                return cache.get(key) ||
                    cache.put(key, (function() {
                        switch (service) {
                        case 'instagram':
                            return new ThumbModel(_private.fetchInstagramThumbs(id));
                        case 'flickr':
                            return new ThumbModel(_private.fetchFlickrThumbs(id));
                        case 'getty':
                            return new ThumbModel($q.when(_private.fetchGettyThumbs(id)));
                        case 'web':
                            return new ThumbModel($q.when(_private.fetchWebThumbs(id)));
                        case 'youtube':
                            return new ThumbModel(_private.fetchYouTubeThumbs(id));
                        case 'vimeo':
                            return new ThumbModel(_private.fetchVimeoThumbs(id));
                        case 'dailymotion':
                            return new ThumbModel(_private.fetchDailyMotionThumbs(id));
                        case 'vzaar':
                            return new ThumbModel($q.when(_private.fetchVzaarThumbs(id)));
                        case 'wistia':
                            return new ThumbModel(_private.fetchWistiaThumbs(id));
                        case 'jwplayer':
                            return new ThumbModel($q.when(_private.fetchJWPlayerThumbs(id)));
                        case 'vine':
                            return new ThumbModel(_private.fetchOpenGraphThumbs(service, id));
                        case 'kaltura':
                            return new ThumbModel($q.when(_private.fetchKalturaThumbs(id,
                                data.partnerid)));
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
            this.urlFromData = function(service, id, data) {
                switch (service) {

                case 'youtube':
                    return 'https://www.youtube.com/watch?v=' + id;
                case 'vimeo':
                    return 'http://vimeo.com/' + id;
                case 'dailymotion':
                    return 'http://www.dailymotion.com/video/' + id;
                case 'vine':
                    return 'https://vine.co/v/' + id;
                case 'vzaar':
                    return 'http://vzaar.tv/' + id;
                case 'wistia':
                    return 'https://' + data.hostname + '/medias/' + id + '?preview=true';
                case 'jwplayer':
                    return 'https://content.jwplatform.com/previews/' + id;
                case 'vidyard':
                    return 'http://embed.vidyard.com/share/' + id;
                case 'instagram':
                    return 'https://instagram.com/p/' + id;
                case 'brightcove':
                    return 'https://players.brightcove.net/' + data.accountid + '/' +
                        data.playerid + '_' + data.embedid + '/index.html?videoId=' + id;
                case 'kaltura':
                    return 'https://www.kaltura.com/index.php/extwidget/preview/partner_id/' +
                        data.partnerid + '/uiconf_id/' + data.playerid + '/entry_id/' + id +
                        '/embed/iframe';
                }
            };

            this.dataFromText = function(text) {
                var parsedUrl = c6UrlParser(text),
                    urlService = (parsedUrl.hostname.match(
                        new RegExp('youtube|youtu\\.be|dailymotion|dai\\.ly|vimeo|' +
                            'vine|vzaar\\.tv|wistia|jwplatform|vidyard|instagram|brightcove|' +
                            'kaltura')
                    ) || [])[0],
                    embedService = (text.match(
                        new RegExp('youtube|youtu\\.be|dailymotion|dai\\.ly|vimeo|jwplatform|' +
                            'wistia|vzaar|vidyard|instagram|brightcove|kaltura')
                    ) || [])[0],
                    embed = /<iframe|<script/.test(text) ? 'embed' : null,
                    type = !!urlService ? 'url' : embed,
                    parsed = type === 'url' ? parsedUrl : text,
                    data, service,
                    dataFetchers = {
                        url: {
                            youtube: function(url) {
                                return {
                                    id: params(url.search).v
                                };
                            },
                            'youtu.be': function(url) {
                                return {
                                    id: url.pathname.replace(/^\//, '')
                                };
                            },
                            vimeo: function(url) {
                                return {
                                    id: url.pathname.replace(/^\//, '')
                                };
                            },
                            dailymotion: function(url) {
                                var pathname = url.pathname;

                                if (pathname.search(/^\/video\//) < 0) {
                                    return { id: null };
                                }

                                var id = (pathname
                                    .replace(/\/video\//, '')
                                    .match(/[a-zA-Z0-9]+/) || [])[0];
                                return { id: id };
                            },
                            'dai.ly': function(url) {
                                return {
                                    id: url.pathname.replace(/^\//, '')
                                };
                            },
                            vine: function(url) {
                                var id = (url.pathname
                                    .replace(/\/v\//, '')
                                    .match(/[a-zA-Z\d]+/) || [null])[0];
                                return { id: id };
                            },
                            'vzaar.tv': function(url) {
                                var id = (url.pathname
                                    .replace(/\//, '')
                                    .match(/\d+/) || [null])[0];
                                return { id: id };
                            },
                            wistia: function(url) {
                                var id = (url.pathname
                                    .replace(/\/medias\//, '')
                                    .match(/[a-zA-Z\d]+/) || [null])[0];
                                return {
                                    id: id,
                                    hostname: parsed.hostname
                                };
                            },
                            jwplatform: function(url) {
                                var id = (url.pathname
                                    .replace(/\/previews\//, '')
                                    .match(/[a-zA-Z\d-]+/) || [null])[0];
                                return { id: id };
                            },
                            vidyard: function(url) {
                                var id = (url.pathname.match(/\/share\/([a-zA-Z\d_-]+)/) ||
                                    [null, null])[1];
                                return { id: id };
                            },
                            instagram: function(url) {
                                var id = (url.pathname.replace(/\/p\//, '')
                                    .match(/[\dA-z_-]+/) || [null])[0];
                                return { id: id };
                            },
                            brightcove: function(url) {
                                var dataMatch = url.pathname
                                    .match(/\/(\d+)\/([\da-f-]+|default)_(.+)\/index\.html/);
                                var idMatch = url.search.match(/videoId=(\d+)/);
                                if(dataMatch && idMatch) {
                                    return {
                                        id: idMatch[1],
                                        accountid: dataMatch[1],
                                        playerid: dataMatch[2],
                                        embedid: dataMatch[3]
                                    };
                                } else {
                                    return null;
                                }
                            },
                            kaltura: function(url) {
                                var dataMatch = url.pathname.match(new RegExp('\\/index\\.php\\/' +
                                    'extwidget\\/preview\\/partner_id\\/(\\d+)\\/uiconf_id\\/' +
                                    '(\\d+)\\/entry_id\\/([^\\/]+)\\/embed'));
                                return (dataMatch) ? {
                                    partnerid: dataMatch[1],
                                    playerid: dataMatch[2],
                                    id: dataMatch[3]
                                } : null;
                            }
                        },
                        embed: {
                            youtube: function(embed) {
                                return {
                                    id: (embed.match(/embed\/([\-_a-zA-Z0-9]+)/) || [])[1]
                                };
                            },
                            vimeo: function(embed) {
                                return {
                                    id: (embed.match(/video\/([0-9]+)/) || [])[1]
                                };
                            },
                            dailymotion: function(embed) {
                                return {
                                    id: (embed.match(/video\/([a-zA-Z0-9]+)/) || [])[1]
                                };
                            },
                            jwplatform: function(embed) {
                                var id = (embed.match(
                                    /content.jwplatform.com\/players\/([a-zA-Z\d-]+)/) || [])[1];
                                return { id: id };
                            },
                            wistia: function(embed) {
                                var id = (embed.match(
                                    /fast.wistia.net\/embed\/iframe\/([a-zA-Z\d]+)/) || [])[1];
                                return { id: id };
                            },
                            vzaar: function(embed) {
                                return {
                                    id: (embed.match(/view.vzaar.com\/(\d+)/) || [])[1]
                                };
                            },
                            vidyard: function(embed) {
                                var id = (embed.match(
                                    /play\.vidyard\.com\/([a-zA-Z\d_-]+)/) || [])[1];
                                return { id: id };
                            },
                            instagram: function(embed) {
                                var id = (embed.match(/instagram.com\/p\/([\dA-z_-]+)/) || [])[1];
                                return { id: id };
                            },
                            brightcove: function(embed) {
                                var iframeEmbedMatch = embed.match(new RegExp('\\/\\/players\\' +
                                    '.brightcove\\.net\\/(\\d+)\\/([\\da-f-]+|default)_(.+)' +
                                    '\\/index\\.html\\?videoId=(\\d+)'));
                                if(iframeEmbedMatch) {
                                    return {
                                        id: iframeEmbedMatch[4],
                                        accountid: iframeEmbedMatch[1],
                                        playerid: iframeEmbedMatch[2],
                                        embedid: iframeEmbedMatch[3]
                                    };
                                }
                                var scriptEmbedMatch = embed.match(/<video(\s.+)+><\/video>/);
                                if(scriptEmbedMatch) {
                                    var result = {};
                                    var attrKey = {
                                        'data-video-id': 'id',
                                        'data-account': 'accountid',
                                        'data-player': 'playerid',
                                        'data-embed': 'embedid'
                                    };
                                    Object.keys(attrKey).forEach(function(attribute) {
                                        var match = scriptEmbedMatch[0]
                                            .match(new RegExp(attribute + '="(\\S+)"'));
                                        if(match) {
                                            result[attrKey[attribute]] = match[1];
                                        }
                                    });
                                    return result;
                                }
                                return null;
                            },
                            kaltura: function(embed) {
                                var partnerMatch = embed.match(/partner_id\/(\d+)/);
                                var playerMatch = embed.match(/uiconf_id\/(\d+)/);
                                var idMatch = embed.match(/entry_id=([^&]+)&/) ||
                                    embed.match(/entry_id":\s*"([^"]+)"/) ||
                                    embed.match(/entry_id\/([^\/"]+)/);
                                return (partnerMatch && playerMatch && idMatch) ? {
                                    partnerid: partnerMatch[1],
                                    playerid: playerMatch[1],
                                    id: idMatch[1]
                                } : null;
                            }
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

                service = urlService || embedService;

                if (!service || !type) { return null; }

                data = dataFetchers[type][service](parsed);

                switch (service) {
                case 'youtu.be':
                    service = 'youtube';
                    break;
                case 'dai.ly':
                    service = 'dailymotion';
                    break;
                case 'vzaar.tv':
                    service = 'vzaar';
                    break;
                case 'jwplatform':
                    service = 'jwplayer';
                }

                if (!data || !data.id) { return null; }

                var result = {
                    service: service,
                    id: data.id
                };
                delete data.id;
                result.data = data;
                return result;
            };

            this.embedIdFromVideoId = function(service, videoid) {
                return videoid;
            };

            this.embedCodeFromData = function(service, id) {
                function vineSrc(id) {
                    return 'https://vine.co/v/' + id + '/embed/simple';
                }

                function vzaarSrc(id) {
                    return '//view.vzaar.com/' + id + '/player';
                }

                function wistiaSrc(id) {
                    return '//fast.wistia.net/embed/iframe/' + id + '?videoFoam=true';
                }

                function jwplayerSrc(id) {
                    return '//content.jwplatform.com/players/' + id + '.html';
                }

                switch (service) {
                case 'vine':
                    return '<iframe' +
                               ' src="' + vineSrc(id) + '"' +
                               ' style="width:100%;height:100%"' +
                               ' frameborder="0">' +
                           '</iframe>' +
                           '<script' +
                               ' src="https://platform.vine.co/static/scripts/embed.js">' +
                           '</script>';
                case 'vzaar':
                    return '<iframe allowFullScreen allowTransparency="true"' +
                        ' width="100%" height="100%"' +
                        ' class="vzaar-video-player" frameborder="0" id="vzvd-' + id + '"' +
                        ' mozallowfullscreen name="vzvd-' + id + '"' +
                        ' src="' + vzaarSrc(id) + '" title="vzaar video player"' +
                        ' type="text/html" webkitAllowFullScreen width="768"></iframe>';
                case 'wistia':
                    return '<div class="wistia_responsive_padding"' +
                        ' style="padding:56.25% 0 0 0;position:relative;">' +
                        '<div class="wistia_responsive_wrapper"' +
                        ' style="height:100%;left:0;position:absolute;top:0;width:100%;">' +
                        '<iframe src="' + wistiaSrc(id) + '" allowtransparency="true"' +
                        ' frameborder="0" scrolling="no" class="wistia_embed"' +
                        ' name="wistia_embed" allowfullscreen mozallowfullscreen' +
                        ' webkitallowfullscreen oallowfullscreen msallowfullscreen' +
                        ' width="100%" height="100%"></iframe></div></div>' +
                        '<script src="//fast.wistia.net/assets/external/E-v1.js" async></script>';
                case 'jwplayer':
                    return '<iframe src="' + jwplayerSrc(id) + '" style="width:100%;height:100%"' +
                        ' frameborder="0" scrolling="auto" allowfullscreen></iframe>';
                }
            };
        }])

        .service('ImageService', ['$http', '$q', 'c6ImagePreloader',
        function                 ( $http ,  $q ,  c6ImagePreloader ) {

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

            // This function uses the collateral service endpoint to upload an image and return
            // its path
            _private.getWebEmbedInfo = function(imageid) {
                return c6ImagePreloader.load([imageid])
                    .then(function() {
                        return {
                            src: imageid
                        };
                    })
                    .catch(function() {
                        return $q.reject('Image could not be loaded.');
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
                    },
                    web: {
                        patterns: [
                            {
                                urlFormat: (function() {
                                    var imageTypes = ['jpg', 'jpeg', 'gif', 'png', 'bmp'];
                                    var typeRegex = imageTypes
                                    .reduce(function(previous, current) {
                                        return previous + '|' + current +
                                                          '|' + current.toUpperCase();
                                    }, '');
                                    return new RegExp('.+\\.(' + typeRegex.slice(1) + ')');
                                }()),
                                idFetcher: function(url) {
                                    return url;
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
                    case 'web':
                        return _private.getWebEmbedInfo(imageid);
                    default:
                        return $q.when({ });
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
                    case 'web':
                        return imageid;
                    default:
                        return null;
                }
            };

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .service('InstagramService', ['$http', '$q',
        function                     ( $http ,  $q ) {
            var _private = { };

            _private.apiRequest = function(endpoint) {
                var instagramKey = c6Defines.kInstagramDataApiKey;
                var request = 'https://api.instagram.com/v1' + endpoint +
                    '?client_id=' + instagramKey + '&callback=JSON_CALLBACK';
                return $http.jsonp(request, {cache: true})
                    .then(function(json) {
                        if(json.status === 200 && json.data.meta.code === 200) {
                            return json.data.data;
                        } else {
                            return $q.reject('api error');
                        }
                    })
                    .catch(function(reason) {
                        if(reason === 'api error') {
                            return $q.reject(
                                'There was a problem retrieving the media from Instagram.'
                            );
                        } else {
                            return $q.reject('There was a problem contacting Instagram.');
                        }
                    });
            };

            _private.apiMedia = function(id) {
                return _private.apiRequest('/media/shortcode/' + id);
            };

            _private.apiUser = function(id) {
                return _private.apiRequest('/users/' + id);
            };

            this.dataFromUrl = function(url) {
                var id = (url.match(/(www\.|:\/\/)instagram.com\/p\/[\dA-z_-]+/) || [''])[0]
                             .replace(/(www\.|:\/\/)instagram.com\/p\//, '') || null;
                return {
                    id: id
                };
            };

            this.getCardInfo = function(id) {
                var cardInfo = { };
                return _private.apiMedia(id)
                    .then(function(data) {
                        cardInfo.type = data.type;
                        switch(cardInfo.type) {
                        case 'image':
                            /* jshint camelcase:false */
                            cardInfo.src = data.images.standard_resolution.url;
                            /* jshint camelcase:true */
                            break;
                        case 'video':
                            /* jshint camelcase:false */
                            cardInfo.src = data.videos.standard_resolution.url;
                            /* jshint camelcase:true */
                            break;
                        }
                        cardInfo.href = data.link;
                        cardInfo.likes = data.likes.count;
                        /* jshint camelcase:false */
                        cardInfo.date = data.created_time;
                        /* jshint camelcase:true */
                        cardInfo.caption = (data.caption) ? data.caption.text : null;
                        cardInfo.comments = data.comments.count;
                        cardInfo.user = {
                            /* jshint camelcase:false */
                            fullname: data.user.full_name,
                            picture: data.user.profile_picture,
                            /* jshint camelcase:true */
                            username: data.user.username,
                            follow: 'https://instagram.com/accounts/login/?next=%2Fp%2F' + id +
                                '%2F&source=follow',
                            href: 'https://instagram.com/' + data.user.username
                        };
                        return _private.apiUser(data.user.id);
                    })
                    .then(function(data) {
                        cardInfo.user.bio = data.bio;
                        cardInfo.user.website = data.website;
                        cardInfo.user.posts = data.counts.media;
                        /* jshint camelcase:false */
                        cardInfo.user.followers = data.counts.followed_by;
                        /* jshint camelcase:true */
                        cardInfo.user.following = data.counts.follows;
                        return cardInfo;
                    });
            };

            this.getEmbedInfo = function(id) {
                if(!id) { return $q.when({ }); }

                return _private.apiMedia(id)
                    .then(function(data) {
                        var result = {
                            type: data.type
                        };
                        switch(result.type) {
                        case 'image':
                            /* jshint camelcase:false */
                            result.src = data.images.standard_resolution.url;
                            /* jshint camelcase:true */
                            break;
                        case 'video':
                            /* jshint camelcase:false */
                            result.src = data.videos.standard_resolution.url;
                            /* jshint camelcase:true */
                            break;
                        }
                        return result;
                    });
            };

            this.urlFromData = function(id) {
                if(!id) {
                    return null;
                }

                return 'https://instagram.com/p/' + id;
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

        .service('NormalizationService', [function() {
            var ngCopy = angular.copy;

            function recurse(template, base, target, config) {
                forEach(template, function(value, key) {
                    if (isFunction(value)) {
                        target[key] = value.apply(target, [base, key].concat(config.args || []));
                    } else if (isArray(value)) {
                        target[key] = base[key] || [];
                        recurse(value, (base[key] || []), target[key], config);
                    } else if (isObject(value)) {
                        target[key] = base[key] || {};
                        recurse(value, (base[key] || {}), target[key], config);
                    }
                });

                return target;
            }

            function scrub(template, target) {
                forEach(target, function(value, key) {
                    if (!template.hasOwnProperty(key)) {
                        if (isArray(target)) {
                            target.splice(key, 1);
                        } else if (isObject(target)) {
                            delete target[key];
                        }
                    } else if (!isFunction(template[key]) &&
                        (isArray(value) || isObject(value))) {
                        scrub(template[key], value);
                    }
                });

                return target;
            }

            this.copy = function(def) {
                return function(data, key) {
                    var value = data[key];

                    return isUndefined(value) ?
                        def : ngCopy(value);
                };
            };

            this.value = function(val) {
                return function() {
                    return val;
                };
            };

            //////////////////////////////////////////////////////////////
            //
            // NormalizeService.normalize(template, base, target, config);
            //
            //////////////////////////////////////////////////////////////
            //
            // template: the normalization template. Each property can be either an
            //      object, array, or a function that sets the property value when called.
            //      Each functional property will be called with the base data, the key,
            //      and any other args from the config object (see below).
            //
            // base: the base object with data that we will be normalizing against.
            //      This object (or properties on it) gets passed as the first argument
            //      into each functional property defined on the template.
            //
            // target: the object to copy properties to. If not defined the normalization
            //      will create and return a new object. It is possible for the base, target
            //      and config args to be references to the same object. This can be handy
            //      when normalizing a DB Model.
            //
            // config: a config object that currently supports two properties: 'clean'
            //      and 'args'. 'clean' is a boolean that will remove all properties from
            //      the target object that are not defined on the template. 'args' is an
            //      an array of arguments that will be passed to the functional properties
            //      defined on the template.
            //
            /////////////////////////////////////////////////////////////

            this.normalize = function(template, base, target, config) {
                base = base || {};
                target = target || {};
                config = config || {};

                return !config.clean ?
                    recurse(template, base, target, config) :
                    scrub(template, recurse(template, base, target, config));
            };
        }])

        .service('MiniReelService', ['$window','cinema6','$q','VoteService','c6State',
                                     'SettingsService','VideoService', 'ThumbnailService',
                                     'ImageService', 'OpenGraphService',
                                     'CollateralUploadService', 'InstagramService',
                                     'c6UrlParser','NormalizationService',
        function                    ( $window , cinema6 , $q , VoteService , c6State ,
                                      SettingsService , VideoService ,  ThumbnailService,
                                      ImageService,   OpenGraphService,
                                      CollateralUploadService ,  InstagramService,
                                      c6UrlParser , NormalizationService ) {
            var ngCopy = angular.copy,
                copy = NormalizationService.copy,
                value = NormalizationService.value;

            var self = this,
                app = c6State.get('Application'),
                application = c6State.get(app.name),
                MiniReelState = c6State.get('MiniReel');

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

            function makeCard(rawData, base) {
                var template, dataTemplates,
                    imageDataTemplate, videoDataTemplate,
                    instagramDataTemplate,
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
                        case 'adUnit':
                        case 'vine':
                        case 'vzaar':
                        case 'wistia':
                        case 'jwplayer':
                        case 'vidyard':
                        case 'videoBallot':
                        case 'htmlvideo':
                        case 'brightcove':
                        case 'kaltura':
                            return 'video';
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
                                case 'image':
                                    return 'Image';
                                case 'instagram':
                                    return 'Instagram';
                                case 'video':
                                    return 'Video';
                                case 'ad':
                                    return 'Advertisement';
                                case 'links':
                                    return 'Suggested Links';
                                case 'intro':
                                    return 'Intro';
                                case 'recap':
                                    return 'Recap';
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
                            return 'video';
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
                        playUrls: []
                    }),
                    collateral: copy({}),
                    thumb: function(card) {
                        return (card.thumbs && card.thumbs.large) || null;
                    },
                    links: function(card) {
                        return card.links || {};
                    },
                    shareLinks: function(card) {
                        var result = { };
                        if(!card.shareLinks) {
                            return result;
                        }
                        ['facebook', 'twitter', 'pinterest'].forEach(function(service) {
                            if(card.shareLinks[service]) {
                                result[service] = card.shareLinks[service];
                            }
                        });
                        return result;
                    },
                    params: copy({})
                };

                // imageDataTemplate: this is the base template for all
                // image cards.
                imageDataTemplate = {
                    service: copy(null),
                    imageid: function(data) {
                        if(data.service === 'web') {
                            return data.href || null;
                        } else {
                            return data.imageid || null;
                        }
                    }
                };

                // instagramDataTemplate: this is the base template for all
                // instagram cards.
                instagramDataTemplate = {
                    id: copy(null)
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

                        if(type === 'htmlvideo') {
                            return VideoService.dataFromText(card.data.href).service;
                        } else {
                            return data.service ||
                                (type.search(/^(youtube|dailymotion|vimeo|adUnit)$/) > -1 ?
                                    type : null);
                        }
                    },
                    videoid: function(data, key, card) {
                        switch (card.type) {
                        case 'adUnit':
                            return toJson({
                                vast: data.vast,
                                vpaid: data.vpaid
                            });
                        case 'htmlvideo':
                            return VideoService.dataFromText(card.data.href).id;
                        default:
                            return data.videoid || null;
                        }
                    },
                    hostname: function(data) {
                        if (data.service === 'wistia') {
                            if(data.hostname) {
                                return data.hostname;
                            } else if(data.href) {
                                var parsedUrl = c6UrlParser(data.href);
                                return parsedUrl.hostname;
                            }
                        }
                        return null;
                    },
                    playerid: copy(null),
                    embedid: copy(null),
                    accountid: copy(null),
                    partnerid: copy(null),
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
                    image: imageDataTemplate,
                    instagram: instagramDataTemplate,
                    video: videoDataTemplate,
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
                    recap: {},
                    wildcard: {}
                };

                // normalize the card based on templates
                card = NormalizationService.normalize(
                    template,
                    rawData,
                    card
                );

                card.data = NormalizationService.normalize(
                    dataTemplates[card.type],
                    rawData.data,
                    card.data,
                    {
                        args: [rawData],
                        clean: true
                    }
                );

                return card;
            }

            this.modeCategoryOf = function(minireel/*, categories*/) {
                var categories = arguments[1] || (MiniReelState.cModel || { data: {} }).data.modes;
                var result = {},
                    modeValue = minireel && minireel.data.mode;

                forEach(categories, function(category) {
                    forEach(category.modes, function(mode) {
                        if (mode.value === modeValue) {
                            result = category;
                        }
                    });
                });

                return result;
            };

            this.modeDataOf = function(minireel/*, categories*/) {
                var categories = arguments[1] || (MiniReelState.cModel || { data: {} }).data.modes;
                var result;

                if (!minireel) { return undefined; }

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

            this.previewUrlOf = function(minireel) {
                var debug = c6Defines.kDebug;

                return ((minireel.access === 'public') || null) &&
                    (debug ? '//platform-staging.reelcontent.com' : '//reelcontent.com') +
                    ('/preview?experience=' + encodeURIComponent(minireel.id));
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
                var self = this;

                function convertDeck(minireel) {
                    return $q.all(minireel.data.deck.
                        filter(function(card) {
                            return !(
                                /^(ad|displayAd|recap|text|article|rumble|embedded)$/
                            ).test(card.type);
                        })
                        .map(self.convertCardForEditor));
                }

                function convertMinireel(deck) {
                    var model = target || {};
                    var modeData = self.modeDataOf(minireel) || {};
                    var mode = (modeData.deprecated ? (modeData.replacement || (function() {
                            var modes = self.modeCategoryOf(minireel).modes;

                            var length = modes.length, index = 0;
                            for (; index < length; index++) {
                                if (!modes[index].deprecated) {
                                    return modes[index].value;
                                }
                            }
                        }())) : modeData.value) ||
                        SettingsService.getReadOnly('MR::org').minireelDefaults.mode;

                    // Make sure the target is empty
                    forEach(target, function(value, key) {
                        delete target[key];
                    });

                    model.data = {
                        title: minireel.data.title,
                        mode: mode,
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
                        deck: deck
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
                                deck: []
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
                    minireel = _minireel || {
                        data: {
                            mode: null,
                            deck: []
                        }
                    },
                    newCard = {
                        data: {}
                    };

                function camelSource(source) {
                    switch(source) {

                    case 'youtube':
                        return 'YouTube';
                    case 'dailymotion':
                        return 'DailyMotion';
                    case 'getty':
                        return 'gettyimages';
                    case 'jwplayer':
                        return 'JWPlayer';
                    case 'web':
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
                        return 'video';
                    default:
                        return card.type;
                    }
                }

                function getDataType(card) {
                    switch (card.type) {
                    case 'video':
                        var service = card.data.service;
                        if(service === 'instagram') {
                            return 'htmlvideo';
                        } else {
                            return service;
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
                        return VideoService.urlFromData(data.service, data.videoid, data);
                    };
                }

                function videoThumbsValue() {
                    return function(data) {
                        return ThumbnailService.getThumbsFor(data.service, data.videoid, data)
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
                        if(data.service === 'web') {
                            return CollateralUploadService.uploadFromUri(data.imageid)
                                .then(function(path) {
                                    return {
                                        small: path,
                                        large: path
                                    };
                                });
                        } else {
                            return ThumbnailService.getThumbsFor(data.service, data.imageid, data)
                                .ensureFulfillment()
                                .then(function(thumbs) {
                                    return {
                                        small: thumbs.small,
                                        large: thumbs.large
                                    };
                                });
                        }
                    };
                }

                function instagramThumbsValue() {
                    return function(data) {
                        return ThumbnailService.getThumbsFor('instagram', data.id, data)
                            .ensureFulfillment()
                            .then(function(thumbs) {
                                return {
                                    small: thumbs.small,
                                    large: thumbs.large
                                };
                            });
                    };
                }

                function embedValue() {
                    return function(data, key) {
                        return ImageService.getEmbedInfo(data.service, data.imageid)
                            .then(function(info) {
                                return info[key];
                            });
                    };
                }

                function imageHrefValue() {
                    return function(data) {
                        return ImageService.urlFromData(data.service, data.imageid);
                    };
                }

                function imageSrcValue() {
                    return function(data, key) {
                        if(data.service === 'web') {
                            return CollateralUploadService.uploadFromUri(data.imageid)
                                .then(function(path) {
                                    return path;
                                });
                        } else {
                            return embedValue()(data, key);
                        }
                    };
                }

                function instagramCardInfo() {
                    return function(data, key, card) {
                        return InstagramService.getCardInfo(card.data.id)
                            .then(function(info) {
                                return info[key];
                            });
                    };
                }

                dataTemplates = {
                    image: {
                        imageid: function(data) {
                            if(data.service === 'web') {
                                return null;
                            } else {
                                return data.imageid;
                            }
                        },
                        service: copy(null),
                        src: imageSrcValue(),
                        href: imageHrefValue(),
                        width: embedValue(),
                        height: embedValue(),
                        source: function(data) {
                            return camelSource(data.service);
                        },
                        thumbs: imageThumbsValue()
                    },
                    instagram: {
                        type: instagramCardInfo(),
                        id: copy(null),
                        src: instagramCardInfo(),
                        thumbs: instagramThumbsValue(),
                        href: instagramCardInfo(),
                        likes: instagramCardInfo(),
                        date: instagramCardInfo(),
                        caption: instagramCardInfo(),
                        comments: instagramCardInfo(),
                        user: instagramCardInfo()
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
                        thumbs: videoThumbsValue(),
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
                        thumbs: videoThumbsValue(),
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
                        thumbs: videoThumbsValue(),
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
                    vine: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        service: copy(),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
                        moat: copy(null)
                    },
                    vzaar: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        service: copy(),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
                        moat: copy(null)
                    },
                    wistia: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        service: copy(),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
                        moat: copy(null)
                    },
                    jwplayer: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        service: copy(),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
                        moat: copy(null)
                    },
                    vidyard: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        service: copy(),
                        videoid: copy(null),
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
                        moat: copy(null)
                    },
                    htmlvideo: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        videoid: function(data) {
                            switch(data.service) {
                            case 'instagram':
                                return InstagramService.getEmbedInfo(data.videoid)
                                .then(function(info) {
                                    return info.src;
                                });
                            default:
                                return data.videoid;
                            }
                        },
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
                        moat: copy(null)
                    },
                    brightcove: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        service: copy(),
                        videoid: copy(null),
                        accountid: copy(null),
                        playerid: copy(null),
                        embedid: copy(null),
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
                        moat: copy(null)
                    },
                    kaltura: {
                        hideSource: hideSourceValue(),
                        autoplay: copy(null),
                        autoadvance: copy(null),
                        skip: skipValue(),
                        service: copy(),
                        videoid: copy(null),
                        partnerid: copy(null),
                        playerid: copy(null),
                        href: hrefValue(),
                        thumbs: videoThumbsValue(),
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
                    default: {
                        moat: copy(),
                        autoplay: copy(),
                        autoadvance: copy(),
                        controls: copy(),
                        skip: skipValue()
                    }
                };

                cardBases = {
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
                    instagram: {
                        id: copy(),
                        type: value('instagram'),
                        title: copy(null),
                        source: function(card) {
                            return camelSource(card.type);
                        },
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
                    video: {
                        id: copy(),
                        type: function(card) {
                            if(card.data.service === 'instagram') {
                                return 'htmlvideo';
                            } else {
                                return card.data.service || card.type;
                            }
                        },
                        title: copy(null),
                        note: copy(null),
                        source: function(card) {
                            return camelSource(card.data.service);
                        },
                        modules: function(card) {
                            var modules = {
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
                        shareLinks: function(card) {
                            var result = { };
                            if(!card.shareLinks) {
                                return result;
                            }
                            ['facebook', 'twitter', 'pinterest'].forEach(function(service) {
                                if(card.shareLinks[service]) {
                                    result[service] = card.shareLinks[service];
                                }
                            });
                            return result;
                        },
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
                        modules: value([]),
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
                        modules: copy([]),
                        placementId: copy(null),
                        templateUrl: copy(null),
                        sponsored: copy(false),
                        campaign: copy(),
                        collateral: copy(),
                        links: copy(),
                        params: copy()
                    },
                    wildcard: {
                        id: copy(),
                        type: value('wildcard')
                    }
                };

                function createCard() {
                    cardType = getCardType(card);
                    dataType = getDataType(card) || 'default';

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
                    var deck = ngCopy(minireel.data.deck),
                        lastCard = deck[deck.length - 1];

                    if (lastCard) {
                        if (lastCard.type === 'recap' && deck.length < 3) {
                            deck.pop();
                        }
                        if (lastCard.type !== 'recap' && deck.length > 1) {
                            deck.push(self.createCard('recap'));
                        }
                    }

                    return $q.all(deck.map(function(card) {
                        return self.convertCardForPlayer(card, minireel);
                    }));
                }

                function convertMinireel(deck) {
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
