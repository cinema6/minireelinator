(function() {
    'use strict';

    var noop = angular.noop,
        extend = angular.extend,
        isDefined = angular.isDefined,
        equals = angular.equals,
        forEach = angular.forEach;

    function mixin(instance, constructor) {
        var args = Array.prototype.slice.call(arguments, 2);

        constructor.apply(instance, args);

        return instance;
    }

    angular.module('c6.state', ['c6.mrmaker.services'])
        .provider('c6State', [function() {
            var stateConstructors = {},
                contexts = {};

            C6State.$inject = ['$injector','$q','$http','$templateCache','$location','$rootScope',
                               'c6AsyncQueue'];
            function C6State  ( $injector , $q , $http , $templateCache , $location , $rootScope ,
                                c6AsyncQueue ) {
                var self = this,
                    _private = {};

                var states = {},
                    lastPath = null,
                    currentContext = 'main',
                    queue = c6AsyncQueue();

                function qSeries(fns) {
                    return fns.reduce(function(promise, fn) {
                        return promise ? promise.then(fn) : $q.when(fn());
                    }, null);
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

                Object.defineProperties(this, {
                    current: {
                        get: function() {
                            return contexts[currentContext].current;
                        }
                    }
                });

                this.get = function(name) {
                    var context = contexts[currentContext],
                        constructor = context.stateConstructors[name],
                        initializers = (constructor && constructor.initializers);

                    return states[name] || (constructor &&
                        (states[name] = initializers.reduce(function(state, initializer) {
                            return mixin(state, initializer, self);
                        }, $injector.instantiate(constructor))));
                };

                this.goTo = queue.wrap(function(stateName, models, params) {
                    var state = this.get(stateName),
                        family = stateFamilyOf(state),
                        statesWithModels = (models && models.length) ?
                            family.slice(-models.length) : [];

                    statesWithModels.forEach(function(state, index) {
                        state.cModel = models[index];
                    });

                    return _private.resolveStates(family)
                        .then(_private.renderStates)
                        .then(_private.syncUrl)
                        .then(function updateParams() {
                            return params ? $location.search(params) : $location;
                        })
                        .then(function fulfill() {
                            contexts[state.cContext].current = state.cName;

                            return state;
                        });
                }, this);

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
                        views = Object.keys(contexts)
                            .reduce(parent ?
                                function(views, contextName) {
                                    var context = contexts[contextName],
                                        viewDelegates = context.viewDelegates;

                                    return viewDelegates.indexOf(parent) > -1 ?
                                        viewDelegates : views;
                                } :
                                function(views, contextName) {
                                    var context = contexts[contextName];

                                    return context.rootView === id ?
                                        context.viewDelegates : views;
                                },
                            null);

                    views.push(viewDelegate);

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

                _private.syncUrl = function(states) {
                    var lastState = states[states.length - 1],
                        params = states.map(function(state) {
                            return state.cUrl ?
                                state.serializeParams(state.cModel) : {};
                        }),
                        values = params.reduce(function(values, part) {
                            return extend(values, part);
                        }, {}),
                        url = Object.keys(values).reduce(function(url, prop) {
                            return url.replace(':' + prop, values[prop]);
                        }, lastState.cUrl);

                    states.forEach(function(state, index) {
                        state.cParams = params[index];
                    });

                    if (url) {
                        $location.path(url);
                    }

                    return url;
                };

                _private.resolveStates = function(states) {
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
                        function beforeModel() {
                            return (state.beforeModel || noop).call(state);
                        }

                        function model() {
                            return state.cModel ||
                                (state.model || noop).call(state, state.cParams);
                        }

                        function afterModel(model) {
                            state.cModel = model || null;

                            return (state.afterModel || noop).call(state, model);
                        }

                        return function() {
                            return setupTemplate(state)
                                .then(beforeModel)
                                .then(model)
                                .then(afterModel);
                        };
                    })).then(function fulfill() {
                        return states;
                    });
                };

                _private.renderStates = function(states) {
                    return qSeries(states.map(function(state, index) {
                        var views = contexts[state.cContext].viewDelegates;

                        return function() {
                            var view = views[index];

                            return view.render(state);
                        };
                    })).then(function fulfill() {
                        return states;
                    });
                };

                if (window.c6.kHasKarma) { this._private = _private; }

                $rootScope.$on('$locationChangeStart', function(event) {
                    var path = $location.path(),
                        // Find the context that has URL routing enabled
                        context = Object.keys(contexts)
                            .reduce(function(context, contextName) {
                                var next = contexts[contextName];

                                return next.enableUrlRouting ? next : context;
                            }, null),
                        // Find the State for this path
                        route = context.routes.reduce(function(route, next) {
                            return next.matcher.test(path) ? next : route;
                        }, null),
                        // Get the state object instance for this URL
                        state = self.in(context.name, function() {
                            return self.get(route.name);
                        }),
                        // Get the dynamic segments of the URL in the correct order (according to
                        // the order in the URL.)
                        keys = (state.cUrl.match(/:[^\/]+/g) || [])
                            .map(function(key) {
                                return key.substring(1);
                            }),
                        // Create the paramaters object for this route
                        dynamicParams = (path.match(route.matcher) || [])
                            .slice(1)
                            .reduce(function(params, value, index) {
                                params[keys[index]] = value;

                                return params;
                            }, {}),
                        family = stateFamilyOf(state);

                    if (path ===  lastPath) { return; }

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

                    self.goTo(route.name);
                    lastPath = path;

                    event.preventDefault();
                });
            }

            function Mapper(context, parent, url) {
                this.parent = parent;
                this.context = context;
                this.url  = isDefined(url) ? url : null;
            }
            Mapper.prototype = {
                state: function(name, mapFn) {
                    var constructor = stateConstructors[name],
                        initializers = constructor.initializers ||
                            (constructor.initializers = []),
                        parent = this.parent,
                        context = this.context,
                        url = this.url;

                    initializers.push(function(c6State) {
                        this.cParent = parent && c6State.get(parent);
                        this.cUrl = url;
                        this.cModel = null;
                        this.cTemplate = null;
                        this.cContext = context.name;
                        this.cName = name;
                        this.cParams = null;
                    });

                    context.stateConstructors[name] = constructor;

                    if (mapFn) {
                        mapFn.call(new Mapper(this.context, name, url));
                    }
                },
                route: function(route, name, mapFn) {
                    var constructor = stateConstructors[name],
                        url = this.url + route;

                    if (!this.context.enableUrlRouting) {
                        throw new Error(
                            'Cannot map route "' + route + '"' +
                            ' in context "' + this.context.name + '".' +
                            ' URL Routing is not enabled.'
                        );
                    }

                    this.state(name);

                    constructor.initializers.push(function() {
                        this.cUrl = url;
                        this.cParams = (route.match(/:[^\/]+/g) || [])
                            .reduce(function(params, match) {
                                params[match.substr(1)] = null;

                                return params;
                            }, {});

                        this.serializeParams = this.serializeParams ||
                            function(model) {
                                var url = this.cUrl,
                                    prop = (url.match(/:[^\/]+/) || [''])[0]
                                        .substr(1) || null,
                                    result = {};

                                if (prop) { result[prop] = model.id; }

                                return result;
                            };
                    });

                    this.context.routes.push({
                        name: name,
                        matcher: new RegExp(
                            '^' +
                            url.replace(/:[^\/]+/g, '([^\\/]+)')
                                .replace(/\//g, '\\/') +
                            '$'
                        )
                    });

                    if (mapFn) {
                        mapFn.call(new Mapper(this.context, name, this.url + route));
                    }
                }
            };

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
                parent = parent || context.rootState;

                mapper = new Mapper(context, parent, context.enableUrlRouting ? '' : null);

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
                    stateConstructors: {},
                    viewDelegates: [],
                    routes: config.enableUrlRouting ? [] : null,
                    current: null
                }, config);

                contexts[context] = config;
            };

            this.$get = ['$injector',
            function    ( $injector ) {
                forEach(contexts, function(context) {
                    if (context.enableUrlRouting) {
                        (new Mapper(context, null, ''))
                            .route('', context.rootState);
                    } else {
                        (new Mapper(context, null, null))
                            .state(context.rootState);
                    }
                });

                return $injector.instantiate(C6State);
            }];

            this.state('Application', noop);

            this.config('main', {
                rootState: 'Application',
                rootView: null,
                enableUrlRouting: true
            });
        }]);
}());
