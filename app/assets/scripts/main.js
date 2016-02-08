(function(){
    /* global requirejs */
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            async: 'lib/async',
            jquery: 'https://lib.reelcontent.com/jquery/2.0.3-0-gf576d00/jquery.min',
            jqueryui: 'lib/jquery-ui.min',
            hammer: 'https://lib.reelcontent.com/hammer.js/1.1.3-0-gc6a0b6f/hammer.min',
            modernizr: 'https://lib.reelcontent.com/modernizr/modernizr.custom.71747',
            youtube: 'lib/youtube',
            select2: 'lib/select2.min',
            cryptojs: 'https://lib.reelcontent.com/cryptojs/v3.1.2/sha1',
            angular: 'https://lib.reelcontent.com/angular/v1.2.22-0-g93b0c2d/angular.min',
            ngAnimate: 'https://lib.reelcontent.com/angular/v1.2.22-0-g93b0c2d/angular-animate.min',
            c6uilib: 'https://lib.reelcontent.com/c6ui/v3.7.4-0-g734d5f3/c6uilib.min',
            c6log: 'https://lib.reelcontent.com/c6ui/v3.7.4-0-g734d5f3/c6log.min',
            c6embed: 'https://lib.reelcontent.com/c6embed/v1/utils.min',
            metagetta: 'https://lib.reelcontent.com/metagetta/v0.2.0-0-g8b51280/metagetta.min',
            braintree: 'https://js.braintreegateway.com/v2/braintree',
            chartjs: [
                'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min',
                'lib/chartjs.min'
            ]
        },
        shim: {
            modernizr: {
                exports: 'Modernizr'
            },
            cryptojs: {
                deps: ['https://lib.reelcontent.com/cryptojs/v3.1.2/md5.js'],
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
