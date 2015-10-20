define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    var copy = angular.copy;

    function extend() {
        var objects = Array.prototype.slice.call(arguments);

        return objects.reduce(function(result, object) {
            return Object.keys(object).reduce(function(result, key) {
                result[key] = object[key];
                return result;
            }, result);
        }, {});
    }

    function decoratePayments(payments) {
        return payments.map(function(payment) {
            return extend(payment, {
                id: payment.token
            });
        });
    }

    describe('PaymentMethodAdapter', function() {
        var PaymentAdapter,
            adapter,
            $rootScope,
            $q,
            $httpBackend,
            cinema6;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                PaymentAdapter = $injector.get('PaymentMethodAdapter');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $httpBackend = $injector.get('$httpBackend');
                cinema6 = $injector.get('cinema6');

                PaymentAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(PaymentAdapter, {
                    config: PaymentAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('findAll(type)', function() {
            var payments, decoratedPayments, response;

            beforeEach(function() {
                payments = [
                    {
                        token: 'pay-b4aa9c3f6b49eb'
                    },
                    {
                        token: 'pay-a9378d9b2ede14'
                    },
                    {
                        token: 'pay-9818a0fb34cd3c'
                    }
                ];

                decoratedPayments = decoratePayments(payments);

                $httpBackend.expectGET('/api/payments/methods')
                    .respond(200, payments);

                adapter.findAll('paymentMethod').then(success, failure);

                $httpBackend.flush();

                response = success.calls.mostRecent().args[0];
            });

            it('should decorate every campaign', function() {
                response.forEach(function(payment) {
                    expect(payment.id).toEqual(payment.token);
                });
            });

            it('should resolve to the payments', function() {
                expect(success).toHaveBeenCalledWith(decoratedPayments);
            });
        });

        describe('find(type, id)', function() {
            it('should reject the request because it is not supported', function() {
                $rootScope.$apply(function() {
                    adapter.find('paymentMethod', 'pay-123').then(success, failure);
                });

                expect(failure).toHaveBeenCalledWith('PaymentMethodAdapter.find() is not implemented.');
            });
        });

        describe('findQuery(type, query, meta)', function() {
            var payments, decoratedPayments, response;

            beforeEach(function() {
                payments = [
                    {
                        token: 'pay-0e94754de1bc35'
                    },
                    {
                        token: 'pay-dbe004becbcf77'
                    }
                ];

                decoratedPayments = decoratePayments(payments);

                $httpBackend.expectGET('/api/payments/methods?limit=50&skip=100')
                    .respond(200, payments, {
                        'Content-Range': 'items 51-100/320'
                    });

                $rootScope.$apply(function() {
                    adapter.findQuery('campaign', {
                        limit: 50,
                        skip: 100
                    }).then(success, failure);
                });

                $httpBackend.flush();

                response = success.calls.mostRecent().args[0];
            });

            it('should resolve to the payments', function() {
                expect(success).toHaveBeenCalledWith(decoratedPayments);
            });

            it('should decorate every campaign', function() {
                response.forEach(function(payment) {
                    expect(payment.id).toEqual(payment.token);
                });
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/payments/methods?user=u-25d5a5bab3e33c')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('campaign', {
                        user: 'u-25d5a5bab3e33c'
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

                        $httpBackend.expectGET('/api/payments/methods?org=o-9294f9bb2f92b8')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('campaign', {
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

        describe('create(type, data)', function() {
            var postData, payment, decoratedPayment, response;

            beforeEach(function() {
                postData = {
                    paymentMethodNonce: '1234-4321-5678-8765',
                    cardholderName: 'Johnny Testmonkey',
                    makeDefault: true
                };

                payment = {
                    cardholderName: 'Johnny Testmonkey',
                    default: true,
                    type: 'creditCard',
                    token: '123456',
                    cardType: 'Visa',
                    expirationDate: '11/2019',
                    last4: 2037
                };

                decoratedPayment = extend(payment, {
                    id: payment.token
                });

                $httpBackend.expectPOST('/api/payments/methods', postData)
                    .respond(201, payment);

                $rootScope.$apply(function() {
                    adapter.create('paymentMethod', postData).then(success, failure);
                });

                $httpBackend.flush();

                response = success.calls.mostRecent().args[0];
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([decoratedPayment]);
            });

            it('should decorate the payment', function() {
                expect(response.id).toEqual(response.token);
            });
        });

        describe('erase(type, model)', function() {
            var payment;

            beforeEach(function() {
                payment = {
                    token: 'pay-f3199b8de31932'
                };

                $httpBackend.expectDELETE('/api/payments/methods/' + payment.token)
                    .respond(204, '');

                adapter.erase('paymentMethod', payment).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to null', function() {
                expect(success).toHaveBeenCalledWith(null);
            });
        });

        describe('update(type, model)', function() {
            var undecoratedPayment, payment, response;

            beforeEach(function() {
                payment = {
                    id: 'pay-2d56941fa19b69',
                    token: 'pay-2d56941fa19b69',
                    cardholderName: 'Johnny Testmonkey',
                    default: true,
                    type: 'creditCard',
                    cardType: 'Visa',
                    expirationDate: '11/2019',
                    last4: 2037
                };

                // edit some props
                payment.makeDefault = false;
                payment.paymentMethodNonce = '1234-4321';

                undecoratedPayment = {
                    makeDefault: false,
                    paymentMethodNonce: '1234-4321',
                    cardholderName: 'Johnny Testmonkey'
                };

                // response will have a new value for payemnt.default
                response = extend(payment, {
                    lastUpdated: (new Date()).toISOString(),
                    default: false
                });

                $httpBackend.expectPUT('/api/payments/methods/' + payment.token, undecoratedPayment)
                    .respond(200, response);

                $rootScope.$apply(function() {
                    adapter.update('paymentMethod', payment).then(success, failure);
                });

                $httpBackend.flush();
            });

            it('should resolve to the response in an array', function() {
                expect(success).toHaveBeenCalledWith([response]);
            });

            it('should decorate the payment', function() {
                expect(response.id).toEqual(response.token);
            });
        });
    });
});
