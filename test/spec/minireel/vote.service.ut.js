(function() {
    'use strict';

    define(['minireel/services'], function(servicesModule) {
        describe('VoteService', function() {
            var VoteService,
                cinema6,
                $q,
                $rootScope;

            var minireel;

            beforeEach(function() {
                /* jshint quotmark:false */
                minireel = {
                    "id": "e-80fcd03196b3d2",
                    "uri": "rumble",
                    "appUriPrefix": "<%= settings.appUrl %>",
                    "appUri": "rumble",
                    "title": "Rumble Video",
                    "img": {},
                    "org": "o-d1f0be2ea473cb",
                    "status": "pending",
                    "created": "2014-02-08T10:42:51+00:00",
                    "lastModified": "2014-04-18T14:07:20+00:00",
                    "data": {
                        "title": "Rumble Video",
                        "mode": "light",
                        "branding": "elitedaily",
                        "deck": [
                            {
                                "id": "rc-22119a8cf9f755",
                                "type": "youtube",
                                "title": "Epic Sax Guy",
                                "note": "He's back, and saxier than ever.",
                                "source": "YouTube",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Catchy",
                                        "Annoying"
                                    ]
                                },
                                "data": {
                                    "videoid": "gy1B3agGNxw",
                                    "start": 42,
                                    "end": 130,
                                    "rel": 0,
                                    "modestbranding": 1
                                }
                            },
                            {
                                "id": "rc-2d46a04b21b073",
                                "type": "ad",
                                "ad": true,
                                "modules": [
                                    "displayAd"
                                ],
                                "data": {
                                    "autoplay": true
                                },
                                "displayAd": "http://2.bp.blogspot.com/-TlM_3FT89Y0/UMzLr7kVykI/AAAAAAAACjs/lKrdhgp6OQg/s1600/brad-turner.jpg"
                            },
                            {
                                "id": "rc-4770a2d7f85ce0",
                                "type": "dailymotion",
                                "title": "Kristen Stewart for Channel",
                                "note": "Psychotic glamour",
                                "source": "DailyMotion",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Funny",
                                        "Lame"
                                    ]
                                },
                                "data": {
                                    "videoid": "x18b09a",
                                    "related": 0
                                }
                            },
                            {
                                "id": "rc-e489d1c6359fb3",
                                "type": "vimeo",
                                "title": "Aquatic paradise",
                                "note": "How may we help you?",
                                "source": "Vimeo",
                                "modules": [],
                                "sponsored": true,
                                "data": {
                                    "videoid": "81766071",
                                    "start": 35,
                                    "end": 45
                                }
                            },
                            {
                                "id": "rc-89094f9b7f8c93",
                                "type": "vimeo",
                                "title": "ShapeShifter",
                                "note": "Pretty cool.",
                                "source": "Vimeo",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Cool",
                                        "Boring"
                                    ]
                                },
                                "data": {
                                    "videoid": "18439821"
                                }
                            },
                            {
                                "id": "rc-e2947c9bec017e",
                                "type": "youtube",
                                "title": "Geek cool",
                                "note": "Doctor Who #11 meets #4",
                                "source": "YouTube",
                                "modules": [
                                    "ballot"
                                ],
                                "ballot": {
                                    "prompt": "What did you think of this video?",
                                    "choices": [
                                        "Too Cool",
                                        "Too Geeky"
                                    ]
                                },
                                "data": {
                                    "videoid": "Cn9yJrrm2tk",
                                    "rel": 0,
                                    "modestbranding": 1,
                                    "end": 18
                                }
                            },
                            {
                                "id": "rc-99b87ea709d7ac",
                                "type": "dailymotion",
                                "title": "Farting dogs",
                                "note": "Enough said",
                                "source": "DailyMotion",
                                "modules": [],
                                "data": {
                                    "videoid": "xorbb7",
                                    "related": 0
                                }
                            },
                            {
                                "id": "rc-726f43b2ef1e82",
                                "type": "youtube",
                                "title": "DOCTOR WHO - 50TH ANNIVERSARY - DRUNK REACTION VIDEO + SUPRISE REACTION",
                                "note": "**SPOILERS FOR THE DAY OF THE DOCTOR aka 50TH ANNIVERSARY**",
                                "source": "YouTube",
                                "modules": ["post"],
                                "sponsored": true,
                                "ballot": {
                                    "prompt": "Will you watch Doctor Who next week?",
                                    "choices": [
                                        "Of Course",
                                        "I'll Be Dead Next Week"
                                    ]
                                },
                                "data": {
                                    "videoid": "wsp6XzaDj_4",
                                    "rel": 0,
                                    "modestbranding": 1
                                }
                            },
                            {
                                "id": "rc-802dab79200a5c",
                                "type": "youtube",
                                "title": "Hip Bathroom Signs Are The Worst",
                                "note": "Can't We Just Go?",
                                "source": "YouTube",
                                "modules": ["post"],
                                "sponsored": true,
                                "ballot": {
                                    "prompt": "Will you go to a hip restaurant?",
                                    "choices": [
                                        "Yes",
                                        "I'm Not Hip"
                                    ]
                                },
                                "data": {
                                    "videoid": "wsp6XzaDj_4",
                                    "rel": 0,
                                    "modestbranding": 1
                                }
                            },
                            {
                                id: 'rc-b74a127991ee75',
                                type: 'recap',
                                title: 'Recap',
                                note: null,
                                data: {}
                            }
                        ]
                    }
                };
                /* jshint quotmark:single */

                module(servicesModule.name);

                inject(function($injector) {
                    VoteService = $injector.get('VoteService');
                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');
                });
            });

            it('should exist', function() {
                expect(VoteService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('sync(minireel)', function() {
                    var success, failure,
                        elections, saveDeferreds;

                    beforeEach(function() {
                        var create = cinema6.db.create;

                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');

                        elections = [];
                        saveDeferreds = [];

                        spyOn(cinema6.db, 'create').and.callFake(function() {
                            var election = elections[elections.push(create.apply(cinema6.db, arguments)) - 1];

                            spyOn(election, 'save').and.returnValue(saveDeferreds[saveDeferreds.push($q.defer()) - 1].promise);

                            return election;
                        });
                    });

                    describe('if no elections have been initialized', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                VoteService.sync(minireel).then(success, failure);
                            });
                        });

                        it('should create an election for the MiniReel', function() {
                            expect(elections[0]).toEqual(jasmine.objectContaining({
                                ballot: {
                                    'rc-22119a8cf9f755': [0, 0],
                                    'rc-4770a2d7f85ce0': [0, 0],
                                    'rc-89094f9b7f8c93': [0, 0],
                                    'rc-e2947c9bec017e': [0, 0]
                                }
                            }));
                        });

                        it('should create an election for each sponsored card', function() {
                            expect(elections[1]).toEqual(jasmine.objectContaining({
                                ballot: {
                                    'rc-726f43b2ef1e82': [0, 0]
                                }
                            }));

                            expect(elections[2]).toEqual(jasmine.objectContaining({
                                ballot: {
                                    'rc-802dab79200a5c': [0, 0]
                                }
                            }));
                        });

                        it('should save all of the elections', function() {
                            elections.forEach(function(election) {
                                expect(election.save).toHaveBeenCalled();
                            });
                        });

                        describe('after all the elections have been saved', function() {
                            var ids;

                            beforeEach(function() {
                                ids = [
                                    'el-7597466d710fa9',
                                    'el-86cfd08a249375',
                                    'el-103485e55510be'
                                ];

                                elections.forEach(function(election, index) {
                                    election.id = ids[index];

                                    $rootScope.$apply(function() {
                                        saveDeferreds[index].resolve(election);
                                    });
                                });
                            });

                            it('should save the id of the minireel\'s election on the minireel', function() {
                                expect(minireel.data.election).toBe(ids[0]);
                            });

                            it('should save the id of the sponsored cards\' elections on the cards', function() {
                                var sponsoredBallotCards = minireel.data.deck.filter(function(card) {
                                        return card.sponsored && card.ballot;
                                    }),
                                    sponsoredElectionIds = ids.slice(1, 3);

                                sponsoredBallotCards.forEach(function(card, index) {
                                    expect(card.ballot.election).toBe(sponsoredElectionIds[index]);
                                });
                            });

                            it('should resolve the promise to the minireel', function() {
                                expect(success).toHaveBeenCalledWith(minireel);
                            });
                        });
                    });

                    describe('if elections have already been initialized', function() {
                        var ids;

                        beforeEach(function() {
                            ids = [
                                'el-9f82673aacb9b7',
                                'el-1d630a0443fe4d',
                                'el-3e720f84b59f6e'
                            ];

                            elections = ids.map(function(id) {
                                var election = cinema6.db.create('election', {});

                                election.id = id;

                                return election;
                            });

                            elections[0].ballot = {
                                'rc-22119a8cf9f755': [0, 200],
                                'rc-89094f9b7f8c93': [100, 32],
                                'rc-e5dd20f59e49b1': [23, 0]
                            };

                            elections[1].ballot = {
                                'rc-726f43b2ef1e82': [50, 100]
                            };
                            elections[2].ballot = {
                                'rc-802dab79200a5c': [100, 150]
                            };

                            minireel.data.election = ids[0];
                            minireel.data.deck.filter(function(card) {
                                return card.ballot && card.sponsored;
                            }).forEach(function(card, index) {
                                card.ballot.election = this[index];
                            }, ids.slice(1, 4));

                            cinema6.db.create.calls.reset();

                            spyOn(cinema6.db, 'findAll').and.callFake(function(type, query) {
                                if (type !== 'election') { return $q.reject('INVALID'); }

                                return $q.when(elections.filter(function(election) {
                                    return election.id === query.id;
                                }));
                            });

                            $rootScope.$apply(function() {
                                VoteService.sync(minireel).then(success, failure);
                            });
                        });

                        it('should not create any new elections', function() {
                            expect(cinema6.db.create).not.toHaveBeenCalled();
                        });

                        it('should update the existing minireel election', function() {
                            expect(elections[0].ballot).toEqual({
                                'rc-22119a8cf9f755': [0, 200],
                                'rc-89094f9b7f8c93': [100, 32],
                                'rc-4770a2d7f85ce0': [0, 0],
                                'rc-e2947c9bec017e': [0, 0]
                            });
                        });

                        it('should update the existing sponsored card elections', function() {
                            expect(elections[1].ballot).toEqual({
                                'rc-726f43b2ef1e82': [50, 100]
                            });
                            expect(elections[2].ballot).toEqual({
                                'rc-802dab79200a5c': [100, 150]
                            });
                        });

                        it('should save all of the elections', function() {
                            elections.forEach(function(election) {
                                expect(election.save).toHaveBeenCalled();
                            });
                        });

                        describe('after all of the elections have been saved', function() {
                            beforeEach(function() {
                                elections.forEach(function(election, index) {
                                    $rootScope.$apply(function() {
                                        saveDeferreds[index].resolve(election);
                                    });
                                });
                            });

                            it('should resolve to the MiniReel', function() {
                                expect(success).toHaveBeenCalledWith(minireel);
                            });
                        });
                    });

                    describe('if the minireel has no elections', function() {
                        beforeEach(function() {
                            minireel.data.deck.forEach(function(card) {
                                delete card.ballot;
                            });

                            $rootScope.$apply(function() {
                                VoteService.sync(minireel).then(success, failure);
                            });
                        });

                        it('should not save any elections', function() {
                            elections.forEach(function(election) {
                                expect(election.save).not.toHaveBeenCalled();
                            });
                        });

                        it('should resolve to the minireel', function() {
                            expect(success).toHaveBeenCalledWith(minireel);
                        });
                    });
                });
            });
        });
    });
}());
