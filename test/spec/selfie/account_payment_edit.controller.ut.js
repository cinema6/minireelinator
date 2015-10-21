define(['app'], function(appModule) {
    'use strict';

    describe('SelfieAccountPaymentEditController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            $q,
            cinema6,
            SelfieAccountPaymentEditCtrl;

        var paymentMethods;

        function PaymentMethod(token) {
            var self = this;
            this.token = token;
            this.save = jasmine.createSpy('save()').and.returnValue($q.when(self));
            this.erase = jasmine.createSpy('erase()').and.returnValue($q.when(self));
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
            });

            paymentMethods = [
                new PaymentMethod('pay-111'),
                new PaymentMethod('pay-222'),
                new PaymentMethod('pay-333')
            ];

            cState = {
                token: '1234-4321'
            };

            $scope = $rootScope.$new();
            $scope.SelfieAccountPaymentCtrl = {
                model: paymentMethods
            };
            $scope.$apply(function() {
                SelfieAccountPaymentEditCtrl = $controller('SelfieAccountPaymentEditController', {cState: cState, $scope: $scope});
            });
        });

        it('should exist', function() {
            expect(SelfieAccountPaymentEditCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel()', function() {
                it('add the model and the token', function() {
                    var model = new PaymentMethod('pay-123');

                    SelfieAccountPaymentEditCtrl.initWithModel(model);

                    expect(SelfieAccountPaymentEditCtrl.model).toBe(model);
                    expect(SelfieAccountPaymentEditCtrl.token).toBe(cState.token);
                });
            });

            describe('success(method)', function() {
                var model, braintreeObject;

                beforeEach(function() {
                    model = paymentMethods[1];
                    model.cardholderName = 'Moneybags McGee';

                    braintreeObject = {
                        cardholderName: 'Johnny Testmonkey',
                        nonce: '1234-4321',
                        makeDefault: false
                    };

                    spyOn(c6State, 'goTo');

                    SelfieAccountPaymentEditCtrl.initWithModel(model);

                    $scope.$apply(function() {
                        SelfieAccountPaymentEditCtrl.success(braintreeObject);
                    });
                });

                it('should add the cardholderName, nonce and makeDefault props to the model', function() {
                    expect(model).toEqual(jasmine.objectContaining({
                        cardholderName: braintreeObject.cardholderName,
                        paymentMethodNonce: braintreeObject.nonce,
                        makeDefault: braintreeObject.makeDefault
                    }));
                });

                it('should save the model', function() {
                    expect(model.save).toHaveBeenCalled();
                });

                it('should go to the Selfie:Account:Payment state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Account:Payment');
                });
            });

            describe('cancel()', function() {
                it('should go to Selfie:Account:Payment state', function() {
                    spyOn(c6State, 'goTo');

                    SelfieAccountPaymentEditCtrl.cancel();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Account:Payment');
                });
            });
        });
    });
});