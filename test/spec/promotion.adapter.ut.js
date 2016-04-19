define(['app'], function(appModule) {
    'use strict';

    describe('PromotionAdapter', function() {
        var PromotionAdapter,
            adapter,
            $rootScope,
            $httpBackend;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                PromotionAdapter = $injector.get('PromotionAdapter');
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                PromotionAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(PromotionAdapter, {
                    config: PromotionAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var promotions;

            beforeEach(function() {
                promotions = [
                    {
                        id: 'promo-63b7ff37cf052d'
                    },
                    {
                        id: 'promo-2859fcb4c2b967'
                    },
                    {
                        id: 'promo-38b9a475337d2e'
                    },
                    {
                        id: 'promo-032e75a76f052f'
                    }
                ];

                $httpBackend.expectGET('/api/promotions')
                    .respond(200, promotions);

                adapter.findAll('promotion').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the promotions', function() {
                expect(success).toHaveBeenCalledWith(promotions);
            });
        });

        describe('findQuery(type, query)', function() {
            var promotions;

            beforeEach(function() {
                promotions = [
                    {
                        id: 'promo-111'
                    },
                    {
                        id: 'promo-222'
                    },
                    {
                        id: 'promo-333'
                    }
                ];

                $httpBackend.expectGET('/api/promotions?ids=promo-111,promo-222,promo-333')
                    .respond(200, promotions);

                adapter.findQuery('promotion', {
                    ids: 'promo-111,promo-222,promo-333'
                }).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the promotions', function() {
                expect(success).toHaveBeenCalledWith(promotions);
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/promotions?name=Reward')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('promotion', {
                        name: 'Reward'
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

                        $httpBackend.expectGET('/api/promotions?name=Reward')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('promotion', {
                            name: 'Reward'
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
            var promotion;

            beforeEach(function() {
                promotion = {
                    id: 'promo-addca077b557eb'
                };

                $httpBackend.expectGET('/api/promotions/promo-addca077b557eb')
                    .respond(200, promotion);

                adapter.find('promotion', 'promo-addca077b557eb').then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the promotion in an array', function() {
                expect(success).toHaveBeenCalledWith([promotion]);
            });
        });

        describe('create(type, data)', function() {
            var promotion;

            beforeEach(function() {
                promotion = {
                    name: 'Reward',
                    tagParams: {}
                };

                $httpBackend.expectPOST('/api/promotions', promotion)
                    .respond(201, promotion);

                $rootScope.$apply(function() {
                    adapter.create('promotion', promotion).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([promotion]);
            });
        });

        describe('update(type, data)', function() {
            var promotion;

            beforeEach(function() {
                promotion = {
                    id: 'promo-111',
                    name: 'Reward'
                };

                $httpBackend.expectPUT('/api/promotions/promo-111', promotion)
                    .respond(200, promotion);

                $rootScope.$apply(function() {
                    adapter.update('promotion', promotion).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([promotion]);
            });
        });

        describe('erase(type, data)', function() {
            var promotion;

            beforeEach(function() {
                promotion = {
                    id: 'promo-111',
                    name: 'Reward',
                    tagParams: {}
                };

                $httpBackend.expectDELETE('/api/promotions/promo-111')
                    .respond(200, promotion);

                $rootScope.$apply(function() {
                    adapter.erase('promotion', promotion).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith(null);
            });
        });
    });
});
