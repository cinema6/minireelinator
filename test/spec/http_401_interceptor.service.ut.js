define(['app'], function(appModule) {
    'use strict';

    describe('Unauthorized401Interceptor', function() {
        var $rootScope,
            $q,
            $http,
            $interval,
            $httpBackend,
            _$httpProvider_,
            SelfieLoginDialogService,
            Unauthorized401Interceptor;

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
                SelfieLoginDialogService = $injector.get('SelfieLoginDialogService');
                Unauthorized401Interceptor = $injector.get('Unauthorized401Interceptor');
            });

            spyOn(SelfieLoginDialogService, 'display').and.callThrough();
        });

        it('should exist', function() {
            expect(Unauthorized401Interceptor).toEqual(jasmine.any(Object));
            expect(_$httpProvider_.interceptors).toContain('Unauthorized401Interceptor');
        });

        describe('responseError()', function() {
            var resp;

            beforeEach(function() {
                resp = {
                    status: 401,
                    config: {},
                    data: {}
                }
            });

            it('should return a promise', function() {
                expect(Unauthorized401Interceptor.responseError(resp).then).toBeDefined();
            });

            describe('when status is not 401', function() {
                [400, 403, 500].forEach(function(status) {
                    it('should reject the promise immediately', function() {
                        resp.status = status;

                        Unauthorized401Interceptor.responseError(resp)
                            .then(success, failure);

                        $rootScope.$digest();

                        expect(failure).toHaveBeenCalledWith(resp);
                    });
                });
            });

            describe('when the url is not from this domain or is an auth endpoint', function() {
                ['http://google.com', '//something.else.website.com', '/api/auth/status'].forEach(function(url) {
                    it('should reject the promise immediately', function() {
                        resp.config.url = url;

                        Unauthorized401Interceptor.responseError(resp)
                            .then(success, failure);

                        $rootScope.$digest();

                        expect(failure).toHaveBeenCalledWith(resp);
                    });
                });
            });

            describe('when the status is 401, the url is our domain, and not an auth endpoint', function() {
                function makeRequest(config) {
                    resp.config = config;

                    Unauthorized401Interceptor.responseError(resp)
                        .then(success, failure);

                    $rootScope.$digest();
                }

                [
                    {
                        url: '/api/campaigns?user=u-123&fields=id,name',
                        method: 'GET'
                    },
                    {
                        url: '/api/account/user/u-123',
                        method: 'POST',
                        data: {
                            name: 'Some User',
                            company: 'My Company'
                        }
                    },
                    {
                        url: '/api/campaign/cam-123',
                        method: 'PUT',
                        data: {
                            cards: [],
                            name: 'My Campaign'
                        }
                    }
                ].forEach(function(config) {
                    it('should display a login dialog', function() {
                        makeRequest(config);

                        expect(SelfieLoginDialogService.display).toHaveBeenCalled();
                    });

                    describe('when login succeeds', function() {
                        it('should try the initial call again', function() {
                            makeRequest(config);

                            $httpBackend.expect(config.method, config.url, config.data)
                                .respond();

                            $rootScope.$apply(function() {
                                SelfieLoginDialogService.success();
                            });

                            $httpBackend.flush();
                        });

                        describe('when second attempt succeeds', function() {
                            it('should resolve the initial promise', function() {
                                makeRequest(config);

                                $httpBackend.expect(config.method, config.url, config.data)
                                    .respond(200, config.data);

                                $rootScope.$apply(function() {
                                    SelfieLoginDialogService.success();
                                });

                                $httpBackend.flush();

                                expect(success).toHaveBeenCalledWith(jasmine.objectContaining({
                                    data: config.data
                                }));
                                expect(failure).not.toHaveBeenCalled();
                            });
                        });

                        describe('when second attempt fails', function() {
                            it('should reject the initial promise', function() {
                                makeRequest(config);

                                $httpBackend.expect(config.method, config.url, config.data)
                                    .respond(404, 'BAD');

                                $rootScope.$apply(function() {
                                    SelfieLoginDialogService.success();
                                });

                                $httpBackend.flush();

                                expect(failure).toHaveBeenCalled();
                                expect(success).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('when multiple requests fail at once', function() {
                    var requests;

                    beforeEach(function() {
                        requests = [
                            {
                                url: '/api/campaigns?user=u-123&fields=id,name',
                                method: 'GET'
                            },
                            {
                                url: '/api/account/user/u-123',
                                method: 'POST',
                                data: {
                                    name: 'Some User',
                                    company: 'My Company'
                                }
                            },
                            {
                                url: '/api/campaign/cam-123',
                                method: 'PUT',
                                data: {
                                    cards: [],
                                    name: 'My Campaign'
                                }
                            }
                        ];

                        requests.forEach(function(config) {
                            resp.config = config;

                            Unauthorized401Interceptor.responseError(resp)
                                .then(success, failure);

                            $rootScope.$digest();
                        });
                    });

                    describe('after login succeeds', function() {
                        it('should re-attempt all requests', function() {
                            requests.forEach(function(config) {
                                $httpBackend.expect(config.method, config.url, config.data)
                                    .respond();
                            });

                            $rootScope.$apply(function() {
                                SelfieLoginDialogService.success();
                            });

                            $httpBackend.flush();
                        });

                        describe('when second attempt succeeds', function() {
                            it('should resolve the initial promise', function() {
                                requests.forEach(function(config) {
                                    $httpBackend.expect(config.method, config.url, config.data)
                                        .respond(200, config.data);
                                });

                                $rootScope.$apply(function() {
                                    SelfieLoginDialogService.success();
                                });

                                $httpBackend.flush();

                                requests.forEach(function(config) {
                                    expect(success).toHaveBeenCalledWith(jasmine.objectContaining({
                                        data: config.data
                                    }));
                                });
                                expect(failure).not.toHaveBeenCalled();
                            });
                        });

                        describe('when second attempt fails', function() {
                            it('should reject the initial promise', function() {
                                requests.forEach(function(config) {
                                    $httpBackend.expect(config.method, config.url, config.data)
                                        .respond(404, config.data);
                                });

                                $rootScope.$apply(function() {
                                    SelfieLoginDialogService.success();
                                });

                                $httpBackend.flush();

                                requests.forEach(function(config) {
                                    expect(failure).toHaveBeenCalledWith(jasmine.objectContaining({
                                        data: config.data
                                    }));
                                });
                                expect(success).not.toHaveBeenCalled();
                            });
                        });
                    });
                });
            });
        });
    });
});