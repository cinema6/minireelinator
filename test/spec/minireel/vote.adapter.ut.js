(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var extend = angular.extend,
            copy = angular.copy;

        describe('VoteAdapter', function() {
            var VoteAdapter,
                $rootScope,
                $q,
                adapter;

            var $httpBackend;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    VoteAdapter = $injector.get('VoteAdapter');
                    VoteAdapter.config = {
                        apiBase: '/api'
                    };
                    adapter = $injector.instantiate(VoteAdapter, {
                        config: VoteAdapter.config
                    });
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            describe('findAll()', function() {
                var failure;

                beforeEach(function() {
                    failure = jasmine.createSpy('failure');

                    $rootScope.$apply(function() {
                        adapter.findAll().catch(failure);
                    });
                });

                it('should return a rejected promise', function() {
                    expect(failure).toHaveBeenCalled();
                });
            });

            describe('find(type, id)', function() {
                var success,
                    response;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    response = {
                        id: 'e1',
                        ballot:   {
                            'b1' : { 'red apple'  : 10, 'yellow banana'  : 20, 'orange carrot'  : 30 },
                            'b2' : { 'one chicken': 0, 'two ducks'      : 2 }
                        }
                    };

                    $httpBackend.expectGET('/api/election/el-123')
                        .respond(200, response);

                    adapter.find('election', 'el-123').then(success);

                    $httpBackend.flush();
                });

                it('should resolve to the election in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });

            describe('findQuery(type, query)', function() {
                var promise,
                    result;

                beforeEach(function() {
                    promise = $q.defer().promise;

                    spyOn(adapter, 'find').and.returnValue(promise);

                    result = adapter.findQuery('election', { id: 'el-abc' });
                });

                it('should delegate to the find() method', function() {
                    expect(result).toBe(promise);
                    expect(adapter.find).toHaveBeenCalledWith('election', 'el-abc');
                });
            });

            describe('create(type, data)', function() {
                var success,
                    response,
                    data;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    data = {
                        created: '489f48jhf8uir',
                        org: '48fhf9483',
                        ballot:   {
                            'b1' : { 'red apple'  : 10, 'yellow banana'  : 20, 'orange carrot'  : 30 },
                            'b2' : { 'one chicken': 0, 'two ducks'      : 2 }
                        }
                    };

                    response = extend(copy(data), {
                        id: 'e1'
                    });

                    $httpBackend.expectPOST('/api/election', {
                        ballot:   {
                            'b1' : { 'red apple'  : 10, 'yellow banana'  : 20, 'orange carrot'  : 30 },
                            'b2' : { 'one chicken': 0, 'two ducks'      : 2 }
                        }
                    }).respond(201, response);

                    adapter.create('election', data).then(success);

                    $httpBackend.flush();
                });

                it('should resolve to an array of the response', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });

            describe('erase(type, model)', function() {
                var success,
                    model;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    model = {
                        id: 'el-abc123'
                    };

                    $httpBackend.expectDELETE('/api/election/el-abc123')
                        .respond(204, '');

                    adapter.erase('election', model).then(success);

                    $httpBackend.flush();
                });

                it('should resolve to null', function() {
                    expect(success).toHaveBeenCalledWith(null);
                });
            });

            describe('update(type, model)', function() {
                var success,
                    model,
                    response;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    model = {
                        id: 'e1',
                        created: '489f48jhf8uir',
                        org: '48fhf9483',
                        ballot:   {
                            'b1' : { 'red apple'  : 10, 'yellow banana'  : 20, 'orange carrot'  : 30 },
                            'b2' : { 'one chicken': 0, 'two ducks'      : 2 }
                        }
                    };

                    response = extend(copy(model), { foo: 'bar' });

                    $httpBackend.expectPUT('/api/election/e1', {
                        ballot:   {
                            'b1' : { 'red apple'  : 10, 'yellow banana'  : 20, 'orange carrot'  : 30 },
                            'b2' : { 'one chicken': 0, 'two ducks'      : 2 }
                        }
                    }).respond(200, response);

                    adapter.update('election', model).then(success);

                    $httpBackend.flush();
                });

                it('should resolve to an array of the result', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });
        });
    });
}());
