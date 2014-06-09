(function() {
    'use strict';

    define(['app'], function() {
        describe('SplashImageState', function() {
            var $injector,
                c6State,
                SplashImageState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    SplashImageState = c6State.get('editor.splash.image');
                });
            });

            it('should exist', function() {
                expect(SplashImageState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
