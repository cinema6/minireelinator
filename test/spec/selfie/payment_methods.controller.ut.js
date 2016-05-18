define(['app'], function(appModule) {
    'use strict';

    describe('SelfiePaymentMethodsController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfiePaymentMethodsCtrl;

        var paymentMethods;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.methods = paymentMethods;
            $scope.chosenMethod = paymentMethods[1];

            $scope.$apply(function() {
                SelfiePaymentMethodsCtrl = $controller('SelfiePaymentMethodsController', {
                    $scope: $scope
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                paymentMethods = [
                    {
                        id: 'pay-1',
                        token: 'pay-1'
                    },
                    {
                        id: 'pay-2',
                        token: 'pay-2',
                        default: true
                    },
                    {
                        id: 'pay-3',
                        token: 'pay-3',
                        default: false
                    }
                ];
            });

            compileCtrl();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            SelfiePaymentMethodsCtrl = null;
            paymentMethods = null;
        });

        it('should exist', function() {
            expect(SelfiePaymentMethodsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('methods', function() {
                it('should be empty array if none are defined on the $scope', function() {
                    $scope.methods.splice(0,3);

                    expect(SelfiePaymentMethodsCtrl.methods).toEqual([]);
                });

                it('should contain all methods except the chosen one', function() {
                    expect(SelfiePaymentMethodsCtrl.methods.length).toBe(2);
                    expect(SelfiePaymentMethodsCtrl.methods.indexOf(paymentMethods[1])).toEqual(-1);
                });

                it('should contain all methods if there is no chosen one', function() {
                    $scope.chosenMethod = undefined;
                    expect(SelfiePaymentMethodsCtrl.methods.length).toBe(3);
                });
            });
        });

        describe('methods', function() {
            describe('setChosenMethod(method)', function() {
                beforeEach(function() {
                    SelfiePaymentMethodsCtrl.showDropdown = true;
                    SelfiePaymentMethodsCtrl.setChosenMethod(paymentMethods[0]);
                });

                it('should set the chosen method', function() {
                    expect($scope.chosenMethod).toBe(paymentMethods[0]);
                });

                it('should hide the drop down', function() {
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBe(false);
                });
            });

            describe('toggleDropdown()', function() {
                it('should toggle the drop down if there are multiple options', function() {
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBeFalsy();

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBe(true);

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBe(false);

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBe(true);

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBe(false);
                });

                it('should not toggle if there is only one option (or less)', function() {
                    $scope.methods.splice(0,2);

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBeFalsy();

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBeFalsy();

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBeFalsy();

                    SelfiePaymentMethodsCtrl.toggleDropdown();
                    expect(SelfiePaymentMethodsCtrl.showDropdown).toBeFalsy();
                });
            });
        });
    });
});
