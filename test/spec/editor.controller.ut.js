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
                MiniReelService,
                ConfirmDialogService,
                AppCtrl,
                EditorCtrl;

            var lastCreatedCard;

            var cModel;

            beforeEach(function() {
                cModel = {
                    id: 'e-53ae461c63b015',
                    data: {
                        mode: 'lightbox',
                        collateral: {
                            splash: null
                        },
                        deck: [
                            {
                                id: 'rc-e91e76c0ce486a',
                                type: 'ad'
                            },
                            {
                                id: 'rc-2ba11eda2b2300',
                                type: 'video'
                            },
                            {
                                id: 'rc-968f823aa61637',
                                type: 'videoBallot'
                            },
                            {
                                id: 'rc-fbccf72de29c63',
                                type: 'recap'
                            }
                        ]
                    }
                };

                module('c6.mrmaker', function($provide) {
                    $provide.decorator('MiniReelService', function($delegate) {
                        var createCard = $delegate.createCard;

                        $delegate.createCard = jasmine.createSpy('MiniReelService.createCard()')
                            .and.callFake(function() {
                                lastCreatedCard = createCard.apply($delegate, arguments);

                                return lastCreatedCard;
                            });

                        return $delegate;
                    });
                });

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
                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    $timeout = $injector.get('$timeout');
                    cinema6 = $injector.get('cinema6');
                    $log = $injector.get('$log');
                    $log.context = function() { return $log; };

                    $scope = $rootScope.$new();
                    AppCtrl = $scope.AppCtrl = {
                        sendPageView : jasmine.createSpy('AppCtrl.sendPageView'),
                        sendPageEvent : jasmine.createSpy('AppCtrl.sendPageEvent'),
                        config: null,
                        user: null
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
                describe('splashSrc', function() {
                    describe('if collateral.splash is null', function() {
                        beforeEach(function() {
                            cModel.data.collateral.splash = null;
                        });

                        it('should be null', function() {
                            expect(EditorCtrl.splashSrc).toBeNull();
                        });
                    });

                    describe('if collateral.splash is not null', function() {
                        beforeEach(function() {
                            cModel.data.collateral.splash = '/collateral/foo.jpg';
                        });

                        it('should be the splash source with the cacheBuster', function() {
                            [1, 2, 3, 4, 5].forEach(function(num) {
                                EditorCtrl.cacheBuster = num;

                                expect(EditorCtrl.splashSrc).toBe(cModel.data.collateral.splash + '?cb=' + num);
                            });
                        });
                    });
                });

                describe('cardLimits', function() {
                    it('should have a liberal initial value', function() {
                        expect(EditorCtrl.cardLimits).toEqual({
                            copy: Infinity
                        });
                    });

                    it('should return references to the same object', function() {
                        expect(EditorCtrl.cardLimits).toBe(EditorCtrl.cardLimits);
                    });

                    describe('when the config is available', function() {
                        function setMode(mode) {
                            cModel.data.mode = mode;
                        }

                        beforeEach(function() {
                            AppCtrl.config = {
                                data: {
                                    modes: [
                                        {
                                            modes: [
                                                {
                                                    name: 'Lightbox',
                                                    value: 'lightbox',
                                                    limits: {}
                                                },
                                                {
                                                    name: 'Lightbox, with Companion Ad',
                                                    value: 'lightbox-ads',
                                                    limits: {}
                                                }
                                            ]
                                        },
                                        {
                                            modes: [
                                                {
                                                    name: 'Light Text',
                                                    value: 'light',
                                                    limits: {
                                                        copy: 200
                                                    }
                                                },
                                                {
                                                    name: 'Heavy Text',
                                                    value: 'full',
                                                    limits: {
                                                        copy: 420
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            };
                        });

                        it('should set the limits based off of the mode', function() {
                            setMode('full');
                            expect(EditorCtrl.cardLimits).toEqual({
                                copy: 420
                            });

                            setMode('light');
                            expect(EditorCtrl.cardLimits).toEqual({
                                copy: 200
                            });

                            setMode('lightbox');
                            expect(EditorCtrl.cardLimits).toEqual({
                                copy: Infinity
                            });

                            setMode('lightbox-ads');
                            expect(EditorCtrl.cardLimits).toEqual({
                                copy: Infinity
                            });
                        });
                    });
                });

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

                describe('cacheBuster', function() {
                    it('should be 0', function() {
                        expect(EditorCtrl.cacheBuster).toBe(0);
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

                describe('bustCache()', function() {
                    it('should increment this.cacheBuster', function() {
                        [1, 2, 3, 4, 5].forEach(function(num) {
                            EditorCtrl.bustCache();

                            expect(EditorCtrl.cacheBuster).toBe(num);
                        });
                    });
                });

                describe('errorForCard(card)', function() {
                    function setLimits(limits) {
                        Object.defineProperty(EditorCtrl, 'cardLimits', {
                            value: limits
                        });
                    }

                    function error() {
                        return EditorCtrl.errorForCard.apply(EditorCtrl, arguments);
                    }

                    it('should be a friendly message if the card\'s note does not exceed the limit on copy', function() {
                        setLimits({ copy: 10 });
                        expect(error({ note: 'Hello' })).toBeNull();

                        expect(error({ note: '12345678901' })).toBe('Character limit exceeded (+1).');
                        expect(error({ note: null })).toBeNull();

                        setLimits({ copy: 20 });
                        expect(error({ note: '1234567890123456789012345' })).toBe('Character limit exceeded (+5).');
                    });
                });

                describe('canDeleteCard(card)', function() {
                    var card;

                    ['video', 'videoBallot'].forEach(function(type) {
                        describe('for a ' + type + ' card', function() {
                            beforeEach(function() {
                                card = MiniReelService.createCard(type);
                            });

                            it('should be true', function() {
                                expect(EditorCtrl.canDeleteCard(card)).toBe(true);
                            });
                        });
                    });

                    ['recap'].forEach(function(type) {
                        describe(' for a ' + type + ' card', function() {
                            beforeEach(function() {
                                card = MiniReelService.createCard(type);
                            });

                            it('should be false', function() {
                                expect(EditorCtrl.canDeleteCard(card)).toBe(false);
                            });
                        });
                    });

                    describe('for an ad card', function() {
                        beforeEach(function() {
                            card = MiniReelService.createCard('ad');

                            EditorCtrl.model.data.deck.unshift(card);
                        });

                        it('should be false if the app config has not been loaded', function() {
                            expect(EditorCtrl.canDeleteCard(card)).toBe(false);
                        });

                        it('should be true if the minAdCount is undefined', function() {
                            AppCtrl.user = {
                                org: {}
                            };

                            expect(EditorCtrl.canDeleteCard(card)).toBe(true);
                        });

                        it('should be true if the number of ad cards in the deck is greater than the org\'s min ad count', function() {
                            AppCtrl.user = {
                                org: {
                                    minAdCount: 2
                                }
                            };

                            expect(EditorCtrl.canDeleteCard(card)).toBe(false);

                            EditorCtrl.model.data.deck.unshift(MiniReelService.createCard('ad'));
                            expect(EditorCtrl.canDeleteCard(card)).toBe(true);
                        });
                    });
                });

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

                    it('should transition to the editor.editCard state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor.newCard', {
                            insertionIndex: 3
                        });
                    });
                });

                describe('deleteCard(card)', function() {
                    var card;

                    beforeEach(function() {
                        card = cModel.data.deck[1];

                        EditorCtrl.deleteCard(card);
                    });

                    it('should not remove the card from the deck', function() {
                        expect(cModel.data.deck.length).toBe(4);
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
                            expect(cModel.data.deck.length).toBe(3);
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
                        spyOn(EditorCtrl, 'bustCache');

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

                        it('should bust the cache', function() {
                            expect(EditorCtrl.bustCache).toHaveBeenCalled();
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
