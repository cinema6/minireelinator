(function() {
    'use strict';

    module.exports = {
        server: {
            url: '<%= connect.options.protocol %>://localhost:<%= settings.sandboxPort %>/',
            app: '<%= personal.browser %>'
        }
    };
})();
