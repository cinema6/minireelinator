(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('EditorController', ['cModel','c6State','$scope',
        function                        ( cModel , c6State , $scope ) {
            this.model = cModel;

            this.editCard = function(card) {
                c6State.transitionTo('editor.editCard', { id: card.id });
            };

            this.newCard = function() {
                c6State.transitionTo('editor.newCard.type');
            };

            $scope.$on('addCard', function(event, card) {
                cModel.data.deck.push(card);
            });
        }])

        .controller('EditCardController', ['$scope','cModel','c6Computed','c6State','VideoService',
        function                          ( $scope , cModel , c6Computed , c6State , VideoService ) {
            var c = c6Computed($scope);

            this.model = cModel;
            VideoService.createVideoUrl(c, this, 'EditCardCtrl');

            this.close = function() {
                c6State.transitionTo('editor', { id: $scope.EditorCtrl.model.id });
            };
        }])

        .controller('NewCardTypeController', ['cModel','c6State',
        function                             ( cModel , c6State ) {
            this.model = cModel;
            this.type = null;

            this.edit = function() {
                var type = this.type;

                if (!type) {
                    throw new Error('Can\'t edit before a type is chosen.');
                }

                c6State.transitionTo('editor.newCard.edit', { type: type });
            };
        }])

        .controller('NewCardEditController', ['cModel','c6Computed','$scope','VideoService','c6State',
        function                             ( cModel , c6Computed , $scope , VideoService , c6State ) {
            var c = c6Computed($scope);

            this.model = cModel;
            VideoService.createVideoUrl(c, this, 'NewCardEditCtrl');

            this.save = function() {
                var minireel = c6State.get('editor').cModel;

                $scope.$emit('addCard', cModel);
                c6State.transitionTo('editor', { id: minireel.id });
            };
        }])

        .directive('videoPreview', ['c6UrlMaker',
        function                   ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_preview.html'),
                scope: {
                    service: '@',
                    videoid: '@'
                }
            };
        }]);
}());
