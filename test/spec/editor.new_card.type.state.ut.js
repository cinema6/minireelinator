(function() {
    'use strict';

    define(['app'], function() {
        describe('TypeState', function() {
            var $injector,
                c6State,
                NewCardState,
                TypeState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                });

                NewCardState = c6State.get('editor.newCard');
                TypeState = c6State.get('editor.newCard.type');
            });

            it('should exist', function() {
                expect(TypeState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    NewCardState.cModel = {};
                });

                it('should return the model of its parent', function() {
                    expect($injector.invoke(TypeState.model, TypeState)).toBe(NewCardState.cModel);
                });
            });
        });
    });
}());
