define(['forgot_password'], function(forgotPasswordModule) {
    'use strict';

    describe('ForgotPasswordController', function() {
        var $rootScope,
            $controller,
            $q,
            AuthService,
            $scope,
            ForgotPasswordCtrl;

        var model;

        beforeEach(function() {
            model = {
                email: ''
            };

            module(forgotPasswordModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                AuthService = $injector.get('AuthService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    ForgotPasswordCtrl = $controller('ForgotPasswordController', { $scope: $scope });
                    ForgotPasswordCtrl.model = model;
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $q = null;
            AuthService = null;
            $scope = null;
            ForgotPasswordCtrl = null;
            model = null;
        });

        it('should exist', function() {
            expect(ForgotPasswordCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('wasSuccessful', function() {
                it('should be null', function() {
                    expect(ForgotPasswordCtrl.wasSuccessful).toBeNull();
                });
            });

            describe('errorMessage', function() {
                it('should be null', function() {
                    expect(ForgotPasswordCtrl.errorMessage).toBeNull();
                });
            });
        });

        describe('methods', function() {
            describe('submit()', function() {
                var requestPasswordResetDeferred,
                    success, failure;

                beforeEach(function() {
                    requestPasswordResetDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    ForgotPasswordCtrl.wasSuccessful = false;
                    ForgotPasswordCtrl.errorMessage = 'FAIL FAIL FAIL!';

                    model.email = 'josh@cinema6.com';
                    model.target = 'portal';

                    spyOn(AuthService, 'requestPasswordReset')
                        .and.returnValue(requestPasswordResetDeferred.promise);

                    $scope.$apply(function() {
                        ForgotPasswordCtrl.submit().then(success, failure);
                    });
                });

                it('should reset wasSuccessful and errorMessage', function() {
                    ['wasSuccessful', 'errorMessage'].forEach(function(prop) {
                        expect(ForgotPasswordCtrl[prop]).toBeNull();
                    });
                });

                it('should request a password reset', function() {
                    expect(AuthService.requestPasswordReset).toHaveBeenCalledWith(model.email, model.target);
                });

                describe('if the request is successful', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            requestPasswordResetDeferred.resolve('Successfully generated reset token');
                        });
                    });

                    it('should set wasSuccessful to true', function() {
                        expect(ForgotPasswordCtrl.wasSuccessful).toBe(true);
                    });

                    it('should resolve to the message', function() {
                        expect(success).toHaveBeenCalledWith('Successfully generated reset token');
                    });
                });

                describe('if the request fails', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            requestPasswordResetDeferred.reject('IT FAILED! :-(');
                        });
                    });

                    it('should set wasSuccessful to false', function() {
                        expect(ForgotPasswordCtrl.wasSuccessful).toBe(false);
                    });

                    it('should reject to the error', function() {
                        expect(failure).toHaveBeenCalledWith('IT FAILED! :-(');
                    });

                    it('should set a helpful errorMessage', function() {
                        expect(ForgotPasswordCtrl.errorMessage).toEqual(failure.calls.mostRecent().args[0]);
                    });
                });
            });
        });
    });
});
