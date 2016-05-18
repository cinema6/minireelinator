define(['app'], function(appModule) {
    'use strict';

    describe('PlacementAdapter', function() {
        var PlacementAdapter,
            adapter,
            $rootScope,
            $httpBackend;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                PlacementAdapter = $injector.get('PlacementAdapter');
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                PlacementAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(PlacementAdapter, {
                    config: PlacementAdapter.config
                });
            });
        });

        afterAll(function() {
            PlacementAdapter = null;
            adapter = null;
            $rootScope = null;
            $httpBackend = null;
            success = null;
            failure = null;
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var placements;

            beforeEach(function() {
                placements = [
                    {
                        id: 'pl-63b7ff37cf052d'
                    },
                    {
                        id: 'pl-2859fcb4c2b967'
                    },
                    {
                        id: 'pl-38b9a475337d2e'
                    },
                    {
                        id: 'pl-032e75a76f052f'
                    }
                ];

                $httpBackend.expectGET('/api/placements')
                    .respond(200, placements);

                adapter.findAll('placement').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the placements', function() {
                expect(success).toHaveBeenCalledWith(placements);
            });
        });

        describe('findQuery(type, query)', function() {
            var placements;

            beforeEach(function() {
                placements = [
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

                $httpBackend.expectGET('/api/placements?ids=pl-111,pl-222,pl-333')
                    .respond(200, placements);

                adapter.findQuery('placement', {
                    ids: 'pl-111,pl-222,pl-333'
                }).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the placements', function() {
                expect(success).toHaveBeenCalledWith(placements);
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/placements?name=Beeswax')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('placement', {
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

                        $httpBackend.expectGET('/api/placements?name=Beeswax')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('placement', {
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
            var placement;

            beforeEach(function() {
                placement = {
                    id: 'pl-addca077b557eb'
                };

                $httpBackend.expectGET('/api/placements/pl-addca077b557eb')
                    .respond(200, placement);

                adapter.find('placement', 'pl-addca077b557eb').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the placement in an array', function() {
                expect(success).toHaveBeenCalledWith([placement]);
            });
        });

        describe('create(type, data)', function() {
            var placement;

            beforeEach(function() {
                placement = {
                    label: 'Beeswax',
                    name: 'beeswax',
                    tagParams: {}
                };

                $httpBackend.expectPOST('/api/placements', placement)
                    .respond(201, placement);

                $rootScope.$apply(function() {
                    adapter.create('placement', placement).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([placement]);
            });
        });

        describe('update(type, data)', function() {
            var placement;

            beforeEach(function() {
                placement = {
                    id: 'pl-111',
                    label: 'Beeswax',
                    name: 'beeswax',
                    tagParams: {}
                };

                $httpBackend.expectPUT('/api/placements/pl-111', placement)
                    .respond(200, placement);

                $rootScope.$apply(function() {
                    adapter.update('placement', placement).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([placement]);
            });
        });

        describe('erase(type, data)', function() {
            var placement;

            beforeEach(function() {
                placement = {
                    id: 'pl-111',
                    label: 'Beeswax',
                    name: 'beeswax',
                    tagParams: {}
                };

                $httpBackend.expectDELETE('/api/placements/pl-111')
                    .respond(200, placement);

                $rootScope.$apply(function() {
                    adapter.erase('placement', placement).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith(null);
            });
        });
    });
});
