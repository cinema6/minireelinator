(function() {
    'use strict';

    define(['services'], function() {
        /* global angular:true */
        var extend = angular.extend;

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

                module('c6.mrmaker');

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
                describe('initialize(minireel)', function() {
                    var success,
                        electionData,
                        election,
                        saveDeferred;

                    beforeEach(function() {
                        var create = cinema6.db.create;

                        saveDeferred = $q.defer();
                        success = jasmine.createSpy('success');

                        spyOn(cinema6.db, 'create')
                            .and.callFake(function() {
                                election = create.apply(cinema6.db, arguments);

                                spyOn(election, 'save')
                                    .and.returnValue(saveDeferred.promise);

                                return election;
                            });

                    });

                    describe('minireel with survey questions',function(){

                        beforeEach(function(){
                            electionData = {
                                ballot: {
                                    'rc-22119a8cf9f755': [0, 0],
                                    'rc-4770a2d7f85ce0': [0, 0],
                                    'rc-89094f9b7f8c93': [0, 0],
                                    'rc-e2947c9bec017e': [0, 0]
                                }
                            };
                            
                            $rootScope.$apply(function() {
                                VoteService.initialize(minireel).then(success);
                            });
                        });

                        it('should create and election', function() {
                            expect(cinema6.db.create).toHaveBeenCalledWith('election', electionData);
                        });

                        it('should store the electionId on the minireel and resolve to the election', function() {
                            $rootScope.$apply(function() {
                                saveDeferred.resolve(extend(election), {
                                    id: 'fixture0'
                                });
                            });

                            expect(minireel.data.election).toBe(election.id);
                            expect(success).toHaveBeenCalledWith(election);
                        });

                    });

                    describe('minireel without survey questions',function(){

                        beforeEach(function(){
                            angular.forEach(minireel.data.deck,function(card){
                                card.modules = [];
                                delete card.ballot;
                            });
                            $rootScope.$apply(function() {
                                VoteService.initialize(minireel).then(success);
                            });
                        });

                        it('should not create the election', function() {
                            expect(cinema6.db.create).not.toHaveBeenCalled();
                        });

                        it('should not store the electionId on the minireel', function() {
                            expect(minireel.data.election).not.toBeDefined();
                            expect(success).toHaveBeenCalledWith(null);
                        });
                    });
                });

                describe('update(minireel)', function() {
                    var success,
                        election,
                        saveDeferred;

                    beforeEach(function() {
                        saveDeferred = $q.defer();
                        success = jasmine.createSpy('success');

                        minireel.data.election = 'el-6d75a6bc5b273b';
                    });

                    describe('election as object with survey questions',function(){
                        beforeEach(function(){
                            minireel.data.deck.splice(2, 1);
                            minireel.data.deck.push(
                                {
                                    id: 'rc-d9e637e92002cc',
                                    modules: ['ballot'],
                                    ballot: {
                                        choices: ['Stobered It', 'Minznered It']
                                    }
                                },
                                {
                                    id: 'rc-7f405190bc796e',
                                    modules: []
                                }
                            );
                            
                            election = cinema6.db.create('election', {
                                id: 'el-6d75a6bc5b273b',
                                ballot: {
                                    'rc-22119a8cf9f755': {
                                        'Catchy': 100,
                                        'Annoying': 200
                                    },
                                    'rc-4770a2d7f85ce0': {
                                        'Funny': 300,
                                        'Lame': 400
                                    },
                                    'rc-89094f9b7f8c93': {
                                        'Cool': 500,
                                        'Boring': 600
                                    },
                                    'rc-e2947c9bec017e': {
                                        'Too Cool': 700,
                                        'Too Geeky': 800
                                    }
                                }
                            });

                            spyOn(election, 'save').and.returnValue(saveDeferred.promise);


                            spyOn(cinema6.db, 'findAll')
                                .and.returnValue($q.when([election]));

                            $rootScope.$apply(function() {
                                VoteService.update(minireel).then(success);
                            });
                        });

                        it('should fetch the election', function() {
                            expect(cinema6.db.findAll).toHaveBeenCalledWith('election', {
                                id: minireel.data.election
                            });
                        });

                        it('should update the election', function() {
                            expect(election).toEqual(jasmine.objectContaining({
                                ballot: {
                                    'rc-22119a8cf9f755': {
                                        'Catchy': 100,
                                        'Annoying': 200
                                    },
                                    'rc-89094f9b7f8c93': {
                                        'Cool': 500,
                                        'Boring': 600
                                    },
                                    'rc-e2947c9bec017e': {
                                        'Too Cool': 700,
                                        'Too Geeky': 800
                                    },
                                    'rc-d9e637e92002cc': {
                                        'Stobered It': 0,
                                        'Minznered It': 0
                                    }
                                }
                            }));
                        });

                        it('should save the election', function() {
                            expect(election.save).toHaveBeenCalled();
                        });

                        it('should resolve the promsie after the save completes', function() {
                            $rootScope.$apply(function() {
                                saveDeferred.resolve(election);
                            });

                            expect(success).toHaveBeenCalledWith(election);
                        });
                    });

                    describe('election as array with survey questions',function(){
                        beforeEach(function(){
                            minireel.data.deck.splice(2, 1);
                            minireel.data.deck.push(
                                {
                                    id: 'rc-d9e637e92002cc',
                                    modules: ['ballot'],
                                    ballot: {
                                        choices: ['Stobered It', 'Minznered It']
                                    }
                                },
                                {
                                    id: 'rc-7f405190bc796e',
                                    modules: []
                                }
                            );
                            
                            election = cinema6.db.create('election', {
                                id: 'el-6d75a6bc5b273b',
                                ballot: {
                                    'rc-22119a8cf9f755': [ 100, 200],
                                    'rc-4770a2d7f85ce0': [ 300, 400],
                                    'rc-89094f9b7f8c93': [ 500, 600],
                                    'rc-e2947c9bec017e': [ 700, 800]
                                }
                            });

                            spyOn(election, 'save').and.returnValue(saveDeferred.promise);


                            spyOn(cinema6.db, 'findAll')
                                .and.returnValue($q.when([election]));

                            $rootScope.$apply(function() {
                                VoteService.update(minireel).then(success);
                            });
                        });

                        it('should fetch the election', function() {
                            expect(cinema6.db.findAll).toHaveBeenCalledWith('election', {
                                id: minireel.data.election
                            });
                        });

                        it('should update the election', function() {
                            expect(election).toEqual(jasmine.objectContaining({
                                ballot: {
                                    'rc-22119a8cf9f755': [ 100, 200],
                                    'rc-89094f9b7f8c93': [ 500, 600],
                                    'rc-e2947c9bec017e': [ 700, 800],
                                    'rc-d9e637e92002cc': [ 0, 0]
                                }
                            }));
                        });

                        it('should save the election', function() {
                            expect(election.save).toHaveBeenCalled();
                        });

                        it('should resolve the promsie after the save completes', function() {
                            $rootScope.$apply(function() {
                                saveDeferred.resolve(election);
                            });

                            expect(success).toHaveBeenCalledWith(election);
                        });
                    });

                    describe('without survey questions',function(){
                        beforeEach(function(){
                            angular.forEach(minireel.data.deck,function(card){
                                card.modules = [];
                                delete card.ballot;
                            });
                            
                            election = cinema6.db.create('election', {
                                id: 'el-6d75a6bc5b273b',
                                ballot: {
                                    'rc-22119a8cf9f755': {
                                        'Catchy': 100,
                                        'Annoying': 200
                                    },
                                    'rc-4770a2d7f85ce0': {
                                        'Funny': 300,
                                        'Lame': 400
                                    },
                                    'rc-89094f9b7f8c93': {
                                        'Cool': 500,
                                        'Boring': 600
                                    },
                                    'rc-e2947c9bec017e': {
                                        'Too Cool': 700,
                                        'Too Geeky': 800
                                    }
                                }
                            });

                            spyOn(election, 'save').and.returnValue(saveDeferred.promise);
                            
                            spyOn(cinema6.db, 'findAll')
                                .and.returnValue($q.when([election]));

                            $rootScope.$apply(function() {
                                VoteService.update(minireel).then(success);
                            });
                        });

                        it('should fetch the election', function() {
                            expect(cinema6.db.findAll).not.toHaveBeenCalled();
                        });

                        it('should not save the election', function() {
                            expect(election.save).not.toHaveBeenCalled();
                        });

                        it('should resolve the promsie with null', function() {
                            expect(success).toHaveBeenCalledWith(null);
                        });
                    });
                });
            });
        });
    });
}());
