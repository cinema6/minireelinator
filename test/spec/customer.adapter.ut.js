define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    var identity = angular.identity;

    describe('CustomerAdapter', function() {
        var CustomerAdapter;

        var adapter,
            $rootScope,
            $httpBackend,
            cinema6;

        var success, failure;

        var advertisers;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name, function($injector) {
                CustomerAdapter = $injector.get('CustomerAdapter');
                CustomerAdapter.config = {
                    apiBase: '/api'
                };
            });

            inject(function($injector) {
                adapter = $injector.instantiate(CustomerAdapter, {
                    config: CustomerAdapter.config
                });

                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');
                cinema6 = $injector.get('cinema6');
            });

            advertisers = ['a-463a18bf9f2eae', 'a-0576dc173d2e4e', 'a-9df970ecb4f3d5', 'a-af63ea4fcbd711', 'a-1724508155d7d7', 'a-89025b0ed93863']
                .map(function(id) {
                    return cinema6.db.push('advertiser', id, {
                        id: id
                    });
                });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('decorate(customer)', function() {
            var customer;

            beforeEach(function() {
                customer = {
                    id: 'cus-37393e06494833',
                    advertisers: advertisers.map(function(advertiser) {
                        return advertiser.id;
                    })
                };

                $rootScope.$apply(function() {
                    adapter.decorate(customer).then(success, failure);
                });
            });

            it('should resolve to the customer', function() {
                expect(success).toHaveBeenCalledWith(customer);
            });

            it('should convert the list of advertiser ids into an array of actual advertisers', function() {
                expect(customer.advertisers).toEqual(advertisers);
            });
        });

        describe('findAll(type)', function() {
            var customers;
            var marker;

            beforeEach(function() {
                marker = {};

                customers = ['cus-f2a3e4bec1bb27', 'cus-37393e06494833', 'cus-3212d8798b7850', 'cus-e05e2fb3db9eed']
                    .map(function(id) {
                        return {
                            id: id
                        };
                    });

                spyOn(adapter, 'decorate').and.callFake(identity);
            });

            describe('when request is successful', function() {
                beforeEach(function() {
                    $httpBackend.expectGET('/api/account/customers')
                        .respond(200, customers);

                    adapter.findAll('customer').then(success, failure);

                    $httpBackend.flush();
                });

                it('should return all of the customers', function() {
                    expect(success).toHaveBeenCalledWith(customers);
                });

                it('should decorate all of the customers', function() {
                    customers.forEach(function(customer) {
                        expect(adapter.decorate).toHaveBeenCalledWith(customer);
                    });
                });
            });

            describe('when request fails', function() {
                it('should resovle with empty array of request fails', function() {
                    $httpBackend.expectGET('/api/account/customers')
                        .respond(404, 'Not Found');

                    adapter.findAll('customer').then(success, failure);

                    $httpBackend.flush();

                    expect(failure).not.toHaveBeenCalled();
                    expect(success).toHaveBeenCalledWith([]);
                });
            });
        });

        describe('find(type, id)', function() {
            var id, customer;

            beforeEach(function() {
                id = 'cus-37393e06494833';

                customer = {
                    id: 'cus-37393e06494833'
                };

                spyOn(adapter, 'decorate').and.callFake(identity);

                $httpBackend.expectGET('/api/account/customer/' + id)
                    .respond(200, customer);

                adapter.find('customer', id).then(success, failure);

                $httpBackend.flush();
            });

            it('should return the customer in an array', function() {
                expect(success).toHaveBeenCalledWith([customer]);
            });

            it('should decorate the customer', function() {
                expect(adapter.decorate).toHaveBeenCalledWith(customer);
            });
        });

        describe('findQuery(type, query)', function() {
            var customers;

            beforeEach(function() {
                customers = ['cus-a5e756477bc0f9', 'cus-9e7f2272198767', 'cus-4f4d5476284e2f']
                    .map(function(id) {
                        return {
                            id: id,
                            advertisers: []
                        };
                    });

                spyOn(adapter, 'decorate').and.callFake(identity);
            });

            describe('when request succeeds', function() {
                beforeEach(function() {
                    $httpBackend.expectGET('/api/account/customers?foo=bar&name=yahoo')
                        .respond(200, customers);

                    adapter.findQuery('customer', {
                        foo: 'bar',
                        name: 'yahoo'
                    }).then(success, failure);

                    $httpBackend.flush();
                });

                it('should return the customers', function() {
                    expect(success).toHaveBeenCalledWith(customers);
                });

                it('should decorate all of the customers', function() {
                    customers.forEach(function(customer) {
                        expect(adapter.decorate).toHaveBeenCalledWith(customer);
                    });
                });
            });

            describe('when request fails', function() {
                it('should return an empty array instead of rejecting the promise', function() {
                    $httpBackend.expectGET('/api/account/customers?foo=bar&name=yahoo')
                        .respond(404, 'Not Found');

                    adapter.findQuery('customer', {
                        foo: 'bar',
                        name: 'yahoo'
                    }).then(success, failure);

                    $httpBackend.flush();

                    expect(failure).not.toHaveBeenCalled();
                    expect(success).toHaveBeenCalledWith([]);
                });
            });
        });

        ['create', 'update', 'erase'].forEach(function(method) {
            describe(method + '()', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        adapter[method]().then(success, failure);
                    });
                });

                it('should reject with an error', function() {
                    expect(failure).toHaveBeenCalledWith(jasmine.any(Error));
                });
            });
        });
    });
});
