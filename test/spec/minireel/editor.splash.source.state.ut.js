(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('SplashSourceState', function() {
            var $injector,
                c6State,
                SplashSourceState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    SplashSourceState = c6State.get('MR:Splash.Source');
                });
            });

            afterAll(function() {
                $injector = null;
                c6State = null;
                SplashSourceState = null;
            });

            it('should exist', function() {
                expect(SplashSourceState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
