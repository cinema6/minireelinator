define( ['angular','c6_state','minireel/services','c6_defines'],
function( angular , c6State  , services          , c6Defines  ) {
    'use strict';

    return angular.module('c6.app.minireel.editor.videoSearch', [c6State.name, services.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:VideoSearch', [function() {
                this.templateUrl = 'views/minireel/editor/video_search.html';
                this.controller = 'VideoSearchController';
                this.controllerAs = 'VideoSearchCtrl';

                // TODO: REMOVE THIS BEFORE GOING TO PRODUCTION
                this.beforeModel = function() {
                    if (!c6Defines.kDebug) {
                        c6State.goTo('MR:Editor');
                    }
                };
            }]);
        }])

        .controller('VideoSearchController', ['$scope','VideoSearchService','MiniReelService',
        function                             ( $scope , VideoSearchService , MiniReelService ) {
            var self = this,
                EditorCtrl = $scope.EditorCtrl;

            this.query = {
                query: '',
                sites: undefined,
                hd: undefined
            };
            this.result = null;

            this.currentPreview = null;

            this.search = function() {
                return VideoSearchService.find(this.query)
                    .then(function assign(result) {
                        /* jshint boss:true */
                        return (self.result = result);
                    });
            };

            this.preview = function(video) {
                /* jshint boss:true */
                return this.currentPreview = video;
            };

            this.addVideo = function(video) {
                var card = MiniReelService.createCard('video');

                card.title = video.title;
                card.note = video.description;
                card.data.service = video.site;
                card.data.videoid = video.videoid;

                return EditorCtrl.pushCard(card);
            };
        }]);
});
