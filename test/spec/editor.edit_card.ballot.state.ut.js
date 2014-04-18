(function() {
    'use strict';

    define(['app'], function() {
        describe('BallotState', function() {
            var $injector,
                $rootScope,
                c6State,
                EditCardState,
                BallotState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    c6State = $injector.get('c6State');
                    EditCardState = c6State.get('editor.editCard');
                    BallotState = c6State.get('editor.editCard.ballot');
                });

                EditCardState.cModel = {
                    data: {
                        ballot: []
                    }
                };
            });

            it('should exist', function() {
                expect(BallotState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                it('should return a reference to the parent\'s ballot', function() {
                    expect($injector.invoke(BallotState.model, BallotState)).toBe(EditCardState.cModel.data.ballot);
                });
            });

            describe('afterModel()', function() {
                beforeEach(function() {
                    spyOn(c6State, 'goTo');
                });

                it('should do nothing if there is a model', function() {
                    expect($injector.invoke(BallotState.afterModel, BallotState, { model: [] })).toBeUndefined();
                    expect(c6State.goTo).not.toHaveBeenCalled();
                });

                it('should return a rejected promise and transition to the "editor.editCard.video" state', function() {
                    var fail = jasmine.createSpy('fail');

                    $rootScope.$apply(function() {
                        $injector.invoke(BallotState.afterModel, BallotState, { model: undefined }).catch(fail);
                    });
                    expect(fail).toHaveBeenCalled();
                    expect(c6State.goTo).toHaveBeenCalledWith('editor.editCard.video');
                });
            });
        });
    });
}());
