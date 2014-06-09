(function() {
    'use strict';

    define(['app'], function() {
        describe('ManagerEmbedState', function() {
            var $injector,
                cinema6,
                $q,
                c6State,
                c6StateParams,
                $rootScope,
                ManagerEmbedState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');
                    cinema6 = $injector.get('cinema6');

                    ManagerEmbedState = c6State.get('manager.embed');
                });
            });

            it('should exist', function() {
                expect(ManagerEmbedState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result, success,
                    minireel;

                beforeEach(function() {
                    c6StateParams.minireelId = 'e-9b5c930e646069';

                    success = jasmine.createSpy('model() success');
                    minireel = {
                        id: c6StateParams.minireelId,
                        data: {}
                    };

                    spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));

                    $rootScope.$apply(function() {
                        result = $injector.invoke(ManagerEmbedState.model, ManagerEmbedState)
                            .then(success);
                    });
                });

                it('should find the minireel', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('experience', c6StateParams.minireelId);
                });

                it('should resolve to the minireel', function() {
                    expect(success).toHaveBeenCalledWith(minireel);
                });
            });
        });
    });
}());
