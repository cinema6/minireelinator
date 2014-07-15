define (['angular'],
function( angular ) {
    'use strict';

    return angular.module('c6.app.fnUtils', [])
        /**
         * A collection of functions for use in functional-style implementations.
         *
         * @class fn
         * @static
         */
        .factory('fn', ['$q',
        function       ( $q ) {
            function rejectify(value) {
                return $q.reject(value);
            }

            function fulfillify(value) {
                return $q.when(value);
            }

            /**
             * Accepts a promise and returns a new promise that will rejected with the fulfillment
             * value of the provided promise or fulfilled with the rejection value of the provided
             * promise.
             *
             * @method invertPromise
             * @param {Promise} promise The promise to invert
             * @return {Promise} The inverted promise
             */
            function invertPromise(promise) {
                return promise.then(rejectify, fulfillify);
            }

            /**
             * Calls a function but ignores the return value of the function, instead just
             * propagating the rejection to the next handler.
             *
             * @method onRejection
             * @param {Function} fn A function to call when the promise is resolved
             * @return {Function} A function that will call the provided fn function and return a
             * promise that is rejected with the same reason
             */
            function onRejection(fn) {
                return function(reason) {
                    fn(reason);
                    return rejectify(reason);
                };
            }

            /**
             * Calls a function but ignores the return value of the function, instead just
             * propagating the fulfillment to the next handler.
             *
             * @method onFulfillment
             * @param {Function} fn A function to call when the promise is resolved
             * @return {Function} A function that will call the provided fn function and return a
             * promise that is fulfilled with the same reason
             */
            function onFulfillment(fn) {
                return function(value) {
                    fn(value);
                    return fulfillify(value);
                };
            }

            return {
                rejectify: rejectify,
                fulfillify: fulfillify,
                invertPromise: invertPromise,
                onRejection: onRejection,
                onFulfillment: onFulfillment,
            };
        }]);
});
