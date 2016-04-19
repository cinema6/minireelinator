(function() {
    'use strict';

    var grunt = require('grunt'),
        selfieServer = /selfie/.test(grunt.cli.tasks[0]),
        verbosityOpt = grunt.option('verbosity'),
        verbosity = (verbosityOpt === undefined) ? Infinity : verbosityOpt;

    module.exports = {
        options: {
            hostname: '*',
            protocol: 'https'
        },
        app: {
            proxies: [
                {
                    context: '/api',
                    port: 443,
                    https: true,
                    host: 'platform-staging.reelcontent.com',
                    protocol: 'https:',
                    headers: {
                        origin : 'https://platform-staging.reelcontent.com',
                        host: 'platform-staging.reelcontent.com'
                    }
                },
                {
                    context: '/collateral',
                    port: 443,
                    https: true,
                    host: 'platform-staging.reelcontent.com',
                    protocol: 'https:',
                    headers: {
                        origin : 'https://platform-staging.reelcontent.com',
                        host: 'platform-staging.reelcontent.com'
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
                            '/api/geo': 'mocks/geo/main.js',
                            '/api/accounting':'mocks/payment/main.js',
                            '/api/account': 'mocks/account/main.js',
                            '/api/content': 'mocks/content/main.js',
                            '/api/election': 'mocks/vote/main.js',
                            '/api/campaign': 'mocks/campaign/main.js',
                            '/api/expgroup': 'mocks/expgroup/main.js',
                            '/api/payment': 'mocks/payment/main.js',
                            '/api/payments': 'mocks/payment/main.js',
                            '/api/transactions':'mocks/payment/main.js',
                            '/api/analytics':'mocks/analytic/main.js',
                            '/api/collateral':'mocks/collateral/main.js',
                            '/api/containers':'mocks/container/main.js',
                            '/api/placements':'mocks/placement/main.js',
                            '/api/promotions':'mocks/promotion/main.js',
                            '@verbosity': verbosity
                        }),
                        require('grunt-connect-proxy/lib/utils').proxyRequest,
                        require('connect-livereload')({
                            rules: [
                                {
                                    match: /<!--C6INJECT-->/,
                                    fn: function(match, snippet) {
                                        var script;

                                        if (selfieServer) {
                                            script = '(' + function(window) {
                                                window.DEBUG = true;
                                                window.SELFIE = true;
                                                window.YouTubeApiKey = 'AIzaSyAoR0-kvy_fIjYOKk0vMU6F2JIb1aCMd1g';
                                            }.toString() + '(window))';
                                        } else {
                                            script = '(' + function(window) {
                                                window.DEBUG = true;
                                                window.YouTubeApiKey = 'AIzaSyAoR0-kvy_fIjYOKk0vMU6F2JIb1aCMd1g';
                                                window.FlickrApiKey = 'c60c2b10ac89da96a09fe02811db0ea6';
                                            }.toString() + '(window))';
                                        }

                                        return [
                                            snippet,
                                            '<script>',
                                            script,
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
