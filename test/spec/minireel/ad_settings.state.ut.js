(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('AdSettingsState', function() {
            var $injector,
                $rootScope,
                $q,
                c6State,
                AdSettingsState;

            var minireel;

            beforeEach(function() {
                minireel = {};

                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');

                    AdSettingsState = c6State.get('MR:AdManager.Settings');
                });
            });

            it('should exist', function() {
                expect(AdSettingsState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
