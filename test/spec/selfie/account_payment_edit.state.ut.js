define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Account:Payment:Edit State', function() {
        var c6State,
            $rootScope,
            $q,
            PaymentState,
            PaymentService,
            allMethods;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');

                c6State = $injector.get('c6State');
                PaymentService = $injector.get('PaymentService');
            });

            allMethods = [
                {
                    id: 'pay-123',
                    token: 'pay-123'
                },
                {
                    id: 'pay-321',
                    token: 'pay-321'
                }
            ];

            spyOn(PaymentService, 'getToken').and.returnValue($q.when('1234-4321'));

            PaymentState = c6State.get('Selfie:Account:Payment:Edit');
            PaymentState.cParent = {
                cModel: allMethods
            };
        });

        it('should exist', function() {
            expect(PaymentState).toEqual(jasmine.any(Object));
        });

        describe('model(params)', function() {
            it('should find the payment method from the parent model', function() {
                expect(PaymentState.model({ id: 'pay-321' })).toEqual(allMethods[1]);
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
