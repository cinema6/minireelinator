define( ['angular','c6ui','c6_state','minireel/services'],
function( angular , c6ui , c6State  , services  ) {
    'use strict';

    var equals = angular.equals,
        forEach = angular.forEach,
        copy = angular.copy;

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
                this.controller = 'AdSettingsController';
                this.controllerAs = 'AdSettingsCtrl';
                this.templateUrl = 'views/minireel/ad_manager/settings/frequency.html';
            }])

            .state('MR:AdManager.Settings.VideoServer', [function() {
                this.controller = 'AdSettingsController';
                this.controllerAs = 'AdSettingsCtrl';
                this.templateUrl = 'views/minireel/ad_manager/settings/video_server.html';
            }])

            .state('MR:AdManager.Settings.DisplayServer', [function() {
                this.controller = 'AdSettingsController';
                this.controllerAs = 'AdSettingsCtrl';
                this.templateUrl = 'views/minireel/ad_manager/settings/display_server.html';
            }]);
        }])

        .controller('AdManagerController', ['$scope','c6State','cState', 'ConfirmDialogService',
        function                           ( $scope , c6State , cState ,  ConfirmDialogService ) {
            var self = this,
                org = c6State.get('Portal').cModel.org,
                settingsType, experiencesToSave;

            function getAdConfig(object) {
                if (object) {
                    if (object.adConfig) {
                        return copy(object.adConfig); // Org
                    }

                    if (object.data && object.data.adConfig) {
                        return copy(object.data.adConfig); // Experience
                    }
                }

                return {
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

            function getSelectedExperiences() {
                var experiences = [];

                forEach(self.experienceMap, function(experience, id) {
                    if (experience.selected) {
                        experiences.push(findExperienceById(id));
                    }
                });

                return experiences;
            }

            function findMatchingAdConfigs(experiences) {
                var sharedConfig,
                    customExperiences = experiences.filter(function(exp) {
                        return !!exp.data.adConfig;
                    });

                function copySharedProps(target, orig) {
                    var config = getAdConfig(orig);

                    function copyOrNull(type, val, key) {
                        return config[type][key] === val ? val : null;
                    }

                    forEach(target.video, function(val, key) {
                        target.video[key] = copyOrNull('video', val, key);
                    });

                    forEach(target.display, function(val, key) {
                        target.display[key] = copyOrNull('display', val, key);
                    });

                    return target;
                }

                if (!customExperiences.length) {
                    return getAdConfig(org);
                }

                sharedConfig = copy(customExperiences[0].data.adConfig);

                experiences.forEach(function(exp) {
                    sharedConfig = copySharedProps(sharedConfig, exp);
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

            function deleteStaticAds(deck) {
                return deck.filter(function(card) {
                    return !card.ad;
                });
            }

            function removeAds() {
                var experiences = getSelectedExperiences();

                experiences.forEach(function(exp) {
                    if (staticAdCount(exp)) {
                        exp.data.deck = deleteStaticAds(exp.data.deck);
                    }

                    exp.data.adConfig = setZeroAdConfig(exp.data.adConfig);

                    // exp.save();
                });

                console.log(experiences);
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

            self.selectChange = function() {
                self.isSelected = !!getSelectedExperiences().length;
            };

            self.settingsTypeOf = function(minireel) {
                var adConfig = getAdConfig(minireel),
                    isDefault = equals(adConfig, getAdConfig(org));

                return isDefault && !staticAdCount(minireel) ? 'Default' : 'Custom';
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
                    experiencesToSave = [minireel];
                    settings = getAdConfig(minireel);
                    break;
                case 'minireels':
                    experiencesToSave = getSelectedExperiences();
                    settings = findMatchingAdConfigs(experiencesToSave);
                    break;
                }

                c6State.goTo('MR:AdManager.Settings.DisplayServer', [settings]);
            };

            self.saveSettings = function(settings) {
                if (settingsType === 'org') {
                    org.adConfig = settings;
                    // org.save();
                } else {
                    experiencesToSave.forEach(function(exp) {
                        exp.data.adConfig = settings;
                        // exp.save();
                    });
                }

                c6State.goTo('MR:AdManager');
            };

            self.useDefaultSettings = function() {
                var experiences = getSelectedExperiences();

                experiences.forEach(function(exp) {
                    if (staticAdCount(exp)) {
                        exp.data.deck = deleteStaticAds(exp.data.deck);
                    }

                    if (exp.data.adConfig) {
                        delete exp.data.adConfig;
                    }

                    // exp.save();
                });

                console.log(experiences);
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

        .controller('AdSettingsController', ['$scope','MiniReelService','cState',
        function                            ( $scope , MiniReelService , cState ) {
            var self = this,
                MiniReelCtrl = $scope.MiniReelCtrl,
                PortalCtrl = $scope.PortalCtrl,
                org = PortalCtrl.model.org,
                data = MiniReelCtrl.model.data;

            self.adChoices = MiniReelService.adChoicesOf(org, data);
            self.returnState = cState.cParent.cName;
        }]);
});
