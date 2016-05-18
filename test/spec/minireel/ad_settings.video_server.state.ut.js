(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('AdSettingsVideoServerState', function() {
            var $injector,
                c6State,
                AdSettingsVideoServerState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    AdSettingsVideoServerState = c6State.get('MR:AdManager.Settings.VideoServer');
                });
            });

            afterAll(function() {
                $injector = null;
                c6State = null;
                AdSettingsVideoServerState = null;
            });

            it('should exist', function() {
                expect(AdSettingsVideoServerState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
