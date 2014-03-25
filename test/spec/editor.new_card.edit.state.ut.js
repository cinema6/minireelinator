(function() {
    'use strict';

    define(['app'], function() {
        describe('EditState', function() {
            var $injector,
                c6State,
                c6StateParams,
                NewCardState,
                EditState,
                MiniReelService;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');
                    MiniReelService = $injector.get('MiniReelService');
                });

                NewCardState = c6State.get('editor.newCard');
                EditState = c6State.get('editor.newCard.edit');
            });

            it('should exist', function() {
                expect(EditState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    NewCardState.cModel = {};
                    spyOn(MiniReelService, 'setCardType').and.returnValue(NewCardState.cModel);
                });

                it('should return a card that has been set to the specified type', function() {
                    c6StateParams.type = 'video';
                    expect($injector.invoke(EditState.model, EditState)).toBe(NewCardState.cModel);
                    expect(MiniReelService.setCardType).toHaveBeenCalledWith(NewCardState.cModel, 'video');

                    c6StateParams.type = 'ad';
                    expect($injector.invoke(EditState.model, EditState)).toBe(NewCardState.cModel);
                    expect(MiniReelService.setCardType).toHaveBeenCalledWith(NewCardState.cModel, 'ad');

                    c6StateParams.type = 'videoBallot';
                    expect($injector.invoke(EditState.model, EditState)).toBe(NewCardState.cModel);
                    expect(MiniReelService.setCardType).toHaveBeenCalledWith(NewCardState.cModel, 'videoBallot');
                });
            });
        });
    });
}());
