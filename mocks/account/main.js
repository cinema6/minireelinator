module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

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
            response;

        grunt.file.write(filePath, JSON.stringify(newUser, null, '    '));

        this.respond(200, (response = extend(
            newUser,
            { id: id },
            isLoggedInUser ? { email: userCache.user.email } : {}
        )));

        if (isLoggedInUser) {
            userCache.user = response;
        }
    });

    http.whenGET('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('users', id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/account/users/confirm/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('users', id),
            token = request.body.token,
            user = {
                applications: ["e-99263e70058290"],
                config: {},
                firstName: "Sammy",
                lastName: "Selfie",
                advertiser: "a-282824b8bb40a2",
                customer: "cus-71e725f8bf33d5",
                created: "2014-08-21T19:45:54.572Z",
                lastUpdated: "2014-08-21T19:45:54.572Z",
                org: "o-a6fd7298acb6fa",
                status: "active"
            };

        if (token) {
            grunt.file.write(filePath, JSON.stringify(user, null, '    '));
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } else {
            this.respond(403, 'Forbidden');
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

    /***********************************************************************************************
     * Advertiser Endpoints
     **********************************************************************************************/

    http.whenGET('/api/account/advertisers', function(request) {
        this.respond(200, grunt.file.expand(path.resolve(__dirname, './advertisers/*.json'))
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

    http.whenGET('/api/account/advertiser/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('advertisers', id),
            advertiser = grunt.file.exists(filePath) ? grunt.file.readJSON(filePath) : null;

        if (advertiser) {
            this.respond(200, extend(advertiser, { id: id }));
        } else {
            this.respond(404, 'NOT FOUND');
        }
    });

    /***********************************************************************************************
     * Customer Endpoints
     **********************************************************************************************/

    http.whenGET('/api/account/customers', function(request) {
        this.respond(200, grunt.file.expand(path.resolve(__dirname, './customers/*.json'))
            .map(function(path) {
                var id = path.match(/[^\/]+(?=\.json)/)[0];

                return extend(grunt.file.readJSON(path), { id: id });
            }).filter(function(customer) {
                return Object.keys(request.query)
                    .every(function(key) {
                        return request.query[key] === customer[key];
                    });
            }));
    });

    http.whenGET('/api/account/customer/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('customers', id),
            customer = grunt.file.exists(filePath) ? grunt.file.readJSON(filePath) : null;

        if (customer) {
            this.respond(200, extend(customer, { id: id }));
        } else {
            this.respond(404, 'NOT FOUND');
        }
    });
};
