define(['account/app','c6ui'], function(accountModule, c6uiModule) {
    'use strict';

    describe('account', function() {
        var $httpBackend, $timeout, AccountService, successSpy, failureSpy,
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
            module(accountModule.name);

            inject(['$injector',function($injector){
                AccountService      = $injector.get('AccountService');
                $timeout     = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                c6UrlMaker   = $injector.get('c6UrlMaker');
            }]);
            
        });

        describe('changeEmail method', function(){
            
            beforeEach(function(){
                successSpy = jasmine.createSpy('changeEmail.success');
                failureSpy = jasmine.createSpy('changeEmail.failure');
                spyOn($timeout,'cancel');
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
                expect($timeout.cancel).toHaveBeenCalled();
            });

            it('will reject promise if not successful',function(){
                $httpBackend.expectPOST('/api/account/user/email')
                    .respond(400,'Unable to find user.');
                AccountService.changeEmail('userX','foobar','xx')
                    .then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                expect($timeout.cancel).toHaveBeenCalled();
            });

            it('will reject promise if times out',function(){
                $httpBackend.expectPOST('/api/account/user/email')
                    .respond(200,{});
                AccountService.changeEmail('userX','foobar','x')
                    .then(successSpy,failureSpy);
                $timeout.flush(60000);
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
            });

        });

        describe('changePassword', function(){
            beforeEach(function(){
                successSpy = jasmine.createSpy('changePassword.success');
                failureSpy = jasmine.createSpy('changePassword.failure');
                spyOn($timeout,'cancel');
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
                expect($timeout.cancel).toHaveBeenCalled();
            });

            it('will reject promise if not successfull',function(){
                $httpBackend.expectPOST('/api/account/user/password')
                    .respond(500,'There was an error.');
                AccountService.changePassword('a','b','c')
                    .then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('There was an error.');
                expect($timeout.cancel).toHaveBeenCalled();
            });

            it('will reject promise if times out',function(){
                $httpBackend.expectPOST('/api/account/user/password').respond(200,{});
                AccountService.changePassword('a','b','c')
                    .then(successSpy,failureSpy);
                $timeout.flush(60000);
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
            });
            
        });

        describe('getOrg', function(){
            beforeEach(function(){
                successSpy = jasmine.createSpy('getOrg.success');
                failureSpy = jasmine.createSpy('getOrg.failure');
                c6UrlMaker.and.returnValue('/api/account/org/o-1'); 
                spyOn($timeout,'cancel');
            });

            it('will resolve promise if successfull',function(){
                var mockOrg = { id: 'o-1' };
                $httpBackend.expectGET('/api/account/org/o-1')
                    .respond(200,mockOrg);
                AccountService.getOrg('o-1').then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).toHaveBeenCalledWith(mockOrg);
                expect(failureSpy).not.toHaveBeenCalled();
                expect($timeout.cancel).toHaveBeenCalled();
            });
            
            it('will reject promise if not successful',function(){
                $httpBackend.expectGET('/api/account/org/o-1')
                    .respond(404,'Unable to find org.');
                AccountService.getOrg('o-1').then(successSpy,failureSpy);
                $httpBackend.flush();
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Unable to find org.');
                expect($timeout.cancel).toHaveBeenCalled();
            });
            
            it('will reject promise if times out',function(){
                $httpBackend.expectGET('/api/account/org/o-1')
                    .respond(200,'');
                AccountService.getOrg('o-1').then(successSpy,failureSpy);
                $timeout.flush(60000);
                expect(successSpy).not.toHaveBeenCalled();
                expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
            });
        });
    });
});
