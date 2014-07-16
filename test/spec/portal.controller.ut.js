define(['app'], function(appModule) {
    'use strict';

    describe('PortalController', function() {
        var $rootScope,
            $controller,
            c6State,
            AuthService,
            $q,
            $scope,
            PortalCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    PortalCtrl = $controller('PortalController', { $scope: $scope });
                });
            });
        });

        it('should exist', function() {
            expect(PortalCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('logout()', function() {
                beforeEach(function() {
                    spyOn(AuthService, 'logout').and.returnValue($q.when('Success'));
                    spyOn(c6State, 'goTo');

                    $scope.$apply(function() {
                        PortalCtrl.logout();
                    });
                });

                it('should logout the user', function() {
                    expect(AuthService.logout).toHaveBeenCalledWith();
                });

                it('should transition back to the login state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Login', null, {});
                });
            });
        });
    });
});
