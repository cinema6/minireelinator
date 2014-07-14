define(['account/app'], function(accountModule) {
    'use strict';

    describe('PasswordController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            AccountService,
            PasswordCtrl,
            AccountCtrl;

        beforeEach(function() {
            module(accountModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                AccountService = $injector.get('AccountService');
                $q = $injector.get('$q');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    AccountCtrl = $scope.AccountCtrl = {
                        model: {
                            email: 'josh@cinema6.com'
                        }
                    };
                    PasswordCtrl = $controller('PasswordController', { $scope: $scope });
                });
            });
        });

        it('should exist', function() {
            expect(PasswordCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('pattern', function() {
                var pattern;

                beforeEach(function() {
                    pattern = PasswordCtrl.pattern;
                    expect(pattern).toEqual(jasmine.any(RegExp));
                });

                it('should succeed with space-less string', function() {
                    expect('password').toMatch(pattern);
                    expect('bslff398fvf').toMatch(pattern);
                });

                it('should fail with a string with spaces', function() {
                    expect(' password ').not.toMatch(pattern);
                    expect('test password').not.toMatch(pattern);
                });
            });

            describe('lastMessage', function() {
                it('should be null', function() {
                    expect(PasswordCtrl.lastMessage).toBeNull();
                });
            });

            describe('passwords', function() {
                it('should be an empty array of three nulls', function() {
                    expect(PasswordCtrl.passwords).toEqual([null, null, null]);
                });
            });
        });

        describe('methods', function() {
            describe('submit()', function() {
                beforeEach(function() {
                    spyOn(AccountService, 'changePassword');
                    PasswordCtrl.lastMessage = 'jhfsjkfnds';
                    PasswordCtrl.passwords = ['pass1', 'pass2', 'pass3'];
                });

                describe('if the change succeeds', function() {
                    beforeEach(function() {
                        AccountService.changePassword.and.returnValue($q.when('IT WORKED!'));
                        PasswordCtrl.submit();
                    });

                    it('should reset the last message', function() {
                        expect(PasswordCtrl.lastMessage).toBeNull();
                    });

                    it('should send the request to change the password', function() {
                        expect(AccountService.changePassword).toHaveBeenCalledWith(AccountCtrl.model.email, PasswordCtrl.passwords[0], PasswordCtrl.passwords[1]);
                    });

                    describe('after the server responds', function() {
                        beforeEach(function() {
                            $scope.$digest();
                        });

                        it('should set the message to indicate success', function() {
                            expect(PasswordCtrl.lastMessage).toBe('Password has been changed.');
                        });

                        it('should reset the passwords array', function() {
                            expect(PasswordCtrl.passwords).toEqual([null, null, null]);
                        });
                    });
                });

                describe('if the change fails', function() {
                    beforeEach(function() {
                        AccountService.changePassword.and.returnValue($q.reject('Some error.'));
                        $scope.$apply(function() {
                            PasswordCtrl.submit();
                        });
                    });

                    it('should show an error message', function() {
                        expect(PasswordCtrl.lastMessage).toBe('Password change failed: Some error.');
                        expect(PasswordCtrl.passwords).toEqual([null, null, null]);
                    });
                });
            });
        });
    });
});
