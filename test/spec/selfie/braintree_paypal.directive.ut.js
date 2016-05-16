define(['app','braintree','angular'], function(appModule, braintree, angular) {
    'use strict';

    describe('braintree-paypal directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $timeout,
            $form,
            $q,
            scope,
            PaymentService;

        var token,
            config;

        function compileDirective(options) {
            options = options || {};

            $scope.Ctrl = {
                success: options.success,
                failure: options.failure,
                cancel: options.cancel
            };

            $scope.$apply(function() {
                $form = $compile(
                    '<braintree-paypal ' +
                        'on-success="Ctrl.success" '+
                        'on-cancel="Ctrl.cancel" ' +
                        'on-failure="Ctrl.failure">' +
                    '</braintree-paypal>'
                )($scope);
            });

            scope = $form.isolateScope();
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $timeout = $injector.get('$timeout');
                $q = $injector.get('$q');
                PaymentService = $injector.get('PaymentService');

                $scope = $rootScope.$new();
            });

            spyOn(PaymentService, 'getToken').and.returnValue($q.when('1234-4321'));

            spyOn(braintree, 'setup').and.callFake(function(_token, _type, _config) {
                token = _token;
                config = _config;
            });
        });

        afterEach(function() {
            $form.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            $scope = null;
            $timeout = null;
            $form = null;
            $q = null;
            scope = null;
            PaymentService = null;
            token = null;
            config = null;
        });

        describe('initialization', function() {
            beforeEach(function() {
                compileDirective();
            });

            it('should request a token', function() {
                expect(PaymentService.getToken).toHaveBeenCalled();
            });

            it('should initialize braintree', function() {
                expect(braintree.setup).toHaveBeenCalledWith('1234-4321', 'paypal', jasmine.any(Object));
            });
        });

        describe('when braintree sends onPaymentMethodReceived event', function() {
            it('should call the onSuccess function that was passed in on the scope', function() {
                var braintreeObject = {
                    nonce: '8888-9999'
                };

                compileDirective({
                    success: function() {}
                });

                spyOn(scope, 'onSuccess');

                config.onPaymentMethodReceived(braintreeObject);

                expect(scope.onSuccess).toHaveBeenCalledWith({
                    method: braintreeObject
                });
            });
        });
    });
});
