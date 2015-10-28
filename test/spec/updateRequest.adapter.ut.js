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
                adapter,
                success,
                failure;

            var $httpBackend;

            beforeEach(function() {
                module(appModule.name);

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    UpdateRequestAdapter = $injector.get('UpdateRequestAdapter');
                    UpdateRequestAdapter.config = {
                        apiBase: '/api'
                    };

                    adapter = $injector.instantiate(UpdateRequestAdapter, {
                        config: UpdateRequestAdapter.config
                    });

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            describe('findAll', function() {
                var updateRequests;

                beforeEach(function() {
                    updateRequests = [
                        {
                            id: 'ur-12345'
                        },
                        {
                            id: 'ur-54321'
                        },
                        {
                            id: 'ur-31524'
                        }
                    ];

                    $httpBackend.expectGET('/api/campaigns/c-123/updates')
                        .respond(200, updateRequests);

                    adapter.findAll('updateRequest', 'c-123').then(success, failure);

                    $httpBackend.flush();
                });

                it('should resolve to the update requests', function() {
                    expect(success).toHaveBeenCalledWith(updateRequests);
                    expect(failure).not.toHaveBeenCalled();
                });
            });

            describe('find(type, id)', function() {
                var updateRequest;

                beforeEach(function() {
                    updateRequest = {
                        id: 'ur-12345',
                        status: 'pending'
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
            });

            describe('findQuery(type, id, query)', function() {
                var updateRequests, query;

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
                    query = {
                        ids: 'ur-12345,ur-54321',
                        statuses: 'pending'
                    };

                    $httpBackend.expectGET('/api/campaigns/c-123/updates?ids=ur-12345,ur-54321&statuses=pending')
                        .respond(200, [{id:'ur-12345'},{id:'ur-54321'}]);

                    adapter.findQuery('updateRequest', 'c-123', query).then(success, failure);

                    $httpBackend.flush();
                });

                it('should return the updateRequests with the given filters', function() {
                    expect(success).toHaveBeenCalledWith([{id:'ur-12345'},{id:'ur-54321'}]);
                    expect(failure).not.toHaveBeenCalled();
                });
            });

            describe('create(type, id, data)', function() {
                var updateRequest;

                beforeEach(function() {
                    updateRequest = {
                        status: 'pending'
                    };

                    $httpBackend.expectPOST('/api/campaigns/c-123/updates')
                        .respond(200, updateRequest);

                    adapter.create('updateRequest', 'c-123', updateRequest).then(success, failure);

                    $httpBackend.flush();
                });

                it('should return the created updateRequest', function() {
                    expect(success).toHaveBeenCalledWith(updateRequest);
                    expect(failure).not.toHaveBeenCalled();
                });
            });

            describe('erase(type, model)', function() {
                var updateRequest;

            beforeEach(function() {
                    var updateRequest = {
                        id: 'ur-12345'
                    };

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
