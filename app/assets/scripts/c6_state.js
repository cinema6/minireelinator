define( ['angular','c6uilib'],
function( angular , c6uilib ) {
    'use strict';

    var noop = angular.noop,
        extend = angular.extend,
        equals = angular.equals,
        forEach = angular.forEach,
        copy = angular.copy,
        isFunction = angular.isFunction,
        isString = angular.isString;

    function argParser(config, args) {
        function truePredicate() {
            return true;
        }

        return Object.keys(config).reduce(function(result, key) {
            result[key] = config[key].reduce(function(value, item) {
                var arg = args[item[0]],
                    predicate = item[1] || truePredicate;

                return value || (predicate(arg) ? arg : value);
            }, undefined);

            return result;
        }, {});
    }

    /*
     * Extend function in the functional style where a new object is returned, rather than an
     * existing object being mutated.
     */
    function fnExtend() {
        var objects = Array.prototype.slice.call(arguments);

        return objects.reduce(function(result, object) {
            return Object.keys(object || {}).reduce(function(result, key) {
                result[key] = object[key];
                return result;
            }, result);
        }, {});
    }

    function find(collection, predicate) {
        return collection.reduce(function(result, next) {
            return result || (predicate(next) ? next : result);
        }, null);
    }

    function mixin(instance, constructor) {
        var args = Array.prototype.slice.call(arguments, 2);

        constructor.apply(instance, args);
        extend(instance.constructor.prototype, constructor.prototype);

        return instance;
    }

    function stateFamilyOf(state) {
        var family = [];

        function unshift(state) {
            if (!state) { return; }

            family.unshift(state);
            unshift(state.cParent);
        }

        unshift(state);

        return family;
    }

    function urlOfStateFamily(family, models, params) {
        var numOfModels = (models || 0) && models.length,
            numOfStates = family.length,
            startOfModel = numOfStates - numOfModels,
            allModels = params ? [] : family.map(function(state, index) {
                var modelIndex = Math.max(index - startOfModel, -1);

                return modelIndex > -1 ? models[modelIndex] : state.cModel;
            });

        if (!family.length) {
            return '';
        }

        params = params || family.reduce(function(params, state, index) {
            var model = allModels[index];

            return model && state.cParams ?
                extend(params, state.serializeParams(model)) : params;
        }, {});

        return Object.keys(params).reduce(function(url, prop) {
            return url.replace(':' + prop, params[prop]);
        }, family[family.length - 1].cUrl);
    }

    return angular.module('c6.state', [c6uilib.name])
        .factory('c6AsyncQueue', ['$q',
        function                 ( $q ) {
            function allSettled(promises) {
                var results = [],
                    total = promises.length,
                    deferred = $q.defer();

                if (!total) {
                    deferred.resolve(results);
                }

                forEach(promises, function(promise, index) {
                    promise.finally(function(result) {
                        results[index] = result;

                        if (results.length === total) {
                            deferred.resolve(results);
                        }
                    });
                });

                return deferred.promise;
            }

            function Queue() {
                this.queue = [];
            }
            Queue.prototype = {
                wrap: function(fn, context) {
                    var queue = this.queue;

                    return function() {
                        var args = arguments,
                            promise = allSettled(queue)
                                .then(function apply() {
                                    return fn.apply(context, args);
                                });

                        queue.push(promise);

                        promise.finally(function() {
                            queue.splice(queue.indexOf(promise), 1);
                        });

                        return promise;
                    };
                },

                debounce: function(fn, context) {
                    var pending = null;

                    return function() {
                        if (pending) {
                            return pending;
                        }

                        pending = $q.when(fn.apply(context, arguments));
                        pending.finally(function() {
                            pending = null;
                        });

                        return pending;
                    };
                }
            };

            return function() {
                return new Queue();
            };
        }])

        .directive('c6Title', ['c6State',
        function              ( c6State ) {
            function link(scope, $element, attrs) {
                scope.$watch(function() {
                    return c6State.in(attrs.context || 'main', function() {
                        return c6State.current && c6State.get(c6State.current).cTitle;
                    });
                }, function(title) {
                    $element.text(title || '');
                });
            }

            return {
                restrict: 'E',
                template: '<title></title>',
                replace: true,
                link: link
            };
        }])

        .directive('c6Sref', ['c6State','$animate','$location',
        function             ( c6State , $animate , $location ) {
            function toSearch(params) {
                return Object.keys(params)
                    .map(function(key) {
                        return [key, params[key]]
                            .map(encodeURIComponent)
                            .join('=');
                    })
                    .join('&');
            }

            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    var isAnchor = $element.prop('tagName') === 'A';

                    function setActive() {
                        $animate.addClass($element, 'c6-active');
                    }

                    function stateChange() {
                        if (c6State.in(attrs.c6Context || 'main', function() {
                            return c6State.isActive(c6State.get(attrs.c6Sref));
                        })) {
                            setActive();
                        } else {
                            $animate.removeClass($element, 'c6-active');
                        }
                    }

                    $element
                        .on('click', function(event) {
                            c6State.in(attrs.c6Context || 'main', function() {
                                var state = attrs.c6Sref;

                                event.preventDefault();

                                scope.$apply(function() {
                                    c6State.goTo(
                                        state,
                                        scope.$eval(attrs.c6Models),
                                        scope.$eval(attrs.c6Params)
                                    );
                                });
                            });
                        })
                        .on('$destroy', function() {
                            c6State.removeListener('stateChange', stateChange);
                        });

                    c6State.on('stateChange', stateChange);

                    c6State.in(attrs.c6Context || 'main', function() {
                        if (c6State.isActive(c6State.get(attrs.c6Sref))) {
                            setActive();
                        }
                    });

                    if (isAnchor) {
                        scope.$watch(function() {
                            return c6State.in(attrs.c6Context || 'main', function() {
                                var stateName = attrs.c6Sref,
                                    state = c6State.get(stateName),
                                    family = stateFamilyOf(state),
                                    models = scope.$eval(attrs.c6Models),
                                    search = toSearch(
                                        scope.$eval(attrs.c6Params) || $location.search()
                                    );

                                return (urlOfStateFamily(family, models) || '') +
                                    (search ? ('?' + search) : '');
                            });
                        }, function(href) {
                            $element.attr('href', href && ('/#' + href));
                        });
                    }
                }
            };
        }])

        .directive('c6View', ['c6State','$animate','$compile','$controller','$location',
        function             ( c6State , $animate , $compile , $controller , $location ) {
            function ModelController() {}
            ModelController.prototype = {
                initWithModel: function(model) {
                    this.model = model;
                }
            };

            function ParamsController(config, state) {
                forEach(config, function(config, prop) {
                    var isTwoWay = config.charAt(0) === '=',
                        param = config.substr(1) || prop,
                        initialValue = this[prop];

                    if (isTwoWay) {
                        stateFamilyOf(state).slice(0, -1).forEach(function(ancestorState) {
                            forEach(
                                ancestorState.queryParams,
                                function(ancestorConfig, ancestorProp) {
                                    var ancestorParam = ancestorConfig.substr(1) || ancestorProp,
                                        ancestorIsTwoWay = ancestorConfig.charAt(0) === '=';

                                    if (ancestorIsTwoWay && ancestorParam === param) {
                                        throw new Error(
                                            'Cannot create two-way query paramater binding ' +
                                            'in controller of state ' + state.cName + ' because ' +
                                            'it is already two-way bound in the controller of ' +
                                            'state ' + ancestorState.cName + '.'
                                        );
                                    }
                                }
                            );
                        });
                    }

                    Object.defineProperty(this, prop, {
                        get: function() {
                            var value = $location.search()[param];

                            return (/^-?(\d+)\.?(\d+)?$/).test(value) ? parseFloat(value) : value;
                        },
                        set: isTwoWay ? function(value) {
                            $location.search(prop, value)
                                .replace();
                        } : undefined
                    });

                    if (isTwoWay) {
                        this[prop] = initialValue;
                    }
                }, this);
            }

            function ViewDelegate(scope, $element, $attrs, transclude) {
                this.id = $attrs.id || null;
                this.parent = $element.inheritedData('cViewDelegate') || null;

                this.$element = null;
                this.state = null;
                this.model = null;
                this.controller = null;
                this.scope = null;

                this.parentScope = scope;
                this.$view = $element;
                this.$attrs = $attrs;
                this.transclude = transclude;
            }
            ViewDelegate.prototype = {
                createScope: function(state) {
                    var scope = this.scope = this.parentScope.$new(),
                        controllerAs = state.controllerAs,
                        controller = this.controller = state.controller ?
                        mixin($controller(state.controller, {
                            $scope: scope,
                            cState: state
                        }), ModelController) : null;

                    if (controllerAs) {
                        scope[controllerAs] = this.controller;
                    }

                    if (controller) {
                        controller.initWithModel(state.cModel, state.cModel);
                    }

                    if (state.queryParams) {
                        mixin(controller, ParamsController, state.queryParams, state);
                    }

                    return scope;
                },
                render: function(state) {
                    var self = this,
                        $view = this.$view;

                    if (state === this.state) {
                        if (this.controller && state.cModel !== this.model) {
                            this.controller.initWithModel(state.cModel, this.model);
                        }
                        return;
                    }

                    this.clear();

                    this.$element = this.transclude(function($clone) {
                        $clone.html(state.cTemplate);

                        $clone.data('cViewDelegate', self);

                        $compile($clone.contents())(self.createScope(state));

                        $animate.enter($clone, null, $view);
                    });
                    state.cRendered = true;
                    this.state = state;
                    this.model = state.cModel;
                },
                clear: function() {
                    if (this.$element) {
                        $animate.leave(this.$element);
                    }

                    if (this.state) {
                        this.state.cModel = null;
                        this.state.cRendered = false;
                    }

                    if (this.scope) {
                        this.scope.$destroy();
                    }

                    this.state = null;
                    this.controller = null;
                    this.model = null;
                    this.scope = null;
                    this.$element = null;
                }
            };

            function link(scope, $element, $attrs, controller, transclude) {
                var delegate = new ViewDelegate(scope, $element, $attrs, transclude);

                c6State._registerView(delegate);

                scope.$on('$destroy', function() {
                    delegate.clear();
                    c6State._deregisterView(delegate);
                });
            }

            return {
                restrict: 'EAC',
                transclude: 'element',
                link: link
            };
        }])

        .provider('c6State', [function() {
            var stateConstructors = {},
                contexts = {},
                stateConfigs;

            /**
             * A data-structure that merges an array (ordered values) with an object (values
             * accessible by key. Similar to a Map in C++. Includes methods for fetching/setting
             * data by key, allong with many methods common to arrays.
             *
             * The use-case for a List is being able to replace members (by setting a key multiple
             * times) while maintaining an order for the members.
             *
             * @class List
             * @constructor
             */
            function List() {
                this.data = {};
                this.order = [];
            }
            List.prototype = {
                push: function(key) {
                    var currentIndex = this.order.indexOf(key),
                        hasPosition = currentIndex > -1;

                    if (hasPosition) {
                        this.order.splice(currentIndex, 1);
                    }

                    return this.set.apply(this, arguments);
                },
                set: function(key, value) {
                    var currentIndex = this.order.indexOf(key),
                        hasPosition = currentIndex > -1;

                    this.data[key] = value;

                    if (!hasPosition) {
                        return this.order.push(key);
                    }

                    return currentIndex;
                },
                get: function(key) {
                    return this.data[key];
                },
                nth: function(index) {
                    return this.data[this.order[index]];
                },
                forEach: function(fn, context) {
                    return this.order.forEach(function(key, index) {
                        fn.call(context, this.data[key], key, index, this);
                    }, this);
                },
                map: function(fn, context) {
                    var result = new List();

                    this.forEach(function(value, key) {
                        result.push(key, fn.apply(this, arguments));
                    }, context);

                    return result;
                },
                filter: function(fn, context) {
                    var result = new List();

                    this.forEach(function(value, key) {
                        if (fn.apply(this, arguments)) {
                            result.push(key, value);
                        }
                    }, context);

                    return result;
                },
                reduce: function(fn, initialValue) {
                    var initialSupplied = arguments.length > 1,
                        result = initialSupplied ? initialValue : this.nth(0);

                    this.forEach(function(item, key, index) {
                        var args = Array.prototype.slice.call(arguments);

                        if (!initialSupplied && index === 0) {
                            return;
                        }

                        result = fn.apply(null, [result].concat(args));
                    });

                    return result;
                }
            };

            /**
             * A Thunker holds a collection of
             * [thunks](http://en.wikipedia.org/wiki/Thunk#Functional_programming). In addition to
             * housing thunks, it also sets up parent-child relationships between thunks that
             * affect the order of evaluation. Child thunks will always be evaluated after their
             * parent.
             *
             * @class Thunker
             * @constructor
             */
            function Thunker() {
                this.groups = {};
                this.map = [];
            }
            Thunker.prototype = {
                /**
                 * Adds a thunk with the provided group id to the collection of thunks.
                 *
                 * @method push
                 * @param {String} group An ID of a group for this thunk
                 * @param {Function} thunk A function to be called later
                 * @return {Number} The index of the thunk in the map
                 */
                push: function(group, thunk) {
                    var groups = this.groups;

                    return (groups[group] || (groups[group] = [])).push(thunk);
                },
                /**
                 * Sets up a parent child relationship between two groups. The thunks in the parent
                 * group will be called before those in the child group.
                 *
                 * @method relate
                 * @param {String} parent The id of the parent group
                 * @param {String} child The id of the child group
                 * @chainable
                 */
                relate: function(parent, child) {
                    this.map.push({
                        parent: parent,
                        child: child
                    });

                    return this;
                },
                /**
                 * Executes all of the thunks that have been pushed into this Thunker.
                 *
                 * @method force
                 */
                force: function() {
                    var map = this.map, groups = this.groups;

                    function callChildrenOf(parent) {
                        var children = map.filter(function(relationship) {
                            return relationship.parent === parent;
                        });

                        children.forEach(function(relationship) {
                            var thunks = groups[relationship.child],
                                thunk;

                            /* jshint boss:true */
                            while(thunk = thunks.shift()) {
                            /* jshint boss:false */
                                thunk();
                            }

                            callChildrenOf(relationship.child);
                        });

                    }

                    callChildrenOf(null);
                }
            };

            function StateTree  () {
                this.constructors = {};
                this.instances = {};
            }
            StateTree.prototype = {
                $injector: null,

                addConstructor: function(name, constructor, mixins) {
                    if (this.constructors[name]) {
                        return this;
                    }

                    this.constructors[name] = {
                        name: name,
                        fn: constructor,
                        mixins: mixins,
                        instances: []
                    };

                    return this;
                },
                addInstance: function(instanceName, constructorName, parentName, mixins) {
                    var parent = this.instances[parentName],
                        config = {
                            name: instanceName,
                            constructor: this.constructors[constructorName],
                            mixins: [],
                            instance: null,
                            children: [],
                            parent: parent
                        };

                    this.instances[instanceName] = config;
                    (parentName ? parent.children : []).push(config);
                    config.constructor.instances.push(config);

                    return this.addInstanceInitializers(instanceName, mixins || []);
                },
                addInstanceInitializers: function(name, mixins) {
                    var existing = this.instances[name].mixins;

                    existing.push.apply(existing, mixins);

                    return this;
                },

                descendentsOf: function(instance) {
                    var stateTree = this;

                    return instance.children.reduce(function(result, child) {
                        return result.concat(stateTree.descendentsOf(child));
                    }, instance.children);
                },
                ancestorsOf: function(instance) {
                    var result = [];

                    function push(instance) {
                        result.push(instance);

                        if (!instance.parent) { return; }

                        push(instance.parent);
                    }

                    push(instance.parent);

                    return result;
                },
                closestInstance: function(constructorName, instanceName) {
                    var constructor = this.constructors[constructorName],
                        instance = this.instances[instanceName],
                        stateTree = this;

                    function closest(instances, target) {
                        var siblings = target.parent.children,
                            allInstances = [].concat(
                                siblings,
                                stateTree.descendentsOf(target),
                                stateTree.ancestorsOf(target)
                            ).reverse();

                        return allInstances[instances.reduce(function(index, instance) {
                            var instanceIndex = allInstances.indexOf(instance);

                            return Math.max(index, instanceIndex);
                        }, -1)];
                    }

                    return (constructor && instance) &&
                        (closest(constructor.instances, instance) || {}).name;
                },

                instantiate: function(name) {
                    var $injector = this.$injector,
                        c6State = $injector.get('c6State'),
                        config = this.instances[name],
                        mixins = config.constructor.mixins.concat(config.mixins);

                    /* jshint boss:true */
                    return (config.instance = mixins.reduce(function(instance, fn) {
                        return mixin(instance, fn, c6State);
                    }, $injector.instantiate(config.constructor.fn)));
                },
                get: function(name) {
                    var config = this.instances[name];

                    return config && (config.instance || this.instantiate(name));
                }
            };

            C6State.$inject = ['$injector','$q','$http','$templateCache','$location','$rootScope',
                               'c6AsyncQueue','c6EventEmitter','$timeout'];
            function C6State  ( $injector , $q , $http , $templateCache , $location , $rootScope ,
                                c6AsyncQueue , c6EventEmitter , $timeout ) {
                var self = this,
                    _private = {};

                var lastPath = null,
                    currentContext = 'main',
                    queue = c6AsyncQueue();

                function nextTick() {
                    return $timeout(noop);
                }

                function qSeries(fns) {
                    return fns.reduce(function(promise, fn) {
                        return promise.then(fn);
                    }, $q.when());
                }

                function routePathToState() {
                    var path = $location.path() || '/',
                        // Find the context that has URL routing enabled
                        context = Object.keys(contexts)
                            .reduce(function(context, contextName) {
                                var next = contexts[contextName];

                                return next.enableUrlRouting ? next : context;
                            }, null),
                        routes = context.routes,
                        // Find the State for this path
                        route = routes.reduce(function(route, next) {
                            var matcher = next.matcher;

                            return route || ((!!matcher && matcher.test(path)) ?
                                next : route);
                        }, null),
                        // Get the state object instance for this URL
                        state = self.in(context.name, function() {
                            return self.get(route.name);
                        }),
                        // Get the dynamic segments of the URL in the correct order (according to
                        // the order in the URL.)
                        keys = state.cUrl ? (state.cUrl.match(/:[^\/]+/g) || [])
                            .map(function(key) {
                                return key.substring(1);
                            }) : [],
                        // Create the paramaters object for this route
                        dynamicParams = (path.match(route.matcher) || [])
                            .slice(1)
                            .reduce(function(params, value, index) {
                                params[keys[index]] = value;

                                return params;
                            }, {}),
                        family = stateFamilyOf(state);

                    if (path ===  lastPath) { return false; }

                    // Iterate through all the states in this transition
                    family.forEach(function(state) {
                        // Create a parameters object based on the dynamic segments of this route
                        // only (not including children and parents.)
                        var params = state.cParams &&
                            Object.keys(state.cParams)
                                .reduce(function(params, key) {
                                    params[key] = dynamicParams[key];

                                    return params;
                                }, {});

                        // If the params have changed, ditch the current model and update the
                        // cParams.
                        if (!equals(params, state.cParams)) {
                            state.cModel = null;
                            state.cParams = params;
                        }
                    });

                    self.goTo(
                        route.name,
                        null,
                        (Object.keys($location.search()).length > 0) ?
                            copy($location.search()) : null,
                        true
                    );

                    lastPath = path;

                    return true;
                }

                Object.defineProperties(this, {
                    current: {
                        configurable: true,
                        get: function() {
                            return contexts[currentContext].current;
                        }
                    }
                });

                this.isActive = function(state) {
                    return stateFamilyOf(this.get(this.current)).indexOf(state) > -1;
                };

                this.get = function(name) {
                    var tree = contexts[currentContext].tree;

                    function byConstructor(name) {
                        var instanceName = tree.closestInstance(name, self.current);

                        return tree.get(instanceName);
                    }

                    return tree.get(name) || byConstructor(name);
                };

                this.goTo = queue.wrap(function(stateName, models, params, replace) {
                    var state = this.get(stateName),
                        current = this.get(this.current) || null,
                        family = stateFamilyOf(state),
                        statesWithModels = (models && models.length) ?
                            family.slice(-models.length) : [];

                    statesWithModels.forEach(function(state, index) {
                        state.cModel = models[index];
                    });

                    return _private.exitState(current, state)
                        .then(function() { return _private.resolveStates(family, params || null); })
                        .then(_private.renderStates)
                        .then(function syncUrl(states) {
                            return _private.syncUrl(states, !!replace);
                        })
                        .then(nextTick)
                        .then(function updateParams() {
                            return params ? $location.search(params).replace() : $location;
                        })
                        .then(function fulfill() {
                            var prevState = self.in(state.cContext, function() {
                                return self.get(self.current) || null;
                            });

                            contexts[state.cContext].current = state.cName;
                            self.emit('stateChange', state, prevState);
                            if (state.enter) {
                                state.enter();
                            }

                            return state;
                        });
                }, this);

                this.$emitThroughStates = function() {
                    var viewDelegates = contexts[currentContext].viewDelegates,
                        scope = viewDelegates
                            .map(function(viewDelegate) {
                                return viewDelegate.scope;
                            })
                            .reverse()
                            .reduce(function(scope, nextScope) {
                                return scope || nextScope;
                            });

                    return scope.$emit.apply(scope, arguments);
                };

                this.in = function(context, fn) {
                    var result;

                    currentContext = context;
                    result = fn();
                    currentContext = 'main';

                    return result;
                };

                this._registerView = function(viewDelegate) {
                    var parent = viewDelegate.parent,
                        id = viewDelegate.id,
                        contextsArray = Object.keys(contexts).map(function(contextName) {
                            return contexts[contextName];
                        }),
                        urlRoutedContext = find(contextsArray, function(context) {
                            return context.enableUrlRouting;
                        }),
                        views = find(
                            contextsArray,
                            parent ?
                                function(context) {
                                    var viewDelegates = context.viewDelegates;

                                    return viewDelegates.indexOf(parent) > -1;
                                } :
                                function(context) {
                                    return context.rootView === id;
                                }
                        ).viewDelegates;

                    views.push(viewDelegate);

                    if (!parent && id === urlRoutedContext.rootView) {
                        routePathToState();
                    }

                    return viewDelegate;
                };

                this._deregisterView = function(viewDelegate) {
                    var views = Object.keys(contexts)
                        .reduce(function(views, contextName) {
                            var viewDelegates = contexts[contextName].viewDelegates;
                            return viewDelegates.indexOf(viewDelegate) > -1 ?
                                viewDelegates : views;
                        }, []);

                    views.splice(views.indexOf(viewDelegate), 1);
                };

                _private.syncUrl = function(states, replace) {
                    var currentPath = $location.path(),
                        params = states.map(function(state) {
                            return state.cParams ?
                                state.serializeParams(state.cModel) : null;
                        }),
                        values = params.reduce(function(values, part) {
                            return extend(values, part);
                        }, {}),
                        path = urlOfStateFamily(states, null, values);

                    states.forEach(function(state, index) {
                        state.cParams = params[index];
                    });

                    if (path === null) { return  path; }

                    lastPath = path;

                    if (path !== currentPath) {
                        $location.path(path);

                        if (replace) {
                            $location.replace();
                        }
                    }

                    return path;
                };

                _private.exitState = function(current, next) {
                    var currentFamily = stateFamilyOf(current);
                    var nextFamily = stateFamilyOf(next);
                    var exiting = currentFamily.filter(function(state) {
                        return nextFamily.indexOf(state) < 0;
                    });

                    if (!current) { return $q.when(null); }

                    return qSeries(exiting.reverse().map(function(state) {
                        return function() {
                            return (state.exit || noop).call(state, next);
                        };
                    })).then(function() {
                        return current;
                    });
                };

                _private.resolveStates = function(states, params) {
                    function setupTemplate(state) {
                        var templateUrl = state.templateUrl;

                        return (templateUrl ?
                            $http.get(templateUrl, {
                                cache: $templateCache
                            }).then(function (response) {
                                return response.data;
                            }) : $q.when(state.template))
                                .then(function set(template) {
                                    state.cTemplate = template || '<c6-view></c6-view>';
                                });
                    }

                    return qSeries(states.map(function(state) {
                        var currentModel = state.cModel,
                            stateParams = fnExtend(state.cParams, params);

                        function orModel() {
                            var args = Array.prototype.slice.call(arguments),
                                fn = args.shift();

                            return currentModel ||
                                fn.apply(state, args);
                        }

                        function beforeModel() {
                            return orModel(state.beforeModel || noop);
                        }

                        function model() {
                            return orModel(state.model || noop, stateParams);
                        }

                        function afterModel(model) {
                            var afterModelFn = state.afterModel || noop,
                                shouldBeCalled = (afterModelFn.lastCallValue !== model) ||
                                    !state.cRendered,
                                result;

                            state.cModel = model || null;
                            state.cTitle = (state.title || function() {
                                return this.cParent && this.cParent.cTitle;
                            }).call(state, state.cModel);

                            result = shouldBeCalled ?
                                afterModelFn.call(state, model, stateParams) : null;
                            afterModelFn.lastCallValue = model;

                            return result;
                        }

                        return function() {
                            return setupTemplate(state)
                                .then(beforeModel)
                                .then(model)
                                .then(afterModel)
                                .catch(function() {
                                    state.cModel = null;
                                    return $q.reject.apply($q, arguments);
                                });
                        };
                    })).then(function fulfill() {
                        return states;
                    });
                };

                _private.renderStates = function(states) {
                    var views = contexts[states[0].cContext].viewDelegates,
                        numOfViews = views.length,
                        numOfStates = states.length,
                        extraViews = numOfViews > numOfStates ?
                            views.slice(numOfStates - numOfViews) : [];

                    return qSeries(states.map(function(state, index) {
                        return function() {
                            var view = views[index];

                            if (!view) {
                                return $q.reject(
                                    'Cannot render state: ' + state.cName + '. ' +
                                    'There is no <c6-view> for rendering.'
                                );
                            }

                            return view.render(state);
                        };
                    })).then(function removeExtras() {
                        return qSeries(extraViews.map(function(view) {
                            return function() {
                                return view.clear();
                            };
                        }));
                    }).then(function fulfill() {
                        return states;
                    });
                };

                if (window.c6.kHasKarma) { this._private = _private; }

                $rootScope.$on('$locationChangeSuccess', routePathToState);

                c6EventEmitter(this);
                this.setMaxListenersWarning(0);
            }

            function Route(name, url) {
                this.name = name;
                this.url = url;
                this.matcher = url ? (url || null) && new RegExp(
                    '^' +
                    url.replace(/:[^\/]+/g, '([^\\/]+)')
                        .replace(/\//g, '\\/') +
                    '$'
                ) : /.*/;
            }

            function Mapper(context, parent) {
                this.parent = parent;
                this.context = context;
            }
            Mapper.prototype = {
                state: function(constructorName) {
                    var parent = this.parent,
                        context = this.context,
                        args = argParser({
                            name: [[1, isString], [0]],
                            mapFn: [[2, isFunction], [1, isFunction]]
                        }, arguments),
                        name = args.name, mapFn = args.mapFn;

                    stateConfigs.relate(parent, name)
                        .push(name, function() {
                            var constructor = stateConstructors[constructorName],
                                routes = (context.routes || new List()),
                                parentUrl = (routes.get(parent) || {}).url ||
                                    (context.enableUrlRouting ? '' : null);

                            context.tree
                                .addConstructor(constructorName, constructor, [function() {
                                    this.cTitle = null;
                                    this.cModel = null;
                                    this.cTemplate = null;
                                    this.cParams = null;
                                    this.cRendered = false;
                                }])
                                .addInstance(name, constructorName, parent, [function(c6State) {
                                    this.cParent = parent && c6State.get(parent);
                                    this.cUrl = parentUrl;
                                    this.cContext = context.name;
                                    this.cName = name;
                                }]);

                            routes.set(name, new Route(name, parentUrl));
                        });

                    if (mapFn) {
                        mapFn.call(new Mapper(this.context, name));
                    }
                },
                route: function(route, constructorName) {
                    var context = this.context,
                        args = argParser({
                            name: [[2, isString], [1]],
                            mapFn: [[3, isFunction], [2, isFunction]]
                        }, arguments),
                        name = args.name, mapFn = args.mapFn;

                    if (!this.context.enableUrlRouting) {
                        throw new Error(
                            'Cannot map route "' + route + '"' +
                            ' in context "' + this.context.name + '".' +
                            ' URL Routing is not enabled.'
                        );
                    }

                    this.state(constructorName, name);

                    stateConfigs.push(name, function() {
                        var url = (route || null) &&
                                context.routes.get(name).url.replace(/\/$/, '') + route;

                        context.tree.addInstanceInitializers(name, [function() {
                            this.cUrl = url;
                            this.cParams = url && (route.match(/:[^\/]+/g) || [])
                                .reduce(function(params, match) {
                                    params[match.substr(1)] = null;

                                    return params;
                                }, {});

                            this.serializeParams = this.serializeParams || function(model) {
                                var prop = (route.match(/:[^\/]+/) || [''])[0]
                                        .substr(1) || null,
                                    result = {};

                                if (prop) { result[prop] = model.id; }

                                return result;
                            };
                        }]);

                        context.routes.set(name, new Route(name, url));
                    });

                    if (mapFn) {
                        mapFn.call(new Mapper(this.context, name));
                    }
                }
            };

            stateConfigs = new Thunker();

            this.map = function(context, parent, mapFn) {
                var mapper;

                switch (arguments.length) {
                case 1:
                    mapFn = arguments[0];
                    context = 'main';
                    parent = 'Application';
                    break;
                case 2:
                    mapFn = arguments[1];
                    parent = arguments[0];
                    context = 'main';
                    break;
                }

                context = contexts[context || 'main'];

                mapper = new Mapper(context, parent);

                mapFn.call(mapper);
            };

            this.state = function(name, constructor) {
                stateConstructors[name] = constructor;

                return this;
            };

            this.config = function(context, config) {
                var contextWithUrlRouting;

                if (!config) {
                    config = context;
                    context = 'main';
                }

                contextWithUrlRouting = Object.keys(contexts)
                    .reduce(function(result, name) {
                        var context = contexts[name];

                        return context.enableUrlRouting ? context : result;
                    }, null);

                if (contextWithUrlRouting && config.enableUrlRouting) {
                    throw new Error(
                        'Cannot enable URL routing in context "' + context + '" because it is ' +
                        'already enabled in context "' + contextWithUrlRouting.name + '".'
                    );
                }

                config = extend(contexts[context] || {
                    name: context,
                    tree: new StateTree(),
                    viewDelegates: [],
                    routes: config.enableUrlRouting ? new List() : null,
                    current: null
                }, config);

                contexts[context] = config;
            };

            this.$get = ['$injector',
            function    ( $injector ) {
                StateTree.prototype.$injector = $injector;

                forEach(contexts, function(context) {
                    this.map(context.name, null, function() {
                        if (context.enableUrlRouting) {
                            this.route('/', context.rootState, function() {
                                this.route(null, 'Error');
                            });
                        } else {
                            this.state(context.rootState);
                        }
                    });
                }, this);

                stateConfigs.force();

                return $injector.instantiate(C6State);
            }];

            this.state('Application', function() {});
            this.state('Error', function() {});

            this.config('main', {
                rootState: 'Application',
                rootView: null,
                enableUrlRouting: true
            });
        }]);
});
