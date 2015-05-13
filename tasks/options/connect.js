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
                    port: 80,
                    https: false,
                    host: 'staging.cinema6.com',
                    headers: {
                        origin : 'http://staging.cinema6.com',
                        host: 'staging.cinema6.com'
                    }
                },
                {
                    context: '/collateral',
                    port: 80,
                    https: false,
                    host: 'staging.cinema6.com',
                    headers: {
                        origin : 'http://staging.cinema6.com',
                        host: 'staging.cinema6.com'
                    }
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
                            '/api/election': 'mocks/vote/main.js',
                            '/api/campaign': 'mocks/campaign/main.js',
                            '/api/expgroup': 'mocks/expgroup/main.js'
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
