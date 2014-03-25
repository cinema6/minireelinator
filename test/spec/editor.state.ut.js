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

            var c6StateParams,
                MiniReelService;

            var minireel = {
                id: 'e-9990920583a712',
                processed: true
            };

            beforeEach(function() {
                module('c6.state', function($provide) {
                    $provide.value('c6StateParams', {});
                });

                module('c6.mrmaker', function($provide) {
                    $provide.service('MiniReelService', function($q) {
                        this.open = jasmine.createSpy('MiniReelService.open()')
                            .and.returnValue($q.when(minireel));
                    });
                });

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    c6State = $injector.get('c6State');

                    c6StateParams = $injector.get('c6StateParams');
                    MiniReelService = $injector.get('MiniReelService');

                    EditorState = c6State.get('editor');
                });
            });

            it('should exist', function() {
                expect(EditorState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('model() success');

                    c6StateParams.id = 'e-9990920583a712';

                    $rootScope.$apply(function() {
                        result = $injector.invoke(EditorState.model);
                        result.then(success);
                    });
                });

                it('should return a promise', function() {
                    expect(result.then).toEqual(jasmine.any(Function));
                });

                it('should "open" the minireel for editing', function() {
                    expect(MiniReelService.open).toHaveBeenCalledWith('e-9990920583a712');
                });

                it('should resolve to the transpiled minireel', function() {
                    expect(success).toHaveBeenCalledWith(minireel);
                });
            });
        });
    });
}());
