(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var copy = angular.copy,
            extend = angular.extend;

        describe('UpdateRequestAdapter', function() {
            var UpdateRequestAdapter,
                cinema6,
                $q,
                $rootScope,
                MiniReelService,
                adapter,
                success,
                failure;

            var $httpBackend,
                convertCardForPlayerDeferred,
                convertCardForEditorDeferred,
                card;

            beforeEach(function() {
                module(appModule.name);

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');

                    UpdateRequestAdapter = $injector.get('UpdateRequestAdapter');
                    UpdateRequestAdapter.config = {
                        apiBase: '/api'
                    };

                    card = {
                        data: {},
                        collateral: {},
                        campaign: {},
                        params: {}
                    };
                    convertCardForPlayerDeferred = $q.defer();
                    convertCardForEditorDeferred = $q.defer();
                    spyOn(MiniReelService, 'convertCardForPlayer').and.returnValue(convertCardForPlayerDeferred.promise);
                    spyOn(MiniReelService, 'convertCardForEditor').and.returnValue(convertCardForEditorDeferred.promise);

                    adapter = $injector.instantiate(UpdateRequestAdapter, {
                        config: UpdateRequestAdapter.config,
                        MiniReelService: MiniReelService
                    });

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            describe('findAll(type, id)', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        adapter.findAll('updateRequest', 'c-123').then(success, failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalledWith('UpdateRequestAdapter.findAll() is not implemented.');
                });
            });

            describe('find(type, id)', function() {
                var updateRequest;

                beforeEach(function() {
                    updateRequest = {
                        id: 'ur-12345',
                        status: 'pending',
                        campaign: 'c-123',
                        data: {
                            cards: [ card ]
                        }
                    };

                    $httpBackend.expectGET('/api/campaigns/c-123/updates/ur-12345')
                        .respond(200, updateRequest);

                    adapter.find('updateRequest', 'c-123:ur-12345').then(success, failure);

                    $httpBackend.flush();
                });

                it('should convert the card for editor', function() {
                    expect(MiniReelService.convertCardForEditor).toHaveBeenCalledWith(card);
                });

                it('should return the updateRequest in an array when the conversion completes', function() {
                    var updatedCard = {
                            data: {
                                videoid: '1234',
                                source: 'YouTube'
                            }
                        },
                        expectedRequest = copy(updateRequest);

                    expectedRequest.data.cards[0] = updatedCard;
                    expectedRequest.id = updateRequest.campaign + ':' + updateRequest.id;

                    $rootScope.$apply(function() {
                        convertCardForEditorDeferred.resolve(updatedCard);
                    });

                    expect(success).toHaveBeenCalledWith([expectedRequest]);
                    expect(failure).not.toHaveBeenCalled();
                });
            });

            describe('findQuery(type, id, query)', function() {
                var updateRequests, data;

                beforeEach(function() {
                    updateRequests = [
                        {
                            id: 'ur-12345',
                            status: 'pending',
                            campaign: 'c-111'
                        },
                        {
                            id: 'ur-54321',
                            status: 'pending',
                            campaign: 'c-222',
                            data: {
                                cards: [ card ]
                            }
                        },
                        {
                            id: 'ur-31524',
                            status: 'rejected',
                            campaign: 'c-333'
                        }
                    ];
                    data = {
                        campaign: 'c-123',
                        ids: 'ur-12345,ur-54321',
                        statuses: 'pending'
                    };

                    $httpBackend.expectGET('/api/campaigns/c-123/updates?ids=ur-12345,ur-54321&statuses=pending')
                        .respond(200, updateRequests);
                });

                it('should decorate any cards and handle updates with no cards', function() {
                    var updatedCard = {
                            data: {
                                videoid: '1234',
                                source: 'YouTube'
                            }
                        },
                        expectedRequests = copy(updateRequests);

                    expectedRequests[1].data.cards[0] = updatedCard;

                    expectedRequests.forEach(function(request) {
                        request.id = request.campaign + ':' + request.id;
                    });

                    adapter.findQuery('updateRequest', data).then(success, failure);
                    $httpBackend.flush();

                    expect(MiniReelService.convertCardForEditor).toHaveBeenCalledWith(card);
                    expect(MiniReelService.convertCardForEditor.calls.count()).toBe(1);

                    $rootScope.$apply(function() {
                        convertCardForEditorDeferred.resolve(updatedCard);
                    });

                    expect(success).toHaveBeenCalledWith(expectedRequests);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject if not provided a campaign id', function() {
                    delete data.campaign;
                    adapter.findQuery('updateRequest', data).then(success, failure);
                    $rootScope.$apply();
                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalledWith('Must provide a campaign id');
                });
            });

            describe('create(type, data)', function() {
                var postRequest, responseRequest, playerCard, editorCard, expectedResponse;

                beforeEach(function() {
                    playerCard = {
                        data: {
                            source: 'YouTube',
                            videoid: '1234',
                            modestbranding: 1
                        }
                    };
                    editorCard = {
                        type: 'video',
                        params: {},
                        thumbs: null
                    };

                    postRequest = {
                        status: 'pending',
                        campaign: 'c-123',
                        data: {
                            cards: [ editorCard ]
                        }
                    };

                    responseRequest = {
                        id: 'ur-123',
                        status: 'pending',
                        campaign: 'c-123',
                        data: {
                            cards: [ playerCard ]
                        }
                    };

                    expectedResponse = {
                        id: 'c-123:ur-123',
                        status: 'pending',
                        campaign: 'c-123',
                        data: {
                            cards: [ editorCard ]
                        }
                    };

                    $httpBackend.expectPOST('/api/campaigns/c-123/updates', postRequest)
                        .respond(201, responseRequest);
                });

                it('should convert editor card for player before saving, then convert player card for editor', function() {
                    adapter.create('updateRequest', postRequest).then(success, failure);

                    expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(editorCard);
                    expect(MiniReelService.convertCardForEditor).not.toHaveBeenCalled();

                    $rootScope.$apply(function() {
                        convertCardForPlayerDeferred.resolve(playerCard);
                    });

                    $httpBackend.flush();


                    expect(MiniReelService.convertCardForEditor).toHaveBeenCalledWith(playerCard);

                    $rootScope.$apply(function() {
                        convertCardForEditorDeferred.resolve(editorCard);
                    });

                    expect(success).toHaveBeenCalledWith([expectedResponse]);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject if not provided a campaignId', function() {
                    delete postRequest.campaign;
                    adapter.create('updateRequest', postRequest).then(success, failure);
                    $rootScope.$apply();
                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalledWith('Must provide a campaign id');
                });
            });

            describe('erase(type, model)', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        adapter.erase('updateRequest', 'c-123:ur-12345').then(success, failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalledWith('UpdateRequestAdapter.erase() is not implemented.');
                });
            });

            describe('update(type, updateRequest)', function() {
                describe('if status is rejected', function() {
                    it('should only send a status and rejection reason', function() {
                        var response = {
                            id: 'ur-12345',
                            campaign: 'c-123',
                            status: 'rejected',
                            rejectionReason: 'Bad things'
                        };

                        var updateRequest = {
                            id: 'c-123:ur-12345',
                            campaign: 'c-123',
                            status: 'rejected',
                            rejectionReason: 'Bad things',
                            data: {
                                cards: [ card ]
                            }
                        };

                        $httpBackend.expectPUT('/api/campaigns/c-123/updates/ur-12345', {status:'rejected', rejectionReason: 'Bad things'})
                            .respond(200, response);

                        adapter.update('updateRequest', updateRequest).then(success, failure);

                        $httpBackend.flush();

                        response.id = response.campaign + ':' + response.id;

                        expect(success).toHaveBeenCalledWith([response]);
                        expect(failure).not.toHaveBeenCalled();
                        expect(MiniReelService.convertCardForPlayer).not.toHaveBeenCalled();
                        expect(MiniReelService.convertCardForEditor).not.toHaveBeenCalled();
                    });
                });

                describe('if status is not rejected', function() {
                    it('should convert the card before and after saving and return the update', function() {
                        var playerCard = {
                                data: {
                                    source: 'YouTube',
                                    videoid: '1234',
                                    modestbranding: 1
                                }
                            },
                            editorCard = {
                                type: 'video',
                                params: {},
                                thumbs: null
                            },
                            putRequest = {
                                id: 'c-123:ur-12345',
                                status: 'pending',
                                campaign: 'c-123',
                                data: {
                                    cards: [ editorCard ]
                                }
                            },
                            actualRequest = {
                                status: 'pending',
                                data: {
                                    cards: [ playerCard ]
                                }
                            },
                            responseRequest = {
                                id: 'ur-12345',
                                status: 'pending',
                                campaign: 'c-123',
                                data: {
                                    cards: [ playerCard ]
                                }
                            },
                            expectedResponse = {
                                id: 'ur-12345',
                                status: 'pending',
                                campaign: 'c-123',
                                data: {
                                    cards: [ editorCard ]
                                }
                            };

                        $httpBackend.expectPUT('/api/campaigns/c-123/updates/ur-12345', actualRequest)
                            .respond(200, responseRequest);

                        adapter.update('updateRequest', putRequest).then(success, failure);

                        expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(editorCard);
                        expect(MiniReelService.convertCardForEditor).not.toHaveBeenCalled();

                        $rootScope.$apply(function() {
                            convertCardForPlayerDeferred.resolve(playerCard);
                        });

                        $httpBackend.flush();

                        expect(MiniReelService.convertCardForEditor).toHaveBeenCalledWith(playerCard);

                        $rootScope.$apply(function() {
                            convertCardForEditorDeferred.resolve(editorCard);
                        });

                        expectedResponse.id = expectedResponse.campaign + ':' + expectedResponse.id;

                        expect(success).toHaveBeenCalledWith([expectedResponse]);
                        expect(failure).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
}());
