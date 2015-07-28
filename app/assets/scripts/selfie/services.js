define( ['angular','c6uilib'],
function( angular , c6uilib ) {
    'use strict';

    var extend = angular.extend,
        forEach = angular.forEach,
        fromJson = angular.fromJson,
        toJson = angular.toJson;

    return angular.module('c6.app.selfie.services', [c6uilib.name])
        .service('CSSLoadingService', ['$document',
        function                      ( $document ) {
            this.load = function() {
                Array.prototype.slice.call(arguments)
                    .reduce(function(result, arg) {
                        (Array.isArray(arg) ? arg : [arg])
                            .forEach(function(path) {
                                result.push(path);
                            });
                        return result;
                    }, [])
                    .forEach(function(filepath) {
                        var file = document.createElement('link');
                        file.setAttribute('rel', 'stylesheet');
                        file.setAttribute('type', 'text/css');
                        file.setAttribute('href', filepath);

                        $document.find('head').append(file);
                    });
            };
        }])

        .service('SelfieVideoService', ['$http','c6UrlParser','$q','YouTubeDataService',
                                        'VimeoDataService','DailymotionDataService',
        function                       ( $http , c6UrlParser , $q , YouTubeDataService ,
                                         VimeoDataService , DailymotionDataService ) {
            var self = this;

            function getJSONProp(json, prop) {
                return (fromJson(json) || {})[prop];
            }

            function setJSONProp(json, prop, value) {
                var proto = {};

                proto[prop] = value;

                return toJson(extend(fromJson(json) || {}, proto));
            }

            function validateVast(url) {
                return $http.get(url)
                    .then(function(response) {
                        var isVast = /VAST/.test(response.data),
                            isXml = response.headers()['content-type'] === 'text/xml';

                        if (!isVast || !isXml) {
                            return $q.reject('Not a valid VAST tag');
                        }

                        return {
                            service: 'adUnit',
                            id: setJSONProp(null, 'vast', url)
                        };
                    });
            }

            this.dataFromUrl = function(text) {
                var service = (text.match(/youtu\.be|youtube|dailymotion|dai\.ly|vimeo/) || [])[0],
                    type = /iframe/.test(text) ? 'embed' : 'url',
                    id,
                    idFetchers = {
                        embed: {
                            youtube: function(embed) {
                                return (embed.match(/embed\/([a-zA-Z0-9]+)"/) || [])[1];
                            },
                            vimeo: function(embed) {
                                return (embed.match(/video\/([0-9]+)/) || [])[1];
                            },
                            dailymotion: function(embed) {
                                return (embed.match(/video\/([a-zA-Z0-9]+)/) || [])[1];
                            }
                        },
                        url: {
                            'youtu.be': function(url) {
                                return (url.match(/\.be\/([a-zA-Z0-9]+)$/) || [])[1];
                            },
                            youtube: function(url) {
                                return (url.match(/v=([a-zA-Z0-9]+)/) || [])[1];
                            },
                            vimeo: function(url) {
                                return (url.match(/\/([0-9]+)$/) || [])[1];
                            },
                            'dai.ly': function(url) {
                                return (url.match(/\.ly\/([a-zA-Z0-9]+)$/) || [])[1];
                            },
                            dailymotion: function(url) {
                                return (url.match(/video\/([a-zA-Z0-9]+)/) || [])[1];
                            }
                        }
                    };

                if (!service) {
                    if (/^http|https|\/\//.test(text)) {
                        return validateVast(text);
                    } else {
                        return $q.reject('Unable to determine service');
                    }
                }

                id = idFetchers[type][service](text);

                switch (service) {
                case 'youtu.be':
                    service = 'youtube';
                    break;
                case 'dai.ly':
                    service = 'dailymotion';
                    break;
                }

                if (!id) { return $q.reject('Unable to find id'); }

                return $q.when({
                    service: service,
                    id: id
                });
            };

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
                case 'adUnit':
                    return getJSONProp(id, 'vast');

                }
            };

            this.statsFromService = function(service, id) {
                var fetch = {
                    youtube: function() {
                        return YouTubeDataService.videos.list({
                            part: ['snippet','statistics','contentDetails'],
                            id: id
                        }).then(function(data) {
                            return {
                                title: data.snippet.title,
                                duration: data.contentDetails.duration,
                                views: data.statistics.viewCount,
                                href: self.urlFromData(service, id)
                            };
                        });
                    },
                    vimeo: function() {
                        return VimeoDataService.getVideo(id)
                            .then(function(data) {
                                return {
                                    title: data.title,
                                    duration: data.duration,
                                    views: data.statsNumberOfPlays,
                                    href: self.urlFromData(service, id)
                                };
                            });
                    },
                    dailymotion: function() {
                        return DailymotionDataService.video(id).get({
                            fields: ['viewsTotal','duration','title']
                        }).then(function(data) {
                            return {
                                title: data.title,
                                duration: data.duration,
                                views: data.viewsTotal,
                                href: self.urlFromData(service, id)
                            };
                        });
                    },
                    adUnit: function() {
                        return $q.when({
                            title: null,
                            duration: 0,
                            views: 0,
                            href: self.urlFromData(service, id)
                        });
                    }
                };

                if (!/youtube|vimeo|dailymotion|adUnit/.test(service)) {
                    return $q.reject('Unknown service');
                }

                return fetch[service]();
            };
        }])

        .service('LogoService', [function() {
            var logoCache = {},
                nameCount = {};

            function exists(value, obj) {
                var result = false;

                forEach(obj, function(val) {
                    if (val === value) {
                        result = true;
                    }
                });

                return result;
            }

            this.registerLogo = function(campaign, card) {
                var key;

                if (!card.collateral.logo || exists(card.collateral.logo, logoCache)) { return; }

                if (!nameCount[campaign.name]) {
                    key = campaign.name;
                    nameCount[campaign.name] = 1;
                } else {
                    key = campaign.name + ' (' + nameCount[campaign.name] + ')';
                    nameCount[campaign.name] = nameCount[campaign.name] + 1;
                }

                logoCache[key] = card.collateral.logo;
            };

            this.fetchLogos = function(campaignName) {
                var logos = [];

                forEach(logoCache, function(src, name) {
                    if (name === campaignName) { return; }

                    logos.push({
                        name: name,
                        src: src
                    });
                });

                return logos;
            };
        }])

        .service('GeoService', [function() {
            this.usa = [
                'Alabama',
                'Alaska',
                'Arizona',
                'Arkansas',
                'California',
                'Colorado',
                'Connecticut',
                'Delaware',
                'Florida',
                'Georgia',
                'Hawaii',
                'Idaho',
                'Illinois',
                'Indiana',
                'Iowa',
                'Kansas',
                'Kentucky',
                'Louisiana',
                'Maine',
                'Maryland',
                'Massachusetts',
                'Michigan',
                'Minnesota',
                'Mississippi',
                'Missouri',
                'Montana',
                'Nebraska',
                'Nevada',
                'New Hampshire',
                'New Jersey',
                'New Mexico',
                'New York',
                'North Carolina',
                'North Dakota',
                'Ohio',
                'Oklahoma',
                'Oregon',
                'Pennsylvania',
                'Rhode Island',
                'South Carolina',
                'South Dakota',
                'Tennessee',
                'Texas',
                'Utah',
                'Vermont',
                'Virginia',
                'Washington',
                'West Virginia',
                'Wisconsin',
                'Wyoming'
            ];
        }]);
});