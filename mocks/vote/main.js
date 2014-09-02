module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var db = require('../utils/db'),
        fn = require('../utils/fn'),
        idFromPath = db.idFromPath,
        genId = require('../../tasks/resources/helpers').genId,
        extend = fn.extend;

    function electionPath(id) {
        return path.resolve(__dirname, './elections/' + id + '.json');
    }

    http.whenPOST('/api/election', function(request) {
        var id = genId('el'),
            election = request.body;

        grunt.file.write(electionPath(id), JSON.stringify(election, null, '    '));

        this.respond(201, extend(election, {
            id: id
        }));
    });

    http.whenPUT('/api/election/**', function(request) {
        var id = idFromPath(request.pathname),
            path = electionPath(id),
            election = grunt.file.readJSON(path),
            newElection = extend(election, request.body);

        console.log(newElection);

        grunt.file.write(path, JSON.stringify(newElection, null, '    '));

        this.respond(200, extend(newElection, {
            id: id
        }));
    });

    http.whenGET('/api/election/**', function(request) {
        var id = idFromPath(request.pathname),
            election = grunt.file.readJSON(electionPath(id));

        this.respond(200, extend(election, {
            id: id
        }));
    });
};
