module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        pluckExcept = fn.pluckExcept,
        idFromPath = db.idFromPath,
        extend = fn.extend,
        genId = require('../../tasks/resources/helpers').genId;

    function objectPath(type, id) {
        return path.resolve(__dirname, './' + type + '/' + id + '.json');
    }

    http.whenGET('/api/containers/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('containers', id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenGET('/api/containers', function(request) {
        var allContainers = grunt.file.expand(path.resolve(__dirname, './containers/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(container) {
                    var ids = request.query.ids,
                        idArray = (ids || '').split(','),
                        id = container.id;

                    return !ids || idArray.indexOf(id) > -1;
                })
                .map(function(container) {
                    var fields = request.query.fields,
                        fieldsArray = (fields || '').split(',');

                    if (!fields) { return container; }

                    for (var key in container) {
                        if (fieldsArray.indexOf(key) === -1 && key !== 'id') {
                            delete container[key];
                        }
                    }

                    return container;
                });

        try {
            this.respond(200, allContainers);
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenPUT('/api/containers/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('containers', id),
            current = grunt.file.readJSON(filePath),
            updated = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(updated, null, '    '));

        this.respond(200, extend(updated, {id: id}));
    });

    http.whenPOST('/api/containers', function(request) {
        var id = genId('con'),
            currentTime = (new Date()).toISOString(),
            container = extend(request.body, {
                created: currentTime,
                lastUpdated: currentTime,
                status: 'active'
            }),
            allContainers = grunt.file.expand(path.resolve(__dirname, './containers/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(con) {
                    return con.name === container.name;
                });

        if (!container.name || !!allContainers.length) {
            return this.respond(400, 'Container name is required');
        }

        container.defaultTagParams = container.defaultTagParams || {};
        container.defaultTagParams.vpaid = container.defaultTagParams.vpaid || {};
        container.defaultTagParams.mraid = container.defaultTagParams.mraid || {};
        container.defaultTagParams.vpaid.container = container.name;
        container.defaultTagParams.mraid.container = container.name;

        grunt.file.write(objectPath('containers', id), JSON.stringify(user, null, '    '));

        this.respond(201, extend(container, { id: id }));
    });
};
