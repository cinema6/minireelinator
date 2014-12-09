module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        extend = fn.extend;

    http.whenGET('/api/expgroups', function(request) {
        this.respond(200, grunt.file.expand(path.resolve(__dirname, './expgroups/*.json'))
            .map(function(path) {
                var id = path.match(/[^\/]+(?=\.json)/)[0];

                return extend(grunt.file.readJSON(path), { id: id });
            }).filter(function(expGroup) {
                return Object.keys(request.query)
                    .every(function(key) {
                        return request.query[key] === expGroup[key];
                    });
            }));
    });
};
