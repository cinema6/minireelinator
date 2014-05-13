(function() {
    'use strict';

    define(['app'], function() {
        describe('EditCardSkipState', function() {
            var $injector,
                c6State,
                EditCardState,
                EditCardSkipState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');

                    EditCardState = c6State.get('editor.editCard');
                    EditCardSkipState = c6State.get('editor.editCard.skip');
                });
            });

            it('should exist', function() {
                expect(EditCardSkipState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    EditCardState.cModel = {};

                    result = $injector.invoke(EditCardSkipState.model, EditCardSkipState);
                });

                it('should return a reference to the parent\'s model', function() {
                    expect(result).toBe(EditCardState.cModel);
                });
            });
        });
    });
}());
