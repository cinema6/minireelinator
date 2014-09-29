(function() {
    'use strict';

    define(['app', 'minireel/editor'], function(appModule, editorModule) {
        describe('EditorState', function() {
            var $injector,
                playerMeta,
                EditorState,
                $rootScope,
                $q,
                cinema6,
                EditorService,
                c6State;

            var minireel = {
                    id: 'e-9990920583a712',
                    processed: false
                },
                editorMinireel = {
                    id: 'e-9990920583a712',
                    processed: true
                };

            beforeEach(function() {
                module(editorModule.name, function($provide) {
                    $provide.value('playerMeta', {
                        ensureFulfillment: jasmine.createSpy('playerMeta.ensureFulfillment()')
                    });
                });

                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    playerMeta = $injector.get('playerMeta');
                    c6State = $injector.get('c6State');
                    EditorService = $injector.get('EditorService');

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

                it('should resolve to the minireel', function() {
                    expect(success).toHaveBeenCalledWith(minireel);
                });
            });

            describe('afterModel()', function() {
                beforeEach(function() {
                    spyOn(EditorService, 'open').and.returnValue(editorMinireel);

                    EditorState.afterModel(minireel);
                });

                it('should open the minireel for editing', function() {
                    expect(EditorService.open).toHaveBeenCalledWith(minireel);
                });
            });
        });
    });
}());
