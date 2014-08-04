(function() {
    'use strict';

    define(['minireel/editor','app'], function(editorModule, appModule) {
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
                CollateralService,
                VideoErrorService,
                MiniReelCtrl,
                PortalCtrl,
                EditorCtrl;

            var lastCreatedCard;

            var cModel;

            beforeEach(function() {
                cModel = {
                    id: 'e-53ae461c63b015',
                    data: {
                        branding: 'urbantimes',
                        mode: 'lightbox',
                        collateral: {
                            splash: null
                        },
                        splash: {
                            source: 'generated'
                        },
                        deck: [
                            {
                                id: 'rc-e91e76c0ce486a',
                                type: 'ad',
                                data: {}
                            },
                            {
                                id: 'rc-2ba11eda2b2300',
                                type: 'video',
                                data: {
                                    service: 'youtube',
                                    videoid: 'X-CjbR1GAmU'
                                }
                            },
                            {
                                id: 'rc-968f823aa61637',
                                type: 'videoBallot',
                                data: {
                                    service: 'vimeo',
                                    videoid: '84687115'
                                }
                            },
                            {
                                id: 'rc-fbccf72de29c63',
                                type: 'recap',
                                data: {}
                            }
                        ]
                    }
                };

                module(appModule.name);
                module(editorModule.name, function($provide) {
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
                        inFlight: false,
                        minireel: null
                    };
                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    CollateralService = $injector.get('CollateralService');
                    VideoErrorService = $injector.get('VideoErrorService');
                    $timeout = $injector.get('$timeout');
                    cinema6 = $injector.get('cinema6');
                    $log = $injector.get('$log');
                    $log.context = function() { return $log; };

                    $scope = $rootScope.$new();
                    PortalCtrl = $scope.PortalCtrl = {
                        model: {
                            org: {}
                        }
                    };
                    MiniReelCtrl = $scope.MiniReelCtrl = {
                        sendPageView : jasmine.createSpy('MiniReelCtrl.sendPageView'),
                        sendPageEvent : jasmine.createSpy('MiniReelCtrl.sendPageEvent'),
                        branding: null,
                        model: {
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
                        }
                    };
                    $childScope = $scope.$new();
                    $scope.$apply(function() {
                        EditorCtrl = $controller('EditorController', { $scope: $scope });
                        EditorCtrl.initWithModel(cModel);
                    });
                });

                spyOn(ConfirmDialogService, 'display');
                spyOn(ConfirmDialogService, 'close');
            });

            it('should exist', function() {
                expect(EditorCtrl).toEqual(jasmine.any(Object));
            });

            it('should set it\'s model to the EditorService\'s minireel', function() {
                expect(EditorCtrl.model).toBe(cModel);
            });

            it('should set the MiniReelCtrl\'s branding to the minireel\'s branding', function() {
                expect(MiniReelCtrl.branding).toBe(cModel.data.branding);
            });
/*
            describe('tracking', function(){
                it('should send a pageview when loaded',function(){
                    expect($scope.MiniReelCtrl.sendPageView)
                        .toHaveBeenCalledWith({page:'editor',title:'Editor'});
                });
            });
*/
            describe('properties', function() {
                describe('videoErrors', function() {
                    var VideoError,
                        result;

                    beforeEach(function() {
                        VideoError = VideoErrorService.getErrorFor().constructor;

                        spyOn(VideoErrorService, 'getErrorFor').and.callThrough();

                        result = EditorCtrl.videoErrors;
                    });

                    it('should be an array of video errors for each card', function() {
                        expect(result).toEqual(jasmine.any(Array));
                        expect(result.length).toBe(cModel.data.deck.length);

                        result.forEach(function(error, index) {
                            var card = cModel.data.deck[index];

                            expect(error).toEqual(jasmine.any(VideoError));
                            expect(VideoErrorService.getErrorFor).toHaveBeenCalledWith(card.data.service, card.data.videoid);
                        });
                    });
                });

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

                    describe('if collateral.splash is a blob', function() {
                        beforeEach(function() {
                            cModel.data.collateral.splash = 'blob:http://www.foo.com/image.jpg';
                        });

                        it('should be the splash without the cacheBuster', function() {
                            expect(EditorCtrl.splashSrc).toBe(cModel.data.collateral.splash);
                        });
                    });
                });

                describe('cardLimits', function() {
                    function setMode(mode) {
                        cModel.data.mode = mode;
                    }

                    it('should return references to the same object', function() {
                        expect(EditorCtrl.cardLimits).toBe(EditorCtrl.cardLimits);
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

                    it('should be a message if a particular card has an associated error', function() {
                        var deck = cModel.data.deck,
                            errors = EditorCtrl.videoErrors;

                        expect(error(deck[0])).toBeNull();
                        errors[0].present = true;
                        errors[0].code = 403;
                        expect(error(deck[0])).toBe('Video not embeddable.');

                        expect(error(deck[1])).toBeNull();
                        errors[1].present = true;
                        errors[1].code = 404;
                        expect(error(deck[1])).toBe('Video not found.');

                        expect(error(deck[2])).toBeNull();
                        errors[2].present = true;
                        errors[2].message = 'An unknown error occurred.';
                        expect(error(deck[2])).toBe(errors[2].message);
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

                        it('should be true if the minAdCount is undefined', function() {
                            PortalCtrl.model.org = {};

                            expect(EditorCtrl.canDeleteCard(card)).toBe(true);
                        });

                        it('should be true if the number of ad cards in the deck is greater than the org\'s min ad count', function() {
                            PortalCtrl.model.org = {
                                minAdCount: 2
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

                describe('newCard(insertionIndex)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        EditorCtrl.newCard(3);
                    });

                    xit('should transition to the MR:NewCard state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:NewCard', null, {
                            insertAt: 3
                        });
                    });

                    it('should create a new videoBallot card', function() {
                        expect(MiniReelService.createCard).toHaveBeenCalledWith('videoBallot');
                    });

                    it('should transition to the editor.editCard state with the card and the insertionIndex', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:EditCard', [lastCreatedCard], {
                            insertAt: 3
                        });
                    });
                });

                describe('editCard(card)', function() {
                    var card;

                    beforeEach(function() {
                        spyOn(c6State, 'goTo');

                        card = {
                            id: 'rc-ed21efd869ad2b'
                        };

                        EditorCtrl.editCard(card);
                    });

                    it('should go to the edit card state with a copy of the card', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:EditCard', [card]);
                        expect(c6State.goTo.calls.mostRecent().args[1][0]).not.toBe(card);
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

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager');
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
                                expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager');
                                expect(ConfirmDialogService.close).toHaveBeenCalled();
                            });
                        });

                        describe('when confirmed', function() {
                            it('should goTo manager state', function() {
                                dialog().onAffirm();
                                expect(EditorCtrl.save).not.toHaveBeenCalled();
                                expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager');
                                expect(ConfirmDialogService.close).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when status is pending or not dirty', function() {
                        it('should goTo manager state', function() {
                            EditorCtrl.minireelState.dirty = false;
                            EditorCtrl.model.status = 'active';
                            EditorCtrl.backToDashboard();

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager');

                            EditorCtrl.minireelState.dirty = true;
                            EditorCtrl.model.status = 'pending';
                            EditorCtrl.backToDashboard();

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager');

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

                    it('should set the MiniReelCtrl branding back to null', function() {
                        expect(MiniReelCtrl.branding).toBeNull();
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

                describe('mrPreview:closePreview', function() {
                    it('should call closePreview method', function() {
                        spyOn($scope, '$broadcast');

                        EditorCtrl.preview = true;

                        $scope.$apply(function() {
                            $scope.$emit('mrPreview:closePreview');
                        });

                        expect($scope.$broadcast).toHaveBeenCalledWith('mrPreview:reset');
                        expect(EditorCtrl.preview).toBe(false);
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
                    var generateCollageDeferred;

                    beforeEach(function() {
                        generateCollageDeferred = $q.defer();

                        spyOn(EditorCtrl, 'save');
                        spyOn(CollateralService, 'generateCollage').and.returnValue(generateCollageDeferred.promise);
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

                    describe('if the minireel is pending', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                EditorCtrl.minireelState.dirty = true;
                            });
                            cModel.status = 'pending';
                            $timeout.flush();
                        });

                        it('should not generate a collage', function() {
                            expect(CollateralService.generateCollage).not.toHaveBeenCalled();
                        });
                    });

                    describe('if the minireel is active', function() {
                        beforeEach(function() {
                            EditorCtrl.save.calls.reset();

                            $scope.$apply(function() {
                                EditorCtrl.minireelState.dirty = true;
                            });
                            cModel.status = 'active';
                            cModel.data.splash.source = 'generated';
                        });

                        describe('if the splash is specified', function() {
                            beforeEach(function() {
                                cModel.data.splash.source = 'specified';
                                $timeout.flush();
                            });

                            it('should not generate an image', function() {
                                expect(CollateralService.generateCollage).not.toHaveBeenCalled();
                            });
                        });

                        describe('if the minireel becomes clean', function() {
                            beforeEach(function() {
                                EditorCtrl.minireelState.dirty = false;
                                $timeout.flush();
                            });

                            it('should not generate an image', function() {
                                expect(CollateralService.generateCollage).not.toHaveBeenCalled();
                            });
                        });

                        it('should generate a temporary collage', function() {
                            $timeout.flush();

                            expect(CollateralService.generateCollage).toHaveBeenCalledWith({
                                minireel: cModel,
                                name: 'splash--temp.jpg',
                                allRatios: false,
                                cache: false
                            });
                        });

                        describe('when the image is generated', function() {
                            beforeEach(function() {
                                spyOn(EditorCtrl, 'bustCache');

                                $timeout.flush();
                                $scope.$apply(function() {
                                    generateCollageDeferred.resolve({
                                        toString: function() {
                                            return 'splash--temp.jpg';
                                        }
                                    });
                                });
                            });

                            it('should set the MiniReel\'s splash to be the new image', function() {
                                expect(cModel.data.collateral.splash).toBe('splash--temp.jpg');
                            });

                            it('should bust the cache', function() {
                                expect(EditorCtrl.bustCache).toHaveBeenCalled();
                            });
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
                            expect(EditorCtrl.save).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
