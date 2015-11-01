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
            '1995-06-27T00:00:00.000Z',
            'u-12345',
            'value'
        ];
        var expectedOutput = [
            '',
            '',
            '1, 2, 3',
            'Jun 26, 1995 8:00:00 PM',
            'u-12345',
            'value'
        ];
        input.forEach(function(key, index) {
            expect(readableTableValue(key)).toBe(expectedOutput[index]);
        });
    });
});
