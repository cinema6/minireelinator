(function() {
    'use strict';

    module.exports = {
        options: {
            hostname: '*'
        },
        app: {
            proxies: [
                {
                    context: '/api',
                    host: '<%= personal.apiHost %>',
                    changeOrigin: true
                },
                {
                    context: '/collateral',
                    host: '<%= personal.apiHost %>',
                    changeOrigin: true
                }
            ],
            options: {
                port: '<%= settings.sandboxPort %>',
                middleware: function(connect) {
                    return [
                        require('grunt-connect-proxy/lib/utils').proxyRequest,
                        require('connect-livereload')({
                            rules: [
                                {
                                    match: /<!--C6INJECT-->/,
                                    fn: function(match, snippet) {
                                        return [
                                            snippet,
                                            '<script>',
                                            '(' + function(window) {
                                                window.DEBUG = true;
                                                window.YouTubeApiKey = 'AIzaSyBDBaBHNS3RIyB0iDzr-SC-I1G9LtRUjkM';
                                            }.toString() + '(window))',
                                            '</script>'
                                        ].join('\n');
                                    }
                                }
                            ]
                        }),
                        connect.static('app')
                    ];
                }
            }
        }
    };
})();
