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

            var minireel, cModel;

            beforeEach(function() {
                minireel = {
                    id: 'e-53ae461c63b015',
                    status: 'pending',
                    access: 'public',
                    data: {
                        title: 'My Awesome MiniReel',
                        branding: 'urbantimes',
                        mode: 'lightbox',
                        collateral: {
                            splash: '/collateral/foo.jpg'
                        },
                        splash: {
                            theme: 'img-only',
                            ratio: '16-9',
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

                cModel = {
                    id: 'e-53ae461c63b015',
                    status: 'pending',
                    access: 'public',
                    data: {
                        title: 'My Awesome MiniReel',
                        branding: 'urbantimes',
                        mode: 'lightbox',
                        collateral: {
                            splash: 'fhrwiuoefhb843uyrf7834dhfu8efdg8'
                        },
                        splash: {
                            theme: 'img-only',
                            ratio: '16-9',
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
                        minireel: cModel,
                        campaign: null
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
                            org: {},
                            permissions: {}
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
                        EditorCtrl.initWithModel(minireel);
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
                describe('__minireel__', function() {
                    it('should be the original model', function() {
                        expect(EditorCtrl.__minireel__).toBe(minireel);
                    });
                });

                describe('model', function() {
                    it('should be the EditorService\'s MiniReel', function() {
                        expect(EditorCtrl.model).toBe(cModel);
                    });
                });

                describe('campaign', function() {
                    describe('if the MR is not part of a campaign', function() {
                        it('should be null', function() {
                            expect(EditorCtrl.campaign).toBeNull();
                        });
                    });

                    describe('if the MR is part of a campaign', function() {
                        beforeEach(function() {
                            EditorService.state.campaign = cinema6.db.create('campaign', {
                                id: 'cam-9ca56c92960d7d',
                                advertiser: cinema6.db.create('advertiser', {
                                    id: 'a-194f90241797ed'
                                })
                            });

                            EditorCtrl.initWithModel({});
                        });

                        it('should be the campaign', function() {
                            expect(EditorCtrl.campaign).toBe(EditorService.state.campaign);
                        });
                    });
                });

                describe('showSearch', function() {
                    it('should be false', function() {
                        expect(EditorCtrl.showSearch).toBe(false);
                    });
                });

                describe('focus', function() {
                    it('should be "video-search"', function() {
                        expect(EditorCtrl.focus).toBe('video-search');
                    });
                });

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

                describe('previewUrl', function() {
                    it('should be a preview URL for the MiniReel', function() {
                        expect(EditorCtrl.previewUrl).toBe(MiniReelService.previewUrlOf(cModel));
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

                describe('lastEditableIndex', function() {
                    it('should be the last index of an editable card', function() {
                        EditorCtrl.model.data.deck = [
                            'text',
                            'video',
                            'videoBallot',
                            'video',
                            'displayAd',
                            'video',
                            'video',
                            'recap'
                        ].map(function(type) {
                            return MiniReelService.createCard(type);
                        });
                        expect(EditorCtrl.lastEditableIndex).toBe(6);

                        EditorCtrl.model.data.deck = [
                            'video',
                            'videoBallot',
                            'video',
                            'displayAd',
                            'video',
                            'displayAd',
                            'recap'
                        ].map(function(type) {
                            return MiniReelService.createCard(type);
                        });
                        expect(EditorCtrl.lastEditableIndex).toBe(4);
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

                describe('queueSearch(query)', function() {
                    beforeEach(function() {
                        expect(EditorCtrl.showSearch).toBeDefined();
                        spyOn($scope, '$broadcast').and.callThrough();
                        spyOn(EditorCtrl, 'focusOn').and.callThrough();

                        $scope.$apply(function() {
                            EditorCtrl.queueSearch('This is a Search!');
                        });
                    });

                    it('should set "showSearch" to true', function() {
                        expect(EditorCtrl.showSearch).toBe(true);
                    });

                    it('should focus on the video search', function() {
                        expect(EditorCtrl.focusOn).toHaveBeenCalledWith('video-search');
                    });

                    it('should $broadcast the "EditorCtrl:searchQueued" event', function() {
                        expect($scope.$broadcast).toHaveBeenCalledWith('EditorCtrl:searchQueued', 'This is a Search!');
                    });
                });

                describe('toggleSearch()', function() {
                    it('should toggle the showSearch property', function() {
                        EditorCtrl.toggleSearch();
                        expect(EditorCtrl.showSearch).toBe(true);

                        EditorCtrl.toggleSearch();
                        expect(EditorCtrl.showSearch).toBe(false);
                    });
                });

                describe('focusOn(value)', function() {
                    it('should set the focus property', function() {
                        expect(EditorCtrl.focusOn('modal')).toBe('modal');
                        expect(EditorCtrl.focus).toBe('modal');

                        expect(EditorCtrl.focusOn('video-search')).toBe('video-search');
                        expect(EditorCtrl.focus).toBe('video-search');
                    });
                });

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

                describe('canEditCard(card)', function() {
                    var card;

                    ['video', 'videoBallot'].forEach(function(type) {
                        describe('for a ' + type + ' card', function() {
                            beforeEach(function() {
                                card = MiniReelService.createCard(type);
                            });

                            it('should be true', function() {
                                expect(EditorCtrl.canEditCard(card)).toBe(true);
                            });
                        });
                    });

                    ['recap', 'displayAd'].forEach(function(type) {
                        describe(' for a ' + type + ' card', function() {
                            beforeEach(function() {
                                card = MiniReelService.createCard(type);
                            });

                            it('should be false', function() {
                                expect(EditorCtrl.canEditCard(card)).toBe(false);
                            });
                        });
                    });

                    describe('for a sponsored card', function() {
                        beforeEach(function() {
                            card = MiniReelService.createCard('video');
                            card.sponsored = true;
                        });

                        it('should be false', function() {
                            expect(EditorCtrl.canEditCard(card)).toBe(false);
                        });

                        describe('if it is a wildcard', function() {
                            beforeEach(function() {
                                MiniReelService.setCardType(card, 'wildcard');
                            });

                            it('should be true', function() {
                                expect(EditorCtrl.canEditCard(card)).toBe(true);
                            });
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

                    it('should go to the NewCard state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor.NewCard', null, {
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

                describe('pushCard(card)', function() {
                    var card,
                        result,
                        initialLength;

                    beforeEach(function() {
                        card = {};

                        initialLength = cModel.data.deck.length;

                        result = EditorCtrl.pushCard(card);
                    });

                    it('should return the card', function() {
                        expect(result).toBe(card);
                    });

                    it('should push the card into the second-to-last slot', function() {
                        var deck = cModel.data.deck;

                        expect(deck.length).toBe(initialLength + 1);
                        expect(deck[deck.length - 2]).toBe(card);
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
                    var session, broadcastedExperience;

                    function testBroadcastExperience(experience, adConfig) {
                        angular.forEach(cModel, function(val, key) {
                            if (key !== 'data') {
                                expect(experience[key]).toEqual(val);
                            } else {
                                angular.forEach(experience[key], function(v, k) {
                                    if (k !== 'adConfig') {
                                        expect(experience[key][k]).toEqual(v);
                                    } else {
                                        expect(experience[key].adConfig).toEqual(adConfig);
                                    }
                                });
                            }
                        });
                    }

                    beforeEach(function() {
                        session = {
                            ping: jasmine.createSpy('session.ping()')
                        };

                        spyOn($scope, '$broadcast');
                        spyOn(cinema6, 'getSession').and.returnValue($q.when(session));

                        cModel.user = {
                            org: {
                                adConfig: {
                                    firstPlacement: 2,
                                    frequency: 0,
                                    skip: true,
                                    waterfall: 'cinema6'
                                }
                            }
                        };
                    });
                    it('should set preview mode to true', function() {
                        EditorCtrl.previewMode();
                        expect(EditorCtrl.preview).toBe(true);
                    });

                    describe('without a card', function() {
                        it('should $broadcast the experience without a card', function() {
                            EditorCtrl.previewMode();

                            broadcastedExperience = $scope.$broadcast.calls.argsFor(0)[1];
                            testBroadcastExperience(broadcastedExperience, cModel.user.org.adConfig);

                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(undefined);
                        });

                        it('should send the minireel\'s adConfig if defined', function() {
                            cModel.data.adConfig = {
                                firstPlacement: 5,
                                frequency: 2,
                                skip: false,
                                waterfall: 'cinema6'
                            };

                            EditorCtrl.previewMode();

                            broadcastedExperience = $scope.$broadcast.calls.argsFor(0)[1];
                            testBroadcastExperience(broadcastedExperience, cModel.data.adConfig);

                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(undefined);
                        });
                    });

                    describe('with a card', function() {
                        it('should $broadcast the experience with a card', function() {
                            var card = {};
                            EditorCtrl.previewMode(card);

                            broadcastedExperience = $scope.$broadcast.calls.argsFor(0)[1];
                            testBroadcastExperience(broadcastedExperience, cModel.user.org.adConfig);

                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                            expect($scope.$broadcast.calls.argsFor(0)[2]).toBe(card);
                        });

                        it('should send the minireel\'s adConfig if defined', function() {
                            var card = {};

                            cModel.data.adConfig = {
                                firstPlacement: 5,
                                frequency: 2,
                                skip: false,
                                waterfall: 'cinema6'
                            };

                            EditorCtrl.previewMode(card);

                            broadcastedExperience = $scope.$broadcast.calls.argsFor(0)[1];
                            testBroadcastExperience(broadcastedExperience, cModel.data.adConfig);

                            expect($scope.$broadcast.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
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

                describe('returnToCampaign()', function() {
                    var success, failure,
                        saveDeferred, campaignSaveDeferred;

                    beforeEach(function() {
                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');

                        saveDeferred = $q.defer();
                        campaignSaveDeferred = $q.defer();

                        EditorCtrl.campaign = cinema6.db.create('campaign', {
                            id: 'cam-6cf12193448f16',
                            links: {},
                            logos: {},
                            cards: [],
                            miniReels: []
                        });

                        spyOn(EditorCtrl, 'save').and.returnValue(saveDeferred.promise);
                        spyOn(EditorCtrl.campaign, 'save').and.returnValue(campaignSaveDeferred.promise);

                        $scope.$apply(function() {
                            EditorCtrl.returnToCampaign().then(success, failure);
                        });
                    });

                    it('should save the MiniReel and campaign', function() {
                        expect(EditorCtrl.save).toHaveBeenCalled();
                        expect(EditorCtrl.campaign.save).toHaveBeenCalled();
                    });

                    describe('when the save completes', function() {
                        var goToDeferred;

                        beforeEach(function() {
                            goToDeferred = $q.defer();

                            spyOn(c6State, 'goTo').and.returnValue(goToDeferred.promise);

                            $scope.$apply(function() {
                                saveDeferred.resolve(cModel);
                            });
                            expect(c6State.goTo).not.toHaveBeenCalled();
                            $scope.$apply(function() {
                                campaignSaveDeferred.resolve(EditorCtrl.campaign);
                            });
                        });

                        it('should go to the "MR:Campaign.MiniReels" state', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.MiniReels', [EditorCtrl.campaign, null]);
                        });

                        describe('when the state transition completes', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    goToDeferred.resolve(c6State.get('MR:Campaign.MiniReels'));
                                });
                            });

                            it('should resolve to the campaign', function() {
                                expect(success).toHaveBeenCalledWith(EditorCtrl.campaign);
                            });
                        });
                    });

                    describe('when the save returns an error', function() {
                        beforeEach(function() {
                            spyOn(c6State, 'goTo');

                            $scope.$apply(function() {
                                saveDeferred.resolve(cModel);
                            });
                            $scope.$apply(function() {
                                campaignSaveDeferred.reject('Bad request');
                            });
                        });
                        it('should show a dialog', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });

                        it('should go back to the campaign manager when confirmed', function() {
                            ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.MiniReels', [EditorCtrl.campaign, null]);
                        });

                        it('should go back to the campaign manager when canceled', function() {
                            ConfirmDialogService.display.calls.mostRecent().args[0].onCancel();

                            expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.MiniReels', [EditorCtrl.campaign, null]);
                        });

                        it('should reject the promise', function() {
                            expect(failure).toHaveBeenCalledWith('Bad request');
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
                describe('c6State:stateChange', function() {
                    function callWith(stateName) {
                        c6State.emit('stateChange', {
                            cName: stateName
                        }, null);
                    }

                    beforeEach(function() {
                        spyOn(EditorCtrl, 'focusOn').and.callThrough();
                    });

                    describe('if called with any state other than "MR:EditCard"', function() {
                        beforeEach(function() {
                            ['MR:Manager', 'MR:Editor.Settings', 'MR:Settings.Mode']
                                .forEach(function(name) {
                                    callWith(name);
                                });
                        });

                        it('should not change the focus', function() {
                            expect(EditorCtrl.focusOn).not.toHaveBeenCalled();
                        });
                    });

                    describe('if called with the "MR:EditCard" state', function() {
                        beforeEach(function() {
                            callWith('MR:EditCard');
                        });

                        it('should change the focus to the modal', function() {
                            expect(EditorCtrl.focusOn).toHaveBeenCalledWith('modal');
                        });
                    });
                });

                describe('VideoSearchCtrl:addVideo', function() {
                    var card;

                    beforeEach(function() {
                        card = {
                            id: 'rc-2612c38e214f1f',
                            data: {
                                service: 'youtube',
                                videoid: 'abc'
                            }
                        };

                        spyOn(c6State, 'goTo');

                        $scope.$apply(function() {
                            $scope.$emit('VideoSearchCtrl:addVideo', card);
                        });
                    });

                    it('should begin editing the card', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:EditCard', [card], {
                            insertAt: cModel.data.deck.length - 1
                        });
                    });

                    describe('if called with an id', function() {
                        beforeEach(function() {
                            c6State.goTo.calls.reset();

                            cModel.data.deck = [
                                { id: 'rc-0216d451b9192d', type: 'videoBallot', data: {} },
                                { id: 'rc-2e45c33f20a0b3', type: 'video', data: {} },
                                { id: 'rc-d23f42a657bf65', type: 'text', data: {} },
                                { id: 'rc-2fd06b3f072585', type: 'video', data: {} },
                                { id: 'rc-bdd38284f4c62c', type: 'recap', data: {} }
                            ];

                            $scope.$apply(function() {
                                $scope.$emit('VideoSearchCtrl:addVideo', card, cModel.data.deck[1].id);
                            });
                        });

                        describe('if called with a recap card', function() {
                            beforeEach(function() {
                                ConfirmDialogService.display.calls.reset();

                                $scope.$apply(function() {
                                    $scope.$emit('VideoSearchCtrl:addVideo', card, cModel.data.deck[4].id);
                                });
                            });

                            it('should not show a dialog', function() {
                                expect(ConfirmDialogService.display).not.toHaveBeenCalled();
                            });

                            it('should not edit a card', function() {
                                expect(c6State.goTo).not.toHaveBeenCalled();
                            });
                        });

                        describe('if called with a text card', function() {
                            beforeEach(function() {
                                ConfirmDialogService.display.calls.reset();

                                $scope.$apply(function() {
                                    $scope.$emit('VideoSearchCtrl:addVideo', card, cModel.data.deck[2].id);
                                });
                            });

                            describe('when the dialog is affirmed', function() {
                                beforeEach(function() {
                                    spyOn(MiniReelService, 'setCardType').and.callThrough();

                                    $scope.$apply(function() {
                                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();
                                    });
                                });

                                it('should convert the card to a video card', function() {
                                    expect(MiniReelService.setCardType).toHaveBeenCalledWith(cModel.data.deck[2], 'video');
                                });
                            });
                        });

                        it('should not edit a card', function() {
                            expect(c6State.goTo).not.toHaveBeenCalled();
                        });

                        it('should display a confirmation dialog', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                                prompt: jasmine.any(String),
                                affirm: jasmine.any(String),
                                cancel: jasmine.any(String),
                                onAffirm: jasmine.any(Function),
                                onCancel: jasmine.any(Function)
                            });
                        });

                        describe('when the user interacts with the dialog', function() {
                            var config;

                            beforeEach(function() {
                                config = ConfirmDialogService.display.calls.mostRecent().args[0];
                            });

                            describe('when the dialog is canceled', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        config.onCancel();
                                    });
                                });

                                it('should close the dialog', function() {
                                    expect(ConfirmDialogService.close).toHaveBeenCalled();
                                });
                            });

                            describe('when the dialog is affirmed', function() {
                                beforeEach(function() {
                                    spyOn(EditorCtrl, 'editCard');

                                    $scope.$apply(function() {
                                        config.onAffirm();
                                    });
                                });

                                it('should change the card\'s videoid and service', function() {
                                    var existingCard = cModel.data.deck[1];

                                    expect(existingCard.data.service).toBe(card.data.service);
                                    expect(existingCard.data.videoid).toBe(card.data.videoid);
                                });

                                it('should close the dialog', function() {
                                    expect(ConfirmDialogService.close).toHaveBeenCalled();
                                });

                                it('should edit the card', function() {
                                    expect(EditorCtrl.editCard).toHaveBeenCalledWith(cModel.data.deck[1]);
                                });
                            });
                        });
                    });
                });

                describe('$destroy', function() {
                    var saveDeferred;

                    beforeEach(function() {
                        saveDeferred = $q.defer();

                        spyOn(EditorService, 'close').and.callThrough();
                        spyOn(EditorCtrl, 'save').and.returnValue(saveDeferred.promise);
                        spyOn(EditorCtrl, 'focusOn').and.callThrough();

                        $scope.$apply(function() {
                            $scope.$emit('$destroy');
                        });
                    });

                    it('should remove listeners for c6State:stateChange', function() {
                        c6State.emit('stateChange', {
                            cName: 'MR:EditCard'
                        }, null);

                        expect(EditorCtrl.focusOn).not.toHaveBeenCalled();
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
                                allRatios: false
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
