define(['app','minireel/services','minireel/mixins/PaginatedListState'], function(appModule, servicesModule, PaginatedListState) {
    'use strict';

    describe('Selfie:Account:Payment:History State', function() {
        var c6State,
            paginatedDbList,
            $rootScope,
            $q,
            $injector,
            PaymentHistoryState,
            PaymentService,
            SpinnerService,
            transactions;

        var dbList,
            deferred,
            balance;

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
                $provide.decorator('paginatedDbList', function($delegate, $q) {
                    return jasmine.createSpy('paginatedDbList()').and.callFake(function() {
                        deferred = $q.defer();
                        dbList = {
                            ensureResolution: jasmine.createSpy('ensureResolution()')
                                .and.returnValue(deferred.promise)
                        };

                        return dbList;
                    });
                });
            });

            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;
                spyOn($injector, 'invoke').and.callThrough();
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                paginatedDbList = $injector.get('paginatedDbList');

                c6State = $injector.get('c6State');
                PaymentService = $injector.get('PaymentService');
                SpinnerService = $injector.get('SpinnerService');
            });

            transactions = [
                {
                    id: 'trans-111',
                    campaign: 'cam-111'
                },
                {
                    id: 'trans-222',
                    campaign: 'cam-222'
                },
                {
                    id: 'trans-333',
                    campaign: 'cam-333'
                },
                {
                    id: 'trans-444',
                    campaign: 'cam-333'
                }
            ];

            balance = {
                balance: 1000,
                availableFunds: 500,
                totalSpend: 300
            };

            spyOn(PaymentService, 'getBalance').and.returnValue($q.when(balance));
            spyOn(SpinnerService, 'display');
            spyOn(SpinnerService, 'close');

            PaymentHistoryState = c6State.get('Selfie:Account:Payment:History');
        });

        it('should exist', function() {
            expect(PaymentHistoryState).toEqual(jasmine.any(Object));
        });

        it('should apply the PaginatedListState mixin', function() {
            expect($injector.invoke).toHaveBeenCalledWith(PaginatedListState, PaymentHistoryState);
        });

        describe('model()', function() {
            it('should return a paginatedDbList and should display a spinner while waiting', function() {
                var success = jasmine.createSpy('success()'),
                    list = [];

                $rootScope.$apply(function() {
                    PaymentHistoryState.model().then(success);
                });

                expect(SpinnerService.display).toHaveBeenCalled();
                expect(SpinnerService.close).not.toHaveBeenCalled();

                expect(paginatedDbList).toHaveBeenCalledWith('transaction', {
                    sort: 'created,-1'
                }, 50, 1);

                $rootScope.$apply(function() {
                    deferred.resolve(list);
                });

                expect(SpinnerService.close).toHaveBeenCalled();

                expect(success).toHaveBeenCalledWith(list);
            });
        });

        describe('afterModel()', function() {
            it('should get account balance', function() {
                $rootScope.$apply(function() {
                    PaymentHistoryState.afterModel();
                });

                expect(PaymentService.getBalance).toHaveBeenCalled();
                expect(PaymentHistoryState.accounting).toBe(balance);
            });
        });
    });
});
