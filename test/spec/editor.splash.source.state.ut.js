(function() {
    'use strict';

    define(['app'], function() {
        describe('SplashSourceState', function() {
            var $injector,
                c6State,
                SplashSourceState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    SplashSourceState = c6State.get('editor.splash.source');
                });
            });

            it('should exist', function() {
                expect(SplashSourceState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
