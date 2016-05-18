define(['app'], function(appModule) {
    'use strict';

    describe('TransactionAdpater', function() {
        var TransactionAdapter,
            cinema6,
            $q,
            $rootScope,
            adapter,
            PaymentService;

        var $httpBackend,
            success,
            failure;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
                TransactionAdapter = $injector.get('TransactionAdapter');
                TransactionAdapter.config ={
                    apiBase: '/api'
                };

                adapter = $injector.instantiate(TransactionAdapter, {
                    config: TransactionAdapter.config
                });

                $httpBackend = $injector.get('$httpBackend');
            });

            success = jasmine.createSpy('success');
            failure = jasmine.createSpy('failure');
        });

        afterAll(function() {
            TransactionAdapter = null;
            cinema6 = null;
            $q = null;
            $rootScope = null;
            adapter = null;
            PaymentService = null;
            $httpBackend = null;
            success = null;
            failure = null;
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('decorateTransactions(transactions)', function() {
            var promosDeferred, paymentsDeferred;

            beforeEach(function() {
                promosDeferred = $q.defer();
                paymentsDeferred = $q.defer();

                spyOn(cinema6.db, 'findAll').and.returnValue(promosDeferred.promise);
                spyOn(PaymentService, 'getPayments').and.returnValue(paymentsDeferred.promise);
            });

            describe('when there are no transactions', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        adapter.decorateTransactions([]).then(success, failure);
                    });
                });

                it('should not request payments by ids', function() {
                    expect(PaymentService.getPayments).not.toHaveBeenCalled();
                });

                it('should not request promotions by ids', function() {
                    expect(cinema6.db.findAll).not.toHaveBeenCalledWith('promotion', jasmine.any(Object));
                });

                it('should return an empty array', function() {
                    expect(success).toHaveBeenCalledWith([]);
                });
            });

            describe('when there are transactions', function() {
                var transactions;

                beforeEach(function() {
                    transactions = [
                        {
                            id: 't-111',
                            braintreeId: 'pay-111',
                            promotion: 'promo-111',
                            amount: 50
                        },
                        {
                            id: 't-222',
                            amount: 75.22
                        },
                        {
                            id: 't-333',
                            braintreeId: 'pay-333',
                            amount: 50
                        },
                        {
                            id: 't-444',
                            promotion: 'promo-444',
                            amount: 50
                        }
                    ];

                    $rootScope.$apply(function() {
                        adapter.decorateTransactions(transactions).then(success, failure);
                    });
                });

                it('should request payments by ids', function() {
                    expect(PaymentService.getPayments).toHaveBeenCalledWith('pay-111,pay-333');
                });

                it('should request promotions by ids', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('promotion', {
                        ids: 'promo-111,promo-444'
                    });
                });

                describe('when payments and promotions are fetched', function() {
                    it('should put them on the transaction', function() {
                        var promotions = [
                            {
                                id: 'promo-111'
                            },
                            {
                                id: 'promo-444'
                            }
                        ];

                        var payments = [
                            {
                                id: 'pay-111'
                            },
                            {
                                id: 'pay-333'
                            }
                        ];

                        $rootScope.$apply(function() {
                            promosDeferred.resolve(promotions);
                            paymentsDeferred.resolve(payments);
                        });

                        expect(transactions[0].payment).toEqual(payments[0]);
                        expect(transactions[0].promotion).toEqual(promotions[0]);
                        expect(transactions[1].payment).toEqual(undefined);
                        expect(transactions[1].promotion).toEqual(undefined);
                        expect(transactions[2].payment).toEqual(payments[1]);
                        expect(transactions[2].promotion).toEqual(undefined);
                        expect(transactions[3].payment).toEqual(undefined);
                        expect(transactions[3].promotion).toEqual(promotions[1]);
                    });
                });

                describe('when payments or promotions fail', function() {
                    it('should reject the promise', function() {
                        var payments = [
                            {
                                id: 'pay-111'
                            },
                            {
                                id: 'pay-333'
                            }
                        ];

                        $rootScope.$apply(function() {
                            promosDeferred.reject();
                            paymentsDeferred.resolve(payments);
                        });

                        expect(failure).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('findAll(type)', function() {
            var transactions;

            beforeEach(function() {
                transactions = [
                    {
                        id: 't-63b7ff37cf052d'
                    },
                    {
                        id: 't-2859fcb4c2b967'
                    },
                    {
                        id: 't-38b9a475337d2e'
                    },
                    {
                        id: 't-032e75a76f052f'
                    }
                ];

                spyOn(adapter, 'decorateTransactions').and.callThrough();

                $httpBackend.expectGET('/api/transactions')
                    .respond(200, transactions);

                adapter.findAll('transaction').then(success, failure);

                $httpBackend.flush();
            });

            it('should decorate the transactions', function() {
                expect(adapter.decorateTransactions).toHaveBeenCalled();
            });

            it('should resolve to the transactions', function() {
                expect(success).toHaveBeenCalledWith(transactions);
            });
        });

        describe('findQuery(type, query, meta)', function() {
            var transactions,
                meta;

            beforeEach(function() {
                meta = {};

                transactions = [
                    {
                        id: 't-63b7ff37cf052d'
                    },
                    {
                        id: 't-2859fcb4c2b967'
                    },
                    {
                        id: 't-38b9a475337d2e'
                    },
                    {
                        id: 't-032e75a76f052f'
                    }
                ];

                spyOn(adapter, 'decorateTransactions').and.callThrough();

                $httpBackend.expectGET('/api/transactions?limit=50&skip=100')
                    .respond(200, transactions, {
                        'Content-Range': 'items 51-100/320'
                    });

                adapter.findQuery('transaction', {
                    limit: 50,
                    skip: 100
                }, meta).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the transactions', function() {
                expect(success).toHaveBeenCalledWith(transactions);
            });

            it('should decorate the meta object with pagination info', function() {
                expect(meta.items).toEqual({
                    start: 51,
                    end: 100,
                    total: 320
                });
            });

            it('should decorate every campaign', function() {
                expect(adapter.decorateTransactions).toHaveBeenCalledWith(transactions);
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/transactions?user=u-25d5a5bab3e33c')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('transaction', {
                        user: 'u-25d5a5bab3e33c'
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

                        $httpBackend.expectGET('/api/transactions?org=o-9294f9bb2f92b8')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('transaction', {
                            org: 'o-9294f9bb2f92b8'
                        }).then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should reject', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: 'IT FAILED'
                        }));
                    });
                });
            });
        });

        describe('find(type, id)', function() {
            it('should fail', function() {
                $rootScope.$apply(function() {
                    adapter.find('transaction', 't-123').catch(failure);
                });

                expect(failure).toHaveBeenCalledWith('TransactionAdapter.find() is not implemented.');
            });
        });

        describe('create(type, data)', function() {
            it('should fail', function() {
                $rootScope.$apply(function() {
                    adapter.create('transaction', {}).catch(failure);
                });

                expect(failure).toHaveBeenCalledWith('TransactionAdapter.create() is not implemented.');
            });
        });

        describe('update(type, data)', function() {
            it('should fail', function() {
                $rootScope.$apply(function() {
                    adapter.update('transaction', {}).catch(failure);
                });

                expect(failure).toHaveBeenCalledWith('TransactionAdapter.update() is not implemented.');
            });
        });

        describe('erase(type, id)', function() {
            it('should fail', function() {
                $rootScope.$apply(function() {
                    adapter.erase('transaction', 't-123').catch(failure);
                });

                expect(failure).toHaveBeenCalledWith('TransactionAdapter.erase() is not implemented.');
            });
        });
    });
});
