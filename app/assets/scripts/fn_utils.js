define (['angular'],
function( angular ) {
    'use strict';

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

            return {
                rejectify: rejectify,
                fulfillify: fulfillify,
                invertPromise: invertPromise,
                onRejection: onRejection,
                onFulfillment: onFulfillment,
            };
        }]);
});
