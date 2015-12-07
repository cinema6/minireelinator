describe('readableTableKey', function() {
    'use strict';
    var readableTableKey;

    beforeEach(function() {
        module('c6.app.selfie.directives');
        inject(function($injector) {
            readableTableKey = $injector.get('$filter')('readableTableKey');
        });
    });

    it('should make table keys readable', function() {
        var input = [
            'Card.data.videoid',
            'Card.id',
            'Card.campaign.id',
            'Campaign.card.params.action',
            'Campaign.card.foo.bar',
            'Card.campaign.startDate',
            'Card.campaign.endDate'
        ];
        var expectedOutput = [
            'Card Data: Video ID',
            'Card ID',
            'Card Campaign: ID',
            'Campaign Card Params: Call-To-Action',
            'Campaign Card Foo Bar',
            'Card Campaign: Start Date',
            'Card Campaign: End Date'
        ];
        input.forEach(function(key, index) {
            expect(readableTableKey(key)).toBe(expectedOutput[index]);
        });
    });
});
