(function($window){
    /* jshint camelcase:false */
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
        return (/\.(ut|it)\.js$/).test(file);
    }),
        templates = Object.keys(window.__karma__.files).filter(function(file) {
            return (/\.html\.js/).test(file);
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
                select2: 'lib/select2.min',
                jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery.min'),
                jqueryui: 'lib/jquery-ui.min',
                hammer: libUrl('hammer.js/1.1.3-0-gc6a0b6f/hammer.min'),
                modernizr: libUrl('modernizr/modernizr.custom.71747'),
                cryptojs: libUrl('cryptojs/v3.1.2/sha1'),
                angular: libUrl('angular/v1.2.22-0-g93b0c2d/angular'),
                ngMock: libUrl('angular/v1.2.22-0-g93b0c2d/angular-mocks'),
                ngAnimate: libUrl('angular/v1.2.22-0-g93b0c2d/angular-animate'),
                c6uilib: libUrl('c6ui/v3.7.4-0-g734d5f3/c6uilib'),
                c6log: libUrl('c6ui/v3.7.4-0-g734d5f3/c6log'),
                c6embed: libUrl('c6embed/v1/app'),
                braintree: 'lib/braintree',
                'helpers/drag': '/base/test/helpers/drag'
            },
            shim: {
                modernizr: {
                    exports: 'Modernizr'
                },
                cryptojs: {
                    deps: [libUrl('cryptojs/v3.1.2/md5.js')],
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
                c6embed: {
                    deps: ['c6_defines'],
                    init: function(c6Defines) {
                        return c6Defines;
                    }
                }
            }
        });

        require(['angular'], function() {
            require(['c6_defines','ngMock'].concat(templates), function(c6Defines) {
                c6Defines.kHasKarma = true;

                beforeEach(function() {
                    module(settings.appModule + '.testTemplates');
                });

                require(tests, $window.__karma__.start);
            });
        });
    };
}(window));
(function() {
    'use strict';

    var addEventListener = window.addEventListener;
    var listeners = [];

    beforeEach(function() {
        spyOn(window, 'addEventListener').and.callFake(function() {
            listeners.push(arguments);
            return addEventListener.apply(window, arguments);
        });
    });

    afterEach(function() {
        var args;

        while ((args = listeners.shift())) {
            window.removeEventListener.apply(window, args);
        }
    });
}());
