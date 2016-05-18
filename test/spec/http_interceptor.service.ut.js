define(['app'], function(appModule) {
    'use strict';

    describe('Accepted202Interceptor', function() {
        var $rootScope,
            $q,
            $http,
            $interval,
            $httpBackend,
            _$httpProvider_,
            Accepted202Interceptor;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name, function($httpProvider) {
                _$httpProvider_ = $httpProvider;
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $http = $injector.get('$http');
                $interval = $injector.get('$interval');
                $httpBackend = $injector.get('$httpBackend');
                Accepted202Interceptor = $injector.get('Accepted202Interceptor');
            });
        });

        afterAll(function() {
            $rootScope = null;
            $q = null;
            $http = null;
            $interval = null;
            $httpBackend = null;
            _$httpProvider_ = null;
            Accepted202Interceptor = null;
            success = null;
            failure = null;
        });

        it('should exist', function() {
            expect(Accepted202Interceptor).toEqual(jasmine.any(Object));
            expect(_$httpProvider_.interceptors).toContain('Accepted202Interceptor');
        });

        describe('response()', function() {
            var resp;

            beforeEach(function() {
                resp = {
                    status: 200,
                    config: {},
                    data: {}
                }
            });

            it('should return a promise', function() {
                expect(Accepted202Interceptor.response(resp).then).toBeDefined();
            });

            describe('when the call is a "retry"', function() {
                it('should fulfill the promise immediately', function() {
                    resp.config.retry = true;
                    resp.status = 202;
                    resp.data.url = '/api/';

                    Accepted202Interceptor.response(resp)
                        .then(success, failure);

                    $rootScope.$digest();

                    expect(success).toHaveBeenCalledWith(resp);
                });
            });

            describe('when the url is not defined', function() {
                it('should fulfill the promise immediately', function() {
                    resp.config.retry = false;
                    resp.status = 202;

                    Accepted202Interceptor.response(resp)
                        .then(success, failure);

                    $rootScope.$digest();

                    expect(success).toHaveBeenCalledWith(resp);
                });
            });

            describe('when the status is not 202', function() {
                it('should fulfill the promise immediately', function() {
                    resp.config.retry = false;
                    resp.status = 200;
                    resp.data.url = '/api/';

                    Accepted202Interceptor.response(resp)
                        .then(success, failure);

                    $rootScope.$digest();

                    expect(success).toHaveBeenCalledWith(resp);
                });
            });

            describe('when the status is 202, it is not a "retry" and there is a url', function() {
                var deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    resp.config.retry = false;
                    resp.status = 202;
                    resp.data.url = '/api/content/job/addf1234';

                    spyOn($http, 'get').and.returnValue(deferred.promise);

                    Accepted202Interceptor.response(resp)
                        .then(success, failure);

                    $rootScope.$digest();

                    expect(success).not.toHaveBeenCalled();
                    expect($http.get).not.toHaveBeenCalled();
                });

                it('should call the url every two seconds', function() {
                    $interval.flush(2000);
                    expect($http.get).toHaveBeenCalledWith('/api/content/job/addf1234', jasmine.objectContaining({retry:true}));

                    $interval.flush(2000);
                    expect($http.get.calls.count()).toBe(2);

                    $interval.flush(2000);
                    expect($http.get.calls.count()).toBe(3);
                });

                it('should time out and reject promise after 30 seconds (15 attempts, not including the first)', function() {
                    $interval.flush(30000);
                    expect($http.get.calls.count()).toBe(14);

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalled();
                });

                describe('when the "retry" call succeeds', function() {
                    it('should resolve the original promise', function() {
                        $interval.flush(3000);
                        expect(success).not.toHaveBeenCalled();

                        deferred.resolve({ status: 200 });
                        $rootScope.$digest();
                        expect(success).toHaveBeenCalledWith({ status: 200 });
                    });
                });
            });
        });

        describe('the interceptor in action', function() {
            describe('when response is not 202', function() {
                it('should resolve the promise immediately if successful', function() {
                    $httpBackend.expectGET('/api/content/experience/e-123')
                        .respond(200, {id: 'e-123'});

                    $http.get('/api/content/experience/e-123')
                        .then(success, failure);

                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(jasmine.objectContaining({ data: { id: 'e-123' } }));
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should reject the promise immediately if failed', function() {
                    $httpBackend.expectGET('/api/content/experience/e-123')
                        .respond(404, 'NOT FOUND');

                    $http.get('/api/content/experience/e-123')
                        .then(success, failure);

                    $httpBackend.flush();

                    expect(success).not.toHaveBeenCalledWith();
                    expect(failure).toHaveBeenCalled();
                });
            });

            describe('when the response is 202', function() {
                beforeEach(function() {
                    spyOn($http, 'get').and.callThrough();
                });

                describe('and it is a "retry" call', function() {
                    it('should resolve immediately', function() {
                        $httpBackend.when('GET', '/api/content/job/asdf1234').respond(202, {url: '/api/content/job/asdf1234'});

                        $http.get('/api/content/job/asdf1234', {retry: true})
                            .then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalled();
                    });
                });

                describe('and the url is not defined', function() {
                    it('should resovle immeditely', function() {
                        $httpBackend.when('GET', '/api/content/job/asdf1234').respond(202, 'partial, no url');

                        $http.get('/api/content/job/asdf1234')
                            .then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalled();
                    });
                });

                describe('when "retry" is falsy and response contains a url', function() {
                    beforeEach(function() {
                        $httpBackend.expectGET('/api/content/experience/e-123')
                            .respond(202, { url: '/api/content/job/asdf1234' });

                        $httpBackend.when('GET', '/api/content/job/asdf1234').respond(202, { url: '/api/content/job/asdf1234' });

                        $http.get('/api/content/experience/e-123')
                            .then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should not resolve or reject the promise', function() {
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should poll the url until a non-202 response is received', function() {
                        $http.get.calls.reset();
                        $interval.flush(6000);

                        expect($http.get.calls.count()).toBe(3);
                        $http.get.calls.all().forEach(function(call) {
                            expect(call.args[0]).toBe('/api/content/job/asdf1234');
                            expect(call.args[1]).toEqual(jasmine.objectContaining({ retry: true }));
                        });
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should fulfill the original promise when the job url responds with a non-202', function() {
                        $httpBackend.expectGET('/api/content/job/asdf1234').respond(200, {id: 'e-123'});

                        $interval.flush(4000);
                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith(jasmine.objectContaining({ data: { id: 'e-123' }}));
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the original promise if the job url responds with failure', function() {
                        $httpBackend.expectGET('/api/content/job/asdf1234').respond(404, 'not found');

                        $interval.flush(4000);
                        $httpBackend.flush();

                        expect(success).not.toHaveBeenCalledWith();
                        expect(failure).toHaveBeenCalled();
                    });

                    it('should reject the promise after 30 seconds (14 attempts not including the first)', function() {
                        $http.get.calls.reset();
                        $interval.flush(30000);

                        expect($http.get.calls.count()).toBe(14);
                        $http.get.calls.all().forEach(function(call) {
                            expect(call.args[0]).toBe('/api/content/job/asdf1234');
                            expect(call.args[1]).toEqual(jasmine.objectContaining({ retry: true }));
                        });
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
