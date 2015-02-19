define(['app'], function(appModule) {
    'use strict';

    function extend() {
        var objects = Array.prototype.slice.call(arguments);

        return objects.reduce(function(result, object) {
            return Object.keys(object).reduce(function(result, key) {
                result[key] = object[key];
                return result;
            }, result);
        }, {});
    }

    describe('CardAdapter', function() {
        var CardAdapter,
            adapter,
            $httpBackend,
            $q,
            c6State,
            PortalState,
            MiniReelService,
            VoteService;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                CardAdapter = $injector.get('CardAdapter');
                $httpBackend = $injector.get('$httpBackend');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');
                VoteService = $injector.get('VoteService');

                PortalState = c6State.get('Portal');
                PortalState.cModel = {};

                CardAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(CardAdapter, {
                    config: CardAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var cards;

            beforeEach(function() {
                cards = [
                    {
                        id: 'rc-3626f247eb2ab0'
                    },
                    {
                        id: 'rc-24ef02f2bb08aa'
                    },
                    {
                        id: 'rc-f2588964d79d29'
                    }
                ];

                $httpBackend.expectGET('/api/content/cards')
                    .respond(200, cards);

                adapter.findAll().then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the cards in the editor format', function() {
                expect(success).toHaveBeenCalledWith(cards.map(MiniReelService.convertCardForEditor));
            });
        });

        describe('find(type, id)', function() {
            var id, card;

            beforeEach(function() {
                id = 'rc-cf4d6380ccc14e';

                card = {
                    id: id,
                    data: {}
                };

                $httpBackend.expectGET('/api/content/card/' + id)
                    .respond(200, card);

                adapter.find('card', id).then(success, failure);

                $httpBackend.flush();
            });

            it('should respond with the card wrapped in an array', function() {
                expect(success).toHaveBeenCalledWith([MiniReelService.convertCardForEditor(card)]);
            });
        });

        describe('findQuery(type, query)', function() {
            var cards;

            beforeEach(function() {
                cards = [
                    {
                        id: 'rc-252d45b78c274b'
                    },
                    {
                        id: 'rc-f42a924b9b5276'
                    }
                ];

                $httpBackend.expectGET('/api/content/cards?org=o-8aeaa7d66bdb4c&sort=created,-1')
                    .respond(200, cards);

                adapter.findQuery('card', {
                    sort: 'created,-1',
                    org: 'o-8aeaa7d66bdb4c'
                }).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the cards', function() {
                expect(success).toHaveBeenCalledWith(cards.map(MiniReelService.convertCardForEditor));
            });

            describe('if there is a 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/content/cards?user=u-965430fb13d242')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('card', {
                        user: 'u-965430fb13d242'
                    }).then(success, failure);

                    $httpBackend.flush();
                });

                it('should succeed with an empty array', function() {
                    expect(success).toHaveBeenCalledWith([]);
                });
            });

            [500, 403, 401].forEach(function(status) {
                describe('if there is a ' + status, function() {
                    beforeEach(function() {
                        failure.calls.reset();

                        $httpBackend.expectGET('/api/content/cards?org=o-13827e65ebc1bb')
                            .respond(status, 'THERE WAS AN ISSUE');

                        adapter.findQuery('card', {
                            org: 'o-13827e65ebc1bb'
                        }).then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should fail with the response', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: 'THERE WAS AN ISSUE'
                        }));
                    });
                });
            });
        });

        describe('create(type, data)', function() {
            var card, ballot, response;

            beforeEach(function() {
                card = {
                    campaignId: 'cam-ebed4b6bdff117',
                    title: 'wiuhfu4rrf4',
                    note: 'ksjd skdjfh sdkfh',
                    type: 'video',
                    data: {
                        service: 'youtube',
                        start: 5,
                        end: 25
                    }
                };

                ballot = {
                    ballot: {
                        prompt: 'Hello!',
                        choices: ['Hello', 'Goodbye']
                    }
                };

                spyOn(VoteService, 'syncCard').and.callFake(function(data) {
                    return $q.when(extend(data, ballot));
                });

                response = extend(MiniReelService.convertCardForPlayer(card), ballot, { id: 'rc-8a868fb3d0d9b8', campaignId: 'cam-ebed4b6bdff117' });

                $httpBackend.expectPOST('/api/content/card', extend(MiniReelService.convertCardForPlayer(card), ballot, { campaignId: card.campaignId }))
                    .respond(201, response);

                adapter.create('card', card).then(success, failure);

                $httpBackend.flush();
            });

            it('should respond with the response in an array', function() {
                expect(success).toHaveBeenCalledWith([extend(MiniReelService.convertCardForEditor(response), { campaignId: card.campaignId })]);
            });
        });

        describe('erase(type, id)', function() {
            var id, card;

            beforeEach(function() {
                id = 'rc-c4d32b499cf3b4';

                card = {
                    id: id,
                    type: 'youtube',
                    data: {}
                };

                $httpBackend.expectDELETE('/api/content/card/' + id)
                    .respond(204, '');

                adapter.erase('card', card).then(success, failure);

                $httpBackend.flush();
            });

            it('should respond with null', function() {
                expect(success).toHaveBeenCalledWith(null);
            });
        });

        describe('update(type, model)', function() {
            var id, card, electionCard, response;

            beforeEach(function() {
                id = 'rc-8780863cdbbff5';

                card = {
                    id: id,
                    type: 'video',
                    lastUpdated: '2014-12-01T17:32:59.916Z',
                    data: {
                        source: 'vimeo',
                        autoplay: false,
                        autoadvance: true
                    }
                };

                electionCard = extend(MiniReelService.convertCardForPlayer(card), {
                    ballot: {
                        prompt: 'Will it update?',
                        choices: ['Yes', 'No']
                    }
                });

                spyOn(VoteService, 'syncCard').and.returnValue($q.when(electionCard));

                response = extend(electionCard, { lastUpdated: (new Date()).toISOString() });

                $httpBackend.expectPUT('/api/content/card/' + id, electionCard)
                    .respond(200, response);

                adapter.update('card', card).then(success, failure);

                $httpBackend.flush();
            });

            it('should respond with the result in an array', function() {
                expect(success).toHaveBeenCalledWith([MiniReelService.convertCardForEditor(response)]);
            });
        });
    });
});
