define(['app'], function(appModule) {
    'use strict';

    describe('SelfieAccountController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            $q,
            SelfieAccountCtrl,
            AddFundsModalService,
            NotificationService,
            cinema6;

        var user,
            paymentMethods;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                AddFundsModalService = $injector.get('AddFundsModalService');
                NotificationService = $injector.get('NotificationService');
            });

            user = {
                firstName: 'Selfie',
                lastName: 'User',
                company: 'Selfie, Inc.',
                email: 'user@selfie.com'
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

            cState = {
                paymentMethods: paymentMethods
            };

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieAccountCtrl = $controller('SelfieAccountController', {cState: cState});
            });
        });

        it('should exist', function() {
            expect(SelfieAccountCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('primaryMethod', function() {
                it('should be the default payment method or undefined', function() {
                    SelfieAccountCtrl.initWithModel(user);

                    expect(SelfieAccountCtrl.primaryMethod).toBe(undefined);

                    paymentMethods[0].default = true;

                    expect(SelfieAccountCtrl.primaryMethod).toBe(paymentMethods[0]);

                    paymentMethods[0].default = false;
                    paymentMethods[1].default = true;

                    expect(SelfieAccountCtrl.primaryMethod).toBe(paymentMethods[1]);
                });
            });
        });

        describe('methods', function() {
            describe('initWithModel()', function() {
                it('should add the model and paymentMethods', function() {
                    SelfieAccountCtrl.initWithModel(user);

                    expect(SelfieAccountCtrl.model).toBe(user);
                    expect(SelfieAccountCtrl.paymentMethods).toBe(paymentMethods);
                });
            });

            describe('addFunds()', function() {
                var addFundsDeferred,
                    paymentMethodsDeferred;

                beforeEach(function() {
                    addFundsDeferred = $q.defer();
                    paymentMethodsDeferred = $q.defer();

                    spyOn(AddFundsModalService, 'display').and.returnValue(addFundsDeferred.promise);
                    spyOn(cinema6.db, 'findAll').and.returnValue(paymentMethodsDeferred.promise);
                    spyOn(NotificationService, 'display');

                    SelfieAccountCtrl.addFunds();
                });

                it('should call display on the add funds modal', function() {
                    expect(AddFundsModalService.display).toHaveBeenCalled();
                });

                describe('when the promise resolves', function() {
                    beforeEach(function() {
                         $scope.$apply(function() {
                            addFundsDeferred.resolve();
                        });
                    });

                    it('should refetch all payment methods', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                    });

                    it('should show the user a notification', function() {
                        expect(NotificationService.display).toHaveBeenCalledWith(jasmine.any(String));
                    });

                    describe('when payment methods are resolved', function() {
                        it('should put them on the Ctrl and cState', function() {
                            var paymentMethods = [
                                {
                                    id: 'pay-111'
                                },
                                {
                                    id: 'pay-222'
                                }
                            ];

                            $scope.$apply(function() {
                                paymentMethodsDeferred.resolve(paymentMethods);
                            });

                            expect(cState.paymentMethods).toBe(paymentMethods);
                            expect(SelfieAccountCtrl.paymentMethods).toBe(paymentMethods);
                        });
                    });
                });
            });
        });
    });
});