define( ['angular','c6ui','c6_state','minireel/services','minireel/mixins/MiniReelListController'],
function( angular , c6ui , c6State  , services          , MiniReelListController                 ) {
    'use strict';

    var forEach = angular.forEach,
        copy = angular.copy,
        isDefined = angular.isDefined,
        equals = angular.equals;

    return angular.module('c6.app.minireel.adManager', [c6ui.name, c6State.name, services.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:AdManager.Embed', ['cinema6',
            function                                    ( cinema6 ) {
                this.controller = 'GenericController';
                this.controllerAs = 'AdManagerEmbedCtrl';
                this.templateUrl = 'views/minireel/ad_manager/embed.html';

                this.model = function(params) {
                    return cinema6.db.find('experience', params.minireelId);
                };
            }]);
        }])

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

                this.title = function() {
                    return 'Cinema6 Ad Manager';
                };
                this.model = function() {
                    return this.cParent.getMiniReelList(this.filter, this.limit, this.page)
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

        .controller('AdManagerController', ['$scope','c6State','$q','ConfirmDialogService',
                                            'cState','$injector',
        function                           ( $scope , c6State , $q , ConfirmDialogService ,
                                             cState , $injector ) {
            var self = this,
                org = $scope.PortalCtrl.model.org,
                permissions = $scope.PortalCtrl.model.permissions;

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

            // Inherit from MiniReelListController mixin.
            $injector.invoke(MiniReelListController, this, {
                $scope: $scope,
                cState: cState
            });

            this.returnState = 'MR:AdManager';
            this.canEditDefaults = !!permissions.orgs.editAdConfig;
            this.canEditMiniReel = !!permissions.experiences.editAdConfig;

            this.settingsTypeOf = function(minireel) {
                var config = getAdConfig(minireel),
                    noAds = config.video.firstPlacement === -1 && config.video.frequency === 0;

                return !minireel.data.adConfig && !staticAdCount(minireel) ?
                    'Default' :
                    (noAds ? 'No Ads' : 'Custom');
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

            this.editOrgSettings = function(readOnly) {
                c6State.goTo('MR:AdManager.Settings', [{
                    readOnly: !!readOnly,
                    type: 'org',
                    settings: getAdConfig(org),
                    data: org
                }]);
            };

            this.editSettings = function(minireels, readOnly) {
                c6State.goTo('MR:AdManager.Settings', [{
                    readOnly: !!readOnly,
                    type: 'minireels',
                    settings: useMatchingAdConfigs(minireels),
                    data: minireels
                }]);
            };

            self.useDefaultSettings = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to overwrite existing ad ' +
                        'settings with the default ad settings?',
                    affirm: 'Yes, use default settings',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        return $q.all(minireels.map(function(exp) {
                            exp.data.deck = cleanDeck(exp.data.deck);
                            exp.data.adConfig = null;
                            return exp.save();
                        }));
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            self.removeAds = function(minireels) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to remove ads from these MiniReels?',
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
        }])

        .controller('AdSettingsController', ['$scope','MiniReelService','c6State','cState','$q',
        function                            ( $scope , MiniReelService , c6State , cState , $q ) {
            var self = this,
                MiniReelCtrl = $scope.MiniReelCtrl,
                PortalCtrl = $scope.PortalCtrl,
                org = PortalCtrl.model.org,
                data = MiniReelCtrl.model.data;

            function makeArray(length) {
                var array = [];

                while (length--) {
                    array[length] = undefined;
                }

                return array;
            }

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

            if (!cState.cModel) {
                c6State.goTo(cState.cParent.cName);
                return;
            }

            this.adChoices = MiniReelService.adChoicesOf(org, data);
            this.returnState = cState.cParent.cName;
            this.baseState = 'MR:AdManager.Settings.';
            this.tabs = [
                new Tab('Frequency', self.baseState + 'Frequency'),
                new Tab('Video Server', self.baseState + 'VideoServer'),
                new Tab('Display Server', self.baseState + 'DisplayServer')
            ];

            this.frequency = cState.cModel.settings.video.frequency;
            this.firstPlacement = cState.cModel.settings.video.firstPlacement;
            this.skip = cState.cModel.settings.video.skip;

            this.firstPlacementOptions = (function() {
                var decks = cState.cModel.type === 'org' ?
                    [makeArray(10)] : cState.cModel.data.map(function(minireel) {
                        return minireel.data.deck;
                    });

                return [
                    ['No ads', -1],
                    ['Before 1st Video', 0]
                ].concat(decks.reduce(function(smallestDeck, deck) {
                    return (smallestDeck.length > deck.length) ? deck : smallestDeck;
                }).map(function(card, index) {
                    var num = index + 1;

                    return ['After ' + ordinalSuffixOf(num) + ' Video', num];
                })).concat((self.firstPlacement || 0) > 0 ? [
                    // Make sure whatever the default is is an option
                    [
                        'After ' + ordinalSuffixOf(self.firstPlacement) + ' Video',
                        self.firstPlacement
                    ]
                ] : []).reduce(function(options, data) {
                    options[data[0]] = data[1];
                    return options;
                }, {});
            }());

            this.frequencyOptions = makeArray(11).map(function(value, index) {
                switch (index) {
                case 0:
                    return ['No subsequent ads', index];
                case 1:
                    return ['After every video', index];
                default:
                    return ['After every ' + ordinalSuffixOf(index) + ' video', index];
                }
            }).reduce(function(options, data) {
                options[data[0]] = data[1];
                return options;
            }, {});

            this.skipOptions = {
                'No, users cannot skip ads': false,
                'Yes, after six seconds': 6,
                'Yes, skip ads at any time': true
            };

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
                    return [this.frequency, this.firstPlacement, this.skip]
                        .every(function(value) {
                            return isDefined(value);
                        });
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
                        firstPlacement: self.firstPlacement,
                        frequency: self.frequency,
                        waterfall: cState.cModel.settings.video.waterfall,
                        skip: self.skip
                    },
                    display: {
                        waterfall: cState.cModel.settings.display.waterfall
                    }
                };

                if (equals(settings, getAdConfig(org))) {
                    return c6State.goTo('MR:AdManager');
                }

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
                if (firstPlacement === -1) {
                    self.frequency = 0;
                }
            });
        }]);
});
