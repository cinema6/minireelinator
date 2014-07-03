(function() {
    'use strict';

    define(['minireel/editor', 'minireel/app'], function(editorModule, minireelModule) {
        describe('SplashImageState', function() {
            var $injector,
                c6State,
                SplashImageState;

            beforeEach(function() {
                module(minireelModule.name);
                module(editorModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    SplashImageState = c6State.get('MR:Splash.Image');
                });
            });

            it('should exist', function() {
                expect(SplashImageState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
