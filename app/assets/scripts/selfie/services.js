define( ['angular','c6uilib'],
function( angular , c6uilib ) {
    'use strict';

    var extend = angular.extend,
        fromJson = angular.fromJson,
        toJson = angular.toJson,
        isDefined = angular.isDefined,
        ngCopy = angular.copy,
        forEach = angular.forEach,
        isObject = angular.isObject;

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
                                     'NormalizationService',
        function                    ( cinema6 , c6State , MiniReelService , $q ,
                                      NormalizationService ) {
            var _service = {},
                copy = NormalizationService.copy;

            function getAppUser() {
                var application = c6State.get('Application'),
                    app = c6State.get(application.name);

                return app.cModel;
            }

            _service.campaign = function() {
                var user = getAppUser(),
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
                    }
                });
            };

            _service.card = function() {
                var user = getAppUser(),
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
                var user = getAppUser(),
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
                        }
                    };

                function ensureDefaults(campaign) {
                    // passing campaign model as data source and target because
                    // we need to operate on the actual db model
                    return $q.all(
                        NormalizationService.normalize(template, campaign, campaign)
                    );
                }

                return cinema6.db.find('selfieCampaign', id)
                    .then(ensureDefaults);
            };

            this.normalize = function(campaign) {
                var user = getAppUser(),
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
                        }
                    };

                return NormalizationService.normalize(template, campaign, campaign);
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

        .service('SelfieLogoService', ['cinema6','c6State','c6UrlMaker','$http',
        function                      ( cinema6 , c6State , c6UrlMaker , $http ) {
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

                return $http.get(c6UrlMaker('content/cards', 'api'), { params: query })
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