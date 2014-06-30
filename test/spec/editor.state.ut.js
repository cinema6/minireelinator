(function() {
    'use strict';

    define(['app'], function() {
        describe('EditorState', function() {
            var $injector,
                EditorState,
                $rootScope,
                $q,
                cinema6,
                c6State;

            var minireel = {
                id: 'e-9990920583a712',
                processed: false
            };

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    c6State = $injector.get('c6State');

                    EditorState = c6State.get('MR:Editor');
                });
            });

            it('should exist', function() {
                expect(EditorState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result,
                    success,
                    params;

                beforeEach(function() {
                    spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));

                    success = jasmine.createSpy('model() success');

                    params = {
                        minireelId: 'e-9990920583a712'
                    };

                    $rootScope.$apply(function() {
                        result = EditorState.model(params);
                        result.then(success);
                    });
                });

                it('should return a promise', function() {
                    expect(result.then).toEqual(jasmine.any(Function));
                });

                it('should resolve to the transpiled minireel', function() {
                    expect(success).toHaveBeenCalledWith(minireel);
                });
            });
        });
    });
}());
