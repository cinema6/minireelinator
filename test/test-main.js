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
                angular: libUrl('angular/v1.2.14-0-g729fb13/angular'),
                angularMocks: libUrl('angular/v1.2.14-0-g729fb13/angular-mocks'),
                jquery: libUrl('jquery/2.0.3-0-gf576d00/jquery'),
                modernizr: libUrl('modernizr/modernizr.custom.71747'),
                tweenmax: libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min'),
                timelinemax: libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min'),
                c6ui: libUrl('c6ui/v2.6.4-0-g0df471c/c6uilib'),
                c6log: libUrl('c6ui/v2.6.4-0-g0df471c/c6log'),
                sha1: libUrl('cryptojs/v3.1.2/sha1'),
                hammer: libUrl('hammer.js/1.0.9-0-g308cb9a/hammer'),
                templates: '/base/.tmp/templates',
                'helpers/drag': '/base/test/helpers/drag'
            },

            shim: {
                angular: {
                    deps: ['jquery']
                },
                angularMocks: {
                    deps: ['angular']
                },
                timelinemax: {
                    deps: ['tweenmax']
                },
                uirouter: {
                    deps: ['angular']
                },
                c6ui: {
                    deps: ['angular']
                },
                c6log: {
                    deps: ['c6ui']
                },
                templates: {
                    deps: ['app']
                },
                app: {
                    deps: ['angular', 'angularMocks', 'modernizr', 'timelinemax', 'c6ui', 'c6_state', 'c6log', 'sha1', 'hammer']
                },
                services: {
                    deps: ['app']
                },
                c6_state: {
                    deps: ['angularMocks']
                },
                c6_drag: {
                    deps: ['angular', 'angularMocks', 'hammer']
                },
                manager: {
                    deps: ['app']
                },
                editor: {
                    deps: ['app']
                },
                players: {
                    deps: ['app']
                },
                card_table: {
                    deps: ['app', 'c6_drag']
                }
            },

            priority: [
                'angular'
            ],

            deps: tests,

            callback: $window.__karma__.start
        });
    };
}(window));
