(function() {
    'use strict';

    define(['app'], function() {
        describe('NewGeneralState', function() {
            var $injector,
                c6State,
                ManagerNewState,
                NewGeneralState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    ManagerNewState = c6State.get('manager.new');
                    NewGeneralState = c6State.get('manager.new.general');
                });
            });

            it('should exist', function() {
                expect(NewGeneralState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
