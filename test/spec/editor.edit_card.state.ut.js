(function() {
    'use strict';

    define(['app'], function() {
        describe('EditCardState', function() {
            var EditCardState,
                EditorState,
                $injector,
                c6StateParams,
                c6State;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');
                });

                EditorState = c6State.get('editor');
                EditCardState = c6State.get('editor.editCard');
            });

            it('should exist', function() {
                expect(EditCardState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    EditorState.cModel = {
                        data: {
                            deck: [
                                {
                                    id: 'rc-19437ee278914e'
                                },
                                {
                                    id: 'rc-4d812b28c4292b'
                                },
                                {
                                    id: 'rc-036a2e0b648f3d'
                                },
                                {
                                    id: 'rc-16044f64448e0f'
                                }
                            ]
                        }
                    };
                    c6StateParams.id = 'rc-036a2e0b648f3d';
                });

                it('should use the c6StateParams id to find the card in the deck of the editor\'s model', function() {
                    expect($injector.invoke(EditCardState.model, EditCardState)).toBe(EditorState.cModel.data.deck[2]);
                });
            });
        });
    });
}());
