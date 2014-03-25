(function() {
    'use strict';

    define(['services'], function() {
        describe('MiniReelService', function() {
            var MiniReelService,
                $rootScope,
                cinema6,
                $q;

            var minireel;

            beforeEach(function() {
                minireel = {
                    id: 'e-15aa87f5da34c3',
                    title: 'My MiniReel',
                    subtitle: 'I <3 Turtles',
                    summary: 'I AM THE TURTLE MONSTER!',
                    type: 'minireel',
                    mode: 'lightbox',
                    theme: 'ed-videos',
                    data: {
                        deck: [
                            {
                                id: 'rc-c9cf24e87307ac',
                                type: 'youtube',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
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
                                modules: ['ballot'],
                                data: {
                                    videoid: '48hfrei49'
                                }
                            },
                            {
                                id: 'rc-1c7a46097a5d4a',
                                type: 'ad',
                                ad: true,
                                data: {
                                    autoplay: true,
                                    publisher: true
                                }
                            },
                            {
                                id: 'rc-61fa9683714e13',
                                type: 'dailymotion',
                                title: 'The Smartest Turtle',
                                note: 'Blah blah blah',
                                modules: ['ballot'],
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
                                modules: [],
                                data: {
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0
                                }
                            },
                            {
                                id: 'rc-f31cabb9193ef9',
                                type: 'ad',
                                ad: true,
                                data: {
                                    autoplay: false,
                                    publisher: false
                                }
                            },
                            {
                                id: 'rc-25c1f60b933186',
                                type: 'links',
                                title: 'If You Love Turtles',
                                note: 'Blah blah blah',
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
                            }
                        ]
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    MiniReelService = $injector.get('MiniReelService');
                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');
                });
            });

            it('should exist', function() {
                expect(MiniReelService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('createCard(type)', function() {
                        it('should create a new card based on the type provided', function() {
                            var videoCard = MiniReelService.createCard('video'),
                                videoBallotCard = MiniReelService.createCard('videoBallot'),
                                adCard = MiniReelService.createCard('ad'),
                                linksCard = MiniReelService.createCard('links');

                            expect(videoCard).toEqual({
                                id: jasmine.any(String),
                                type: 'video',
                                title: null,
                                note: null,
                                ad: false,
                                data: {
                                    service: null,
                                    videoid: null,
                                    start: null,
                                    end: null
                                }
                            });

                            expect(videoBallotCard).toEqual({
                                id: jasmine.any(String),
                                type: 'videoBallot',
                                title: null,
                                note: null,
                                ad: false,
                                data: {
                                    service: null,
                                    videoid: null,
                                    start: null,
                                    end: null,
                                    ballot: []
                                }
                            });

                            expect(adCard).toEqual({
                                id: jasmine.any(String),
                                type: 'ad',
                                title: null,
                                note: null,
                                ad: true,
                                data: {
                                    autoplay: false,
                                    publisher: false
                                }
                            });

                            expect(linksCard).toEqual({
                                id: jasmine.any(String),
                                type: 'links',
                                title: null,
                                note: null,
                                ad: false,
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
                                ad: false,
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
                                ad: false,
                                data: {
                                    service: null,
                                    videoid: null,
                                    start: null,
                                    end: null
                                }
                            });

                            videoBallotCard = MiniReelService.setCardType(card, 'videoBallot');
                            expect(videoBallotCard).toBe(card);
                            expect(videoBallotCard).toEqual({
                                id: id,
                                type: 'videoBallot',
                                title: null,
                                note: null,
                                ad: false,
                                data: {
                                    service: null,
                                    videoid: null,
                                    start: null,
                                    end: null,
                                    ballot: []
                                }
                            });

                            adCard = MiniReelService.setCardType(card, 'ad');
                            expect(adCard).toBe(card);
                            expect(adCard).toEqual({
                                id: id,
                                type: 'ad',
                                title: null,
                                note: null,
                                ad: true,
                                data: {
                                    autoplay: false,
                                    publisher: false
                                }
                            });

                            linksCard = MiniReelService.setCardType(card, 'links');
                            expect(linksCard).toBe(card);
                            expect(linksCard).toEqual({
                                id: id,
                                type: 'links',
                                title: null,
                                note: null,
                                ad: false,
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

                    describe('open(id)', function() {
                        var success,
                            deck;

                        beforeEach(function() {
                            success = jasmine.createSpy('open() success');
                            spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));

                            $rootScope.$apply(function() {
                                MiniReelService.open('e-15aa87f5da34c3')
                                    .then(success);
                            });

                            deck = success.calls.mostRecent().args[0].data.deck;
                        });

                        it('should fetch the minireel from the database', function() {
                            expect(cinema6.db.find).toHaveBeenCalledWith('experience', 'e-15aa87f5da34c3');
                        });

                        it('should resolve to a cached minireel if it has already been opened', function() {
                            var secondSuccess = jasmine.createSpy('open() success');

                            $rootScope.$apply(function() {
                                MiniReelService.open('e-15aa87f5da34c3')
                                    .then(secondSuccess);
                            });

                            expect(success.calls.mostRecent().args[0])
                                .toBe(secondSuccess.calls.mostRecent().args[0]);
                        });

                        it('should return an object with all the non-data content of the original', function() {
                            expect(success).toHaveBeenCalledWith({
                                id: 'e-15aa87f5da34c3',
                                title: 'My MiniReel',
                                subtitle: 'I <3 Turtles',
                                summary: 'I AM THE TURTLE MONSTER!',
                                type: 'minireel',
                                mode: 'lightbox',
                                theme: 'ed-videos',
                                data: jasmine.any(Object)
                            });
                        });

                        it('should insert an intro card', function() {
                            expect(deck[0]).toEqual({
                                id: jasmine.any(String),
                                type: 'intro'
                            });

                            expect(deck[0].id).toMatch(/rc-[a-zA-Z0-9]{14}/);
                        });

                        it('should transpile the various video cards into two cards', function() {
                            expect(deck[1]).toEqual({
                                id: 'rc-c9cf24e87307ac',
                                type: 'video',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
                                ad: false,
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
                                ad: false,
                                data: {
                                    service: 'vimeo',
                                    videoid: '48hfrei49',
                                    start: null,
                                    end: null,
                                    ballot: []
                                }
                            });

                            expect(deck[4]).toEqual({
                                id: 'rc-61fa9683714e13',
                                type: 'videoBallot',
                                title: 'The Smartest Turtle',
                                note: 'Blah blah blah',
                                ad: false,
                                data: {
                                    service: 'dailymotion',
                                    videoid: 'vfu85f5',
                                    start: undefined,
                                    end: undefined,
                                    ballot: []
                                }
                            });

                            expect(deck[5]).toEqual({
                                id: 'rc-d8ebd5461ba524',
                                type: 'video',
                                title: 'The Dumbest Turtle',
                                note: 'Blah blah blah',
                                ad: false,
                                data: {
                                    service: 'youtube',
                                    videoid: 'fn4378r4d',
                                    start: 0,
                                    end: 40
                                }
                            });
                        });

                        it('should transpile the ad cards', function() {
                            expect(deck[3]).toEqual({
                                id: 'rc-1c7a46097a5d4a',
                                type: 'ad',
                                title: null,
                                note: null,
                                ad: true,
                                data: {
                                    autoplay: true,
                                    publisher: true
                                }
                            });
                            expect(deck[6]).toEqual({
                                id: 'rc-f31cabb9193ef9',
                                type: 'ad',
                                title: null,
                                note: null,
                                ad: true,
                                data: {
                                    autoplay: false,
                                    publisher: false
                                }
                            });
                        });

                        it('should transpile the links cards', function() {
                            expect(deck[7]).toEqual({
                                id: 'rc-25c1f60b933186',
                                type: 'links',
                                title: 'If You Love Turtles',
                                note: 'Blah blah blah',
                                ad: false,
                                data: minireel.data.deck[6].data
                            });

                            expect(deck[7].data.links).not.toBe(minireel.data.deck[6].data.links);
                        });
                    });
                });
            });
        });
    });
}());
