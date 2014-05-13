(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorController', function() {
            var $rootScope,
                $scope,
                $childScope,
                $controller,
                $q,
                $timeout,
                $log,
                c6State,
                cinema6,
                EditorService,
                ConfirmDialogService,
                AppCtrl,
                EditorCtrl;

            var cModel;

            beforeEach(function() {
                cModel = {
                    id: 'e-53ae461c63b015',
                    data: {
                        mode: 'lightbox',
                        deck: [
                            {
                                id: 'rc-e91e76c0ce486a'
                            },
                            {
                                id: 'rc-2ba11eda2b2300'
                            },
                            {
                                id: 'rc-968f823aa61637'
                            }
                        ]
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');
                    $q = $injector.get('$q');
                    EditorService = $injector.get('EditorService');
                    EditorService.state = {
                        dirty: false,
                        inFlight: false
                    };
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    $timeout = $injector.get('$timeout');
                    cinema6 = $injector.get('cinema6');
                    $log = $injector.get('$log');
                    $log.context = function() { return $log; };

                    $scope = $rootScope.$new();
                    AppCtrl = $scope.AppCtrl = {
                        sendPageView : jasmine.createSpy('AppCtrl.sendPageView'),
                        sendPageEvent : jasmine.createSpy('AppCtrl.sendPageEvent'),
                        config: null
                    };
                    $childScope = $scope.$new();
                    $scope.$apply(function() {
                        EditorCtrl = $controller('EditorController', { $scope: $scope, cModel: cModel });
                        EditorCtrl.model = cModel;
                    });
                });

                spyOn(ConfirmDialogService, 'display');
                spyOn(ConfirmDialogService, 'close');
            });

            it('should exist', function() {
                expect(EditorCtrl).toEqual(jasmine.any(Object));
            });
/*
            describe('tracking', function(){
                it('should send a pageview when loaded',function(){
                    expect($scope.AppCtrl.sendPageView)
                        .toHaveBeenCalledWith({page:'editor',title:'Editor'});
                });
            });
*/
            describe('properties', function() {
                describe('minireelState', function() {
                    it('should be a reference to the EditorService\'s state', function() {
                        expect(EditorCtrl.minireelState).toBe(EditorService.state);
                    });
                });

                describe('preview', function() {
                    it('should be false', function() {
                        expect(EditorCtrl.preview).toBe(false);
                    });
                });

                describe('editTitle', function() {
                    it('should be false', function() {
                        expect(EditorCtrl.editTitle).toBe(false);
                    });
                });

                describe('dismissDirtyWarning', function() {
                    it('should be false', function() {
                        expect(EditorCtrl.dismissDirtyWarning).toBe(false);
                    });
                });

                describe('prettyMode', function() {
                    describe('if the AppCtrl has no config', function() {
                        it('should be null', function() {
                            expect(EditorCtrl.prettyMode).toBeNull();
                        });
                    });

                    describe('if the AppCtrl has a config', function() {
                        beforeEach(function() {
                            AppCtrl.config = {
                                data: {
                                    modes: [
                                        {
                                            modes: [
                                                {
                                                    name: 'Lightbox',
                                                    value: 'lightbox'
                                                },
                                                {
                                                    name: 'Lightbox, with Companion Ad',
                                                    value: 'lightbox-ads'
                                                }
                                            ]
                                        },
                                        {
                                            modes: [
                                                {
                                                    name: 'Light Text',
                                                    value: 'light'
                                                },
                                                {
                                                    name: 'Heavy Text',
                                                    value: 'full'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            };
                        });

                        it('should find the "name" for the mode\'s value', function() {
                            expect(EditorCtrl.prettyMode).toBe('Lightbox');

                            cModel.data.mode = 'lightbox-ads';
                            expect(EditorCtrl.prettyMode).toBe('Lightbox, with Companion Ad');

                            cModel.data.mode = 'light';
                            expect(EditorCtrl.prettyMode).toBe('Light Text');

                            cModel.data.mode = 'full';
                            expect(EditorCtrl.prettyMode).toBe('Heavy Text');
                        });
                    });
                });
            });

            describe('methods', function() {
                function assertDialogPresented() {
                    expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                        prompt: jasmine.any(String),
                        affirm: jasmine.any(String),
                        cancel: jasmine.any(String),
                        onAffirm: jasmine.any(Function),
                        onCancel: jasmine.any(Function)
                    });
                }

                function dialog() {
                    return ConfirmDialogService.display.calls.mostRecent().args[0];
                }

                describe('publish()', function() {
                    var publishDeferred;

                    beforeEach(function() {
                        publishDeferred = $q.defer();

                        spyOn(EditorService, 'publish')
                            .and.returnValue(publishDeferred.promise);

                        EditorCtrl.publish();
                    });

                    it('should not publish the minireel', function() {
                        expect(EditorService.publish).not.toHaveBeenCalled();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should publish the minireel', function() {
                            expect(EditorService.publish).toHaveBeenCalled();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });
                });

                describe('makePrivate()', function() {
                    var unpublishDeferred;

                    beforeEach(function() {
                        unpublishDeferred = $q.defer();

                        spyOn(EditorService, 'unpublish')
                            .and.returnValue(unpublishDeferred.promise);

                        EditorCtrl.makePrivate();
                    });

                    it('should not unpublish the minireel', function() {
                        expect(EditorService.unpublish).not.toHaveBeenCalled();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should unpublish the minireel', function() {
                            expect(EditorService.unpublish).toHaveBeenCalled();
                        });
                    });
                });

                describe('editCard(card)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        EditorCtrl.editCard({ id: 'rc-c98312239510db' });
                    });

                    it('should transition to the editor.editCard.video state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.editCard', { cardId: 'rc-c98312239510db' });
                    });
                });

                describe('newCard(insertionIndex)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        EditorCtrl.newCard(3);
                    });

                    it('should transition to the editor.newCard.type state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.newCard', { insertionIndex: 3 });
                    });
                });

                describe('deleteCard(card)', function() {
                    var card;

                    beforeEach(function() {
                        card = cModel.data.deck[1];

                        EditorCtrl.deleteCard(card);
                    });

                    it('should not remove the card from the deck', function() {
                        expect(cModel.data.deck.length).toBe(3);
                        expect(cModel.data.deck).toContain(card);
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should remove the provided card from the deck', function() {
                            expect(cModel.data.deck.length).toBe(2);
                            expect(cModel.data.deck).not.toContain(card);
                        });
                    });
                });

                describe('deleteMinireel()', function() {
                    beforeEach(function() {
                        EditorCtrl.deleteMinireel();
                    });

                    it('should display a confirmation', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        var eraseDeferred;

                        beforeEach(function() {
                            eraseDeferred = $q.defer();

                            spyOn(c6State, 'goTo');
                            spyOn(EditorService, 'erase').and.returnValue(eraseDeferred.promise);

                            dialog().onAffirm();
                        });

                        it('should erase the minireel', function() {
                            expect(EditorService.erase).toHaveBeenCalled();
                        });

                        it('should close the confirmation', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should go back to the manager after the deletion', function() {
                            expect(c6State.goTo).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                eraseDeferred.resolve(null);
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('manager');
                        });
                    });
                });

                describe('previewMode(card)', function() {
                    var session;

                    beforeEach(function() {
                        session = {
                            ping: jasmine.createSpy('session.ping()')
                        };

                        spyOn($scope, '$broadcast');
                        spyOn(cinema6, 'getSession').and.returnValue($q.when(session));
                    });
                    it('should set preview mode to true', function() {
                        EditorCtrl.previewMode();
                        expect(EditorCtrl.preview).toBe(true);
                    });

                    it('should ping the parent with the "stateChange" event', function() {
                        $scope.$apply(function() {
                            EditorCtrl.previewMode();
                        });

                        expect(session.ping).toHaveBeenCalledWith('stateChange', { name: 'editor.preview' });
                    });

                    describe('without a card', function() {
                        it('should $broadcast the experience without a card', function() {
                            EditorCtrl.previewMode();
                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[1]).toBe(cModel);
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(undefined);
                        });
                    });

                    describe('with a card', function() {
                        it('should $broadcast the experience with a card', function() {
                            var card = {};
                            EditorCtrl.previewMode(card);
                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[1]).toBe(cModel);
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(card);
                        });
                    });
                });

                describe('closePreview()', function() {
                    it('should set preview mode to false', function() {
                        spyOn($scope, '$broadcast');
                        EditorCtrl.closePreview();
                        expect(EditorCtrl.preview).toBe(false);
                        expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:reset');
                    });
                });

                describe('save()', function() {
                    var success;

                    beforeEach(function() {
                        success = jasmine.createSpy('EditorCtrl.save() success');

                        EditorCtrl.dismissDirtyWarning = true;
                        spyOn(EditorService, 'sync').and.returnValue($q.when(cModel));

                        $scope.$apply(function() {
                            EditorCtrl.save().then(success);
                        });
                    });

                    it('should call MiniReelService.save()', function() {
                        expect(EditorService.sync).toHaveBeenCalled();

                        EditorCtrl.save();
                        expect(EditorService.sync.calls.count()).toBe(2);
                    });

                    describe('when the save completes', function() {
                        beforeEach(function() {
                            $rootScope.$digest();
                        });

                        it('should set dismissDirtyWarning to false', function() {
                            expect(EditorCtrl.dismissDirtyWarning).toBe(false);
                        });

                        it('should resolve the promise', function() {
                            expect(success).toHaveBeenCalledWith(cModel);
                        });
                    });
                });

                describe('backToDashboard()', function() {
                    function assertDialogPresented() {
                        expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                            prompt: jasmine.any(String),
                            message: jasmine.any(String),
                            affirm: jasmine.any(String),
                            cancel: jasmine.any(String),
                            onAffirm: jasmine.any(Function),
                            onCancel: jasmine.any(Function)
                        });
                    }

                    beforeEach(function() {
                        spyOn(c6State, 'goTo');
                        spyOn(EditorCtrl,'save');
                    });

                    describe('when status is active and the minireel is dirty', function() {
                        beforeEach(function() {
                            EditorCtrl.minireelState.dirty = true;
                            EditorCtrl.model.status = 'active';
                            EditorCtrl.backToDashboard();
                        });

                        it('should display a confirmation dialog', assertDialogPresented);

                        describe('when canceled', function() {
                            it('should close the dialog', function() {
                                dialog().onCancel();
                                expect(EditorCtrl.save).toHaveBeenCalled();
                                expect(c6State.goTo).toHaveBeenCalledWith('manager');
                                expect(ConfirmDialogService.close).toHaveBeenCalled();
                            });
                        });

                        describe('when confirmed', function() {
                            it('should goTo manager state', function() {
                                dialog().onAffirm();
                                expect(EditorCtrl.save).not.toHaveBeenCalled();
                                expect(c6State.goTo).toHaveBeenCalledWith('manager');
                                expect(ConfirmDialogService.close).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when status is pending or not dirty', function() {
                        it('should goTo manager state', function() {
                            EditorCtrl.minireelState.dirty = false;
                            EditorCtrl.model.status = 'active';
                            EditorCtrl.backToDashboard();

                            expect(c6State.goTo).toHaveBeenCalledWith('manager');

                            EditorCtrl.minireelState.dirty = true;
                            EditorCtrl.model.status = 'pending';
                            EditorCtrl.backToDashboard();

                            expect(c6State.goTo).toHaveBeenCalledWith('manager');

                            expect(ConfirmDialogService.display).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('confirmSave()', function() {
                    beforeEach(function() {
                        spyOn(EditorCtrl,'save');

                        EditorCtrl.confirmSave();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('when dialog is confirmed', function() {
                        it('should save and close the dialog', function() {
                            dialog().onAffirm();
                            expect(EditorCtrl.save).toHaveBeenCalled();
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('when dialog is canceled', function() {
                        it('should close the dialog', function() {
                            dialog().onCancel();
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('events', function() {
                describe('addCard', function() {
                    var card;

                    beforeEach(function() {
                        card = {};

                        $childScope.$emit('addCard', card, 1);
                    });

                    it('should insert the card into the deck at the provided index', function() {
                        var deck = cModel.data.deck;

                        expect(deck[1]).toBe(card);
                    });
                });

                describe('updateCard', function() {
                    var card;

                    beforeEach(function() {
                        card = {
                            id: 'rc-2ba11eda2b2300',
                            title: 'foo',
                            note: 'bar',
                            data: {
                                videoid:'abc',
                                service: 'vimeo'
                            }
                        };

                        $scope.$emit('updateCard', card);
                    });

                    it('should copy the properties of the provided card to the actual card in the deck', function() {
                        expect(cModel.data.deck[1]).toEqual(card);
                        expect(cModel.data.deck[1]).not.toBe(card);
                    });
                });

                describe('$destroy', function() {
                    var saveDeferred;

                    beforeEach(function() {
                        saveDeferred = $q.defer();

                        spyOn(EditorService, 'close').and.callThrough();
                        spyOn(EditorCtrl, 'save').and.returnValue(saveDeferred.promise);

                        $scope.$apply(function() {
                            $scope.$emit('$destroy');
                        });
                    });

                    it('should save the minireel', function() {
                        expect(EditorCtrl.save).toHaveBeenCalled();
                    });

                    describe('after the save finishes', function() {
                        beforeEach(function() {
                            expect(EditorService.close).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                saveDeferred.resolve(cModel);
                            });
                        });

                        it('should close the current MiniReel', function() {
                            expect(EditorService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the minireel is active', function() {
                        beforeEach(function() {
                            EditorCtrl.save.calls.reset();

                            cModel.status = 'active';

                            $scope.$apply(function() {
                                $scope.$emit('$destroy');
                            });
                        });

                        it('should not save the minireel', function() {
                            expect(EditorCtrl.save).not.toHaveBeenCalled();
                        });

                        it('should still close the minireel', function() {
                            expect(EditorService.close).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('mode and autoplay', function() {
                    it('should broadcast mrPreview:updateMode and send experience', function() {
                        spyOn($scope, '$broadcast');
                        $scope.$digest();
                        EditorCtrl.model.data.mode = 'full';
                        $scope.$digest();

                        expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateMode');
                        expect($scope.$broadcast.calls.argsFor(0)[1].data.mode).toEqual('full');

                        EditorCtrl.model.data.autoplay = true;
                        $scope.$digest();

                        expect($scope.$broadcast.calls.argsFor(1)[0]).toBe('mrPreview:updateMode');
                        expect($scope.$broadcast.calls.argsFor(1)[1].data.autoplay).toBe(true);
                    });
                });

                describe('this.minireelState.dirty', function() {
                    beforeEach(function() {
                        spyOn(EditorCtrl, 'save');
                    });

                    it('should save the minireel (debounced) every time it is true', function() {
                        $scope.$apply(function() {
                            EditorCtrl.minireelState.dirty = true;
                        });
                        $timeout.flush();
                        expect(EditorCtrl.save).toHaveBeenCalled();

                        $scope.$apply(function() {
                            EditorCtrl.minireelState.dirty = false;
                        });
                        expect(function() {
                            $timeout.flush();
                        }).toThrow();

                        $scope.$apply(function() {
                            EditorCtrl.minireelState.dirty = true;
                        });
                        $timeout.flush();
                        expect(EditorCtrl.save.calls.count()).toBe(2);
                    });

                    describe('if the minireel is active', function() {
                        beforeEach(function() {
                            EditorCtrl.save.calls.reset();

                            $scope.$apply(function() {
                                EditorCtrl.minireelState.dirty = true;
                            });
                            cModel.status = 'active';
                        });

                        it('should not autosave', function() {
                            $timeout.flush();
                            expect(EditorCtrl.save).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                EditorCtrl.minireelState.dirty = false;
                            });
                            $scope.$apply(function() {
                                EditorCtrl.minireelState.dirty = true;
                            });
                            expect(function() {
                                $timeout.flush();
                            }).toThrow();
                            expect(EditorCtrl.save).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
