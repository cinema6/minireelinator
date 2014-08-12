define( ['angular','c6_state','minireel/services'],
function( angular , c6State  , services          ) {
    'use strict';

    return angular.module('c6.app.minireel.editor.videoSearch', [c6State.name, services.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:VideoSearch', [function() {
                this.templateUrl = 'views/minireel/editor/video_search.html';
                this.controller = 'VideoSearchController';
                this.controllerAs = 'VideoSearchCtrl';
            }]);
        }])

        .controller('VideoSearchController', ['VideoSearchService',
        function                             ( VideoSearchService ) {
            var self = this;

            this.query = '';
            this.result = null;

            this.search = function() {
                return VideoSearchService.find({
                    query: this.query
                }).then(function assign(result) {
                    /* jshint boss:true */
                    return (self.result = result);
                });
            };
        }]);
});
