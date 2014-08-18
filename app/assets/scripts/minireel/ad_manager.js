define( ['angular','c6ui','c6_state','minireel/services'],
function( angular , c6ui , c6State  , services  ) {
    'use strict';

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

        .controller('AdManagerController', ['$scope','c6State','MiniReelService','cState',
                                                'ConfirmDialogService','EditorService',
        function                          ( $scope , c6State , MiniReelService , cState ,
                                             ConfirmDialogService , EditorService ) {
            var self = this,
                org = c6State.get('Portal').cModel.org,
                settingsType;

            // when ad settings need to be set we store the type of settings
            // either: orgDefaults, singleMinireel, multiMinireel.
            // We send the adConfig to the AdSettingsCtrl for UI binding
            // and at the save method will be on the AdManagerCtrl so it can tell
            // what excatly it's updating. The AdSettings views don't care what
            // they're updating, they just show the config that's passed
            //
            // when Use Default Settings is clicked we cycle through selected MRs
            // and delete any adConfig blocks
            //
            // Remove Ads will cycle through selected MRs and either delete
            // static ad cards or set firstPlacement to -1
            //
            // EditAd Settings will cycle through selected MRs, try to match adConfig settings
            // and if they don't match we null out any bindings

            org.adConfig = org.adConfig || {
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

            self.adCountOf = function(minireel) {
                var totalCards = minireel.data.deck.length,
                    adConfig = minireel.data.adConfig || org.adConfig,
                    adCount = minireel.data.deck.filter(function(card) {
                        return card.ad;
                    }).length;

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

            self.editSettings = function(type, config) {
                settingsType = type;
                c6State.goTo('MR:AdManager.Settings.DisplayServer', [config]);
            };
        }])

        .controller('AdSettingsController', ['$scope','MiniReelService',
        function                            ( $scope , MiniReelService ) {
            var self = this,
                MiniReelCtrl = $scope.MiniReelCtrl,
                PortalCtrl = $scope.PortalCtrl;

            self.adChoices = MiniReelService.adChoicesOf(PortalCtrl.model.org, MiniReelCtrl.model.data);
        }]);
});
