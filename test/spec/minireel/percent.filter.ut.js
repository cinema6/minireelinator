(function() {
    'use strict';

    define(['minireel/app'], function(minireelModule) {
        describe('percentFilter()', function() {
            var percentFilter;

            beforeEach(function() {
                module(minireelModule.name);

                inject(function($injector) {
                    percentFilter = $injector.get('percentFilter');
                });
            });

            it('should exist', function() {
                expect(percentFilter).toEqual(jasmine.any(Function));
            });

            it('should convert the number to a human-readable percent', function() {
                expect(percentFilter(1)).toBe('100%');
                expect(percentFilter(0.75)).toBe('75%');
                expect(percentFilter(0.34)).toBe('34%');
            });

            it('should return 0% if non-numbers are passed in', function() {
                expect(percentFilter(null)).toBe('0%');
                expect(percentFilter(undefined)).toBe('0%');
            });
        });
    });
}());
