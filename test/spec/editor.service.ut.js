(function() {
    'use strict';

    define(['editor'], function() {
        /* global angular:true */
        var forEach = angular.forEach;

        describe('EditorService', function() {
            var $rootScope,
                $q,
                cinema6,
                MiniReelService,
                VoteService,
                EditorService,
                _private;

            var minireel,
                editorMinireel,
                queue,
                queuedFns;

            beforeEach(function() {
                queuedFns = [];

                module('c6.mrmaker', function($provide) {
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

                    EditorService = $injector.get('EditorService');
                    _private = EditorService._private;
                });

                minireel = cinema6.db.create('experience', {
                    id: 'e-15aa87f5da34c3',
                    type: 'minireel',
                    status: 'pending',
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
                                modules: ['ballot'],
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
                    });
                });

                describe('methods', function() {
                    describe('open(minireel)', function() {
                        var proxy;

                        beforeEach(function() {
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

                        it('should save a reference to the proxy', function() {
                            expect(_private.proxy).toBe(proxy);
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

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                $rootScope.$apply(function() {
                                    EditorService.publish().then(success);
                                });
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

                    describe('sync()', function() {
                        var success, failure,
                            initVoteDeferred,
                            updateVoteDeferred,
                            saveDeferred;

                        beforeEach(function() {
                            success = jasmine.createSpy('sync() success');
                            failure = jasmine.createSpy('sync() failure');

                            saveDeferred = $q.defer();
                            initVoteDeferred = $q.defer();
                            updateVoteDeferred = $q.defer();

                            spyOn(VoteService, 'initialize').and
                                .returnValue(initVoteDeferred.promise);
                            spyOn(VoteService, 'update').and
                                .returnValue(updateVoteDeferred.promise);
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

                            it('should not save the election with status pending',function(){
                                expect(VoteService.update).not.toHaveBeenCalled();
                                expect(VoteService.initialize).not.toHaveBeenCalled();
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
                        describe('if republishing an open minireel without election',function(){
                            var proxy;

                            beforeEach(function() {
                                minireel.status = 'active';
                                delete minireel.data.election;

                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                proxy.data.title = 'Here is a New Title!';
                                proxy.data.mode = 'light';
                                proxy.data.deck.splice(1, 1);
                            });

                            describe('and election init succeeds',function(){
                                it('should init the election',function(){
                                    $rootScope.$apply(function() {
                                        EditorService.sync().then(success);
                                        initVoteDeferred.resolve();
                                    });
                                    expect(VoteService.initialize).toHaveBeenCalled();
                                });
                                
                                it('should save the MiniReel', function() {
                                    $rootScope.$apply(function() {
                                        EditorService.sync().then(success);
                                        initVoteDeferred.resolve();
                                    });
                                    expect(minireel.save).toHaveBeenCalled();
                                });
                            });
                            describe('and election init fails',function(){
                                it('should save the MiniReel', function() {
                                    $rootScope.$apply(function() {
                                        EditorService.sync().then(success).catch(failure);
                                        initVoteDeferred.reject('Failed!');
                                    });
                                    expect(minireel.save).not.toHaveBeenCalled();
                                    expect(failure).toHaveBeenCalledWith('Failed!');
                                });
                            });

                        });
                        describe('if republishing an open minireel with election',function(){
                            var proxy;
                            beforeEach(function() {
                                minireel.status = 'active';
                                $rootScope.$apply(function() {
                                    proxy = EditorService.open(minireel);
                                });

                                proxy.data.title = 'Here is a New Title!';
                                proxy.data.mode = 'light';
                                proxy.data.deck.splice(1, 1);

                                $rootScope.$apply(function() {
                                    EditorService.sync().then(success);
                                });
                            });

                            it('should update the election with election set and status active',function(){
                                expect(VoteService.update).toHaveBeenCalled();
                            });

                        });
                    });
                });
            });
        });
    });
}());
