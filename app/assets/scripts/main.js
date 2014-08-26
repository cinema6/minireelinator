(function(){
    /* global requirejs */
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            async: 'lib/async',
            jquery: 'https://lib.cinema6.com/jquery/2.0.3-0-gf576d00/jquery.min',
            hammer: 'https://lib.cinema6.com/hammer.js/1.0.9-0-g308cb9a/hammer.min',
            modernizr: 'https://lib.cinema6.com/modernizr/modernizr.custom.71747',
            youtube: 'lib/youtube',
            cryptojs: 'https://lib.cinema6.com/cryptojs/v3.1.2/sha1',
            angular: 'https://lib.cinema6.com/angular/v1.2.22-0-g93b0c2d/angular.min',
            ngAnimate: 'https://lib.cinema6.com/angular/v1.2.22-0-g93b0c2d/angular-animate.min',
            c6ui: 'https://lib.cinema6.com/c6ui/v2.7.0-0-g63f769f/c6uilib.min',
            c6log: 'https://lib.cinema6.com/c6ui/v2.7.0-0-g63f769f/c6log.min'
        },
        shim: {
            modernizr: {
                exports: 'Modernizr'
            },
            cryptojs: {
                deps: ['https://lib.cinema6.com/cryptojs/v3.1.2/md5.js'],
                exports: 'CryptoJS'
            },
            angular: {
                deps: ['jquery'],
                exports: 'angular'
            },
            ngAnimate: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('ngAnimate');
                }
            },
            c6ui: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('c6.ui');
                }
            },
            c6log: {
                deps: ['angular','c6_defines'],
                init: function(angular) {
                    return angular.module('c6.log');
                }
            }
        }
    });

    define( ['angular','app'],
    function( angular , app ) {
        angular.bootstrap(document.documentElement, [app.name]);

        return true;
    });
}());
