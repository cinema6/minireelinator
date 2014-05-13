(function() {
    'use strict';

    define(['app'], function() {
        describe('EditCardServerState', function() {
            var $injector,
                c6State,
                EditCardState,
                EditCardServerState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');

                    EditCardState = c6State.get('editor.editCard');
                    EditCardServerState = c6State.get('editor.editCard.server');
                });
            });

            it('should exist', function() {
                expect(EditCardServerState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    EditCardState.cModel = {};

                    result = $injector.invoke(EditCardServerState.model, EditCardServerState);
                });

                it('should return a reference to the parent\'s model', function() {
                    expect(result).toBe(EditCardState.cModel);
                });
            });
        });
    });
}());
