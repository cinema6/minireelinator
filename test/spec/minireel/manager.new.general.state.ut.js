(function() {
    'use strict';

    define(['minireel/manager', 'minireel/app'], function(managerModule, minireelModule) {
        describe('NewGeneralState', function() {
            var $injector,
                c6State,
                NewGeneralState;

            beforeEach(function() {
                module(minireelModule.name);
                module(managerModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    NewGeneralState = c6State.get('MR:New.General');
                });
            });

            it('should exist', function() {
                expect(NewGeneralState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
