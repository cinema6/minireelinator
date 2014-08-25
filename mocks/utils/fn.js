/* global exports */
(function() {
    'use strict';

    exports.extend = function() {
        return Array.prototype.slice.call(arguments)
            .reduce(function(extension, object) {
                return Object.keys(object)
                    .reduce(function(extension, key) {
                        extension[key] = object[key];

                        return extension;
                    }, extension);
            }, {});
    };

    exports.withDefaults = function(object, defaults) {
        return Object.keys(defaults).concat(Object.keys(object))
            .filter(function(key, index, keys) {
                return keys.indexOf(key) === index;
            })
            .reduce(function(result, key) {
                if (!object.hasOwnProperty(key)) {
                    result[key] = defaults[key];
                } else {
                    result[key] = object[key];
                }

                return result;
            }, {});
    };

    exports.pluckExcept = function(object, keys) {
        return Object.keys(object)
            .reduce(function(result, key) {
                if (keys.indexOf(key) < 0) {
                    result[key] = object[key];
                }

                return result;
            }, {});
    };

    exports.pluck = function(object, keys) {
        return Object.keys(object)
            .reduce(function(result, key) {
                if (keys.indexOf(key) > -1) {
                    result[key] = object[key];
                }

                return result;
            }, {});
    };

    exports.mapObject = function(object, extractor) {
        return Object.keys(object)
            .reduce(function(result, key) {
                result[key] = extractor(object[key], key, object);
                return result;
            }, {});
    };
}());
