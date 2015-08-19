define( ['angular','c6uilib'],
function( angular , c6uilib ) {
    'use strict';

    var extend = angular.extend,
        fromJson = angular.fromJson,
        toJson = angular.toJson,
        isDefined = angular.isDefined;

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

        .service('SelfieVideoService', ['$http','$q','VideoService','YouTubeDataService',
                                        'VimeoDataService','DailymotionDataService',
        function                       ( $http , $q , VideoService , YouTubeDataService ,
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

            this.dataFromText = function(text) {
                var data = VideoService.dataFromText(text);

                if (!data) {
                    if (/^http|https|\/\//.test(text)) {
                        return validateVast(text);
                    } else {
                        return $q.reject('Unable to determine service');
                    }
                }

                return $q.when(data);
            };

            this.urlFromData = function(service, id) {
                return service === 'adUnit' ?
                    getJSONProp(id, 'vast') :
                    VideoService.urlFromData(service, id);
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

        .service('SelfieLogoService', ['cinema6',
        function                      ( cinema6 ) {
            function exists(value, prop, arr) {
                return arr.filter(function(item) {
                    return item[prop] === value;
                }).length > 0;
            }

            function findActiveCampaigns(campaigns) {
                return campaigns.filter(function(campaign) {
                    return (/active|paused|expired/).test(campaign.status);
                });
            }

            function generateLogoData(campaigns) {
                var names = {};

                return campaigns.reduce(function(result, campaign) {
                    var card = (campaign.cards[0] && campaign.cards[0].item) || {},
                        src = card.collateral && card.collateral.logo,
                        name = card.params && card.params.sponsor +
                            ' from ' + campaign.name;

                    if (!src || exists(src, 'src', result)) {
                        return result;
                    }

                    names[name] = isDefined(names[name]) ?
                        names[name] + 1 : 0;

                    return result.concat({
                        name: (names[name] ? name + ' (' + names[name] + ')' : name),
                        src: src
                    });
                }, []);
            }

            this.getLogos = function(query) {
                return cinema6.db.findAll('selfieCampaign', query)
                    .then(findActiveCampaigns)
                    .then(generateLogoData);
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