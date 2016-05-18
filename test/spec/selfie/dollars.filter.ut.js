define(['app'], function(appModule) {
    'use strict';

    describe('dollarsFilter()', function() {
        var dollarsFilter;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                dollarsFilter = $injector.get('dollarsFilter');
            });
        });

        afterAll(function() {
            dollarsFilter = null;
        });

        it('should exist', function() {
            expect(dollarsFilter).toEqual(jasmine.any(Function));
        });

        describe('if passed a number less than 0', function() {
            it('should return the absolute value with commas and a minus before the dollar sign and optional decimals', function() {
                expect(dollarsFilter(-555000)).toBe('-$555,000');
                expect(dollarsFilter(-3)).toBe('-$3');
                expect(dollarsFilter(-3.7466, 2)).toBe('-$3.75');
            });
        });

        describe('if passed a number greater than 0', function() {
            it('should return that number with commas and a dollar sign with optional decimals', function() {
                expect(dollarsFilter(555)).toBe('$555');
                expect(dollarsFilter(1000)).toBe('$1,000');
                expect(dollarsFilter(750110.1234, 2)).toBe('$750,110.12');
            });
        });

        describe('if passed 0', function() {
            it('should return $0 with optional decimals', function() {
                expect(dollarsFilter(0)).toBe('$0');
                expect(dollarsFilter(0.0000, 2)).toBe('$0.00');
            });
        });
    });
});
