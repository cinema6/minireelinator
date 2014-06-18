(function() {
    'use strict';

    var extend = angular.extend,
        copy = angular.copy,
        forEach = angular.forEach;

    angular.module('c6.state', ['c6.ui'])
        .value('c6StateParams', {})

        .directive('c6View', ['c6State','$compile','$animate','$controller','$injector',
        function             ( c6State , $compile , $animate , $controller , $injector ) {
            return {
                restrict: 'EAC',
                transclude: 'element',
                link: function(scope, element, attrs, controller, transclude) {
                    var currentScope = null,
                        currentElement$ = null,
                        parentData = element.inheritedData('cView') || {},
                        viewLevel = (parentData.level || 0) + 1;


                    function update(state, prevState, terminal) {
                        var newScope, ctrl, controllerAs, controller, clone$,
                            stateLevel = state.name.split('.').length,
                            data = (currentElement$ && currentElement$.data('cView')) || {};

                        function updateControllerModel(controller) {
                            return $injector.invoke(
                                state.updateControllerModel ||
                                    function() {
                                        if (!controller) { return; }

                                        controller.model = this.cModel;
                                    },
                                state,
                                {
                                    model: state.cModel,
                                    controller: controller
                                }
                            );
                        }

                        function enter() {
                            newScope = scope.$new();
                            ctrl = state.controller;
                            controllerAs = state.controllerAs;
                            controller = ctrl ? $controller(ctrl, {
                                $scope: newScope,
                                cModel: state.cModel
                            }) : null;

                            updateControllerModel(controller);

                            if (controllerAs) {
                                newScope[controllerAs] = controller;
                            }

                            clone$ = transclude(function(clone$) {
                                clone$.html(state.cTemplate);

                                clone$.data('cView', {
                                    level: viewLevel,
                                    state: state,
                                    controller: controller
                                });
                                clone$.on('$destroy', function() {
                                    state.cModel = null;
                                });

                                $compile(clone$.contents())(newScope);

                                $animate.enter(
                                    clone$,
                                    null,
                                    currentElement$ || element,
                                    function() {
                                        c6State.emit('viewChangeSuccess', state);
                                    }
                                );
                            });
                        }

                        function leave() {
                            if (currentScope) {
                                currentScope.$destroy();
                            }

                            if (currentElement$) {
                                $animate.leave(currentElement$);
                            }

                            currentScope = newScope;
                            currentElement$ = clone$;
                        }

                        // We have nothing to do if the transition was not intended for this view or
                        // the state being requested is already loaded into the view (and this is
                        // not a deliberate transition to the current state again (but maybe with
                        // different data.)
                        if (stateLevel > viewLevel) { return; }

                        if (stateLevel === viewLevel) {
                            if (state === data.state) {
                                updateControllerModel(data.controller);
                                c6State.emit('viewChangeSuccess', state);
                                return;
                            }

                            enter();
                            leave();
                            return;
                        }

                        if (terminal) {
                            leave();
                            c6State.emit('viewChangeSuccess', state);
                        }
                    }

                    c6State.emit('viewReady');

                    c6State.on('viewChangeStart', update);
                    scope.$on('$destroy', function() {
                        c6State.removeListener('viewChangeStart', update);
                    });
                }
            };
        }])

        .directive('c6Sref', ['c6State','$animate',
        function             ( c6State , $animate ) {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    function setActive() {
                        $animate.addClass($element, 'c6-active');
                    }

                    function stateChangeSuccess() {
                        if (c6State.isActive(attrs.c6Sref)) {
                            setActive();
                        } else {
                            $animate.removeClass($element, 'c6-active');
                        }
                    }

                    $element.on('click', function() {
                            var state = attrs.c6Sref,
                                params = scope.$eval(attrs.params);

                            scope.$apply(function() {
                                c6State.goTo(state, params);
                            });
                        })
                        .on('$destroy', function() {
                            c6State.removeListener('stateChangeSuccess', stateChangeSuccess);
                        });

                    c6State.on('stateChangeSuccess', stateChangeSuccess);

                    if (c6State.isActive(attrs.c6Sref)) {
                        setActive();
                    }

                    if ($element.prop('tagName') === 'A') {
                        $element.attr('href', '');
                    }
                }
            };
        }])

        .provider('c6State', [function() {
            var states = {},
                indexState = null;

            function setupState(name, state, parent) {
                state.name = name;
                state.cModel = null;
                state.cTemplate = null;
                state.cParent = parent || null;

                angular.forEach(state.children, function(child, childName) {
                    setupState((name + '.' + childName), child, state);
                });

                states[name] = state;
            }

            this.state = function() {
                setupState.apply(null, arguments);
                return this;
            };

            this.index = function(index) {
                indexState = index;

                return this;
            };

            this.$get = ['c6StateParams','c6EventEmitter','$injector','$q','$http',
                         '$templateCache','$log',
            function    ( c6StateParams , c6EventEmitter , $injector , $q , $http ,
                          $templateCache , $log ) {
                var c6State = c6EventEmitter({}),
                    _service = {};

                function allSettled(hash) {
                    var deferred = $q.defer(),
                        keys = Object.keys(hash),
                        waitingFor = [],
                        result = {};

                    if (!keys.length) {
                        deferred.resolve({});
                    }

                    forEach(keys, function(key) {
                        var promise = hash[key];

                        waitingFor.push(promise);

                        promise
                            .finally(function handleSettle(value) {
                                waitingFor.splice(
                                    waitingFor.indexOf(
                                        promise
                                    ),
                                    1
                                );

                                result[key] = value;

                                if (waitingFor.length === 0) {
                                    deferred.resolve(result);
                                }
                            });
                    });

                    return deferred.promise;
                }

                function getAllStates(state) {
                    function climbTree(tree) {
                        var item = tree[0],
                            parent = (item || {}).cParent;

                        if (parent) {
                            tree.unshift(parent);
                            return climbTree(tree);
                        }

                        return tree;
                    }

                    return climbTree([state]);
                }

                c6State.setMaxListenersWarning(0);

                _service.resolveState = function(state) {
                    function setTemplate() {
                        var template = state.template,
                            templateUrl = state.templateUrl;

                        state.cTemplate = template || null;

                        return templateUrl ? $http.get(templateUrl, {
                            cache: $templateCache
                        }).then(function(response) {
                            state.cTemplate = response.data;
                        }).then(returnState) : $q.when(state);
                    }

                    function beforeModel() {
                        return $q.when($injector.invoke(state.beforeModel || angular.noop, state));
                    }

                    function model() {
                        return $injector.invoke(state.model || angular.noop, state);
                    }

                    function afterModel(model) {
                        state.cModel = model || null;

                        return $injector.invoke(
                            state.afterModel || angular.noop,
                            state,
                            { model: model }
                        );
                    }

                    function handleError(error) {
                        if (!state.handleError) {
                            return $q.reject(error);
                        }

                        return $injector.invoke(state.handleError, state, { error: error });
                    }

                    function returnState() {
                        return state;
                    }

                    return setTemplate()
                        .then(beforeModel)
                        .catch(handleError)
                        .then(model)
                        .then(afterModel)
                        .then(returnState);
                };

                c6State.current = null;
                c6State.transitions = {};

                c6State.isActive = function(stateName) {
                    return c6State.current &&
                        getAllStates(c6State.current)
                            .map(function(state) {
                                return state.name;
                            }).indexOf(stateName) > -1;
                };

                c6State.get = function(name) {
                    return states[name];
                };

                c6State.transitionTo = function(name, params) {
                    var tree,
                        state = states[name],
                        current = c6State.current;

                    function doTransition(state, terminal) {
                        var from = c6State.current;

                        function resolveState(state) {
                            angular.copy(params, c6StateParams);

                            return _service.resolveState(state);
                        }

                        function changeView(state) {
                            var deferred = $q.defer();

                            function handleViewChangeSuccess(toState) {
                                if (toState === state) {
                                    deferred.resolve(state);
                                    c6State.removeListener(
                                        'viewChangeSuccess',
                                        handleViewChangeSuccess
                                    );
                                }
                            }

                            c6State.on('viewChangeSuccess', handleViewChangeSuccess);
                            c6State.emit('viewChangeStart', state, from, terminal);

                            return deferred.promise;
                        }

                        function cleanState(error) {
                            state.cModel = null;

                            return $q.reject(error);
                        }

                        function setCurrent(state) {
                            c6State.current = state;

                            return state;
                        }

                        c6State.emit('transitionStart', state, from);

                        return resolveState(state)
                            .then(changeView)
                            .catch(cleanState)
                            .then(setCurrent);
                    }

                    function execute() {
                        var promise,
                            lastIndex = tree.length - 1;

                        angular.forEach(tree, function(state, index) {
                            function doPromise() {
                                return doTransition(state, index === lastIndex);
                            }

                            promise = promise ? promise.then(doPromise) : doPromise();
                        });

                        c6State.transitions[name] = promise;

                        return promise;
                    }

                    function finishTransition() {
                        delete c6State.transitions[name];

                        c6State.emit('stateChangeSuccess', state, current);
                    }

                    tree = getAllStates(state);

                    return allSettled(this.transitions)
                        .then(execute)
                        .finally(finishTransition);
                };

                c6State.goTo = function(state, params) {
                    return this.transitionTo(state, extend(copy(c6StateParams), params));
                };

                c6State.on('viewReady', function() {
                    if (!c6State.current) {
                        c6State.transitionTo(indexState)
                            .catch($log.error);
                    }
                });

                if (window.c6.kHasKarma) { c6State._private = _service; }

                return c6State;
            }];
        }]);
}());
