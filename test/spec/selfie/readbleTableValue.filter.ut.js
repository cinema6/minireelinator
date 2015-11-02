describe('readableTableKey', function() {
    'use strict';
    var readableTableValue;

    beforeEach(function() {
        module('c6.app.selfie.directives');
        inject(function($injector) {
            readableTableValue = $injector.get('$filter')('readableTableValue');
        });
    });

    it('should make table values readable', function() {
        var input = [
            null,
            [],
            [1,2,3],
            'u-12345',
            'value'
        ];
        var expectedOutput = [
            '',
            '',
            '1, 2, 3',
            'u-12345',
            'value'
        ];
        input.forEach(function(key, index) {
            expect(readableTableValue(key)).toBe(expectedOutput[index]);
        });
    });

    it('should make dates readable', function() {
        expect(readableTableValue('1995-06-27T00:00:00.000Z')).toMatch(/Jun (26|27), 1995 .+/);
    });
});
