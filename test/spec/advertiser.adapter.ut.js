define(['app'], function(appModule) {
    'use strict';

    describe('AdvertiserAdapter', function() {
        var AdvertiserAdapter,
            adapter,
            $rootScope,
            $httpBackend;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                AdvertiserAdapter = $injector.get('AdvertiserAdapter');
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                AdvertiserAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(AdvertiserAdapter, {
                    config: AdvertiserAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var advertisers;

            beforeEach(function() {
                advertisers = [
                    {
                        id: 'a-63b7ff37cf052d'
                    },
                    {
                        id: 'a-2859fcb4c2b967'
                    },
                    {
                        id: 'a-38b9a475337d2e'
                    },
                    {
                        id: 'a-032e75a76f052f'
                    }
                ];

                $httpBackend.expectGET('/api/account/advertisers')
                    .respond(200, advertisers);

                adapter.findAll('advertiser').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the advertisers', function() {
                expect(success).toHaveBeenCalledWith(advertisers);
            });
        });

        describe('findQuery(type, query)', function() {
            var advertisers;

            beforeEach(function() {
                advertisers = [
                    {
                        id: ''
                    },
                    {
                        id: ''
                    },
                    {
                        id: ''
                    }
                ];

                $httpBackend.expectGET('/api/account/advertisers?org=o-d09f44a70348b1&sort=created,1')
                    .respond(200, advertisers);

                adapter.findQuery('advertiser', {
                    org: 'o-d09f44a70348b1',
                    sort: 'created,1'
                }).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the advertisers', function() {
                expect(success).toHaveBeenCalledWith(advertisers);
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/account/advertisers?user=u-c680b577e3eb9d')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('advertiser', {
                        user: 'u-c680b577e3eb9d'
                    }).then(success, failure);

                    $httpBackend.flush();
                });

                it('should resolve to an empty array', function() {
                    expect(success).toHaveBeenCalledWith([]);
                });
            });

            [401, 403, 500].forEach(function(status) {
                describe('if the status is ' + status, function() {
                    beforeEach(function() {
                        failure.calls.reset();

                        $httpBackend.expectGET('/api/account/advertisers?sort=lastUpdated,-1')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('advertiser', {
                            sort: 'lastUpdated,-1'
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
