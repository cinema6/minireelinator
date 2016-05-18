(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('ManagerNewState', function() {
            var $injector,
                $rootScope,
                $q,
                MiniReelService,
                c6State,
                ManagerNewState;

            var minireel;

            beforeEach(function() {
                minireel = {};

                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    MiniReelService = $injector.get('MiniReelService');

                    ManagerNewState = c6State.get('MR:New');
                });

                spyOn(MiniReelService, 'create').and.returnValue(minireel);
            });

            afterAll(function() {
                $injector = null;
                $rootScope = null;
                $q = null;
                MiniReelService = null;
                c6State = null;
                ManagerNewState = null;
                minireel = null;
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
