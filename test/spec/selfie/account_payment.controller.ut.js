define(['app'], function(appModule) {
    'use strict';

    describe('SelfieAccountPaymentController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            $q,
            cinema6,
            SelfieAccountPaymentCtrl;

        var paymentMethods;

        function PaymentMethod() {
            var self = this;
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
                new PaymentMethod(),
                new PaymentMethod(),
                new PaymentMethod()
            ];

            cState = {
                token: '1234-4321'
            };

            spyOn(cinema6.db, 'findAll');
            spyOn(cinema6.db, 'create');

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieAccountPaymentCtrl = $controller('SelfieAccountPaymentController', {cState: cState, $scope: $scope});
            });
        });

        it('should exist', function() {
            expect(SelfieAccountPaymentCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel()', function() {
                it('add the model and the token', function() {
                    SelfieAccountPaymentCtrl.initWithModel(paymentMethods);

                    expect(SelfieAccountPaymentCtrl.model).toBe(paymentMethods);
                    expect(SelfieAccountPaymentCtrl.token).toBe(cState.token);
                });
            });

            describe('makeDefault(method)', function() {
                var updatedModel;

                beforeEach(function() {
                    paymentMethods[1].cardholderName = 'Johnny Testmonkey';

                    updatedModel = [
                        new PaymentMethod()
                    ];

                    cinema6.db.findAll.and.returnValue($q.when(updatedModel));

                    $scope.$apply(function() {
                        SelfieAccountPaymentCtrl.makeDefault(paymentMethods[1]);
                    });
                });

                it('should set makeDefault and cardholderName and then save', function() {
                    expect(paymentMethods[1].makeDefault).toBe(true);
                    expect(paymentMethods[1].cardholderName).toBe(undefined);
                    expect(paymentMethods[1].save).toHaveBeenCalled();
                });

                it('should refresh the model when save is successful', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalled();
                    expect(SelfieAccountPaymentCtrl.model).toEqual(updatedModel);
                });
            });

            describe('edit(method)', function() {
                it('should go to Selfie:Account:Payment:Edit state', function() {
                    spyOn(c6State, 'goTo');

                    SelfieAccountPaymentCtrl.edit(paymentMethods[1]);

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Account:Payment:Edit', [paymentMethods[1]]);
                });
            });

            describe('delete(method)', function() {
                it('should erase the method and refresh the model', function() {
                    var updatedModel = [
                        new PaymentMethod()
                    ];

                    cinema6.db.findAll.and.returnValue($q.when(updatedModel));

                    $scope.$apply(function() {
                        SelfieAccountPaymentCtrl.delete(paymentMethods[1]);
                    });

                    expect(paymentMethods[1].erase).toHaveBeenCalled();
                    expect(cinema6.db.findAll).toHaveBeenCalled();
                    expect(SelfieAccountPaymentCtrl.model).toEqual(updatedModel);
                });
            });

            describe('paypalSuccess(method)', function() {
                it('should create a payment method DB model and save it', function() {
                    var newPaypal = new PaymentMethod(),
                        updatedModel = [
                            new PaymentMethod()
                        ],
                        braintreeObject = {
                            nonce: '1234-4321'
                        };

                    cinema6.db.create.and.returnValue(newPaypal);
                    cinema6.db.findAll.and.returnValue($q.when(updatedModel));

                    $scope.$apply(function() {
                        SelfieAccountPaymentCtrl.paypalSuccess(braintreeObject);
                    });

                    expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {
                        paymentMethodNonce: braintreeObject.nonce
                    });
                    expect(newPaypal.save).toHaveBeenCalled();
                    expect(cinema6.db.findAll).toHaveBeenCalled();
                    expect(SelfieAccountPaymentCtrl.model).toEqual(updatedModel);
                });
            });
        });
    });
});