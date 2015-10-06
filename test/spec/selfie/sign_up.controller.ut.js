define(['app'], function(appModule) {
    'use strict';

    describe('SelfieSignUpController', function() {
        var $rootScope,
            $controller,
            c6State,
            AccountService,
            $q,
            $scope,
            SelfieSignUpCtrl;

        var user;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                AccountService = $injector.get('AccountService');
                $q = $injector.get('$q');
            });

            user = {
                firstName: '',
                lastName: '',
                company: '',
                email: '',
                password: ''
            };

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieSignUpCtrl = $controller('SelfieSignUpController');
                SelfieSignUpCtrl.model = user;
            });
        });

        it('should exist', function() {
            expect(SelfieSignUpCtrl).toEqual(jasmine.any(Object));
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
                            firstName: true,
                            lastName: false,
                            company: true,
                            email: false,
                            password: true
                        })
                    });

                    it('should not submit to backend', function() {
                        expect(AccountService.signUp).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});