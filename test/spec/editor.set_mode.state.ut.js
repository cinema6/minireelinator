(function() {
    'use strict';

    define(['app'], function() {
        describe('SetModeState', function() {
            var $injector,
                $rootScope,
                $q,
                cinema6,
                c6State,
                EditorState,
                SetModeState;

            var minireel,
                appData;

            var tabs = {
                general: {
                    name: 'Title Settings',
                    sref: 'general',
                    visits: 0,
                    requiredVisits: 0
                },
                category: {
                    name: 'Lightbox Settings',
                    sref: 'category',
                    visits: 0,
                    requiredVisits: 0
                },
                mode: {
                    name: 'MiniReel Type',
                    sref: 'mode',
                    visits: 0,
                    requiredVisits: 0
                },
                autoplay: {
                    name: 'Autoplay',
                    sref: 'autoplay',
                    visits: 0,
                    requiredVisits: 0
                }
            };

            beforeEach(function() {
                minireel = {};
                appData = {
                    experience: {
                        data: {
                            modes: []
                        }
                    }
                };

                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');

                    EditorState = c6State.get('editor');
                    SetModeState = c6State.get('editor.setMode');
                });

                EditorState.cModel = minireel;

                spyOn(cinema6, 'getAppData').and.returnValue($q.when(appData));
            });

            it('should exist', function() {
                expect(SetModeState).toEqual(jasmine.any(Object));
            });

            it('should have the same children as the "manager.new" state', function() {
                var NewCategoryState = c6State.get('manager.new.category'),
                    NewModeState = c6State.get('manager.new.mode'),
                    MyNewCategoryState = c6State.get('editor.setMode.category'),
                    MyNewModeState = c6State.get('editor.setMode.mode');

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

                describe('if there is already a model', function() {
                    beforeEach(function() {
                        SetModeState.cModel = {};

                        result = $injector.invoke(SetModeState.model, SetModeState);
                    });

                    it('should return the existing model', function() {
                        expect(result).toBe(SetModeState.cModel);
                    });
                });

                describe('if there is not already a model', function() {
                    var success;

                    beforeEach(function() {
                        success = jasmine.createSpy('model() success');

                        $rootScope.$apply(function() {
                            result = $injector.invoke(SetModeState.model, SetModeState).then(success);
                        });
                    });

                    it('should return a promise that resolves to a hash with the supported modes, and a new minireel', function() {
                        expect(success).toHaveBeenCalledWith({
                            modes: appData.experience.data.modes,
                            minireel: minireel
                        });
                    });
                });
            });

            describe('updateControllerModel()', function() {
                var controller, model;

                beforeEach(function() {
                    controller = {};
                    model = {};

                    $injector.invoke(SetModeState.updateControllerModel, SetModeState, {
                        controller: controller,
                        model: model
                    });
                });

                it('should set the model as the controller\'s model', function() {
                    expect(controller.model).toBe(model);
                });

                it('should set the controller\'s returnState to "editor"', function() {
                    expect(controller.returnState).toBe('editor');
                });

                it('should set the controller\'s baseState to "editor.setMode"', function() {
                    expect(controller.baseState).toBe('editor.setMode');
                });

                it('should enable all but the first tab', function() {
                    expect(controller.tabs).toEqual([
                        jasmine.objectContaining(tabs.category),
                        jasmine.objectContaining(tabs.mode),
                        jasmine.objectContaining(tabs.autoplay)
                    ]);
                });
            });
        });
    });
}());
