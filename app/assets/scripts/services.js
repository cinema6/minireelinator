(function() {
    'use strict';

    var forEach = angular.forEach,
        ngCopy = angular.copy,
        isNumber = angular.isNumber,
        isUndefined = angular.isUndefined,
        isDefined = angular.isDefined,
        extend = angular.extend,
        isFunction = angular.isFunction,
        fromJson = angular.fromJson;

    angular.module('c6.mrmaker')
        .factory('c6AsyncQueue', ['$q',
        function                 ( $q ) {
            function Queue() {
                this.queue = [];
            }
            Queue.prototype = {
                wrap: function(fn, context) {
                    var queue = this.queue;

                    return function() {
                        var args = arguments,
                            promise = $q.all(queue)
                                .then(function apply() {
                                    return fn.apply(context, args);
                                });

                        queue.push(promise);

                        promise.finally(function() {
                            queue.splice(queue.indexOf(promise), 1);
                        });

                        return promise;
                    };
                }
            };

            return function() {
                return new Queue();
            };
        }])

        .service('CollateralService', ['FileService',
        function                      ( FileService ) {
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

                promise = FileService.upload('/api/collateral/files/' + experience.id, [file])
                    .then(setResult, null, updateProgress);

                return promise;
            };
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
        function                ( cinema6, $q ) {
            function hasElectionData(deck){
                var hasData = false;
                forEach(deck,function(card){
                    if ((!hasData) &&
                        ((card.modules || []).indexOf('ballot') >= 0) &&
                        (card.ballot) &&
                        (card.ballot.choices)) {
                        hasData = true;
                    }
                });
                return hasData;
            }

            function generateData(deck, election) {
                function cardWithId(id) {
                    return deck.filter(function(card) {
                        return card.id === id;
                    })[0];
                }

                election = election || {
                    ballot: {}
                };

                //TODO: remove useArrayStorage once we deploy new vote service
                // new ballot items should always use array storage
                var useArrayStorage = false;
                forEach(election.ballot,function(vals){
                    if ((useArrayStorage === false) && (angular.isArray(vals))){
                        useArrayStorage = true;
                    }
                });
                
                delete election.id;

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
                if (hasElectionData(minireel.data.deck) === false){
                    return $q.when(null);
                }
                return cinema6.db.create('election', generateData(minireel.data.deck))
                    .save()
                    .then(function attachId(election) {
                        minireel.data.election = election.id;

                        return election;
                    });
            };

            this.update = function(minireel) {
                if (hasElectionData(minireel.data.deck) === false){
                    return $q.when(null);
                }
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

        .service('VideoThumbnailService', ['$q','$cacheFactory','$http',
        function                          ( $q , $cacheFactory , $http ) {
            var _private = {},
                cache = $cacheFactory('VideoThumbnailService:models');

            function ThumbModel(promise) {
                var self = this;

                this.small = null;
                this.large = null;

                promise.then(function setThumbs(thumbs) {
                    self.small = thumbs.small;
                    self.large = thumbs.large;
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

        .service('MiniReelService', ['crypto','$window','cinema6','$q','VoteService',
        function                    ( crypto , $window , cinema6 , $q , VoteService ) {
            var self = this;

            function generateId(prefix) {
                return prefix + '-' +
                    crypto.SHA1(
                        $window.navigator.userAgent +
                        $window.Date.now() +
                        Math.random($window.Date.now())
                    ).toString(crypto.enc.Hex).substr(0, 14);
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
                            return 'Recap';
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
                    }
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
                        source: copy('cinema6'),
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
                    }
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
                    collateral: minireel.data.collateral,
                    deck: minireel.data.deck.map(function(card) {
                        return makeCard(card);
                    })
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

            this.convertCard = function(card) {
                var dataTemplates, cardBases, cardType, dataType,
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
                        source: copy('publisher'),
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
                            return card.type === 'videoBallot' ? ['ballot'] : [];
                        },
                        ballot: function(card) {
                            return card.data.ballot;
                        }
                    },
                    ad: {
                        id: copy(),
                        type: value('ad'),
                        ad: value(true),
                        modules: value(['displayAd'])
                    },
                    links: {
                        id: copy(),
                        type: value('links'),
                        title: copy(null),
                        note: copy(null),
                    },
                    recap: {
                        id: copy(),
                        type: copy(),
                        title: copy(),
                        note: copy(),
                        modules: value([])
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

            this.create = function(toCopy) {
                function fetchTemplate(appData) {
                    var user = appData.user;

                    return $q.when(toCopy ? toCopy.pojoify() :
                        {
                            type: 'minireel',
                            org: user.org.id,
                            appUri: 'rumble',
                            data: {
                                title: 'Untitled',
                                mode: 'lightbox',
                                branding: user.branding,
                                deck: (function() {
                                    var deck = [],
                                        count = 0;

                                    for ( ; count < user.org.minAdCount; count++) {
                                        deck.push(self.createCard('ad'));
                                    }

                                    deck.push(self.createCard('recap'));

                                    return deck;
                                }())
                            }
                        });
                }

                function createMinireel(template) {
                    var minireel = cinema6.db.create('experience', template);

                    delete minireel.id;
                    minireel.data.title += toCopy ? ' (copy)' : '';
                    minireel.status = 'pending';

                    return minireel;
                }

                return cinema6.getAppData()
                    .then(fetchTemplate)
                    .then(createMinireel)
                    .then(function save(minireel) {
                        return minireel.save();
                    });
            };

            this.convertForPlayer = function(minireel, target) {
                var convertedDeck = [];

                target = target || {};

                forEach(minireel, function(value, key) {
                    if (key !== 'data') {
                        target[key] = value;
                    } else {
                        target[key] = {};
                    }
                });
                forEach(minireel.data, function(value, key) {
                    target.data[key] = value;
                });
                forEach(minireel.data.deck, function(card) {
                    convertedDeck.push(self.convertCard(card));
                });

                target.data.deck = convertedDeck;

                return target;
            };
        }]);
}());
