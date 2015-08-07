(function(){
    /* global requirejs */
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            async: 'lib/async',
            jquery: 'https://lib.cinema6.com/jquery/2.0.3-0-gf576d00/jquery.min',
            hammer: 'https://lib.cinema6.com/hammer.js/1.1.3-0-gc6a0b6f/hammer.min',
            modernizr: 'https://lib.cinema6.com/modernizr/modernizr.custom.71747',
            youtube: 'lib/youtube',
            cryptojs: 'https://lib.cinema6.com/cryptojs/v3.1.2/sha1',
            angular: 'https://lib.cinema6.com/angular/v1.2.22-0-g93b0c2d/angular.min',
            ngAnimate: 'https://lib.cinema6.com/angular/v1.2.22-0-g93b0c2d/angular-animate.min',
            c6uilib: 'https://lib.cinema6.com/c6ui/v3.7.3-0-g68ed6ac/c6uilib.min',
            c6log: 'https://lib.cinema6.com/c6ui/v3.7.3-0-g68ed6ac/c6log.min',
            c6embed: 'https://lib.cinema6.com/c6embed/v1/app--v2.35.4-0-gdff0ea8.min'
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
            c6embed: {
                deps: ['c6_defines'],
                init: function(c6Defines) {
                    /* jshint camelcase:false */
                    window.__c6_ga__ = function() {};
                    return c6Defines;
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
