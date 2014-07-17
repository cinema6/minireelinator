(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('NewModeState', function() {
            var $injector,
                c6State,
                NewModeState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    NewModeState = c6State.get('MR:New.Mode');
                });
            });

            it('should exist', function() {
                expect(NewModeState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
