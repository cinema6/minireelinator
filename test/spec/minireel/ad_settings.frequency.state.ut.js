(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('AdSettingsFrequencyState', function() {
            var $injector,
                c6State,
                AdSettingsFrequencyState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    AdSettingsFrequencyState = c6State.get('MR:AdManager.Settings.Frequency');
                });
            });

            it('should exist', function() {
                expect(AdSettingsFrequencyState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
