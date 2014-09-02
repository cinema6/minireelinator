(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('AdSettingsDisplayServerState', function() {
            var $injector,
                c6State,
                AdSettingsDisplayServerState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    AdSettingsDisplayServerState = c6State.get('MR:AdManager.Settings.DisplayServer');
                });
            });

            it('should exist', function() {
                expect(AdSettingsDisplayServerState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
