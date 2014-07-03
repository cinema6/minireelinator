(function(){
    /* global requirejs */
    'use strict';

    function libUrl(url) {
        return 'https://lib.cinema6.com/' + url;
    }

    var c6 = window.c6 = {};

    c6.kLogLevels = ['error','warn','log','info'];

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            async: 'lib/async',
            jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery.min'),
            hammer: libUrl('hammer.js/1.0.9-0-g308cb9a/hammer.min'),
            modernizr: libUrl('modernizr/modernizr.custom.71747'),
            youtube: 'lib/youtube',
            cryptojs: libUrl('cryptojs/v3.1.2/sha1'),
            angular: libUrl('angular/v1.2.14-0-g729fb13/angular.min'),
            ngAnimate: libUrl('angular/v1.2.14-0-g729fb13/angular-animate.min'),
            c6ui: libUrl('c6ui/v2.6.4-0-g0df471c/c6uilib.min'),
            c6log: libUrl('c6ui/v2.6.4-0-g0df471c/c6log.min')
        },
        shim: {
            modernizr: {
                exports: 'Modernizr'
            },
            cryptojs: {
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
