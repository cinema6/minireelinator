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
                MiniReelState,
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

                MiniReelState = c6State.get('MiniReel');
                MiniReelState.cModel = {
                    data: {
                        modes: [
                            {
                                value: 'lightbox',
                                modes: [
                                    {
                                        value: 'lightbox-playlist',
                                        deprecated: true,
                                        replacement: 'light'
                                    },
                                    {
                                        value: 'lightbox'
                                    }
                                ]
                            },
                            {
                                value: 'inline',
                                modes: [
                                    {
                                        value: 'full',
                                        deprecated: true
                                    },
                                    {
                                        value: 'solo'
                                    },
                                    {
                                        value: 'light'
                                    }
                                ]
                            }
                        ]
                    }
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
                                playUrls: []
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
                                },
                                duration: 6
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
                                    small: 'images.instagram.com/5YN6a0tOc-/small.jpg',
                                    large: 'images.instagram.com/5YN6a0tOc-/large.jpg'
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
                                duration: -1
                            },
                            placementId: null,
                            templateUrl: null,
                            sponsored: false,
                            campaign: {
                                campaignId: null,
                                advertiserId: null,
                                minViewTime: null,
                                countUrls: [],
                                playUrls: []
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
                                playUrls: []
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
                                    small: 'small.jpg',
                                    large: 'large.jpg'
                                },
                                duration: 25
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
                                playUrls: []
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
                                    small: 'small.jpg',
                                    large: 'large.jpg'
                                },
                                duration: 45
                            }
                        },
                        jwplayer: {
                            id: 'rc-6f4aebc424f3',
                            type: 'jwplayer',
                            title: 'JWPlayer Card',
                            note: 'This is a JWPlayer card, gaze at its wonder.',
                            source: 'JWPlayer',
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
                                service: 'jwplayer',
                                videoid: 'iGznZrKK-n5DiyUyn',
                                href: 'https://content.jwplatform.com/previews/iGznZrKK-n5DiyUyn',
                                thumbs: {
                                    small: 'small.jpg',
                                    large: 'large.jpg'
                                },
                                duration: 50
                            }
                        },
                        vidyard: {
                            id: 'rc-e2218c73ff11',
                            type: 'vidyard',
                            title: 'Vidyard Card',
                            note: 'Such Card, Very Vidyard',
                            source: 'Vidyard',
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
                                service: 'vidyard',
                                videoid: 'GFOy4oZge52L_NOwT2mwkw',
                                href: 'http://embed.vidyard.com/share/GFOy4oZge52L_NOwT2mwkw',
                                thumbs: {
                                    small: 'images.vidyard.com/video/GFOy4oZge52L_NOwT2mwkw/small.jpg',
                                    large: 'images.vidyard.com/video/GFOy4oZge52L_NOwT2mwkw/large.jpg'
                                },
                                duration: 52
                            }
                        },
                        instagramVideo: {
                            id: 'rc-e3149227e70468',
                            type: 'htmlvideo',
                            title: 'Insanely Instagram',
                            note: 'This is an example of a video-only Instagram card.',
                            source: 'Instagram',
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
                                videoid: 'https://mock-instagram-cdn/-zNcg8AtYy.mp4',
                                href: 'https://instagram.com/p/-zNcg8AtYy',
                                thumbs: {
                                    small: 'images.instagram.com/-zNcg8AtYy/small.jpg',
                                    large: 'images.instagram.com/-zNcg8AtYy/large.jpg'
                                },
                                duration: 22
                            }
                        },
                        brightcove: {
                            id: 'rc-d6ec871ceb105e',
                            type: 'brightcove',
                            title: 'Brightcove Card',
                            note: 'Brrrr Brightcove',
                            source: 'Brightcove',
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
                                service: 'brightcove',
                                videoid: '4655415742001',
                                embedid: 'default',
                                playerid: '71cf5be9-7515-44d8-bb99-29ddc6224ff8',
                                accountid: '4652941506001',
                                href: 'https://players.brightcove.net/4652941506001/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=4655415742001',
                                thumbs: {
                                    small: 'images.brightcove.com/video/4655415742001/small.jpg',
                                    large: 'images.brightcove.com/video/4655415742001/large.jpg'
                                },
                                duration: 48
                            }
                        },
                        kaltura: {
                            id: 'rc-3739123c133da1',
                            type: 'kaltura',
                            title: 'Kaltura Card',
                            note: 'Krazy Kool Kaltura',
                            source: 'Kaltura',
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
                                service: 'kaltura',
                                videoid: '1_dsup2iqd',
                                playerid: '32334692',
                                partnerid: '2054981',
                                href: 'https://www.kaltura.com/index.php/extwidget/preview/partner_id/2054981/uiconf_id/32334692/entry_id/1_dsup2iqd/embed/iframe',
                                thumbs: {
                                    small: 'images.kaltura.com/video/1_dsup2iqd/small.jpg',
                                    large: 'images.kaltura.com/video/1_dsup2iqd/large.jpg'
                                },
                                duration: 68
                            }
                        },
                        facebook: {
                            id: 'rc-b0ccf8ea5753',
                            type: 'facebook',
                            title: 'Facebook Card',
                            note: 'Fantastic Facebook',
                            source: 'Facebook',
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
                                service: 'facebook',
                                videoid: 'https://www.facebook.com/Google/videos/10154011581287838',
                                href: 'https://www.facebook.com/Google/videos/10154011581287838',
                                thumbs: {
                                    small: 'small.jpg',
                                    large: 'large.jpg'
                                },
                                duration: 68
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    playUrls: []
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
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    },
                                    moat: {
                                        campaign: 'Turtle Campaign',
                                        advertiser: 'Turtles, Inc.',
                                        creative: 'turtle_power'
                                    },
                                    duration: 58
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
                                    playUrls: []
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
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    },
                                    duration: 78
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
                                    playUrls: []
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
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    },
                                    duration: 89
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
                                    playUrls: ['//dumbturtle.com/anotherpixel?s=sodumb']
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
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    },
                                    duration: 46
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
                                    playUrls: []
                                },
                                thumbs: null,
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {
                                    controls: true,
                                    skip: true
                                }
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
                                    playUrls: []
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
                                data: {
                                    controls: true,
                                    skip: true
                                }
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    },
                                    duration: 30
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
                                        playUrls: []
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
                                        },
                                        duration: 76
                                    }
                                };

                                card.data.code = 'teen-tries-drain-pond-lost-221030513';

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
                                        playUrls: []
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
                                        },
                                        duration: 37
                                    }
                                };

                                card.data.code = 'arrests-made-in-hit-and-run-that-killed-3-teens-on-halloween-518494876';

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
                                        playUrls: []
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
                                        },
                                        duration: 28
                                    }
                                };

                                card.data.videoid = 'v2z8ro';

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
                            mocks.playerCards.jwplayer,
                            mocks.playerCards.vidyard,
                            mocks.playerCards.instagramVideo,
                            mocks.playerCards.brightcove,
                            mocks.playerCards.kaltura,
                            mocks.playerCards.facebook,
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
                                    playUrls: []
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

            afterAll(function() {
                MiniReelService = null;
                VoteService = null;
                CollateralUploadService = null;
                ThumbnailService = null;
                OpenGraphService = null;
                SettingsService = null;
                ImageService = null;
                InstagramService = null;
                VideoService = null;
                $rootScope = null;
                c6UrlParser = null;
                c6ImagePreloader = null;
                cinema6 = null;
                c6State = null;
                portal = null;
                MiniReelState = null;
                mocks = null;
                $q = null;
                minireel = null;
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

                        it('should lookup the categories on the MiniReel state if no categories are passed', function() {
                            expect(result({ data: { mode: 'lightbox' } })).toBe(MiniReelState.cModel.data.modes[0]);
                            expect(result({ data: { mode: 'lightbox-playlist' } })).toBe(MiniReelState.cModel.data.modes[0]);
                            expect(result({ data: { mode: 'light' } })).toBe(MiniReelState.cModel.data.modes[1]);
                            expect(result({ data: { mode: 'full' } })).toBe(MiniReelState.cModel.data.modes[1]);
                        });

                        it('should return the category of the minireel\'s mode', function() {
                            expect(result({ data: { mode: 'lightbox' } }, categories)).toBe(categories[0]);
                            expect(result({ data: { mode: 'lightbox-ads' } }, categories)).toBe(categories[0]);
                            expect(result({ data: { mode: 'light' } }, categories)).toBe(categories[1]);
                            expect(result({ data: { mode: 'full' } }, categories)).toBe(categories[1]);
                        });

                        describe('if the MiniReelState has no model', function() {
                            beforeEach(function() {
                                delete MiniReelState.cModel;
                            });

                            it('should return an empty object if something falsy is passed in', function() {
                                expect(result()).toEqual({});
                            });
                        });
                    });

                    describe('modeDataOf(minireel, categories)', function() {
                        var categories;

                        function result() {
                            return MiniReelService.modeDataOf.apply(MiniReelService, arguments);
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

                        it('should return undefined something falsy is passed in', function() {
                            expect(result()).toBeUndefined();
                        });

                        it('should return undefined if a mode with no category is passed in', function() {
                            expect(result({ data: { mode: 'foo' } }, categories)).toBeUndefined();
                        });

                        it('should lookup the data on the MiniReel state if no categories are passed', function() {
                            expect(result({ data: { mode: 'lightbox-playlist' } })).toBe(MiniReelState.cModel.data.modes[0].modes[0]);
                            expect(result({ data: { mode: 'lightbox' } })).toBe(MiniReelState.cModel.data.modes[0].modes[1]);
                            expect(result({ data: { mode: 'full' } })).toBe(MiniReelState.cModel.data.modes[1].modes[0]);
                            expect(result({ data: { mode: 'light' } })).toBe(MiniReelState.cModel.data.modes[1].modes[2]);
                        });

                        it('should return the data of the minireel\'s mode', function() {
                            expect(result({ data: { mode: 'lightbox' } }, categories)).toBe(categories[0].modes[0]);
                            expect(result({ data: { mode: 'lightbox-ads' } }, categories)).toBe(categories[0].modes[1]);
                            expect(result({ data: { mode: 'light' } }, categories)).toBe(categories[1].modes[0]);
                            expect(result({ data: { mode: 'full' } }, categories)).toBe(categories[1].modes[1]);
                        });

                        describe('if the MiniReelState has no model', function() {
                            beforeEach(function() {
                                delete MiniReelState.cModel;
                            });

                            it('should return undefined something falsy is passed in', function() {
                                expect(result()).toBeUndefined();
                            });
                        });
                    });

                    describe('createCard(type)', function() {
                        it('should create a new card based on the type provided', function() {
                            var imageCard = MiniReelService.createCard('image'),
                                videoCard = MiniReelService.createCard('video'),
                                adCard = MiniReelService.createCard('ad'),
                                linksCard = MiniReelService.createCard('links'),
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                                    start: null,
                                    end: null,
                                    moat: null,
                                    duration: undefined,
                                    thumbs: undefined
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    playUrls: []
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
                                    playUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: {}
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
                                    playUrls: []
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
                                imageCard, videoCard, videoBallotCard, linksCard, recapCard, wildcardCard;

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

                            wildcardCard = MiniReelService.setCardType(card, 'wildcard');
                            expect(wildcardCard).toBe(card);
                            expect(wildcardCard).toEqual(sameId(MiniReelService.createCard('wildcard')));
                            wildcardCard.sponsored = false;

                            linksCard = MiniReelService.setCardType(card, 'links');
                            expect(linksCard).toBe(card);
                            expect(linksCard).toEqual(sameId(MiniReelService.createCard('links')));

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
                                expect(result).toBe('//platform-staging.reelcontent.com/preview?' +
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
                                return card.type !== 'ad' &&
                                    card.type !== 'recap' &&
                                    card.type !== 'displayAd' &&
                                    card.type !== 'text' &&
                                    card.type !== 'article' &&
                                    card.type !== 'rumble' &&
                                    card.type !== 'embedded';
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
                        it('should protect some data properties even when no video service is found', function() {
                            var card = MiniReelService.createCard('video'),
                                spy = jasmine.createSpy('spy()'),
                                convertedCard;

                            card.data = {
                                autoadvance: false,
                                autoplay: true,
                                controls: true,
                                skip: 30,
                                moat: {
                                    advertiser: 'a-123'
                                }
                            };

                            $rootScope.$apply(function() {
                                MiniReelService.convertCardForPlayer(card).then(spy);
                            });

                            convertedCard = spy.calls.mostRecent().args[0];

                            expect(convertedCard.data).toEqual(card.data);
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

                        describe('if an unknown mode is passed in', function() {
                            beforeEach(function() {
                                spy.calls.reset();

                                minireel.data.mode = 'jfhdks';

                                $rootScope.$apply(function() {
                                    MiniReelService.convertForEditor(minireel).then(spy);
                                });
                                result = spy.calls.mostRecent().args[0];
                            });

                            it('should make the result mode the org default', function() {
                                expect(result.data.mode).toBe(SettingsService.getReadOnly('MR::org').minireelDefaults.mode);
                            });
                        });

                        describe('if a deprecated mode is passed in', function() {
                            beforeEach(function() {
                                spy.calls.reset();
                            });

                            describe('with a replacement', function() {
                                beforeEach(function() {
                                    minireel.data.mode = 'lightbox-playlist';

                                    $rootScope.$apply(function() {
                                        MiniReelService.convertForEditor(minireel).then(spy);
                                    });
                                    result = spy.calls.mostRecent().args[0];
                                });

                                it('should set the mode to the replacement', function() {
                                    expect(result.data.mode).toBe('light');
                                });
                            });

                            describe('without a replacement', function() {
                                beforeEach(function() {
                                    minireel.data.mode = 'full';

                                    $rootScope.$apply(function() {
                                        MiniReelService.convertForEditor(minireel).then(spy);
                                    });
                                    result = spy.calls.mostRecent().args[0];
                                });

                                it('should set the mode to the first non-deprecated mode in that category', function() {
                                    expect(result.data.mode).toBe('solo');
                                });
                            });
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

                        it('should not transpile the text card', function() {
                            expect(deck.filter(function(card) {
                                return card.type === 'text';
                            }).length).toEqual(0);
                        });

                        it('should not transpile the article card', function() {
                            expect(deck.filter(function(card) {
                                return card.type === 'article';
                            }).length).toEqual(0);
                        });

                        it('should transpile the image card', function() {
                            expect(deck[0]).toEqual({
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
                                    playUrls: []
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
                            expect(deck[11]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'vine',
                                    videoid: 'erUbKHDX6Ug',
                                    hostname: null,
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 6,
                                    thumbs: {
                                        small: 'images.vine.com/video/erUbKHDX6Ug/small.jpg',
                        	            large: 'images.vine.com/video/erUbKHDX6Ug/large.jpg'                                    }
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
                        	        playUrls: []
                        	    },
                        	    collateral: {},
                        	    thumb: null,
                        	    links: {},
                                shareLinks: {},
                        	    params: {}
                            });
                        });

                        it('should transpile the instagram card', function() {
                            expect(deck[12]).toEqual({
                                id: 'rc-94028ed693fda7',
                                type: 'instagram',
                                title: 'Hey it\'s an Instagram Card!',
                                note: null,
                                label: 'Instagram',
                                thumb: 'https://user-specified.com/thumb.jpg',
                                ad: false,
                                view: 'instagram',
                                data: {
                                    id: '5YN6a0tOc-',
                                    duration: -1
                                },
                                placementId: null,
                                templateUrl: null,
                                sponsored: false,
                                campaign: {
                                    campaignId: null,
                                    advertiserId: null,
                                    minViewTime: null,
                                    countUrls: [],
                                    playUrls: []
                                },
                                collateral: {},
                                links: {},
                                shareLinks: {},
                                params: {}
                            });
                        });

                        it('should transpile the vzaar card', function() {
                            expect(deck[13]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'vzaar',
                                    videoid: '1380051',
                                    hostname: null,
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 25,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
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
                        	        playUrls: []
                        	    },
                        	    collateral: {},
                        	    thumb: null,
                        	    links: {},
                                shareLinks: {},
                        	    params: {}
                            });
                        });

                        it('should transpile the wistia card', function() {
                            expect(deck[14]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'wistia',
                                    videoid: '9iqvphjp4u',
                                    hostname: 'cinema6.wistia.com',
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 45,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
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
                        	        playUrls: []
                        	    },
                        	    collateral: {},
                        	    thumb: null,
                        	    links: {},
                                shareLinks: {},
                        	    params: {}
                            });
                        });

                        it('should transpile the jwplayer card', function() {
                            expect(deck[15]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'jwplayer',
                                    videoid: 'iGznZrKK-n5DiyUyn',
                                    hostname: null,
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 50,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                        	    },
                        	    id: 'rc-6f4aebc424f3',
                        	    type: 'video',
                        	    title: 'JWPlayer Card',
                        	    note: 'This is a JWPlayer card, gaze at its wonder.',
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

                        it('should transpile the vidyard card', function() {
                            expect(deck[16]).toEqual({
                                data: {
                        	       skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'vidyard',
                                    videoid: 'GFOy4oZge52L_NOwT2mwkw',
                                    hostname: null,
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 52,
                                    thumbs: {
                                        small: 'images.vidyard.com/video/GFOy4oZge52L_NOwT2mwkw/small.jpg',
                          	            large: 'images.vidyard.com/video/GFOy4oZge52L_NOwT2mwkw/large.jpg'
                                    }
                        	    },
                        	    id: 'rc-e2218c73ff11',
                        	    type: 'video',
                        	    title: 'Vidyard Card',
                        	    note: 'Such Card, Very Vidyard',
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

                        it('should transpile the instagram-video card', function() {
                            expect(deck[17]).toEqual({
                                data: {
                        	        skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'instagram',
                                    videoid: '-zNcg8AtYy',
                                    hostname: null,
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 22,
                                    thumbs: {
                                        small: 'images.instagram.com/-zNcg8AtYy/small.jpg',
                        	            large: 'images.instagram.com/-zNcg8AtYy/large.jpg'
                                    }
                        	    },
                        	    id: 'rc-e3149227e70468',
                        	    type: 'video',
                        	    title: 'Insanely Instagram',
                        	    note: 'This is an example of a video-only Instagram card.',
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

                        it('should transpile the brightcove card', function() {
                            expect(deck[18]).toEqual({
                                data: {
                        	        skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'brightcove',
                                    videoid: '4655415742001',
                                    hostname: null,
                                    playerid: '71cf5be9-7515-44d8-bb99-29ddc6224ff8',
                                    accountid: '4652941506001',
                                    partnerid: null,
                                    embedid: 'default',
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 48,
                                    thumbs: {
                                        small: 'images.brightcove.com/video/4655415742001/small.jpg',
                        	            large: 'images.brightcove.com/video/4655415742001/large.jpg'
                                    }
                        	    },
                        	    id: 'rc-d6ec871ceb105e',
                        	    type: 'video',
                        	    title: 'Brightcove Card',
                        	    note: 'Brrrr Brightcove',
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

                        it('should transpile the kaltura card', function() {
                            expect(deck[19]).toEqual({
                                data: {
                        	        skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'kaltura',
                                    videoid: '1_dsup2iqd',
                                    hostname: null,
                                    playerid: '32334692',
                                    accountid: null,
                                    partnerid: '2054981',
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 68,
                                    thumbs: {
                                        small: 'images.kaltura.com/video/1_dsup2iqd/small.jpg',
                        	            large: 'images.kaltura.com/video/1_dsup2iqd/large.jpg'
                                    }
                        	    },
                        	    id: 'rc-3739123c133da1',
                        	    type: 'video',
                                title: 'Kaltura Card',
                                note: 'Krazy Kool Kaltura',
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

                        it('should transpile the facebook card', function() {
                            expect(deck[20]).toEqual({
                                data: {
                        	        skip: 'anytime',
                        	        controls: true,
                        	        autoplay: null,
                        	        autoadvance: null,
                        	        survey: null,
                        	        service: 'facebook',
                                    videoid: 'https://www.facebook.com/Google/videos/10154011581287838',
                                    hostname: null,
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                        	        start: null,
                        	        end: null,
                        	        moat: null,
                                    duration: 68,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                        	    },
                        	    id: 'rc-b0ccf8ea5753',
                        	    type: 'video',
                                title: 'Facebook Card',
                                note: 'Fantastic Facebook',
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
                            expect(deck[2]).toEqual({
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
                                    playUrls: []
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
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                                    start: 10,
                                    end: 40,
                                    moat: {
                                        campaign: 'Turtle Campaign',
                                        advertiser: 'Turtles, Inc.',
                                        creative: 'turtle_power'
                                    },
                                    duration: 58,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                                }
                            });

                            expect(deck[3]).toEqual({
                                id: 'rc-17721b74ce2584',
                                type: 'video',
                                title: 'The Ugliest Turtle',
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
                                    playUrls: []
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
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                                    start: null,
                                    end: null,
                                    moat: null,
                                    duration: 78,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                                }
                            });

                            expect(deck[4]).toEqual({
                                id: 'rc-61fa9683714e13',
                                type: 'video',
                                title: 'The Smartest Turtle',
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
                                    playUrls: []
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
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                                    start: undefined,
                                    end: undefined,
                                    moat: null,
                                    duration: 89,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                                }
                            });

                            expect(deck[5]).toEqual({
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
                                    playUrls: ['//dumbturtle.com/anotherpixel?s=sodumb']
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
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                                    start: 0,
                                    end: 40,
                                    moat: null,
                                    duration: 46,
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                                }
                            });

                            expect(deck[9]).toEqual({
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
                                    playUrls: []
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
                                    playerid: null,
                                    accountid: null,
                                    partnerid: null,
                                    embedid: null,
                                    start: null,
                                    end: null,
                                    moat: {
                                        campaign: 'Turtle Campaign',
                                        advertiser: 'Turtles, Inc.',
                                        creative: 'turtle_power'
                                    },
                                    duration: 30,
                                    thumbs: undefined
                                }
                            });
                        });

                        it('should transpile the links cards', function() {
                            expect(deck[8]).toEqual({
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
                                    playUrls: []
                                },
                                collateral: {},
                                thumb: null,
                                links: {},
                                shareLinks: {},
                                params: {},
                                data: minireel.data.deck[11].data
                            });

                            expect(deck[9].data.links).not.toBe(minireel.data.deck[11].data.links);
                        });

                        it('should not transpile the rumble cards', function() {
                            expect(deck.filter(function(card) {
                                return card.data.service === 'rumble';
                            }).length).toEqual(0);
                        });

                        it('should not transpile the aol cards', function() {
                            expect(deck.filter(function(card) {
                                return card.data.service === 'aol';
                            }).length).toEqual(0);
                        });

                        it('should not transpile the aol cards', function() {
                            expect(deck.filter(function(card) {
                                return card.data.service === 'yahoo';
                            }).length).toEqual(0);
                        });

                        it('should not transpile the recap card', function() {
                            expect(deck.filter(function(card) {
                                return card.type === 'recap';
                            }).length).toEqual(0);
                        });

                        it('should not transpile the displayAd cards', function() {
                            expect(deck.filter(function(card) {
                                return card.type === 'displayAd';
                            }).length).toEqual(0);
                        });

                        it('should transpile the wildcards', function() {
                            expect(deck[10]).toEqual({
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
                                    playUrls: []
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

                            it('should support apps without a user', function() {
                                portal.cModel = null;
                                $rootScope.$apply(function() {
                                    result = MiniReelService.create();
                                });
                                expect(cinema6.db.create).toHaveBeenCalledWith('experience', {
                                    type: 'minireel',
                                    org: undefined,
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
                                        'images.' + service + '.com/' + id + '/small.jpg',
                                        'images.' + service + '.com/' + id + '/large.jpg'
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

                            spyOn(InstagramService, 'getEmbedInfo').and.callFake(function(id) {
                                return $q.when({
                                    src: 'https://mock-instagram-cdn/' + id + '.mp4'
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

                            // remove the aol, yahoo, rumble, article, ad, displayAd, text and recap cards from the original as they will be trimmed out
                            minireel.data.deck = minireel.data.deck.filter(function(card) {
                                return !(/^(text|displayAd|recap|ad|article|rumble|embedded)$/).test(card.type);
                            });

                            minireel.data.deck.forEach(function(card, index) {
                                // The ballot module is deprecated so it will be filtered out on
                                // conversion.
                                if (card.type === 'videoBallot') { card.type = 'video'; }
                                if (card.modules) {
                                    if (card.modules.indexOf('ballot') > -1) { delete card.ballot; }
                                    card.modules = card.modules.filter(function(module) {
                                        return !(/^(ballot|displayAd)$/).test(module);
                                    });
                                }

                                expect(result.data.deck[index]).toEqual(card, card.id);
                            });
                            expect(result).not.toBe(minireel);

                            minireel.data.deck = jasmine.any(Array);
                            expect(result.data).toEqual(minireel.data);
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

                            converted.data.deck[10].data.videoid = null;

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
