define(['angular', 'metagetta', 'intercom'], function(angular, metagetta, intercom) {
    'use strict';

    return angular.module('c6.libs', [])
        .value('metagetta', metagetta)
        .value('intercom', intercom);
});
