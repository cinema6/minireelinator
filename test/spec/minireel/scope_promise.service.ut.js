define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('scopePromise(promise, initialValue)', function() {
        var scopePromise,
            $rootScope,
            $q;

        var deferred,
            promise,
            scopedPromise;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                scopePromise = $injector.get('scopePromise');
                $q = $injector.get('$q');
            });

            deferred = $q.defer(); promise = deferred.promise;

            scopedPromise = scopePromise(promise);
        });

        afterAll(function() {
            scopePromise = null;
            $rootScope = null;
            $q = null;
            deferred = null;
            promise = null;
            scopedPromise = null;
        });

        it('should exist', function() {
            expect(scopePromise).toEqual(jasmine.any(Function));
        });

        describe('the returned object', function() {
            describe('properties', function() {
                describe('promise', function() {
                    it('should be the provided promise', function() {
                        expect(scopedPromise.promise).toBe(promise);
                    });
                });

                describe('value', function() {
                    it('should be null', function() {
                        expect(scopedPromise.value).toBeNull();
                    });

                    describe('if a inital value is supplied', function() {
                        var inital;

                        beforeEach(function() {
                            inital = [];

                            scopedPromise = scopePromise(promise, inital);
                        });

                        it('should be the initial value', function() {
                            expect(scopedPromise.value).toBe(inital);
                        });
                    });
                });

                describe('error', function() {
                    it('should be null', function() {
                        expect(scopedPromise.error).toBeNull();
                    });
                });
            });

            describe('methods', function() {
                describe('ensureResolution()', function() {
                    var success, failure;

                    beforeEach(function() {
                        success = jasmine.createSpy('success()')
                            .and.callFake(function(scopedPromise) {
                                expect(scopedPromise.value).not.toBeNull();
                            });
                        failure = jasmine.createSpy('failure()')
                            .and.callFake(function(scopedPromise) {
                                expect(scopedPromise.error).not.toBeNull();
                            });

                        $rootScope.$apply(function() {
                            scopedPromise.ensureResolution().then(success, failure);
                        });
                    });

                    describe('if the promise is resolved', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                deferred.resolve({});
                            });
                        });

                        it('should resolve the promise with itself', function() {
                            expect(success).toHaveBeenCalledWith(scopedPromise);
                        });
                    });

                    describe('if the promise is rejected', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                deferred.reject({});
                            });
                        });

                        it('should reject the promise with itself', function() {
                            expect(failure).toHaveBeenCalledWith(scopedPromise);
                        });
                    });
                });
            });

            describe('when the promise is fulfilled', function() {
                var value;

                beforeEach(function() {
                    value = {};

                    $rootScope.$apply(function() {
                        deferred.resolve(value);
                    });
                });

                it('should set the value to the fulfillment value', function() {
                    expect(scopedPromise.value).toBe(value);
                });
            });

            describe('when the promise is rejected', function() {
                var reason;

                beforeEach(function() {
                    reason = new Error('Blah');

                    $rootScope.$apply(function() {
                        deferred.reject(reason);
                    });
                });

                it('should set the error to the rejection reason', function() {
                    expect(scopedPromise.error).toBe(reason);
                });
            });
        });
    });
});
