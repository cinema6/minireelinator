(function() {
    'use strict';

    var forEach = angular.forEach,
        ngCopy = angular.copy,
        isNumber = angular.isNumber,
        isUndefined = angular.isUndefined,
        extend = angular.extend;

    angular.module('c6.mrmaker')
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
                            return (url.pathname
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

        .service('MiniReelService', ['crypto','$window','cinema6','$cacheFactory','$q',
        function                    ( crypto , $window , cinema6 , $cacheFactory , $q ) {
            var cache = $cacheFactory('MiniReelService:minireels'),
                self = this;

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
                    title: copy(null),
                    note: copy(null),
                    ad: function(card) {
                        return card.ad || card.type === 'ad';
                    }
                };

                // videoDataTemplate: this is the base template for all
                // video cards.
                videoDataTemplate = {
                    service: function(data, key, card) {
                        var type = card.type;

                        return type.search(/^(youtube|dailymotion|vimeo)$/) > -1 ?
                            type : null;
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
                        ballot: value([])
                    }),
                    ad: {
                        autoplay: copy(false),
                        publisher: copy(false)
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
                    card[key] = fn(rawData, key, rawData);
                });

                // Use the dataTemplates defined above to populate
                // the data object of the card.
                dataTemplate = dataTemplates[card.type];
                forEach(dataTemplate, function(fn, key) {
                    card.data[key] = fn((rawData.data || {}), key, rawData);
                });
                forEach(card.data, function(value, key) {
                    if (!dataTemplate.hasOwnProperty(key)) {
                        delete card.data[key];
                    }
                });

                return card;
            }

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

            this.open = function(id) {
                function fetchFromCache() {
                    var minireel = cache.get(id);

                    return minireel ?
                        $q.when(minireel) :
                        $q.reject('No minireel with id [' + id + '] in cache.');
                }

                function fetchFromServer() {
                    function putInCache(minireel) {
                        return cache.put(minireel.id, minireel);
                    }

                    function transform(minireel) {
                        var model = {
                            data: {
                                deck: minireel.data.deck.map(function(card) {
                                    return makeCard(card);
                                })
                            }
                        };

                        // Loop through the experience and copy everything but
                        // the "data" object.
                        forEach(minireel, function(value, key) {
                            if (key !== 'data') {
                                model[key] = value;
                            }
                        });

                        model.data.deck.unshift({
                            id: generateId('rc'),
                            type: 'intro'
                        });

                        return model;
                    }

                    return cinema6.db.find('experience', id)
                        .then(transform)
                        .then(putInCache);
                }

                return fetchFromCache()
                    .catch(fetchFromServer);
            };

            this.convertCard = function(card) {
                var dataTemplates, cardBases, cardType,
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

                function getType(card) {
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

                dataTemplates = {
                    video: {
                        modestbranding: copy(1),
                        rel: copy(0),
                        start: trimmer(),
                        end: trimmer(),
                        videoid: copy(null)
                    },
                    ad: {
                        autoplay: copy(false)
                    },
                    miniReel: {
                        message: copy('Not being copied into the MRinator yet'),
                        query: copy({id:[]})
                    }
                };

                cardBases = {
                    video: {
                        id: copy(),
                        note: copy(null),
                        title: copy(null),
                        type: function(card) {
                            return card.data.service;
                        },
                        source: function(card) {
                            return camelSource(card.data.service);
                        },
                        modules: function(card) {
                            return card.type === 'videoBallot' ? ['ballot'] : [];
                        }
                    },
                    ad: {
                        id: copy(),
                        ad: value(true),
                        type: value('ad'),
                        displayAd: copy('Not being copied into MRinator yet'),
                        modules: value(['displayAd'])
                    },
                    miniReel: {
                        id: copy(),
                        type: value('miniReel')
                    }
                };

                cardType = getType(card);

                forEach(cardBases[cardType], function(fn, key) {
                    newCard[key] = fn(card, key, card);
                });

                forEach(dataTemplates[cardType], function(fn, key) {
                    newCard.data[key] = fn((card.data || {}), key, card);
                });

                return newCard;
            };

            this.convertForPreview = function(minireel) {
                var mrExperience = ngCopy(minireel),
                    convertedDeck = [];

                forEach(mrExperience.data.deck, function(card) {
                    if(card.data) {
                        // this conditional is used to weed out the intro card
                        // we need to process the intro card and put the pieces
                        // where they belong in the experience model (ie. the img object)
                        convertedDeck.push(self.convertCard(card));
                    }
                });

                mrExperience.data.deck = convertedDeck;

                return mrExperience;
            };
        }]);
}());
