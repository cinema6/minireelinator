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

    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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

        if (request.query.startDate || request.query.endDate) {
            allStats.forEach(function(stat) {
                stat.range = {
                    startDate: request.query.startDate || null,
                    endDate: request.query.endDate || null,
                    impressions: randomNum(400, 500),
                    views: randomNum(300, 400),
                    quartile1: randomNum(250, 300),
                    quartile2: randomNum(200, 250),
                    quartile3: randomNum(150, 200),
                    quartile4: randomNum(50, 150),
                    totalSpend: randomNum(60, 100) + 0.4200,
                    linkClicks: {
                        facebook: randomNum(2, 30),
                        instagram: randomNum(2, 50),
                        website: randomNum(2, 20),
                        youtube: randomNum(2, 20),
                        vimeo: randomNum(2, 20),
                        pinterest: randomNum(2, 20),
                        twitter: randomNum(2, 20),
                        action: randomNum(2, 20)
                    },
                    shareClicks: {
                        facebook: randomNum(2, 30),
                        pinterest: randomNum(2, 30)
                    }
                }
            });
        }

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
