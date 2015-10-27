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
            SelfieAccountPaymentCtrl,
            ConfirmDialogService;

        var paymentMethods,
            debouncedFns;

        function PaymentMethod() {
            var self = this;
            this.save = jasmine.createSpy('save()').and.returnValue($q.when(self));
            this.erase = jasmine.createSpy('erase()').and.returnValue($q.when(self));
        }

        beforeEach(function() {
            debouncedFns = [];

            module(appModule.name);
            module(function($provide) {
                $provide.decorator('c6AsyncQueue', function($delegate) {
                    return jasmine.createSpy('c6AsyncQueue()').and.callFake(function() {
                        var queue = $delegate.apply(this, arguments);
                        var debounce = queue.debounce;
                        spyOn(queue, 'debounce').and.callFake(function() {
                            var fn = debounce.apply(queue, arguments);
                            debouncedFns.push(fn);
                            return fn;
                        });
                        return queue;
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
            });

            paymentMethods = [
                new PaymentMethod(),
                new PaymentMethod(),
                new PaymentMethod()
            ];

            spyOn(cinema6.db, 'findAll');
            spyOn(cinema6.db, 'create');

            spyOn(ConfirmDialogService, 'display');
            spyOn(ConfirmDialogService, 'close');

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieAccountPaymentCtrl = $controller('SelfieAccountPaymentController', {cState: cState, $scope: $scope});
            });
        });

        it('should exist', function() {
            expect(SelfieAccountPaymentCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('refreshModel()', function() {
                it('should refresh the model', function() {
                    cinema6.db.findAll.and.returnValue($q.when(paymentMethods));
                    SelfieAccountPaymentCtrl.refreshModel();
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                });

                describe('when payment methods are returned', function() {
                    it('should update the model', function() {
                        var newModel = [
                            { token: '111' },
                            { token: '222' },
                            { token: '333' }
                        ];

                        cinema6.db.findAll.and.returnValue($q.when(newModel));

                        $scope.$apply(function() {
                            SelfieAccountPaymentCtrl.refreshModel();
                        });

                        expect(SelfieAccountPaymentCtrl.model).toBe(newModel);
                    });
                });

                describe('when the request fails', function() {
                    it('should reject the promise', function() {
                        var failure = jasmine.createSpy('failure()');

                        cinema6.db.findAll.and.returnValue($q.reject());

                        $scope.$apply(function() {
                            SelfieAccountPaymentCtrl.refreshModel().catch(failure);
                        });

                        expect(failure).toHaveBeenCalled();
                    });
                });
            });

            describe('makeDefault(method)', function() {
                var updatedModel;

                beforeEach(function() {
                    paymentMethods[1].cardholderName = 'Johnny Testmonkey';

                    updatedModel = [
                        new PaymentMethod()
                    ];

                    spyOn(SelfieAccountPaymentCtrl, 'refreshModel').and.callThrough();
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
                    expect(SelfieAccountPaymentCtrl.refreshModel).toHaveBeenCalled();
                    expect(cinema6.db.findAll).toHaveBeenCalled();
                    expect(SelfieAccountPaymentCtrl.model).toEqual(updatedModel);
                });

                it('should display a dialog if it fails', function() {
                    paymentMethods[1].save.and.returnValue($q.reject({data: 'Error!'}));

                    $scope.$apply(function() {
                        SelfieAccountPaymentCtrl.makeDefault(paymentMethods[1]);
                    });

                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                });
            });

            describe('confirmPrimary(method)', function() {
                var onAffirm, onCancel;

                beforeEach(function() {
                    SelfieAccountPaymentCtrl.confirmPrimary(paymentMethods[1]);

                    spyOn(SelfieAccountPaymentCtrl, 'makeDefault');

                    onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                    onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                });

                it('should display a confirmation dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                });

                describe('onAffirm()', function() {
                    it('should be a queue.debounce function', function() {
                        expect(onAffirm).toBe(debouncedFns[0]);

                        onAffirm();
                        onAffirm();
                        onAffirm();
                        onAffirm();
                        onAffirm();
                        onAffirm();

                        expect(SelfieAccountPaymentCtrl.makeDefault).toHaveBeenCalledWith(paymentMethods[1]);
                        expect(SelfieAccountPaymentCtrl.makeDefault.calls.count()).toBe(1);
                    });
                });

                describe('onCancel()', function() {
                    it('should close the dialog', function() {
                        onCancel();

                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });
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

                    spyOn(SelfieAccountPaymentCtrl, 'refreshModel').and.callThrough();
                    cinema6.db.findAll.and.returnValue($q.when(updatedModel));

                    $scope.$apply(function() {
                        SelfieAccountPaymentCtrl.delete(paymentMethods[1]);
                    });

                    expect(paymentMethods[1].erase).toHaveBeenCalled();
                    expect(SelfieAccountPaymentCtrl.refreshModel).toHaveBeenCalled();
                    expect(cinema6.db.findAll).toHaveBeenCalled();
                    expect(SelfieAccountPaymentCtrl.model).toEqual(updatedModel);
                });

                it('should display a dialog if it fails', function() {
                    paymentMethods[1].erase.and.returnValue($q.reject({data: 'Error!'}));

                    $scope.$apply(function() {
                        SelfieAccountPaymentCtrl.delete(paymentMethods[1]);
                    });

                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                });
            });

            describe('confirmDelete(method)', function() {
                var onAffirm, onCancel;

                beforeEach(function() {
                    SelfieAccountPaymentCtrl.confirmDelete(paymentMethods[1]);

                    spyOn(SelfieAccountPaymentCtrl, 'delete');

                    onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                    onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                });

                it('should display a confirmation dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                });

                describe('onAffirm()', function() {
                    it('should be a queue.debounce function', function() {
                        expect(onAffirm).toBe(debouncedFns[0]);

                        onAffirm();
                        onAffirm();
                        onAffirm();
                        onAffirm();
                        onAffirm();
                        onAffirm();

                        expect(SelfieAccountPaymentCtrl.delete).toHaveBeenCalledWith(paymentMethods[1]);
                        expect(SelfieAccountPaymentCtrl.delete.calls.count()).toBe(1);
                    });
                });

                describe('onCancel()', function() {
                    it('should close the dialog', function() {
                        onCancel();

                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });
                });
            });

            describe('paypalSuccess(method)', function() {
                var newPaypal, updatedModel, braintreeObject, saveDeferred;

                beforeEach(function() {
                    newPaypal = new PaymentMethod();

                    updatedModel = [
                        new PaymentMethod()
                    ];

                    braintreeObject = {
                        nonce: '1234-4321'
                    };

                    saveDeferred = $q.defer();

                    newPaypal.save.and.returnValue(saveDeferred.promise);

                    spyOn(SelfieAccountPaymentCtrl, 'refreshModel').and.callThrough();
                    cinema6.db.create.and.returnValue(newPaypal);
                    cinema6.db.findAll.and.returnValue($q.when(updatedModel));

                    $scope.$apply(function() {
                        SelfieAccountPaymentCtrl.paypalSuccess(braintreeObject);
                    });
                });

                it('should create a payment method DB model and save it', function() {
                    expect(cinema6.db.create).toHaveBeenCalledWith('paymentMethod', {
                        paymentMethodNonce: braintreeObject.nonce
                    });
                    expect(newPaypal.save).toHaveBeenCalled();
                });

                describe('if the save succeeds', function() {
                    it('should refresh the model', function() {
                        $scope.$apply(function() {
                            saveDeferred.resolve(newPaypal);
                        });

                        expect(SelfieAccountPaymentCtrl.refreshModel).toHaveBeenCalled();
                        expect(cinema6.db.findAll).toHaveBeenCalled();
                        expect(SelfieAccountPaymentCtrl.model).toEqual(updatedModel);
                    });
                });

                describe('if the save fails', function() {
                    it('should display a dialog', function() {
                        $scope.$apply(function() {
                            saveDeferred.reject({data: 'Error!'});
                        });

                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});