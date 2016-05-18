(function() {
    'use strict';

    define(['app', 'minireel/editor'], function(appModule, editorModule) {
        describe('EditorState', function() {
            var $injector,
                playerMeta,
                EditorState,
                $rootScope,
                $q,
                $location,
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
                    $location = $injector.get('$location');
                    cinema6 = $injector.get('cinema6');
                    playerMeta = $injector.get('playerMeta');
                    c6State = $injector.get('c6State');
                    EditorService = $injector.get('EditorService');

                    EditorState = c6State.get('MR:Editor');
                });
            });

            afterAll(function() {
                $injector = null;
                playerMeta = null;
                EditorState = null;
                $rootScope = null;
                $q = null;
                $location = null;
                cinema6 = null;
                EditorService = null;
                c6State = null;
                minireel = null;
                editorMinireel = null;
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
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(EditorService, 'open').and.returnValue($q.when(editorMinireel));

                    $rootScope.$apply(function() {
                        EditorState.afterModel(minireel, {}).then(success, failure);
                    });
                });

                it('should open the minireel for editing', function() {
                    expect(EditorService.open).toHaveBeenCalledWith(minireel, null);
                });

                it('should resolve to the editor minireel', function() {
                    expect(success).toHaveBeenCalledWith(editorMinireel);
                });

                describe('if there is a campaign id in the params', function() {
                    var id, campaign;

                    beforeEach(function() {
                        EditorService.open.calls.reset();
                        success.calls.reset();

                        id = 'cam-7bb1140874bc78';

                        cinema6.db.push('campaign', id, {
                            id: id,
                            advertiser: cinema6.db.create('advertiser', {
                                id: 'a-fd495306658e0e'
                            })
                        });

                        $rootScope.$apply(function() {
                            cinema6.db.find('campaign', id).then(function(_campaign) {
                                campaign = _campaign;
                            });
                        });

                        $rootScope.$apply(function() {
                            EditorState.afterModel(minireel, {
                                campaign: id
                            }).then(success, failure);
                        });
                    });

                    it('should open the MiniReel with its campaign', function() {
                        expect(EditorService.open).toHaveBeenCalledWith(minireel, campaign);
                    });

                    it('should resolve to the editor minireel', function() {
                        expect(success).toHaveBeenCalledWith(editorMinireel);
                    });
                });
            });
        });
    });
}());
