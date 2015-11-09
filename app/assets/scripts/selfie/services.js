define( ['angular','c6uilib'],
function( angular , c6uilib ) {
    'use strict';

    var extend = angular.extend,
        fromJson = angular.fromJson,
        toJson = angular.toJson,
        isDefined = angular.isDefined,
        ngCopy = angular.copy,
        forEach = angular.forEach,
        isObject = angular.isObject,
        equals = angular.equals,
        isArray = angular.isArray;

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
                                     'NormalizationService','$http','c6UrlMaker',
        function                    ( cinema6 , c6State , MiniReelService , $q ,
                                      NormalizationService , $http , c6UrlMaker ) {
            var copy = NormalizationService.copy,
                value = NormalizationService.value;

            function getAppUser() {
                var application = c6State.get('Application'),
                    app = c6State.get(application.name);

                return app.cModel;
            }

            this.create = function(campaign) {
                var user = getAppUser(),
                    advertiser = user.advertiser,
                    customer = user.customer,

                    // set up a full default card in case we aren't copying
                    rawCard = MiniReelService.createCard('video'),
                    card = deepExtend(rawCard, {
                        sponsored: true,
                        collateral: {
                            logo: advertiser.defaultLogos && advertiser.defaultLogos.square ?
                                advertiser.defaultLogos.square :
                                undefined
                        },
                        links: advertiser.defaultLinks || {},
                        shareLinks: {},
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
                    }),

                    // initialize the new campaign DB Model
                    target = cinema6.db.create('selfieCampaign', {}),

                    // this sets up only the necessary campaign props that should
                    // be copied or initialized
                    campaignTemplate = {
                        advertiserId: copy(advertiser.id),
                        customerId: copy(customer.id),
                        name: function(base) {
                            if (base.name) {
                                return base.name + ' (Copy)';
                            }
                        },
                        pricing: copy({}),
                        application: value('selfie'),
                        advertiserDisplayName: copy(user.company),
                        paymentMethod: copy(),
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
                        cards: copy([card])
                    },

                    // normalize the new campaign based on the campaign passed in,
                    // if we aren't copying then all the necessary props will be defaulted
                    newCampaign = NormalizationService.normalize(
                        campaignTemplate, campaign, target
                    );

                // make sure all bad props are reset
                extend(newCampaign.cards[0], {
                    id: undefined,
                    campaignId: undefined,
                    campaign: {
                        minViewTime: 3
                    }
                });

                return newCampaign;
            };

            this.normalize = function(campaign) {
                var user = getAppUser(),
                    template = {
                        pricing: copy({}),
                        advertiserDisplayName: copy(user.company),
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
                        }
                    };

                return NormalizationService.normalize(template, campaign, campaign);
            };

            this.getAnalytics = function(ids) {
                var multi = (ids || '').split(',').length > 1,
                    url = c6UrlMaker('analytics/campaigns/' + (multi ? ('?ids='+ids) : ids), 'api');

                return $http.get(url)
                    .then(function(response) {
                        return multi ? response.data : [response.data];
                    });
            };

            this.getSchema = function() {
                return $http.get(c6UrlMaker('campaigns/schema?personalized=true', 'api'))
                    .then(function(response) {
                        return response.data;
                    });
            };

            this.getUserData = function(ids) {
                var multi = (ids || '').split(',').length > 1,
                    url = c6UrlMaker('account/users' + (multi ? ('?ids='+ids+'&') : '/'+ids+'?') +
                        'fields=firstName,lastName,company', 'api');

                return $http.get(url)
                    .then(function(response) {
                        return multi ? response.data : [response.data];
                    })
                    .then(function(users) {
                        return users.reduce(function(userHash, user) {
                            userHash[user.id] = user;
                            return userHash;
                        }, {});
                    });
            };

            /* Creates a diff summary of two campaigns with special handling for the first entry in
                the cards array. Does not compare individual elements of arrays. */
            this.campaignDiffSummary = function(originalCampaign, updatedCampaign,
                                                campaignPrefix, cardPrefix) {
                var origCamp = ngCopy(originalCampaign);
                var origCard = {};
                if(origCamp.cards) {
                    origCard = origCamp.cards[0];
                    delete origCamp.cards;
                }

                var updatedCamp = ngCopy(updatedCampaign);
                var updatedCard = {};
                if(updatedCamp.cards) {
                    updatedCard = updatedCamp.cards[0];
                    delete updatedCamp.cards;
                }

                var campaignSummary = this._generateSummary(origCamp, updatedCamp, campaignPrefix);
                var cardSummary = this._generateSummary(origCard, updatedCard, cardPrefix);
                return campaignSummary.concat(cardSummary);
            };

            this._generateSummary = function(originalObj, updatedObj, prefix) {
                var summary = [];

                var origObj = this._flatten(originalObj);
                var updaObj = this._flatten(updatedObj);

                Object.keys(updaObj).forEach(function(keysHash) {
                    var origVal = origObj[keysHash];
                    var updatedVal = updaObj[keysHash];
                    if(!equals(origVal, updatedVal)) {
                        summary.push({
                            originalValue: origVal,
                            updatedValue: updatedVal,
                            key: keysHash,
                            type: prefix
                        });
                    }
                });
                return summary;
            };

            this._flatten = function(obj, path, result) {
                var key, val, _path;
                path = path || [];
                result = result || {};
                for (key in obj) {
                    val = obj[key];
                    _path = path.concat([key]);
                    if (isObject(val) && !isArray(val)) {
                        this._flatten(val, _path, result);
                    } else {
                        result[_path.join('.')] = val;
                    }
                }
                return result;
            };
        }])

        .service('PaymentService', ['$http','c6UrlMaker',
        function                   ( $http , c6UrlMaker ) {
            this.getToken = function() {
                return $http.get(c6UrlMaker('payments/clientToken', 'api'))
                    .then(function(response) {
                        return response.data.clientToken;
                    });
            };

            this.getHistory = function() {
                return $http.get(c6UrlMaker('payments', 'api'))
                    .then(function(response) {
                        return response.data;
                    });
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
                            isXml = /text\/xml/.test(response.headers()['content-type']);

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
                    return $q.when(null);
                }

                return fetch[service]();
            };
        }])

        .service('SelfieLogoService', ['c6State','c6UrlMaker','$http',
        function                      ( c6State , c6UrlMaker , $http ) {
            function exists(value, prop, arr) {
                return arr.filter(function(item) {
                    return item[prop] === value;
                }).length > 0;
            }

            function getCards(resp) {
                var campaigns = resp.data,
                    ids = campaigns.reduce(function(result, campaign) {
                        var id = campaign.cards[0].id;
                        return result.indexOf(id) === -1 ?
                            result.concat(id) : result;
                    }, []),
                    query = {
                        ids: ids.join(',')
                    };

                return $http.get(c6UrlMaker('content/cards', 'api'), { params: query });
            }

            function getLogoData(resp) {
                var cards = resp.data,
                    names = {};

                return cards.reduce(function(result, card) {
                    var src = card.collateral && card.collateral.logo,
                        name = card.params && card.params.sponsor;

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

            this.getLogos = function() {
                var SelfieState = c6State.get('Selfie'),
                    query = {
                        org: SelfieState.cModel.org.id,
                        statuses: 'active,paused,error',
                        sort: 'lastUpdated,-1',
                        application: 'selfie',
                        fields: 'cards',
                        limit: 50,
                        skip: 0
                    };

                return $http.get(c6UrlMaker('campaigns','api'), { params: query })
                    .then(getCards)
                    .then(getLogoData);
            };
        }])

        .service('DemographicsService', [function() {
            this.ages = [
                '0-18',
                '18-24',
                '25-34',
                '35-44',
                '45-54',
                '55-64',
                '65+'
            ];

            this.incomes = [
                '$0-$49,999',
                '$59,000-$74,999',
                '$75,000-$99,000',
                '$100,000-$124,999',
                '$125,000-$149,999',
                '$150,000-$174,999',
                '$175,999-$199,999',
                '$200,000-$249,999',
                '$250,000+'
            ];
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

            this.dmas = [
                'abilene - sweetwater',
                'albany - schenectady - troy',
                'albany-ga',
                'albuquerque - santa fe',
                'alexandria-la',
                'alpena',
                'amarillo',
                'anchorage',
                'atlanta',
                'augusta',
                'austin-tx',
                'bakersfield',
                'baltimore',
                'bangor',
                'baton rouge',
                'beaumont - port arthur',
                'bend-or',
                'billings',
                'biloxi - gulfport',
                'binghamton',
                'birmingham',
                'bluefield - beckley - oak hill',
                'boise',
                'boston',
                'bowling green',
                'buffalo',
                'burlington - plattsburgh',
                'butte - bozeman',
                'casper - riverton',
                'cedar rapids - waterloo - dubuque',
                'champaign - springfield - decatur',
                'charleston - huntington',
                'charleston-sc',
                'charlotte',
                'charlottesville',
                'chattanooga',
                'cheyenne - scottsbluff',
                'chicago',
                'chico - redding',
                'cincinnati',
                'clarksburg - weston',
                'cleveland',
                'colorado springs - pueblo',
                'columbia - jefferson city',
                'columbia-sc',
                'columbus - tupelo - west point',
                'columbus-ga',
                'columbus-oh',
                'corpus christi',
                'dallas - fort worth',
                'davenport - rock island - moline',
                'dayton',
                'denver',
                'des moines - ames',
                'detroit',
                'dothan',
                'duluth - superior',
                'el paso',
                'elmira',
                'erie',
                'eugene',
                'eureka',
                'evansville',
                'fairbanks',
                'fargo - valley city',
                'flint - saginaw - bay city',
                'florence - myrtle beach',
                'fort myers - naples',
                'fort smith - fayetteville - springdale - rogers',
                'fort wayne',
                'fresno - visalia',
                'gainesville',
                'glendive',
                'grand junction - montrose',
                'grand rapids - kalamazoo - battle creek',
                'great falls',
                'green bay - appleton',
                'greensboro - high point - winston-salem',
                'greenville - new bern - washington',
                'greenville - spartanburg - asheville - anderson',
                'greenwood - greenville',
                'harlingen - weslaco - brownsville - mcallen',
                'harrisburg - lancaster - lebanon - york',
                'harrisonburg',
                'hartford - new haven',
                'hattiesburg - laurel',
                'helena',
                'honolulu',
                'houston',
                'huntsville - decatur - florence',
                'idaho falls - pocatello',
                'indianapolis',
                'jackson-ms',
                'jackson-tn',
                'jacksonville-brunswick',
                'johnstown - altoona',
                'jonesboro',
                'joplin - pittsburg',
                'juneau',
                'kansas city',
                'knoxville',
                'la crosse - eau claire',
                'lafayette-in',
                'lafayette-la',
                'lake charles',
                'lansing',
                'laredo',
                'las vegas',
                'lexington',
                'lima',
                'lincoln - hastings - kearney',
                'little rock - pine bluff',
                'los angeles',
                'louisville',
                'lubbock',
                'macon',
                'madison',
                'mankato',
                'marquette',
                'medford - klamath falls',
                'memphis',
                'miami - fort lauderdale',
                'milwaukee',
                'minneapolis - saint paul',
                'minot - bismarck - dickinson',
                'missoula',
                'mobile - pensacola - fort walton beach',
                'monroe - el dorado',
                'monterey - salinas',
                'montgomery - selma',
                'nashville',
                'new orleans',
                'new york',
                'norfolk - portsmouth - newport news',
                'north platte',
                'odessa - midland',
                'oklahoma city',
                'omaha',
                'orlando - daytona beach - melbourne',
                'ottumwa - kirksville',
                'paducah - cape girardeau - harrisburg - mt vernon',
                'palm springs',
                'panama city',
                'parkersburg',
                'peoria - bloomington',
                'philadelphia',
                'phoenix',
                'pittsburgh',
                'portland - auburn',
                'portland-or',
                'presque isle',
                'providence - new bedford',
                'quincy - hannibal - keokuk',
                'raleigh - durham',
                'rapid city',
                'reno',
                'richmond - petersburg',
                'roanoke - lynchburg',
                'rochester - mason city - austin',
                'rochester-ny',
                'rockford',
                'sacramento - stockton - modesto',
                'saint joseph',
                'saint louis',
                'salisbury',
                'salt lake city',
                'san angelo',
                'san antonio',
                'san diego',
                'san francisco - oakland - san jose',
                'santa barbara - santa maria - san luis obispo',
                'savannah',
                'seattle - tacoma',
                'sherman-tx - ada-ok',
                'shreveport',
                'sioux city',
                'sioux falls - mitchell',
                'south bend - elkhart',
                'spokane',
                'springfield - holyoke',
                'springfield-mo',
                'stv central (scottish)',
                'stv north (grampian)',
                'stv north/stv central',
                'syracuse',
                'tallahassee - thomasville',
                'tampa - saint petersburg',
                'terre haute',
                'toledo',
                'topeka',
                'traverse city - cadillac',
                'tri-cities-tn-va',
                'tucson - sierra vista',
                'tulsa',
                'twin falls',
                'tyler - longview - lufkin - nacogdoches',
                'utica',
                'utv',
                'victoria',
                'waco - temple - bryan',
                'washington dc',
                'watertown',
                'wausau - rhinelander',
                'west palm beach - fort pierce',
                'wheeling - steubenville',
                'wichita - hutchinson',
                'wichita falls - lawton',
                'wilkes barre - scranton',
                'wilmington',
                'yakima - pasco - richland - kennewick',
                'youngstown',
                'yuma - el centro',
                'zanesville'
            ];
        }]);
});
