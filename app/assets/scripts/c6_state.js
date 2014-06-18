(function() {
    'use strict';

    angular.module('c6.state', [])
        .provider('c6State', [function() {
            var stateConstructors = {
                Application: (function() {
                    var Application = function() {};

                    Application.init = function() {
                        this.cParent = null;
                        this.cModel = null;
                        this.cUrl = '/';

                        return this;
                    };

                    return Application;
                }())
            };

            function C6State($injector) {
                var states = {};

                this.get = function(name) {
                    var constructor = stateConstructors[name];

                    return states[name] ||
                        (states[name] = constructor.init.call(
                            $injector.instantiate(constructor),
                            this
                        ));
                };
            }

            function Mapper(parent) {
                this.parent = parent;
            }
            Mapper.prototype = {
                state: function(name, mapFn) {
                    var constructor = stateConstructors[name],
                        parent = this.parent;

                    constructor.init = function(c6State) {
                        this.cParent = c6State.get(parent);
                        this.cUrl = null;
                        this.cModel = null;

                        return this;
                    };

                    if (mapFn) {
                        mapFn.call(new Mapper(name));
                    }
                }
            };

            this.state = function(name, constructor) {
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
