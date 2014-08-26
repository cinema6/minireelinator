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
            c6StateProvider.state('MR:AdManager', ['cinema6','c6State',
            function                              ( cinema6 , c6State ) {
                this.controller = 'AdManagerController';
                this.controllerAs = 'AdManagerCtrl';
                this.templateUrl = 'views/minireel/ad_manager.html';

                this.model = function() {
                    var org = c6State.get('Portal').cModel.org;

                    return cinema6.db.findAll('experience', {
                        type: 'minireel',
                        org: org.id,
                        sort: 'lastUpdated,-1'
                    });
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

        .controller('AdManagerController', ['$scope','c6State','cState', 'ConfirmDialogService',
        function                           ( $scope , c6State , cState ,  ConfirmDialogService ) {
            var self = this,
                org = c6State.get('Portal').cModel.org,
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

            function removeAds() {
                self.selectedExperiences.forEach(function(exp) {
                    exp.data.adConfig = setZeroAdConfig(exp.data.adConfig);
                    exp.data.deck = cleanDeck(exp.data.deck);
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

            self.experienceMap = {};
            self.isSelected = false;
            self.returnState = 'MR:AdManager';

            Object.defineProperty(self, 'selectedExperiences', {
                get: function() {
                    var experiences = [];

                    forEach(self.experienceMap, function(experience, id) {
                        if (experience.selected) {
                            experiences.push(findExperienceById(id));
                        }
                    });

                    return experiences;
                }
            });

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

            self.editSettings = function(type, minireel) {
                var settings;

                settingsType = type;

                switch (type) {
                case 'org':
                    settings = getAdConfig(org);
                    break;
                case 'minireel':
                    self.experienceMap[minireel.id].selected = true;
                    settings = getAdConfig(minireel);
                    break;
                case 'minireels':
                    settings = findMatchingAdConfigs(self.selectedExperiences);
                    break;
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
                    self.selectedExperiences.forEach(function(exp) {
                        exp.data.adConfig = convertNewSettings(exp, settings);
                        exp.data.deck = cleanDeck(exp.data.deck);
                        // exp.save();
                    });
                }

                console.log(self.selectedExperiences);

                c6State.goTo('MR:AdManager');
            };

            self.useDefaultSettings = function() {
                self.selectedExperiences.forEach(function(exp) {
                    exp.data.deck = cleanDeck(exp.data.deck);
                    delete exp.data.adConfig;
                    // exp.save();
                });

                // console.log(self.selectedExperiences);
            };

            self.removeAds = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to remove ads from these Minireels?',
                    affirm: 'Yes',
                    cancel: 'No',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        removeAds();
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            $scope.$watch(function() { return cState.cModel; }, function(experiences) {
                if (!experiences) { return; }

                experiences.forEach(function(exp) {
                    if (!self.experienceMap[exp.id]) {
                        self.experienceMap[exp.id] = {
                            selected: false
                        };
                    }
                });
            });
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
