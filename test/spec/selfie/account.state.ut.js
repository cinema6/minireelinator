define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Account State', function() {
        var c6State,
            $rootScope,
            $q,
            AccountState,
            SelfieState,
            cinema6,
            user,
            paymentMethods,
            PaymentService;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                PaymentService = $injector.get('PaymentService');
            });

            user = {
                firstName: 'Selfie',
                lastName: 'User',
                company: 'Selfie, Inc.'
            };

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

            SelfieState = c6State.get('Selfie');
            SelfieState.cModel = user;

            AccountState = c6State.get('Selfie:Account');
        });

        it('should exist', function() {
            expect(AccountState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            it('should return an empty login model', function() {
                expect(AccountState.model()).toEqual(user);
            });
        });

        describe('afterModel()', function() {
            it('should fetch all payment methods and get account balance', function() {
                spyOn(PaymentService, 'getBalance').and.returnValue($q.when({}));

                $rootScope.$apply(function() {
                    AccountState.afterModel();
                });
                expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                expect(PaymentService.getBalance).toHaveBeenCalled();
                expect(AccountState.paymentMethods).toBe(paymentMethods);
            });
        });

        describe('enter()', function() {
            it('should go to the Overview', function() {
                spyOn(c6State, 'goTo');

                AccountState.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Account:Overview');
            });
        });
    });
});
