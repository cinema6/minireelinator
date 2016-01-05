(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('SelfieWebsiteScrapingDialogService', function() {
            var $rootScope,
                SelfieWebsiteScrapingDialogService,
                $q;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    SelfieWebsiteScrapingDialogService = $injector.get('SelfieWebsiteScrapingDialogService');
                    $q = $injector.get('$q');
                });
            });

            it('should exist', function() {
                expect(SelfieWebsiteScrapingDialogService).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('model', function() {
                    it('should be an object', function() {
                        expect(SelfieWebsiteScrapingDialogService.model).toEqual(jasmine.any(Object));
                    });

                    it('should not be publically settable', function() {
                        expect(function() {
                            SelfieWebsiteScrapingDialogService.model = {};
                        }).toThrow();
                    });
                });
            });

            describe('display(promise)', function() {
                var deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    SelfieWebsiteScrapingDialogService.display(deferred.promise);
                });

                it('should set model.show to true', function() {
                    expect(SelfieWebsiteScrapingDialogService.model.show).toBe(true);
                });

                it('should set model.loading to true', function() {
                    expect(SelfieWebsiteScrapingDialogService.model.loading).toBe(true);
                });

                it('should return a promise', function() {
                    expect(SelfieWebsiteScrapingDialogService.display(deferred.promise).then).toBeDefined();
                });

                describe('when the passed in promise resolves with data', function() {
                    it('should add the model.logo and model.links properties with data', function() {
                        var data = {
                            links: {
                                facebook: 'http://facebook.com',
                                twitter: 'http://twitter.com',
                                instagram: 'http://instagram.com',
                                pinterest: null,
                                youtube: null
                            },
                            images: {
                                profile: 'http://logo.com'
                            }
                        };

                        $rootScope.$apply(function() {
                            deferred.resolve(data);
                        });

                        expect(SelfieWebsiteScrapingDialogService.model.logo).toEqual({
                            href: data.images.profile,
                            selected: true
                        });

                        expect(SelfieWebsiteScrapingDialogService.model.links).toEqual([
                            {
                                cssClass: 'facebook-square',
                                name: 'facebook',
                                href: 'http://facebook.com',
                                selected: true
                            },
                            {
                                cssClass: 'twitter-square',
                                name: 'twitter',
                                href: 'http://twitter.com',
                                selected: true
                            },
                            {
                                cssClass: 'instagram',
                                name: 'instagram',
                                href: 'http://instagram.com',
                                selected: true
                            },
                            {
                                cssClass: 'pinterest-square',
                                name: 'pinterest',
                                href: null,
                                selected: true
                            },
                            {
                                cssClass: 'youtube-square',
                                name: 'youtube',
                                href: null,
                                selected: true
                            }
                        ]);

                        expect(SelfieWebsiteScrapingDialogService.model.loading).toBe(false);
                    });
                });

                describe('when the passed in promise rejects', function() {
                    it('should show an error', function() {
                        $rootScope.$apply(function() {
                            deferred.reject('error');
                        });

                        expect(SelfieWebsiteScrapingDialogService.model.loading).toBe(false);
                        expect(SelfieWebsiteScrapingDialogService.model.error).toBe(true);
                    });
                });
            });

            describe('success()', function() {
                var success, failure, data, deferred;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    data = {};
                    deferred = $q.defer();

                    SelfieWebsiteScrapingDialogService.display(deferred.promise).then(success, failure);
                    SelfieWebsiteScrapingDialogService.success(data);

                    $rootScope.$digest();
                });

                it('should reset model', function() {
                    expect(SelfieWebsiteScrapingDialogService.model.show).toBe(false);
                    expect(SelfieWebsiteScrapingDialogService.model.loading).toBe(false);
                    expect(SelfieWebsiteScrapingDialogService.model.error).toBe(false);
                    expect(SelfieWebsiteScrapingDialogService.model.links).toBe(null);
                    expect(SelfieWebsiteScrapingDialogService.model.logo).toBe(null);
                });

                it('should resolve the promise returned by display()', function() {
                    expect(success).toHaveBeenCalledWith(data);
                    expect(failure).not.toHaveBeenCalled();
                });
            });

            describe('failure()', function() {
                var success, failure, deferred;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    deferred = $q.defer();

                    SelfieWebsiteScrapingDialogService.display(deferred.promise).then(success, failure);
                    SelfieWebsiteScrapingDialogService.failure();

                    $rootScope.$digest();
                });

                it('should reset model', function() {
                    expect(SelfieWebsiteScrapingDialogService.model.show).toBe(false);
                    expect(SelfieWebsiteScrapingDialogService.model.loading).toBe(false);
                    expect(SelfieWebsiteScrapingDialogService.model.error).toBe(false);
                    expect(SelfieWebsiteScrapingDialogService.model.links).toBe(null);
                    expect(SelfieWebsiteScrapingDialogService.model.logo).toBe(null);
                });

                it('should resolve the promise returned by display()', function() {
                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalled();
                });
            });
        });
    });
}());
