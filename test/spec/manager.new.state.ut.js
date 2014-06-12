(function() {
    'use strict';

    define(['app'], function() {
        describe('ManagerNewState', function() {
            var $injector,
                $rootScope,
                $q,
                cinema6,
                MiniReelService,
                c6State,
                ManagerNewState;

            var minireel,
                appData;

            var tabs = {
                general: {
                    name: jasmine.any(String),
                    sref: 'general',
                    visits: 0,
                    requiredVisits: 0,
                    required: true
                },
                category: {
                    name: jasmine.any(String),
                    sref: 'category',
                    visits: 0,
                    requiredVisits: 0,
                    required: false
                },
                mode: {
                    name: jasmine.any(String),
                    sref: 'mode',
                    visits: 0,
                    requiredVisits: 0,
                    required: false
                },
                autoplay: {
                    name: jasmine.any(String),
                    sref: 'autoplay',
                    visits: 0,
                    requiredVisits: 0,
                    required: false
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
                    MiniReelService = $injector.get('MiniReelService');

                    ManagerNewState = c6State.get('manager.new');
                });

                spyOn(cinema6, 'getAppData').and.returnValue($q.when(appData));
                spyOn(MiniReelService, 'create').and.returnValue(minireel);
            });

            it('should exist', function() {
                expect(ManagerNewState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                describe('if there is already a model', function() {
                    beforeEach(function() {
                        ManagerNewState.cModel = {};

                        result = $injector.invoke(ManagerNewState.model, ManagerNewState);
                    });

                    it('should return the existing model', function() {
                        expect(result).toBe(ManagerNewState.cModel);
                    });
                });

                describe('if there is not already a model', function() {
                    var success;

                    beforeEach(function() {
                        success = jasmine.createSpy('model() success');

                        $rootScope.$apply(function() {
                            result = $injector.invoke(ManagerNewState.model, ManagerNewState).then(success);
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

                    $injector.invoke(ManagerNewState.updateControllerModel, ManagerNewState, {
                        controller: controller,
                        model: model
                    });
                });

                it('should set the model as the controller\'s model', function() {
                    expect(controller.model).toBe(model);
                });

                it('should set the controller\'s returnState to "manager"', function() {
                    expect(controller.returnState).toBe('manager');
                });

                it('should set the controller\'s baseState to "manager.new"', function() {
                    expect(controller.baseState).toBe('manager.new');
                });

                it('should enable all of the tabs', function() {
                    expect(controller.tabs).toEqual([
                        jasmine.objectContaining(tabs.general),
                        jasmine.objectContaining(tabs.category),
                        jasmine.objectContaining(tabs.mode),
                        jasmine.objectContaining(tabs.autoplay)
                    ]);
                });
            });
        });
    });
}());
