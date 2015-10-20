define(['app'], function(appModule) {
    'use strict';

    describe('SelfiePaymentMethodsController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfiePaymentMethodsCtrl;

        var campaign,
            paymentMethods;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.campaign = campaign;
            $scope.methods = paymentMethods;

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

                campaign = {
                    id: 'cam-123'
                };
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

        it('should exist', function() {
            expect(SelfiePaymentMethodsCtrl).toEqual(jasmine.any(Object));
        });

        it('should set the default/primary payment method on the campaign immediately if not defined', function() {
            expect(campaign.paymentMethod).toBe('pay-2');
        });

        it('should not set change the payment method defined on the campaign', function() {
            campaign.paymentMethod = 'pay-3';

            compileCtrl();

            expect(campaign.paymentMethod).toBe('pay-3');
        });

        describe('properties', function() {
            describe('methods', function() {
                it('should be empty array if none are defined on the $scope', function() {
                    $scope.methods.splice(0,3);

                    expect(SelfiePaymentMethodsCtrl.methods).toEqual([]);
                });

                it('should contain all methods except the current one', function() {
                    expect(SelfiePaymentMethodsCtrl.methods.length).toBe(2);
                    expect(SelfiePaymentMethodsCtrl.methods.indexOf(paymentMethods[1])).toEqual(-1);
                });
            });

            describe('currentMethod', function() {
                it('should be undefined if there are no payment options', function() {
                    paymentMethods = [];

                    compileCtrl();

                    expect(SelfiePaymentMethodsCtrl.currentMethod).toBe(undefined);
                });

                it('should default to the primary method', function() {
                    expect(SelfiePaymentMethodsCtrl.currentMethod).toBe(paymentMethods[1]);
                });

                it('should come from the campaign if defined', function() {
                    campaign.paymentMethod = 'pay-3';

                    compileCtrl();

                    expect(SelfiePaymentMethodsCtrl.currentMethod).toBe(paymentMethods[2]);
                });
            });
        });

        describe('methods', function() {
            describe('setCurrentMethod(method)', function() {
                beforeEach(function() {
                    SelfiePaymentMethodsCtrl.setCurrentMethod(paymentMethods[0]);
                });

                it('should set the current method', function() {
                    expect(SelfiePaymentMethodsCtrl.currentMethod).toBe(paymentMethods[0]);
                });

                it('should set the property on the campaign', function() {
                    expect(campaign.paymentMethod).toBe('pay-1');
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

        describe('$watchers', function() {
            describe('campaign.paymentMethod', function() {
                it('should update the current method', function() {
                    spyOn(SelfiePaymentMethodsCtrl, 'setCurrentMethod').and.callThrough();

                    expect(SelfiePaymentMethodsCtrl.currentMethod).toBe(paymentMethods[1]);
                    expect(campaign.paymentMethod).toBe('pay-2');

                    $scope.$apply(function() {
                        campaign.paymentMethod = 'pay-3';
                    });

                    expect(SelfiePaymentMethodsCtrl.setCurrentMethod).toHaveBeenCalledWith(paymentMethods[2]);
                    expect(SelfiePaymentMethodsCtrl.currentMethod).toBe(paymentMethods[2]);
                });
            });
        });
    });
});