(function() {
    'use strict';

    module.exports = {
        server: {
            url: 'https://localhost:<%= settings.sandboxPort %>/',
            app: '<%= personal.browser %>'
        }
    };
})();
