define( ['angular','c6uilib'],
function( angular , c6uilib ) {
    'use strict';

    var extend = angular.extend,
        fromJson = angular.fromJson,
        toJson = angular.toJson,
        isDefined = angular.isDefined,
        ngCopy = angular.copy,
        isUndefined = angular.isUndefined,
        forEach = angular.forEach,
        isObject = angular.isObject,
        isFunction = angular.isFunction;

    function deepExtend(target, extension) {
        forEach(extension, function(extensionValue, prop) {
            var targetValue = target[prop];

            if (isObject(extensionValue) && isObject(targetValue)) {
                deepExtend(targetValue, extensionValue);
            } else {
                target[prop] = ngCopy(extensionValue);
            }
        });

        return target;
    }

    return angular.module('c6.app.selfie.services', [c6uilib.name])
        .service('CampaignService', ['cinema6','c6State','MiniReelService','$q',
        function                    ( cinema6 , c6State , MiniReelService , $q ) {
            var application = c6State.get('Application'),
                app = c6State.get(application.name);

            var _service = {};

            function copy(def) {
                return function(data, key) {
                    var value = data[key];

                    return isUndefined(value) ?
                        def : ngCopy(value);
                };
            }

            _service.campaign = function() {
                var user = app.cModel,
                    advertiser = user.advertiser,
                    customer = user.customer;

                return cinema6.db.create('selfieCampaign', {
                    advertiserId: advertiser.id,
                    customerId: customer.id,
                    name: null,
                    cards: [],
                    pricing: {},
                    status: 'draft',
                    application: 'selfie',
                    advertiserDisplayName: user.company,
                    contentCategories: {
                        primary: null
                    },
                    targeting: {
                        geo: {
                            states: [],
                            dmas: []
                        },
                        demographics: {
                            age: [],
                            gender: [],
                            income: []
                        },
                        interests: []
                    },
                    categories: [],
                    geoTargeting: []
                });
            };

            _service.card = function() {
                var user = app.cModel,
                    advertiser = user.advertiser,
                    card = cinema6.db.create('card', MiniReelService.createCard('video'));

                return deepExtend(card, {
                    id: undefined,
                    campaignId: undefined,
                    campaign: {
                        minViewTime: 3
                    },
                    sponsored: true,
                    collateral: {
                        logo: advertiser.defaultLogos && advertiser.defaultLogos.square ?
                            advertiser.defaultLogos.square :
                            null
                    },
                    links: advertiser.defaultLinks || {},
                    params: {
                        ad: true,
                        action: null
                    },
                    data: {
                        autoadvance: false,
                        controls: false,
                        autoplay: true,
                        skip: 30
                    }
                });
            };

            this.create = function(type) {
                return _service[type]();
            };

            this.find = function(id) {
                var user = app.cModel,
                    template = {
                        pricing: copy({}),
                        advertiserDisplayName: copy(user.company),
                        contentCategories: copy({}),
                        targeting: {
                            geo: {
                                states: copy([]),
                                dmas: copy([])
                            },
                            demographics: {
                                age: copy([]),
                                gender: copy([]),
                                income: copy([])
                            },
                            interests: copy([])
                        },
                        categories: copy([]),
                        geoTargeting: copy([])
                    };

                function recurse(templateLayer, objLayer) {
                    forEach(templateLayer, function(value, key) {

                        if (isFunction(value)) {
                            objLayer[key] = value(objLayer, key);
                        } else {
                            objLayer[key] = objLayer[key] || {};
                            recurse(value, objLayer[key]);
                        }
                    });

                    return objLayer;
                }

                function ensureDefaults(campaign) {
                    return $q.all(recurse(template, campaign));
                }

                return cinema6.db.find('selfieCampaign', id)
                    .then(ensureDefaults);
            };

        }])

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