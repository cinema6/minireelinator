(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var copy = angular.copy,
            extend = angular.extend;

        fdescribe('UpdateRequestAdapter', function() {
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

                    adapter = $injector.instantiate(UpdateRequestAdapter, {
                        config: UpdateRequestAdapter.config
                    });

                    $httpBackend = $injector.get('$httpBackend');
                });

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
                        data: {
                            cards: [ card ]
                        }
                    };

                    $httpBackend.expectGET('/api/campaigns/c-123/updates/ur-12345')
                        .respond(200, updateRequest);

                    adapter.find('updateRequest', 'c-123:ur-12345').then(success, failure);

                    $httpBackend.flush();
                });

                it('should return the updateRequest in an array', function() {
                    expect(success).toHaveBeenCalledWith([updateRequest]);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should convert the card for editor', function() {
                    expect(MiniReelService.convertCardForEditor).toHaveBeenCalledWith(card);
                });
            });

            describe('findQuery(type, id, query)', function() {
                var updateRequests, data;

                beforeEach(function() {
                    updateRequests = [
                        {
                            id: 'ur-12345',
                            status: 'pending'
                        },
                        {
                            id: 'ur-54321',
                            status: 'pending'
                        },
                        {
                            id: 'ur-31524',
                            status: 'rejected'
                        }
                    ];
                    data = {
                        campaign: 'c-123',
                        ids: 'ur-12345,ur-54321',
                        statuses: 'pending'
                    };

                    $httpBackend.expectGET('/api/campaigns/c-123/updates?ids=ur-12345,ur-54321&statuses=pending')
                        .respond(200, [{id:'ur-12345'},{id:'ur-54321'}]);
                });

                it('should return the updateRequests with the given filters', function() {
                    adapter.findQuery('updateRequest', data).then(success, failure);
                    $httpBackend.flush();
                    expect(success).toHaveBeenCalledWith([{id:'ur-12345'},{id:'ur-54321'}]);
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
                var updateRequest;

                beforeEach(function() {
                    updateRequest = {
                        status: 'pending',
                        campaign: 'c-123'
                    };

                    $httpBackend.expectPOST('/api/campaigns/c-123/updates')
                        .respond(function(method, url, data) {
                            return [200, data];
                        });
                });

                it('should return the created updateRequest', function() {
                    adapter.create('updateRequest', updateRequest).then(success, failure);
                    $httpBackend.flush();
                    expect(success).toHaveBeenCalledWith([updateRequest]);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject if not provided a campaignId', function() {
                    delete updateRequest.campaign;
                    adapter.create('updateRequest', updateRequest).then(success, failure);
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
                var updateRequest;

                beforeEach(function() {
                    updateRequest = {
                        id: 'ur-12345',
                        campaign: 'c-123',
                        status: 'pending',
                        data: {}
                    };

                    $httpBackend.expectPUT('/api/campaigns/c-123/updates/ur-12345', {status:'pending', data:{}})
                        .respond(200, updateRequest);

                    adapter.update('updateRequest', updateRequest).then(success, failure);

                    $httpBackend.flush();
                });

                it('should return the updateRequest in an array', function() {
                    expect(success).toHaveBeenCalledWith([updateRequest]);
                    expect(failure).not.toHaveBeenCalled();
                });
            });
        });
    });
}());
