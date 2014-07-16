(function($window){
    /* jshint camelcase:false */
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
        return (/\.(ut|it)\.js$/).test(file);
    }),
        packageRequest = new XMLHttpRequest(),
        c6 = $window.c6 = {};

    packageRequest.open('GET', '/base/settings.json');
    packageRequest.send();

    $window.ga = function() {};

    c6.kBaseUrl = 'assets';
    c6.kLocal = true;
    c6.kDebug = true;
    c6.kHasKarma = true;
    c6.kLogLevels = ['error','warn','log','info'];
    c6.kVideoUrls = {
        local: 'assets/media',
        cdn: 'http://foo.cinema6.com/media/app'
    };
    c6.kModDeps = ['c6.mrmaker.services', 'c6.ui', 'c6.state', 'c6.drag', 'c6.log'];
    c6.kCollateralUrl = '/collateral';

    packageRequest.onload = function(event) {
        var settings = JSON.parse(event.target.response),
            appDir = settings.appDir;

        function libUrl(url) {
            return 'http://s3.amazonaws.com/c6.dev/ext/' + url;
        }

        if (appDir.indexOf('<%') > -1) {
            $window.console.warn('PhantomJS can\'t interpolate Grunt templates. Using default.');
            appDir = 'app';
        }

        $window.requirejs({
            baseUrl: '/base/' + appDir + '/assets/scripts',

            paths: {
                async: 'lib/async',
                youtube: 'lib/youtube',
                jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery.min'),
                hammer: libUrl('hammer.js/1.0.9-0-g308cb9a/hammer.min'),
                modernizr: libUrl('modernizr/modernizr.custom.71747'),
                cryptojs: libUrl('cryptojs/v3.1.2/sha1'),
                angular: libUrl('angular/v1.2.14-0-g729fb13/angular'),
                ngMock: libUrl('angular/v1.2.14-0-g729fb13/angular-mocks'),
                ngAnimate: libUrl('angular/v1.2.14-0-g729fb13/angular-animate'),
                c6ui: libUrl('c6ui/v2.6.4-0-g0df471c/c6uilib.min'),
                c6log: libUrl('c6ui/v2.6.4-0-g0df471c/c6log.min'),
                templates: '/base/.tmp/templates',
                'helpers/drag': '/base/test/helpers/drag'
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
                ngMock: {
                    deps: ['angular'],
                    init: function(angular) {
                        return angular.module('ngMock');
                    }
                },
                c6ui: {
                    deps: ['angular'],
                    init: function(angular) {
                        return angular.module('c6.ui');
                    }
                },
                c6log: {
                    deps: ['angular'],
                    init: function(angular) {
                        return angular.module('c6.log');
                    }
                }
            }
        });

        require(['c6_defines','ngMock'], function(c6Defines) {
            c6Defines.kHasKarma = true;

            require(tests, $window.__karma__.start);
        });

    };
}(window));
