/* global exports */
(function() {
    'use strict';

    exports.idFromPath = function(path) {
        return path.match(/[^\/]+$/)[0];
    };
}());
