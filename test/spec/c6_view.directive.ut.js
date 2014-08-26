(function() {
    'use strict';

    define(['c6_state'], function(c6StateModule) {
        describe('<c6-view>', function() {
            var $rootScope,
                $scope,
                $compile,
                $controller,
                $location,
                c6State;

            var $body,
                $view;

            beforeEach(function() {
                module(c6StateModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');
                    $location = $injector.get('$location');

                    $scope = $rootScope.$new();
                });

                spyOn(c6State, '_registerView');
                spyOn(c6State, '_deregisterView');

                $body = $('body');
            });

            afterEach(function() {
                $view.remove();
            });

            it('should register the view', function() {
                $scope.$apply(function() {
                    $view = $('<c6-view></c6-view>');
                    $body.append($view);
                    $compile($view)($scope);
                });

                expect(c6State._registerView).toHaveBeenCalledWith(jasmine.objectContaining({
                    id: null,
                    parent: null,
                    render: jasmine.any(Function)
                }));
            });

            it('should register a child view', function() {
                var parent;

                $scope.$apply(function() {
                    $view = $('<c6-view></c6-view>');
                    $body.append($view);
                    $compile($view)($scope);
                });

                parent = c6State._registerView.calls.first().args[0];
                parent.render({
                    cTemplate: '<c6-view id="child"></c6-view>'
                });

                expect(c6State._registerView).toHaveBeenCalledWith(jasmine.objectContaining({
                    id: 'child',
                    parent: parent,
                    render: jasmine.any(Function)
                }));
            });

            describe('when the $scope is $destroyed', function() {
                var delegate;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $view = $('<c6-view></c6-view>');
                        $body.append($view);
                        $compile($view)($scope);
                    });

                    delegate = c6State._registerView.calls.mostRecent().args[0];
                    spyOn(delegate, 'clear');

                    $scope.$destroy();
                });

                it('should deregister the view', function() {
                    expect(c6State._deregisterView).toHaveBeenCalledWith(delegate);
                });

                it('should clear the delegate', function() {
                    expect(delegate.clear).toHaveBeenCalled();
                });
            });

            describe('ViewDelegate', function() {
                var delegate;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $view = $('<div><c6-view></c6-view></div>');
                        $body.append($view);
                        $compile($view)($scope);
                    });

                    delegate = c6State._registerView.calls.mostRecent().args[0];
                });

                describe('methods', function() {
                    describe('clear()', function() {
                        var state, scope;

                        beforeEach(function() {
                            scope = {
                                $destroy: jasmine.createSpy('scope.$destroy()')
                            };

                            state = {
                                cTemplate: 'Hello',
                                cModel: {},
                                cRendered: true
                            };

                            spyOn(delegate.parentScope, '$new')
                                .and.returnValue(scope);

                            $scope.$apply(function() {
                                delegate.render(state);
                            });

                            $scope.$apply(function() {
                                delegate.clear();
                            });
                        });

                        it('should empty the view', function() {
                            expect($view.text()).toBe('');
                        });

                        it('should null out the model', function() {
                            expect(state.cModel).toBeNull();
                        });

                        it('should $destroy the scope', function() {
                            expect(scope.$destroy).toHaveBeenCalled();
                        });

                        it('should set cRendered to false', function() {
                            expect(state.cRendered).toBe(false);
                        });
                    });

                    describe('render(state)', function() {
                        describe('binding to query parameters', function() {
                            var controller,
                                state, applicationState;

                            beforeEach(function() {
                                spyOn($location, 'search').and.returnValue($location);
                                spyOn($location, 'replace');

                                applicationState = {};

                                state = {
                                    cParent: applicationState,
                                    cTemplate: '<div></div>',
                                    controller: function() {
                                        controller = this;
                                    },
                                    queryParams: {
                                        sort: '=',
                                        coordinates: '=cors',
                                        debug: '&',
                                        limit: '&'
                                    }
                                };

                                $scope.$apply(function() {
                                    delegate.render(state);
                                });
                            });

                            it('should create one-way bindings on the controller', function() {
                                $location.search.and.returnValue({});

                                expect(controller.debug).not.toBeDefined();

                                $location.search.and.returnValue({
                                    debug: true
                                });
                                expect(controller.debug).toBe(true);
                                expect($location.search).toHaveBeenCalledWith();

                                $location.search.and.returnValue({
                                    debug: false
                                });
                                expect(controller.debug).toBe(false);
                                expect($location.search).toHaveBeenCalledWith();

                                expect(function() {
                                    controller.debug = 'foo';
                                }).toThrow();
                            });

                            it('should convert numbers in the query params to actual numbers', function() {
                                $location.search.and.returnValue({
                                    limit: '50'
                                });
                                expect(controller.limit).toBe(50);

                                $location.search.and.returnValue({
                                    limit: '2.25'
                                });
                                expect(controller.limit).toBe(2.25);

                                $location.search.and.returnValue({
                                    limit: '-100.46'
                                });
                                expect(controller.limit).toBe(-100.46);

                                $location.search.and.returnValue({
                                    limit: '1'
                                });
                                expect(controller.limit).toBe(1);
                            });

                            it('should create two-way bindings on the controller', function() {
                                $location.search.and.returnValue({});

                                expect(controller.sort).not.toBeDefined();

                                $location.search.and.returnValue({
                                    sort: 'asc'
                                });
                                expect(controller.sort).toBe('asc');

                                $location.search.and.returnValue($location);
                                controller.sort = 'desc';
                                expect($location.replace).toHaveBeenCalled();
                                expect($location.search).toHaveBeenCalledWith('sort', 'desc');
                            });

                            it('should create bindings with custom names', function() {
                                $location.search.and.returnValue({});

                                expect(controller.coordinates).toBeUndefined();

                                $location.search.and.returnValue({
                                    cors: '44,22'
                                });
                                expect(controller.coordinates).toBe('44,22');
                            });

                            it('should support setting an initial value', function() {
                                $scope.$apply(function() {
                                    delegate.render({
                                        cTemplate: '<div></div>',
                                        controller: function() {
                                            this.debug = false;

                                            controller = this;
                                        },
                                        queryParams: {
                                            debug: '='
                                        }
                                    });
                                });

                                $location.search.and.returnValue({
                                    debug: false
                                });
                                expect(controller.debug).toBe(false);
                                expect($location.search).toHaveBeenCalledWith('debug', false);
                            });

                            it('should throw an error if two controllers try to two-way bind to the same query param', function() {
                                var childDelegate,
                                    childState;

                                state = {
                                    cTemplate: '<c6-view></c6-view>',
                                    controller: function() {},
                                    queryParams: {
                                        debug: '='
                                    },
                                    cParent: applicationState
                                };

                                $scope.$apply(function() {
                                    delegate.render(state);
                                });
                                childDelegate = c6State._registerView.calls.mostRecent().args[0];

                                childState = {
                                    cTemplate: '<div></div>',
                                    controller: function() {},
                                    queryParams: {
                                        debug: '&'
                                    },
                                    cParent: state
                                };

                                expect(function() {
                                    $scope.$apply(function() {
                                        childDelegate.render(childState);
                                    });
                                }).not.toThrow();

                                childState = {
                                    cTemplate: '<span></span>',
                                    controller: function() {},
                                    queryParams: {
                                        debug: '='
                                    },
                                    cParent: state
                                };

                                expect(function() {
                                    $scope.$apply(function() {
                                        childDelegate.render(childState);
                                    });
                                }).toThrow();
                            });
                        });

                        it('should render the template of the provided state', function() {
                            $scope.$apply(function() {
                                delegate.render({
                                    cTemplate: '<p>Foo is {{1 + 1}}</p>'
                                });
                            });

                            expect($view.text()).toBe('Foo is 2');
                        });

                        it('should instantiate the controller', function() {
                            var Controller = ['$scope','cState', jasmine.createSpy('Controller()')
                                .and.callFake(function($scope, cState) {
                                    $scope.name = 'Josh';
                                    expect(cState).toBe(state);
                                })],
                                state = {
                                    cTemplate: 'Hello {{name}}',
                                    controller: Controller
                                };

                            $scope.$apply(function() {
                                delegate.render(state);
                            });

                            expect(Controller[2]).toHaveBeenCalled();
                            expect($view.text()).toBe('Hello Josh');
                        });

                        it('should put the controller on the scope if controllerAs is specified', function() {
                            function Controller() {}

                            $scope.$apply(function() {
                                delegate.render({
                                    cTemplate: '<div></div>',
                                    controller: Controller,
                                    controllerAs: 'Ctrl'
                                });
                            });

                            expect($view.children().first().children().scope().Ctrl).toEqual(jasmine.any(Controller));
                        });

                        it('should remove an old view if there is one and then render the new one', function() {
                            $scope.$apply(function() {
                                delegate.render({
                                    cTemplate: 'Template 1'
                                });
                            });

                            $scope.$apply(function() {
                                delegate.render({
                                    cTemplate: 'Template 2'
                                });
                            });

                            expect($view.text()).toBe('Template 2');
                        });

                        it('should set cRendered to true', function() {
                            var state = {};

                            $scope.$apply(function() {
                                delegate.render(state);
                            });

                            expect(state.cRendered).toBe(true);
                        });

                        describe('if the same state is rendered twice', function() {
                            var view, initWithModel, state;

                            beforeEach(function() {
                                state = {
                                    cTemplate: '<div></div>',
                                    cModel: {},
                                    controller: jasmine.createSpy('Controller')
                                        .and.callFake(function() {
                                            this.initWithModel = initWithModel = jasmine.createSpy('controller.initWithModel()');
                                        })
                                };

                                $scope.$apply(function() {
                                    delegate.render(state);
                                });

                                initWithModel.calls.reset();
                                state.controller.calls.reset();
                                view = $view.children().first().children().first()[0];
                            });

                            describe('if the models are the same', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        delegate.render(state);
                                    });
                                });

                                it('should not do anything', function() {
                                    expect(initWithModel).not.toHaveBeenCalled();
                                    expect(state.controller).not.toHaveBeenCalled();
                                    expect($view.children().first().children().first()[0]).toBe(view);
                                });
                            });

                            describe('if the model has changed', function() {
                                var oldModel;

                                beforeEach(function() {
                                    oldModel = state.cModel;

                                    state.cModel = { name: 'Foo' };

                                    $scope.$apply(function() {
                                        delegate.render(state);
                                    });
                                });

                                it('should not re-render views or reinstantiate controllers', function() {
                                    expect(state.controller).not.toHaveBeenCalled();
                                    expect($view.children().first().children().first()[0]).toBe(view);
                                });

                                it('should call initWithModel()', function() {
                                    expect(initWithModel).toHaveBeenCalledWith(state.cModel, oldModel);
                                });
                            });
                        });

                        describe('controller.initWithModel(newModel, oldModel)', function() {
                            var controller;

                            describe('if already defined', function() {
                                var initWithModel;

                                beforeEach(function() {
                                    initWithModel = function() {};

                                    function Controller() {
                                        this.initWithModel = initWithModel;
                                    }

                                    $scope.$apply(function() {
                                        delegate.render({
                                            cTemplate: '<div></div>',
                                            controller: Controller,
                                            controllerAs: 'Ctrl'
                                        });
                                    });
                                    controller = $view.children().first().children().scope().Ctrl;
                                });

                                it('should not be overwritten', function() {
                                    expect(controller.initWithModel).toBe(initWithModel);
                                });
                            });

                            describe('if not defined', function() {
                                beforeEach(function() {
                                    function Controller() {}

                                    $scope.$apply(function() {
                                        delegate.render({
                                            cTemplate: '<div></div>',
                                            controller: Controller,
                                            controllerAs: 'Ctrl'
                                        });
                                    });
                                    controller = $view.children().first().children().scope().Ctrl;
                                });

                                it('should create a method', function() {
                                    expect(controller.initWithModel).toEqual(jasmine.any(Function));
                                });

                                it('should set the provided model as the "model" property of the controller', function() {
                                    var model = {};

                                    controller.initWithModel(model);

                                    expect(controller.model).toBe(model);
                                });
                            });

                            it('should be called when the view is rendered', function() {
                                var initWithModel,
                                    state = {
                                        cTemplate: '<div></div>',
                                        cModel: {},
                                        controller: function() {
                                            this.initWithModel = initWithModel = jasmine.createSpy('controller.initWithModel()');
                                        }
                                    };

                                $scope.$apply(function() {
                                    delegate.render(state);
                                });

                                expect(initWithModel).toHaveBeenCalledWith(state.cModel, state.cModel);
                            });

                            it('should not be called if the state changes', function() {
                                var initWithModel = jasmine.createSpy('initWithModel()');

                                $scope.$apply(function() {
                                    delegate.render({
                                        controller: function() {
                                            this.initWithModel = initWithModel;
                                        },
                                        cModel: {}
                                    });
                                });

                                initWithModel.calls.reset();

                                $scope.$apply(function() {
                                    delegate.render({
                                        cModel: {}
                                    });
                                });

                                expect(initWithModel).not.toHaveBeenCalled();
                            });
                        });
                    });
                });
            });
        });
    });
}());
