define(['minireel/app'], function(appModule) {
    'use strict';

    describe('timestampFilter()', function() {
        var timestampFilter;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                timestampFilter = $injector.get('timestampFilter');
            });
        });

        afterAll(function() {
            timestampFilter = null;
        });

        it('should exist', function() {
            expect(timestampFilter).toEqual(jasmine.any(Function));
        });

        it('should convert seconds to a human-readable timestamp', function() {
            expect(timestampFilter(60)).toBe('1:00');
            expect(timestampFilter(65)).toBe('1:05');
            expect(timestampFilter(70)).toBe('1:10');
            expect(timestampFilter(125)).toBe('2:05');
            expect(timestampFilter(31)).toBe('0:31');
            expect(timestampFilter(3725)).toBe('1:02:05');
        });
    });
});
