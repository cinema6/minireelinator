(function() {
    'use strict';

    define(['app'], function() {
        describe('NewAutoplayState', function() {
            var $injector,
                c6State,
                ManagerNewState,
                NewAutoplayState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    ManagerNewState = c6State.get('manager.new');
                    NewAutoplayState = c6State.get('manager.new.autoplay');
                });
            });

            it('should exist', function() {
                expect(NewAutoplayState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
