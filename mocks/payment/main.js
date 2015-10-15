module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path'),
        Q = require('q');

    var fn = require('../utils/fn'),
        pluckExcept = fn.pluckExcept,
        withDefaults = fn.withDefaults,
        mapObject = fn.mapObject,
        pluck = fn.pluck,
        extend = fn.extend,
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        genId = require('../../tasks/resources/helpers').genId;

    function objectPath(type, id) {
        return path.resolve(__dirname, './' + type + '/' + id + '.json');
    }

    http.whenGET('/api/payments/clientToken', function(request) {
        var token = 'eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJ'+
            'mZTA4YmFlODE2ZTY4NjhhOWRjNWQ5ZGI4YmY5YzNmMTczZDA2NjdlM2UzY2ZmOD'+
            'UzMjMzMmViYjIyZTRlOTNjfGNyZWF0ZWRfYXQ9MjAxNS0xMC0xNVQxOTozOTo1M'+
            'y4yOTAwMDA0MzYrMDAwMFx1MDAyNm1lcmNoYW50X2lkPXp0cnBoY2YyODNieGdu'+
            'MmZcdTAwMjZwdWJsaWNfa2V5PXJ6MnBodDdneW42ZDI2NmIiLCJjb25maWdVcmw'+
            'iOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My'+
            '9tZXJjaGFudHMvenRycGhjZjI4M2J4Z24yZi9jbGllbnRfYXBpL3YxL2NvbmZpZ'+
            '3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbImN2diIsInBvc3RhbF9jb2RlIl0sImVu'+
            'dmlyb25tZW50Ijoic2FuZGJveCIsImNsaWVudEFwaVVybCI6Imh0dHBzOi8vYXB'+
            'pLnNhbmRib3guYnJhaW50cmVlZ2F0ZXdheS5jb206NDQzL21lcmNoYW50cy96dH'+
            'JwaGNmMjgzYnhnbjJmL2NsaWVudF9hcGkiLCJhc3NldHNVcmwiOiJodHRwczovL'+
            '2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImF1dGhVcmwiOiJodHRwczov'+
            'L2F1dGgudmVubW8uc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbSIsImFuYWx'+
            '5dGljcyI6eyJ1cmwiOiJodHRwczovL2NsaWVudC1hbmFseXRpY3Muc2FuZGJveC'+
            '5icmFpbnRyZWVnYXRld2F5LmNvbSJ9LCJ0aHJlZURTZWN1cmVFbmFibGVkIjpmY'+
            'WxzZSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1l'+
            'IjoiQ2luZW1hNiIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDo'+
            'vL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leG'+
            'FtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50c'+
            'mVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBh'+
            'eXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJhbGxvd0h0dHAiOnRydWU'+
            'sImVudmlyb25tZW50Tm9OZXR3b3JrIjp0cnVlLCJlbnZpcm9ubWVudCI6Im9mZm'+
            'xpbmUiLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYnJhaW50cmVlQ2xpZW50S'+
            'WQiOiJtYXN0ZXJjbGllbnQzIiwiYmlsbGluZ0FncmVlbWVudHNFbmFibGVkIjpm'+
            'YWxzZSwibWVyY2hhbnRBY2NvdW50SWQiOiJjaW5lbWE2IiwiY3VycmVuY3lJc29'+
            'Db2RlIjoiVVNEIn0sImNvaW5iYXNlRW5hYmxlZCI6ZmFsc2UsIm1lcmNoYW50SW'+
            'QiOiJ6dHJwaGNmMjgzYnhnbjJmIiwidmVubW8iOiJvZmYifQ==';

        this.respond(200, { clientToken: token });
    });
};
