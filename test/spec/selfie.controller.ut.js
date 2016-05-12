define(['app','c6_defines'], function(appModule, c6Defines) {
    'use strict';

    describe('SelfieController', function() {
        var $rootScope,
            $controller,
            c6State,
            AuthService,
            $q,
            $scope,
            SelfieCtrl,
            PaymentService;

        var user,
            intercom;

        function instantiate() {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieCtrl = $controller('SelfieController', { $scope: $scope, PaymentService: PaymentService });
                SelfieCtrl.initWithModel(user);
            });

            return SelfieCtrl;
        }

        beforeEach(function() {
            user = {
                id: 'u-22edfa1071d94b',
                entitlements: {},
                permissions: {
                    experiences: {},
                    orgs: {}
                }
            };

            intercom = jasmine.createSpy('intercom');

            module(appModule.name, ['$provide', function($provide) {
                $provide.value('intercom', intercom);
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                AuthService = $injector.get('AuthService');
                $q = $injector.get('$q');
            });

            PaymentService = {
                balance: {}
            };

            SelfieCtrl = instantiate();
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            c6State = null;
            AuthService = null;
            $q = null;
            $scope = null;
            SelfieCtrl = null;
            PaymentService = null;
            user = null;
            intercom = null;
        });

        it('should exist', function() {
            expect(SelfieCtrl).toEqual(jasmine.any(Object));
        });

        it('should set the PaymentService balance', function() {
            expect(SelfieCtrl.accounting).toBe(PaymentService.balance);
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the user', function() {
                    expect(SelfieCtrl.model).toBe(user);
                });
            });

            describe('isAdmin', function() {
                it('should be true when the user has adminsCampaigns entitlement', function() {
                    user.entitlements.adminCampaigns = true;
                    SelfieCtrl = instantiate();

                    expect(SelfieCtrl.isAdmin).toBe(true);
                });

                it('should be false when the user does not have adminsCampaigns entitlement', function() {
                    delete user.entitlements.adminCampaigns;
                    SelfieCtrl = instantiate();

                    expect(SelfieCtrl.isAdmin).toBe(false);
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
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Login', null, {});
                });

                it('should send intercom a "shutdown" event', function() {
                    expect(intercom).toHaveBeenCalledWith('shutdown');
                });
            });
        });
    });
});
