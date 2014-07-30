(function(){
    'use strict';

    define(['login', 'c6ui', 'angular'], function(loginModule, c6uiModule, angular) {
        var extend = angular.extend;

        describe('AuthService', function() {
            var $httpBackend, $timeout, AuthService, successSpy, failureSpy,
                c6UrlMaker, cinema6, $q;

            var org,
                user;

            beforeEach(function(){
                org = {
                    id: 'o-44342fd02ee28d',
                    config: {}
                };

                module(c6uiModule.name, ['$provide', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl  = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get     = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                }]);
                module(loginModule.name);
                module(function($provide) {
                    $provide.decorator('cinema6', function($delegate) {
                        var actualPush = $delegate.db.push;

                        $delegate.db.push = jasmine.createSpy('cinema6.db.push()')
                            .and.callFake(function() {
                                return (user = actualPush.apply(cinema6.db, arguments));
                            });

                        return $delegate;
                    });
                });

                inject(['$injector',function($injector){
                    AuthService         = $injector.get('AuthService');
                    $timeout     = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker   = $injector.get('c6UrlMaker');
                    cinema6      = $injector.get('cinema6');
                    $q           = $injector.get('$q');
                }]);

            });

            describe('login method', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('login.success');
                    failureSpy = jasmine.createSpy('login.failure');
                    spyOn($timeout,'cancel');
                    spyOn(cinema6.db, 'find').and.returnValue($q.when(org));
                    c6UrlMaker.and.returnValue('/api/auth/login'); 
                });

                it('will resolve promise if successfull',function(){
                    var mockUser = { id: 'userX', org: 'o-44342fd02ee28d' };
                    $httpBackend.expectPOST('/api/auth/login').respond(200,mockUser);
                    AuthService.login('userX','foobar').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', mockUser.org);
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: org }));
                    expect(successSpy.calls.mostRecent().args[0].org).toBe(org);
                    expect(successSpy).toHaveBeenCalledWith(user);
                    expect(failureSpy).not.toHaveBeenCalled();
                });

                it('will reject promise if not successful',function(){
                    $httpBackend.expectPOST('/api/auth/login')
                        .respond(404,'Unable to find user.');
                    AuthService.login('userX','foobar').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                });
            });

            describe('checkStatus method', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('checkStatus.success');
                    failureSpy = jasmine.createSpy('checkStatus.failure');
                    spyOn($timeout,'cancel');
                    spyOn(cinema6.db, 'find').and.returnValue($q.when(org));
                    c6UrlMaker.and.returnValue('/api/auth/status'); 
                });

                it('will resolve promise if successfull',function(){
                    var mockUser = { id: 'userX', org: 'o-44342fd02ee28d' };
                    $httpBackend.expectGET('/api/auth/status').respond(200,mockUser);
                    AuthService.checkStatus().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', mockUser.org);
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: org }));
                    expect(successSpy.calls.mostRecent().args[0].org).toBe(org);
                    expect(successSpy).toHaveBeenCalledWith(user);
                    expect(failureSpy).not.toHaveBeenCalled();
                });

                it('will reject promise if not successful',function(){
                    $httpBackend.expectGET('/api/auth/status')
                        .respond(404,'Unable to find user.');
                    AuthService.checkStatus().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                });
            });

            describe('logout', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('logout.success');
                    failureSpy = jasmine.createSpy('logout.failure');
                    spyOn($timeout,'cancel');
                    c6UrlMaker.and.returnValue('/api/auth/logout'); 
                });

                it('will resolve promise if successfull',function(){
                    $httpBackend.expectPOST('/api/auth/logout').respond(200,'Success');
                    AuthService.logout().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).toHaveBeenCalledWith('Success');
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successfull',function(){
                    var mockErr = { error : 'Error processing logout' };
                    $httpBackend.expectPOST('/api/auth/logout').respond(500,mockErr);
                    AuthService.logout().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith(mockErr.error);
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectPOST('/api/auth/logout').respond(200,{});
                    AuthService.logout().then(successSpy,failureSpy);
                    $timeout.flush(60000);
                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });
            });
        });

    });
}());

