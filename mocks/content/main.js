module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path'),
        Q = require('q');

    var genId = require('../../tasks/resources/helpers').genId,
        fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend,
        pluck = fn.pluck,
        pluckExcept = fn.pluckExcept,
        withDefaults = fn.withDefaults,
        mapObject = fn.mapObject;

    function objectPath(type, id) {
        return path.resolve(__dirname, './' + type + '/' + id + '.json');
    }

    /***********************************************************************************************
     * Experience Endpoints
     **********************************************************************************************/

    http.whenGET('/api/content/experience/**', function(request) {
        var id = idFromPath(request.pathname),
            experience = grunt.file.readJSON(objectPath('experiences', id));

        if (experience) {
            this.respond(200, extend(experience, { id: id }));
        } else {
            this.respond(404, 'Not found');
        }
    });

    http.whenGET('/api/content/experiences', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text', 'sponsored']),
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
                })
                .filter(function(experience) {
                    var text = request.query.text || experience.data.title;

                    return experience.data.title.toLowerCase().indexOf(text.toLowerCase()) > -1;
                })
                .filter(function(experience) {
                    return !('sponsored' in request.query) ||
                        ('campaignId' in experience).toString() === request.query.sponsored;
                }),
            experiences = allExperiences
                .filter(function(experience, index) {
                    var startIndex = page.skip,
                        endIndex = startIndex + page.limit;

                    return index >= startIndex && index <= endIndex;
                })
                .sort(function(a, b) {
                    var prop = sort && sort[0],
                        directionInt = parseInt(sort && sort[1]),
                        isDate = ['lastUpdated', 'created', 'lastPublished'].indexOf(prop) > -1,
                        aProp, bProp;

                    if (!sort) {
                        return 0;
                    }

                    aProp = isDate ? new Date(a[prop]) : a[prop];
                    bProp = isDate ? new Date(b[prop]) : b[prop];

                    if (aProp < bProp) {
                        return directionInt * -1;
                    } else if (bProp < aProp) {
                        return directionInt;
                    }

                    return 0;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, experiences.length),
            savedData = {
                experiences: experiences,
                startPosition: startPosition,
                endPosition: endPosition,
                total: allExperiences.length
            };

        grunt.file.write(objectPath('job', 'asdf1234'), JSON.stringify(savedData, null, '    '));

        this.respond(202, {url: '/api/content/job/asdf1234'});
    });

    http.whenGET('/api/content/job/asdf1234', function(request) {
        var savedData = grunt.file.readJSON(objectPath('job', 'asdf1234')),
            contentRange = savedData.startPosition + '-' +
                savedData.endPosition + '/' +
                savedData.total;

        this.respond(200, savedData.experiences)
            .setHeaders({
                'Content-Range': contentRange
            });
    });

    http.whenPUT('/api/content/experience/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('experiences', id),
            current = grunt.file.readJSON(filePath),
            newExperience = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(newExperience, null, '    '));

        this.respond(200, Q.when(extend(newExperience, {
            id: id
        })).delay(500));
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

        grunt.file.write(objectPath('experiences', id), JSON.stringify(experience, null, '    '));

        this.respond(201, Q.when(extend(experience, { id: id })).delay(520));
    });

    http.whenDELETE('/api/content/experience/**', function(request) {
        grunt.file.delete(objectPath('experiences', idFromPath(request.pathname)));

        this.respond(204, '');
    });

    /***********************************************************************************************
     * Card Endpoints
     **********************************************************************************************/

    http.whenGET('/api/content/cards', function(request) {
        this.respond(200, grunt.file.expand(path.resolve(__dirname, './cards/*.json'))
            .map(function(path) {
                var id = path.match(/[^\/]+(?=\.json)/)[0];

                return extend(grunt.file.readJSON(path), { id: id });
            }).filter(function(card) {
                return Object.keys(request.query)
                    .every(function(key) {
                        return request.query[key] === card[key];
                    });
            }));
    });

    http.whenGET('/api/content/card/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('cards', id),
            card = grunt.file.exists(filePath) ? grunt.file.readJSON(filePath) : null;

        if (card) {
            this.respond(200, extend(card, { id: id }));
        } else {
            this.respond(404, 'NOT FOUND');
        }
    });

    http.whenPOST('/api/content/card', function(request) {
        var id = genId('rc'),
            user = require('../auth/user_cache').user,
            currentTime = (new Date()).toISOString(),
            card = extend(request.body, {
                created: currentTime,
                user: user.id,
                org: user.org,
                lastUpdated: currentTime
            });

        grunt.file.write(objectPath('cards', id), JSON.stringify(card, null, '    '));

        this.respond(201, extend(card, { id: id }));
    });

    http.whenPUT('/api/content/card/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('cards', id),
            current = grunt.file.readJSON(filePath),
            card = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(card, null, '    '));

        this.respond(200, extend(card, {
            id: id
        }));
    });

    http.whenDELETE('/api/content/card/**', function(request) {
        grunt.file.delete(objectPath('cards', idFromPath(request.pathname)));

        this.respond(204, '');
    });

    /***********************************************************************************************
     * Category Endpoints
     **********************************************************************************************/

    http.whenGET('/api/content/categories', function(request) {
        var filters = pluckExcept(request.query, ['sort']);
        var sort = (request.query.sort || null) && request.query.sort.split(',');

        this.respond(200, grunt.file.expand(path.resolve(__dirname, './categories/*.json'))
            .map(function(path) {
                var id = path.match(/[^\/]+(?=\.json)/)[0];

                return extend(grunt.file.readJSON(path), { id: id });
            }).filter(function(category) {
                return Object.keys(filters)
                    .every(function(key) {
                        return filters[key] === category[key];
                    });
            }).sort(function(a, b) {
                var prop, directionInt,
                    aProp, bProp;

                if (!sort) { return 0; }

                prop = sort[0];
                directionInt = parseInt(sort[1]);
                aProp = a[prop];
                bProp = b[prop];

                if (aProp < bProp) {
                    return directionInt * -1;
                } else if (bProp < aProp) {
                    return directionInt;
                }

                return 0;
            }));
    });
};
