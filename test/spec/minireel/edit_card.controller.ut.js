(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('EditCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6State,
                cinema6,
                $q,
                MiniReelService,
                ConfirmDialogService,
                EditorCtrl,
                EditCardCtrl;

            var model,
                tabs,
                appDataDeferred,
                appData;

            function setCurrentState(name) {
                Object.defineProperty(c6State, 'current', {
                    get: function() {
                        return name;
                    }
                });
            }

            beforeEach(function() {
                model = {
                    title: null,
                    note: null,
                    type: 'video',
                    data: {
                        service: 'youtube',
                        videoid: 'gy1B3agGNxw',
                        start: 10,
                        end: 20
                    }
                };

                appData = {
                    experience: {
                        data: {
                            modes: [
                                {
                                    modes: [
                                        {
                                            value: 'lightbox',
                                            limits: {}
                                        },
                                        {
                                            value: 'lightbox-ads',
                                            limits: {}
                                        }
                                    ]
                                },
                                {
                                    modes: [
                                        {
                                            value: 'light',
                                            limits: {
                                                copy: 200
                                            }
                                        },
                                        {
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

                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'goTo');

                    cinema6 = $injector.get('cinema6');
                    appDataDeferred = $q.defer();
                    spyOn(cinema6, 'getAppData')
                        .and.returnValue(appDataDeferred.promise);

                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $scope.EditorCtrl = EditorCtrl = {
                            cardLimits: {
                                copy: Infinity
                            },
                            errorForCard: jasmine.createSpy('EditorCtrl.errorForCard()')
                                .and.returnValue(null),
                            model: {
                                data: {
                                    mode: 'full',
                                    displayAdSource: 'publisher-cinema6',
                                    deck: [
                                        {
                                            id: 'rc-44b7277334f900',
                                            type: 'video'
                                        },
                                        {
                                            id: 'rc-9bc990dd4ad17a',
                                            type: 'video'
                                        },
                                        {
                                            id: 'rc-2f3c9133f3cbb3',
                                            type: 'video'
                                        }
                                    ]
                                }
                            }
                        };
                        EditCardCtrl = $controller('EditCardController', { $scope: $scope });
                        EditCardCtrl.initWithModel(model);
                        tabs = EditCardCtrl.tabs;
                        model = EditCardCtrl.model;
                        $scope.EditCardCtrl = EditCardCtrl;
                    });
                });
            });

            it('should exist', function() {
                expect(EditCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('initWithModel', function() {
                    var model,
                        copy = {
                            name: jasmine.any(String),
                            sref: 'MR:EditCard.Copy',
                            icon: 'text',
                            required: true
                        },
                        ballot = {
                            name: jasmine.any(String),
                            sref: 'MR:EditCard.Ballot',
                            icon: 'ballot',
                            required: false,
                            customRequiredText: jasmine.any(String)
                        },
                        video = {
                            name: jasmine.any(String),
                            sref: 'MR:EditCard.Video',
                            icon: 'play',
                            required: true
                        };

                    beforeEach(function() {
                        model = {
                            type: 'video',
                            data: {}
                        };
                    });

                    describe('on a new card', function() {
                        beforeEach(function() {
                            EditCardCtrl.initWithModel(model);
                        });

                        it('should set isNew to true', function() {
                            expect(EditCardCtrl.isNew).toBe(true);
                        });
                    });

                    describe('on an existing card', function() {
                        it('should set isNew to false', function() {
                            EditorCtrl.model.data.deck.forEach(function(card) {
                                /* global angular */
                                model = angular.copy(card);
                                EditCardCtrl.initWithModel(model);

                                expect(EditCardCtrl.isNew).toBe(false);
                            });
                        });
                    });

                    describe('on typeless cards', function() {
                        beforeEach(function() {
                            model.type = null;
                            EditCardCtrl.initWithModel(model);
                        });

                        it('should not enable any tabs', function() {
                            expect(EditCardCtrl.tabs).toEqual([]);
                        });
                    });

                    describe('on video cards', function() {
                        beforeEach(function() {
                            model.type = 'video';
                            EditCardCtrl.initWithModel(model);
                        });

                        it('should enable the "copy" and "video" tabs', function() {
                            expect(EditCardCtrl.tabs).toEqual([video, copy]);
                        });

                        it('should not set data.source', function() {
                            expect(model.data.source).toBeUndefined();
                        });
                    });

                    describe('on text cards', function() {
                        beforeEach(function() {
                            model.type = 'text';
                            EditCardCtrl.initWithModel(model);
                        });

                        it('should enable the "copy" and "video" tabs', function() {
                            expect(EditCardCtrl.tabs).toEqual([video, copy]);
                        });

                        it('should not set data.source', function() {
                            expect(model.data.source).toBeUndefined();
                        });
                    });
                });

                describe('save()', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').and.callThrough();
                        spyOn(EditCardCtrl, 'setIdealType');
                        EditCardCtrl.insertionIndex = 1;
                    });

                    function assertMutual() {
                        it('should set the ideal card type', function() {
                            expect(EditCardCtrl.setIdealType).toHaveBeenCalled();
                        });

                        it('should goTo the editor state', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', null, {});
                        });
                    }

                    describe('if the card is already in the deck', function() {
                        beforeEach(function() {
                            model.id = 'rc-9bc990dd4ad17a';

                            EditCardCtrl.save();
                        });

                        it('should update the card in the deck with its properties', function() {
                            expect(EditorCtrl.model.data.deck[1]).toEqual(model);
                            expect(EditorCtrl.model.data.deck[1]).not.toBe(model);
                        });

                        assertMutual();
                    });

                    describe('if the card is not in the deck', function() {
                        beforeEach(function() {
                            model.id = 'rc-c2177fddc0b8c7';

                            EditCardCtrl.save();
                        });

                        it('should insert the model into the deck at the insertionIndex', function() {
                            expect(EditorCtrl.model.data.deck[1]).toBe(model);
                            expect(EditorCtrl.model.data.deck.length).toBe(4);
                        });

                        assertMutual();
                    });
                });

                describe('setIdealType()', function() {
                    beforeEach(function() {
                        spyOn(MiniReelService, 'setCardType').and.callThrough();
                    });

                    it('should not mess with anything that is not a video card', function() {
                        ['ad', 'recap', 'text', 'links'].forEach(function(type) {
                            EditCardCtrl.model.type = type;

                            EditCardCtrl.setIdealType();

                            expect(EditCardCtrl.model.type).toBe(type);
                        });
                    });

                    ['video'].forEach(function(type) {
                        describe('with a ' + type + ' type with no videoid', function() {
                            beforeEach(function() {
                                EditCardCtrl.model.type = type;
                                EditCardCtrl.model.data.videoid = null;
                                EditCardCtrl.model.data.source = null;

                                EditCardCtrl.setIdealType();
                            });

                            it('should set the card to the "text" type', function() {
                                expect(MiniReelService.setCardType).toHaveBeenCalledWith(EditCardCtrl.model, 'text');
                                expect(EditCardCtrl.model.type).toBe('text');
                            });
                        });
                    });

                    describe('with a plain video card', function() {
                        beforeEach(function() {
                            EditCardCtrl.model.type = 'video';
                            EditCardCtrl.model.data.videoid = 'abc';
                            EditCardCtrl.model.data.source = 'youtube';

                            EditCardCtrl.setIdealType();
                        });

                        it('should not do anything', function() {
                            expect(MiniReelService.setCardType).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('properties', function() {
                function onlyEmpty(keys) {
                    if(!(keys instanceof Array)) {
                        keys = [keys];
                    }
                    var modelProps = ['title', 'note'];
                    var dataProps = ['service', 'videoid', 'imageid', 'id'];
                    modelProps.forEach(function(prop) {
                        if (keys.indexOf(prop) > -1) {
                            model[prop] = null;
                        } else {
                            model[prop] = model[prop] || ('some_' + prop + '_value');
                        }
                    });
                    dataProps.forEach(function(prop) {
                        if (keys.indexOf(prop) > -1) {
                            model.data[prop] = null;
                        } else {
                            model.data[prop] = model.data[prop] || ('some_' + prop + '_value');
                        }
                    });
                }

                describe('error', function() {
                    it('should be null', function() {
                        expect(EditCardCtrl.error).toBeNull();
                    });
                });

                describe('currentTab', function() {
                    describe('if the current state is not represented by a tab', function() {
                        beforeEach(function() {
                            setCurrentState('MR:EditCard.Server');
                        });

                        it('should be null', function() {
                            expect(EditCardCtrl.currentTab).toBeNull();
                        });
                    });

                    describe('if the current state is represented by a tab', function() {
                        it('should be that tab', function() {
                            tabs.forEach(function(tab) {
                                setCurrentState(tab.sref);
                                expect(EditCardCtrl.currentTab).toBe(tab);
                            });
                        });
                    });
                });

                describe('copyComplete', function() {
                    function copyComplete() {
                        return EditCardCtrl.copyComplete;
                    }

                    describe('on non video cards', function() {
                        beforeEach(function() {
                            model.type = 'foo';
                        });

                        it('should be undefined', function() {
                            expect(copyComplete()).toBeUndefined();
                        });
                    });

                    ['video'].forEach(function(type) {
                        describe('on a ' + type + ' card', function() {
                            beforeEach(function() {
                                model.type = type;
                            });

                            it('should be true if the title and note are not falsy', function() {
                                onlyEmpty('title');
                                expect(copyComplete()).toBe(false);

                                onlyEmpty('note');
                                expect(copyComplete()).toBe(true);

                                onlyEmpty('foo');
                                expect(copyComplete()).toBe(true);
                            });
                        });
                    });
                });

                describe('cardComplete', function() {
                    function cardComplete() {
                        return EditCardCtrl.cardComplete;
                    }

                    describe('when there is an error on the card', function() {
                        it('should be false', function() {
                            EditCardCtrl.model.type = 'video';
                            EditCardCtrl.error = 'error message';
                            expect(cardComplete()).toBe(false);
                        });
                    });

                    describe('on non video cards', function() {
                        beforeEach(function() {
                            model.type = 'foo';
                        });

                        it('should be undefined', function() {
                            expect(cardComplete()).toBeUndefined();
                        });
                    });

                    describe('on an image card', function() {
                        beforeEach(function() {
                            model.type = 'image';
                            model.data.service = 'flickr';
                            model.data.imageid = '12345';
                        });

                        it('should be true if the required fields are defined', function() {
                            expect(cardComplete()).toBe(true);
                        });

                        it('should be false if any of the required fields are not defined', function() {
                            onlyEmpty('service');
                            expect(cardComplete()).toBe(false);
                            onlyEmpty('imageid');
                            expect(cardComplete()).toBe(false);
                            onlyEmpty('service', 'imageid');
                            expect(cardComplete()).toBe(false);
                        });
                    });

                    describe('on an instagram card', function() {
                        beforeEach(function() {
                            model.type = 'instagram';
                            model.data.id = '12345';
                        });

                        it('should be true if the required fields are defined', function() {
                            expect(cardComplete()).toBe(true);
                        });

                        it('should be false if any of the required fields are not defined', function() {
                            onlyEmpty('id');
                            expect(cardComplete()).toBe(false);
                        });
                    });

                    ['video'].forEach(function(type) {
                        describe('on a ' + type + ' card', function() {
                            beforeEach(function() {
                                model.type = type;
                            });

                            it('should be true to make video selection optional', function() {
                                onlyEmpty('service');
                                expect(cardComplete()).toBe(true);

                                onlyEmpty('videoid');
                                expect(cardComplete()).toBe(true);

                                onlyEmpty('foo');
                                expect(cardComplete()).toBe(true);
                            });
                        });
                    });
                });

                describe('negativeButton', function() {
                    var tabs = [
                        {
                            sref: 'editor.editCard.copy'
                        },
                        {
                            sref: 'editor.editCard.video'
                        },
                        {
                            sref: 'editor.editCard.ballot'
                        }
                    ];

                    tabs.forEach(function(tab, index) {
                        describe('when the state is ' + tab.sref, function() {
                            beforeEach(function() {
                                EditCardCtrl.tabs = tabs;
                                Object.defineProperty(EditCardCtrl, 'currentTab', {
                                    value: tab
                                });
                            });

                            it('should always return the same object', function() {
                                expect(EditCardCtrl.negativeButton).toBe(EditCardCtrl.negativeButton);
                            });

                            describe('if the card is not new', function() {
                                beforeEach(function() {
                                    EditCardCtrl.isNew = false;
                                });

                                describe('text', function() {
                                    it('should be "Cancel"', function() {
                                        expect(EditCardCtrl.negativeButton.text).toBe('Cancel');
                                    });
                                });

                                describe('action()', function() {
                                    beforeEach(function() {
                                        EditCardCtrl.negativeButton.action();
                                    });

                                    it('should go back to the editor state', function() {
                                        expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor');
                                    });
                                });

                                describe('enabled', function() {
                                    it('should be true', function() {
                                        expect(EditCardCtrl.negativeButton.enabled).toBe(true);
                                    });
                                });
                            });

                            describe('if the card is new', function() {
                                beforeEach(function() {
                                    EditCardCtrl.isNew = true;
                                });

                                if (index === 0) {
                                    describe('on the first card', function() {
                                        describe('text', function() {
                                            it('should be "Cancel"', function() {
                                                expect(EditCardCtrl.negativeButton.text).toBe('Cancel');
                                            });
                                        });

                                        describe('action()', function() {
                                            beforeEach(function() {
                                                EditCardCtrl.negativeButton.action();
                                            });

                                            it('should go back to the editor state', function() {
                                                expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor');
                                            });
                                        });

                                        describe('enabled', function() {
                                            it('should be true', function() {
                                                expect(EditCardCtrl.negativeButton.enabled).toBe(true);
                                            });
                                        });
                                    });
                                } else {
                                    describe('on subsequent cards', function() {
                                        describe('text', function() {
                                            it('should be "Prev Step"', function() {
                                                expect(EditCardCtrl.negativeButton.text).toBe('Prev Step');
                                            });
                                        });

                                        describe('action', function() {
                                            beforeEach(function() {
                                                EditCardCtrl.negativeButton.action();
                                            });

                                            it('should go back to the prev tab', function() {
                                                expect(c6State.goTo).toHaveBeenCalledWith(tabs[index - 1].sref);
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    });
                });

                describe('primaryButton', function() {
                    beforeEach(function() {
                        setCurrentState('MR:EditCard.Server');
                    });

                    it('should always be the same object', function() {
                        expect(EditCardCtrl.primaryButton).toBe(EditCardCtrl.primaryButton);
                    });

                    describe('if the card cannot be saved', function() {
                        beforeEach(function() {
                            Object.defineProperty(EditCardCtrl, 'canSave', {
                                value: false
                            });
                        });

                        describe('on the MR:EditCard.Video state', function() {
                            beforeEach(function() {
                                setCurrentState('MR:EditCard.Video');
                            });

                            describe('the text', function() {
                                it('should be "Next"', function() {
                                    expect(EditCardCtrl.primaryButton.text).toBe('Next Step');
                                });
                            });

                            describe('the action', function() {
                                beforeEach(function() {
                                    EditCardCtrl.primaryButton.action();
                                });

                                it('should go to the editor.editCard.video state', function() {
                                    expect(c6State.goTo).toHaveBeenCalledWith('MR:EditCard.Copy');
                                });
                            });

                            describe('enabled', function() {
                                ['anything', null].forEach(function(error) {
                                    describe('if the error is ' + error, function() {
                                        beforeEach(function() {
                                            EditorCtrl.errorForCard.and.returnValue(error);
                                        });

                                        it('should be ' + !error, function() {
                                            expect(EditCardCtrl.primaryButton.enabled).toBe(!error);
                                        });
                                    });
                                });
                            });
                        });

                        ['MR:EditCard.Copy', 'MR:EditCard.Ballot', 'MR:EditCard.Instagram'].forEach(function(state) {
                            describe('on the ' + state + ' state', function() {
                                beforeEach(function() {
                                    setCurrentState(state);
                                });

                                describe('the text', function() {
                                    describe('if the minireel is not published', function() {
                                        beforeEach(function() {
                                            EditorCtrl.model.status = 'pending';
                                        });

                                        it('should be "Save"', function() {
                                            expect(EditCardCtrl.primaryButton.text).toBe('Save');
                                        });
                                    });

                                    describe('if the minireel is published', function() {
                                        beforeEach(function() {
                                            EditorCtrl.model.status = 'active';
                                        });

                                        it('should be "Done"', function() {
                                            expect(EditCardCtrl.primaryButton.text).toBe('I\'m Done!');
                                        });
                                    });
                                });

                                describe('the action', function() {
                                    beforeEach(function() {
                                        spyOn(EditCardCtrl, 'save');

                                        EditCardCtrl.primaryButton.action();
                                    });

                                    it('should call "save()"', function() {
                                        expect(EditCardCtrl.save).toHaveBeenCalled();
                                        expect(EditCardCtrl.save.calls.mostRecent().object).toBe(EditCardCtrl);
                                    });
                                });

                                describe('enabled', function() {
                                    it('should be false', function() {
                                        expect(EditCardCtrl.primaryButton.enabled).toBe(false);
                                    });
                                });
                            });
                        });
                    });
                });

                describe('canSave', function() {
                    function canSave() {
                        return EditCardCtrl.canSave;
                    }

                    ['image', 'video', 'ad'].forEach(function(type) {
                        describe('on a ' + type + ' card', function() {
                            beforeEach(function() {
                                model.title = 'Foo';
                                model.data.service = 'youtube';
                                model.data.videoid = 'abc';
                                model.type = type;
                            });

                            describe('if there is an error', function() {
                                beforeEach(function() {
                                    EditCardCtrl.error = {};
                                });

                                it('should be false', function() {
                                    expect(canSave()).toBe(false);
                                });
                            });
                        });
                    });

                    ['image', 'video'].forEach(function(type) {
                        describe('on a ' + type + ' card', function() {
                            describe('if the copy is not complete', function() {
                                beforeEach(function() {
                                    Object.defineProperty(EditCardCtrl, 'copyComplete', {
                                        get: function() {
                                            return false;
                                        }
                                    });
                                });

                                it('should be false', function() {
                                    expect(canSave()).toBe(false);
                                });
                            });
                        });
                    });

                    describe('on a video card', function() {
                        beforeEach(function() {
                            model.type = 'video';
                        });

                        describe('if the card is filled out', function() {
                            beforeEach(function() {
                                model.title = 'Foo';
                                model.data.service = 'youtube';
                                model.data.videoid = 'abc';
                            });

                            it('should be true as long as there is no error for the card', function() {
                                expect(canSave()).toBe(true);

                                EditorCtrl.errorForCard.and.returnValue('foo');
                                expect(canSave()).toBe(false);

                                EditorCtrl.errorForCard.calls.all().forEach(function(call) {
                                    expect(call.args[0]).toBe(model);
                                });
                            });
                        });

                        describe('if the card is not totally filled out', function() {

                            beforeEach(function() {
                                onlyEmpty('title');
                            });

                            it('should be false', function() {
                                expect(canSave()).toBe(false);

                                onlyEmpty('note');
                                expect(canSave()).toBe(true);

                                onlyEmpty('service');
                                expect(canSave()).toBe(true);

                                onlyEmpty('videoid');
                                expect(canSave()).toBe(true);

                                onlyEmpty('foo');
                                expect(canSave()).toBe(true);
                            });
                        });
                    });

                    describe('on any other card', function() {
                        beforeEach(function() {
                            model.type = 'foo';
                            EditorCtrl.errorForCard.and.returnValue('sdgfg');
                        });

                        it('should be true', function() {
                            expect(canSave()).toBe(true);
                        });
                    });
                });

                describe('videoUrl', function() {
                    describe('getting', function() {
                        it('should use the service and videoid to formulate a url for the video', function() {
                            expect(EditCardCtrl.videoUrl).toBe('https://www.youtube.com/watch?v=gy1B3agGNxw');

                            $scope.$apply(function() {
                                model.data.service = 'vimeo';
                                model.data.videoid = '89203931';
                            });
                            expect(EditCardCtrl.videoUrl).toBe('http://vimeo.com/89203931');

                            $scope.$apply(function() {
                                model.data.service = 'dailymotion';
                                model.data.videoid = 'x17nw7w';
                            });
                            expect(EditCardCtrl.videoUrl).toBe('http://www.dailymotion.com/video/x17nw7w');
                        });
                    });

                    describe('setting', function() {
                        it('should parse the service and videoid', function() {
                            EditCardCtrl.videoUrl = 'https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11';
                            expect(model.data.service).toBe('youtube');
                            expect(model.data.videoid).toBe('jFJUz1DO20Q');

                            EditCardCtrl.videoUrl = 'http://vimeo.com/89495751';
                            expect(model.data.service).toBe('vimeo');
                            expect(model.data.videoid).toBe('89495751');

                            EditCardCtrl.videoUrl = 'http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2';
                            expect(model.data.service).toBe('dailymotion');
                            expect(model.data.videoid).toBe('x120oui');
                        });

                        it('should not freak out when getting a mangled url', function() {
                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'apple.com';
                                });
                            }).not.toThrow();
                            expect(EditCardCtrl.videoUrl).toBe('apple.com');
                            expect(model.data.service).toBeNull();

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = '84fh439#';
                                });
                            }).not.toThrow();
                            expect(EditCardCtrl.videoUrl).toBe('84fh439#');
                            expect(model.data.service).toBeNull();

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.youtube.com/';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();
                            expect(EditCardCtrl.videoUrl).toBe('http://www.youtube.com/');

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.vimeo.com/';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();
                            expect(EditCardCtrl.videoUrl).toBe('http://www.vimeo.com/');

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.dailymotion.com/';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();
                            expect(EditCardCtrl.videoUrl).toBe('http://www.dailymotion.com/');

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.youtube.c';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();

                            $scope.$apply(function() {
                                EditCardCtrl.videoUrl = 'http://www.dailymotion.com/v';
                            });
                            expect(EditCardCtrl.videoUrl).toBe('http://www.dailymotion.com/v');
                        });
                    });
                });
            });

            describe('$events', function() {
                describe('VideoSearchCtrl:addVideo', function() {
                    var parentSpy;

                    beforeEach(function() {
                        parentSpy = jasmine.createSpy('parent handler');
                        $rootScope.$on('VideoSearchCtrl:addVideo', parentSpy);

                        spyOn(ConfirmDialogService, 'display').and.callThrough();
                    });

                    afterEach(function() {
                        expect(parentSpy).not.toHaveBeenCalled();
                    });

                    describe('if the current card has a video', function() {
                        beforeEach(function() {
                            model.data.service = 'youtube';
                            model.data.videoid = 'abc';

                            $scope.$apply(function() {
                                $scope.$emit('VideoSearchCtrl:addVideo', {
                                    data: {
                                        service: 'vimeo',
                                        videoid: '123'
                                    }
                                });
                            });
                        });

                        it('should display a confirmation', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                                prompt: jasmine.any(String),
                                affirm: jasmine.any(String),
                                cancel: jasmine.any(String),
                                onAffirm: jasmine.any(Function),
                                onCancel: jasmine.any(Function),
                                onDismiss: jasmine.any(Function)
                            });
                        });

                        describe('when the user interacts with the dialog:', function() {
                            var config;

                            beforeEach(function() {
                                config = ConfirmDialogService.display.calls.mostRecent().args[0];
                                spyOn(ConfirmDialogService, 'close').and.callThrough();
                            });

                            describe('when the action is canceled', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        config.onCancel();
                                    });
                                });

                                it('should close the dialog', function() {
                                    expect(ConfirmDialogService.close).toHaveBeenCalled();
                                });
                            });

                            describe('when the action is affirmed', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        config.onAffirm();
                                    });
                                });

                                it('should set the current card\'s service and videoid', function() {
                                    expect(model.data.service).toBe('vimeo');
                                    expect(model.data.videoid).toBe('123');
                                });

                                it('should close the dialog', function() {
                                    expect(ConfirmDialogService.close).toHaveBeenCalled();
                                });
                            });
                        });
                    });

                    describe('if the current card has no video', function() {
                        beforeEach(function() {
                            model.data.service = null;
                            model.data.videoid = null;

                            $scope.$apply(function() {
                                $scope.$emit('VideoSearchCtrl:addVideo', {
                                    data: {
                                        service: 'dailymotion',
                                        videoid: 'abc123'
                                    }
                                });
                            });
                        });

                        it('should not show a dialog', function() {
                            expect(ConfirmDialogService.display).not.toHaveBeenCalled();
                        });

                        it('should set the current card\'s service and videoid', function() {
                            expect(model.data.service).toBe('dailymotion');
                            expect(model.data.videoid).toBe('abc123');
                        });
                    });
                });

                describe('<video-preview>:error', function() {
                    var error;

                    beforeEach(function() {
                        error = {
                            name: 'YouTubePlayerError',
                            message: 'It failed...'
                        };

                        $scope.$emit('<video-preview>:error', error);
                    });

                    it('should set its error property to the provided error', function() {
                        expect(EditCardCtrl.error).toBe(error);
                    });
                });
            });

            describe('$watchers', function() {
                describe('this.model.data.videoid', function() {
                    beforeEach(function() {
                        EditCardCtrl.error = {};

                        $scope.$apply(function() {
                            model.data.videoid = '38rhunr93f4';
                        });
                    });

                    it('should nullify the error', function() {
                        expect(EditCardCtrl.error).toBeNull();
                    });
                });

                describe('this.tabs', function() {
                    it('should go to the first tab on initialization', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith(tabs[0].sref);
                        c6State.goTo.calls.reset();

                        $scope.$apply(function() {
                            EditCardCtrl.tabs = [];
                        });
                        expect(c6State.goTo).not.toHaveBeenCalled();
                    });
                });

                describe('this.model.data.service', function() {
                    describe('when initialized as dailymotion', function() {
                        beforeEach(function() {
                            model.data.service = 'dailymotion';
                            $scope.$apply(function() {
                                EditCardCtrl = $controller('EditCardController', {
                                    $scope: $scope
                                });
                                EditCardCtrl.initWithModel(model);
                            });
                        });

                        it('should set the start/end to undefined', function() {
                            [model.data.start, model.data.end].forEach(function(value) {
                                expect(value).toBeUndefined();
                            });
                        });
                    });

                    describe('when changing to dailymotion', function() {
                        beforeEach(function() {
                            expect(model.data.start).toBe(10);
                            expect(model.data.end).toBe(20);

                            $scope.$apply(function() {
                                model.data.service = 'dailymotion';
                            });
                        });

                        it('should set the start/end to undefined', function() {
                            expect(model.data.start).toBeUndefined();
                            expect(model.data.end).toBeUndefined();
                        });
                    });

                    describe('when changing from DailyMotion', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                model.data.service = 'dailymotion';
                            });
                            $scope.$apply(function() {
                                model.data.service = 'youtube';
                            });
                        });

                        it('should set the start/end to null', function() {
                            expect(model.data.start).toBeNull();
                            expect(model.data.end).toBeNull();
                        });
                    });

                    describe('when changing from something other than dailymotion', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                model.data.service = 'vimeo';
                            });
                        });

                        it('should preserve the start/end', function() {
                            expect(model.data.start).toBe(10);
                            expect(model.data.end).toBe(20);
                        });
                    });
                });
            });
        });
    });
}());
