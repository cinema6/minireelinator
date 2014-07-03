(function() {
    'use strict';

    define(['minireel/manager', 'minireel/app'], function(managerModule, minireelModule) {
        describe('NewModeState', function() {
            var $injector,
                c6State,
                NewModeState;

            beforeEach(function() {
                module(minireelModule.name);
                module(managerModule.name);

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
