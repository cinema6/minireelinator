define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Account:Payment:New State', function() {
        var c6State,
            $rootScope,
            $q,
            PaymentState,
            cinema6,
            PaymentService,
            paymentModel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');

                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
            });

            paymentModel = cinema6.db.create('paymentMethod', {
                paymentMethodNonce: null,
                cardholderName: null,
                makeDefault: false
            });

            spyOn(cinema6.db, 'create').and.callThrough();
            spyOn(PaymentService, 'getToken').and.returnValue($q.when('1234-4321'));

            PaymentState = c6State.get('Selfie:Account:Payment:New');
        });

        it('should exist', function() {
            expect(PaymentState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            it('should create a new payment method DB model', function() {
                var model = PaymentState.model();

                expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {
                    paymentMethodNonce: null,
                    cardholderName: null,
                    makeDefault: false
                });
                expect(model).toEqual(paymentModel);
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
