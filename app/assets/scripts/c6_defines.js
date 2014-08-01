define(function() {
    'use strict';

    var c6 = window.c6 = {};

    c6.kLocal = !!window.DEBUG;
    c6.kDebug = c6.kLocal || window.location.hostname === 'staging.cinema6.com';
    c6.kHasKarma = false;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = c6.kDebug ? ['error','warn','log','info'] : [];
    c6.kTracker  = {
        accountId : 'UA-44457821-1',
        config    : (c6.kLocal) ? { 'cookieDomain' : 'none' } : 'auto'
    };
    c6.kApiUrl = '/api';
    c6.kYouTubeDataApiKey = window.YouTubeApiKey || 'AIzaSyCmHsFIiXhjAuHM_piTxSHPsQgvZwueLlk';

    return c6;
});
