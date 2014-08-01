(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var copy = angular.copy;

        describe('MiniReelService', function() {
            var MiniReelService,
                VoteService,
                CollateralService,
                VideoThumbnailService,
                SettingsService,
                $rootScope,
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
                    c6State = $injector.get('c6State');
                });

                SettingsService.register('MR::user', {
                    defaultSplash: {
                        ratio: '3-2',
                        theme: 'img-text-overlay'
                    }
                }, {
                    localSync: false
                });

                portal = c6State.get('Portal');
                portal.cModel = {
                    id: 'u-5b67ee6000ce6f',
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
                        displayAdSource: 'cinema6',
                        videoAdSource: 'cinema6-publisher',
                        videoAdSkip: true,
                        autoplay: true,
                        election: 'el-76506623bf22d9',
                        branding: 'elitedaily',
                        splash: {
                            source: 'specified',
                            ratio: '3-2',
                            theme: 'vertical-stack'
                        },
                        collateral: {
                            splash: 'splash.jpg'
                        },
                        deck: [
                            {
                                id: 'rc-9de889d3002d03',
                                type: 'text',
                                title: 'This is my MiniReel',
                                note: 'Hello. This is an intro.',
                                displayAdSource: 'cinema6',
                                modules: [],
                                data: {},
                            },
                            {
                                id: 'rc-c9cf24e87307ac',
                                type: 'youtube',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
                                source: 'YouTube',
                                displayAdSource: 'cinema6',
                                modules: [],
                                data: {
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
                                displayAdSource: 'cinema6',
                                ballot: {
                                    prompt: 'Was it ugly?',
                                    choices: [
                                        'Really Ugly',
                                        'Not That Ugly'
                                    ]
                                },
                                data: {
                                    videoid: '48hfrei49'
                                }
                            },
                            {
                                id: 'rc-1c7a46097a5d4a',
                                type: 'ad',
                                ad: true,
                                modules: ['displayAd'],
                                displayAdSource: 'cinema6',
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
                                displayAdSource: 'cinema6',
                                ballot: {
                                    prompt: 'How smart was it?',
                                    choices: [
                                        'Really Smart',
                                        'Pretty Stupid'
                                    ]
                                },
                                data: {
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
                                modules: [],
                                displayAdSource: 'cinema6',
                                data: {
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
                                displayAdSource: 'cinema6',
                                data: {}
                            },
                            {
                                id: 'rc-d98fad7e413692',
                                type: 'videoBallot',
                                title: 'Vote on nothing!',
                                note: 'Pretty meta, right?',
                                modules: ['ballot'],
                                displayAdSource: 'cinema6',
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
                                displayAdSource: 'cinema6',
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
                                displayAdSource: 'cinema6',
                                modules: [],
                                data: {}
                            }
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
                                textCard = MiniReelService.createCard('text');

                            expect(videoCard).toEqual({
                                id: jasmine.any(String),
                                type: 'video',
                                title: null,
                                note: null,
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                displayAdSource: null,
                                data: {
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
                                displayAdSource: null,
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
                                displayAdSource: null,
                                data: {
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
                                displayAdSource: null,
                                data: {
                                    autoplay: true,
                                    source: null,
                                    skip: 'anytime'
                                }
                            });

                            expect(linksCard).toEqual({
                                id: jasmine.any(String),
                                type: 'links',
                                title: null,
                                note: null,
                                label: 'Suggested Links',
                                ad: false,
                                view: 'links',
                                displayAdSource: null,
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
                                displayAdSource: null,
                                data: {}
                            });
                        });
                    });

                    describe('setCardType(card, type)', function() {
                        it('should change the type of a card to the specified type', function() {
                            var card = MiniReelService.createCard(),
                                id = card.id,
                                videoCard, videoBallotCard, adCard, linksCard;

                            videoCard = MiniReelService.setCardType(card, 'video');
                            expect(videoCard).toBe(card);
                            expect(videoCard).toEqual({
                                id: id,
                                type: 'video',
                                title: null,
                                note: null,
                                label: 'Video',
                                view: 'video',
                                ad: false,
                                displayAdSource: null,
                                data: {
                                    service: null,
                                    videoid: null,
                                    start: null,
                                    end: null
                                }
                            });

                            videoCard.data.service = 'youtube';
                            videoCard.data.videoid = '12345';
                            videoCard.data.start = 10;
                            videoCard.data.end = 45;

                            videoBallotCard = MiniReelService.setCardType(card, 'videoBallot');
                            expect(videoBallotCard).toBe(card);
                            expect(videoBallotCard).toEqual({
                                id: id,
                                type: 'videoBallot',
                                title: null,
                                note: null,
                                label: 'Video + Questionnaire',
                                view: 'video',
                                ad: false,
                                displayAdSource: null,
                                data: {
                                    service: 'youtube',
                                    videoid: '12345',
                                    start: 10,
                                    end: 45,
                                    ballot: {
                                        prompt: null,
                                        choices: []
                                    }
                                }
                            });

                            adCard = MiniReelService.setCardType(card, 'ad');
                            expect(adCard).toBe(card);
                            expect(adCard).toEqual({
                                id: id,
                                type: 'ad',
                                title: 'Advertisement',
                                note: null,
                                label: 'Advertisement',
                                view: 'ad',
                                ad: true,
                                displayAdSource: null,
                                data: {
                                    autoplay: true,
                                    source: null,
                                    skip: 'anytime'
                                }
                            });

                            linksCard = MiniReelService.setCardType(card, 'links');
                            expect(linksCard).toBe(card);
                            expect(linksCard).toEqual({
                                id: id,
                                type: 'links',
                                title: 'Advertisement', // this is a result of the default ad title being set
                                note: null,
                                label: 'Suggested Links',
                                view: 'links',
                                ad: false,
                                displayAdSource: null,
                                data: {
                                    links: []
                                }
                            });
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

                    describe('previewParamsOf(minireel)', function() {
                        var result;

                        beforeEach(function() {
                            result = MiniReelService.previewParamsOf(minireel);
                        });

                        it('should be the MR embed properties as query parameters', function() {
                            expect(result).toBe(
                                'preload&exp=' + encodeURIComponent(minireel.id) +
                                '&title=' + encodeURIComponent(minireel.data.title) +
                                '&splash=' + encodeURIComponent('vertical-stack:3/2') +
                                '&branding=' + encodeURIComponent(minireel.data.branding)
                            );
                        });
                    });

                    describe('publish(minireel)', function() {
                        var result,
                            success,
                            saveDeferred,
                            updateVoteDeferred;

                        beforeEach(function() {
                            saveDeferred = $q.defer();
                            updateVoteDeferred = $q.defer();
                            success = jasmine.createSpy('success');
                            spyOn(VoteService, 'update').and
                                .returnValue(updateVoteDeferred.promise);

                            spyOn(minireel, 'save').and.returnValue(saveDeferred.promise);

                            $rootScope.$apply(function() {
                                result = MiniReelService.publish(minireel).then(success);
                            });

                            $rootScope.$apply(function() {
                                updateVoteDeferred.resolve(minireel);
                            });
                        });

                        it('should call VoteService.update',function(){
                            expect(VoteService.update).toHaveBeenCalledWith(minireel);
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

                        describe('if the minireel has no election', function() {
                            var initializeDeferred;

                            beforeEach(function() {
                                success.calls.reset();
                                minireel.save.calls.reset();

                                initializeDeferred = $q.defer();

                                spyOn(VoteService, 'initialize').and.returnValue(initializeDeferred.promise);

                                delete minireel.data.election;

                                $rootScope.$apply(function() {
                                    MiniReelService.publish(minireel).then(success);
                                });
                            });

                            it('should initialize the election before saving the minireel', function() {
                                expect(minireel.save).not.toHaveBeenCalled();
                                expect(VoteService.initialize).toHaveBeenCalledWith(minireel);

                                $rootScope.$apply(function() {
                                    initializeDeferred.resolve({});
                                });

                                expect(minireel.save).toHaveBeenCalled();
                            });
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
                            expect(result.data.autoplay).toBe(true);
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
                                displayAdSource: 'cinema6',
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
                                displayAdSource: 'cinema6',
                                data: {
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
                                displayAdSource: 'cinema6',
                                data: {
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
                                displayAdSource: 'cinema6',
                                data: {
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
                                label: 'Video',
                                ad: false,
                                view: 'video',
                                displayAdSource: 'cinema6',
                                data: {
                                    service: 'youtube',
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40
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
                                displayAdSource: 'cinema6',
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
                                displayAdSource: 'cinema6',
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
                                    data: jasmine.any(Object)
                                });

                                cinema6.db.create.calls.mostRecent().args[1].data.deck.forEach(function(card, index) {
                                    if (index === 0) { return; }

                                    expect(minireel.data.deck[index]).toEqual(card);
                                });
                            });

                            it('should resolve the promise after the minireel is saved', function() {
                                expect(success).toHaveBeenCalledWith(newModel);
                                expect(newModel.data.title).toBe('My MiniReel (copy)');
                                expect(newModel.status).toBe('pending');
                                expect(newModel.access).toBe('private');
                            });
                        });

                        describe('without a template', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = MiniReelService.create().then(success);
                                });
                            });

                            it('should initialize a new minireel', function() {
                                /*var adCard = MiniReelService.createCard('ad');

                                delete adCard.id;*/

                                expect(cinema6.db.create).toHaveBeenCalledWith('experience', {
                                    type: 'minireel',
                                    org: 'o-17593d7a2bf294',
                                    appUri: 'rumble',
                                    data: {
                                        title: null,
                                        mode: 'lightbox',
                                        displayAdSource: portal.cModel.org.waterfalls.display[0],
                                        videoAdSource: portal.cModel.org.waterfalls.video[0],
                                        videoAdSkip: portal.cModel.org.videoAdSkip,
                                        branding: portal.cModel.branding,
                                        splash: {
                                            source: 'generated',
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        },
                                        collateral: {
                                            splash: null
                                        },
                                        deck: [
                                            /*jasmine.objectContaining(adCard),
                                            jasmine.objectContaining(adCard),
                                            jasmine.objectContaining(adCard),*/
                                            {
                                                id: jasmine.any(String),
                                                title: null,
                                                note: null,
                                                type: 'recap',
                                                label: 'Recap',
                                                view: 'recap',
                                                ad: false,
                                                displayAdSource: null,
                                                data: {}
                                            }
                                        ]
                                    }
                                });
                            });

                            it('should resolve the promise', function() {
                                expect(success).toHaveBeenCalledWith(newModel);
                                expect(newModel.status).toBe('pending');
                                expect(newModel.access).toBe('private');
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
                            expect(result).not.toBe(minireel);
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
                    });

                    describe('adChoicesOf(data)', function() {
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
                                user: {
                                    org: {
                                        waterfalls: {
                                            display: ['cinema6'],
                                            video: ['cinema6']
                                        }
                                    }
                                }
                            };

                            expect(MiniReelService.adChoicesOf(data)).toEqual({
                                video: [{value:'cinema6'}],
                                display: [{value:'cinema6'}]
                            });

                            data.user.org.waterfalls.display = ['cinema6','publisher','cinema6-publisher','publisher-cinema6'];

                            expect(MiniReelService.adChoicesOf(data)).toEqual({
                                video: [{value:'cinema6'}],
                                display: [{value:'cinema6'}, {value:'cinema6-publisher'}, {value:'publisher'}, {value:'publisher-cinema6'}]
                            });
                        });
                    });
                });
            });
        });
    });
}());
