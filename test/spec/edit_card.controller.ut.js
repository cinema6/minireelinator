(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6State,
                c6StateParams,
                cinema6,
                $q,
                MiniReelService,
                EditorCtrl,
                EditCardCtrl;

            var model,
                tabs,
                appDataDeferred,
                appData;

            beforeEach(function() {
                tabs = [
                    {
                        name: 'Foo',
                        sref: 'editor.editCard.foo'
                    }
                ];

                model = {
                    title: null,
                    note: null,
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

                module('c6.mrmaker');

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

                    c6StateParams = $injector.get('c6StateParams');
                    MiniReelService = $injector.get('MiniReelService');

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
                                    deck: [
                                        {
                                            id: 'rc-44b7277334f900'
                                        },
                                        {
                                            id: 'rc-9bc990dd4ad17a'
                                        },
                                        {
                                            id: 'rc-2f3c9133f3cbb3'
                                        }
                                    ]
                                }
                            }
                        };
                        EditCardCtrl = $controller('EditCardController', { $scope: $scope, cModel: model });
                        EditCardCtrl.model = model;
                        EditCardCtrl.tabs = tabs;
                        $scope.EditCardCtrl = EditCardCtrl;
                    });
                });
            });

            it('should exist', function() {
                expect(EditCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('save()', function() {
                    beforeEach(function() {
                        spyOn($scope, '$emit').and.callThrough();
                        spyOn(EditCardCtrl, 'setIdealType');
                        c6StateParams.insertionIndex = 1;
                    });

                    describe('if the card is already in the deck', function() {
                        beforeEach(function() {
                            model.id = 'rc-9bc990dd4ad17a';

                            EditCardCtrl.save();
                        });

                        it('should set the ideal card type', function() {
                            expect(EditCardCtrl.setIdealType).toHaveBeenCalled();
                        });

                        it('should update the card in the deck with its properties', function() {
                            expect(EditorCtrl.model.data.deck[1]).toEqual(model);
                            expect(EditorCtrl.model.data.deck[1]).not.toBe(model);
                        });

                        it('should goTo the editor state', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('editor');
                        });
                    });

                    describe('if the card is not in the deck', function() {
                        beforeEach(function() {
                            model.id = 'rc-c2177fddc0b8c7';

                            EditCardCtrl.save();
                        });

                        it('should set the ideal card type', function() {
                            expect(EditCardCtrl.setIdealType).toHaveBeenCalled();
                        });

                        it('should insert the model into the deck at the insertionIndex', function() {
                            expect(EditorCtrl.model.data.deck[1]).toBe(model);
                            expect(EditorCtrl.model.data.deck.length).toBe(4);
                        });

                        it('should goTo the editor state', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('editor');
                        });
                    });
                });

                describe('setIdealType()', function() {
                    it('should not mess with anything that is not a videoBallot card', function() {
                        ['ad', 'recap', 'video', 'links'].forEach(function(type) {
                            EditCardCtrl.model.type = type;

                            EditCardCtrl.setIdealType();

                            expect(EditCardCtrl.model.type).toBe(type);
                        });
                    });

                    describe('with a videoBallot type', function() {
                        beforeEach(function() {
                            EditCardCtrl.model.type = 'videoBallot';
                        });

                        describe('if user has chosen two prompts', function() {
                            beforeEach(function() {
                                EditCardCtrl.model.data.ballot = {
                                    choices: [
                                        'Hot',
                                        'Not'
                                    ]
                                };

                                EditCardCtrl.setIdealType();
                            });

                            it('should not change anything', function() {
                                expect(EditCardCtrl.model.type).toBe('videoBallot');
                            });
                        });

                        describe('if the user has not chosen two prompts', function() {
                            beforeEach(function() {
                                EditCardCtrl.model.data.ballot = {
                                    choices: [
                                        'Hot'
                                    ]
                                };

                                spyOn(MiniReelService, 'setCardType').and.callThrough();
                                EditCardCtrl.setIdealType();
                            });

                            it('should make the card a video card', function() {
                                expect(MiniReelService.setCardType).toHaveBeenCalledWith(EditCardCtrl.model, 'video');
                                expect(EditCardCtrl.model.type).toBe('video');
                            });
                        });
                    });
                });
            });

            describe('properties', function() {
                function onlyEmpty(key) {
                    ['title', 'note'].forEach(function(prop) {
                        if (prop !== key) {
                            model[prop] = 'Filled';
                        } else {
                            model[prop] = null;
                        }
                    });

                    ['service', 'videoid'].forEach(function(prop) {
                        if (prop !== key) {
                            model.data[prop] = 'Filled';
                        } else {
                            model.data[prop] = null;
                        }
                    });
                }

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

                    ['video', 'videoBallot'].forEach(function(type) {
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

                describe('videoComplete', function() {
                    function videoComplete() {
                        return EditCardCtrl.videoComplete;
                    }

                    describe('on non video cards', function() {
                        beforeEach(function() {
                            model.type = 'foo';
                        });

                        it('should be undefined', function() {
                            expect(videoComplete()).toBeUndefined();
                        });
                    });

                    ['video', 'videoBallot'].forEach(function(type) {
                        describe('on a ' + type + ' card', function() {
                            beforeEach(function() {
                                model.type = type;
                            });

                            it('should be true if the service and videoid are not falsy', function() {
                                onlyEmpty('service');
                                expect(videoComplete()).toBe(false);

                                onlyEmpty('videoid');
                                expect(videoComplete()).toBe(false);

                                onlyEmpty('foo');
                                expect(videoComplete()).toBe(true);
                            });
                        });
                    });
                });

                describe('primaryButtonAction', function() {
                    beforeEach(function() {
                        c6State.current = c6State.get('editor.editCard.server');
                    });

                    it('should always be the same object', function() {
                        expect(EditCardCtrl.primaryButton).toBe(EditCardCtrl.primaryButton);
                    });

                    describe('if the card can be saved', function() {
                        beforeEach(function() {
                            Object.defineProperty(EditCardCtrl, 'canSave', {
                                value: true
                            });
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
                                    expect(EditCardCtrl.primaryButton.text).toBe('Done');
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
                            it('should be true', function() {
                                expect(EditCardCtrl.primaryButton.enabled).toBe(true);
                            });
                        });
                    });

                    describe('if the card cannot be saved', function() {
                        beforeEach(function() {
                            Object.defineProperty(EditCardCtrl, 'canSave', {
                                value: false
                            });
                        });

                        describe('on the editor.editCard.copy state', function() {
                            beforeEach(function() {
                                c6State.current = c6State.get('editor.editCard.copy');
                            });

                            describe('the text', function() {
                                it('should be "Next"', function() {
                                    expect(EditCardCtrl.primaryButton.text).toBe('Next');
                                });
                            });

                            describe('the action', function() {
                                beforeEach(function() {
                                    EditCardCtrl.primaryButton.action();
                                });

                                it('should go to the editor.editCard.video state', function() {
                                    expect(c6State.goTo).toHaveBeenCalledWith('editor.editCard.video');
                                });
                            });

                            describe('enabled', function() {
                                ['anything', null].forEach(function(error) {
                                    describe('if the error is ' + error, function() {
                                        beforeEach(function() {
                                            EditorCtrl.errorForCard.and.returnValue(error);
                                        });

                                        [true, false].forEach(function(bool) {
                                            describe('if copyComplete is ' + bool, function() {
                                                beforeEach(function() {
                                                    Object.defineProperty(EditCardCtrl, 'copyComplete', {
                                                        value: bool
                                                    });
                                                });

                                                it('should be ' + bool && !error, function() {
                                                    expect(EditCardCtrl.primaryButton.enabled).toBe(bool && !error);
                                                    if (EditorCtrl.errorForCard.calls.count()) {
                                                        expect(EditorCtrl.errorForCard.calls.mostRecent().args[0]).toBe(model);
                                                    }
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });

                        describe('on the editor.editCard.video state', function() {
                            beforeEach(function() {
                                c6State.current = c6State.get('editor.editCard.video');
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
                                        expect(EditCardCtrl.primaryButton.text).toBe('Done');
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

                describe('canSave', function() {
                    function canSave() {
                        return EditCardCtrl.canSave;
                    }

                    describe('on a video or videoBallot card', function() {
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

                                model.type = 'videoBallot';
                                EditorCtrl.errorForCard.and.returnValue(null);
                                expect(canSave()).toBe(true);

                                EditorCtrl.errorForCard.and.returnValue('bar');
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
                                expect(canSave()).toBe(false);

                                onlyEmpty('videoid');
                                expect(canSave()).toBe(false);

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

            describe('$watchers', function() {
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
