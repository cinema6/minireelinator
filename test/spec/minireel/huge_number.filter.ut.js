define(['minireel/app'], function(appModule) {
    'use strict';

    describe('hugeNumberFilter()', function() {
        var hugeNumberFilter;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                hugeNumberFilter = $injector.get('hugeNumberFilter');
            });
        });

        afterAll(function() {
            hugeNumberFilter = null;
        });

        it('should exist', function() {
            expect(hugeNumberFilter).toEqual(jasmine.any(Function));
        });

        describe('if passed a number less than 1,000', function() {
            it('should return that number', function() {
                expect(hugeNumberFilter(999)).toBe('999');
            });
        });

        describe('if passed a number >= 1,000', function() {
            it('should abreviate to x.xk', function() {
                expect(hugeNumberFilter(1000)).toBe('1k');
                expect(hugeNumberFilter(1250)).toBe('1.3k');
                expect(hugeNumberFilter(750110)).toBe('750.1k');
            });
        });

        describe('if passed a number >= 1,000,000', function() {
            it('should abreviate to 1m+', function() {
                expect(hugeNumberFilter(1000000)).toBe('1m+');
                expect(hugeNumberFilter(1000001)).toBe('1m+');
            });
        });
    });
});
