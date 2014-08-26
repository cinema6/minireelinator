module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

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
};
