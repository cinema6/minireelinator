(function() {
    'use strict';

    define(['c6_state'], function() {
        describe('<c6-view>', function() {
            var $rootScope,
                $scope,
                $compile,
                $animate;

            var c6State,
                HomeController,
                homeCtrl;

            var view;

            beforeEach(function() {
                HomeController = jasmine.createSpy('HomeController')
                    .and.callFake(function() {
                        homeCtrl = this;
                    });

                module('ngAnimateMock');

                module('c6.state', function($provide, $controllerProvider) {
                    $provide.factory('c6State', function(c6EventEmitter) {
                        var c6State = c6EventEmitter({});

                        spyOn(c6State, 'emit').and.callThrough();

                        return c6State;
                    });

                    $controllerProvider.register('HomeController', ['$scope', 'cModel', HomeController]);
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $animate = $injector.get('$animate');

                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'removeListener').and.callThrough();

                    $scope = $rootScope.$new();
                });

                $rootScope.$apply(function() {
                    view = $compile('<div><c6-view id="parent"></c6-view></div>')($scope);
                });
            });

            it('should support nested views', function() {
                var parentState = {
                        name: 'parent',
                        cTemplate: '<div><c6-view id="child"></c6-view></div>',
                        cModel: null
                    },
                    childState = {
                        name: 'parent.child',
                        cTemplate: '<p>I\'m a child!</p>',
                        cModel: null
                    };

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, null, false);
                });
                expect(view.find('c6-view>div').length).toBe(1);

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', childState, parentState, true);
                });
                expect(view.text()).toBe('I\'m a child!');
            });

            it('should support transitioning to the same state', function() {
                var parentState = {
                        name: 'parent',
                        cTemplate: '<c6-view></c6-view>',
                        cModel: null
                    },
                    childState = {
                        name: 'parent.child',
                        cTemplate: '<p>{{ChildCtrl.model.data}}</p>',
                        cModel: { data: 'Hello!' },
                        controllerAs: 'ChildCtrl',
                        controller: function() {}
                    },
                    successSpy = jasmine.createSpy('handleViewChangeSuccess'),
                    $p;

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, null, false);
                });
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', childState, parentState, true);
                });
                $p = view.find('p');

                expect(view.text()).toBe('Hello!');

                c6State.on('viewChangeSuccess', successSpy);
                childState.cModel.data = 'World!';
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, childState, false);
                });
                expect(successSpy).toHaveBeenCalledWith(parentState);
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', childState, parentState, true);
                });
                expect(successSpy).toHaveBeenCalledWith(childState);
                expect(view.text()).toBe('World!');
                expect($p[0]).toBe(view.find('p')[0]);
            });

            it('should nullify the cModel of a state when it is removed from view', function() {
                var parentState = {
                        name: 'parent',
                        cTemplate: '<c6-view id="foo"></c6-view>',
                        cModel: {}
                    },
                    childState = {
                        name: 'parent.child',
                        cTemplate: 'Child',
                        cModel: {}
                    },
                    siblingState = {
                        name: 'sibling',
                        cTemplate: 'Sibling',
                        cModel: {}
                    };

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, null, false);
                });
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', childState, parentState, true);
                });
                expect(parentState.cModel).not.toBeNull();
                expect(childState.cModel).not.toBeNull();

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', siblingState, childState, true);
                });
                expect(c6State.removeListener).toHaveBeenCalledWith('viewChangeStart', jasmine.any(Function));
                expect(parentState.cModel).toBeNull();
                expect(childState.cModel).toBeNull();
            });

            it('should support "backing out" of a nested view without re-rendering the parent', function() {
                var parentState = {
                        name: 'parent',
                        cTemplate: '<p>Parent</p><c6-view></c6-view>',
                        controller: jasmine.createSpy('ParentController'),
                        cModel: null
                    },
                    childState = {
                        name: 'parent.child',
                        cTemplate: '<p>Child</p>',
                        cModel: {}
                    },
                    $c6View;

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, null, false);
                });
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', childState, parentState, true);
                });
                $c6View = view.children('c6-view');

                expect(view.text()).toBe('ParentChild');

                spyOn($scope, '$new').and.callThrough();
                parentState.controller.calls.reset();
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, childState, true);
                });
                expect(view.children('c6-view')[0]).toBe($c6View[0]);
                expect(view.text()).toBe('Parent');
                expect($scope.$new).not.toHaveBeenCalled();
                expect(parentState.controller).not.toHaveBeenCalled();
                expect(c6State.emit).toHaveBeenCalledWith('viewChangeSuccess', parentState);
                expect(childState.cModel).toBeNull();

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, parentState, false);
                });
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', childState, parentState, true);
                });
                expect(view.text()).toBe('ParentChild');
            });

            it('should support entering a child without re-rendering the parents', function() {
                var parentState = {
                        name: 'parent',
                        cTemplate: '<p>Parent</p><c6-view></c6-view>',
                        controller: jasmine.createSpy('ParentController'),
                        cModel: null
                    },
                    childState = {
                        name: 'parent.child',
                        cTemplate: '<p>Child</p><c6-view></c6-view>',
                        controller: jasmine.createSpy('ChildController'),
                        cModel: null
                    },
                    grandchildState = {
                        name: 'parent.child.grandchild',
                        cTemplate: '<p>Grandchild</p>',
                        cModel: null
                    },
                    $c6Views = {};

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, null, true);
                });
                $c6Views.parent = view.children('c6-view');
                expect($c6Views.parent.text()).toBe('Parent');

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', parentState, parentState, false);
                });
                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', childState, parentState, false);
                });
                $c6Views.child = view.children('c6-view').children('c6-view');
                expect($c6Views.child.text()).toBe('Child');
                expect(view.children('c6-view')[0]).toBe($c6Views.parent[0]);

                $scope.$apply(function() {
                    c6State.emit('viewChangeStart', grandchildState, childState, true);
                });
                $c6Views.grandchild = view.children('c6-view').children('c6-view').children('c6-view');
                expect($c6Views.grandchild.text()).toBe('Grandchild');
                expect(view.children('c6-view')[0]).toBe($c6Views.parent[0]);
                expect(view.children('c6-view').children('c6-view')[0]).toBe($c6Views.child[0]);
            });

            describe('initialization', function() {
                it('should emit viewReady', function() {
                    expect(c6State.emit).toHaveBeenCalledWith('viewReady');
                });
            });

            describe('when viewChangeStart is emitted', function() {
                var homeState,
                    scope;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        cTemplate: '<div>foo</div>',
                        cModel: {}
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState, null, true);
                    });

                    scope = view.find('c6-view div').scope();
                });

                it('should animate the new contents in', function() {
                    expect(view.text()).toBe('foo');
                    expect($animate.queue[0].event).toBe('enter');
                });

                it('should give the children a new scope', function() {
                    expect(view.find('c6-view div').scope().$parent).toBe($scope);
                });

                it('should replace the contents as views change', function() {
                    var contactsState = {
                            name: 'contacts',
                            cTemplate: '{{1 + 1}} is 2. Duh.',
                            cModel: null
                        },
                        oldScope = view.find('c6-view div').scope();

                    spyOn(oldScope, '$destroy').and.callThrough();

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', contactsState, homeState, true);
                    });

                    expect(oldScope.$destroy).toHaveBeenCalled();

                    expect(view.text()).toBe('2 is 2. Duh.');
                    expect(homeState.cModel).toBeNull();
                    expect($animate.queue[0].event).toBe('enter');
                    expect($animate.queue[1].event).toBe('enter');
                    expect($animate.queue[2].event).toBe('leave');
                });
            });

            describe('if a controller is specified', function() {
                var homeState,
                    newScope;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        controller: 'HomeController',
                        cTemplate: '<div>foo</div>',
                        cModel: {}
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState);
                    });

                    newScope = view.find('c6-view div').scope();
                });

                it('should invoke the controller with the new scope', function() {
                    expect(HomeController).toHaveBeenCalledWith(newScope, homeState.cModel);
                });
            });

            describe('if controllerAs is specified', function() {
                var homeState,
                    scope;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        controller: 'HomeController',
                        controllerAs: 'HomeCtrl',
                        cTemplate: '<p>Hello</p>',
                        cModel: null
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState);
                    });

                    scope = view.find('c6-view *').scope();
                });

                it('should stick the controller on the scope', function() {
                    expect(scope.HomeCtrl).toBe(homeCtrl);
                });
            });

            describe('updateControllerModel', function() {
                var homeState,
                    scope;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        controllerAs: 'HomeCtrl',
                        controller: function() {},
                        cTemplate: '<p>Hello</p>',
                        cModel: {
                            data: 'foo'
                        }
                    };
                });

                describe('if specified', function() {
                    beforeEach(function() {
                        homeState.updateControllerModel = ['model','controller', jasmine.createSpy('updateControllerModel')];

                        $scope.$apply(function() {
                            c6State.emit('viewChangeStart', homeState);
                        });

                        scope = view.find('c6-view *').scope();
                    });

                    it('should $invoke the setup function', function() {
                        expect(homeState.updateControllerModel[2]).toHaveBeenCalledWith(homeState.cModel, scope.HomeCtrl);
                    });
                });

                describe('if not specified', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            c6State.emit('viewChangeStart', homeState);
                        });

                        scope = view.find('c6-view *').scope();
                    });

                    it('should make the model the "model" property of the controller', function() {
                        expect(scope.HomeCtrl.model).toBe(homeState.cModel);
                    });
                });
            });

            describe('when the view change finishes', function() {
                var homeState;

                beforeEach(function() {
                    homeState = {
                        name: 'home',
                        cTemplate: 'Foo',
                        cModel: null
                    };

                    $scope.$apply(function() {
                        c6State.emit('viewChangeStart', homeState);
                    });

                    $animate.queue[0].args[3]();
                });

                it('should emit viewChangeSuccess', function() {
                    expect(c6State.emit).toHaveBeenCalledWith('viewChangeSuccess', homeState);
                });
            });
        });
    });
}());
