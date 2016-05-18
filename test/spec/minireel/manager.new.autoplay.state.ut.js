(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('NewAutoplayState', function() {
            var $injector,
                c6State,
                NewAutoplayState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    NewAutoplayState = c6State.get('MR:New.Autoplay');
                });
            });

            afterAll(function() {
                $injector = null;
                c6State = null;
                NewAutoplayState = null;
            });

            it('should exist', function() {
                expect(NewAutoplayState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
