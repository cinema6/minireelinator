(function() {
    'use strict';

    var orig,
        methods = [
            'addClass',
            'after',
            'append',
            'attr',
            'css',
            'empty',
            'html',
            'prepend',
            'remove',
            'removeAttr',
            'removeClass'
        ];

    beforeEach(function() {
        orig = {};

        methods.forEach(function(method) {
            orig[method] = $.fn[method];
        });
    });

    afterEach(function() {
        methods.forEach(function(method) {
            $.fn[method] = orig[method];
        });
    });
}());
