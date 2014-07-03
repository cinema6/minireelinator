(function() {
    'use strict';

    define(['minireel/editor', 'minireel/app', 'minireel/manager'], function(editorModule, managerModule, minireelModule) {
        describe('SetModeState', function() {
            var $injector,
                c6State,
                EditorService,
                SetModeState;

            beforeEach(function() {
                module(minireelModule.name);
                module(managerModule.name);
                module(editorModule.name);

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
