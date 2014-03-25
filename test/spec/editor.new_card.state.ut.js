(function() {
    'use strict';

    define(['app'], function() {
        describe('NewCardState', function() {
            var $injector,
                c6State,
                MiniReelService,
                NewCardState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    MiniReelService = $injector.get('MiniReelService');
                });

                NewCardState = c6State.get('editor.newCard');
            });

            it('should exist', function() {
                expect(NewCardState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var card;

                beforeEach(function() {
                    card = {};

                    spyOn(MiniReelService, 'createCard').and.returnValue(card);
                });

                it('should create a new card as the model', function() {
                    var model = $injector.invoke(NewCardState.model, NewCardState);

                    expect(MiniReelService.createCard).toHaveBeenCalledWith();
                    expect(model).toBe(card);
                });
            });
        });
    });
}());
