(function() {
    'use strict';

    function mixin(instance, constructor) {
        var args = Array.prototype.slice.call(arguments, 2);

        constructor.apply(instance, args);

        return instance;
    }

    angular.module('c6.state', [])
        .provider('c6State', [function() {
            var stateConstructors = {
                Application: (function() {
                    var Application = function() {};

                    Application.initializers = [function() {
                        this.cParent = null;
                        this.cModel = null;
                        this.cUrl = '/';
                    }];

                    return Application;
                }())
            };

            function C6State($injector) {
                var self = this;

                var states = {};

                this.get = function(name) {
                    var constructor = stateConstructors[name],
                        initializers = constructor.initializers;

                    return states[name] ||
                        (states[name] = initializers.reduce(function(state, initializer) {
                            return mixin(state, initializer, self);
                        }, $injector.instantiate(constructor)));
                };
            }

            function Mapper(parent) {
                this.parent = parent;
            }
            Mapper.prototype = {
                state: function(name, mapFn) {
                    var constructor = stateConstructors[name],
                        parent = this.parent;

                    constructor.initializers.push(function(c6State) {
                        this.cParent = c6State.get(parent);
                        this.cUrl = null;
                        this.cModel = null;
                    });

                    if (mapFn) {
                        mapFn.call(new Mapper(name));
                    }
                },
                route: function(route, name, mapFn) {
                    this.state(name, mapFn);
                }
            };

            this.state = function(name, constructor) {
                constructor.initializers = [];

                stateConstructors[name] = constructor;

                return this;
            };

            this.map = function(mapFn) {
                var mapper = new Mapper('Application');

                mapFn.call(mapper);
            };

            this.$get = ['$injector',
            function    ( $injector ) {
                return new C6State($injector);
            }];
        }]);
}());
