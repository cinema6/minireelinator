define(['account/app','c6uilib'], function(accountModule, c6uiModule) {
    'use strict';

    describe('account', function() {
        var $httpBackend, $timeout, $http, AccountService, successSpy, failureSpy,
            c6UrlMaker;

        beforeEach(function(){
            module(c6uiModule.name, ['$provide', function($provide) {
                $provide.provider('c6UrlMaker', function(){
                    this.location = jasmine.createSpy('urlMaker.location');
                    this.makeUrl  = jasmine.createSpy('urlMaker.makeUrl');
                    this.$get     = function(){
                        return jasmine.createSpy('urlMaker.get');
                    };
                });
            }]);
            module(accountModule.name, ['$provide', function($provide) {
                $provide.decorator('$http', function($delegate) {
                    return jasmine.createSpy('$http').and.callFake(function() {
                        return $delegate.apply(null, arguments);
                    });
                });
            }]);

            inject(['$injector',function($injector){
                AccountService      = $injector.get('AccountService');
                $timeout     = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                $http = $injector.get('$http');
                c6UrlMaker   = $injector.get('c6UrlMaker');
            }]);
        });

        afterAll(function() {
            $httpBackend = null;
            $timeout = null;
            $http = null;
            AccountService = null;
            successSpy = null;
            failureSpy = null;
            c6UrlMaker = null;
        });

        describe('changeEmail method', function(){

            beforeEach(function(){
                successSpy = jasmine.createSpy('changeEmail.success');
                failureSpy = jasmine.createSpy('changeEmail.failure');
                c6UrlMaker.and.returnValue('/api/account/user/email');
            });

            it('will resolve promise if successfull',function(){
                $httpBackend.expectPOST('/api/account/user/email')
                    .respond(200,'Successfully changed email');
                AccountService.changeEmail('userX','foobar','usery')
                    .then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).toHaveBeenCalledWith('Successfully changed email');
                expect(failureSpy).not.toHaveBeenCalled();
            });

            it('will reject promise if not successful',function(){
                $httpBackend.expectPOST('/api/account/user/email')
                    .respond(400,'Unable to find user.');
                AccountService.changeEmail('userX','foobar','xx')
                    .then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
            });

            it('should use the $http service', function() {
                AccountService.changeEmail('userX','foobar','xx');

                expect($http).toHaveBeenCalledWith({
                    method: 'POST',
                    url: '/api/account/user/email',
                    data: {
                        email: 'userX',
                        password: 'foobar',
                        newEmail: 'xx'
                    },
                    timeout: 10000
                });
            });

        });

        describe('changePassword', function(){
            beforeEach(function(){
                successSpy = jasmine.createSpy('changePassword.success');
                failureSpy = jasmine.createSpy('changePassword.failure');
                c6UrlMaker.and.returnValue('/api/account/user/password');
            });

            it('will resolve promise if successfull',function(){
                $httpBackend.expectPOST('/api/account/user/password')
                    .respond(200,"Success");
                AccountService.changePassword('a','b','c')
                    .then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).toHaveBeenCalledWith("Success");
                expect(failureSpy).not.toHaveBeenCalled();
            });

            it('will reject promise if not successfull',function(){
                $httpBackend.expectPOST('/api/account/user/password')
                    .respond(500,'There was an error.');
                AccountService.changePassword('a','b','c')
                    .then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('There was an error.');
            });

            it('should use the $http service', function() {
                AccountService.changePassword('a','b','c');

                expect($http).toHaveBeenCalledWith({
                    method: 'POST',
                    url: '/api/account/user/password',
                    data: {
                        email: 'a',
                        password: 'b',
                        newPassword: 'c'
                    },
                    timeout: 10000
                });
            });

        });

        describe('confirmUser', function() {
            beforeEach(function(){
                successSpy = jasmine.createSpy('confirmUser.success');
                failureSpy = jasmine.createSpy('confirmUser.failure');
                c6UrlMaker.and.returnValue('/api/account/users/confirm/u-111');
            });

            it('will resolve promise if successfull',function(){
                var mockUser = { id: 'u-111' };
                $httpBackend.expectPOST('/api/account/users/confirm/u-111')
                    .respond(200,mockUser);
                AccountService.confirmUser('u-111','1234567').then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).toHaveBeenCalledWith(mockUser);
                expect(failureSpy).not.toHaveBeenCalled();
            });

            it('will reject promise if not successful',function(){
                $httpBackend.expectPOST('/api/account/users/confirm/u-111')
                    .respond(404,'Unable to confirm user.');
                AccountService.confirmUser('u-111', '1234567').then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Unable to confirm user.');
            });

            it('should use the $http service', function() {
                AccountService.confirmUser('u-111', '1234567');

                expect($http).toHaveBeenCalledWith({
                    method: 'POST',
                    url: '/api/account/users/confirm/u-111',
                    data: {
                        token: '1234567'
                    },
                    timeout: 10000
                });
            });
        });

        describe('resendActivation', function() {
            beforeEach(function(){
                successSpy = jasmine.createSpy('resendActivation.success');
                failureSpy = jasmine.createSpy('resendActivation.failure');
                c6UrlMaker.and.returnValue('/api/account/users/resendActivation');
            });

            it('will resolve promise if successfull',function(){
                var mockUser = { id: 'u-111' };
                $httpBackend.expectPOST('/api/account/users/resendActivation')
                    .respond(200,mockUser);
                AccountService.resendActivation().then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).toHaveBeenCalledWith(mockUser);
                expect(failureSpy).not.toHaveBeenCalled();
            });

            it('will reject promise if not successful',function(){
                $httpBackend.expectPOST('/api/account/users/resendActivation')
                    .respond(404,'Unable to confirm user.');
                AccountService.resendActivation().then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Unable to confirm user.');
            });

            it('should use the $http service', function() {
                AccountService.resendActivation('u-111', '1234567');

                expect($http).toHaveBeenCalledWith({
                    method: 'POST',
                    url: '/api/account/users/resendActivation',
                    data: {},
                    timeout: 10000
                });
            });
        });

        describe('signUp', function() {
            var mockUser;

            beforeEach(function(){
                successSpy = jasmine.createSpy('signup.success');
                failureSpy = jasmine.createSpy('signup.failure');
                c6UrlMaker.and.returnValue('/api/account/users/signup');

                mockUser = { email: 'fake@email.com' };
            });

            it('will resolve promise if successfull',function(){
                $httpBackend.expectPOST('/api/account/users/signup')
                    .respond(200,mockUser);
                AccountService.signUp(mockUser).then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).toHaveBeenCalledWith(mockUser);
                expect(failureSpy).not.toHaveBeenCalled();
            });

            it('will reject promise if not successful',function(){
                $httpBackend.expectPOST('/api/account/users/signup')
                    .respond(404,'Unable to create user.');
                AccountService.signUp(mockUser).then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Unable to create user.');
            });

            it('should use the $http service', function() {
                AccountService.signUp(mockUser);

                expect($http).toHaveBeenCalledWith({
                    method: 'POST',
                    url: '/api/account/users/signup',
                    data: mockUser,
                    timeout: 10000
                });
            });
        });
    });
});
