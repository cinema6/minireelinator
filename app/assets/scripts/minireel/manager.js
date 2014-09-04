define( ['angular','c6ui','c6_state','minireel/services','minireel/mixins/MiniReelListController'],
function( angular , c6ui , c6State  , services          , MiniReelListController                 ) {
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
            c6StateProvider.state('MR:Manager', ['cinema6','c6State','scopePromise','$location',
            function                            ( cinema6 , c6State , scopePromise , $location ) {
                var query = $location.search();

                this.controller = 'ManagerController';
                this.controllerAs = 'ManagerCtrl';
                this.templateUrl = 'views/minireel/manager.html';

                this.filter = query.filter || 'all';
                this.limit = parseInt(query.limit) || 50;
                this.page = parseInt(query.page) || 1;

                this.queryParams = {
                    filter: '=',
                    limit: '=',
                    page: '='
                };

                this.model = function() {
                    return c6State.get('MiniReel')
                        .getMiniReelList(this.filter, this.limit, this.page)
                        .ensureResolution();
                };
            }]);
        }])

        .controller('ManagerController', ['$scope','c6State','MiniReelService','cState',
                                          'ConfirmDialogService','EditorService','$q','$injector',
        function                         ( $scope , c6State , MiniReelService , cState ,
                                           ConfirmDialogService , EditorService , $q , $injector ) {
            var self = this;

            function limitArgs(max, fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments, 0, max);

                    return fn.apply(null, args);
                };
            }

            // Inherit from MiniReelListController mixin.
            $injector.invoke(MiniReelListController, this, {
                $scope: $scope,
                cState: cState
            });

            this.edit = function(minireel) {
                return c6State.goTo('MR:Editor', [EditorService.open(minireel)], {});
            };

            this.copy = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to copy ' + minireels.length + ' MiniReel(s)?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return $q.all(minireels.map(function(minireel) {
                            return MiniReelService.create(minireel)
                                .then(function save(minireel) {
                                    return minireel.save();
                                });
                        })).then(limitArgs(0, self.refetchMiniReels));
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.makePublic = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make ' +
                        minireels.length + ' MiniReel(s) public?',
                    affirm: 'Publish',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return $q.all(minireels.map(function(minireel) {
                            return MiniReelService.publish(minireel);
                        }));
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.makePrivate = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make ' +
                        minireels.length + ' MiniReel(s) private?',
                    affirm: 'Make Private',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return $q.all(minireels.map(function(minireel) {
                            return MiniReelService.unpublish(minireel);
                        }));
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.remove = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete ' + minireels.length + ' MiniReel(s)?',
                    affirm: 'Delete',
                    cancel: 'Keep',
                    onCancel: function() {
                        ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return $q.all(minireels.map(function(minireel) {
                            return MiniReelService.erase(minireel);
                        })).then(limitArgs(0, self.refetchMiniReels));
                    }
                });
            };
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
                    new Tab('Continuous Play', this.baseState + 'Autoplay')
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
