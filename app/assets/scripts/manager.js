(function() {
    'use strict';

    angular.module('c6.mrmaker')
        .controller('ManagerController', ['c6State','MiniReelService','ConfirmDialogService',
                                          'cinema6',
        function                         ( c6State , MiniReelService , ConfirmDialogService ,
                                           cinema6 ) {
            var self = this,
                appData = null;

            this.filter = 'all';

            this.copy = function(minireelId) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to copy this MiniReel?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return MiniReelService.create(minireelId)
                            .then(function open(minireel) {
                                return MiniReelService.open(minireel.id);
                            })
                            .then(function editCopy(minireel) {
                                c6State.goTo(
                                    'editor.setMode.category',
                                    { minireelId: minireel.id }
                                );
                            });
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.edit = function(minireel) {
                c6State.goTo('editor', { minireelId: minireel.id });
            };

            this.makePublic = function(minireel) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this MiniReel public?',
                    affirm: 'Publish',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        MiniReelService.publish(minireel.id);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.makePrivate = function(minireel) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this MiniReel private?',
                    affirm: 'Make Private',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        MiniReelService.unpublish(minireel.id);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.remove = function(minireel) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this MiniReel?',
                    affirm: 'Delete',
                    cancel: 'Keep',
                    onCancel: function() {
                        ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        MiniReelService.erase(minireel.id)
                            .then(function removeFromModel() {
                                var minireels = self.model;

                                minireels.splice(minireels.indexOf(minireel), 1);
                            });

                        ConfirmDialogService.close();
                    }
                });
            };

            this.modeNameFor = function(minireel) {
                return appData &&
                    MiniReelService.modeDataOf(
                        minireel,
                        appData.experience.data.modes
                    ).name;
            };

            this.determineInclusionWithFilter = function(minireel) {
                return self.filter === 'all' || self.filter === minireel.status;
            };

            cinema6.getAppData()
                .then(function save(data) {
                    appData = data;
                });
        }])

        .controller('NewController', ['$scope','cModel','MiniReelService',
        function                     ( $scope , cModel , MiniReelService ) {
            var self = this;

            this.mode = MiniReelService.modeDataOf(
                cModel.minireel,
                cModel.modes
            );
            this.category = MiniReelService.modeCategoryOf(
                cModel.minireel,
                cModel.modes
            );
            this.autoplay = cModel.minireel.data.autoplay;

            this.save = function() {
                var data = this.model.minireel.data;

                data.autoplay = this.autoplay;
                data.mode = this.mode.value;
            };

            $scope.$watch(function() { return self.category; }, function(category, prevCategory) {
                if (category === prevCategory) { return; }

                self.mode = self.category.modes[0];
            });

            $scope.$watch(function() { return self.mode; }, function(mode) {
                var minireel = self.model.minireel;

                self.autoplay = mode.autoplayable && minireel.data.autoplay;
            });
        }]);
}());
