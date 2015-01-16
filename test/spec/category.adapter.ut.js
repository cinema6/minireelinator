define(['app'], function(appModule) {
    'use strict';

    describe('CategoryAdapter', function() {
        var CategoryAdapter,
            adapter,
            $rootScope,
            $httpBackend;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                CategoryAdapter = $injector.get('CategoryAdapter');
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                CategoryAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(CategoryAdapter, {
                    config: CategoryAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var categories;

            beforeEach(function() {
                categories = [
                    {
                        id: 'cat-013e767ed49884'
                    },
                    {
                        id: 'cat-a8caeb9f553d64'
                    },
                    {
                        id: 'cat-9bc68bee3e9d3a'
                    },
                    {
                        id: 'cat-98ccda8c445e69'
                    }
                ];

                $httpBackend.expectGET('/api/content/categories')
                    .respond(200, categories);

                adapter.findAll('category').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the categories', function() {
                expect(success).toHaveBeenCalledWith(categories);
            });
        });

        describe('findQuery(type, query)', function() {
            var categories;

            beforeEach(function() {
                categories = [
                    {
                        id: 'cat-8a53744926e323'
                    },
                    {
                        id: 'cat-f7c7a0c38e72f4'
                    }
                ];

                $httpBackend.expectGET('/api/content/categories?org=o-d7bc3ce57c382e')
                    .respond(200, categories);

                adapter.findQuery('category', {
                    org: 'o-d7bc3ce57c382e'
                }).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the categories', function() {
                expect(success).toHaveBeenCalledWith(categories);
            });

            describe('if the response is a 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/content/categories?user=u-f883319c615f6e')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('category', {
                        user: 'u-f883319c615f6e'
                    }).then(success, failure);

                    $httpBackend.flush();
                });

                it('should resolve to an empty array', function() {
                    expect(success).toHaveBeenCalledWith([]);
                });
            });

            [401, 403, 500].forEach(function(status) {
                describe('if the response is a ' + status, function() {
                    beforeEach(function() {
                        success.calls.reset();
                        failure.calls.reset();

                        $httpBackend.expectGET('/api/content/categories?org=o-cd71edda8cf41c')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('category', {
                            org: 'o-cd71edda8cf41c'
                        }).then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should reject the promise', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: 'IT FAILED'
                        }));
                    });
                });
            });
        });

        ['find', 'create', 'update', 'erase'].forEach(function(method) {
            describe(method + '()', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        adapter[method]().then(success, failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalledWith(jasmine.any(String));
                });
            });
        });
    });
});
