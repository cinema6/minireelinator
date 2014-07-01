(function() {
    'use strict';

    define(['app'], function() {
        describe('EditorSplashState', function() {
            var $injector,
                c6State,
                EditorState,
                EditorSplashState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');

                    EditorState = c6State.get('MR:Editor');
                    EditorSplashState = c6State.get('MR:Editor.Splash');
                });
            });

            it('should exist', function() {
                expect(EditorSplashState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    EditorState.cModel = {
                        data: {
                            deck: [
                                {},
                                {}
                            ]
                        },
                        name: 'foo'
                    };
                });

                it('should return a copy of its parent\'s model', function() {
                    var model = $injector.invoke(EditorSplashState.model, EditorSplashState);

                    expect(model).toEqual(EditorState.cModel);
                    expect(model).not.toBe(EditorState.cModel);
                });
            });
        });
    });
}());
