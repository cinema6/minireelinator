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
                        require('http-mock')({
                            '/api/search': 'mocks/search/main.js',
                            '/api/auth': 'mocks/auth/main.js',
                            '/api/account': 'mocks/account/main.js',
                            '/api/content': 'mocks/content/main.js',
                            '/api/election': 'mocks/vote/main.js'
                        }),
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
                                                window.YouTubeApiKey = 'AIzaSyAoR0-kvy_fIjYOKk0vMU6F2JIb1aCMd1g';
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
