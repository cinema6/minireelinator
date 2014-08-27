module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function experiencePath(id) {
        return path.resolve(__dirname, './orgs/' + id + '.json');
    }

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
        var filePath = experiencePath(idFromPath(request.pathname)),
            current = grunt.file.readJSON(filePath),
            newExperience = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        grunt.file.write(filePath, JSON.stringify(newExperience, null, '    '));

        this.respond(200, newExperience);
    });
};
