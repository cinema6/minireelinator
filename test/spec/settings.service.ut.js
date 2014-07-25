define( ['app'], function(appModule) {
    'use strict';

    ddescribe('SettingsService', function() {
        var SettingsServiceProvider;

        var SettingsService;

        beforeEach(function() {
            module(appModule.name, function($injector) {
                SettingsServiceProvider = $injector.get('SettingsServiceProvider');
            });

            inject(function($injector) {
                SettingsService = $injector.get('SettingsService');
            });
        });

        it('should exist', function() {
            expect(SettingsService).toEqual(jasmine.any(Object));
        });
    });
});
