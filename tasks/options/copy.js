(function() {
    'use strict';

    module.exports = {
        dist: {
            files: [
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>',
                    src: [
                        '*.*',
                        '!*.html'
                    ],
                    dest: '<%= settings.distDir %>'
                },
                {
                    expand: true,
                    cwd: '<%= settings.appDir %>/assets',
                    src: [
                        '**',
                        '!mock/**',
                        '!apps/**',
                        '!**/*.{js,css,html}'
                    ],
                    dest: '<%= _versionDir %>'
                }
            ]
        }
    };
}());
