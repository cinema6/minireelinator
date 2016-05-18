(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('SplashImageState', function() {
            var $injector,
                c6State,
                SplashImageState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    SplashImageState = c6State.get('MR:Splash.Image');
                });
            });

            afterAll(function() {
                $injector = null;
                c6State = null;
                SplashImageState = null;
            });

            it('should exist', function() {
                expect(SplashImageState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
