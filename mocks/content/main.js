module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var genId = require('../../tasks/resources/helpers').genId,
        fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend,
        pluck = fn.pluck,
        pluckExcept = fn.pluckExcept,
        withDefaults = fn.withDefaults,
        mapObject = fn.mapObject;

    function experiencePath(id) {
        return path.resolve(__dirname, './experiences/' + id + '.json');
    }

    http.whenGET('/api/content/experience/**', function(request) {
        var id = idFromPath(request.pathname),
            experience = grunt.file.readJSON(experiencePath(id));

        if (experience) {
            this.respond(200, extend(experience, { id: id }));
        } else {
            this.respond(404, 'Not found');
        }
    });

    http.whenGET('/api/content/experiences', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allExperiences = grunt.file.expand(path.resolve(__dirname, './experiences/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(experience) {
                    return Object.keys(filters)
                        .every(function(key) {
                            return filters[key] === experience[key];
                        });
                }),
            experiences = allExperiences
                .filter(function(experience, index) {
                    var startIndex = page.skip,
                        endIndex = startIndex + page.limit;

                    return index >= startIndex && index <= endIndex;
                })
                .sort(function(a, b) {
                    var prop = sort[0],
                        directionInt = parseInt(sort[1]),
                        isDate = ['lastUpdated', 'created', 'lastPublished'].indexOf(sort[0]) > -1,
                        aProp = isDate ? new Date(a[prop]) : a[prop],
                        bProp = isDate ? new Date(b[prop]) : b[prop];

                    if (!sort) {
                        return 0;
                    }

                    if (aProp < bProp) {
                        return directionInt * -1;
                    } else if (bProp < aProp) {
                        return directionInt;
                    }

                    return 0;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, experiences.length);

        this.respond(200, experiences)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allExperiences.length
            });
    });

    http.whenPUT('/api/content/experience/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = experiencePath(id),
            current = grunt.file.readJSON(filePath),
            newExperience = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(newExperience, null, '    '));

        this.respond(200, extend(newExperience, {
            id: id
        }));
    });

    http.whenPOST('/api/content/experience', function(request) {
        var id = genId('e'),
            user = require('../auth/user_cache').user,
            currentTime = (new Date()).toISOString(),
            experience = extend(request.body, {
                created: currentTime,
                user: user.id,
                org: user.org,
                lastUpdated: currentTime
            });

        grunt.file.write(experiencePath(id), JSON.stringify(experience, null, '    '));

        this.respond(201, extend(experience, { id: id }));
    });

    http.whenDELETE('/api/content/experience/**', function(request) {
        grunt.file.delete(experiencePath(idFromPath(request.pathname)));

        this.respond(204, '');
    });
};
