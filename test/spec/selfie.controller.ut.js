define(['app'], function(appModule) {
    'use strict';

    describe('SelfieController', function() {
        var $rootScope,
            $controller,
            c6State,
            AuthService,
            $q,
            $scope,
            SelfieCtrl;

        var user;

        function instantiate() {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieCtrl = $controller('SelfieController', { $scope: $scope });
                SelfieCtrl.initWithModel(user);
            });

            return SelfieCtrl;
        }

        beforeEach(function() {
            user = {
                id: 'u-22edfa1071d94b',
                permissions: {
                    experiences: {},
                    orgs: {}
                }
            };

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');
            });

            SelfieCtrl = instantiate();
        });

        it('should exist', function() {
            expect(SelfieCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the user', function() {
                    expect(SelfieCtrl.model).toBe(user);
                });
            });
        });

        describe('methods', function() {
            describe('logout()', function() {
                beforeEach(function() {
                    spyOn(AuthService, 'logout').and.returnValue($q.when('Success'));
                    spyOn(c6State, 'goTo');

                    $scope.$apply(function() {
                        SelfieCtrl.logout();
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