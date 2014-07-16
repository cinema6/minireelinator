(function() {
    'use strict';

    define(['c6_state'], function(c6StateModule) {
        describe('c6AsyncQueue()', function() {
            var $rootScope,
                $q,
                c6AsyncQueue;

            beforeEach(function() {
                module(c6StateModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    c6AsyncQueue = $injector.get('c6AsyncQueue');
                });
            });

            it('should exist', function() {
                expect(c6AsyncQueue).toEqual(jasmine.any(Function));
            });

            describe('Queue', function() {
                var queue;

                beforeEach(function() {
                    queue = c6AsyncQueue();
                });

                describe('wrap(fn)', function() {
                    var fn,
                        wrapped;

                    beforeEach(function() {
                        fn = function(a, b) {
                            return a + b;
                        };

                        wrapped = queue.wrap(fn);
                    });

                    it('should return a function', function() {
                        expect(wrapped).toEqual(jasmine.any(Function));
                        expect(wrapped).not.toBe(fn);
                    });

                    it('should delegate to the provided function', function() {
                        var success = jasmine.createSpy('success');

                        $rootScope.$apply(function() {
                            wrapped(2, 2).then(success);
                        });
                        expect(success).toHaveBeenCalledWith(4);
                        $rootScope.$apply(function() {
                            wrapped(1, 3).then(success);
                        });
                        expect(success).toHaveBeenCalledWith(4);
                        $rootScope.$apply(function() {
                            wrapped(4, 3).then(success);
                        });
                        expect(success).toHaveBeenCalledWith(7);
                        $rootScope.$apply(function() {
                            wrapped(10, 25).then(success);
                        });
                        expect(success).toHaveBeenCalledWith(35);
                    });

                    it('should allow setting the "this" object', function() {
                        var object = {},
                            success = jasmine.createSpy('success');

                        wrapped = queue.wrap(function() {
                            return this;
                        }, object);

                        $rootScope.$apply(function() {
                            wrapped().then(success);
                        });
                        expect(success).toHaveBeenCalledWith(object);
                    });

                    it('should only allow one function to be called at a time', function() {
                        var deferred1 = $q.defer(), deferred2 = $q.defer(), deferred3 = $q.defer(),
                            async1 = jasmine.createSpy('async1()')
                                .and.callFake(function() {
                                    return deferred1.promise;
                                }),
                            async2 = jasmine.createSpy('async2()')
                                .and.callFake(function() {
                                    return deferred2.promise;
                                }),
                            async3 = jasmine.createSpy('async3()')
                                .and.callFake(function() {
                                    return deferred3.promise;
                                }),
                            wrapped1, wrapped2, wrapped3;

                        wrapped1 = queue.wrap(async1); wrapped2 = queue.wrap(async2); wrapped3 = queue.wrap(async3);

                        $rootScope.$apply(wrapped1);
                        expect(async1).toHaveBeenCalled();
                        async1.calls.reset();

                        $rootScope.$apply(wrapped2);
                        expect(async2).not.toHaveBeenCalled();

                        $rootScope.$apply(wrapped3());
                        expect(async3).not.toHaveBeenCalled();

                        $rootScope.$apply(function() {
                            deferred1.resolve();
                        });
                        expect(async2).toHaveBeenCalled();

                        deferred1 = $q.defer();
                        $rootScope.$apply(wrapped1);
                        expect(async1).not.toHaveBeenCalled();

                        $rootScope.$apply(function() {
                            deferred2.resolve();
                        });
                        expect(async3).toHaveBeenCalled();
                        expect(async1).not.toHaveBeenCalled();

                        $rootScope.$apply(function() {
                            deferred3.reject();
                        });
                        expect(async1).toHaveBeenCalled();

                        $rootScope.$apply(function() {
                            deferred1.resolve();
                        });

                        $rootScope.$apply(wrapped3);
                        expect(async3).toHaveBeenCalled();

                        expect(queue.queue.length).toBe(0);
                    });
                });
            });
        });
    });
}());
