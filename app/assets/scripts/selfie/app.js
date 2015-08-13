define( ['angular','c6_state','./services','./directives','./campaign'],
function( angular , c6State  , services   , directives   , campaign   ) {
    /* jshint -W106 */
    'use strict';

    return angular.module('c6.app.selfie.app', [
        c6State.name,
        services.name,
        campaign.name,
        directives.name
    ])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.map('Selfie:App', function() {
                this.route('/campaigns', 'Selfie:CampaignDashboard', function() {
                    this.state('Selfie:Campaigns');

                    this.route('/new', 'Selfie:NewCampaign', function() {
                        this.state('Selfie:Campaign', 'Selfie:New:Campaign');
                    });
                    this.route('/:campaignId', 'Selfie:EditCampaign', function() {
                        this.state('Selfie:Campaign', 'Selfie:Edit:Campaign');
                    });
                });
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:App', ['c6State','SettingsService',
            function                            ( c6State , SettingsService ) {
                this.templateUrl = 'views/selfie/app.html';

                this.model = function() {
                    return this.cParent.cModel.selfie;
                };
                this.afterModel = function() {
                    var user = c6State.get('Selfie').cModel;

                    if (!user.org.config.minireelinator) {
                        user.org.config.minireelinator = {};
                    }
                    if (!user.config.minireelinator) {
                        user.config.minireelinator = {};
                    }

                    SettingsService
                        .register('MR::org', user.org.config.minireelinator, {
                            localSync: false,
                            defaults: {
                                embedTypes: ['script'],
                                minireelDefaults: {
                                    mode: 'light',
                                    autoplay: true,
                                    splash: {
                                        ratio: '3-2',
                                        theme: 'img-text-overlay'
                                    }
                                },
                                embedDefaults: {
                                    size: null
                                }
                            }
                        })
                        .register('MR::user', user.config.minireelinator, {
                            defaults: {
                                minireelDefaults: {
                                    splash: {
                                        ratio: SettingsService.getReadOnly('MR::org')
                                            .minireelDefaults.splash.ratio,
                                        theme: SettingsService.getReadOnly('MR::org')
                                            .minireelDefaults.splash.theme
                                    }
                                }
                            },
                            sync: function(settings) {
                                user.config.minireelinator = settings;
                                return user.save();
                            },
                            localSync: user.id,
                            validateLocal: function(currentUserId, prevUserId) {
                                return currentUserId === prevUserId;
                            }
                        });
                };
                this.enter = function() {
                    c6State.goTo('Selfie:CampaignDashboard', null, null, true);
                };
            }]);
        }]);
});
