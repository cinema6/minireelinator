(function() {
    'use strict';

    define(['app', 'minireel/editor'], function(appModule, editorModule) {
        describe('EditCardState', function() {
            var EditCardState,
                $rootScope,
                $injector,
                MiniReelService,
                EditorService,
                c6State,
                $q;

            var minireel;

            beforeEach(function() {
                minireel = {
                    data: {
                        displayAdSource: 'publisher-cinema6',
                        videoAdSource: 'publisher',
                        deck: [
                            {
                                id: 'rc-19437ee278914e'
                            },
                            {
                                id: 'rc-4d812b28c4292b'
                            },
                            {
                                id: 'rc-036a2e0b648f3d'
                            },
                            {
                                id: 'rc-16044f64448e0f'
                            }
                        ]
                    }
                };

                module(editorModule.name, function($provide) {
                    $provide.value('playerMeta', {});
                });

                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    MiniReelService = $injector.get('MiniReelService');
                    EditorService = $injector.get('EditorService');
                    Object.defineProperty(EditorService.state, 'minireel', {
                        value: minireel
                    });

                    c6State = $injector.get('c6State');
                });

                EditCardState = c6State.get('MR:EditCard');
            });

            afterAll(function() {
                EditCardState = null;
                $rootScope = null;
                $injector = null;
                MiniReelService = null;
                EditorService = null;
                c6State = null;
                $q = null;
                minireel = null;
            });

            it('should exist', function() {
                expect(EditCardState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var params, model;

                beforeEach(function() {
                    params = {
                        cardId: 'rc-036a2e0b648f3d'
                    };

                    model = EditCardState.model(params);
                });

                it('should use the c6StateParams id to find the card in the deck of the editor\'s model', function() {
                    var card = minireel.data.deck[2];

                    expect(model).toEqual(card);
                    expect(model).not.toBe(card);
                });
            });

            describe('afterModel()', function() {
                var goodModel, badModel;

                beforeEach(function() {
                    goodModel = {
                        id: 'rc-036a2e0b648f3d',
                        type: 'video'
                    };

                    badModel = {
                        id: 'rc-036a2e0b648f3d',
                        type: 'links'
                    };

                    spyOn(c6State, 'goTo');
                });

                it('should do nothing if the card type is acceptable', function() {
                    expect(EditCardState.afterModel(goodModel)).toBeUndefined();
                    expect(c6State.goTo).not.toHaveBeenCalled();
                });

                it('should return a rejected promise and go to the editor state if card type is not acceptable', function() {
                    var fail = jasmine.createSpy('fail');

                    $rootScope.$apply(function() {
                        EditCardState.afterModel(badModel).catch(fail);
                    });
                    expect(fail).toHaveBeenCalled();
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', null, {}, true);
                });

                describe('if the model is falsy', function() {
                    var failure;

                    beforeEach(function() {
                        failure = jasmine.createSpy('failure()');
                        $rootScope.$apply(function() {
                            EditCardState.afterModel(null).catch(failure);
                        });
                    });

                    it('should reject the promise', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.any(String));
                    });

                    it('should redirect back to the editor', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', null, {}, true);
                    });
                });

                describe('if the card is sponsored', function() {
                    var failure;

                    beforeEach(function() {
                        failure = jasmine.createSpy('failure()');
                        badModel = MiniReelService.createCard('video');
                        badModel.sponsored = true;

                        $rootScope.$apply(function() {
                            EditCardState.afterModel(badModel).catch(failure);
                        });
                    });

                    it('should reject the promise', function() {
                        expect(failure).toHaveBeenCalled();
                    });

                    it('should redirect back to the editor', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', null, {}, true);
                    });
                });
            });
        });
    });
}());
