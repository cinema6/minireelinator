(function() {
    'use strict';

    define(['app' , 'c6_defines'], function(appModule, c6Defines) {
        /* global angular:true */
        var copy = angular.copy;

        describe('MiniReelService', function() {
            var MiniReelService,
                VoteService,
                CollateralService,
                VideoThumbnailService,
                SettingsService,
                VideoService,
                $rootScope,
                c6UrlParser,
                cinema6,
                c6State,
                portal,
                $q;

            var minireel;

            function DBModel(type, data) {
                copy(data, this);

                this._type = type;
            }
            DBModel.prototype = {
                save: jasmine.createSpy('DBModel.save()')
            };

            beforeEach(function() {
                module(appModule.name);

                Object.defineProperty(Object.prototype, 'jasmineToString', {
                    enumerable: false,
                    configurable: true,
                    get: function() {
                        return function() {
                            return JSON.stringify(this, null, 4);
                        };
                    }
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    MiniReelService = $injector.get('MiniReelService');
                    VoteService = $injector.get('VoteService');
                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');
                    CollateralService = $injector.get('CollateralService');
                    VideoThumbnailService = $injector.get('VideoThumbnailService');
                    SettingsService = $injector.get('SettingsService');
                    VideoService = $injector.get('VideoService');
                    c6State = $injector.get('c6State');
                    c6UrlParser = $injector.get('c6UrlParser');
                });

                SettingsService.register('MR::user', {
                    minireelDefaults: {
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    }
                }, {
                    localSync: false
                });

                SettingsService.register('MR::org', {
                    minireelDefaults: {
                        mode: 'lightbox-ads',
                        autoplay: true
                    }
                }, {
                    localSync: false
                });

                portal = c6State.get('Portal');
                portal.cModel = {
                    id: 'u-5b67ee6000ce6f',
                    type: 'Publisher',
                    org: {
                        id: 'o-17593d7a2bf294',
                        minAdCount: 3,
                        videoAdSkip: true,
                        waterfalls: {
                            display: ['publisher'],
                            video: ['cinema6-publisher']
                        }
                    },
                    branding: 'elitedaily'
                };

                minireel = cinema6.db.create('experience', {
                    id: 'e-15aa87f5da34c3',
                    title: 'My MiniReel',
                    subtitle: 'I <3 Turtles',
                    summary: 'I AM THE TURTLE MONSTER!',
                    type: 'minireel',
                    theme: 'ed-videos',
                    status: 'pending',
                    access: 'public',
                    data: {
                        title: 'My MiniReel',
                        mode: 'lightbox',
                        autoplay: false,
                        autoadvance: false,
                        election: 'el-76506623bf22d9',
                        branding: 'elitedaily',
                        sponsored: true,
                        links: {
                            'Website': 'minzner.org'
                        },
                        placementId: '7435638',
                        campaign: {
                            campaignId: '83dj3493',
                            advertiserId: '984udn3d',
                            minViewTime: 30
                        },
                        params: {
                            sponsor: 'Ubisoft'
                        },
                        adConfig: {
                            video: {
                                firstPlacement: 3,
                                frequency: 3,
                                waterfall: 'cinema6',
                                skip: 6
                            },
                            display: {
                                waterfall: 'cinema6',
                                enabled: false
                            }
                        },
                        splash: {
                            source: 'specified',
                            ratio: '3-2',
                            theme: 'vertical-stack'
                        },
                        collateral: {
                            splash: 'splash.jpg',
                            logo: 'logo.jpg'
                        },
                        deck: [
                            {
                                id: 'rc-9de889d3002d03',
                                type: 'text',
                                title: 'This is my MiniReel',
                                note: 'Hello. This is an intro.',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                modules: [],
                                data: {},
                            },
                            {
                                id: 'rc-c9cf24e87307ac',
                                type: 'youtube',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
                                source: 'YouTube',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                modules: [],
                                data: {
                                    skip: true,
                                    videoid: '47tfg8734',
                                    start: 10,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0
                                }
                            },
                            {
                                id: 'rc-17721b74ce2584',
                                type: 'vimeo',
                                title: 'The Ugliest Turtle',
                                note: 'Blah blah blah',
                                source: 'Vimeo',
                                modules: ['ballot'],
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                ballot: {
                                    prompt: 'Was it ugly?',
                                    choices: [
                                        'Really Ugly',
                                        'Not That Ugly'
                                    ]
                                },
                                data: {
                                    skip: 25,
                                    videoid: '48hfrei49'
                                }
                            },
                            {
                                id: 'rc-1c7a46097a5d4a',
                                type: 'ad',
                                ad: true,
                                modules: ['displayAd'],
                                placementId: null,
                                data: {
                                    autoplay: true,
                                    source: 'cinema6-publisher',
                                    skip: true
                                }
                            },
                            {
                                id: 'rc-61fa9683714e13',
                                type: 'dailymotion',
                                title: 'The Smartest Turtle',
                                note: 'Blah blah blah',
                                source: 'DailyMotion',
                                modules: ['ballot'],
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                ballot: {
                                    prompt: 'How smart was it?',
                                    choices: [
                                        'Really Smart',
                                        'Pretty Stupid'
                                    ]
                                },
                                data: {
                                    skip: false,
                                    videoid: 'vfu85f5',
                                    related: 0
                                }
                            },
                            {
                                id: 'rc-d8ebd5461ba524',
                                type: 'youtube',
                                title: 'The Dumbest Turtle',
                                note: 'Blah blah blah',
                                source: 'YouTube',
                                modules: ['displayAd', 'post'],
                                placementId: '12345',
                                templateUrl: '//portal.cinema6.com/collateral/minireel/templates/huffpost.html',
                                sponsored: true,
                                campaign: {
                                    campaignId: 'abc123',
                                    advertiserId: '123abc',
                                    minViewTime: 15
                                },
                                collateral: {
                                    logo: 'my-awesome-logo.png'
                                },
                                links: {
                                    'Facebook': 'my-fb.html',
                                    'Website': 'awesome.com'
                                },
                                params: {
                                    ad: true,
                                    sponsor: 'GameStop',
                                    action: {
                                        type: 'text',
                                        label: 'OH HAI!'
                                    }
                                },
                                ballot: {
                                    election: 'el-8bb2395fbea873',
                                    prompt: 'Are you willing to spend all your money on this product?',
                                    choices: [
                                        'Of Course',
                                        'I Have no Money'
                                    ]
                                },
                                data: {
                                    hideSource: true,
                                    skip: 6,
                                    autoplay: false,
                                    autoadvance: true,
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0
                                }
                            },
                            {
                                id: 'rc-f940abe0c1f3f0',
                                type: 'video',
                                title: 'No video yet..',
                                note: 'Lame...',
                                modules: [],
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                data: {}
                            },
                            {
                                id: 'rc-d98fad7e413692',
                                type: 'videoBallot',
                                title: 'Vote on nothing!',
                                note: 'Pretty meta, right?',
                                modules: ['ballot'],
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                ballot: {
                                    prompt: null,
                                    choices: []
                                },
                                data: {}
                            },
                            {
                                id: 'rc-25c1f60b933186',
                                type: 'links',
                                title: 'If You Love Turtles',
                                note: 'Blah blah blah',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                data: {
                                    links: [
                                        {
                                            title: 'Lizards',
                                            href: 'http://lizards.com',
                                            thumb: 'http://lizards.com/img.jpg'
                                        },
                                        {
                                            title: 'Snakes',
                                            href: 'http://snakes.com',
                                            thumb: 'http://snakes.com/img.jpg'
                                        },
                                        {
                                            title: 'Geckos',
                                            href: 'http://geico.com',
                                            thumb: 'http://geico.com/img.jpg'
                                        }
                                    ]
                                }
                            },
                            {
                                id: 'rc-b74a127991ee75',
                                type: 'recap',
                                title: 'Recap of My MiniReel',
                                note: null,
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                modules: [],
                                data: {}
                            },
                            {
                                id: 'rc-82a19a12065636',
                                type: 'displayAd',
                                title: 'By Ubisoft',
                                note: 'Games are great!',
                                placementId: '398thfu954',
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {
                                    'Website': 'minzner.org'
                                },
                                thumbs: {
                                    small: 'logo.jpg',
                                    large: 'logo.jpg'
                                },
                                params: {
                                    sponsor: 'Ubisoft'
                                },
                                modules: [],
                                data: {
                                    size: '300x250'
                                }
                            },
                            {
                                id: 'rc-82a19a12065636',
                                type: 'adUnit',
                                title: 'AdUnit Card',
                                note: 'It\'s Ad Tech!',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                thumbs: {
                                    small: 'logo.jpg',
                                    large: 'logo.jpg'
                                },
                                params: {},
                                modules: [],
                                data: {
                                    skip: true,
                                    vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                    vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                                }
                            },
                            (function() {
                                var card = {
                                    id: 'rc-fc6cfb661b7a86',
                                    type: 'embedded',
                                    title: 'Yahoo! Card',
                                    note: 'This is a Yahoo! card.',
                                    source: 'Yahoo! Screen',
                                    placementId: null,
                                    templateUrl: null,
                                    sponsored: false,
                                    campaign: {
                                        campaignId: null,
                                        advertiserId: null,
                                        minViewTime: null
                                    },
                                    collateral: {},
                                    links: {},
                                    params: {},
                                    modules: [],
                                    data: {
                                        skip: true,
                                        service: 'yahoo',
                                        videoid: 'teen-tries-drain-pond-lost-221030513',
                                    }
                                };

                                card.data.code = VideoService.embedCodeFromData(card.data.service, card.data.videoid);

                                return card;
                            }()),
                            (function() {
                                var card = {
                                    id: 'rc-f51c0386a90a02',
                                    type: 'embedded',
                                    title: 'AOL Card',
                                    note: 'This is an AOL card.',
                                    source: 'AOL On',
                                    placementId: null,
                                    templateUrl: null,
                                    sponsored: false,
                                    campaign: {
                                        campaignId: null,
                                        advertiserId: null,
                                        minViewTime: null
                                    },
                                    collateral: {},
                                    links: {},
                                    params: {},
                                    modules: [],
                                    data: {
                                        skip: true,
                                        service: 'aol',
                                        videoid: 'arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876',
                                    }
                                };

                                card.data.code = VideoService.embedCodeFromData(card.data.service, card.data.videoid);

                                return card;
                            }())
                        ]
                    }
                });
            });

            afterEach(function() {
                delete Object.prototype.jasmineToString;
            });

            it('should exist', function() {
                expect(MiniReelService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('modeCategoryOf(minireel, categories)', function() {
                        var categories;

                        function result() {
                            return MiniReelService.modeCategoryOf.apply(MiniReelService, arguments);
                        }

                        beforeEach(function() {
                            categories = [
                                {
                                    value: 'lightbox',
                                    modes: [
                                        {
                                            value: 'lightbox'
                                        },
                                        {
                                            value: 'lightbox-ads'
                                        }
                                    ]
                                },
                                {
                                    value: 'inline',
                                    modes: [
                                        {
                                            value: 'light'
                                        },
                                        {
                                            value: 'full'
                                        }
                                    ]
                                }
                            ];
                        });

                        it('should return an empty object if something falsy is passed in', function() {
                            expect(result()).toEqual({});
                        });

                        it('should return an empty object if a mode with no category is passed in', function() {
                            expect(result({ data: { mode: 'foo' } }, categories)).toEqual({});
                        });

                        it('should return the category of the minireel\'s mode', function() {
                            expect(result({ data: { mode: 'lightbox' } }, categories)).toBe(categories[0]);
                            expect(result({ data: { mode: 'lightbox-ads' } }, categories)).toBe(categories[0]);
                            expect(result({ data: { mode: 'light' } }, categories)).toBe(categories[1]);
                            expect(result({ data: { mode: 'full' } }, categories)).toBe(categories[1]);
                        });
                    });

                    describe('createCard(type)', function() {
                        it('should create a new card based on the type provided', function() {
                            var videoCard = MiniReelService.createCard('video'),
                                videoBallotCard = MiniReelService.createCard('videoBallot'),
                                adCard = MiniReelService.createCard('ad'),
                                linksCard = MiniReelService.createCard('links'),
                                textCard = MiniReelService.createCard('text'),
                                recapCard = MiniReelService.createCard('recap');

                            expect(videoCard).toEqual({
                                id: jasmine.any(String),
                                type: 'video',
                                title: null,
                                note: null,
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    skip: 'anytime',
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: null,
                                    videoid: null,
                                    start: null,
                                    end: null
                                }
                            });

                            expect(textCard).toEqual({
                                id: jasmine.any(String),
                                type: 'text',
                                title: null,
                                note: null,
                                label: 'Text',
                                ad: false,
                                view: 'text',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {}
                            });

                            expect(videoBallotCard).toEqual({
                                id: jasmine.any(String),
                                type: 'videoBallot',
                                title: null,
                                note: null,
                                label: 'Video + Questionnaire',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    skip: 'anytime',
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: null,
                                    videoid: null,
                                    start: null,
                                    end: null,
                                    ballot: {
                                        prompt: null,
                                        choices: []
                                    }
                                }
                            });

                            expect(adCard).toEqual({
                                id: jasmine.any(String),
                                type: 'ad',
                                title: 'Advertisement',
                                note: null,
                                label: 'Advertisement',
                                ad: true,
                                view: 'ad',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    autoplay: true,
                                    source: null,
                                    skip: 'anytime'
                                }
                            });

                            expect(recapCard).toEqual({
                                id: jasmine.any(String),
                                type: 'recap',
                                title: null,
                                note: null,
                                label: 'Recap',
                                ad: false,
                                view: 'recap',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {}
                            });

                            expect(linksCard).toEqual({
                                id: jasmine.any(String),
                                type: 'links',
                                title: null,
                                note: null,
                                label: 'Suggested Links',
                                ad: false,
                                view: 'links',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    links: []
                                }
                            });
                        });

                        it('should generate unique IDs for each card', function() {
                            var ids = [
                                MiniReelService.createCard('video'),
                                MiniReelService.createCard('videoBallot'),
                                MiniReelService.createCard('video'),
                                MiniReelService.createCard('ad')
                            ].map(function(card) {
                                return card.id;
                            });

                            ids.forEach(function(id) {
                                expect(ids.filter(function(thisId) {
                                    return id === thisId;
                                }).length).toBe(1);

                                expect(id).toMatch(/rc-[a-zA-Z0-9]{14}/);
                            });
                        });

                        it('should support creating a typeless card', function() {
                            var card = MiniReelService.createCard();

                            expect(card).toEqual({
                                id: jasmine.any(String),
                                type: null,
                                title: null,
                                note: null,
                                label: null,
                                ad: false,
                                view: null,
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {}
                            });
                        });

                        it('should support creating a displayAd card', function() {
                            var card = MiniReelService.createCard('displayAd');

                            expect(card).toEqual({
                                id: jasmine.any(String),
                                type: 'displayAd',
                                title: null,
                                note: null,
                                label: 'Display Ad',
                                ad: false,
                                view: 'display_ad',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    size: '300x250'
                                }
                            });
                        });
                    });

                    describe('setCardType(card, type)', function() {
                        it('should change the type of a card to the specified type', function() {
                            var card = MiniReelService.createCard(),
                                id = card.id,
                                videoCard, videoBallotCard, adCard, linksCard, displayAdCard, recapCard;

                            function sameId(card) {
                                card.id = id;

                                return card;
                            }

                            videoCard = MiniReelService.setCardType(card, 'video');
                            expect(videoCard).toBe(card);
                            expect(videoCard).toEqual(sameId(MiniReelService.createCard('video')));

                            videoCard.data.service = 'youtube';
                            videoCard.data.videoid = '12345';
                            videoCard.data.start = 10;
                            videoCard.data.end = 45;

                            videoBallotCard = MiniReelService.setCardType(card, 'videoBallot');
                            expect(videoBallotCard).toBe(card);
                            expect(videoBallotCard).toEqual((function() {
                                var card = sameId(MiniReelService.createCard('videoBallot'));

                                card.data.service = 'youtube';
                                card.data.videoid = '12345';
                                card.data.start = 10;
                                card.data.end = 45;

                                return card;
                            }()));

                            adCard = MiniReelService.setCardType(card, 'ad');
                            expect(adCard).toBe(card);
                            expect(adCard).toEqual(sameId(MiniReelService.createCard('ad')));
                            adCard.title = null;

                            linksCard = MiniReelService.setCardType(card, 'links');
                            expect(linksCard).toBe(card);
                            expect(linksCard).toEqual(sameId(MiniReelService.createCard('links')));

                            displayAdCard = MiniReelService.setCardType(card, 'displayAd');
                            expect(displayAdCard).toBe(card);
                            expect(displayAdCard).toEqual(sameId(MiniReelService.createCard('displayAd')));

                            recapCard = MiniReelService.setCardType(card, 'recap');
                            expect(recapCard).toBe(card);
                            expect(recapCard).toEqual(sameId(MiniReelService.createCard('recap')));
                        });
                    });

                    describe('findCard(deck, id)', function() {
                        it('should fetch a card from the deck', function() {
                            var deck = [
                                {
                                    id: 'rc-08dcca381411bf'
                                },
                                {
                                    id: 'rc-3a6be290d90577'
                                },
                                {
                                    id: 'rc-a8fa60e6e80174'
                                },
                                {
                                    id: 'rc-351a409bf1493e'
                                },
                                {
                                    id: 'rc-54dffdc85035fd'
                                }
                            ];

                            expect(MiniReelService.findCard(deck, 'rc-08dcca381411bf')).toBe(deck[0]);
                            expect(MiniReelService.findCard(deck, 'rc-a8fa60e6e80174')).toBe(deck[2]);
                            expect(MiniReelService.findCard(deck, 'rc-54dffdc85035fd')).toBe(deck[4]);
                            expect(MiniReelService.findCard(deck, 'rc-3a6be290d90577')).toBe(deck[1]);
                            expect(MiniReelService.findCard(deck, 'rc-351a409bf1493e')).toBe(deck[3]);
                        });
                    });

                    describe('enablePreview(minireel)', function() {
                        var success, failure,
                            saveDeferred;

                        beforeEach(function() {
                            saveDeferred = $q.defer();

                            minireel.access = 'private';

                            success = jasmine.createSpy('success()');
                            failure = jasmine.createSpy('failure()');

                            spyOn(minireel, 'save').and.returnValue(saveDeferred.promise);

                            $rootScope.$apply(function() {
                                MiniReelService.enablePreview(minireel).then(success, failure);
                            });
                        });

                        it('should set the access to public', function() {
                            expect(minireel.access).toBe('public');
                        });

                        it('should save the minireel', function() {
                            expect(minireel.save).toHaveBeenCalled();
                        });

                        describe('after the save completes', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    saveDeferred.resolve(minireel);
                                });
                            });

                            it('should resolve the promise', function() {
                                expect(success).toHaveBeenCalledWith(minireel);
                            });
                        });
                    });

                    describe('disablePreview(minireel)', function() {
                        var success, failure,
                            saveDeferred;

                        beforeEach(function() {
                            saveDeferred = $q.defer();

                            minireel.access = 'public';

                            success = jasmine.createSpy('success()');
                            failure = jasmine.createSpy('failure()');

                            spyOn(minireel, 'save').and.returnValue(saveDeferred.promise);

                            $rootScope.$apply(function() {
                                MiniReelService.disablePreview(minireel).then(success, failure);
                            });
                        });

                        it('should set the access to private', function() {
                            expect(minireel.access).toBe('private');
                        });

                        it('should save the minireel', function() {
                            expect(minireel.save).toHaveBeenCalled();
                        });

                        describe('after the save completes', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    saveDeferred.resolve(minireel);
                                });
                            });

                            it('should resolve the promise', function() {
                                expect(success).toHaveBeenCalledWith(minireel);
                            });
                        });
                    });

                    describe('previewUrlOf(minireel)', function() {
                        var result;

                        describe('if the minireel is public', function() {
                            beforeEach(function() {
                                minireel.access = 'public';
                            });

                            it('should be the correct short url in staging', function() {
                                c6Defines.kDebug = true;
                                result = MiniReelService.previewUrlOf(minireel);
                                expect(result).toBe('//staging.cinema6.com/preview?' +
                                   'id=' + encodeURIComponent(minireel.id)
                                );
                            });

                            it('should be the correct short url in production', function() {
                                c6Defines.kDebug = false;
                                result = MiniReelService.previewUrlOf(minireel);
                                expect(result).toBe('http://cinema6.com/preview?' +
                                   'id=' + encodeURIComponent(minireel.id)
                                );
                            });
                        });

                        describe('if the minireel is private', function() {
                            beforeEach(function() {
                                minireel.access = 'private';
                                result = MiniReelService.previewUrlOf(minireel);
                            });

                            it('should return null', function() {
                                expect(result).toBeNull();
                            });
                        });
                    });

                    describe('publish(minireel)', function() {
                        var result,
                            success,
                            saveDeferred,
                            syncVoteDeferred;

                        beforeEach(function() {
                            saveDeferred = $q.defer();
                            syncVoteDeferred = $q.defer();
                            success = jasmine.createSpy('success');
                            spyOn(VoteService, 'sync').and
                                .returnValue(syncVoteDeferred.promise);

                            spyOn(minireel, 'save').and.returnValue(saveDeferred.promise);

                            $rootScope.$apply(function() {
                                result = MiniReelService.publish(minireel).then(success);
                            });

                            $rootScope.$apply(function() {
                                syncVoteDeferred.resolve(minireel);
                            });
                        });

                        it('should call VoteService.sync()',function(){
                            expect(VoteService.sync).toHaveBeenCalledWith(minireel);
                        });

                        it('should set the minireel\'s status to "active"', function() {
                            expect(minireel.status).toBe('active');
                        });

                        it('should save the minireel', function() {
                            expect(minireel.save).toHaveBeenCalled();
                        });

                        it('should resolve to the minireel when the save is complete', function() {
                            $rootScope.$apply(function() {
                                saveDeferred.resolve(minireel);
                            });

                            expect(success).toHaveBeenCalledWith(minireel);
                        });
                    });

                    describe('unpublish(minireelId)', function() {
                        var result,
                            success,
                            saveDeferred;

                        beforeEach(function() {
                            saveDeferred = $q.defer();
                            success = jasmine.createSpy('success');

                            spyOn(minireel, 'save').and.returnValue(saveDeferred.promise);

                            $rootScope.$apply(function() {
                                result = MiniReelService.unpublish(minireel).then(success);
                            });
                        });

                        it('should set the minireel\'s status to "pending"', function() {
                            expect(minireel.status).toBe('pending');
                        });

                        it('should save the minireel', function() {
                            expect(minireel.save).toHaveBeenCalled();
                        });

                        it('should resolve to the minireel when the save is complete', function() {
                            $rootScope.$apply(function() {
                                saveDeferred.resolve(minireel);
                            });

                            expect(success).toHaveBeenCalledWith(minireel);
                        });
                    });

                    describe('convertForEditor(minireel)', function() {
                        var result,
                            deck;

                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                result = MiniReelService.convertForEditor(minireel);
                            });

                            deck = result.data.deck;
                        });

                        describe('if it is missing a collateral hash or splash hash', function() {
                            beforeEach(function() {
                                delete minireel.data.collateral;
                                delete minireel.data.splash;

                                $rootScope.$apply(function() {
                                    result = MiniReelService.convertForEditor(minireel);
                                });
                            });

                            it('should create default ones', function() {
                                expect(result.data.collateral).toEqual({
                                    splash: null
                                });
                                expect(result.data.splash).toEqual({
                                    ratio: '3-2',
                                    source: 'generated',
                                    theme: 'img-text-overlay'
                                });
                            });
                        });

                        it('should support copying onto a provided object', function() {
                            var object = {
                                    invalidProp: 'blah',
                                    foo: 'bar'
                                },
                                copied = MiniReelService.convertForEditor(minireel, object);

                            expect(copied).toBe(object);
                            expect(copied).toEqual(result);
                        });

                        it('should return an object with all the non-data content of the original', function() {
                            expect(result).toEqual({
                                id: 'e-15aa87f5da34c3',
                                title: 'My MiniReel',
                                subtitle: 'I <3 Turtles',
                                summary: 'I AM THE TURTLE MONSTER!',
                                type: 'minireel',
                                theme: 'ed-videos',
                                status: 'pending',
                                access: 'public',
                                _type: 'experience',
                                _erased: false,
                                data: jasmine.any(Object)
                            });
                        });

                        it('should copy the branding of the minireel', function() {
                            expect(result.data.branding).toBe('elitedaily');
                        });

                        it('should copy the autoplay settings of the minireel', function() {
                            expect(result.data.autoplay).toBe(false);
                        });

                        it('should copy the title of the minireel', function() {
                            expect(result.data.title).toBe('My MiniReel');
                        });

                        it('should copy the mode of the minireel', function() {
                            expect(result.data.mode).toBe('lightbox');
                        });

                        it('should transpile the text card', function() {
                            expect(deck[0]).toEqual({
                                id: 'rc-9de889d3002d03',
                                type: 'text',
                                title: 'This is my MiniReel',
                                note: 'Hello. This is an intro.',
                                label: 'Text',
                                ad: false,
                                view: 'text',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {}
                            });
                        });

                        it('should transpile the various video cards into two cards', function() {
                            expect(deck[1]).toEqual({
                                id: 'rc-c9cf24e87307ac',
                                type: 'video',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    skip: 'anytime',
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'youtube',
                                    videoid: '47tfg8734',
                                    start: 10,
                                    end: 40
                                }
                            });

                            expect(deck[2]).toEqual({
                                id: 'rc-17721b74ce2584',
                                type: 'videoBallot',
                                title: 'The Ugliest Turtle',
                                note: 'Blah blah blah',
                                label: 'Video + Questionnaire',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    skip: 25,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'vimeo',
                                    videoid: '48hfrei49',
                                    start: null,
                                    end: null,
                                    ballot: {
                                        prompt: 'Was it ugly?',
                                        choices: [
                                            'Really Ugly',
                                            'Not That Ugly'
                                        ]
                                    }
                                }
                            });

                            expect(deck[3]).toEqual({
                                id: 'rc-61fa9683714e13',
                                type: 'videoBallot',
                                title: 'The Smartest Turtle',
                                note: 'Blah blah blah',
                                label: 'Video + Questionnaire',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {
                                    skip: 'never',
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'dailymotion',
                                    videoid: 'vfu85f5',
                                    start: undefined,
                                    end: undefined,
                                    ballot: {
                                        prompt: 'How smart was it?',
                                        choices: [
                                            'Really Smart',
                                            'Pretty Stupid'
                                        ]
                                    }
                                }
                            });

                            expect(deck[4]).toEqual({
                                id: 'rc-d8ebd5461ba524',
                                type: 'video',
                                title: 'The Dumbest Turtle',
                                note: 'Blah blah blah',
                                label: 'Sponsored Video',
                                ad: false,
                                view: 'video',
                                placementId: '12345',
                                templateUrl: '//portal.cinema6.com/collateral/minireel/templates/huffpost.html',
                                sponsored: true,
                                campaign: {
                                    campaignId: 'abc123',
                                    advertiserId: '123abc',
                                    minViewTime: 15
                                },
                                collateral: {
                                    logo: 'my-awesome-logo.png'
                                },
                                thumb: null,
                                links: {
                                    'Facebook': 'my-fb.html',
                                    'Website': 'awesome.com'
                                },
                                params: {
                                    ad: true,
                                    sponsor: 'GameStop',
                                    action: {
                                        type: 'text',
                                        label: 'OH HAI!'
                                    }
                                },
                                data: {
                                    skip: 'delay',
                                    autoplay: false,
                                    autoadvance: true,
                                    survey: {
                                        election: 'el-8bb2395fbea873',
                                        prompt: 'Are you willing to spend all your money on this product?',
                                        choices: [
                                            'Of Course',
                                            'I Have no Money'
                                        ]
                                    },
                                    service: 'youtube',
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40
                                }
                            });

                            expect(deck[10]).toEqual({
                                id: 'rc-82a19a12065636',
                                type: 'video',
                                title: 'AdUnit Card',
                                note: 'It\'s Ad Tech!',
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                thumb: 'logo.jpg',
                                data: {
                                    skip: 'anytime',
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'adUnit',
                                    videoid: JSON.stringify({
                                        vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                        vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                                    }),
                                    start: null,
                                    end: null
                                }
                            });

                            expect(deck[11]).toEqual({
                                id: 'rc-fc6cfb661b7a86',
                                type: 'video',
                                title: 'Yahoo! Card',
                                note: 'This is a Yahoo! card.',
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                thumb: null,
                                data: {
                                    skip: 'anytime',
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'yahoo',
                                    videoid: 'teen-tries-drain-pond-lost-221030513',
                                    start: null,
                                    end: null
                                }
                            });

                            expect(deck[12]).toEqual({
                                id: 'rc-f51c0386a90a02',
                                type: 'video',
                                title: 'AOL Card',
                                note: 'This is an AOL card.',
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                thumb: null,
                                data: {
                                    skip: 'anytime',
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'aol',
                                    videoid: 'arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876',
                                    start: null,
                                    end: null
                                }
                            });
                        });

                        it('should transpile the links cards', function() {
                            expect(deck[7]).toEqual({
                                id: 'rc-25c1f60b933186',
                                type: 'links',
                                title: 'If You Love Turtles',
                                note: 'Blah blah blah',
                                label: 'Suggested Links',
                                ad: false,
                                view: 'links',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: minireel.data.deck[8].data
                            });

                            expect(deck[7].data.links).not.toBe(minireel.data.deck[8].data.links);
                        });

                        it('should transpile the recap cards', function() {
                            expect(deck[8]).toEqual({
                                id: 'rc-b74a127991ee75',
                                type: 'recap',
                                title: null,
                                note: null,
                                label: 'Recap',
                                ad: false,
                                view: 'recap',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                params: {},
                                data: {}
                            });
                        });

                        it('should transpile the displayAd cards', function() {
                            expect(deck[9]).toEqual({
                                id: 'rc-82a19a12065636',
                                type: 'displayAd',
                                title: 'By Ubisoft',
                                note: 'Games are great!',
                                label: 'Display Ad',
                                ad: false,
                                view: 'display_ad',
                                placementId: '398thfu954',
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null
                                },
                                collateral: {},
                                thumb: 'logo.jpg',
                                links: {},
                                params: {
                                    sponsor: 'Ubisoft'
                                },
                                data: {
                                    size: '300x250'
                                }
                            });
                        });
                    });

                    describe('create(minireel)', function() {
                        var result,
                            success,
                            newModel,
                            saveDeferred,
                            minireels;

                        beforeEach(function() {
                            var dbCreate = cinema6.db.create;

                            minireels = [];

                            spyOn(cinema6.db, 'findAll').and.returnValue($q.when(minireels));

                            saveDeferred = $q.defer();
                            success = jasmine.createSpy('success');

                            spyOn(cinema6.db, 'create').and.callFake(function() {
                                newModel = dbCreate.apply(cinema6.db, arguments);

                                return newModel;
                            });
                        });

                        describe('with a template', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = MiniReelService.create(minireel).then(success);
                                });
                            });

                            it('should create a new minireel experience based off of the old one', function() {
                                expect(cinema6.db.create).toHaveBeenCalledWith('experience', {
                                    id: jasmine.any(String),
                                    title: 'My MiniReel',
                                    subtitle: 'I <3 Turtles',
                                    summary: 'I AM THE TURTLE MONSTER!',
                                    type: 'minireel',
                                    theme: 'ed-videos',
                                    status: 'pending',
                                    access: 'public',
                                    data: jasmine.any(Object)
                                });

                                cinema6.db.create.calls.mostRecent().args[1].data.deck.forEach(function(card, index) {
                                    if (index === 0) { return; }

                                    expect(card).toEqual((function() {
                                        var original = angular.copy(minireel.data.deck[index]);

                                        if (original.ballot) {
                                            delete original.ballot.election;
                                        }

                                        return original;
                                    }()));
                                });
                            });

                            it('should resolve the promise after the minireel is saved', function() {
                                expect(success).toHaveBeenCalledWith(newModel);
                                expect(newModel.data.title).toBe('My MiniReel (copy)');
                                expect(newModel.status).toBe('pending');
                                expect(newModel.access).toBe('public');
                                expect('election' in newModel.data).toBe(false);
                                expect('election' in newModel.data.deck[5].ballot).toBe(false);
                            });
                        });

                        describe('without a template', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = MiniReelService.create().then(success);
                                });
                            });

                            it('should initialize a new minireel', function() {
                                expect(cinema6.db.create).toHaveBeenCalledWith('experience', {
                                    type: 'minireel',
                                    org: 'o-17593d7a2bf294',
                                    appUri: 'rumble',
                                    data: {
                                        title: null,
                                        mode: 'lightbox-ads',
                                        autoplay: true,
                                        autoadvance: true,
                                        sponsored: false,
                                        campaign: {},
                                        splash: {
                                            source: 'generated',
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        },
                                        collateral: {
                                            splash: null
                                        },
                                        params: {},
                                        deck: [
                                            (function() {
                                                var recap = MiniReelService.createCard('recap');

                                                recap.id = jasmine.any(String);

                                                return recap;
                                            }())
                                        ]
                                    }
                                });
                            });

                            it('should resolve the promise', function() {
                                expect(success).toHaveBeenCalledWith(newModel);
                                expect(newModel.status).toBe('pending');
                                expect(newModel.access).toBe('public');
                            });
                        });
                    });

                    describe('erase(minireel)', function() {
                        var success,
                            eraseDeferred;

                        beforeEach(function() {
                            success = jasmine.createSpy('success');
                            eraseDeferred = $q.defer();

                            spyOn(minireel, 'erase').and.returnValue(eraseDeferred.promise);

                            $rootScope.$apply(function() {
                                MiniReelService.erase(minireel).then(success);
                            });
                        });

                        it('should erase the minireel', function() {
                            expect(minireel.erase).toHaveBeenCalled();
                        });

                        it('should resolve with null when finished', function() {
                            $rootScope.$apply(function() {
                                eraseDeferred.resolve(null);
                            });

                            expect(success).toHaveBeenCalledWith(null);
                        });
                    });

                    describe('convertForPlayer(minireel)', function() {
                        it('should convert back to the player format', function() {
                            var converted,
                                result;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });
                            result = MiniReelService.convertForPlayer(converted);

                            expect(Object.keys(result.data).length).toBe(Object.keys(minireel.data).length);

                            minireel.data.deck.forEach(function(card) {
                                if (card.type === 'ad') {
                                    card.id = jasmine.any(String);
                                }
                            });
                            expect(result.data).toEqual(minireel.data);
                            minireel.data.deck.forEach(function(card, index) {
                                expect(card).toEqual(result.data.deck[index], card.id);
                            });
                            expect(result).not.toBe(minireel);
                        });

                        it('should add/remove displayAd modules on each card based on adConfig', function() {
                            var converted,
                                result;

                            minireel.data.adConfig.display.enabled = true;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            result.data.deck.forEach(function(card) {
                                if (!(/adUnit|text|links|displayAd/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).not.toBe(-1);
                                } else if (card.type !== 'links') {
                                    expect(card.modules.indexOf('displayAd')).toBe(-1);
                                }
                            });

                            minireel.data.adConfig.display.enabled = false;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            result.data.deck.forEach(function(card) {
                                if ((!card.placementId && !(/ad|links/).test(card.type)) ||
                                    (/adUnit|text|displayAd/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).toBe(-1);
                                } else if (card.type !== 'links') {
                                    expect(card.modules.indexOf('displayAd')).not.toBe(-1);
                                }
                            });

                            delete minireel.data.adConfig;

                            portal.cModel.org.adConfig = {
                                display: {
                                    enabled: true
                                }
                            };

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            result.data.deck.forEach(function(card) {
                                if (!(/adUnit|text|links|displayAd/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).not.toBe(-1);
                                } else if (card.type !== 'links') {
                                    expect(card.modules.indexOf('displayAd')).toBe(-1);
                                }
                            });

                            portal.cModel.org.adConfig = {
                                display: {
                                    enabled: false
                                }
                            };

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            result.data.deck.forEach(function(card) {
                                if ((!card.placementId && !(/ad|links/).test(card.type)) ||
                                    (/adUnit|text|displayAd/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).toBe(-1);
                                } else if (card.type !== 'links') {
                                    expect(card.modules.indexOf('displayAd')).not.toBe(-1);
                                }
                            });
                        });

                        it('should never have displayAd module on adUnits unless placementId is defined', function() {
                            var converted,
                                result;

                            minireel.data.deck = [
                                {
                                    id: 'rc-82a19a12065636',
                                    type: 'adUnit',
                                    title: 'AdUnit Card',
                                    note: 'It\'s Ad Tech!',
                                    placementId: null,
                                    templateUrl: null,
                                    sponsored: false,
                                    campaign: {
                                        campaignId: null,
                                        advertiserId: null,
                                        minViewTime: null
                                    },
                                    collateral: {},
                                    links: {},
                                    thumbs: {
                                        small: 'logo.jpg',
                                        large: 'logo.jpg'
                                    },
                                    params: {},
                                    modules: [],
                                    data: {
                                        skip: true,
                                        vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                        vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                                    }
                                }
                            ];

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(0);
                        });

                        it('should never have displayAd module on sponsored cards unless placementId is defined', function() {
                            var converted,
                                result;

                            minireel.data.adConfig.display.enabled = true;

                            minireel.data.deck = [
                                {
                                    id: 'rc-f940abe0c1f3f0',
                                    type: 'video',
                                    title: 'No video yet..',
                                    note: 'Lame...',
                                    modules: [],
                                    placementId: null,
                                    templateUrl: null,
                                    sponsored: true,
                                    campaign: {
                                        campaignId: null,
                                        advertiserId: null,
                                        minViewTime: null
                                    },
                                    collateral: {},
                                    links: {},
                                    params: {},
                                    data: {}
                                }
                            ];

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(0);

                            minireel.data.adConfig.display.enabled = false;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            result = MiniReelService.convertForPlayer(converted);

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(0);
                        });

                        it('should support performing the conversion on a specified object', function() {
                            var converted,
                                result;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });
                            converted.data.deck[1].title = 'New Title';

                            result = MiniReelService.convertForPlayer(converted, minireel);

                            expect(result).toBe(minireel);
                            expect(result.data).not.toBe(converted.data);
                            expect(minireel.data.deck[1].title).toBe('New Title');
                        });

                        it('should transpile a adUnit card with no ad tags', function() {
                            var converted;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            converted.data.deck[10].data.videoid = null;

                            expect(function() {
                                MiniReelService.convertForPlayer(converted);
                            }).not.toThrow();
                        });

                        it('should give a sponosred card the "ad" param', function() {
                            var converted,
                                card = MiniReelService.createCard('video');

                            card.sponsored = true;

                            $rootScope.$apply(function() {
                                converted = MiniReelService.convertForEditor(minireel);
                            });

                            converted.data.deck = [card];

                            expect(MiniReelService.convertForPlayer(converted).data.deck[0].params.ad).toBe(true);
                        });

                        it('should give the video in a single-video minireel the "post" module', function() {
                            var converted = MiniReelService.convertForEditor(minireel);

                            converted.data.deck = [MiniReelService.createCard('video')];

                            expect(MiniReelService.convertForPlayer(converted).data.deck[0].modules).toContain('post');
                        });
                    });

                    describe('adChoicesOf(org, data)', function() {
                        it('should return the correct choices for video and display ads', function() {
                            var data = {
                                experience: {
                                    data: {
                                        videoAdSources: [
                                            {
                                                value: 'cinema6',
                                            },
                                            {
                                                value: 'cinema6-publisher',
                                            },
                                            {
                                                value: 'publisher',
                                            },
                                            {
                                                value: 'publisher-cinema6',
                                            }
                                        ],
                                        displayAdSources: [
                                            {
                                                value: 'cinema6',
                                            },
                                            {
                                                value: 'cinema6-publisher',
                                            },
                                            {
                                                value: 'publisher',
                                            },
                                            {
                                                value: 'publisher-cinema6',
                                            }
                                        ]
                                    }
                                },
                            },
                            org = {
                                waterfalls: {
                                    display: ['cinema6'],
                                    video: ['cinema6']
                                }
                            };

                            expect(MiniReelService.adChoicesOf(org, data.experience.data)).toEqual({
                                video: [{value:'cinema6'}],
                                display: [{value:'cinema6'}]
                            });

                            org.waterfalls.display = ['cinema6','publisher','cinema6-publisher','publisher-cinema6'];

                            expect(MiniReelService.adChoicesOf(org, data.experience.data)).toEqual({
                                video: [{value:'cinema6'}],
                                display: [{value:'cinema6'}, {value:'cinema6-publisher'}, {value:'publisher'}, {value:'publisher-cinema6'}]
                            });
                        });
                    });

                    describe('disableDisplayAds(minireel)', function() {
                        it('should ensure that text, links, and displayAd cards never have displayAd module', function() {
                            minireel.data.deck.forEach(function(card) {
                                if ((/text|links|displayAd/).test(card.type)) {
                                    card.modules = ['displayAd'];
                                }
                            });

                            minireel = MiniReelService.disableDisplayAds(minireel);

                            minireel.data.deck.forEach(function(card) {
                                if ((/text|links|displayAd/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).toBe(-1);
                                }
                            });
                        });

                        it('should ensure that adUnits never have displayAd module unless placementId is defined', function() {
                            minireel.data.deck = [
                                {
                                    type: 'adUnit',
                                    modules: ['displayAd']
                                }
                            ];

                            minireel = MiniReelService.disableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].sponsored = true;
                            minireel = MiniReelService.disableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;
                            minireel = MiniReelService.disableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(0);
                        });

                        it('should ensure that displayAd cards never have displayAd module even if placementId is defined', function() {
                            minireel.data.deck = [
                                {
                                    type: 'displayAd',
                                    modules: ['displayAd']
                                }
                            ];

                            minireel = MiniReelService.disableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].sponsored = true;
                            minireel = MiniReelService.disableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;
                            minireel = MiniReelService.disableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);
                        });

                        it('should remove the displayAd module on any eligible cards that don not have placementIds', function() {
                            minireel.data.deck = [
                                {
                                    type: 'youtube',
                                    modules: ['displayAd']
                                },
                                {
                                    type: 'vimeo',
                                    modules: ['displayAd']
                                },
                                {
                                    type: 'dailymotion',
                                    modules: ['displayAd']
                                },
                                {
                                    type: 'video',
                                    modules: ['displayAd']
                                },
                                {
                                    type: 'videoBallot',
                                    modules: ['displayAd']
                                },
                                {
                                    type: 'recap',
                                    modules: ['displayAd']
                                }
                            ];

                            minireel = MiniReelService.disableDisplayAds(minireel);

                            minireel.data.deck.forEach(function(card) {
                                expect(card.modules.indexOf('displayAd')).toBe(-1);
                            });

                            minireel.data.deck.forEach(function(card) {
                                card.placementId = 12345;
                            });

                            minireel = MiniReelService.disableDisplayAds(minireel);

                            minireel.data.deck.forEach(function(card) {
                                expect(card.modules.indexOf('displayAd')).toBe(0);
                            });
                        });
                    });

                    describe('enableDisplayAds(minireel)', function() {
                        it('should ensure that text, links, and displayAd cards never have displayAd module', function() {
                            minireel.data.deck.forEach(function(card) {
                                if ((/text|links|displayAd/).test(card.type)) {
                                    card.modules = ['displayAd'];
                                }
                            });

                            minireel = MiniReelService.enableDisplayAds(minireel);

                            minireel.data.deck.forEach(function(card) {
                                if ((/text|links|displayAd/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).toBe(-1);
                                }
                            });
                        });

                        it('should ensure that adUnits never have displayAd module unless placementId is defined', function() {
                            minireel.data.deck = [
                                {
                                    type: 'adUnit',
                                    modules: ['displayAd']
                                }
                            ];

                            minireel = MiniReelService.enableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].sponsored = true;
                            minireel = MiniReelService.enableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;
                            minireel = MiniReelService.enableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(0);
                        });

                        it('should ensure that displayAd cards never have displayAd module even if placementId is defined', function() {
                            minireel.data.deck = [
                                {
                                    type: 'displayAd',
                                    modules: ['displayAd']
                                }
                            ];

                            minireel = MiniReelService.enableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].sponsored = true;
                            minireel = MiniReelService.enableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;
                            minireel = MiniReelService.enableDisplayAds(minireel);

                            expect(minireel.data.deck[0].modules.indexOf('displayAd')).toBe(-1);
                        });

                        it('should set the displayAd module on any eligible cards that are not sponsored or are sponsored but have placementIds', function() {
                            minireel.data.deck = [
                                {
                                    type: 'youtube',
                                    modules: []
                                },
                                {
                                    type: 'vimeo',
                                    modules: []
                                },
                                {
                                    type: 'dailymotion',
                                    modules: []
                                },
                                {
                                    type: 'video',
                                    modules: []
                                },
                                {
                                    type: 'videoBallot',
                                    modules: []
                                },
                                {
                                    type: 'recap',
                                    modules: []
                                }
                            ];

                            minireel = MiniReelService.enableDisplayAds(minireel);

                            minireel.data.deck.forEach(function(card) {
                                expect(card.modules.indexOf('displayAd')).toBe(0);
                            });

                            minireel.data.deck.forEach(function(card) {
                                card.sponsored = true;
                            });

                            minireel = MiniReelService.enableDisplayAds(minireel);

                            minireel.data.deck.forEach(function(card) {
                                expect(card.modules.indexOf('displayAd')).toBe(-1);
                            });

                            minireel.data.deck.forEach(function(card) {
                                card.placementId = 12345;
                            });

                            minireel = MiniReelService.enableDisplayAds(minireel);

                            minireel.data.deck.forEach(function(card) {
                                expect(card.modules.indexOf('displayAd')).toBe(0);
                            });
                        });
                    });
                });
            });
        });
    });
}());
