(function() {
    'use strict';

    define(['app'], function() {
        xdescribe('NewAdsState', function() {
            var $injector,
                c6State,
                ManagerNewState,
                ManagerNewAdsState,
                EditorSetModeState,
                EditorSetModeAdsState,
                appData;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    appData = $injector.get('appData');
                    ManagerNewState = c6State.get('manager.new');
                    ManagerNewAdsState = c6State.get('manager.new.ads');

                    EditorSetModeState = c6State.get('editor.setMode');
                    EditorSetModeAdsState = c6State.get('editor.setMode.ads');
                });

                spyOn(appData, 'ensureFulfillment');
            });

            describe('in manager state', function() {
                it('should exist', function() {
                    expect(ManagerNewAdsState).toEqual(jasmine.any(Object));
                });

                describe('afterModel()', function() {
                    it('should get appData', function() {
                        $injector.invoke(ManagerNewAdsState.afterModel, ManagerNewAdsState);
                        expect(appData.ensureFulfillment).toHaveBeenCalled();
                    });
                });
            });

            describe('in editor state', function() {
                it('should exist', function() {
                    expect(EditorSetModeAdsState).toEqual(jasmine.any(Object));
                });

                describe('afterModel()', function() {
                    it('should get appData', function() {
                        $injector.invoke(EditorSetModeAdsState.afterModel, EditorSetModeAdsState);
                        expect(appData.ensureFulfillment).toHaveBeenCalled();
                    });
                });
            });
        });
    });
}());