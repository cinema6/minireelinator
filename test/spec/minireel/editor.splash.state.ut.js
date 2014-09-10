(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('EditorSplashState', function() {
            var $injector,
                c6State,
                EditorService,
                EditorSplashState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    EditorService = $injector.get('EditorService');

                    EditorSplashState = c6State.get('MR:Editor.Splash');
                });
            });

            it('should exist', function() {
                expect(EditorSplashState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var model;

                beforeEach(function() {
                    EditorService.state = {
                        minireel: {
                            data: {
                                deck: [
                                    {},
                                    {}
                                ]
                            },
                            name: 'foo'
                        }
                    };

                    model = EditorSplashState.model();
                });

                it('should return a copy of the open minireel', function() {
                    expect(model).toEqual(EditorService.state.minireel);
                    expect(model).not.toBe(EditorService.state.minireel);
                });
            });
        });
    });
}());
