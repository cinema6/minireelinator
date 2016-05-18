(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('AdManagerEmbedState', function() {
            var $injector,
                cinema6,
                $q,
                c6State,
                $rootScope,
                AdManagerEmbedState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');

                    AdManagerEmbedState = c6State.get('MR:AdManager.Embed');
                });
            });

            afterAll(function() {
                $injector = null;
                cinema6 = null;
                $q = null;
                c6State = null;
                $rootScope = null;
                AdManagerEmbedState = null;
            });

            it('should exist', function() {
                expect(AdManagerEmbedState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result, success,
                    minireel, params;

                beforeEach(function() {
                    params = {
                        minireelId: 'e-9b5c930e646069'
                    };

                    success = jasmine.createSpy('model() success');
                    minireel = {
                        id: params.minireelId,
                        data: {}
                    };

                    spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));

                    $rootScope.$apply(function() {
                        result = AdManagerEmbedState.model(params)
                            .then(success);
                    });
                });

                it('should find the minireel', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('experience', params.minireelId);
                });

                it('should resolve to the minireel', function() {
                    expect(success).toHaveBeenCalledWith(minireel);
                });
            });
        });
    });
}());
