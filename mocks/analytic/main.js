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

    http.whenGET('/api/analytics/campaigns', function(request) {
        var allStats = grunt.file.expand(path.resolve(__dirname, './analytics/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            })
            .filter(function(stat) {
                var ids = request.query.ids,
                    idArray = (ids || '').split(','),
                    id = stat.campaignId;

                return idArray.indexOf(id) > -1;
            });

        this.respond(200, allStats);
    });

    http.whenGET('/api/analytics/campaigns/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('analytics', id),
            stats = grunt.file.exists(filePath) ? grunt.file.readJSON(filePath) : null;

        if (stats) {
            this.respond(200, stats);
        } else {
            this.respond(404, 'NOT FOUND');
        }
    });

};
