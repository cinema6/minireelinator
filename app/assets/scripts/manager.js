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

            this.copy = function(minireel) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to copy this MiniReel?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return MiniReelService.create(minireel)
                            .then(function save(minireel) {
                                return minireel.save();
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

                        MiniReelService.publish(minireel);
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

                        MiniReelService.unpublish(minireel);
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
                        MiniReelService.erase(minireel)
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

        .controller('NewController', ['$scope','cModel','MiniReelService','c6State','$q','appData',
        function                     ( $scope , cModel , MiniReelService , c6State , $q , appData ) {
            var self = this,
                minireel = cModel.minireel;

            function tabBySref(sref) {
                return self.tabs.reduce(function(result, next) {
                    return next.sref === sref ? next : result;
                }, null);
            }

            function incrementTabVisits(state) {
                var name = state.name
                    .replace(self.baseState + '.', '');

                tabBySref(name).visits++;
            }

            this.mode = MiniReelService.modeDataOf(
                minireel,
                cModel.modes
            );
            this.category = MiniReelService.modeCategoryOf(
                minireel,
                cModel.modes
            );
            this.autoplay = minireel.data.autoplay;
            this.title = minireel.data.title;
            this.displayAdSource = minireel.data.displayAdSource;
            this.videoAdSource = minireel.data.videoAdSource;

            Object.defineProperties(this, {
                currentTab: {
                    configurable: true,
                    get: function() {
                        var state = c6State.current.name
                            .replace(this.baseState + '.', '');

                        return this.tabs.reduce(function(result, next) {
                            return state === next.sref ? next : result;
                        }, null);
                    }
                }
            });

            this.isAsFarAs = function(tab) {
                return this.tabs.indexOf(tab) <= this.tabs.indexOf(this.currentTab);
            };

            this.tabIsValid = function(tab) {
                switch (tab.sref) {
                case 'general':
                    return !!this.title;
                default:
                    return this.isAsFarAs(tab);
                }
            };

            this.save = function() {
                var minireel = this.model.minireel,
                    data = minireel.data;

                ['autoplay', 'title'].forEach(function(prop) {
                    data[prop] = self[prop];
                });

                data.mode = this.mode.value;

                ['displayAdSource','videoAdSource'].forEach(function(prop) {
                    if(data[prop] !== self[prop]) {
                        angular.forEach(data.deck, function(card) {
                            if(prop === 'displayAdSource') {
                                card[prop] = self[prop];
                            } else if(card.type === 'ad') {
                                card.data[prop] = self[prop];
                            }
                            data[prop] = self[prop];
                        });
                    }
                });

                (minireel.id ? $q.when(minireel) :
                    minireel.save())
                    .then(function goToEditor(minireel) {
                        c6State.goTo('editor', { minireelId: minireel.id });
                    });
            };

            this.nextTab = function() {
                var index = this.tabs.indexOf(this.currentTab);

                if(index+1 < this.tabs.length) {
                    c6State.goTo(this.baseState + '.' + this.tabs[index+1].sref);
                }
            };

            this.prevTab = function() {
                var index = this.tabs.indexOf(this.currentTab);

                if(index-1 > -1) {
                    c6State.goTo(this.baseState + '.' + this.tabs[index-1].sref);
                }
            };

            c6State.on('stateChangeSuccess', incrementTabVisits);

            $scope.$on('$destroy', function() {
                c6State.removeListener('stateChangeSuccess', incrementTabVisits);
            });

            $scope.$watch(function() { return self.category; }, function(category, prevCategory) {
                var modeTab;

                if (category === prevCategory) { return; }
                modeTab = tabBySref('mode');

                self.mode = self.category.modes[0];
                modeTab.requiredVisits = modeTab.visits + 1;
            });

            $scope.$watch(function() { return self.mode; }, function(mode, prevMode) {
                var minireel = self.model.minireel,
                    autoplayTab = tabBySref('autoplay');

                self.autoplay = mode.autoplayable && minireel.data.autoplay;

                if (mode.autoplayable !== prevMode.autoplayable) {
                    autoplayTab.requiredVisits = autoplayTab.visits + 1;
                }
            });
        }])

        .controller('NewAdsController', ['MiniReelService', 'appData',
        function                        ( MiniReelService ,  appData ) {
            this.adChoices = MiniReelService.adChoicesOf(appData);
        }]);
}());
