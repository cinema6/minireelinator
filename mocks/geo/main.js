module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        extend = fn.extend,
        db = require('../utils/db'),
        idFromPath = db.idFromPath;

    http.whenGET('/api/geo/zipcodes/**', function(request) {
        var zip = idFromPath(request.pathname),
            valid = /^\d{5}$/.test(zip),
            obj = {
                status: 'active',
                country: 'US',
                zipcode: zip,
                city: 'Princeton',
                stateName: 'New Jersey',
                stateCode: 'NJ',
                countyName: 'Mercer',
                countyCode: '123',
                loc: []
            };

        if (valid) {
            return this.respond(200, obj);
        } else {
            return this.respond(404, 'Not Found');
        }
    });

    http.whenGET('/api/geo/zipcodes', function(request) {
        var zips = request.query.zipcodes,
            zipsArray = (zips || '').split(','),
            resp = zipsArray.map(function(zip) {
                return {
                    status: 'active',
                    country: 'US',
                    zipcode: zip,
                    city: 'Princeton',
                    stateName: 'New Jersey',
                    stateCode: 'NJ',
                    countyName: 'Mercer',
                    countyCode: '123',
                    loc: []
                };
            });

        if (zips) {
            return this.respond(200, resp);
        } else {
            return this.respond(200, []);
        }
    });
};
