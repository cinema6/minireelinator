define( ['angular','c6uilib', 'c6_defines','../libs'],
function( angular , c6uilib ,  c6Defines  , libs    ) {
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

    return angular.module('c6.app.selfie.services', [c6uilib.name, libs.name])

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

            function getPrice(booleanArray, priceFor, pricePer) {
                var totalFor = !!booleanArray.filter(function(bool) {
                        return !!bool;
                    }).length ? (priceFor || 0) : 0,
                    totalPer = booleanArray.filter(function(bool) {
                        return !!bool;
                    }).length * (pricePer || 0);

                return totalFor + totalPer;
            }

            this.create = function(campaign, user, advertiser) {
                var _user = user || getAppUser(),
                    _advertiser = advertiser || {},

                    // set up a full default card in case we aren't copying
                    rawCard = MiniReelService.createCard('video'),
                    card = deepExtend(rawCard, {
                        sponsored: true,
                        collateral: {
                            logo: _advertiser.defaultLogos && _advertiser.defaultLogos.square ?
                                _advertiser.defaultLogos.square :
                                undefined
                        },
                        links: _advertiser.defaultLinks || {},
                        shareLinks: {},
                        params: {
                            ad: true,
                            action: {
                                type: 'button',
                                label: 'Learn More'
                            }
                        },
                        data: {
                            autoadvance: false,
                            controls: true,
                            autoplay: true,
                            moat: undefined
                        }
                    }),

                    // initialize the new campaign DB Model
                    target = cinema6.db.create('selfieCampaign', {}),

                    // this sets up only the necessary campaign props that should
                    // be copied or initialized
                    campaignTemplate = {
                        advertiserId: copy(_advertiser.id),
                        name: function(base) {
                            if (base.name) {
                                return base.name + ' (Copy)';
                            }
                        },
                        pricing: copy({}),
                        application: value('selfie'),
                        advertiserDisplayName: copy(_user.company),
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

            this.normalize = function(campaign, user) {
                var _user = user || getAppUser(),
                    template = {
                        pricing: copy({}),
                        advertiserDisplayName: copy(_user.company),
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

            this.previewUrlOf = function(campaign) {
                var debug = c6Defines.kDebug,
                    card = campaign.cards && campaign.cards[0],
                    hasVideo = !!card.data.service && !!card.data.videoid;

                return hasVideo && ('//reelcontent.com' +
                    (debug ? '/preview-staging/' : '/preview/') +
                    '?previewSource=platform&campaign=' + encodeURIComponent(campaign.id));
            };

            this.getAnalytics = function(query) {
                return $http.get(c6UrlMaker('analytics/campaigns', 'api'), {params: query})
                    .then(function(response) {
                        return response.data;
                    });
            };

            this.getSchema = function() {
                return $http.get(c6UrlMaker('campaigns/schema?personalized=true', 'api'))
                    .then(function(response) {
                        return response.data;
                    });
            };

            this.getOrgs = function() {
                return $http.get(c6UrlMaker('account/orgs?fields=id,name', 'api'))
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

            this.hasCampaigns = function() {
                return $http.get(c6UrlMaker('campaigns?limit=1&fields=id', 'api'))
                    .then(function(response) {
                        return !!response.data.length;
                    });
            };

            this.getCpv = function(campaign, schema) {
                var targeting = campaign.targeting,
                    interests = targeting.interests,
                    demos = targeting.demographics,
                    geos = targeting.geo,
                    cost = schema.pricing.cost,

                    basePrice = cost.__base,
                    pricePerGeo = cost.__pricePerGeo,
                    priceForGeo = cost.__priceForGeoTargeting,
                    pricePerDemo = cost.__pricePerDemo,
                    priceForDemo = cost.__priceForDemoTargeting,
                    priceForInterests = cost.__priceForInterests,

                    hasInterests = interests.length,
                    hasStates = geos.states.length,
                    hasDmas = geos.dmas.length,
                    hasAge = demos.age.length,
                    hasIncome = demos.income.length,
                    hasGender = demos.gender.length,

                    geoPrice = getPrice(
                        [hasStates, hasDmas], priceForGeo, pricePerGeo
                    ),
                    demoPrice = getPrice(
                        [hasAge, hasIncome, hasGender], priceForDemo, pricePerDemo
                    ),
                    interestsPrice = getPrice(
                        [hasInterests], priceForInterests
                    );

                return basePrice + geoPrice + demoPrice + interestsPrice;
            };

            this.getSummary = function(config) {
                var campaign = config.campaign,
                    interests = config.interests;

                if (!campaign) { return; }

                function pad(num) {
                    var norm = Math.abs(Math.floor(num));
                    return (norm < 10 ? '0' : '') + norm;
                }

                function formatDate(iso) {
                    var date = new Date(iso);

                    return pad(date.getMonth() + 1) +
                        '/' + pad(date.getDate()) +
                        '/' + date.getFullYear();
                }

                function generateInterests(campaign, interests) {
                    if (!interests) {
                        return campaign.targeting.interests.join(', ');
                    }

                    return interests.filter(function(interest) {
                        return campaign.targeting.interests.indexOf(interest.id) > -1;
                    }).map(function(interest) {
                        return interest.label;
                    }).join(', ');
                }

                function generateDemo(campaign) {
                    var demographics = campaign.targeting.demographics,
                        demoResults = {};

                    forEach(demographics, function(demo, type) {
                        demoResults[type] = {
                            name: type.slice(0, 1).toUpperCase() + type.slice(1),
                            list: demo.join(', ')
                        };
                    });

                    return demoResults;
                }

                function generateGeo(campaign) {
                    var geo = campaign.targeting.geo,
                        geoResults = {};

                    forEach(geo, function(geo, type) {
                        geoResults[type] = {
                            name: type === 'dmas' ? 'DMA' :
                                type.slice(0, 1).toUpperCase() + type.slice(1),
                            list: geo.join(', ')
                        };
                    });

                    return geoResults;
                }

                function generateDuration(campaign) {
                    var startDate = campaign.cards[0].campaign.startDate,
                        endDate = campaign.cards[0].campaign.endDate;

                    if (!startDate && !endDate) {
                        return 'Once approved, run until stopped.';
                    }
                    if (!endDate) {
                        return formatDate(startDate) + ' until stopped.';
                    }
                    if (!startDate) {
                        return 'Once approved until ' + formatDate(endDate);
                    }

                    return formatDate(startDate) + ' to ' + formatDate(endDate);
                }


                return {
                    duration: generateDuration(campaign),
                    geo: generateGeo(campaign),
                    demographics: generateDemo(campaign),
                    interests: generateInterests(campaign, interests),
                    advertiser: campaign.advertiserDisplayName,
                    pricing: campaign.pricing
                };
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

                var allKeys = Object.keys(origObj);
                Object.keys(updaObj).forEach(function(key) {
                    if(!(key in origObj)) {
                        allKeys.push(key);
                    }
                });

                allKeys.forEach(function(keysHash) {
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
                                        'VimeoDataService','DailymotionDataService', 'metagetta',
        function                       ( $http , $q , VideoService , YouTubeDataService ,
                                         VimeoDataService , DailymotionDataService ,  metagetta ) {
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
                        var secureUrl = text.replace(/^(http:|https:|)\/\//, 'https://');
                        return validateVast(secureUrl);
                    } else {
                        return $q.reject('Unable to determine service');
                    }
                }

                return $q.when(data);
            };

            this.urlFromData = function(service, id, data) {
                return service === 'adUnit' ?
                    getJSONProp(id, 'vast') :
                    VideoService.urlFromData(service, id, data);
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
                    instagram: function() {
                        return metagetta({
                            type: service,
                            id: id,
                            fields: ['title', 'duration', 'views', 'uri'],
                            instagram: {
                                key:  c6Defines.kInstagramDataApiKey
                            }
                        }).then(function(result) {
                            if(result.duration) {
                                return {
                                    title: result.title,
                                    duration: result.duration,
                                    views: result.views,
                                    href: result.uri
                                };
                            } else {
                                return $q.reject(new Error('not an Instagram video'));
                            }
                        });
                    }
                };

                return fetch[service] ? fetch[service]() : $q.when(null);
            };
        }])

        .service('SelfieLogoService', ['c6State','c6UrlMaker','$http',
        function                      ( c6State , c6UrlMaker , $http ) {
            function exists(value, prop, arr) {
                return arr.filter(function(item) {
                    return item[prop] === value;
                }).length > 0;
            }

            function getLogoData(resp) {
                var campaigns = resp.data,
                    names = {};

                return campaigns.reduce(function(result, campaign) {
                    var card = (campaign.cards && campaign.cards[0]) || {},
                        src = card.collateral && card.collateral.logo,
                        name = campaign.advertiserDisplayName;

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

            this.getLogos = function(org) {
                var SelfieState = c6State.get('Selfie'),
                    query = {
                        org: org || SelfieState.cModel.org.id,
                        statuses: 'active,paused,error',
                        sort: 'lastUpdated,-1',
                        application: 'selfie',
                        fields: 'cards,advertiserDisplayName',
                        limit: 50,
                        skip: 0
                    };

                return $http.get(c6UrlMaker('campaigns','api'), { params: query })
                    .then(getLogoData);
            };
        }])

        .service('SelfieLoginDialogService', ['$q','intercom',
        function                             ( $q , intercom ) {
            var model = {},
                deferred;

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            this.display = function() {
                intercom('shutdown');
                model.show = true;
                deferred = $q.defer();
                return deferred.promise;
            };

            this.success = function() {
                model.show = false;
                deferred.resolve('success');
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
