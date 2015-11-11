(function() {
    'use strict';

    define(['app' , 'c6_defines'], function(appModule, c6Defines) {
        /* global angular:true */
        var copy = angular.copy;

        describe('MiniReelService', function() {
            var MiniReelService,
                VoteService,
                CollateralUploadService,
                ThumbnailService,
                OpenGraphService,
                SettingsService,
                ImageService,
                InstagramService,
                VideoService,
                $rootScope,
                c6UrlParser,
                c6ImagePreloader,
                cinema6,
                c6State,
                portal,
                mocks,
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
                    CollateralUploadService = $injector.get('CollateralUploadService');
                    ThumbnailService = $injector.get('ThumbnailService');
                    OpenGraphService = $injector.get('OpenGraphService');
                    SettingsService = $injector.get('SettingsService');
                    ImageService = $injector.get('ImageService');
                    InstagramService = $injector.get('InstagramService');
                    VideoService = $injector.get('VideoService');
                    c6State = $injector.get('c6State');
                    c6UrlParser = $injector.get('c6UrlParser');
                    c6ImagePreloader = $injector.get('c6ImagePreloader');
                });

                spyOn(ImageService._private, 'getFlickrEmbedInfo').and.returnValue(
                    $q.when({
                        src: 'https://farm8.staticflickr.com/7646/16767833635_9459b8ee35.jpg',
                        width: '1600',
                        height: '1067',
                        thumbs: {
                            small: 'https://farm8.staticflickr.com/7646/16767833635_9459b8ee35_t.jpg',
                            large: 'https://farm8.staticflickr.com/7646/16767833635_9459b8ee35_m.jpg'
                        }
                    })
                );

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

                mocks = {
                    playerCards: {
                        vine: {
                            id: 'rc-1ac904b814c8d6a20fea',
                            type: 'vine',
                            title: 'Vine Card',
                            note: 'This is a Vine card.',
                            source: 'Vine',
                            placementId: null,
                            templateUrl: null,
                            sponsored: false,
                            campaign: {
                                campaignId: null,
                                advertiserId: null,
                                minViewTime: null,
                                countUrls: [],
                                clickUrls: []
                            },
                            thumbs: null,
                            collateral: {},
                            links: {},
                            shareLinks: {},
                            params: {},
                            modules: [],
                            data: {
                                skip: true,
                                service: 'vine',
                                videoid: 'erUbKHDX6Ug',
                                href: 'https://vine.co/v/erUbKHDX6Ug',
                                thumbs: {
                                    small: 'images.vine.com/video/erUbKHDX6Ug/small.jpg',
                                    large: 'images.vine.com/video/erUbKHDX6Ug/large.jpg'
                                }
                            },
                        },
                        instagram: {
                            id: 'rc-94028ed693fda7',
                            type: 'instagram',
                            title: 'Hey it\'s an Instagram Card!',
                            source: 'Instagram',
                            data: {
                                type: 'image',
                                id: '5YN6a0tOc-',
                                src: 'https://mock.instagram.com/image/5YN6a0tOc-.jpg',
                                thumbs: {
                                    small: 'images.instagram.com/small.jpg',
                                    large: 'images.instagram.com/large.jpg'
                                },
                                href: 'https:\/\/instagram.com\/p\/5YN6a0tOc-\/',
                                likes: '77606',
                                date: '1438099887',
                                caption: 'Solomon, Pembroke Welsh Corgi (12 w\/o), BarkFest 2015, Brooklyn, NY',
                                comments: '9718',
                                user: {
                                    fullname: 'The Dogist',
                                    picture: 'https:\/\/igcdn-photos-g-a.akamaihd.net\/hphotos-ak-xfa1\/t51.2885-19\/s150x150\/11382947_1023728481019302_1629502413_a.jpg',
                                    username: 'thedogist',
                                    follow: 'https://instagram.com/accounts/login/?next=%2Fp%2F5YN6a0tOc-%2F&source=follow',
                                    href: 'https://instagram.com/thedogist',
                                    bio: 'A photo-documentary series about the beauty of dogs. Author of THE DOGIST, coming October, 2015.',
                                    website: 'http:\/\/thedogist.com\/book',
                                    posts: '2884',
                                    followers: '1027481',
                                    following: '3'
                                },
                            },
                            placementId: null,
                            templateUrl: null,
                            sponsored: false,
                            campaign: {
                                campaignId: null,
                                advertiserId: null,
                                minViewTime: null,
                                countUrls: [],
                                clickUrls: []
                            },
                            collateral: {},
                            links: {},
                            params: {},
                            modules: [],
                            thumbs: {
                                small: 'https://user-specified.com/thumb.jpg',
                                large: 'https://user-specified.com/thumb.jpg'
                            }
                        },
                        vzaar: {
                            id: 'rc-16acda0e8302116df64d',
                            type: 'vzaar',
                            title: 'Vzaar Card',
                            note: 'This is a Vzaar card.',
                            source: 'Vzaar',
                            placementId: null,
                            templateUrl: null,
                            sponsored: false,
                            campaign: {
                                campaignId: null,
                                advertiserId: null,
                                minViewTime: null,
                                countUrls: [],
                                clickUrls: []
                            },
                            thumbs: null,
                            collateral: {},
                            links: {},
                            shareLinks: {},
                            params: {},
                            modules: [],
                            data: {
                                skip: true,
                                service: 'vzaar',
                                videoid: '1380051',
                                href: 'http://vzaar.tv/1380051',
                                thumbs: {
                                    small: 'images.vzaar.com/video/1380051/small.jpg',
                                    large: 'images.vzaar.com/video/1380051/large.jpg'
                                }
                            }
                        },
                        wistia: {
                            id: 'rc-5c404f4aedc7',
                            type: 'wistia',
                            title: 'Wistia Card',
                            note: 'This is a Wistia card.',
                            source: 'Wistia',
                            placementId: null,
                            templateUrl: null,
                            sponsored: false,
                            campaign: {
                                campaignId: null,
                                advertiserId: null,
                                minViewTime: null,
                                countUrls: [],
                                clickUrls: []
                            },
                            thumbs: null,
                            collateral: {},
                            links: {},
                            shareLinks: {},
                            params: {},
                            modules: [],
                            data: {
                                skip: true,
                                service: 'wistia',
                                videoid: '9iqvphjp4u',
                                href: 'https://cinema6.wistia.com/medias/9iqvphjp4u?preview=true',
                                thumbs: {
                                    small: 'images.wistia.com/video/9iqvphjp4u/small.jpg',
                                    large: 'images.wistia.com/video/9iqvphjp4u/large.jpg'
                                }
                            }
                        }
                    }
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
                    categories: ['foo', 'bar'],
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                modules: [],
                                data: {}
                            },
                            {
                                id: 'rc-6ce459b2052d07',
                                type: 'image',
                                title: 'This is an image card!',
                                note: 'Wow. What a spectacular card.',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                modules: [],
                                data: {
                                    service: 'flickr',
                                    imageid: '16767833635',
                                    src: 'https://farm8.staticflickr.com/7646/16767833635_9459b8ee35.jpg',
                                    href: 'http://www.flickr.com/16767833635',
                                    width: '1600',
                                    height: '1067',
                                    source: 'Flickr',
                                    thumbs: {
                                        small: 'images.flickr.com/image/16767833635/small.jpg',
                                        large: 'images.flickr.com/image/16767833635/large.jpg'
                                    }
                                }
                            },
                            {
                                id: 'rc-642d031cd42b07',
                                type: 'image',
                                title: 'This is a web image card!',
                                note: 'Imagetastic',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                modules: [],
                                data: {
                                    service: 'web',
                                    src: 'collateral/12345.jpg',
                                    href: 'http://www.fractalsciencekit.com/fractals/large/Fractal-Mobius-Dragon-IFS-10.jpg',
                                    thumbs: {
                                        small: 'collateral/12345.jpg',
                                        large: 'collateral/12345.jpg'
                                    }
                                }
                            },
                            {
                                id: 'rc-b2d076ce052459',
                                type: 'article',
                                title: 'This is an article card!',
                                note: null,
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                params: {},
                                modules: [],
                                data: {
                                    src: 'http://www.cinema6.com',
                                    thumbs: {
                                        small: 'http://www.cinema6.com/og_logo.jpg',
                                        large: 'http://www.cinema6.com/og_logo.jpg'
                                    }
                                },
                                thumbs: {
                                    small: 'images.somewhere.com/user_specified.jpg',
                                    large: 'images.somewhere.com/user_specified.jpg'
                                }
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                thumbs: null,
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                modules: [],
                                data: {
                                    skip: true,
                                    controls: true,
                                    videoid: '47tfg8734',
                                    start: 10,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0,
                                    href: 'https://www.youtube.com/watch?v=47tfg8734',
                                    thumbs: {
                                        small: 'images.youtube.com/video/47tfg8734/small.jpg',
                                        large: 'images.youtube.com/video/47tfg8734/large.jpg'
                                    },
                                    moat: {
                                        campaign: 'Turtle Campaign',
                                        advertiser: 'Turtles, Inc.',
                                        creative: 'turtle_power'
                                    }
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                ballot: {
                                    prompt: 'Was it ugly?',
                                    choices: [
                                        'Really Ugly',
                                        'Not That Ugly'
                                    ]
                                },
                                thumbs: null,
                                data: {
                                    skip: 25,
                                    videoid: '48hfrei49',
                                    href: 'http://vimeo.com/48hfrei49',
                                    thumbs: {
                                        small: 'images.vimeo.com/video/48hfrei49/small.jpg',
                                        large: 'images.vimeo.com/video/48hfrei49/large.jpg'
                                    }
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                ballot: {
                                    prompt: 'How smart was it?',
                                    choices: [
                                        'Really Smart',
                                        'Pretty Stupid'
                                    ]
                                },
                                thumbs: null,
                                data: {
                                    controls: true,
                                    skip: false,
                                    videoid: 'vfu85f5',
                                    related: 0,
                                    href: 'http://www.dailymotion.com/video/vfu85f5',
                                    thumbs: {
                                        small: 'images.dailymotion.com/video/vfu85f5/small.jpg',
                                        large: 'images.dailymotion.com/video/vfu85f5/large.jpg'
                                    }
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
                                    minViewTime: 15,
                                    countUrls: ['http://dumbturtle.com/pixel?s=dumb'],
                                    clickUrls: ['//dumbturtle.com/anotherpixel?s=sodumb']
                                },
                                collateral: {
                                    logo: 'my-awesome-logo.png'
                                },
                                links: {
                                    'Facebook': 'my-fb.html',
                                    'Website': 'awesome.com'
                                },
                                shareLinks: {
                                    facebook: 'http://www.facebook.com/turtles',
                                    twitter: 'http://www.twitter.com/turtles',
                                    pinterest: 'http://www.pinterest.com/turtles'
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
                                thumbs: null,
                                data: {
                                    hideSource: true,
                                    controls: false,
                                    skip: 6,
                                    autoplay: false,
                                    autoadvance: true,
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0,
                                    href: 'https://www.youtube.com/watch?v=fn4378r4d',
                                    thumbs: {
                                        small: 'images.youtube.com/video/fn4378r4d/small.jpg',
                                        large: 'images.youtube.com/video/fn4378r4d/large.jpg'
                                    }
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                thumbs: null,
                                collateral: {},
                                links: {},
                                shareLinks: {},
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                thumbs: null,
                                collateral: {},
                                links: {},
                                shareLinks: {},
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                thumbs: {
                                    small: 'logo.jpg',
                                    large: 'logo.jpg'
                                },
                                params: {},
                                modules: [],
                                data: {
                                    skip: true,
                                    controls: true,
                                    vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                    vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                    moat: {
                                        campaign: 'Turtle Campaign',
                                        advertiser: 'Turtles, Inc.',
                                        creative: 'turtle_power'
                                    }
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
                                        minViewTime: null,
                                        countUrls: [],
                                        clickUrls: []
                                    },
                                    thumbs: null,
                                    collateral: {},
                                    links: {},
                                    shareLinks: {},
                                    params: {},
                                    modules: [],
                                    data: {
                                        skip: true,
                                        service: 'yahoo',
                                        videoid: 'teen-tries-drain-pond-lost-221030513',
                                        href: 'https://screen.yahoo.com/teen-tries-drain-pond-lost-221030513.html',
                                        thumbs: {
                                            small: 'images.yahoo.com/video/teen-tries-drain-pond-lost-221030513/small.jpg',
                                            large: 'images.yahoo.com/video/teen-tries-drain-pond-lost-221030513/large.jpg'
                                        }
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
                                        minViewTime: null,
                                        countUrls: [],
                                        clickUrls: []
                                    },
                                    thumbs: null,
                                    collateral: {},
                                    links: {},
                                    shareLinks: {},
                                    params: {},
                                    modules: [],
                                    data: {
                                        skip: true,
                                        service: 'aol',
                                        videoid: 'arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876',
                                        href: 'http://on.aol.com/video/arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876',
                                        thumbs: {
                                            small: 'images.aol.com/video/arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876/small.jpg',
                                            large: 'images.aol.com/video/arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876/large.jpg'
                                        }
                                    }
                                };

                                card.data.code = VideoService.embedCodeFromData(card.data.service, card.data.videoid);

                                return card;
                            }()),
                            (function() {
                                var card = {
                                    id: 'rc-8142d1b5897b32',
                                    type: 'rumble',
                                    title: 'Rumble Card',
                                    note: 'This is a Rumble card.',
                                    source: 'Rumble',
                                    placementId: null,
                                    templateUrl: null,
                                    sponsored: false,
                                    campaign: {
                                        campaignId: null,
                                        advertiserId: null,
                                        minViewTime: null,
                                        countUrls: [],
                                        clickUrls: []
                                    },
                                    collateral: {},
                                    links: {},
                                    shareLinks: {},
                                    params: {},
                                    modules: [],
                                    thumbs: null,
                                    data: {
                                        skip: true,
                                        siteid: 'v2z8ro-willie-perfoming-at-school-talent-show',
                                        href: 'https://rumble.com/v2z8ro-willie-perfoming-at-school-talent-show.html',
                                        thumbs: {
                                            small: 'images.rumble.com/video/v2z8ro-willie-perfoming-at-school-talent-show/small.jpg',
                                            large: 'images.rumble.com/video/v2z8ro-willie-perfoming-at-school-talent-show/large.jpg'
                                        }
                                    }
                                };

                                card.data.videoid = VideoService.embedIdFromVideoId('rumble', card.data.siteid);

                                return card;
                            }()),
                            {
                                id: 'rc-c99a6f4c6b4c54',
                                type: 'wildcard',
                                data: {}
                            },
                            mocks.playerCards.vine,
                            mocks.playerCards.instagram,
                            mocks.playerCards.vzaar,
                            mocks.playerCards.wistia,
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                modules: [],
                                data: {}
                            },
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
                            var imageCard = MiniReelService.createCard('image'),
                                videoCard = MiniReelService.createCard('video'),
                                videoBallotCard = MiniReelService.createCard('videoBallot'),
                                adCard = MiniReelService.createCard('ad'),
                                linksCard = MiniReelService.createCard('links'),
                                textCard = MiniReelService.createCard('text'),
                                recapCard = MiniReelService.createCard('recap');

                            expect(imageCard).toEqual({
                                id: jasmine.any(String),
                                type: 'image',
                                title: null,
                                note: null,
                                label: 'Image',
                                ad: false,
                                view: 'image',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    service: null,
                                    imageid: null
                                }
                            });

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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    skip: 'anytime',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: null,
                                    videoid: null,
                                    hostname: null,
                                    start: null,
                                    end: null,
                                    moat: null
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    skip: 'anytime',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: null,
                                    videoid: null,
                                    hostname: null,
                                    start: null,
                                    end: null,
                                    ballot: {
                                        prompt: null,
                                        choices: []
                                    },
                                    moat: null
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    links: []
                                }
                            });
                        });

                        it('should generate unique IDs for each card', function() {
                            var ids = [
                                MiniReelService.createCard('image'),
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    size: '300x250'
                                }
                            });
                        });

                        it('should support creating a wildcard card', function() {
                            var card = MiniReelService.createCard('wildcard');

                            expect(card).toEqual({
                                id: jasmine.any(String),
                                type: 'wildcard',
                                title: null,
                                note: null,
                                label: 'Sponsored Card Placeholder',
                                ad: false,
                                view: 'wildcard',
                                placementId: null,
                                templateUrl: null,
                                sponsored: true,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {}
                            });
                        });
                    });

                    describe('setCardType(card, type)', function() {
                        it('should change the type of a card to the specified type', function() {
                            var card = MiniReelService.createCard(),
                                id = card.id,
                                imageCard, videoCard, videoBallotCard, linksCard, displayAdCard, recapCard, wildcardCard;

                            function sameId(card) {
                                card.id = id;

                                return card;
                            }

                            imageCard = MiniReelService.setCardType(card, 'image');
                            expect(imageCard).toBe(card);
                            expect(imageCard).toEqual(sameId(MiniReelService.createCard('image')));

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

                            wildcardCard = MiniReelService.setCardType(card, 'wildcard');
                            expect(wildcardCard).toBe(card);
                            expect(wildcardCard).toEqual(sameId(MiniReelService.createCard('wildcard')));
                            wildcardCard.sponsored = false;

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
                                expect(result).toBe('//platform.staging.reelcontent.com/preview?' +
                                   'experience=' + encodeURIComponent(minireel.id)
                                );
                            });

                            it('should be the correct short url in production', function() {
                                c6Defines.kDebug = false;
                                result = MiniReelService.previewUrlOf(minireel);
                                expect(result).toBe('//reelcontent.com/preview?' +
                                   'experience=' + encodeURIComponent(minireel.id)
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
                            spyOn(VoteService, 'syncMiniReel').and
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
                            expect(VoteService.syncMiniReel).toHaveBeenCalledWith(minireel);
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

                    describe('convertCardForEditor(card)', function() {
                        var spy,
                            editorMR;

                        beforeEach(function() {
                            spy = jasmine.createSpy('spy()');

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(spy);
                            });
                            editorMR = spy.calls.mostRecent().args[0];
                        });

                        it('should convert cards for the editor individually', function() {
                            minireel.data.deck.filter(function(card) {
                                return card.type !== 'ad' && card.type !== 'recap';
                            }).forEach(function(card, index) {
                                var editorCard = editorMR.data.deck[index];
                                var spy = jasmine.createSpy('spy()');
                                var result;
                                $rootScope.$apply(function() {
                                    MiniReelService.convertCardForEditor(card).then(spy);
                                });
                                result = spy.calls.mostRecent().args[0];

                                expect(result).toEqual(editorCard);
                            });
                        });
                    });

                    describe('convertCardForPlayer(card, _minireel)', function() {
                        describe('when passed an article card', function() {
                            var editorArticleCard;

                            beforeEach(function() {
                                var card = minireel.data.deck[3];
                                var spy = jasmine.createSpy('spy()');
                                $rootScope.$apply(function() {
                                    MiniReelService.convertCardForEditor(card).then(spy);
                                });
                                editorArticleCard = spy.calls.mostRecent().args[0];
                                spyOn(OpenGraphService, 'getData');
                            });

                            function convertCardForPlayer(card) {
                                var spy = jasmine.createSpy('spy()');
                                $rootScope.$apply(function() {
                                    MiniReelService.convertCardForPlayer(card).then(spy);
                                });
                                return spy.calls.mostRecent().args[0];
                            }

                            it('should call on the OpenGraphService', function() {
                                OpenGraphService.getData.and.returnValue($q.when({}));
                                convertCardForPlayer(editorArticleCard);
                                expect(OpenGraphService.getData).toHaveBeenCalled();
                            });

                            describe('when no images are found by the OpenGraphService', function() {
                                beforeEach(function() {
                                    OpenGraphService.getData.and.returnValue($q.when({}));
                                });

                                it('should set data.thumbs to the correct value', function() {
                                    var result = convertCardForPlayer(editorArticleCard);
                                    expect(result.data.thumbs).toEqual({
                                        small: null,
                                        large: null
                                    });
                                });
                            });

                            describe('when the OpenGraphService returns an error', function() {
                                beforeEach(function() {
                                    OpenGraphService.getData.and.returnValue($q.reject({}));
                                });

                                it('should set data.thumbs to the correct value', function() {
                                    var result = convertCardForPlayer(editorArticleCard);
                                    expect(result.data.thumbs).toEqual({
                                        small: null,
                                        large: null
                                    });
                                });
                            });
                        });
                    });

                    describe('convertForEditor(minireel)', function() {
                        var spy,
                            result,
                            deck;

                        beforeEach(function() {
                            spy = jasmine.createSpy('spy()');
                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(spy);
                            });
                            result = spy.calls.mostRecent().args[0];

                            deck = result.data.deck;
                        });

                        describe('if it is missing a collateral hash or splash hash', function() {
                            beforeEach(function() {
                                delete minireel.data.collateral;
                                delete minireel.data.splash;

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForEditor(minireel).then(spy);
                                });
                                result = spy.calls.mostRecent().args[0];
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

                        describe('if it is missing a categories', function() {
                            beforeEach(function() {
                                delete minireel.categories;

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForEditor(minireel).then(spy);
                                });
                                result = spy.calls.mostRecent().args[0];
                            });

                            it('should create a default one', function() {
                                expect(result.categories).toEqual([]);
                            });
                        });

                        it('should support copying onto a provided object', function() {
                            var object = {
                                invalidProp: 'blah',
                                foo: 'bar'
                            };
                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel, object).then(spy);
                            });
                            var copied = spy.calls.mostRecent().args[0];

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
                                categories: ['foo', 'bar'],
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {}
                            });
                        });

                        it('should transpile the article card', function() {
                            expect(deck[3]).toEqual({
                                id: 'rc-b2d076ce052459',
                                type: 'article',
                                title: 'This is an article card!',
                                note: null,
                                label: 'Article',
                                ad: false,
                                view: 'article',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: 'images.somewhere.com/user_specified.jpg',
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    src: 'http://www.cinema6.com',
                                    thumbUrl: 'http://www.cinema6.com/og_logo.jpg'
                                }
                            });
                        });

                        it('should transpile the image card', function() {
                            expect(deck[1]).toEqual({
                                id: 'rc-6ce459b2052d07',
                                type: 'image',
                                title: 'This is an image card!',
                                note: 'Wow. What a spectacular card.',
                                label: 'Image',
                                ad: false,
                                view: 'image',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    service: 'flickr',
                                    imageid: '16767833635'
                                }
                            });
                        });

                        it('should transpile the vine card', function() {
                            expect(deck[17]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'vine',
                                    videoid: 'erUbKHDX6Ug',
                                    hostname: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null
                        	    },
                        	    id: 'rc-1ac904b814c8d6a20fea',
                        	    type: 'video',
                        	    title: 'Vine Card',
                        	    note: 'This is a Vine card.',
                        	    label: 'Video',
                        	    view: 'video',
                        	    ad: false,
                        	    placementId: null,
                        	    templateUrl: null,
                        	    sponsored: false,
                        	    campaign: {
                        	        campaignId: null,
                        	        advertiserId: null,
                        	        minViewTime: null,
                        	        countUrls: [],
                        	        clickUrls: []
                        	    },
                        	    collateral: {},
                        	    thumb: null,
                        	    links: {},
                                shareLinks: {},
                        	    params: {}
                            });
                        });

                        it('should transpile the instagram card', function() {
                            expect(deck[18]).toEqual({
                                id: 'rc-94028ed693fda7',
                                type: 'instagram',
                                title: 'Hey it\'s an Instagram Card!',
                                note: null,
                                label: 'Instagram',
                                thumb: 'https://user-specified.com/thumb.jpg',
                                ad: false,
                                view: 'instagram',
                                data: {
                                    id: '5YN6a0tOc-'
                                },
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {}
                            });
                        });

                        it('should transpile the vzaar card', function() {
                            expect(deck[19]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'vzaar',
                                    videoid: '1380051',
                                    hostname: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null
                        	    },
                        	    id: 'rc-16acda0e8302116df64d',
                        	    type: 'video',
                        	    title: 'Vzaar Card',
                        	    note: 'This is a Vzaar card.',
                        	    label: 'Video',
                        	    view: 'video',
                        	    ad: false,
                        	    placementId: null,
                        	    templateUrl: null,
                        	    sponsored: false,
                        	    campaign: {
                        	        campaignId: null,
                        	        advertiserId: null,
                        	        minViewTime: null,
                        	        countUrls: [],
                        	        clickUrls: []
                        	    },
                        	    collateral: {},
                        	    thumb: null,
                        	    links: {},
                                shareLinks: {},
                        	    params: {}
                            });
                        });

                        it('should transpile the wistia card', function() {
                            expect(deck[20]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'wistia',
                                    videoid: '9iqvphjp4u',
                                    hostname: 'cinema6.wistia.com',
                        	        start: null,
                        	        end: null,
                        	        moat: null
                        	    },
                        	    id: 'rc-5c404f4aedc7',
                        	    type: 'video',
                        	    title: 'Wistia Card',
                        	    note: 'This is a Wistia card.',
                        	    label: 'Video',
                        	    view: 'video',
                        	    ad: false,
                        	    placementId: null,
                        	    templateUrl: null,
                        	    sponsored: false,
                        	    campaign: {
                        	        campaignId: null,
                        	        advertiserId: null,
                        	        minViewTime: null,
                        	        countUrls: [],
                        	        clickUrls: []
                        	    },
                        	    collateral: {},
                        	    thumb: null,
                        	    links: {},
                                shareLinks: {},
                        	    params: {}
                            });
                        });

                        it('should transpile the various video cards into two cards', function() {
                            expect(deck[4]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    skip: 'anytime',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'youtube',
                                    videoid: '47tfg8734',
                                    hostname: null,
                                    start: 10,
                                    end: 40,
                                    moat: {
                                        campaign: 'Turtle Campaign',
                                        advertiser: 'Turtles, Inc.',
                                        creative: 'turtle_power'
                                    }
                                }
                            });

                            expect(deck[5]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    skip: 25,
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'vimeo',
                                    videoid: '48hfrei49',
                                    hostname: null,
                                    start: null,
                                    end: null,
                                    ballot: {
                                        prompt: 'Was it ugly?',
                                        choices: [
                                            'Really Ugly',
                                            'Not That Ugly'
                                        ]
                                    },
                                    moat: null
                                }
                            });

                            expect(deck[6]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    skip: 'never',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'dailymotion',
                                    videoid: 'vfu85f5',
                                    hostname: null,
                                    start: undefined,
                                    end: undefined,
                                    ballot: {
                                        prompt: 'How smart was it?',
                                        choices: [
                                            'Really Smart',
                                            'Pretty Stupid'
                                        ]
                                    },
                                    moat: null
                                }
                            });

                            expect(deck[7]).toEqual({
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
                                    minViewTime: 15,
                                    countUrls: ['http://dumbturtle.com/pixel?s=dumb'],
                                    clickUrls: ['//dumbturtle.com/anotherpixel?s=sodumb']
                                },
                                collateral: {
                                    logo: 'my-awesome-logo.png'
                                },
                                thumb: null,
                                links: {
                                    'Facebook': 'my-fb.html',
                                    'Website': 'awesome.com'
                                },
                                shareLinks: {
                                    facebook: "http://www.facebook.com/turtles",
                        	        twitter: "http://www.twitter.com/turtles",
                        	        pinterest: "http://www.pinterest.com/turtles"
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
                                    controls: false,
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
                                    hostname: null,
                                    start: 0,
                                    end: 40,
                                    moat: null
                                }
                            });

                            expect(deck[12]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                thumb: 'logo.jpg',
                                data: {
                                    skip: 'anytime',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'adUnit',
                                    videoid: JSON.stringify({
                                        vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                        vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                                    }),
                                    hostname: null,
                                    start: null,
                                    end: null,
                                    moat: {
                                        campaign: 'Turtle Campaign',
                                        advertiser: 'Turtles, Inc.',
                                        creative: 'turtle_power'
                                    }
                                }
                            });

                            expect(deck[13]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                thumb: null,
                                data: {
                                    skip: 'anytime',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'yahoo',
                                    videoid: 'teen-tries-drain-pond-lost-221030513',
                                    hostname: null,
                                    start: null,
                                    end: null,
                                    moat: null
                                }
                            });

                            expect(deck[14]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                thumb: null,
                                data: {
                                    skip: 'anytime',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'aol',
                                    videoid: 'arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876',
                                    hostname: null,
                                    start: null,
                                    end: null,
                                    moat: null
                                }
                            });

                            expect(deck[15]).toEqual({
                                id: 'rc-8142d1b5897b32',
                                type: 'video',
                                title: 'Rumble Card',
                                note: 'This is a Rumble card.',
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                thumb: null,
                                data: {
                                    skip: 'anytime',
                                    controls: true,
                                    autoplay: null,
                                    autoadvance: null,
                                    survey: null,
                                    service: 'rumble',
                                    videoid: 'v2z8ro-willie-perfoming-at-school-talent-show',
                                    hostname: null,
                                    start: null,
                                    end: null,
                                    moat: null
                                }
                            });
                        });

                        it('should transpile the links cards', function() {
                            expect(deck[10]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: minireel.data.deck[11].data
                            });

                            expect(deck[10].data.links).not.toBe(minireel.data.deck[11].data.links);
                        });

                        it('should not transpile the recap card', function() {
                            expect(deck.filter(function(card) {
                                return card.type === 'recap';
                            }).length).toEqual(0);
                        });

                        it('should transpile the displayAd cards', function() {
                            expect(deck[11]).toEqual({
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
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: 'logo.jpg',
                                links: {},
                                shareLinks: {},
                                params: {
                                    sponsor: 'Ubisoft'
                                },
                                data: {
                                    size: '300x250'
                                }
                            });
                        });

                        it('should transpile the wildcards', function() {
                            expect(deck[16]).toEqual({
                                id: 'rc-c99a6f4c6b4c54',
                                type: 'wildcard',
                                title: null,
                                note: null,
                                label: 'Sponsored Card Placeholder',
                                ad: false,
                                view: 'wildcard',
                                placementId: null,
                                templateUrl: null,
                                sponsored: true,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    clickUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {}
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
                                    categories: ['foo', 'bar'],
                                    data: jasmine.any(Object)
                                });

                                cinema6.db.create.calls.mostRecent().args[1].data.deck.forEach(function(card, index) {
                                    var original = angular.copy(minireel.data.deck[index]);

                                    expect(card.id).toMatch(/rc-[a-zA-Z0-9]{14}/);
                                    expect(card.id).not.toBe(original.id);

                                    expect(card).toEqual((function() {
                                        original.id = jasmine.any(String);

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
                                expect('election' in newModel.data.deck[8].ballot).toBe(false);
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
                                    appUri: 'mini-reel-player',
                                    categories: [],
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
                                        links: {},
                                        deck: []
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
                        var convertedSpy;
                        var resultSpy;
                        var thumbCache;

                        function MockThumb(small, large) {
                            var thumb = this;

                            this.small = null;
                            this.large = null;

                            this.ensureFulfillment = function() {
                                thumb.small = small;
                                thumb.large = large;
                                return $q.when(this);
                            };
                        }

                        beforeEach(function() {
                            convertedSpy = jasmine.createSpy('convertedSpy()');
                            resultSpy = jasmine.createSpy('resultSpy()');

                            thumbCache = {};

                            spyOn(CollateralUploadService, 'uploadFromUri').and.callFake(function(uri) {
                                return $q.when('collateral/12345.jpg');
                            });

                            spyOn(c6ImagePreloader, 'load').and.returnValue($q.when());

                            spyOn(ImageService, 'urlFromData').and.callFake(function(service, imageid) {
                                if(service === 'flickr' || service ==='getty') {
                                    return 'http://www.' + service + '.com/' + imageid;
                                } else {
                                    return imageid;
                                }
                            });

                            spyOn(ThumbnailService, 'getThumbsFor').and.callFake(function(service, id) {

                                var key = service + ':' + id;

                                if(service === 'flickr' || service === 'getty') {
                                    return thumbCache[key] || (thumbCache[key] = new MockThumb(
                                        'images.' + service + '.com/image/' + id + '/small.jpg',
                                        'images.' + service + '.com/image/' + id + '/large.jpg'
                                    ));
                                } else if(service === 'web' || service === 'instagram') {
                                    return thumbCache[key] || (thumbCache[key] = new MockThumb(
                                        'images.' + service + '.com/small.jpg',
                                        'images.' + service + '.com/large.jpg'
                                    ));
                                } else {
                                    return thumbCache[key] || (thumbCache[key] = new MockThumb(
                                        'images.' + service + '.com/video/' + id + '/small.jpg',
                                        'images.' + service + '.com/video/' + id + '/large.jpg'
                                    ));
                                }
                            });

                            spyOn(OpenGraphService, 'getData').and.callFake(function(articleUrl) {
                                return $q.when({
                                    images: [
                                        {
                                            value: articleUrl + '/og_logo.jpg'
                                        }
                                    ]
                                });
                            });

                            spyOn(InstagramService, 'getCardInfo').and.callFake(function(id) {
                                return $q.when({
                                    type: 'image',
                                    src: 'https://mock.instagram.com/image/' + id + '.jpg',
                                    href: 'https:\/\/instagram.com\/p\/5YN6a0tOc-\/',
                                    likes: '77606',
                                    date: '1438099887',
                                    caption: 'Solomon, Pembroke Welsh Corgi (12 w\/o), BarkFest 2015, Brooklyn, NY',
                                    comments: '9718',
                                    user: {
                                        fullname: 'The Dogist',
                                        picture: 'https:\/\/igcdn-photos-g-a.akamaihd.net\/hphotos-ak-xfa1\/t51.2885-19\/s150x150\/11382947_1023728481019302_1629502413_a.jpg',
                                        username: 'thedogist',
                                        follow: 'https://instagram.com/accounts/login/?next=%2Fp%2F5YN6a0tOc-%2F&source=follow',
                                        href: 'https://instagram.com/thedogist',
                                        bio: 'A photo-documentary series about the beauty of dogs. Author of THE DOGIST, coming October, 2015.',
                                        website: 'http:\/\/thedogist.com\/book',
                                        posts: '2884',
                                        followers: '1027481',
                                        following: '3'
                                    }
                                });
                            });
                        });

                        it('should convert back to the player format', function() {
                            var converted,
                                result;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            expect(Object.keys(result.data).length).toBe(Object.keys(minireel.data).length);

                            minireel.data.deck.forEach(function(card) {
                                if (card.type === 'ad') {
                                    card.id = jasmine.any(String);
                                }
                            });

                            // remove the recap card from both because they're filtered out and added back during conversion
                            delete result.data.deck[result.data.deck.length - 1];
                            delete minireel.data.deck[minireel.data.deck.length - 1];

                            expect(result.data).toEqual(minireel.data);
                            minireel.data.deck.forEach(function(card, index) {
                                expect(result.data.deck[index]).toEqual(card, card.id);
                            });
                            expect(result).not.toBe(minireel);
                        });

                        it('should add/remove displayAd modules on each card based on adConfig', function() {
                            var converted,
                                result;

                            minireel.data.adConfig.display.enabled = true;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            result.data.deck.forEach(function(card) {
                                if (!(/adUnit|article|image|instagram|text|links|displayAd|wildcard/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).not.toBe(-1);
                                } else if (card.type !== 'links') {
                                    expect((card.modules || []).indexOf('displayAd')).toBe(-1);
                                }
                            });

                            minireel.data.adConfig.display.enabled = false;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            result.data.deck.forEach(function(card) {
                                if ((!card.placementId && !(/ad|links/).test(card.type)) ||
                                    (/adUnit|text|displayAd/).test(card.type)) {
                                    expect((card.modules || []).indexOf('displayAd')).toBe(-1);
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
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            result.data.deck.forEach(function(card) {
                                if (!(/adUnit|article|image|instagram|text|links|displayAd|wildcard/).test(card.type)) {
                                    expect(card.modules.indexOf('displayAd')).not.toBe(-1);
                                } else if (card.type !== 'links') {
                                    expect((card.modules || []).indexOf('displayAd')).toBe(-1);
                                }
                            });

                            portal.cModel.org.adConfig = {
                                display: {
                                    enabled: false
                                }
                            };

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            result.data.deck.forEach(function(card) {
                                if ((!card.placementId && !(/ad|links/).test(card.type)) ||
                                    (/adUnit|text|displayAd/).test(card.type)) {
                                    expect((card.modules || []).indexOf('displayAd')).toBe(-1);
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
                                        minViewTime: null,
                                        countUrls: [],
                                        clickUrls: []
                                    },
                                    collateral: {},
                                    links: {},
                                    shareLinks: {},
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
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

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
                                        minViewTime: null,
                                        countUrls: [],
                                        clickUrls: []
                                    },
                                    collateral: {},
                                    links: {},
                                    shareLinks: {},
                                    params: {},
                                    data: {}
                                }
                            ];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(-1);

                            minireel.data.deck[0].placementId = 12345;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(0);

                            minireel.data.adConfig.display.enabled = false;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            expect(result.data.deck[0].modules.indexOf('displayAd')).toBe(0);
                        });

                        it('should support performing the conversion on a specified object', function() {
                            var converted,
                                result;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];
                            converted.data.deck[1].title = 'New Title';

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted, minireel).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            expect(result).toBe(minireel);
                            expect(result.data).not.toBe(converted.data);
                            expect(minireel.data.deck[1].title).toBe('New Title');
                        });

                        it('should transpile a adUnit card with no ad tags', function() {
                            var converted;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            converted = convertedSpy.calls.mostRecent().args[0];

                            converted.data.deck[11].data.videoid = null;

                            expect(function() {
                                MiniReelService.convertForPlayer(converted);
                            }).not.toThrow();
                        });

                        describe('setting the "ad" param', function() {
                            it('should be true if the card is sponsored and the ad param is not set', function() {
                                var converted, result,
                                    card = MiniReelService.createCard('video');

                                card.sponsored = true;

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForEditor(minireel).then(convertedSpy);
                                });
                                converted = convertedSpy.calls.mostRecent().args[0];

                                converted.data.deck = [card];

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForPlayer(converted).then(resultSpy);
                                });
                                result = resultSpy.calls.mostRecent().args[0];

                                expect(result.data.deck[0].params.ad).toBe(true);
                            });

                            it('should be true if the ad param is set to true', function() {
                                var converted, result,
                                    card = MiniReelService.createCard('video');

                                card.sponsored = true;
                                card.params.ad = true;

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForEditor(minireel).then(convertedSpy);
                                });
                                converted = convertedSpy.calls.mostRecent().args[0];

                                converted.data.deck = [card];

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForPlayer(converted).then(resultSpy);
                                });
                                result = resultSpy.calls.mostRecent().args[0];

                                expect(result.data.deck[0].params.ad).toBe(true);
                            });

                            it('should be false if the ad param is set to false', function() {
                                var converted, result,
                                    card = MiniReelService.createCard('video');

                                card.sponsored = true;
                                card.params.ad = false;

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForEditor(minireel).then(convertedSpy);
                                });
                                converted = convertedSpy.calls.mostRecent().args[0];

                                converted.data.deck = [card];

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForPlayer(converted).then(resultSpy);
                                });
                                result = resultSpy.calls.mostRecent().args[0];

                                expect(result.data.deck[0].params.ad).toBe(false);
                            });
                        });

                        it('should give the video in a single-video minireel the "post" module', function() {
                            var result;

                            $rootScope.$apply(function() {
                                MiniReelService.convertForEditor(minireel).then(convertedSpy);
                            });
                            var converted = convertedSpy.calls.mostRecent().args[0];

                            converted.data.deck = [MiniReelService.createCard('video')];

                            $rootScope.$apply(function() {
                                MiniReelService.convertForPlayer(converted).then(resultSpy);
                            });
                            result = resultSpy.calls.mostRecent().args[0];

                            expect(result.data.deck[0].modules).toContain('post');
                        });

                        describe('handling recap cards', function() {
                            var result, resultSpy, minireel;

                            beforeEach(function() {
                                resultSpy = jasmine.createSpy('resultSpy');
                                minireel = {
                                    data: {
                                        deck: []
                                    }
                                }
                            });

                            describe('when there is a recap card present in the minireel', function() {
                                describe('when the deck has more than one non-recap card', function() {
                                    it('should do nothing', function() {
                                        minireel.data.deck = [{},{},{},{},{type: 'recap'}];

                                        $rootScope.$apply(function() {
                                            MiniReelService.convertForPlayer(minireel).then(resultSpy);
                                        });
                                        result = resultSpy.calls.mostRecent().args[0];

                                        expect(result.data.deck.length).toBe(5);
                                        expect(result.data.deck[result.data.deck.length - 1].type).toBe('recap');
                                    });
                                });

                                describe('when the deck has less than 2 non-recap cards', function() {
                                    it('should remove the recap card from the deck', function() {
                                        minireel.data.deck = [{},{type: 'recap'}];

                                        $rootScope.$apply(function() {
                                            MiniReelService.convertForPlayer(minireel).then(resultSpy);
                                        });
                                        result = resultSpy.calls.mostRecent().args[0];

                                        expect(result.data.deck.length).toBe(1);
                                        expect(result.data.deck[result.data.deck.length - 1].type).not.toBe('recap');
                                    });
                                });
                            });

                            describe('when there is no recap present in the minireel', function() {
                                describe('when the deck has more than 1 card', function() {
                                    it('should add a recap card', function() {
                                        minireel.data.deck = [{},{},{},{}];

                                        $rootScope.$apply(function() {
                                            MiniReelService.convertForPlayer(minireel).then(resultSpy);
                                        });
                                        result = resultSpy.calls.mostRecent().args[0];

                                        expect(result.data.deck.length).toBe(5);
                                        expect(result.data.deck[result.data.deck.length - 1].type).toBe('recap');
                                    });
                                });

                                describe('when there are less than 2 cards', function() {
                                    it('should do nothing', function() {
                                        minireel.data.deck = [{}];

                                        $rootScope.$apply(function() {
                                            MiniReelService.convertForPlayer(minireel).then(resultSpy);
                                        });
                                        result = resultSpy.calls.mostRecent().args[0];

                                        expect(result.data.deck.length).toBe(1);
                                        expect(result.data.deck[result.data.deck.length - 1].type).not.toBe('recap');
                                    });
                                });
                            });
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

                    describe('getSkipValue(skipString)', function() {
                        describe('if passed "anytime"', function() {
                            it('should return true', function() {
                                expect(MiniReelService.getSkipValue('anytime')).toBe(true);
                            });
                        });

                        describe('if passed "never"', function() {
                            it('should return false', function() {
                                expect(MiniReelService.getSkipValue('never')).toBe(false);
                            });
                        });

                        describe('if passed "delay"', function() {
                            it('should return 6', function() {
                                expect(MiniReelService.getSkipValue('delay')).toBe(6);
                            });
                        });

                        describe('if passed something else', function() {
                            it('should return the value', function() {
                                expect(MiniReelService.getSkipValue(10)).toBe(10);
                            });
                        });
                    });
                });
            });
        });
    });
}());
