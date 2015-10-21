define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Account:Payment:History State', function() {
        var c6State,
            $rootScope,
            $q,
            PaymentHistoryState,
            PaymentService,
            transactions;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');

                c6State = $injector.get('c6State');
                PaymentService = $injector.get('PaymentService');
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

            spyOn(PaymentService, 'getHistory').and.returnValue($q.when(transactions));

            PaymentHistoryState = c6State.get('Selfie:Account:Payment:History');
        });

        it('should exist', function() {
            expect(PaymentHistoryState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            it('should fetch all payment transactions', function() {
                var success = jasmine.createSpy('success()');

                $rootScope.$apply(function() {
                    PaymentHistoryState.model().then(success);
                });

                expect(success).toHaveBeenCalledWith(transactions);
            });
        });
    });
});
