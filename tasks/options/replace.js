module.exports = {
    dist: {
        src: ['<%= settings.distDir %>/index.html'],
        dest: '<%= settings.distDir %>/index.html',
        replacements: [
            {
                from: /<base href="(.+?)"\/?>/,
                to: function(match, index, text, matches) {
                    var grunt = require('grunt');

                    return match.replace(matches[0], '/' + grunt.config('_version') + '/');
                }
            }
        ]
    }
};
