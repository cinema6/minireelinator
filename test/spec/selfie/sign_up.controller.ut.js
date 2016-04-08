define(['app'], function(appModule) {
    'use strict';

    describe('SelfieSignUpController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            AccountService,
            $q,
            $scope,
            SelfieSignUpCtrl;

        var user;

        function initCtrl(stateName) {
            cState.cName = stateName;

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieSignUpCtrl = $controller('SelfieSignUpController', { cState: cState });
                SelfieSignUpCtrl.model = user;
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                AccountService = $injector.get('AccountService');
                $q = $injector.get('$q');
            });

            cState = {};

            user = {
                firstName: '',
                lastName: '',
                company: '',
                email: '',
                password: ''
            };

            initCtrl('Selfie:SignUp:Full');
        });

        it('should exist', function() {
            expect(SelfieSignUpCtrl).toEqual(jasmine.any(Object));
        });

        it('should set the formOnly flag', function() {
            expect(SelfieSignUpCtrl.formOnly).toBe(false);

            initCtrl('Selfie:SignUp:Form');

            expect(SelfieSignUpCtrl.formOnly).toBe(true);
        });

        describe('methods', function() {
            describe('submit()', function() {
                describe('when model is valid', function() {
                    it('should sign up via the AccountService', function() {
                        SelfieSignUpCtrl.model = {
                            firstName: 'Selfie',
                            lastName: 'User',
                            company: 'Brand',
                            email: 'selfie@user.com',
                            password: '123456'
                        };

                        spyOn(AccountService, 'signUp').and.returnValue($q.when(null));

                        SelfieSignUpCtrl.submit();

                        expect(AccountService.signUp).toHaveBeenCalled();
                    });
                });

                describe('when required fields are empty', function() {
                    beforeEach(function() {
                        spyOn(AccountService, 'signUp').and.returnValue($q.when(null));

                        SelfieSignUpCtrl.model = {
                            firstName: '',
                            lastName: 'User',
                            company: '',
                            email: 'selfie@user.com',
                            password: ''
                        };

                        SelfieSignUpCtrl.submit();
                    });

                    it('should set the error property', function() {
                        expect(SelfieSignUpCtrl.errors).toEqual({
                            show: true,
                            firstName: true,
                            lastName: false,
                            company: true,
                            email: false,
                            password: true
                        });
                    });

                    it('should not submit to backend', function() {
                        expect(AccountService.signUp).not.toHaveBeenCalled();
                    });
                });

                describe('when sign up succeeds', function() {
                    describe('when it is form only', function() {
                        it('should go to "Selfie:SignUpSuccess:Frame"', function() {
                            SelfieSignUpCtrl.model = user = {
                                firstName: 'Selfie',
                                lastName: 'User',
                                company: 'Brand',
                                email: 'selfie@user.com',
                                password: '123456'
                            };
                            spyOn(AccountService, 'signUp').and.returnValue($q.when(user));
                            spyOn(c6State, 'goTo');

                            SelfieSignUpCtrl.formOnly = true;

                            $scope.$apply(function() {
                                SelfieSignUpCtrl.submit();
                            });

                            expect(SelfieSignUpCtrl.errors).toEqual({
                                show: false,
                                firstName: false,
                                lastName: false,
                                company: false,
                                email: false,
                                password: false
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:SignUpSuccess:Frame', [user]);
                        });
                    });

                    describe('when it the full sign up page', function() {
                        it('should go to "Selfie:SignUpSuccess:Full"', function() {
                            SelfieSignUpCtrl.model = user = {
                                firstName: 'Selfie',
                                lastName: 'User',
                                company: 'Brand',
                                email: 'selfie@user.com',
                                password: '123456'
                            };
                            spyOn(AccountService, 'signUp').and.returnValue($q.when(user));
                            spyOn(c6State, 'goTo');

                            SelfieSignUpCtrl.formOnly = false;

                            $scope.$apply(function() {
                                SelfieSignUpCtrl.submit();
                            });

                            expect(SelfieSignUpCtrl.errors).toEqual({
                                show: false,
                                firstName: false,
                                lastName: false,
                                company: false,
                                email: false,
                                password: false
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:SignUpSuccess:Full', [user]);
                        });
                    });
                });
            });
        });
    });
});