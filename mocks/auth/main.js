module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        userCache = require('./user_cache');

    http.whenPOST('/api/auth/login', function(request) {
        if ((/\w+@cinema6\.com$/).test(request.body.email)) {
            var user = grunt.file.readJSON('mocks/auth/user.json');

            user.email = request.body.email;

            this.respond(200, (userCache.user = user));
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
};
