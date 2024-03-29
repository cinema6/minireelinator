module.exports = {
    dist: {
        options: {
            appDir: '<%= settings.appDir %>/assets/',
            mainConfigFile: '<%= settings.appDir %>/assets/scripts/main.js',
            dir: '<%= _versionDir %>',
            optimize: 'uglify2',
            optimizeCss: 'standard',
            removeCombined: true,
            paths: {
                templates: '../../../.tmp/templates',
                chartjs: 'empty:',
                intercom: 'empty:'
            },
            modules: [{
                name: 'main'
            }],
            rawText: {
                'version': 'define([], "<%= _version %>");'
            }
        }
    }
};
