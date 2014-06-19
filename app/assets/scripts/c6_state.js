(function() {
    'use strict';

    var noop = angular.noop;

    function mixin(instance, constructor) {
        var args = Array.prototype.slice.call(arguments, 2);

        constructor.apply(instance, args);

        return instance;
    }

    angular.module('c6.state', [])
        .provider('c6State', [function() {
            var stateConstructors = {},
                contexts = {};

            function C6State($injector) {
                var self = this;

                var states = {},
                    currentContext = 'main';

                this.get = function(name) {
                    var context = contexts[currentContext],
                        constructor = (context.rootState === name) ?
                            stateConstructors[name] : context.stateConstructors[name],
                        initializers = (constructor && constructor.initializers) ||
                            [function() {
                                this.cModel = null;
                                this.cUrl = context.enableUrlRouting ? '' : null;
                                this.cParent = null;
                            }];

                    return states[name] || (constructor &&
                        (states[name] = initializers.reduce(function(state, initializer) {
                            return mixin(state, initializer, self);
                        }, $injector.instantiate(constructor))));
                };

                this.in = function(context, fn) {
                    currentContext = context;
                    fn();
                    currentContext = 'main';
                };
            }

            function Mapper(context, parent) {
                this.parent = parent;
                this.context = context;
            }
            Mapper.prototype = {
                state: function(name, mapFn) {
                    var constructor = stateConstructors[name],
                        initializers = constructor.initializers ||
                            (constructor.initializers = []),
                        parent = this.parent;

                    initializers.push(function(c6State) {
                        this.cParent = c6State.get(parent);
                        this.cUrl = null;
                        this.cModel = null;
                    });

                    this.context.stateConstructors[name] = constructor;

                    if (mapFn) {
                        mapFn.call(new Mapper(this.context, name));
                    }
                },
                route: function(route, name, mapFn) {
                    var constructor = stateConstructors[name];

                    this.state(name, mapFn);

                    constructor.initializers.push(function() {
                        this.cUrl = this.cParent.cUrl + route;
                    });
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

                mapper = new Mapper(context, parent);

                mapFn.call(mapper);
            };

            this.state = function(name, constructor) {
                stateConstructors[name] = constructor;

                return this;
            };

            this.config = function(context, config) {
                config.stateConstructors = {};

                contexts[context] = config;
            };

            this.$get = ['$injector',
            function    ( $injector ) {
                return new C6State($injector);
            }];

            this.state('Application', noop);

            this.config('main', {
                rootState: 'Application',
                enableUrlRouting: true
            });
        }]);
}());
