define( ['angular','c6ui','c6_state','minireel/services'],
function( angular , c6ui , c6State  , services          ) {
    'use strict';

    return angular.module('c6.app.minireel.manager', [c6ui.name, c6State.name, services.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Manager.Embed', ['cinema6',
            function                                  ( cinema6 ) {
                this.controller = 'GenericController';
                this.controllerAs = 'ManagerEmbedCtrl';
                this.templateUrl = 'views/minireel/manager/embed.html';

                this.model = function(params) {
                    return cinema6.db.find('experience', params.minireelId);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Manager', ['cinema6','c6State','scopePromise',
            function                            ( cinema6 , c6State , scopePromise ) {
                this.controller = 'ManagerController';
                this.controllerAs = 'ManagerCtrl';
                this.templateUrl = 'views/minireel/manager.html';

                this.filter = 'all';

                this.queryParams = {
                    filter: '='
                };

                this.modelWithFilter = function(filter) {
                    var org = c6State.get('Portal').cModel.org;

                    return scopePromise(cinema6.db.findAll('experience', {
                        type: 'minireel',
                        org: org.id,
                        sort: 'lastUpdated,-1',
                        status: (filter === 'all') ? null : filter
                    }));
                };

                this.model = function() {
                    return this.modelWithFilter(this.filter);
                };
            }]);
        }])

        .controller('ManagerController', ['$scope','c6State','MiniReelService','cState',
                                          'ConfirmDialogService','EditorService',
        function                         ( $scope , c6State , MiniReelService , cState ,
                                           ConfirmDialogService , EditorService ) {
            var self = this,
                MiniReelCtrl = $scope.MiniReelCtrl;

            this.filter = cState.filter;

            this.edit = function(minireel) {
                return c6State.goTo('MR:Editor', [EditorService.open(minireel)], {});
            };

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
                                c6State.goTo('MR:Editor', [EditorService.open(minireel)]);
                                c6State.goTo('MR:Settings.Mode');
                            });
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
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
                return MiniReelService.modeDataOf(
                    minireel,
                    MiniReelCtrl.model.data.modes
                ).name;
            };

            this.determineInclusionWithFilter = function(minireel) {
                return self.filter === 'all' || self.filter === minireel.status;
            };

            $scope.$on('$destroy', function() {
                cState.filter = self.filter;
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider
                .state('MR:New', ['MiniReelService',
                function         ( MiniReelService ) {
                    this.controller = 'NewController';
                    this.controllerAs = 'NewCtrl';
                    this.templateUrl = 'views/minireel/manager/new.html';

                    this.model = function() {
                        return MiniReelService.create();
                    };
                }])

                .state('MR:New.General', [function() {
                    this.templateUrl = 'views/minireel/manager/new/general.html';
                }])

                .state('MR:New.Category', [function() {
                    this.templateUrl = 'views/minireel/manager/new/category.html';
                }])

                .state('MR:New.Mode', [function() {
                    this.templateUrl = 'views/minireel/manager/new/mode.html';
                }])

                .state('MR:New.Autoplay', [function() {
                    this.templateUrl = 'views/minireel/manager/new/autoplay.html';
                }]);
        }])

        .controller('NewController', ['$scope','MiniReelService','c6State','$q','cState',
                                      'EditorService',
        function                     ( $scope , MiniReelService , c6State , $q , cState,
                                       EditorService ) {
            var self = this,
                PortalCtrl = $scope.PortalCtrl,
                MiniReelCtrl = $scope.MiniReelCtrl,
                stateName = cState.cName,
                user = PortalCtrl.model,
                modes = MiniReelCtrl.model.data.modes;

            function Tab(name, sref, required) {
                this.name = name;
                this.sref = sref;
                this.visits = 0;
                this.requiredVisits = 0;
                this.required = !!required;
            }

            function tabBySref(sref) {
                return self.tabs.reduce(function(result, next) {
                    return next.sref === sref ? next : result;
                }, null);
            }

            function incrementTabVisits(state) {
                tabBySref(state.cName).visits++;
            }

            this.modes = modes.reduce(function(array, mode) {
                return array.concat(mode.modes.filter(function(mode) {
                    return !mode.deprecated;
                }));
            }, []);
            this.returnState = cState.cParent.cName;
            this.baseState = (function() {
                switch (stateName) {
                case 'MR:New':
                    return 'MR:New.';
                case 'MR:Editor.Settings':
                    return 'MR:Settings.';
                }
            }());
            this.tabs = user.type === 'ContentProvider' ?
                [] :
                [
                    new Tab('MiniReel Type', this.baseState + 'Mode'),
                    new Tab('Autoplay', this.baseState + 'Autoplay')
                ];
            if (this.baseState === 'MR:New.') {
                this.tabs.unshift(new Tab('Title Settings', 'MR:New.General', true));

                Object.defineProperties(this.tabs[0], {
                    requiredVisits: {
                        get: function() {
                            return self.title ?
                                this.visits :
                                this.visits + 1;
                        }
                    }
                });
            }
            Object.defineProperties(this, {
                currentTab: {
                    configurable: true,
                    get: function() {
                        return tabBySref(c6State.current);
                    }
                }
            });

            this.initWithModel = function(minireel) {
                this.model = minireel;
                this.mode = MiniReelService.modeDataOf(minireel, modes);
                this.autoplay = minireel.data.autoplay;
                this.title = minireel.data.title;
            };

            this.isAsFarAs = function(tab) {
                return this.tabs.indexOf(tab) <= this.tabs.indexOf(this.currentTab);
            };

            this.tabIsValid = function(tab) {
                switch (tab.sref) {
                case 'MR:New.General':
                    return !!this.title;
                default:
                    return this.isAsFarAs(tab);
                }
            };

            this.save = function() {
                var minireel = this.model,
                    data = minireel.data;

                ['autoplay', 'title'].forEach(function(prop) {
                    data[prop] = self[prop];
                });

                data.mode = this.mode.value;

                (minireel.id ? $q.when(minireel) :
                    minireel.save())
                    .then(function goToEditor(minireel) {
                        c6State.goTo(
                            'MR:Editor',
                            (self.returnState === 'MR:Editor') ?
                                null : [EditorService.open(minireel)]
                        );
                    });
            };

            this.nextTab = function() {
                var index = this.tabs.indexOf(this.currentTab);

                if (index+1 < this.tabs.length) {
                    c6State.goTo(this.tabs[index+1].sref);
                }
            };

            this.prevTab = function() {
                var index = this.tabs.indexOf(this.currentTab);

                if (index-1 > -1) {
                    c6State.goTo(this.tabs[index-1].sref);
                }
            };

            if (this.tabs.length === 0) {
                c6State.goTo(cState.cParent.cName);
            }

            c6State.on('stateChange', incrementTabVisits);

            $scope.$on('$destroy', function() {
                c6State.removeListener('stateChange', incrementTabVisits);
            });

            $scope.$watch(function() { return self.category; }, function(category, prevCategory) {
                var modeTab;

                if (category === prevCategory) { return; }
                modeTab = tabBySref(self.baseState + 'Mode');

                self.mode = self.category.modes[0];
                modeTab.requiredVisits = modeTab.visits + 1;
            });

            $scope.$watch(function() { return self.mode; }, function(mode, prevMode) {
                var minireel = self.model,
                    autoplayTab = tabBySref(self.baseState + 'Autoplay');
                    // adsTab = tabBySref('ads');

                self.autoplay = mode.autoplayable && minireel.data.autoplay;

                if (mode.autoplayable !== prevMode.autoplayable) {
                    autoplayTab.requiredVisits = autoplayTab.visits + 1;
                }
            });
        }]);
});
