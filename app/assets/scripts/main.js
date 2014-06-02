(function(){
    /*jshint -W080 */
    'use strict';

    var c6 = window.c6,
        appScripts, libScripts;

    function libUrl(url) {
        return '//lib.cinema6.com/' + url;
    }

    c6.kLocal = (c6.kBaseUrl === 'assets');
    c6.kHasKarma = false;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = (c6.kDebug) ? ['error','warn','log','info'] : [];
    c6.kModDeps = ['c6.mrmaker.services', 'c6.ui', 'c6.state', 'c6.log', 'c6.drag', 'ngAnimate'];
    c6.kExpUrl = '/apps';
    c6.kCollateralUrl = c6.kLocal ?
        'http://staging.cinema6.com/collateral' :
        '/collateral';
    c6.kTracker  = {
        accountId : 'UA-44457821-1',
        config    : (c6.kLocal) ? { 'cookieDomain' : 'none' } : 'auto'
    };

    appScripts = c6.kLocal ? [
        'scripts/app',
        'scripts/services',
        'scripts/manager',
        'scripts/players',
        'scripts/editor',
        'scripts/c6_state',
        'scripts/c6_drag',
        'scripts/card_table',
        'scripts/tracker'
    ] :
    [
        'scripts/c6app.min'
    ];

    libScripts = c6.kLocal ? [
        '//www.youtube.com/iframe_api',
        libUrl('modernizr/modernizr.custom.71747.js'),
        libUrl('jquery/2.0.3-0-gf576d00/jquery.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min.js'),
        libUrl('cryptojs/v3.1.2/sha1.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular-animate.js'),
        libUrl('c6ui/v2.6.4-0-g0df471c/c6uilib.js'),
        libUrl('c6ui/v2.6.4-0-g0df471c/c6log.js')
    ] :
    [
        '//www.youtube.com/iframe_api',
        libUrl('modernizr/modernizr.custom.71747.js'),
        libUrl('jquery/2.0.3-0-gf576d00/jquery.min.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TweenMax.min.js'),
        libUrl('gsap/1.11.2-0-g79f8c87/TimelineMax.min.js'),
        libUrl('cryptojs/v3.1.2/sha1.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular.min.js'),
        libUrl('angular/v1.2.14-0-g729fb13/angular-animate.min.js'),
        libUrl('c6ui/v2.6.4-0-g0df471c/c6uilib.min.js'),
        libUrl('c6ui/v2.6.4-0-g0df471c/c6log.min.js')
    ];

    function loadScriptsInOrder(scriptsList, done) {
        var script;

        if (scriptsList) {
            script = scriptsList.shift();

            if (script) {
                require([script], function() {
                    loadScriptsInOrder(scriptsList, done);
                });
                return;
            }
        }
        done();
    }

    require.config({
        baseUrl:  c6.kBaseUrl,
        paths: {
            hammer: c6.kLocal ?
                libUrl('hammer.js/1.0.9-0-g308cb9a/hammer') :
                libUrl('hammer.js/1.0.9-0-g308cb9a/hammer.min')
        }
    });

    loadScriptsInOrder(libScripts, function() {
        var Modernizr = window.Modernizr;

        Modernizr.load({
            test: Modernizr.touch,
            yep: [
                c6.kLocal ?
                    libUrl('angular/v1.2.14-0-g729fb13/angular-touch.js') :
                    libUrl('angular/v1.2.14-0-g729fb13/angular-touch.min.js')
            ],
            complete: function() {
                if (Modernizr.touch) { c6.kModDeps.push('ngTouch'); }

                loadScriptsInOrder(appScripts, function() {
                    angular.bootstrap(document.documentElement, ['c6.mrmaker']);
                });
            }
        });
    });
}());
