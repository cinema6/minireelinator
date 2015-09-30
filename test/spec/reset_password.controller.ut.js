define(['forgot_password'], function(forgotPasswordModule) {
    'use strict';

    describe('ResetPasswordController', function() {
        var $rootScope,
            $controller,
            $q,
            AuthService,
            c6State,
            $scope,
            ResetPasswordCtrl,
            ApplicationState;

        var model;

        beforeEach(function() {
            model = {
                passwords: [null, null]
            };

            module(forgotPasswordModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                AuthService = $injector.get('AuthService');
                c6State = $injector.get('c6State');

                ApplicationState = c6State.get('Application');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    ResetPasswordCtrl = $controller('ResetPasswordController', { $scope: $scope });
                    ResetPasswordCtrl.model = model;
                });
            });
        });

        it('should exist', function() {
            expect(ResetPasswordCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('userId', function() {
                it('should be null', function() {
                    expect(ResetPasswordCtrl.userId).toBeNull();
                });
            });

            describe('token', function() {
                it('should be null', function() {
                    expect(ResetPasswordCtrl.token).toBeNull();
                });
            });

            describe('errorMessage', function() {
                it('should be null', function() {
                    expect(ResetPasswordCtrl.errorMessage).toBeNull();
                });
            });

            describe('pattern', function() {
                var pattern;

                beforeEach(function() {
                    pattern = ResetPasswordCtrl.pattern;
                    expect(pattern).toEqual(jasmine.any(RegExp));
                });

                it('should succeed with space-less string', function() {
                    expect('password').toMatch(pattern);
                    expect('bslff398fvf').toMatch(pattern);
                });

                it('should fail with a string with spaces', function() {
                    expect(' password ').not.toMatch(pattern);
                    expect('test password').not.toMatch(pattern);
                });
            });
        });

        describe('methods', function() {
            describe('submit()', function() {
                var resetPasswordDeferred,
                    success, failure;

                beforeEach(function() {
                    resetPasswordDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    ResetPasswordCtrl.errorMessage = 'IT FAILED!';

                    ResetPasswordCtrl.userId = 'u-bd1f483811c279';
                    ResetPasswordCtrl.token = '41cbf8137b2f1e27aa9645b788bb518f93d0736f3430f69f';
                    model.passwords[0] = 'password1';
                    model.passwords[1] = 'password1';

                    spyOn(AuthService, 'resetPassword')
                        .and.returnValue(resetPasswordDeferred.promise);

                    $scope.$apply(function() {
                        ResetPasswordCtrl.submit().then(success, failure);
                    });
                });

                it('should nullify the errorMessage', function() {
                    expect(ResetPasswordCtrl.errorMessage).toBeNull();
                });

                it('should send a request to reset the password', function() {
                    expect(AuthService.resetPassword).toHaveBeenCalledWith(ResetPasswordCtrl.userId, ResetPasswordCtrl.token, model.passwords[0]);
                });

                describe('if the reset succeeds', function() {
                    var user;

                    beforeEach(function() {
                        user = {
                            id: 'u-67e36bebff153e',
                            config: {},
                            org: {
                                id: 'o-c52860ab898ae5',
                                config: {}
                            }
                        };

                        spyOn(c6State, 'goTo');
                    });

                    describe('when the Application name is Selfie', function() {
                        beforeEach(function() {
                            ApplicationState.name = 'Selfie';

                            $scope.$apply(function() {
                                resetPasswordDeferred.resolve(user);
                            });
                        });

                        it('should redirect to the portal', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie', [user], null, true);
                        });

                        it('should resolve to the user', function() {
                            expect(success).toHaveBeenCalledWith(user);
                        });
                    });

                    describe('when the Application name is Portal', function() {
                        beforeEach(function() {
                            ApplicationState.name = 'Portal';

                            $scope.$apply(function() {
                                resetPasswordDeferred.resolve(user);
                            });
                        });

                        it('should redirect to the portal', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('Portal', [user], null, true);
                        });

                        it('should resolve to the user', function() {
                            expect(success).toHaveBeenCalledWith(user);
                        });
                    });
                });

                describe('if the reset fails', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            resetPasswordDeferred.reject('Must provide id, token, and newPassword');
                        });
                    });

                    it('should reject the promise', function() {
                        expect(failure).toHaveBeenCalledWith('Must provide id, token, and newPassword');
                    });

                    it('should set a helpful errorMessage', function() {
                        expect(ResetPasswordCtrl.errorMessage).toEqual(failure.calls.mostRecent().args[0]);
                    });
                });
            });
        });
    });
});
