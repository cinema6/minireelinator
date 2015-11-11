define(['app'], function(appModule) {
    'use strict';

    describe('ExpGroupAdapter', function() {
        var ExpGroupAdapter,
            adapter,
            $rootScope,
            $httpBackend;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                ExpGroupAdapter = $injector.get('ExpGroupAdapter');
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                ExpGroupAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(ExpGroupAdapter, {
                    config: ExpGroupAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var expGroups;

            beforeEach(function() {
                expGroups = [
                    {
                        id: 'eg-79de52874bdb15'
                    },
                    {
                        id: 'eg-8fd147f677e863'
                    },
                    {
                        id: 'eg-69bfcdfbff795b'
                    },
                    {
                        id: 'eg-b76c97dfef7fac'
                    },
                    {
                        id: 'eg-4ff1e7921ee338'
                    }
                ];

                $httpBackend.expectGET('/api/expgroups')
                    .respond(200, expGroups);

                adapter.findAll('expGroup').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the expGroups', function() {
                expect(success).toHaveBeenCalledWith(expGroups);
            });
        });

        describe('findQuery(type, query)', function() {
            var expGroups;

            beforeEach(function() {
                expGroups = [
                    {
                        id: 'eg-8fd147f677e863'
                    },
                    {
                        id: 'eg-69bfcdfbff795b'
                    },
                    {
                        id: 'eg-4ff1e7921ee338'
                    }
                ];

                $httpBackend.expectGET('/api/expgroups?limit=10&sort=created,1&user=u-9a317656717207')
                    .respond(200, expGroups);

                adapter.findQuery('expGroup', {
                    limit: 10,
                    sort: 'created,1',
                    user: 'u-9a317656717207'
                }).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the expGroups', function() {
                expect(success).toHaveBeenCalledWith(expGroups);
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/expgroups?org=o-81bc9a6ce00111')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('expGroup', {
                        org: 'o-81bc9a6ce00111'
                    }).then(success, failure);

                    $httpBackend.flush();
                });

                it('should resolve to an empty array', function() {
                    expect(success).toHaveBeenCalledWith([]);
                });
            });

            [403, 500].forEach(function(status) {
                describe('if the status is ' + status, function() {
                    beforeEach(function() {
                        failure.calls.reset();

                        $httpBackend.expectGET('/api/expgroups?user=u-afe304b06f0aa7')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('expGroup', {
                            user: 'u-afe304b06f0aa7'
                        }).then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should be rejected', function() {
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
