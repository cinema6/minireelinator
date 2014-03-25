(function() {
    'use strict';

    define(['c6_state'], function() {
        describe('c6State', function() {
            var $rootScope,
                $q,
                c6StateProvider,
                $templateCache,
                $log,
                c6State,
                c6StateParams,
                _service;

            var $httpBackend;

            beforeEach(function() {
                module('c6.state', function($injector) {
                    c6StateProvider = $injector.get('c6StateProvider');
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    $templateCache = $injector.get('$templateCache');
                    $log = $injector.get('$log');

                    $httpBackend = $injector.get('$httpBackend');

                    c6State = $injector.get('c6State');
                    c6StateParams = $injector.get('c6StateParams');
                    _service = c6State._private;
                });
            });

            describe('the provider', function() {
                it('should exist', function() {
                    expect(c6StateProvider).toEqual(jasmine.any(Object));
                });
            });

            describe('the service', function() {
                var aboutModelSpy,
                    contactBeforeModelSpy,
                    contactModelSpy,
                    contactAfterModelSpy,
                    handleErrorSpy;

                var fakeUser,
                    homeState,
                    aboutState,
                    contactState,
                    parentState,
                    childState1,
                    childState2,
                    grandchildState;

                beforeEach(function() {
                    fakeUser = {
                        name: 'Cinema6'
                    };

                    aboutModelSpy = jasmine.createSpy('aboutModelSpy');
                    contactBeforeModelSpy = jasmine.createSpy('contactBeforeModelSpy')
                        .and.callFake(function($q) {
                            return $q.reject('I am rejected');
                        });
                    contactModelSpy = jasmine.createSpy('contactModelSpy')
                        .and.callFake(function($q) {
                            return $q.when(fakeUser);
                        });
                    contactAfterModelSpy = jasmine.createSpy('contactAfterModelSpy');
                    handleErrorSpy = jasmine.createSpy('handleErrorSpy')
                        .and.callFake(function() {
                            return {};
                        });

                    homeState = {
                        controller: 'HomeController'
                    };
                    aboutState = {
                        controller: 'AboutController',
                        model: ['c6StateParams', aboutModelSpy]
                    };
                    contactState = {
                        controller: 'ContactController',
                        beforeModel: ['$q', contactBeforeModelSpy],
                        model: ['$q', contactModelSpy],
                        afterModel: ['model', contactAfterModelSpy],
                        handleError: ['error', handleErrorSpy]
                    };
                    grandchildState = {
                        controller: 'GrandchildController'
                    };
                    childState1 = {
                        controller: 'Child1Controller'
                    };
                    childState2 = {
                        controller: 'Child2Controller',
                        children: {
                            grandchild: grandchildState
                        }
                    };
                    parentState = {
                        children: {
                            child1: childState1,
                            child2: childState2
                        }
                    };

                    c6StateProvider
                        .state('home', homeState)
                        .state('about', aboutState)
                        .state('contact', contactState)
                        .state('parent', parentState)
                        .index('home');
                });

                it('should exist', function() {
                    expect(c6State).toEqual(jasmine.any(Object));
                });

                describe('when viewReady is emitted', function() {
                    var transition;

                    beforeEach(function() {
                        transition = $q.defer();

                        spyOn($log, 'error');
                        spyOn(c6State, 'transitionTo').and.returnValue(transition.promise);
                    });

                    describe('if there is no current state', function() {
                        beforeEach(function() {
                            c6State.emit('viewReady');
                        });

                        it('should transition to the index state', function() {
                            expect(c6State.transitionTo).toHaveBeenCalledWith('home');
                        });

                        describe('if the transition fails', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    transition.reject('I failed for blah blah blah.');
                                });
                            });

                            it('should log the error', function() {
                                expect($log.error).toHaveBeenCalledWith('I failed for blah blah blah.');
                            });
                        });
                    });

                    describe('if there is a current state', function() {
                        beforeEach(function() {
                            c6State.current = homeState;
                            c6State.emit('viewReady');
                        });

                        it('should do nothing', function() {
                            expect(c6State.transitionTo).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('@private', function() {
                    describe('methods', function() {
                        describe('resolveState(state)', function() {
                            var resolveStateSpy;

                            beforeEach(function() {
                                resolveStateSpy = jasmine.createSpy('resolve state');

                                spyOn(_service, 'resolveState').and.callThrough();
                            });

                            it('should call all the hooks in order', function() {
                                _service.resolveState(contactState).then(resolveStateSpy);
                                expect(contactState.cModel).toBeNull();

                                $rootScope.$digest();
                                expect(contactBeforeModelSpy).toHaveBeenCalledWith($q);
                                expect(handleErrorSpy).toHaveBeenCalledWith('I am rejected');
                                expect(contactModelSpy).toHaveBeenCalledWith($q);
                                expect(contactAfterModelSpy).toHaveBeenCalledWith(fakeUser);
                                expect(resolveStateSpy).toHaveBeenCalledWith(contactState);
                                expect(contactState.cModel).toBe(fakeUser);
                            });

                            it('should not fail if some hooks are missing', function() {
                                _service.resolveState({}).then(resolveStateSpy);

                                $rootScope.$digest();
                                expect(resolveStateSpy).toHaveBeenCalledWith({ cTemplate: null, cModel: null });
                            });

                            it('should propagate a failure if there is no error hander', function() {
                                var errorSpy = jasmine.createSpy('error');

                                $rootScope.$apply(function() {
                                    _service.resolveState({
                                        beforeModel: function() {
                                            return $q.reject('I failed!');
                                        }
                                    }).catch(errorSpy);
                                });

                                expect(errorSpy).toHaveBeenCalledWith('I failed!');
                            });

                            describe('if there is no template or templateUrl', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        _service.resolveState(homeState);
                                    });
                                });

                                it('should leave cTemplate as null', function() {
                                    expect(homeState.cTemplate).toBeNull();
                                });
                            });

                            describe('if there is a template', function() {
                                beforeEach(function() {
                                    homeState.template = '<div>Hello</div>';

                                    $rootScope.$apply(function() {
                                        _service.resolveState(homeState);
                                    });
                                });

                                it('should set cTemplate to be the provided template', function() {
                                    expect(homeState.cTemplate).toBe(homeState.template);
                                });
                            });

                            describe('if there is a templateUrl', function() {
                                beforeEach(function() {
                                    homeState.templateUrl = 'assets/views/home.html';

                                    $httpBackend.expectGET('assets/views/home.html')
                                        .respond(200, '<div>Home Page!</div>');

                                    $rootScope.$apply(function() {
                                        _service.resolveState(homeState);
                                    });

                                    $httpBackend.flush();
                                });

                                it('should store the result in the template cache', function() {
                                    expect($templateCache.get('assets/views/home.html')).toEqual([200, '<div>Home Page!</div>', jasmine.any(Object)]);
                                });

                                it('should set cTemplate to be the result of the HTML file', function() {
                                    expect(homeState.cTemplate).toBe('<div>Home Page!</div>');
                                });
                            });
                        });
                    });
                });

                describe('@public', function() {
                    describe('properties', function() {
                        describe('current', function() {
                            it('should be initialized as null', function() {
                                expect(c6State.current).toBeNull();
                            });
                        });

                        describe('transitions', function() {
                            it('should be initialized as an empty hash', function() {
                                expect(c6State.transitions).toEqual({});
                            });
                        });
                    });

                    describe('methods', function() {
                        describe('get(state)', function() {
                            it('should get the state object for a given name', function() {
                                expect(c6State.get('home')).toBe(homeState);
                                expect(c6State.get('about')).toBe(aboutState);
                                expect(c6State.get('contact')).toBe(contactState);
                            });
                        });

                        describe('transitionTo(state, params)', function() {
                            var transition1,
                                transition2,
                                resolveState;

                            function finish(state) {
                                $rootScope.$apply(function() {
                                    resolveState.resolve(state);
                                });
                                $rootScope.$apply(function() {
                                    c6State.emit('viewChangeSuccess', state);
                                });
                            }

                            beforeEach(function() {
                                transition1 = $q.defer();
                                transition2 = $q.defer();

                                spyOn(_service, 'resolveState').and.callFake(function() {
                                    resolveState = $q.defer();

                                    return resolveState.promise;
                                });
                                spyOn(c6State, 'emit').and.callThrough();
                            });

                            it('should transition to nested states', function() {
                                var success = jasmine.createSpy('transitionTo() success');

                                $rootScope.$apply(function() {
                                    c6State.transitionTo('parent.child1').then(success);
                                });

                                expect(c6State.emit).toHaveBeenCalledWith('transitionStart', parentState, null);
                                $rootScope.$apply(function() {
                                    resolveState.resolve(parentState);
                                });
                                expect(c6State.emit).toHaveBeenCalledWith('viewChangeStart', parentState, null);

                                finish(parentState);
                                expect(c6State.emit).toHaveBeenCalledWith('transitionStart', childState1, parentState);
                                $rootScope.$apply(function() {
                                    resolveState.resolve(childState1);
                                });
                                expect(c6State.emit).toHaveBeenCalledWith('viewChangeStart', childState1, parentState);
                                finish(childState1);

                                expect(success).toHaveBeenCalledWith(childState1);
                            });

                            it('should support "backing out" of nested states', function() {
                                $rootScope.$apply(function() {
                                    c6State.transitionTo('parent.child2.grandchild');
                                });
                                finish(parentState);
                                finish(childState2);
                                finish(grandchildState);

                                c6State.emit.calls.reset();
                                _service.resolveState.calls.reset();

                                $rootScope.$apply(function() {
                                    c6State.transitionTo('parent.child2');
                                });
                                expect(_service.resolveState.calls.count()).toBe(1);
                                $rootScope.$apply(function() {
                                    resolveState.resolve(childState2);
                                });
                                expect(c6State.emit).toHaveBeenCalledWith('viewChangeStart', childState2, grandchildState);
                                finish(childState2);

                                expect(c6State.current).toBe(childState2);
                            });

                            it('should emit transitionStart with the new and previous state', function() {
                                $rootScope.$apply(function() {
                                    c6State.transitionTo('home');
                                });
                                expect(c6State.emit).toHaveBeenCalledWith('transitionStart', homeState, null);
                                finish(homeState);

                                $rootScope.$apply(function() {
                                    c6State.transitionTo('about');
                                });
                                expect(c6State.emit).toHaveBeenCalledWith('transitionStart', aboutState, homeState);
                            });

                            it('should set the c6StateParams object to have all the values of the provided object', function() {
                                var params = {
                                    test: {},
                                    foo: 'hello',
                                    name: 'josh'
                                };

                                c6State.transitionTo('home', params);
                                $rootScope.$digest();
                                expect(c6StateParams).toEqual(params);
                                finish(homeState);

                                c6State.transitionTo('about');
                                $rootScope.$digest();
                                expect(c6StateParams).toEqual({});
                            });

                            it('should change the current property after the state change', function() {
                                $rootScope.$apply(function() {
                                    c6State.transitionTo('home');
                                });

                                expect(c6State.current).toBeNull();
                                finish(homeState);
                                expect(c6State.current).toBe(homeState);
                            });

                            it('should wait for any pending transitions and the call resolveState', function() {
                                var transitionSpy = jasmine.createSpy('transitionTo');

                                c6State.transitions = {
                                    home: transition1.promise,
                                    contact: transition2.promise
                                };

                                c6State.transitionTo('about').then(transitionSpy);
                                expect(_service.resolveState).not.toHaveBeenCalled();

                                $rootScope.$apply(function() {
                                    transition1.resolve();
                                });
                                expect(_service.resolveState).not.toHaveBeenCalled();

                                $rootScope.$apply(function() {
                                    transition2.resolve();
                                });
                                expect(_service.resolveState).toHaveBeenCalledWith(aboutState);
                                expect(c6State.transitions.about.then).toEqual(jasmine.any(Function));
                            });

                            it('should emit viewChangeStart after the resolveState promise is resolved', function() {
                                $rootScope.$apply(function() {
                                    c6State.transitionTo('home');
                                });

                                expect(c6State.emit).not.toHaveBeenCalledWith('viewChangeStart', homeState, null);

                                $rootScope.$apply(function() {
                                    resolveState.resolve(homeState);
                                });
                                expect(c6State.emit).toHaveBeenCalledWith('viewChangeStart', homeState, null);
                                $rootScope.$apply(function() {
                                    c6State.emit('viewChangeSuccess', homeState);
                                });

                                $rootScope.$apply(function() {
                                    c6State.transitionTo('contact');
                                });
                                $rootScope.$apply(function() {
                                    resolveState.resolve(contactState);
                                });
                                expect(c6State.emit).toHaveBeenCalledWith('viewChangeStart', contactState, homeState);
                            });

                            it('should resolve the promise when viewChangeSuccess is emitted with a state of the same name', function() {
                                var transitionSpy = jasmine.createSpy('transitionSpy');

                                $rootScope.$apply(function() {
                                    c6State.transitionTo('home').then(transitionSpy);
                                });
                                $rootScope.$apply(function() {
                                    resolveState.resolve(homeState);
                                });
                                expect(transitionSpy).not.toHaveBeenCalled();

                                $rootScope.$apply(function() {
                                    c6State.emit('viewChangeSuccess', aboutState);
                                });
                                expect(transitionSpy).not.toHaveBeenCalled();

                                $rootScope.$apply(function() {
                                    c6State.emit('viewChangeSuccess', homeState);
                                });
                                expect(c6State.transitions.home).toBeUndefined();
                                expect(transitionSpy).toHaveBeenCalledWith(homeState);
                            });
                        });
                    });
                });
            });
        });
    });
}());
