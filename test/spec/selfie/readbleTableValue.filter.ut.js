describe('readableTableKey', function() {
    'use strict';
    var readableTableValue;

    beforeEach(function() {
        module('c6.app.selfie.directives');
        inject(function($injector) {
            readableTableValue = $injector.get('$filter')('readableTableValue');
        });
    });

    afterAll(function() {
        readableTableValue = null;
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

    it('should make an array of interest objects readable', function() {
        var input = [
            { type: 'interest', label: 'cat-123', externalId: 'IAB-1' },
            { type: 'interest', label: 'cat-456', externalId: 'IAB-2' },
            { type: 'interest', label: 'cat-789', externalId: 'IAB-3' }
        ];
        var expectedOutput = '(cat-123, IAB-1), (cat-456, IAB-2), (cat-789, IAB-3)';
        expect(readableTableValue(input)).toBe(expectedOutput);
    });
});
