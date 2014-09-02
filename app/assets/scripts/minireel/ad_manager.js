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

        .controller('AdManagerController', ['$scope','c6State','cState','$q',
                                            'ConfirmDialogService', 'MiniReelService',
        function                           ( $scope , c6State , cState , $q ,
                                             ConfirmDialogService ,  MiniReelService ) {
            var self = this,
                org = $scope.PortalCtrl.model.org,
                MiniReelCtrl = $scope.MiniReelCtrl;

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

            function useMatchingAdConfigs(experiences) {
                var customExperiences = experiences.filter(function(exp) {
                        return !!exp.data.adConfig;
                    }),
                    videoTemplate = {
                        firstPlacement: equalOrUndefine(),
                        frequency: equalOrUndefine(),
                        waterfall: equalOrUndefine(),
                        skip: equalOrUndefine()
                    },
                    displayTemplate = {
                        waterfall: equalOrUndefine()
                    },
                    sharedConfig;

                function equalOrUndefine() {
                    return function(target, current, key) {
                        return target[key] === current[key] ? target[key] : void 0;
                    };
                }

                if (!customExperiences.length) {
                    return getAdConfig(org);
                }

                if (experiences.length === 1) {
                    return getAdConfig(experiences[0]);
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
                if (!config) {
                    config = getAdConfig();
                }

                config.video.firstPlacement = -1;
                config.video.frequency = 0;

                return config;
            }

            function cleanDeck(deck) {
                return deck.filter(function(card) {
                    return !card.ad;
                });
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

            this.returnState = 'MR:AdManager';
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

            this.settingsTypeOf = function(minireel) {
                return !minireel.data.adConfig && !staticAdCount(minireel) ? 'Default' : 'Custom';
            };

            this.adCountOf = function(minireel) {
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

            this.editOrgSettings = function() {
                c6State.goTo('MR:AdManager.Settings', [{
                    type: 'org',
                    settings: getAdConfig(org),
                    data: org
                }]);
            };

            this.editSettings = function(minireels) {
                c6State.goTo('MR:AdManager.Settings', [{
                    type: 'minireels',
                    settings: useMatchingAdConfigs(minireels),
                    data: minireels
                }]);
            };

            self.useDefaultSettings = function(minireels) {
                return $q.all(minireels.map(function(exp) {
                    exp.data.deck = cleanDeck(exp.data.deck);
                    exp.data.adConfig = null;
                    return exp.save();
                }));
            };

            self.removeAds = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to remove ads from these Minireels?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return $q.all(minireels.map(function(exp) {
                            exp.data.adConfig = setZeroAdConfig(exp.data.adConfig);
                            exp.data.deck = cleanDeck(exp.data.deck);
                            return exp.save();
                        }));
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
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
        }])

        .controller('AdSettingsController', ['$scope','MiniReelService','c6State','cState','$q',
        function                            ( $scope , MiniReelService , c6State , cState , $q ) {
            var self = this,
                MiniReelCtrl = $scope.MiniReelCtrl,
                PortalCtrl = $scope.PortalCtrl,
                org = PortalCtrl.model.org,
                data = MiniReelCtrl.model.data;

            function ordinalSuffixOf(i) {
                var j = i % 10,
                    k = i % 100;

                if (j === 1 && k !== 11) {
                    return i + 'st';
                }
                if (j === 2 && k !== 12) {
                    return i + 'nd';
                }
                if (j === 3 && k !== 13) {
                    return i + 'rd';
                }

                return i + 'th';
            }

            function convertNewSettings(exp, settings) {
                var config = getAdConfig(exp);

                forEach(config.video, function(val, key) {
                    config.video[key] = isDefined(settings.video[key]) ?
                        settings.video[key] :
                        val;
                });

                forEach(config.display, function(val, key) {
                    config.display[key] = isDefined(settings.display[key]) ?
                        settings.display[key] :
                        val;
                });

                return config;
            }

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

            function cleanDeck(deck) {
                return deck.filter(function(card) {
                    return !card.ad;
                });
            }

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
                if (state.cName === 'MR:AdManager.Settings' ||
                    state.cName === 'MR:AdManager') {
                    return;
                }

                tabBySref(state.cName).visits++;
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

            if (!cState.cModel) {
                c6State.goTo(cState.cParent.cName);
                return;
            }

            this.adChoices = MiniReelService.adChoicesOf(org, data);
            this.returnState = cState.cParent.cName;
            this.baseState = 'MR:AdManager.Settings.';
            this.dropDowns = {
                firstPlacement: new DropDownModel(),
                frequency: new DropDownModel(),
                skip: new DropDownModel()
            };
            this.tabs = [
                new Tab('Frequency', self.baseState + 'Frequency'),
                new Tab('Video Server', self.baseState + 'VideoServer'),
                new Tab('Display Server', self.baseState + 'DisplayServer')
            ];

            this.firstPlacementOptions = (function() {
                var num,
                    options = [];

                if (cState.cModel.type === 'org') {
                    num = 10;
                } else {
                    num = cState.cModel.data.reduce(function(prev, curr) {
                        var length = curr.data.deck.length;
                        return prev < length ? prev : length;
                    }, cState.cModel.data[0].data.deck.length);
                }

                for (num; num > 0; num--) {
                    options.unshift({
                        value: num,
                        label: 'After ' + ordinalSuffixOf(num) + ' Video'
                    });
                }

                options.unshift({
                    value: -1,
                    label: 'No ads'
                },
                {
                    value: 0,
                    label: 'Before 1st Video'
                });

                return options;
            }());

            this.frequencyOptions = (function() {
                var i = 2,
                    options = [
                        {
                            label: 'No subsequent ads',
                            value: 0
                        },
                        {
                            label: 'After every video',
                            value: 1
                        }
                    ];

                for (i; i <= 10; i++) {
                    options.push({
                        value: i,
                        label: 'After every ' + ordinalSuffixOf(i) + ' video'
                    });
                }

                return options;
            }());

            this.skipOptions = (function() {
                return [
                    {
                        label: 'No, users cannot skip ads',
                        value: false
                    },
                    {
                        label: 'Yes, after six seconds',
                        value: 6
                    },
                    {
                        label: 'Yes, skip ads at any time',
                        value: true
                    }
                ];
            }());

            this.frequency = (function() {
                return self.frequencyOptions.filter(function(option) {
                    return cState.cModel.settings.video.frequency === option.value;
                })[0];
            }());

            this.firstPlacement = (function() {
                return self.firstPlacementOptions.filter(function(option) {
                    return cState.cModel.settings.video.firstPlacement === option.value;
                })[0];
            }());

            this.skip = (function() {
                return self.skipOptions.filter(function(option) {
                    return cState.cModel.settings.video.skip === option.value;
                })[0];
            }());

            Object.defineProperties(this, {
                currentTab: {
                    configurable: true,
                    get: function() {
                        return tabBySref(c6State.current);
                    }
                }
            });

            this.isAsFarAs = function(tab) {
                return this.tabs.indexOf(tab) <= this.tabs.indexOf(this.currentTab);
            };

            this.tabIsValid = function(tab) {
                if (!tab) { return; }

                switch (tab.sref) {
                case 'MR:AdManager.Settings.Frequency':
                    return !!this.frequency && !!this.skip && !!this.firstPlacement;
                case 'MR:AdManager.Settings.VideoServer':
                    return !!cState.cModel.settings.video.waterfall;
                case 'MR:AdManager.Settings.DisplayServer':
                    return !!cState.cModel.settings.display.waterfall;
                default:
                    return this.isAsFarAs(tab);
                }
            };

            this.formIsValid = function() {
                return this.tabs.length === this.tabs.filter(function(tab) {
                    return self.tabIsValid(tab);
                }).length;
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

            this.save = function() {
                var settings = {
                    video: {
                        firstPlacement: self.firstPlacement && self.firstPlacement.value,
                        frequency: self.frequency && self.frequency.value,
                        waterfall: cState.cModel.settings.video.waterfall,
                        skip: self.skip && self.skip.value
                    },
                    display: {
                        waterfall: cState.cModel.settings.display.waterfall
                    }
                };

                if (cState.cModel.type === 'org') {
                    org.adConfig = settings;
                    org.save().then(function() {
                        c6State.goTo('MR:AdManager');
                    });
                } else {
                    $q.all(cState.cModel.data.map(function(exp) {
                        exp.data.adConfig = convertNewSettings(exp, settings);
                        exp.data.deck = cleanDeck(exp.data.deck);
                        return exp.save();
                    })).then(function() {
                        c6State.goTo('MR:AdManager');
                    });
                }
            };

            c6State.goTo(self.baseState + 'Frequency');

            c6State.on('stateChange', incrementTabVisits);

            $scope.$on('$destroy', function() {
                c6State.removeListener('stateChange', incrementTabVisits);
            });

            $scope.$watch(function() {
                return self.firstPlacement;
            }, function(firstPlacement) {
                if (firstPlacement && firstPlacement.value === -1) {
                    self.frequency = self.frequencyOptions.filter(function(opt) {
                        return opt.value === 0;
                    })[0];
                }
            });
        }]);
});
