(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var forEach = angular.forEach;

        describe('EditorService', function() {
            var $rootScope,
                $q,
                cinema6,
                MiniReelService,
                VoteService,
                EditorService,
                CollateralService,
                SettingsService,
                c6UrlParser,
                c6State, portal,
                _private;

            var minireel,
                editorMinireel,
                queue,
                queuedFns;

            beforeEach(function() {
                queuedFns = [];

                module(appModule.name, function($provide) {
                    $provide.decorator('MiniReelService', function($delegate) {
                        var originals = {
                            convertForEditor: $delegate.convertForEditor
                        };

                        $delegate.convertForEditor = jasmine.createSpy('MiniReelService.convertForEditor()')
                            .and.callFake(function() {
                                editorMinireel = originals.convertForEditor.apply($delegate, arguments);

                                return editorMinireel;
                            });

                        return $delegate;
                    });

                    $provide.decorator('c6AsyncQueue', function($delegate) {
                        return jasmine.createSpy('c6AsyncQueue()')
                            .and.callFake(function() {
                                var wrapMethod;

                                queue = $delegate.apply(null, arguments);
                                wrapMethod = queue.wrap;

                                spyOn(queue, 'wrap')
                                    .and.callFake(function() {
                                        var result = wrapMethod.apply(queue, arguments);

                                        queuedFns.push(result);

                                        return result;
                                    });

                                return queue;
                            });
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    MiniReelService = $injector.get('MiniReelService');
                    VoteService = $injector.get('VoteService');
                    cinema6 = $injector.get('cinema6');
                    CollateralService = $injector.get('CollateralService');
                    SettingsService = $injector.get('SettingsService');
                    c6UrlParser = $injector.get('c6UrlParser');
                    c6State = $injector.get('c6State');
                    portal = c6State.get('Portal');
                    portal.cModel = {};

                    EditorService = $injector.get('EditorService');
                    _private = EditorService._private;
                });

                SettingsService.register('MR::user', {
                    minireelDefaults: {
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    }
                }, {
                    localSync: false
                });

                minireel = cinema6.db.create('experience', {
                    id: 'e-15aa87f5da34c3',
                    type: 'minireel',
                    status: 'pending',
                    access: 'private',
                    created: '2014-03-13T21:53:19.218Z',
                    lastUpdated: '2014-05-06T22:07:20.132Z',
                    appUri: 'rumble',
                    org: 'o-e4e8b0f244bafc',
                    user: 'u-a1a04b217bc7fc',
                    data: {
                        title: 'My MiniReel',
                        mode: 'lightbox',
                        autoplay: true,
                        election: 'el-76506623bf22d9',
                        branding: 'elitedaily',
                        collateral: {
                            splash: 'splash.jpg'
                        },
                        splash: {
                            source: 'specified',
                            ratio: '1-1',
                            theme: 'img-only'
                        },
                        deck: [
                            {
                                id: 'rc-c9cf24e87307ac',
                                type: 'youtube',
                                title: 'The Slowest Turtle',
                                note: 'Blah blah blah',
                                source: 'YouTube',
                                modules: [],
                                data: {
                                    videoid: '47tfg8734',
                                    start: 10,
                                    end: 40,
                                    rel: 0,
                                    modestbranding: 0
                                }
                            },
                            {
                                id: 'rc-17721b74ce2584',
                                type: 'vimeo',
                                title: 'The Ugliest Turtle',
                                note: 'Blah blah blah',
                                source: 'Vimeo',
                                modules: ['ballot'],
                                ballot: {
                                    prompt: 'Was it ugly?',
                                    choices: [
                                        'Really Ugly',
                                        'Not That Ugly'
                                    ]
                                },
                                data: {
                                    videoid: '48hfrei49'
                                }
                            },
                            {
                                id: 'rc-61fa9683714e13',
                                type: 'dailymotion',
                                title: 'The Smartest Turtle',
                                note: 'Blah blah blah',
                                source: 'DailyMotion',
                                modules: ['post'],
                                sponsored: true,
                                ballot: {
                                    prompt: 'How smart was it?',
                                    choices: [
                                        'Really Smart',
                                        'Pretty Stupid'
                                    ]
                                },
                                data: {
                                    videoid: 'vfu85f5',
                                    related: 0
                                }
                            },
                            {
                                id: 'rc-b74a127991ee75',
                                type: 'recap',
                                title: 'Recap',
                                note: null,
                                modules: [],
                                data: {}
                            }
                        ]
                    }
                });
            });

            it('should exist', function() {
                expect(EditorService).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {
                describe('properties', function() {
                    describe('minireel, editorMinireel and proxy', function() {
                        it('should be null', function() {
                            ['minireel', 'editorMinireel', 'proxy']
                                .forEach(function(prop) {
                                    expect(_private[prop]).toBeNull('_private.' + prop);
                                });
                        });
                    });
                });

                describe('methods', function() {
                    describe('performPresync(proxy)', function() {
                        var proxy, success,
                            generateCollageDeferred;

                        beforeEach(function() {
                            success = jasmine.createSpy('success()');

                            generateCollageDeferred = $q.defer();

                            spyOn(CollateralService, 'generateCollage').and.returnValue(generateCollageDeferred.promise);

                            $rootScope.$apply(function() {
                                proxy = EditorService.open(minireel);
                            });

                            $rootScope.$apply(function() {
                                _private.performPresync(proxy).then(success);
                            });
                        });

                        describe('if the splash.source is specified', function() {
                            beforeEach(function() {
                                proxy.data.splash.source = 'specified';

                                $rootScope.$apply(function() {
                                    _private.performPresync(proxy).then(success);
                                });
                            });

                            it('should not generate a splash image', function() {
                                expect(CollateralService.generateCollage).not.toHaveBeenCalled();
                            });
                        });

                        describe('if the splash.source is generated', function() {
                            beforeEach(function() {
                                proxy.data.splash.source = 'generated';

                                $rootScope.$apply(function() {
                                    _private.performPresync(proxy).then(success);
                                });
                            });

                            it('should generate a splash image', function() {
                                expect(CollateralService.generateCollage).toHaveBeenCalledWith({
                                    minireel: proxy,
                                    name: 'splash',
                                    cache: false
                                });
                            });

                            describe('if the minireel is published', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        generateCollageDeferred.reject('ERROR');
                                    });

                                    _private.editorMinireel.status = 'active';

                                    CollateralService.generateCollage.calls.reset();
                                    $rootScope.$apply(function() {
                                        _private.performPresync(proxy).then(success);
                                    });
                                });

                                it('should cache the image', function() {
                                    expect(CollateralService.generateCollage).toHaveBeenCalledWith({
                                        minireel: proxy,
                                        name: 'splash',
                                        cache: true
                                    });
                                });
                            });

                            describe('if the generation fails', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        generateCollageDeferred.reject('ERROR');
                                    });
                                });

                                it('should still succeed', function() {
                                    expect(success).toHaveBeenCalledWith(proxy);
                                });
                            });

                            describe('if the generation succeeds', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        generateCollageDeferred.resolve({
                                            '16-9': '/collateral/e-123/splash',
                                            toString: function() {
                                                return this['16-9'];
                                            }
                                        });
                                    });
                                });

                                it('should set the collateral splash as the generated image', function() {
                                    expect(proxy.data.collateral.splash).toBe('/collateral/e-123/splash');
                                });

                                it('should succeed', function() {
                                    expect(success).toHaveBeenCalledWith(proxy);
                                });
                            });
                        });
                    });

                    describe('syncToMinireel(minireel, editorMinireel, proxy)', function() {
                        var proxy, editorMinireel,
                            result;

                        beforeEach(function() {
                            spyOn(MiniReelService, 'convertForPlayer').and.callThrough();

                            proxy = EditorService.open(minireel);
                            editorMinireel = _private.editorMinireel;

                            proxy.data.title = 'This is New!';
                            proxy.data.mode = 'lightbox-ads';

                            result = _private.syncToMinireel(minireel, editorMinireel, proxy);
                        });

                        it('should return the minireel', function() {
                            expect(result).toBe(minireel);
                        });

                        it('should copy the data of the proxy to the editorMinireel', function() {
                            expect(editorMinireel.data).toEqual(proxy.data);
                            expect(editorMinireel.data).not.toBe(proxy.data);
                        });

                        it('should convert the editorMinireel to the minireel', function() {
                            expect(MiniReelService.convertForPlayer).toHaveBeenCalledWith(editorMinireel, minireel);
                        });
                    });

                    describe('syncToProxy(proxy, editorMinireel, minireel)', function() {
                        var proxy, editorMinireel,
                            nowISO,
                            result;

                        beforeEach(function() {
                            proxy = EditorService.open(minireel);
                            editorMinireel = _private.editorMinireel;

                            nowISO = new Date().toISOString();

                            minireel.lastUpdated = nowISO;
                            minireel.newField = 'foo foo';
                            delete minireel.org;
                            minireel.data.deck[1].ballot.election = 'el-04c9fbeb92c53b';
                            minireel.data.deck[2].ballot.election = 'el-4f1fe77257a6bb';
                            minireel.data.election = 'el-621d99c034e72f';
                            minireel.data.deck.splice(0, 1);

                            MiniReelService.convertForEditor.calls.reset();

                            result = _private.syncToProxy(proxy, editorMinireel, minireel);
                        });

                        it('should return the proxy', function() {
                            expect(result).toBe(proxy);
                        });

                        it('should convert the minireel back to the editorMinireel', function() {
                            expect(MiniReelService.convertForEditor).toHaveBeenCalledWith(minireel, editorMinireel);
                        });

                        it('should propagate changes back to the proxy', function() {
                            expect(proxy.lastUpdated).toBe(nowISO);
                            expect(function() {
                                proxy.lastUpdated = 'false date';
                            }).toThrow();

                            expect(proxy.newField).toBe(minireel.newField);
                            expect(function() {
                                proxy.newField = 'bar bar';
                            }).toThrow();

                            expect(proxy.hasOwnProperty('org')).toBe(false);

                            expect(proxy.data.deck[1].data.ballot.election).toBe(minireel.data.deck[0].ballot.election);
                            expect(proxy.data.deck[2].data.survey.election).toBe(minireel.data.deck[1].ballot.election);
                            expect(proxy.data.election).toBe(minireel.data.election);
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('properties', function() {
                    describe('state', function() {
                        var state;

                        beforeEach(function() {
                            state = EditorService.state;
                        });

                        describe('dirty', function() {
                            describe('if there is no open minireel', function() {
                                it('should be null', function() {
                                    expect(EditorService.state.dirty).toBeNull();
                                });
                            });

                            describe('if there is an open minireel', function() {
                                var proxy, editorMinireel;

                                beforeEach(function() {
                                    proxy = EditorService.open(minireel);
                                    editorMinireel = _private.editorMinireel;
                                });

                                it('should be true if the editorMinireel and proxy are not the same', function() {
                                    expect(state.dirty).toBe(false);

                                    proxy.data.title = 'Foo';
                                    expect(state.dirty).toBe(true);

                                    proxy.data.deck.splice(0, 1);
                                    expect(state.dirty).toBe(true);

                                    _private.syncToMinireel(minireel, editorMinireel, proxy);
                                    expect(state.dirty).toBe(false);

                                    proxy.data.mode = 'full';
                                    expect(state.dirty).toBe(true);
                                });
                            });
                        });

                        describe('inFlight', function() {
                            it('should be true if there is more than one async task in the queue', function() {
                                expect(state.inFlight).toBe(false);

                                queue.queue.push({});
                                expect(state.inFlight).toBe(true);

                                queue.queue.push({});
                                expect(state.inFlight).toBe(true);

                                queue.queue.length = 0;
                                expect(state.inFlight).toBe(false);
                            });
                        });

                        describe('minireel', function() {
                            it('should be the proxy', function() {
                                expect(state.minireel).toBe(_private.proxy);

                                _private.proxy = {};
                                expect(state.minireel).toBe(_private.proxy);

                                _private.proxy = {};
                                expect(state.minireel).toBe(_private.proxy);
                            });
                        });
                    });
                });

                describe('methods', function() {
                    describe('open(minireel)', function() {
                        var proxy;

                        beforeEach(function() {
                            spyOn(SettingsService, 'createBinding').and.callThrough();
                            $rootScope.$apply(function() {
                                proxy = EditorService.open(minireel);
                            });
                        });

                        it('should save a reference to the minireel', function() {
                            expect(_private.minireel).toBe(minireel);
                        });

                        it('should save a reference to the converted minireel', function() {
                            expect(MiniReelService.convertForEditor).toHaveBeenCalled();

                            expect(_private.editorMinireel).toBe(editorMinireel);
                        });

                        it('should return a copy of the editor minireel where only the "data" properties are mutable', function() {
                            expect(proxy).toEqual(editorMinireel);
                            expect(proxy).not.toBe(editorMinireel);
                            expect(proxy.data).toEqual(editorMinireel.data);
                            expect(proxy.data).not.toBe(editorMinireel.data);

                            forEach(proxy, function(value, key) {
                                expect(function() {
                                    proxy[key] += 'foo';
                                }).toThrow();
                                expect(proxy[key]).toBe(value);
                            });

                            forEach(proxy.data, function(value, key) {
                                expect(function() {
                                    proxy.data[key] += 'foo';
                                }).not.toThrow();
                                expect(proxy.data[key]).not.toBe(value);
                            });
                        });

                        it('should set up bindings to the splash ratio and theme', function() {
                            expect(SettingsService.createBinding).toHaveBeenCalledWith(proxy.data.splash, 'ratio', 'MR::user.minireelDefaults.splash.ratio');
                            expect(SettingsService.createBinding).toHaveBeenCalledWith(proxy.data.splash, 'theme', 'MR::user.minireelDefaults.splash.theme');
                            expect(proxy.data.splash.ratio).toBe(minireel.data.splash.ratio);
                            expect(proxy.data.splash.theme).toBe(minireel.data.splash.theme);
                        });

                        it('should save a reference to the proxy', function() {
                            expect(_private.proxy).toBe(proxy);
                        });
                    });

                    describe('enablePreview()', function() {
                        var success, failure,
                            enablePreviewDeferred;

                        beforeEach(function() {
                            enablePreviewDeferred = $q.defer();

                            spyOn(MiniReelService, 'enablePreview').and.returnValue(enablePreviewDeferred.promise);

                            success = jasmine.createSpy('success');
                            failure = jasmine.createSpy('failure');
                        });

                        it('should be wrapped in an async queue', function() {
                            expect(queuedFns).toContain(EditorService.enablePreview);
                        });

                        describe('if there is no open minireel', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    EditorService.enablePreview().catch(failure);
                                });
                            });

                            it('should return a rejected promise', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('if there is an open minireel', function() {
                            var proxy;

                            beforeEach(function() {
                                spyOn(_private, 'syncToMinireel').and.callThrough();
                                spyOn(_private, 'syncToProxy').and.callThrough();
                                spyOn(_private, 'performPresync').and.returnValue($q.when());

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                $rootScope.$apply(function() {
                                    EditorService.enablePreview().then(success);
                                });
                            });

                            it('should do a presync', function() {
                                expect(_private.performPresync).toHaveBeenCalledWith(proxy);
                            });

                            it('should sync the proxy to the minireel', function() {
                                expect(_private.syncToMinireel).toHaveBeenCalledWith(minireel, _private.editorMinireel, proxy);
                            });

                            it('should enable preview on the minireel', function() {
                                expect(MiniReelService.enablePreview).toHaveBeenCalledWith(minireel);
                            });

                            describe('when enabling the preview is completed', function() {
                                beforeEach(function() {
                                    expect(_private.syncToProxy).not.toHaveBeenCalled();

                                    minireel.access = 'public';

                                    $rootScope.$apply(function() {
                                        enablePreviewDeferred.resolve(minireel);
                                    });
                                });

                                it('should sync the minireel back to the proxy', function() {
                                    expect(_private.syncToProxy).toHaveBeenCalledWith(proxy, _private.editorMinireel, minireel);
                                });

                                it('should make sure the proxy gets the election and status', function() {
                                    expect(proxy.access).toBe('public');
                                });

                                it('should resolve to the proxy', function() {
                                    expect(success).toHaveBeenCalledWith(proxy);
                                });
                            });
                        });
                    });

                    describe('disablePreview()', function() {
                        var success, failure,
                            disablePreviewDeferred;

                        beforeEach(function() {
                            disablePreviewDeferred = $q.defer();

                            spyOn(MiniReelService, 'disablePreview').and.returnValue(disablePreviewDeferred.promise);

                            minireel.access = 'public';

                            success = jasmine.createSpy('success');
                            failure = jasmine.createSpy('failure');
                        });

                        it('should be wrapped in an async queue', function() {
                            expect(queuedFns).toContain(EditorService.disablePreview);
                        });

                        describe('if there is no open minireel', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    EditorService.disablePreview().catch(failure);
                                });
                            });

                            it('should return a rejected promise', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('if there is an open minireel', function() {
                            var proxy;

                            beforeEach(function() {
                                spyOn(_private, 'syncToMinireel').and.callThrough();
                                spyOn(_private, 'syncToProxy').and.callThrough();
                                spyOn(_private, 'performPresync').and.returnValue($q.when());

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                $rootScope.$apply(function() {
                                    EditorService.disablePreview().then(success);
                                });
                            });

                            it('should do a presync', function() {
                                expect(_private.performPresync).toHaveBeenCalledWith(proxy);
                            });

                            it('should sync the proxy to the minireel', function() {
                                expect(_private.syncToMinireel).toHaveBeenCalledWith(minireel, _private.editorMinireel, proxy);
                            });

                            it('should enable preview on the minireel', function() {
                                expect(MiniReelService.disablePreview).toHaveBeenCalledWith(minireel);
                            });

                            describe('when enabling the preview is completed', function() {
                                beforeEach(function() {
                                    expect(_private.syncToProxy).not.toHaveBeenCalled();

                                    minireel.access = 'private';

                                    $rootScope.$apply(function() {
                                        disablePreviewDeferred.resolve(minireel);
                                    });
                                });

                                it('should sync the minireel back to the proxy', function() {
                                    expect(_private.syncToProxy).toHaveBeenCalledWith(proxy, _private.editorMinireel, minireel);
                                });

                                it('should make sure the proxy gets the election and status', function() {
                                    expect(proxy.access).toBe('private');
                                });

                                it('should resolve to the proxy', function() {
                                    expect(success).toHaveBeenCalledWith(proxy);
                                });
                            });
                        });
                    });

                    describe('publish()', function() {
                        var success, failure,
                            publishDeferred;

                        beforeEach(function() {
                            publishDeferred = $q.defer();

                            spyOn(MiniReelService, 'publish').and.returnValue(publishDeferred.promise);

                            success = jasmine.createSpy('success');
                            failure = jasmine.createSpy('failure');
                        });

                        it('should be wrapped in an async queue', function() {
                            expect(queuedFns).toContain(EditorService.publish);
                        });

                        describe('if there is no open minireel', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    EditorService.publish().catch(failure);
                                });
                            });

                            it('should return a rejected promise', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('if there is an open minireel', function() {
                            var proxy;

                            beforeEach(function() {
                                spyOn(_private, 'syncToMinireel').and.callThrough();
                                spyOn(_private, 'syncToProxy').and.callThrough();
                                spyOn(_private, 'performPresync').and.returnValue($q.when());

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                $rootScope.$apply(function() {
                                    EditorService.publish().then(success);
                                });
                            });

                            it('should do a presync', function() {
                                expect(_private.performPresync).toHaveBeenCalledWith(proxy);
                            });

                            it('should sync the proxy to the minireel', function() {
                                expect(_private.syncToMinireel).toHaveBeenCalledWith(minireel, _private.editorMinireel, proxy);
                            });

                            it('should publish the minireel', function() {
                                expect(MiniReelService.publish).toHaveBeenCalledWith(minireel);
                            });

                            describe('when the publish is completed', function() {
                                beforeEach(function() {
                                    expect(_private.syncToProxy).not.toHaveBeenCalled();

                                    minireel.data.election = 'el-645f058eb8923c';
                                    minireel.status = 'active';

                                    $rootScope.$apply(function() {
                                        publishDeferred.resolve(minireel);
                                    });
                                });

                                it('should sync the minireel back to the proxy', function() {
                                    expect(_private.syncToProxy).toHaveBeenCalledWith(proxy, _private.editorMinireel, minireel);
                                });

                                it('should make sure the proxy gets the election and status', function() {
                                    expect(proxy.data.election).toBe(minireel.data.election);
                                    expect(proxy.status).toBe('active');
                                });

                                it('should resolve to the proxy', function() {
                                    expect(success).toHaveBeenCalledWith(proxy);
                                });
                            });
                        });
                    });

                    describe('unpublish()', function() {
                        var success, failure,
                            unpublishDeferred;

                        beforeEach(function() {
                            unpublishDeferred = $q.defer();

                            spyOn(MiniReelService, 'unpublish').and.returnValue(unpublishDeferred.promise);
                            spyOn(_private, 'performPresync').and.returnValue($q.when());

                            minireel.status = 'active';

                            success = jasmine.createSpy('success');
                            failure = jasmine.createSpy('failure');
                        });

                        it('should be wrapped in an async queue', function() {
                            expect(queuedFns).toContain(EditorService.unpublish);
                        });

                        describe('if there is no open minireel', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    EditorService.unpublish().catch(failure);
                                });
                            });

                            it('should return a rejected promise', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('if there is an open minireel', function() {
                            var proxy;

                            beforeEach(function() {
                                spyOn(_private, 'syncToMinireel').and.callThrough();
                                spyOn(_private, 'syncToProxy').and.callThrough();

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                $rootScope.$apply(function() {
                                    EditorService.unpublish().then(success);
                                });
                            });

                            it('should perform a presync', function() {
                                expect(_private.performPresync).toHaveBeenCalledWith(proxy);
                            });

                            it('should sync the proxy to the minireel', function() {
                                expect(_private.syncToMinireel).toHaveBeenCalledWith(minireel, _private.editorMinireel, proxy);
                            });

                            it('should unpublish the minireel', function() {
                                expect(MiniReelService.unpublish).toHaveBeenCalledWith(minireel);
                            });

                            describe('when the publish is completed', function() {
                                beforeEach(function() {
                                    expect(_private.syncToProxy).not.toHaveBeenCalled();

                                    minireel.status = 'pending';

                                    $rootScope.$apply(function() {
                                        unpublishDeferred.resolve(minireel);
                                    });
                                });

                                it('should sync the minireel back to the proxy', function() {
                                    expect(_private.syncToProxy).toHaveBeenCalledWith(proxy, _private.editorMinireel, minireel);
                                });

                                it('should make sure the proxy gets the status', function() {
                                    expect(proxy.status).toBe('pending');
                                });

                                it('should resolve to the proxy', function() {
                                    expect(success).toHaveBeenCalledWith(proxy);
                                });
                            });
                        });
                    });

                    describe('erase()', function() {
                        var eraseDeferred,
                            success, failure;

                        beforeEach(function() {
                            eraseDeferred = $q.defer();

                            success = jasmine.createSpy('erase() success');
                            failure = jasmine.createSpy('erase() failure');

                            spyOn(MiniReelService, 'erase').and.returnValue(eraseDeferred.promise);
                        });

                        it('should be wrapped in an async queue', function() {
                            expect(queuedFns).toContain(EditorService.erase);
                        });

                        describe('if there is no open minireel', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    EditorService.erase().catch(failure);
                                });
                            });

                            it('should return a rejected promise', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('if there is an open minireel', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    EditorService.open(minireel);
                                });

                                $rootScope.$apply(function() {
                                    EditorService.erase().then(success);
                                });
                            });

                            it('should erase the MiniReel', function() {
                                expect(MiniReelService.erase).toHaveBeenCalledWith(minireel);
                            });

                            describe('when the erase completes', function() {
                                beforeEach(function() {
                                    expect(success).not.toHaveBeenCalled();

                                    $rootScope.$apply(function() {
                                        eraseDeferred.resolve(null);
                                    });
                                });

                                it('should resolve the promise', function() {
                                    expect(success).toHaveBeenCalledWith(null);
                                });
                            });
                        });
                    });

                    describe('close()', function() {
                        beforeEach(function() {
                            EditorService.open(minireel);

                            EditorService.close();
                        });

                        it('should remove references to the minireels', function() {
                            ['minireel', 'editorMinireel', 'proxy']
                                .forEach(function(prop) {
                                    expect(_private[prop]).toBeNull('_private.' + prop);
                                });
                        });
                    });

                    describe('beforeSync(id, fn)', function() {
                        var proxy,
                            success;

                        beforeEach(function() {
                            success = jasmine.createSpy('success');
                            proxy = EditorService.open(minireel);
                        });

                        it('should call all of the functions at the start of a sync', function() {
                            var deferred1 = $q.defer(),
                                deferred2 = $q.defer();

                            var fn1 = jasmine.createSpy('fn1()')
                                .and.returnValue(deferred1.promise),
                                fn2 = jasmine.createSpy('fn2()')
                                    .and.returnValue(deferred2.promise);

                            EditorService.beforeSync('one', fn1);
                            EditorService.beforeSync('two', fn2);

                            $rootScope.$apply(function() {
                                _private.performPresync(proxy).then(success);
                            });

                            expect(fn1).toHaveBeenCalledWith(proxy);
                            expect(fn2).toHaveBeenCalledWith(proxy);

                            expect(success).not.toHaveBeenCalled();

                            $rootScope.$apply(function() {
                                deferred1.resolve();
                            });

                            expect(success).not.toHaveBeenCalled();

                            $rootScope.$apply(function() {
                                deferred2.resolve(proxy);
                            });

                            expect(success).toHaveBeenCalledWith(proxy);
                        });

                        it('should not call a function over multiple syncs', function() {
                            var fn = jasmine.createSpy('fn()');

                            EditorService.beforeSync('foo', fn);

                            $rootScope.$apply(function() {
                                _private.performPresync(proxy).then(success);
                            });
                            expect(success).toHaveBeenCalled();
                            fn.calls.reset();

                            $rootScope.$apply(function() {
                                _private.performPresync(proxy).then(success);
                            });
                            expect(fn).not.toHaveBeenCalled();
                        });

                        it('should only keep one function per id', function() {
                            var fn1 = jasmine.createSpy('fn1()'),
                                fn2 = jasmine.createSpy('fn2()');

                            EditorService.beforeSync('fn', fn1);
                            EditorService.beforeSync('fn', fn2);

                            $rootScope.$apply(function() {
                                _private.performPresync(proxy).then(success);
                            });

                            expect(fn2).toHaveBeenCalledWith(proxy);
                            expect(fn1).not.toHaveBeenCalled();
                        });
                    });

                    describe('sync()', function() {
                        var success, failure,
                            syncVoteDeferred,
                            saveDeferred;

                        beforeEach(function() {
                            success = jasmine.createSpy('sync() success');
                            failure = jasmine.createSpy('sync() failure');

                            saveDeferred = $q.defer();
                            syncVoteDeferred = $q.defer();

                            spyOn(VoteService, 'sync').and
                                .returnValue(syncVoteDeferred.promise);
                            spyOn(minireel, 'save').and.returnValue(saveDeferred.promise);
                        });

                        it('should be wrapped in an async queue', function() {
                            expect(queuedFns).toContain(EditorService.sync);
                        });

                        describe('if there is no open minireel', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    EditorService.sync().catch(failure);
                                });
                            });

                            it('should return a rejected promise', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('if there is an open MiniReel', function() {
                            var proxy;

                            beforeEach(function() {
                                spyOn(MiniReelService, 'convertForPlayer').and.callThrough();
                                spyOn(_private, 'performPresync').and.returnValue($q.when());

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                proxy.data.title = 'Here is a New Title!';
                                proxy.data.mode = 'light';
                                proxy.data.deck.splice(1, 1);

                                $rootScope.$apply(function() {
                                    EditorService.sync().then(success);
                                });

                                MiniReelService.convertForEditor.calls.reset();
                            });

                            it('should perform a presync', function() {
                                expect(_private.performPresync).toHaveBeenCalledWith(proxy);
                            });

                            it('should not save the election with status pending',function(){
                                expect(VoteService.sync).not.toHaveBeenCalled();
                            });

                            it('should copy the data from the proxy to the editor minireel', function() {
                                expect(proxy.data).toEqual(_private.editorMinireel.data);
                                expect(proxy.data).not.toBe(_private.editorMinireel.data);
                            });

                            it('should convert the editorMinireel to the player Minireel', function() {
                                expect(MiniReelService.convertForPlayer).toHaveBeenCalledWith(_private.editorMinireel, minireel);
                            });

                            it('should save the MiniReel', function() {
                                expect(minireel.save).toHaveBeenCalled();
                            });

                            describe('after the save completes', function() {
                                var nowISO;

                                beforeEach(function() {
                                    nowISO = new Date().toISOString();

                                    minireel.lastUpdated = nowISO;
                                    minireel.newField = 'foo foo';
                                    delete minireel.org;

                                    expect(MiniReelService.convertForEditor).not.toHaveBeenCalled();
                                    $rootScope.$apply(function() {
                                        saveDeferred.resolve(minireel);
                                    });
                                });

                                it('should convert the player-formatted minireel back to the editor format', function() {
                                    expect(MiniReelService.convertForEditor).toHaveBeenCalledWith(minireel, editorMinireel);
                                });

                                it('should propagate changes back to the proxy', function() {
                                    expect(proxy.lastUpdated).toBe(nowISO);
                                    expect(function() {
                                        proxy.lastUpdated = 'false date';
                                    }).toThrow();

                                    expect(proxy.newField).toBe(minireel.newField);
                                    expect(function() {
                                        proxy.newField = 'bar bar';
                                    }).toThrow();

                                    expect(proxy.hasOwnProperty('org')).toBe(false);
                                });

                                it('should resolve to the proxy', function() {
                                    expect(success).toHaveBeenCalledWith(proxy);
                                });
                            });
                        });
                        describe('if republishing an open minireel',function(){
                            var proxy;

                            beforeEach(function() {
                                minireel.status = 'active';

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                proxy.data.title = 'Here is a New Title!';
                                proxy.data.mode = 'light';
                                proxy.data.deck.splice(1, 1);
                            });

                            describe('and election sync succeeds',function(){
                                it('should sync the election',function(){
                                    $rootScope.$apply(function() {
                                        EditorService.sync().then(success);
                                        syncVoteDeferred.resolve(minireel);
                                    });
                                    expect(VoteService.sync).toHaveBeenCalledWith(minireel);
                                });

                                it('should save the MiniReel', function() {
                                    $rootScope.$apply(function() {
                                        EditorService.sync().then(success);
                                        syncVoteDeferred.resolve(minireel);
                                    });
                                    expect(minireel.save).toHaveBeenCalled();
                                });
                            });
                            describe('and election init fails',function(){
                                it('should save the MiniReel', function() {
                                    $rootScope.$apply(function() {
                                        EditorService.sync().then(success).catch(failure);
                                        syncVoteDeferred.reject('Failed!');
                                    });
                                    expect(minireel.save).not.toHaveBeenCalled();
                                    expect(failure).toHaveBeenCalledWith('Failed!');
                                });
                            });

                        });
                    });
                });
            });
        });
    });
}());
