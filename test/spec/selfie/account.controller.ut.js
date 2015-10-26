define(['app'], function(appModule) {
    'use strict';

    describe('SelfieAccountController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            $q,
            SelfieAccountCtrl;

        var user,
            paymentMethods;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
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
        });
    });
});