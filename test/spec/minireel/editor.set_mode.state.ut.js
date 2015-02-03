(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('SetModeState', function() {
            var $injector,
                c6State,
                EditorService,
                SetModeState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    EditorService = $injector.get('EditorService');
                    c6State = $injector.get('c6State');

                    SetModeState = c6State.get('MR:Editor.Settings');
                });
            });

            it('should exist', function() {
                expect(SetModeState).toEqual(jasmine.any(Object));
            });

            it('should have the same children as the "manager.new" state', function() {
                var NewCategoryState = c6State.get('MR:New.Category'),
                    NewModeState = c6State.get('MR:New.Mode'),
                    MyNewCategoryState = c6State.get('MR:Settings.Category'),
                    MyNewModeState = c6State.get('MR:Settings.Mode');

                function equalStates(state1, state2) {
                    ['controller', 'controllerAs', 'templateUrl', 'model', 'updateControllerModel']
                        .forEach(function(prop) {
                            if (state2[prop] instanceof Function) {
                                return expect(state1[prop].toString()).toBe(state2[prop].toString());
                            }

                            expect(state1[prop]).toEqual(state2[prop]);
                        });
                }

                equalStates(NewCategoryState, MyNewCategoryState);
                expect(NewCategoryState).not.toBe(MyNewCategoryState);

                equalStates(NewModeState, MyNewModeState);
                expect(NewModeState).not.toBe(MyNewModeState);
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    Object.defineProperty(EditorService.state, 'minireel', {
                        value: {}
                    });

                    result = SetModeState.model();
                });

                it('should return the EditorService\'s open MiniReel', function() {
                    expect(result).toBe(EditorService.state.minireel);
                });
            });
        });
    });
}());
