define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Account:Payment State', function() {
        var c6State,
            $rootScope,
            $q,
            PaymentState,
            cinema6,
            PaymentService,
            paymentMethods;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');

                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
            });

            paymentMethods = [
                {
                    id: 'pay-123',
                    token: 'pay-123'
                },
                {
                    id: 'pay-321',
                    token: 'pay-321'
                }
            ];

            spyOn(cinema6.db, 'findAll').and.returnValue($q.when(paymentMethods));
            spyOn(PaymentService, 'getToken').and.returnValue($q.when('1234-4321'));

            PaymentState = c6State.get('Selfie:Account:Payment');
        });

        it('should exist', function() {
            expect(PaymentState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            it('should find all payment methods', function() {
                var success = jasmine.createSpy('success()'),
                    failure = jasmine.createSpy('failure()');

                $rootScope.$apply(function() {
                    PaymentState.model().then(success, failure);
                });

                expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                expect(success).toHaveBeenCalledWith(paymentMethods);
            });
        });

        describe('afterModel()', function() {
            it('should fetch a payment token', function() {
                PaymentState.afterModel();
                $rootScope.$digest();

                expect(PaymentService.getToken).toHaveBeenCalled();
                expect(PaymentState.token).toEqual('1234-4321');
            });
        });
    });
});
