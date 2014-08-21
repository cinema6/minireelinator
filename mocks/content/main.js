module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var genId = require('../../tasks/resources/helpers').genId;

    function extend() {
        return Array.prototype.slice.call(arguments)
            .reduce(function(extension, object) {
                return Object.keys(object)
                    .reduce(function(extension, key) {
                        extension[key] = object[key];

                        return extension;
                    }, extension);
            }, {});
    }

    function withDefaults(object, defaults) {
        return Object.keys(defaults).concat(Object.keys(object))
            .filter(function(key, index, keys) {
                return keys.indexOf(key) === index;
            })
            .reduce(function(result, key) {
                if (!object.hasOwnProperty(key)) {
                    result[key] = defaults[key];
                } else {
                    result[key] = object[key];
                }

                return result;
            }, {});
    }

    function pluckExcept(object, keys) {
        return Object.keys(object)
            .reduce(function(result, key) {
                if (keys.indexOf(key) < 0) {
                    result[key] = object[key];
                }

                return result;
            }, {});
    }

    function pluck(object, keys) {
        return Object.keys(object)
            .reduce(function(result, key) {
                if (keys.indexOf(key) > -1) {
                    result[key] = object[key];
                }

                return result;
            }, {});
    }

    function idFromPath(path) {
        return path.match(/[^\/]+$/)[0];
    }

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
            page = withDefaults(pluck(request.query, ['limit', 'skip']), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            experiences = grunt.file.expand(path.resolve(__dirname, './experiences/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(experience) {
                    return Object.keys(filters)
                        .every(function(key) {
                            return filters[key] === experience[key];
                        });
                })
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
                });

        this.respond(200, experiences);
    });

    http.whenPUT('/api/content/experience/**', function(request) {
        var filePath = experiencePath(idFromPath(request.pathname)),
            current = grunt.file.readJSON(filePath),
            newExperience = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(newExperience, null, '    '));

        this.respond(200, newExperience);
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
