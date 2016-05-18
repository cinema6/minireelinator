define(['login', 'app'], function(loginModule, appModule) {
    'use strict';

    describe('LoginController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            $location,
            c6State,
            AuthService,
            LoginCtrl,
            c6Defines;

        var model,
            ApplicationState;

        beforeEach(function() {
            model = {
                email: '',
                password: ''
            };

            module('ng', function($provide) {
                $provide.value('$location', {
                    absUrl: function() {}
                });
            });
            module(appModule.name);
            module(loginModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                c6Defines = $injector.get('c6Defines');

                ApplicationState = c6State.get('Application');

                $location = {
                    path: jasmine.createSpy('$location.path()').and.callFake(function() {
                        return this;
                    }),
                    replace: jasmine.createSpy('$location.replace()').and.returnValue($location)
                };

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    LoginCtrl = $controller('LoginController', { $scope: $scope, $location: $location });
                    LoginCtrl.model = model;
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            $q = null;
            $location = null;
            c6State = null;
            AuthService = null;
            LoginCtrl = null;
            c6Defines = null;
            model = null;
            ApplicationState = null;
        });

        it('should exist', function() {
            expect(LoginCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('error', function() {
                it('should be null', function() {
                    expect(LoginCtrl.error).toBeNull();
                });
            });
        });

        describe('methods', function() {
            describe('submit()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success');
                    failure = jasmine.createSpy('failure');

                    spyOn(AuthService, 'login');
                });

                [
                    { email: 'josh@cinema6.com', password: '' },
                    { email: '', password: 'password' }
                ].forEach(function(model) {
                    describe('if the model is ' + JSON.stringify(model), function() {
                        beforeEach(function() {
                            LoginCtrl.model = model;
                            $scope.$apply(function() {
                                LoginCtrl.submit().then(success, failure);
                            });
                        });

                        it('should not attempt to login', function() {
                            expect(AuthService.login).not.toHaveBeenCalled();
                        });

                        it('should show an error', function() {
                            expect(LoginCtrl.error).toEqual(jasmine.any(String));
                        });

                        it('should reject with an error', function() {
                            expect(failure).toHaveBeenCalledWith(jasmine.any(String));
                        });
                    });
                });

                describe('if there is an email and password', function() {
                    var loginDeferred;

                    beforeEach(function() {
                        loginDeferred = $q.defer();

                        AuthService.login.and.returnValue(loginDeferred.promise);

                        LoginCtrl.model = {
                            email: 'josh@cinema6.com',
                            password: 'password'
                        };
                        $scope.$apply(function() {
                            LoginCtrl.submit().then(success, failure);
                        });
                    });

                    it('should not set an error', function() {
                        expect(LoginCtrl.error).toBeNull();
                    });

                    it('should login', function() {
                        expect(AuthService.login).toHaveBeenCalledWith(LoginCtrl.model.email, LoginCtrl.model.password);
                    });

                    describe('if the login fails', function() {
                        var error;

                        beforeEach(function() {
                            error = 'OH NOOOO!';

                            $scope.$apply(function() {
                                loginDeferred.reject(error);
                            });
                        });

                        it('should set the error message', function() {
                            expect(LoginCtrl.error).toBe(error);
                        });
                    });

                    describe('if the login succeeds', function() {
                        var user;

                        beforeEach(function() {
                            user = {
                                email: 'josh@cinema6.com'
                            };

                            spyOn(c6State, 'goTo').and.returnValue($q.when({}));
                        });

                        describe('when there is a redirectTo path', function() {
                            it('should use the $location service to redirect', function() {
                                LoginCtrl.redirectTo = '/campaigns/cam-123/admin';

                                $scope.$apply(function() {
                                    loginDeferred.resolve(user);
                                });

                                expect($location.path).toHaveBeenCalledWith(LoginCtrl.redirectTo);
                                expect($location.replace).toHaveBeenCalled();
                                expect(c6State.goTo).not.toHaveBeenCalled();
                            });
                        });

                        describe('when the redirectTo path is "/"', function() {
                            describe('when Application name is Selfie', function() {
                                beforeEach(function() {
                                    LoginCtrl.redirectTo = '/';

                                    ApplicationState.name = 'Selfie';

                                    $scope.$apply(function() {
                                        loginDeferred.resolve(user);
                                    });
                                });

                                it('should resolve the promise', function() {
                                    expect(success).toHaveBeenCalledWith(user);
                                });

                                it('should go to Selfie state', function() {
                                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie', [user], {}, true);
                                });
                            });

                            describe('when Application name is Portal', function() {
                                beforeEach(function() {
                                    LoginCtrl.redirectTo = '/';

                                    ApplicationState.name = 'Portal';

                                    $scope.$apply(function() {
                                        loginDeferred.resolve(user);
                                    });
                                });

                                it('should resolve the promise', function() {
                                    expect(success).toHaveBeenCalledWith(user);
                                });

                                it('should go to the portal', function() {
                                    expect(c6State.goTo).toHaveBeenCalledWith('Portal', [user], {}, true);
                                });
                            });
                        });

                        describe('when there is not a redirectTo path', function() {
                            describe('when Application name is Selfie', function() {
                                beforeEach(function() {
                                    ApplicationState.name = 'Selfie';

                                    $scope.$apply(function() {
                                        loginDeferred.resolve(user);
                                    });
                                });

                                it('should resolve the promise', function() {
                                    expect(success).toHaveBeenCalledWith(user);
                                });

                                it('should go to Selfie state', function() {
                                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie', [user], {}, true);
                                });
                            });

                            describe('when Application name is Portal', function() {
                                beforeEach(function() {
                                    ApplicationState.name = 'Portal';

                                    $scope.$apply(function() {
                                        loginDeferred.resolve(user);
                                    });
                                });

                                it('should resolve the promise', function() {
                                    expect(success).toHaveBeenCalledWith(user);
                                });

                                it('should go to the portal', function() {
                                    expect(c6State.goTo).toHaveBeenCalledWith('Portal', [user], {}, true);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
