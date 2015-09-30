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
            SelfieResendActivationCtrl;

        beforeEach(function() {
            module(appModule.name);

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
            });

            describe('resend()', function() {
                it('should resend activation link', function() {
                    spyOn(AccountService, 'resendActivation').and.returnValue($q.when(null));

                    SelfieResendActivationCtrl.resend();

                    expect(AccountService.resendActivation).toHaveBeenCalled();
                });
            });
        });
    });
});