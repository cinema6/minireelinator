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

    /***********************************************************************************************
     * User Endpoints
     **********************************************************************************************/

    http.whenPUT('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('users', id),
            userCache = require('../auth/user_cache'),
            currentUser = grunt.file.readJSON(filePath),
            newUser = extend(currentUser, request.body, {
                lastUpdated: (new Date()).toISOString()
            }),
            isLoggedInUser = userCache.user.id === id,
            decorated = request.query.decorated,
            user = extend(
                newUser,
                { id: id },
                isLoggedInUser ? { email: userCache.user.email } : {}
            ),
            response = JSON.parse(JSON.stringify(user));;

        grunt.file.write(filePath, JSON.stringify(newUser, null, '    '));

        if (isLoggedInUser) {
            userCache.user = user;
        }

        if (!decorated) {
            delete response.permissions;
            delete response.entitlements;
        }

        this.respond(200, response);
    });

    http.whenGET('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('users', id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenGET('/api/account/users/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('users', id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenGET('/api/account/users', function(request) {
        var allUsers = grunt.file.expand(path.resolve(__dirname, './users/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(user) {
                    var ids = request.query.ids,
                        idArray = (ids || '').split(','),
                        id = user.id;

                    return !ids || idArray.indexOf(id) > -1;
                })
                .map(function(user) {
                    var fields = request.query.fields,
                        fieldsArray = (fields || '').split(',');

                    if (!fields) { return user; }

                    for (var key in user) {
                        if (fieldsArray.indexOf(key) === -1 && key !== 'id') {
                            delete user[key];
                        }
                    }

                    return user;
                });

        try {
            this.respond(200, allUsers);
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenPOST('/api/account/users/confirm/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('users', id),
            token = request.body.token,
            currentTime = (new Date()).toISOString(),
            user;

        if (token) {
            try {
                user = extend(grunt.file.readJSON(filePath), {
                    advertiser: "a-282824b8bb40a2",
                    created: currentTime,
                    lastUpdated: currentTime,
                    org: "o-a6fd7298acb6fa",
                    status: "active"
                });

                grunt.file.write(filePath, JSON.stringify(user, null, '    '));
                this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
            } catch(e) {
                this.respond(401, 'Not Authorized');
            }
        } else {
            this.respond(403, 'Forbidden');
        }
    });

    http.whenPOST('/api/account/users/resendActivation', function(request) {
        this.respond(204);
    });

    http.whenPOST('/api/account/users/signup', function(request) {
        var id = genId('u'),
            currentTime = (new Date()).toISOString(),
            user = extend(request.body, {
                applications: ["e-99263e70058290"],
                config: {},
                created: currentTime,
                lastUpdated: currentTime,
                status: 'new'
            });

        grunt.file.write(objectPath('users', id), JSON.stringify(user, null, '    '));

        this.respond(201, extend(user, { id: id }));
    });

    http.whenPOST('/api/account/user/email', function(request) {
        var body = request.body,
            email = body.email,
            password = body.password,
            newEmail = body.newEmail,
            userCache = require('../auth/user_cache');

        if (!email || !password || !newEmail) {
            this.respond(403, 'Forbidden');
        } else if (email !== 'selfie@cinema6.com') {
            this.respond(403, 'Not Authorized');
        } else {
            this.respond(201, userCache.user);
        }
    });

    http.whenPOST('/api/account/user/password', function(request) {
        var body = request.body,
            email = body.email,
            password = body.password,
            newPassword = body.newPassword,
            userCache = require('../auth/user_cache');

        if (!email || !password || !newPassword) {
            this.respond(403, 'Forbidden');
        } else if (email !== 'selfie@cinema6.com') {
            this.respond(401, 'Not Authorized');
        } else {
            this.respond(201, userCache.user);
        }
    });

    /***********************************************************************************************
     * Org Endpoints
     **********************************************************************************************/

    http.whenGET('/api/account/org/**', function(request) {
        var id = request.pathname.match(/[^\/]+$/)[0],
            org = grunt.file.readJSON(path.resolve(__dirname, './orgs/' + id + '.json'));

        org.id = id;

        if (org) {
            this.respond(200, org);
        } else {
            this.respond(404, 'Could not find org!');
        }
    });

    http.whenPUT('/api/account/org/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('orgs', id),
            current = grunt.file.readJSON(filePath),
            updatedOrg = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(updatedOrg, null, '    '));

        this.respond(200, extend(updatedOrg, {id: id}));
    });

    http.whenGET('/api/account/orgs', function(request) {
        var orgs = grunt.file.expand(path.resolve(__dirname, './orgs/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .map(function(_org) {
                    var fields = (request.query.fields || '').split(','),
                        org = {};

                    fields.forEach(function(field) {
                        org[field] = _org[field];
                    });

                    return request.query.fields ? org : _org;
                });

        this.respond(200, orgs);
    });

    /***********************************************************************************************
     * Advertiser Endpoints
     **********************************************************************************************/

    http.whenGET('/api/account/advrs', function(request) {
        var filters = pluckExcept(request.query, ['orgs']),
            advertisers = grunt.file.expand(path.resolve(__dirname, './advertisers/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(advr) {
                    return Object.keys(request.query)
                        .every(function(key) {
                            return request.query[key] === advr[key];
                        });
                })
                .filter(function(advr) {
                    var org = request.query.org;

                    return !org || advr.org === org;
                });

        this.respond(200, advertisers);
    });

    http.whenGET('/api/account/advrs/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('advertisers', id),
            advertiser = grunt.file.exists(filePath) ? grunt.file.readJSON(filePath) : null;

        if (advertiser) {
            this.respond(200, extend(advertiser, { id: id }));
        } else {
            this.respond(404, 'NOT FOUND');
        }
    });
};
