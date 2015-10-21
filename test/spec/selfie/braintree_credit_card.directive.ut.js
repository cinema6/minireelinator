define(['app','braintree','angular'], function(appModule, braintree, angular) {
    'use strict';

    describe('braintree-credit-card directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $timeout,
            $form,
            scope,
            $;

        var token,
            config;

        function compileDirective(options) {
            options = options || {};

            $scope.Ctrl = {
                token: '1234-4321',
                method: options.method || {},
                success: options.success,
                failure: options.failure,
                cancel: options.cancel
            };

            $scope.$apply(function() {
                $form = $compile(
                    '<braintree-credit-card ' +
                        'client-token="{{Ctrl.token}}" ' +
                        'method="Ctrl.method" ' +
                        'on-success="Ctrl.success" '+
                        'on-cancel="Ctrl.cancel" ' +
                        'on-failure="Ctrl.failure">' +
                    '</braintree-credit-card>'
                )($scope);
            });

            scope = $form.isolateScope();
        }

        beforeEach(function() {
            module(appModule.name);

            $ = angular.element;

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

                expect(braintree.setup).toHaveBeenCalledWith($scope.Ctrl.token, 'custom', jasmine.any(Object));
            });

            describe('based on the bound method', function() {
                describe('when the method is the default', function() {
                    it('should set scope.makeDefault to "Yes"', function() {
                        var method = { default: true };

                        compileDirective({ method: method });

                        expect(scope.makeDefault).toBe('Yes');
                    });
                });

                describe('when the method is not the default or method.default is not set yet', function() {
                    it('should set scope.makeDefault to "No"', function() {
                        var method = { default: false };
                        compileDirective({ method: method });
                        expect(scope.makeDefault).toBe('No');

                        method = { default: true };
                        compileDirective({ method: method });
                        expect(scope.makeDefault).toBe('Yes');

                        method = {};
                        compileDirective({ method: method });
                        expect(scope.makeDefault).toBe('No');
                    });
                });

                describe('when the method has a cardholderName', function() {
                    it('should add it to the scope', function() {
                        var method = { cardholderName: 'Johnny Testmonkey' };
                        compileDirective({ method: method });
                        expect(scope.name).toBe('Johnny Testmonkey');
                    });
                });
            });
        });

        describe('when braintree sends onFieldEvents', function() {
            var container, parentElement;

            function fireEvent(options) {
                var handler = config.hostedFields.onFieldEvent,
                    fieldEvent;

                parentElement = $('<div>');
                container = $('<div>');

                parentElement.append(container);

                fieldEvent = {
                    target: {
                        container: container[0]
                    },
                    isFocused: options.isFocused,
                    isEmpty: options.isEmpty,
                    isValid: options.isValid,
                    isPotentiallyValid: options.isPotentiallyValid
                };

                handler(fieldEvent);
            }

            beforeEach(function() {
                compileDirective();
            });

            describe('when a field is in focus', function() {
                it('should have the filled class', function() {
                    fireEvent({
                        isFocused: true,
                        isEmpty: true
                    });

                    expect(container.hasClass('form__fillCheck--filled')).toBe(true);
                });
            });

            describe('when a field is not in focus', function() {
                it('should have the filled class if not empty', function() {
                    fireEvent({
                        isFocused: false,
                        isEmpty: false
                    });

                    expect(container.hasClass('form__fillCheck--filled')).toBe(true);
                });

                it('should not have the filled class if empty', function() {
                    fireEvent({
                        isFocused: false,
                        isEmpty: true
                    });

                    expect(container.hasClass('form__fillCheck--filled')).toBe(false);
                })
            });

            describe('when a field is not in focus and is not valid', function() {
                it('the parent should have the ui--hasError class', function() {
                    fireEvent({
                        isFocused: false,
                        isValid: false
                    });

                    expect(parentElement.hasClass('ui--hasError')).toBe(true);
                });
            });

            describe('when a field is in focus and is potentially valid', function() {
                it('the parent should not have the ui--hasError class', function() {
                    fireEvent({
                        isFocused: true,
                        isPotentiallyValid: true
                    });

                    expect(parentElement.hasClass('ui--hasError')).toBe(false);
                });
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

                scope.makeDefault = 'Yes';
                scope.name = 'Moneybags McGee';

                config.onPaymentMethodReceived(braintreeObject);

                expect(scope.onSuccess).toHaveBeenCalledWith({
                    method: {
                        makeDefault: true,
                        cardholderName: scope.name,
                        nonce: braintreeObject.nonce
                    }
                });
            });
        });

        describe('when braintree sends an onError event', function() {
            it('should put the message on the scope', function() {
                var error = {
                    message: 'There was a problem'
                };

                config.onError(error);

                expect(scope.errorMessage).toEqual(error.message);
            });
        });
    });
});