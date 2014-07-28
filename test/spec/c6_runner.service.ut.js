(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('c6Runner', function() {
            var c6Runner,
                $timeout;

            var timers;

            beforeEach(function() {
                timers = [];

                module('ng', function($provide) {
                    $provide.decorator('$timeout', function($delegate) {
                        var $timeout = jasmine.createSpy('$timeout()')
                            .and.callFake(function() {
                                var timer = $delegate.apply(null, arguments);

                                timers.unshift(timer);

                                return timer;
                            });

                        $timeout.cancel = jasmine.createSpy('$timeout.cancel()')
                            .and.callFake($delegate.cancel);
                        $timeout.flush = $delegate.flush;

                        return $timeout;
                    });
                });

                module(appModule.name);

                inject(function($injector) {
                    c6Runner = $injector.get('c6Runner');
                    $timeout = $injector.get('$timeout');
                });
            });

            it('should exist', function() {
                expect(c6Runner).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('runOnce(fn, waitTime)', function() {
                    it('should only run the provided function once after the timeout', function() {
                        var fn = jasmine.createSpy('fn()'),
                            onceFn = c6Runner.runOnce(fn, 20);

                        onceFn();
                        expect($timeout).toHaveBeenCalledWith(fn, 20);
                        $timeout.calls.reset();

                        onceFn();
                        expect($timeout.cancel).toHaveBeenCalledWith(timers[1]);
                        expect($timeout).toHaveBeenCalledWith(fn, 20);
                        $timeout.calls.reset();

                        onceFn();
                        expect($timeout.cancel).toHaveBeenCalledWith(timers[1]);
                        expect($timeout).toHaveBeenCalledWith(fn, 20);
                        $timeout.calls.reset();

                        $timeout.flush();
                        expect(fn.calls.count()).toBe(1);

                        onceFn();
                        onceFn();
                        $timeout.flush();
                        expect(fn.calls.count()).toBe(2);
                    });
                });
            });
        });
    });
}());
