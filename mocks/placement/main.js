module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt'),
        Q = require('q');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        pluckExcept = fn.pluckExcept,
        idFromPath = db.idFromPath,
        extend = fn.extend,
        genId = require('../../tasks/resources/helpers').genId;

    function objectPath(type, id) {
        return path.resolve(__dirname, './' + type + '/' + id + '.json');
    }

    http.whenGET('/api/placements/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('placements', id);

        try {
            this.respond(200, Q.when(extend(grunt.file.readJSON(filePath), { id: id })).delay(1000));
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenGET('/api/placements', function(request) {
        var allPlacements = grunt.file.expand(path.resolve(__dirname, './placements/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(placement) {
                    var ids = request.query.ids,
                        idArray = (ids || '').split(','),
                        id = placement.id;

                    return !ids || idArray.indexOf(id) > -1;
                })
                .filter(function(placement) {
                    var user = request.query.user;

                    return !user || user === placement.user;
                })
                .filter(function(placement) {
                    var org = request.query.org;

                    return !org || org === placement.org;
                })
                .filter(function(placement) {
                    var container = request.query['tagParams.container'];

                    return !container || container === placement.tagParams.container;
                })
                .filter(function(placement) {
                    var experience = request.query['tagParams.experience'];

                    return !experience || experience === placement.tagParams.experience;
                })
                .filter(function(placement) {
                    var card = request.query['tagParams.card'];

                    return !card || card === placement.tagParams.card;
                })
                .filter(function(placement) {
                    var campaign = request.query['tagParams.campaign'];

                    return !campaign || campaign === placement.tagParams.campaign;
                })
                .map(function(placement) {
                    var fields = request.query.fields,
                        fieldsArray = (fields || '').split(',');

                    if (!fields) { return placement; }

                    for (var key in placement) {
                        if (fieldsArray.indexOf(key) === -1 && key !== 'id') {
                            delete placement[key];
                        }
                    }

                    return placement;
                });

        try {
            this.respond(200, Q.when(allPlacements).delay(1500));
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenPUT('/api/placements/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('placements', id),
            current = grunt.file.readJSON(filePath),
            updated = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        updated.defaultTagParams = updated.defaultTagParams || {};

        Object.keys(updated.defaultTagParams).forEach(function(key) {
            updated.defaultTagParams[key].placement = updated.name;
        });

        grunt.file.write(filePath, JSON.stringify(updated, null, '    '));

        this.respond(200, Q.when(extend(updated, {id: id})).delay(1500));
    });

    http.whenPOST('/api/placements', function(request) {
        var id = genId('pl'),
            userCache = require('../auth/user_cache'),
            currentTime = (new Date()).toISOString(),
            placement = extend(request.body, {
                created: currentTime,
                lastUpdated: currentTime,
                status: 'active',
                user: userCache.user.id,
                org: userCache.user.org
            });

        if (!placement.tagParams.container || !placement.tagParams.campaign) {
            return this.respond(400, 'placement name is required');
        }

        grunt.file.write(objectPath('placements', id), JSON.stringify(placement, null, '    '));

        this.respond(201, Q.when(extend(placement, { id: id })).delay(1500));
    });

    http.whenDELETE('/api/placements/**', function(request) {
        grunt.file.delete(objectPath('placements', idFromPath(request.pathname)));

        this.respond(204, Q.when('').delay(1000));
    });
};
