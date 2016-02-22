module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path'),
        userCache = require('./user_cache');

    var fn = require('../utils/fn'),
        extend = fn.extend;

    var userId = 'u-35b096c999711b',
        selfieUser = 'u-82b0123da9678c';

    function userPath(id) {
        return path.resolve(__dirname, '../account/users/' + id + '.json');
    }

    http.whenPOST('/api/auth/login', function(request) {
        if ((/\w+@cinema6\.com$/).test(request.body.email)) {
            var id = /selfie/.test(request.body.email) ? selfieUser : userId,
                user = grunt.file.readJSON(userPath(id));

            this.respond(200, (userCache.user = extend(user, {
                email: request.body.email,
                id: id
            })));
        } else {
            this.respond(401, 'Invalid email or password');
        }
    });

    http.whenPOST('/api/auth/logout', function() {
        delete userCache.user;
        this.respond(204, '');
    });

    http.whenGET('/api/auth/status', function() {
        if (!userCache.user) {
            this.respond(401, 'Unauthorized');
        } else {
            this.respond(200, userCache.user);
        }
    });

    http.whenPOST('/api/auth/password/forgot', function(request) {
        if (request.body.email === 'selfie@cinema6.com') {
            this.respond(200, 'Successfully generated reset token');
        } else {
            this.respond(404, 'That user does not exist');
        }
    });
};
