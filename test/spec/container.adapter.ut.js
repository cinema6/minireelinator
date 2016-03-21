define(['app'], function(appModule) {
    'use strict';

    describe('ContainerAdapter', function() {
        var ContainerAdapter,
            adapter,
            $rootScope,
            $httpBackend;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                ContainerAdapter = $injector.get('ContainerAdapter');
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                ContainerAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(ContainerAdapter, {
                    config: ContainerAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var containers;

            beforeEach(function() {
                containers = [
                    {
                        id: 'con-63b7ff37cf052d'
                    },
                    {
                        id: 'con-2859fcb4c2b967'
                    },
                    {
                        id: 'con-38b9a475337d2e'
                    },
                    {
                        id: 'con-032e75a76f052f'
                    }
                ];

                $httpBackend.expectGET('/api/containers')
                    .respond(200, containers);

                adapter.findAll('container').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the containers', function() {
                expect(success).toHaveBeenCalledWith(containers);
            });
        });

        describe('findQuery(type, query)', function() {
            var containers;

            beforeEach(function() {
                containers = [
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

                $httpBackend.expectGET('/api/containers?ids=con-111,con-222,con-333')
                    .respond(200, containers);

                adapter.findQuery('container', {
                    ids: 'con-111,con-222,con-333'
                }).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the containers', function() {
                expect(success).toHaveBeenCalledWith(containers);
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/containers?name=Beeswax')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('container', {
                        name: 'Beeswax'
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

                        $httpBackend.expectGET('/api/containers?name=Beeswax')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('container', {
                            name: 'Beeswax'
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

        describe('find(type, id)', function() {
            var container;

            beforeEach(function() {
                container = {
                    id: 'con-addca077b557eb'
                };

                $httpBackend.expectGET('/api/containers/con-addca077b557eb')
                    .respond(200, container);

                adapter.find('container', 'con-addca077b557eb').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the container in an array', function() {
                expect(success).toHaveBeenCalledWith([container]);
            });
        });

        describe('create(type, data)', function() {
            var container;

            beforeEach(function() {
                container = {
                    label: 'Beeswax',
                    name: 'beeswax',
                    defaultTagParams: {
                        mraid: {},
                        vpaid: {}
                    }
                };

                $httpBackend.expectPOST('/api/containers', container)
                    .respond(201, container);

                $rootScope.$apply(function() {
                    adapter.create('container', container).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([container]);
            });
        });

        describe('update(type, data)', function() {
            var container;

            beforeEach(function() {
                container = {
                    id: 'con-111',
                    label: 'Beeswax',
                    name: 'beeswax',
                    defaultTagParams: {
                        mraid: {},
                        vpaid: {}
                    }
                };

                $httpBackend.expectPUT('/api/containers/con-111', container)
                    .respond(200, container);

                $rootScope.$apply(function() {
                    adapter.update('container', container).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([container]);
            });
        });

        describe('erase(type, data)', function() {
            var container;

            beforeEach(function() {
                container = {
                    id: 'con-111',
                    label: 'Beeswax',
                    name: 'beeswax',
                    defaultTagParams: {
                        mraid: {},
                        vpaid: {}
                    }
                };

                $httpBackend.expectDELETE('/api/containers/con-111')
                    .respond(200, container);

                $rootScope.$apply(function() {
                    adapter.erase('container', container).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith(null);
            });
        });
    });
});
