define(['app'], function(appModule) {
    'use strict';

    describe('absFilter()', function() {
        var absFilter;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                absFilter = $injector.get('absFilter');
            });
        });

        it('should exist', function() {
            expect(absFilter).toEqual(jasmine.any(Function));
        });

        afterAll(function() {
            absFilter = null;
        });

        describe('if passed a number less than 0', function() {
            it('should return the absolute value', function() {
                expect(absFilter(-555)).toBe(555);
                expect(absFilter(-3)).toBe(3);
            });
        });

        describe('if passed a number greater than 0', function() {
            it('should return that number', function() {
                expect(absFilter(555)).toBe(555);
                expect(absFilter(1000)).toBe(1000);
                expect(absFilter(750110)).toBe(750110);
            });
        });

        describe('if passed 0', function() {
            it('should return 0', function() {
                expect(absFilter(0)).toBe(0);
            });
        });
    });
});
