define(['account/app'], function(accountModule) {
    'use strict';

    describe('EmailController', function() {
        var $rootScope,
            $controller,
            $scope,
            $q,
            AccountService,
            AccountCtrl,
            EmailCtrl;

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
                    EmailCtrl = $controller('EmailController', { $scope: $scope });
                });
            });
        });

        it('should exist', function() {
            expect(EmailCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('email', function() {
                it('should be null', function() {
                    expect(EmailCtrl.email).toBeNull();
                });
            });

            describe('password', function() {
                it('should be an empty string', function() {
                    expect(EmailCtrl.password).toBe('');
                });
            });

            describe('lastMessage', function() {
                it('should be null', function() {
                    expect(EmailCtrl.lastMessage).toBeNull();
                });
            });

            describe('pattern', function() {
                var pattern;

                beforeEach(function() {
                    pattern = EmailCtrl.pattern;
                    expect(pattern).toEqual(jasmine.any(RegExp));
                });

                it('should match valid emails', function() {
                    expect('josh@cinema6.com').toMatch(pattern);
                    expect('123@blah.co').toMatch(pattern);
                });

                it('should not match invalid emails', function() {
                    expect(' josh@blah.com').not.toMatch(pattern);
                    expect('hello').not.toMatch(pattern);
                    expect('josh@cinema6.c').not.toMatch(pattern);
                });
            });
        });

        describe('methods', function() {
            describe('submit()', function() {
                var deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    spyOn(AccountService, 'changeEmail').and.returnValue(deferred.promise);

                    EmailCtrl.lastMessage = 'asdhfu2rh3u';
                    EmailCtrl.email = 'jminzner@cinema6.com';
                    EmailCtrl.password = 'mypassword123';
                    EmailCtrl.submit();
                });

                describe('before the service responds', function() {
                    it('should clear the lastMessage', function() {
                        expect(EmailCtrl.lastMessage).toBeNull();
                    });

                    it('should send a request to change the email', function() {
                        expect(AccountService.changeEmail).toHaveBeenCalledWith(AccountCtrl.model.email, EmailCtrl.password, EmailCtrl.email);
                    });
                });

                describe('if the request succeeds', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            deferred.resolve('Success!');
                        });
                    });

                    it('should show a successful message', function() {
                        expect(EmailCtrl.lastMessage).toBe('Email has been changed.');
                    });

                    it('should change the AccountCtrl\'s email to the new email', function() {
                        expect(AccountCtrl.model.email).toBe(EmailCtrl.email);
                    });
                });

                describe('if the request fails', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            deferred.reject('It just didn\'t work!');
                        });
                    });

                    it('should show a failure message', function() {
                        expect(EmailCtrl.lastMessage).toBe('Email change failed: It just didn\'t work!');
                    });
                });
            });
        });
    });
});
