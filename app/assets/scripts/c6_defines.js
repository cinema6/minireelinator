define(function() {
    'use strict';

    var c6 = window.c6 = {};
    var hostname = window.location.hostname;
    var protocol = window.location.protocol;

    c6.kLocal = !!window.DEBUG;
    c6.kSelfie = !!window.SELFIE || (/platform/).test(hostname);
    c6.kDebug = c6.kLocal || (/staging/).test(hostname);
    c6.kPortalHome = c6.kDebug ?
        'https://staging.cinema6.com/' : 'https://portal.cinema6.com/';
    c6.kHasKarma = false;
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels = c6.kDebug ? ['error','warn','log','info'] : [];
    c6.kTracker  = {
        accountId : 'UA-44457821-1',
        config    : (c6.kLocal) ? { 'cookieDomain' : 'none' } : 'auto'
    };
    c6.kApiUrl = '/api';
    c6.kYouTubeDataApiKey = window.YouTubeApiKey || 'AIzaSyCmHsFIiXhjAuHM_piTxSHPsQgvZwueLlk';
    c6.kFlickrDataApiKey = window.FlickrApiKey || 'c60c2b10ac89da96a09fe02811db0ea6';
    c6.kInstagramDataApiKey = window.InstagramApiKey || 'f5e4125b62b946879b7dbdd38aeef55c';
    c6.embeds = [];

    if (c6.kDebug) {
        // This URL must include the page's protocol to work in Firefox
        window.__C6_URL_ROOT__ = protocol + '//' + (c6.kLocal ? 'staging.cinema6.com' : hostname);
    }

    return c6;
});
