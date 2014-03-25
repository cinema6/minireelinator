(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['cModel','c6State',
        function                         ( cModel , c6State ) {
            this.model = cModel;

            this.edit = function(minireel) {
                c6State.transitionTo('editor', { id: minireel.id });
            };
        }]);
}());
