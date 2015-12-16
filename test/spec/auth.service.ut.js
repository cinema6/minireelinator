(function(){
    'use strict';

    define(['app', 'c6uilib', 'angular'], function(appModule, c6uiModule, angular) {
        var extend = angular.extend;

        describe('AuthService', function() {
            var $httpBackend, $timeout, AuthService, successSpy, failureSpy,
                c6UrlMaker, cinema6, $q;

            var org,
                user,
                advertiser,
                customer;

            beforeEach(function(){
                org = {
                    id: 'o-44342fd02ee28d',
                    config: {}
                };

                advertiser = {
                    id: 'a-1234'
                };

                customer = {
                    id: 'cus-1234'
                };

                module(appModule.name);
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

                spyOn(cinema6.db, 'find').and.callFake(function(args) {
                    var response;

                    switch(args) {
                        case 'org':
                            response = org;
                            break;
                        case 'advertiser':
                            response = advertiser;
                            break;
                        case 'customer':
                            response = customer;
                            break;
                    }

                    return $q.when(response);
                });
            });

            describe('resetPassword(userId, token, password)', function() {
                var userJSON,
                    success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    userJSON = {
                        id: 'u-956a985182e6aa',
                        org: 'o-44342fd02ee28d',
                        advertiser: 'a-1234',
                        customer: 'cus-1234',
                        config: {}
                    };

                    $httpBackend.expectPOST('/api/auth/password/reset', {
                        id: 'u-956a985182e6aa',
                        token: '4510d0785dcfa5',
                        newPassword: 'password2'
                    }).respond(200, extend(userJSON, { org: org, advertiser: advertiser, customer: customer }));

                    AuthService.resetPassword('u-956a985182e6aa', '4510d0785dcfa5', 'password2')
                        .then(success, failure);

                    $httpBackend.flush();
                });

                it('should attach the org to the user', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', userJSON.org);
                    expect(success.calls.mostRecent().args[0].org).toBe(org);
                });

                it('should attached the advertiser and customer', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', userJSON.advertiser);
                    expect(cinema6.db.find).toHaveBeenCalledWith('customer', userJSON.customer);
                    expect(success.calls.mostRecent().args[0].advertiser).toBe(advertiser);
                    expect(success.calls.mostRecent().args[0].customer).toBe(customer);
                });

                it('should resolve to the cinema6.db user model', function() {
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', userJSON.id, userJSON);
                    expect(success).toHaveBeenCalledWith(user);
                });

                describe('in the event of failure', function() {
                    beforeEach(function() {
                        $httpBackend.expectPOST('/api/auth/password/reset', {
                            id: 'u-ae1b702b26c2ff',
                            token: '9a784d7d4d63b8',
                            newPassword: 'passy'
                        }).respond(403, 'No reset token found');

                        AuthService.resetPassword('u-ae1b702b26c2ff', '9a784d7d4d63b8', 'passy')
                            .then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should resolve to the failure message', function() {
                        expect(failure).toHaveBeenCalledWith('No reset token found');
                    });
                });
            });

            describe('requestPasswordReset(email, targetApp)', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    $httpBackend.expectPOST('/api/auth/password/forgot', {
                        email: 'josh@cinema6.com',
                        target: 'portal'
                    }).respond(200, 'Successfully generated reset token');

                    AuthService.requestPasswordReset('josh@cinema6.com','portal').then(success, failure);

                    $httpBackend.flush();
                });

                it('should resolve to the success message', function() {
                    expect(success).toHaveBeenCalledWith('Successfully generated reset token');
                });

                describe('in the event of failure', function() {
                    beforeEach(function() {
                        $httpBackend.expectPOST('/api/auth/password/forgot', {
                            email: 'evan@cinema6.com',
                            target: 'portal'
                        }).respond(404, 'That user does not exist');

                        AuthService.requestPasswordReset('evan@cinema6.com','portal').then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should resolve to the failure message', function() {
                        expect(failure).toHaveBeenCalledWith('That user does not exist');
                    });
                });
            });

            describe('login method', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('login.success');
                    failureSpy = jasmine.createSpy('login.failure');
                    spyOn($timeout,'cancel');
                });

                it('will resolve promise if successfull',function(){
                    var mockUser = { id: 'userX', org: 'o-44342fd02ee28d', advertiser: 'a-1234', customer: 'cus-1234' };
                    $httpBackend.expectPOST('/api/auth/login').respond(200,mockUser);
                    AuthService.login('userX','foobar').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', mockUser.org);
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: org, advertiser: advertiser, customer: customer }));
                    expect(successSpy.calls.mostRecent().args[0].org).toBe(org);
                    expect(successSpy.calls.mostRecent().args[0].advertiser).toBe(advertiser);
                    expect(successSpy.calls.mostRecent().args[0].customer).toBe(customer);
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

                it('should not call for org, advertiser or customer if not defined, and should not set customer prop', function() {
                    var mockUser = { id: 'userX' };
                    $httpBackend.expectPOST('/api/auth/login').respond(200,mockUser);
                    AuthService.login('userX','foobar').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).not.toHaveBeenCalled();
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: undefined, advertiser: undefined }));
                    expect(successSpy).toHaveBeenCalledWith(user);
                    expect(failureSpy).not.toHaveBeenCalled();
                });

                it('should not modify the customer property if decoration request fails', function() {
                    cinema6.db.find.and.callFake(function(args) {
                        var response;

                        switch(args) {
                            case 'org':
                                response = org;
                                break;
                            case 'advertiser':
                                response = advertiser;
                                break;
                            case 'customer':
                                return $q.reject('Not Found');
                                break;
                        }

                        return $q.when(response);
                    });
                    var mockUser = { id: 'userX', customer: 'cus-123' };
                    $httpBackend.expectPOST('/api/auth/login').respond(200,mockUser);
                    AuthService.login('userX','foobar').then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).toHaveBeenCalledWith('customer', 'cus-123');
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: undefined, advertiser: undefined, customer: 'cus-123' }));
                    expect(successSpy).toHaveBeenCalledWith(user);
                    expect(failureSpy).not.toHaveBeenCalled();
                });
            });

            describe('checkStatus method', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('checkStatus.success');
                    failureSpy = jasmine.createSpy('checkStatus.failure');
                    spyOn($timeout,'cancel');
                });

                it('will resolve promise if successfull',function(){
                    var mockUser = { id: 'userX', org: 'o-44342fd02ee28d', advertiser: 'a-1234', customer: 'cus-1234' };
                    $httpBackend.expectGET('/api/auth/status').respond(200,mockUser);
                    AuthService.checkStatus().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', mockUser.org);
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: org, advertiser: advertiser, customer: customer }));
                    expect(successSpy.calls.mostRecent().args[0].org).toBe(org);
                    expect(successSpy.calls.mostRecent().args[0].advertiser).toBe(advertiser);
                    expect(successSpy.calls.mostRecent().args[0].customer).toBe(customer);
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

                it('should decorate with an Org if defined', function() {
                    var mockUser = { id: 'userX', org: 'o-44342fd02ee28d' };
                    $httpBackend.expectGET('/api/auth/status').respond(200,mockUser);
                    AuthService.checkStatus().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', mockUser.org);
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: org, advertiser: undefined }));
                    expect(successSpy).toHaveBeenCalledWith(user);
                    expect(failureSpy).not.toHaveBeenCalled();
                });

                it('should not call for org, advertiser or customer if not defined, and should not set customer prop to undefined', function() {
                    var mockUser = { id: 'userX' };
                    $httpBackend.expectGET('/api/auth/status').respond(200,mockUser);
                    AuthService.checkStatus().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).not.toHaveBeenCalled();
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: undefined, advertiser: undefined }));
                    expect(successSpy).toHaveBeenCalledWith(user);
                    expect(failureSpy).not.toHaveBeenCalled();
                });

                it('should not modify the customer property if decoration request fails', function() {
                    cinema6.db.find.and.callFake(function(args) {
                        var response;

                        switch(args) {
                            case 'org':
                                response = org;
                                break;
                            case 'advertiser':
                                response = advertiser;
                                break;
                            case 'customer':
                                return $q.reject('Not Found');
                                break;
                        }

                        return $q.when(response);
                    });
                    var mockUser = { id: 'userX', customer: 'cus-123' };
                    $httpBackend.expectGET('/api/auth/status').respond(200,mockUser);
                    AuthService.checkStatus().then(successSpy,failureSpy);
                    $httpBackend.flush();
                    expect(cinema6.db.find).toHaveBeenCalledWith('customer', 'cus-123');
                    expect(cinema6.db.push).toHaveBeenCalledWith('user', mockUser.id, extend(mockUser, { org: undefined, advertiser: undefined, customer: 'cus-123' }));
                    expect(successSpy).toHaveBeenCalledWith(user);
                    expect(failureSpy).not.toHaveBeenCalled();
                });
            });

            describe('logout', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('logout.success');
                    failureSpy = jasmine.createSpy('logout.failure');
                    spyOn($timeout,'cancel');
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

