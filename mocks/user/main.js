module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function userPath(id) {
        return path.resolve(__dirname, './users/' + id + '.json');
    }

    http.whenPUT('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = userPath(id),
            userCache = require('../auth/user_cache'),
            currentUser = grunt.file.readJSON(filePath),
            newUser = extend(currentUser, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(newUser, null, '    '));

        this.respond(200, (userCache.user = extend(newUser, { id: id })));
    });

    http.whenGET('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = userPath(id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });
};
