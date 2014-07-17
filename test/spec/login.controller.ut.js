define(['login', 'app'], function(loginModule, appModule) {
    'use strict';

    describe('LoginController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            c6State,
            AuthService,
            LoginCtrl;

        var model;

        beforeEach(function() {
            model = {
                email: '',
                password: ''
            };

            module('ng', function($provide) {
                $provide.value('$location', {});
            });
            module(appModule.name);
            module(loginModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    LoginCtrl = $controller('LoginController', { $scope: $scope });
                    LoginCtrl.model = model;
                });
            });
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

                            $scope.$apply(function() {
                                loginDeferred.resolve(user);
                            });
                        });

                        it('should resolve the promise', function() {
                            expect(success).toHaveBeenCalledWith(user);
                        });

                        it('should go to the "Portal" state with the user as the model', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('Portal', [user]);
                        });
                    });
                });
            });
        });
    });
});
