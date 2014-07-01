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

            beforeEach(function() {
                minireel = {};

                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    appData = $injector.get('appData');
                    MiniReelService = $injector.get('MiniReelService');

                    ManagerNewState = c6State.get('MR:New');
                });

                spyOn(cinema6, 'getAppData').and.returnValue($q.when(appData));
                spyOn(appData, 'ensureFulfillment').and.returnValue($q.when(appData));
                spyOn(MiniReelService, 'create').and.returnValue(minireel);

                appData.experience = {
                    data: {
                        modes: []
                    }
                };
                appData.user = {
                    org: {
                        waterfalls: {
                            video: [],
                            display: []
                        }
                    }
                };
            });

            it('should exist', function() {
                expect(ManagerNewState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                describe('if there is not already a model', function() {
                    beforeEach(function() {
                        result = ManagerNewState.model();
                    });

                    it('should return a new minireel', function() {
                        expect(result).toBe(minireel);
                    });
                });
            });
        });
    });
}());
