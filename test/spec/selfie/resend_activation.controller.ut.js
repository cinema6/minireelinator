define(['app'], function(appModule) {
    'use strict';

    describe('SelfieResendActivationController', function() {
        var $rootScope,
            $controller,
            c6State,
            AuthService,
            AccountService,
            $q,
            $scope,
            SelfieResendActivationCtrl,
            intercom;

        beforeEach(function() {
            intercom = jasmine.createSpy('intercom');

            module(appModule.name, ['$provide', function($provide) {
                $provide.value('intercom', intercom);
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                AuthService = $injector.get('AuthService');
                AccountService = $injector.get('AccountService');
                $q = $injector.get('$q');
            });

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieResendActivationCtrl = $controller('SelfieResendActivationController');
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            c6State = null;
            AuthService = null;
            AccountService = null;
            $q = null;
            $scope = null;
            SelfieResendActivationCtrl = null;
            intercom = null;
        });

        it('should exist', function() {
            expect(SelfieResendActivationCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('logout()', function() {
                beforeEach(function() {
                    spyOn(AuthService, 'logout').and.returnValue($q.when('Success'));
                    spyOn(c6State, 'goTo');

                    $scope.$apply(function() {
                        SelfieResendActivationCtrl.logout();
                    });
                });

                it('should logout the user', function() {
                    expect(AuthService.logout).toHaveBeenCalledWith();
                });

                it('should transition back to the login state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Login', null, {});
                });

                it('should send intercom a "shutdown" event', function() {
                    expect(intercom).toHaveBeenCalledWith('shutdown');
                });
            });

            describe('resend()', function() {
                it('should resend activation link', function() {
                    spyOn(AccountService, 'resendActivation').and.returnValue($q.when(null));

                    SelfieResendActivationCtrl.resend();

                    expect(AccountService.resendActivation).toHaveBeenCalled();
                });

                describe('when resend is successful', function() {
                    it('should put a success message on the Ctrl', function() {
                        spyOn(AccountService, 'resendActivation').and.returnValue($q.when(null));

                        $scope.$apply(function() {
                            SelfieResendActivationCtrl.resend();
                        });

                        expect(SelfieResendActivationCtrl.model).toEqual('We have sent you an email with a new confirmation link!');
                    });
                });

                describe('when resend fails', function() {
                    it('should put a failure message on the Ctrl', function() {
                        spyOn(AccountService, 'resendActivation').and.returnValue($q.reject());

                        $scope.$apply(function() {
                            SelfieResendActivationCtrl.resend();
                        });

                        expect(SelfieResendActivationCtrl.model).toEqual('There was a problem resending a new activation link');
                    });
                });
            });
        });
    });
});
