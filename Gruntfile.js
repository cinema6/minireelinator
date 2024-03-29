module.exports = function(grunt) {
    'use strict';

    var path = require('path'),
        _ =require('underscore');

    var settings = grunt.file.readJSON('settings.json'),
        personal = grunt.file.exists('personal.json') ?
            grunt.file.readJSON('personal.json') : {},
        c6Settings = (function(settings) {
            function loadGlobalConfig(relPath) {
                var configPath = path.join(process.env.HOME, relPath),
                    configExists = grunt.file.exists(configPath);

                return configExists ? grunt.file.readJSON(configPath) : {};
            }

            _.extend(this, settings);

            this.saucelabs = loadGlobalConfig(settings.saucelabsJSON);
            this.browserstack = loadGlobalConfig(settings.browserstackJSON);
            this.aws = loadGlobalConfig(settings.awsJSON);

            return this;
        }.call({}, settings));

    if (!grunt.file.exists('.c6stubinit') && grunt.cli.tasks[0] !== 'init') {
        grunt.fail.warn('This project has not been initialized. Please run "grunt init".');
    }

    require('load-grunt-config')(grunt, {
        configPath: path.join(__dirname, 'tasks/options'),
        config: {
            settings: c6Settings,
            personal: personal
        }
    });

    grunt.loadTasks('tasks');

    /*********************************************************************************************
     *
     * SERVER TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('server', 'start a development server', function() {
        var secure = grunt.option('secure');

        grunt.config.set('connect.options.protocol', secure ? 'https' : 'http');

        [
            'configureProxies:app',
            'connect:app',
            'open:server',
            'watch:livereload'
        ].forEach(function(task) {
            grunt.task.run(task);
        });
    });

    /*********************************************************************************************
     *
     * TEST TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('test', 'run unit and E2E tests', [
        'test:unit',
        'test:e2e:all'
    ]);

    grunt.registerTask('test:unit', 'run unit tests', [
        'jshint:all',
        'clean:build',
        'ngtemplates:test',
        'karma:directives',
        'karma:controllers',
        'karma:states',
        'karma:services',
        'karma:other'
    ]);

    grunt.registerTask('test:unit:debug', 'run unit tests whenever files change', [
        'karma:debug'
    ]);

    grunt.registerTask('test:e2e', 'run e2e tests on specified browser', function(browser, env) {
        var protractorTask;

        env = env || settings.defaultE2EEnv;
        protractorTask = 'protractor:' + ((browser === 'all') ? '' : browser) + ':' + (env);

        grunt.task.run('connect:sandbox');
        if (env === 'saucelabs') {
            grunt.task.run('sauceconnect:e2e');
        } else if (env === 'browserstack') {
            grunt.task.run('browserstacktunnel:e2e');
        } else if (env === 'local') {
            grunt.task.run('updatewebdriver');
        }
        grunt.task.run(protractorTask);
    });

    grunt.registerTask(
        'test:e2e:debug',
        'run e2e tests locally whenever files change',
        function(browser) {
            grunt.task.run('test:e2e:' + (browser || '') + ':local');
            grunt.task.run('watch:e2e:' + (browser || ''));
        }
    );

    grunt.registerTask('test:htmlinspect:selfie', 'validate html', function() {
        var secure = grunt.option('secure');

        grunt.config.set('connect.options.protocol', secure ? 'https' : 'http');

        [
            'configureProxies:app',
            'connect:app',
            'updatewebdriver',
            'protractor:phantomjs:phantomjs'
        ].forEach(function(task) {
            grunt.task.run(task);
        });
    });

    /*********************************************************************************************
     *
     * BUILD TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('build', 'build app into distDir', [
        'test:unit',
        'git_describe_tags',
        'clean:build',
        'copy:dist',
        'ngtemplates:dist',
        'htmlmin:dist',
        'replace:dist',
        'requirejs:dist'
    ]);

    /*********************************************************************************************
     *
     * UPLOAD TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('publish:collateral', 'upload collateral assets to s3', function(target) {
        grunt.task.run('s3:collateral-' + target);
    });

    grunt.registerTask('publish:app', 'build and upload the application to s3', function(target) {
        grunt.task.run('build');
        grunt.task.run('s3:' + target);
    });

    grunt.registerTask('publish', 'upload the collateral assets and app to s3', function(target) {
        grunt.task.run('publish:app:' + target);
    });
};
