define( ['angular','c6ui','c6_state','minireel/services'],
function( angular , c6ui , c6State  , services  ) {
    'use strict';

    var equals = angular.equals,
        forEach = angular.forEach,
        copy = angular.copy,
        isDefined = angular.isDefined;

    return angular.module('c6.app.minireel.adManager', [c6ui.name, c6State.name, services.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:AdManager', ['cinema6','c6State','scopePromise','$location',
            function                              ( cinema6 , c6State , scopePromise , $location ) {
                var query = $location.search();

                this.controller = 'AdManagerController';
                this.controllerAs = 'AdManagerCtrl';
                this.templateUrl = 'views/minireel/ad_manager.html';

                this.filter = query.filter || 'all';
                this.limit = parseInt(query.limit) || 50;
                this.page = parseInt(query.page) || 1;

                this.queryParams = {
                    filter: '=',
                    limit: '=',
                    page: '='
                };

                this.modelWithFilter = function(filter, limit, page, previous) {
                    var org = c6State.get('Portal').cModel.org,
                        scopedPromise = scopePromise(cinema6.db.findAll('experience', {
                            type: 'minireel',
                            org: org.id,
                            sort: 'lastUpdated,-1',
                            status: (filter === 'all') ? null : filter,
                            limit: limit,
                            skip: (page - 1) * limit
                        }), previous && previous.value);

                    scopedPromise.selected = (previous || null) && previous.selected;
                    scopedPromise.page = (previous || null) && previous.page;

                    scopedPromise.ensureResolution()
                        .then(function(scopedPromise) {
                            var minireels = scopedPromise.value,
                                items = minireels.meta.items;

                            scopedPromise.selected = minireels.map(function() {
                                return false;
                            });
                            scopedPromise.page = {
                                current: ((items.start - 1) / limit) + 1,
                                total: Math.ceil(items.total / limit)
                            };
                        });

                    return scopedPromise;
                };

                this.model = function() {
                    return this.modelWithFilter(this.filter, this.limit, this.page)
                        .ensureResolution();
                };
            }])

            .state('MR:AdManager.Settings', [function() {
                this.controller = 'AdSettingsController';
                this.controllerAs = 'AdSettingsCtrl';
                this.templateUrl = 'views/minireel/ad_manager/settings.html';
            }])

            .state('MR:AdManager.Settings.Frequency', [function() {
                this.templateUrl = 'views/minireel/ad_manager/settings/frequency.html';
            }])

            .state('MR:AdManager.Settings.VideoServer', [function() {
                this.templateUrl = 'views/minireel/ad_manager/settings/video_server.html';
            }])

            .state('MR:AdManager.Settings.DisplayServer', [function() {
                this.templateUrl = 'views/minireel/ad_manager/settings/display_server.html';
            }]);
        }])

        .controller('AdManagerController', ['$scope','c6State','cState', 'ConfirmDialogService', 'MiniReelService',
        function                           ( $scope , c6State , cState ,  ConfirmDialogService ,  MiniReelService ) {
            var self = this,
                org = c6State.get('Portal').cModel.org,
                MiniReelCtrl = $scope.MiniReelCtrl,
                settingsType;

            function getAdConfig(object) {
                var systemDefault = {
                    video: {
                        firstPlacement: 2,
                        frequency: 0,
                        waterfall: 'cinema6',
                        skip: 6
                    },
                    display: {
                        waterfall: 'cinema6'
                    }
                };

                if (object && object.adConfig) {
                    return copy(object.adConfig);
                }

                if (object && object.data) {
                    if (object.data.adConfig) {
                        return copy(object.data.adConfig);
                    } else {
                        return copy(org.adConfig || systemDefault);
                    }
                }

                return systemDefault;
            }

            function staticAdCount(minireel) {
                return minireel.data.deck.filter(function(card) {
                    return card.ad;
                }).length;
            }

            function findExperienceById(id) {
                return cState.cModel.filter(function(exp) {
                    return exp.id === id;
                })[0];
            }

            function findMatchingAdConfigs(experiences) {
                var customExperiences = experiences.filter(function(exp) {
                        return !!exp.data.adConfig;
                    }),
                    videoTemplate = {
                        firstPlacement: _copy(),
                        frequency: _copy(),
                        waterfall: _copy(),
                        skip: _copy()
                    },
                    displayTemplate = {
                        waterfall: _copy()
                    },
                    sharedConfig;

                function _copy() {
                    return function(target, current, key) {
                        return target[key] === current[key] ? target[key] : void 0;
                    };
                }

                if (!customExperiences.length) {
                    return getAdConfig(org);
                }

                sharedConfig = copy(customExperiences[0].data.adConfig);

                experiences.forEach(function(exp) {
                    var config = getAdConfig(exp);

                    forEach(videoTemplate, function(fn, key) {
                        sharedConfig.video[key] = fn(sharedConfig.video, config.video, key);
                    });

                    forEach(displayTemplate, function(fn, key) {
                        sharedConfig.display[key] = fn(sharedConfig.display, config.display, key);
                    });
                });

                return sharedConfig;
            }

            function setZeroAdConfig(config) {
                if (config) {
                    config.video.firstPlacement = -1;
                } else {
                    config = getAdConfig();
                    config.video.firstPlacement = -1;
                }

                return config;
            }

            function cleanDeck(deck) {
                return deck.filter(function(card) {
                    return !card.ad;
                });
            }

            function removeAds(minireels) {
                minireels.forEach(function(exp) {
                    exp.data.adConfig = setZeroAdConfig(exp.data.adConfig);
                    exp.data.deck = cleanDeck(exp.data.deck);

                    console.log(exp);
                    // exp.save();
                });

                // console.log(self.selectedExperiences);
            }

            function convertNewSettings(exp, settings) {
                var videoTemplate = {
                    firstPlacement: _copy(),
                    frequency: _copy(),
                    waterfall: _copy(),
                    skip: _copy()
                },
                displayTemplate = {
                    waterfall: _copy()
                },
                config = getAdConfig(exp);

                function _copy() {
                    return function(data, key) {
                        return data[key];
                    };
                }

                forEach(videoTemplate, function(fn, key) {
                    if (isDefined(settings.video[key])) {
                        config.video[key] = fn(settings.video, key);
                    }
                });

                forEach(displayTemplate, function(fn, key) {
                    if (isDefined(settings.display[key])) {
                        config.display[key] = fn(settings.display, key);
                    }
                });

                return config;
            }

            function isSame(prop, obj1, obj2) {
                return obj1[prop] === obj2[prop];
            }

            function value(val) {
                return function() {
                    return val;
                };
            }

            function juxtapose() {
                var args = Array.prototype.slice.call(arguments),
                    longestArray = args.reduce(function(result, array) {
                        return array.length > result.length ? array : result;
                    });

                return longestArray.map(function(value, index) {
                    return args.map(function(array) {
                        return array[index];
                    });
                });
            }

            function limitArgs(max, fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments, 0, max);

                    return fn.apply(null, args);
                };
            }

            function refetchMiniReels(fromStart) {
                self.model = cState.modelWithFilter(
                    self.filter,
                    self.limit,
                    fromStart ? 1 : self.page,
                    self.model
                );
            }

            function DropDownModel() {
                this.shown = false;
            }
            DropDownModel.prototype = {
                show: function() {
                    this.shown = true;
                },
                hide: function() {
                    this.shown = false;
                },
                toggle: function() {
                    this.shown = !this.shown;
                }
            };

            this.filter = cState.filter;
            this.limit = cState.limit;
            this.page = cState.page;
            this.dropDowns = {
                select: new DropDownModel()
            };
            this.limits = [20, 50, 100];

            Object.defineProperties(this, {
                allAreSelected: {
                    get: function() {
                        return this.areAllSelected();
                    },
                    set: function(bool) {
                        return bool ? this.selectAll() : this.selectNone();
                    }
                }
            });

            this.selectAll = function() {
                this.model.selected = this.model.value
                    .map(value(true));
            };

            this.selectNone = function() {
                this.model.selected = this.model.value
                    .map(value(false));
            };

            this.selectAllWithStatus = function(status) {
                this.model.selected = this.model.value
                    .map(function(minireel) {
                        return minireel.status === status;
                    });
            };

            this.getSelected = function(status) {
                return juxtapose(this.model.selected, this.model.value)
                    .filter(function(pair) {
                        return pair[0] && (status ? pair[1].status === status : true);
                    })
                    .map(function(pair) {
                        return pair[1];
                    });
            };

            this.areAllSelected = function(status) {
                return juxtapose(this.model.selected, this.model.value)
                    .filter(function(pair) {
                        return status ? (pair[1].status === status) : true;
                    })
                    .map(function(pair) {
                        return pair[0];
                    })
                    .indexOf(false) < 0;
            };

            this.previewUrlOf = function(minireel) {
                return MiniReelService.previewUrlOf(minireel, '/#/preview/minireel');
            };

            this.modeNameFor = function(minireel) {
                return MiniReelService.modeDataOf(
                    minireel,
                    MiniReelCtrl.model.data.modes
                ).name;
            };

            $scope.$watchCollection(
                function() {
                    return [
                        self.page,
                        self.limit,
                        self.filter
                    ];
                },
                function(props, prevProps) {
                    var samePage = isSame(0, props, prevProps);

                    if (equals(props, prevProps)) { return; }

                    if (self.page !== 1 && samePage) {
                        /* jshint boss:true */
                        return self.page = 1;
                        /* jshint boss:false */
                    }

                    return refetchMiniReels(samePage);
                }
            );

            $scope.$on('$destroy', function() {
                cState.filter = self.filter;
            });

            // when ad settings need to be set we store the type of settings
            // either: org, minireel, minireels.
            // We send the adConfig to the AdSettingsCtrl for UI binding
            // and at the save method will be on the AdManagerCtrl so it can tell
            // what excatly it's updating. The AdSettings views don't care what
            // they're updating, they just show the config that's passed

            // DROP DOWNS:
            // bulk edit dropdown: all, none, published, private
            // results count dropdown: 20, 50 (default), 100

            // MINIREEL LIST:
            // sorted by creation date or published date, with published date
            // overiding the creation date within the same minireel

            // self.experienceMap = {};
            // self.isSelected = false;
            self.returnState = 'MR:AdManager';

            // Object.defineProperty(self, 'selectedExperiences', {
            //     get: function() {
            //         var experiences = [];

            //         forEach(self.experienceMap, function(experience, id) {
            //             if (experience.selected) {
            //                 experiences.push(findExperienceById(id));
            //             }
            //         });

            //         return experiences;
            //     }
            // });

            self.settingsTypeOf = function(minireel) {
                return !minireel.data.adConfig && !staticAdCount(minireel) ? 'Default' : 'Custom';
            };

            self.adCountOf = function(minireel) {
                var totalCards = minireel.data.deck.length,
                    adConfig = getAdConfig(minireel),
                    adCount = staticAdCount(minireel);

                function calculate(config, total) {
                    var noAds = config.firstPlacement < 0,
                        noFreq = config.frequency === 0;

                    return noAds ? 0 :
                        (noFreq ? 1 :
                        Math.floor(((total - config.firstPlacement - 1) / config.frequency) + 1));
                }

                if (adCount) {
                    return adCount;
                }

                return calculate(adConfig.video, totalCards);
            };

            self.editOrgSettings = function() {
                var settings = getAdConfig(org);
                settingsType = 'org';
                c6State.goTo('MR:AdManager.Settings', [settings]);
            }

            self.editSettings = function(minireels) {
                var settings;

                if (minireels.length > 1) {
                    settings = findMatchingAdConfigs(minireels);
                }

                if (minireels.length === 1) {
                    settings = getAdConfig(minireels[0]);
                }

                c6State.goTo('MR:AdManager.Settings', [settings]);
            };

            self.saveSettings = function(settings) {
                console.log('settings! ',settings);
                // should users be able to save just some settings?
                // If so I'll need a helper function to copy over new settings
                // and default any missing settings

                if (settingsType === 'org') {
                    org.adConfig = settings;
                    // org.save();
                } else {
                    self.getSelected().forEach(function(exp) {
                        exp.data.adConfig = convertNewSettings(exp, settings);
                        exp.data.deck = cleanDeck(exp.data.deck);

                        console.log(exp);
                        // exp.save();
                    });
                }

                c6State.goTo('MR:AdManager');
            };

            self.useDefaultSettings = function(minireels) {
                minireels.forEach(function(exp) {
                    exp.data.deck = cleanDeck(exp.data.deck);
                    delete exp.data.adConfig;

                    console.log(exp);
                    // exp.save();
                });

                // console.log(self.selectedExperiences);
            };

            self.removeAds = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to remove ads from these Minireels?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        removeAds(minireels);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            // $scope.$watch(function() { return cState.cModel; }, function(experiences) {
            //     if (!experiences) { return; }

            //     experiences.forEach(function(exp) {
            //         if (!self.experienceMap[exp.id]) {
            //             self.experienceMap[exp.id] = {
            //                 selected: false
            //             };
            //         }
            //     });
            // });
        }])

        .controller('AdSettingsController', ['$scope','MiniReelService','c6State','cState',
        function                            ( $scope , MiniReelService , c6State , cState ) {
            var self = this,
                MiniReelCtrl = $scope.MiniReelCtrl,
                PortalCtrl = $scope.PortalCtrl,
                org = PortalCtrl.model.org,
                data = MiniReelCtrl.model.data;

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

            function DropDownModel() {
                this.shown = false;
            }
            DropDownModel.prototype = {
                show: function() {
                    this.shown = true;
                },
                hide: function() {
                    this.shown = false;
                },
                toggle: function() {
                    this.shown = !this.shown;
                }
            };

            this.dropDowns = {
                firstPlacement: new DropDownModel(),
                frequency: new DropDownModel(),
                skip: new DropDownModel()
            };

            if (!cState.cModel) {
                c6State.goTo(cState.cParent.cName);
                // return;
            }

            self.adChoices = MiniReelService.adChoicesOf(org, data);
            self.returnState = cState.cParent.cName;
            self.baseState = 'MR:AdManager.Settings.';

            self.firstPlacementData = [
                {
                    label:'No ads',
                    value: -1
                },
                {
                    label: 'Before 1st video',
                    value: 0
                },
                {
                    label: 'After 1st video',
                    value: 1
                },
                {
                    label: 'After 2nd video',
                    value: 2
                },
                {
                    label: 'After 3rd video',
                    value: 3
                },
                {
                    label: 'After 4th video',
                    value: 4
                },
                {
                    label: 'After 5th video',
                    value: 5
                },
                {
                    label: 'After 6th video',
                    value: 6
                }
            ];

            self.frequencyData = [
                {
                    label: 'No subsequent ads',
                    value: 0
                },
                {
                    label: 'After every video',
                    value: 1
                },
                {
                    label: 'After every 2nd video',
                    value: 2
                },
                {
                    label: 'After every 3rd video',
                    value: 3
                },
                {
                    label: 'After every 4th video',
                    value: 4
                },
                {
                    label: 'After every 5th video',
                    value: 5
                },
                {
                    label: 'After every 6th video',
                    value: 6
                },
                {
                    label: 'After every 7th video',
                    value: 7
                },
                {
                    label: 'After every 8th video',
                    value: 8
                },
                {
                    label: 'After every 9th video',
                    value: 9
                }
            ];

            self.tabs = [
                new Tab('Frequency', self.baseState + 'Frequency'),
                new Tab('Video Server', self.baseState + 'VideoServer'),
                new Tab('Display Server', self.baseState + 'DisplayServer')
            ];

            self.frequency = (function() {
                return self.frequencyData.filter(function(option) {
                    return cState.cModel.video.frequency === option.value;
                })[0];
            }());

            self.firstPlacement = (function() {
                return self.firstPlacementData.filter(function(option) {
                    return cState.cModel.video.firstPlacement === option.value;
                })[0];
            }());

            Object.defineProperty(self, 'settings', {
                get: function() {
                    return {
                        video: {
                            firstPlacement: self.firstPlacement && self.firstPlacement.value,
                            frequency: self.frequency && self.frequency.value,
                            waterfall: cState.cModel.video.waterfall,
                            skip: cState.cModel.video.skip
                        },
                        display: {
                            waterfall: cState.cModel.display.waterfall
                        }
                    };
                }
            });

            // go to first/default tab
            c6State.goTo(self.baseState + 'Frequency');
        }]);
});
