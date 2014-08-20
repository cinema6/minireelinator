module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    http.whenGET('/api/content/experience/**', function(request) {
        var id = request.pathname.match(/[^\/]+$/)[0],
            experience = grunt.file.readJSON(
                path.resolve(__dirname, './experiences/' + id + '.json')
            );

        experience.id = id;

        if (experience) {
            this.respond(200, experience);
        } else {
            this.respond(404, 'Not found');
        }
    });

    http.whenGET('/api/content/experiences', function() {
        var experiences = grunt.file.expand(path.resolve(__dirname, './experiences/*.json'))
            .map(grunt.file.readJSON);

        this.respond(200, experiences);
    });
};
