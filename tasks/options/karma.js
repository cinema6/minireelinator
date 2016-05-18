(function() {
    'use strict';

    var settings = require('../../settings.json');

    // list of files / patterns to load in the browser
    var karmaFiles = [
        { pattern: 'settings.json', included: false },
        { pattern: (settings.appDir + '/assets/scripts/**/*.js'), included: false },
        { pattern: (settings.appDir + '/assets/views/**/*.html'), included: false },
        { pattern: '.tmp/templates.js', included: false },
        { pattern: 'test/helpers/*.js', included: false },
        'test/test-main.js'
    ];

    // list of files to exclude
     var karmaExcludes = [
        (settings.appDir + '/assets/scripts/main.js')
    ];

    // default task targets
    var targets = {
        options: {
            configFile: 'test/karma.conf.js'
        },
        debug: {
            options: {
                singleRun: false,
                autoWatch: true,
                files: karmaFiles.concat({
                    pattern: 'test/spec/**/*.ut.js',
                    included: false
                })
            }
        }
    };

    // test groups used to split up the running of unit tests
    var testGroups = [
        {
            group: 'directives',
            pattern: 'test/spec/**/*.directive.ut.js'
        },
        {
            group: 'controllers',
            pattern: 'test/spec/**/*.controller.ut.js'
        },
        {
            group: 'states',
            pattern: 'test/spec/**/*.state.ut.js'
        },
        {
            group: 'services',
            pattern: 'test/spec/**/*.service.ut.js'
        }
    ];

    // add a task target for each test group
    testGroups.forEach(function(testGroup) {
        targets[testGroup.group] = {
            options: {
                reporters: ['progress', 'junit'],
                junitReporter: {
                    outputFile: 'reports/' + testGroup.group + '.xml'
                },
                files: karmaFiles.concat({
                    pattern: testGroup.pattern,
                    included: false
                }),
                exclude: karmaExcludes
            }
        };
    });

    // add a task target for tests not in any test group
    targets.other = {
        options: {
            reporters: ['progress', 'junit'],
            junitReporter: {
                outputFile: 'reports/other.xml'
            },
            files: karmaFiles.concat({
                pattern: 'test/spec/**/*.ut.js',
                included: false
            }),
            exclude: karmaExcludes.concat.apply(karmaExcludes, testGroups.map(function(testGroup) {
                return testGroup.pattern;
            }))
        }
    };

    module.exports = targets;
})();
