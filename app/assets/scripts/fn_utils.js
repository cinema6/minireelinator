define (['angular'],
function( angular ) {
    'use strict';

    var isNumber = angular.isNumber,
        isString = angular.isString;

    return angular.module('c6.app.fnUtils', [])
        .factory('fn', ['$q',
        function       ( $q ) {
            function rejectify(value) {
                return $q.reject(value);
            }

            function fulfillify(value) {
                return $q.when(value);
            }

            function invertPromise(promise) {
                return promise.then(rejectify, fulfillify);
            }

            function promiseOn(value) {
                return value ? $q.when(value) : $q.reject(value);
            }

            function onRejection(fn) {
                return function(reason) {
                    fn(reason);
                    return rejectify(reason);
                };
            }

            function onFulfillment(fn) {
                return function(value) {
                    fn(value);
                    return fulfillify(value);
                };
            }

            function first(array) {
                return array[0];
            }

            function not(value) {
                return !truthy(value);
            }

            function truthy(value) {
                return !!value;
            }

            function is(value1, value2) {
                return value1 === value2;
            }

            function values(object) {
                return valuesOfKeys(Object.keys(object), object);
            }

            function all(values, predicate) {
                return values.map(predicate).indexOf(false) < 0;
            }

            function value(v) {
                return function() {
                    return v;
                };
            }

            function valuesOfKeys(keys, object) {
                return keys.reduce(function(array, key) {
                    array.push(object[key]);
                    return array;
                }, []);
            }

            function apply(object, method, args) {
                return object[method].apply(object, args);
            }

            function call() {
                var args = toArray(arguments),
                    object = args.shift(),
                    method = args.shift();

                return apply(object, method, args);
            }

            function toArray(array) {
                if (isNumber(array.length) && !isString(array)) {
                    return Array.prototype.slice.call(array);
                }

                return [array];
            }

            function cat() {
                var args = toArray(arguments);

                return args.reduce(function(array, next) {
                    return array.concat(next);
                }, []);
            }

            function partial(fn) {
                return function() {
                    var args = toArray(arguments);

                    return function() {
                        return fn.apply(null, cat(args, toArray(arguments)));
                    };
                };
            }

            function transformArgs(transformFn, fn) {
                return function() {
                    return fn.apply(null, toArray(arguments).map(transformFn));
                };
            }

            return {
                /* Promise Functions */
                rejectify: rejectify,
                fulfillify: fulfillify,
                invertPromise: invertPromise,
                promiseOn: promiseOn,
                onRejection: onRejection,
                onFulfillment: onFulfillment,

                /* Top-Level Functions */
                not: not,
                is: is,
                truthy: truthy,
                values: values,
                all: all,
                value: value,
                valuesOfKeys: valuesOfKeys,
                apply: apply,
                call: call,
                toArray: toArray,
                cat: cat,
                partial: partial,
                first: first,
                transformArgs: transformArgs
            };
        }]);
});
