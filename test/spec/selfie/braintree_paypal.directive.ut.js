define(['app','braintree','angular'], function(appModule, braintree, angular) {
    'use strict';

    describe('braintree-paypal directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $timeout,
            $form,
            scope;

        var token,
            config;

        function compileDirective(options) {
            options = options || {};

            $scope.Ctrl = {
                token: '1234-4321',
                success: options.success,
                failure: options.failure,
                cancel: options.cancel
            };

            $scope.$apply(function() {
                $form = $compile(
                    '<braintree-paypal ' +
                        'client-token="{{Ctrl.token}}" ' +
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

                $scope = $rootScope.$new();
            });

            spyOn(braintree, 'setup').and.callFake(function(_token, _type, _config) {
                token = _token;
                config = _config;
            });
        });

        describe('initialization', function() {
            it('should initialize braintree', function() {
                compileDirective();

                expect(braintree.setup).toHaveBeenCalledWith($scope.Ctrl.token, 'paypal', jasmine.any(Object));
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