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

        var user;

        function instantiate() {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                PortalCtrl = $controller('PortalController', { $scope: $scope });
                PortalCtrl.initWithModel(user);
            });

            return PortalCtrl;
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

            PortalCtrl = instantiate();
        });

        it('should exist', function() {
            expect(PortalCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the user', function() {
                    expect(PortalCtrl.model).toBe(user);
                });
            });

            describe('enableAdManager', function() {
                describe('if the user cannot edit the org or experience ad settings', function() {
                    it('should be false', function() {
                        expect(PortalCtrl.enableAdManager).toBe(false);
                    });
                });

                describe('if the user can edit just the org ad settings', function() {
                    beforeEach(function() {
                        user.permissions.orgs.editAdConfig = 'org';
                        PortalCtrl = instantiate();
                    });

                    it('should be true', function() {
                        expect(PortalCtrl.enableAdManager).toBe(true);
                    });
                });

                describe('if the user can edit just the experience ad settings', function() {
                    beforeEach(function() {
                        user.permissions.experiences.editAdConfig = 'org';
                        PortalCtrl = instantiate();
                    });

                    it('should be true', function() {
                        expect(PortalCtrl.enableAdManager).toBe(true);
                    });
                });

                describe('if the user can edit the experience and org ad settings', function() {
                    beforeEach(function() {
                        user.permissions.orgs.editAdConfig = 'org';
                        user.permissions.experiences.editAdConfig = 'org';
                        PortalCtrl = instantiate();
                    });

                    it('should be true', function() {
                        expect(PortalCtrl.enableAdManager).toBe(true);
                    });
                });
            });
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
