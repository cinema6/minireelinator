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
                        this.state('Selfie:Campaign', 'Selfie:New:Campaign', function() {
                            this.state(
                                'Selfie:Campaign:Payment:New',
                                'Selfie:New:Campaign:Payment:New'
                            );
                        });
                    });
                    this.route('/edit/:campaignId', 'Selfie:EditCampaign', function() {
                        this.state('Selfie:Campaign', 'Selfie:Edit:Campaign', function() {
                            this.state(
                                'Selfie:Campaign:Payment:New',
                                'Selfie:Edit:Campaign:Payment:New'
                            );
                        });
                    });
                    this.route('/manage/:campaignId', 'Selfie:ManageCampaign', function() {
                        this.state('Selfie:Manage:Campaign', function() {
                            this.route('/manage', 'Selfie:Manage:Campaign:Manage');
                            this.route('/payment', 'Selfie:Manage:Campaign:Payment');
                            this.route('/stats', 'Selfie:Manage:Campaign:Stats');
                            this.route('/admin', 'Selfie:Manage:Campaign:Admin');
                        });
                    });
                });

                this.route('/account', 'Selfie:Account', function() {
                    this.route('/overview', 'Selfie:Account:Overview');
                    this.route('/email', 'Selfie:Account:Email');
                    this.route('/details', 'Selfie:Account:Details');
                    this.route('/password', 'Selfie:Account:Password');
                    this.route('/payment', 'Selfie:Account:Payment', function() {
                        this.route('/new', 'Selfie:Account:Payment:New');
                        this.route('/edit/:id', 'Selfie:Account:Payment:Edit');
                    });
                    this.route('/payment/history', 'Selfie:Account:Payment:History');
                });
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:App', ['c6State','SettingsService','CampaignService',
            function                            ( c6State , SettingsService , CampaignService ) {
                this.templateUrl = 'views/selfie/app.html';

                this.model = function() {
                    return this.cParent.cModel.selfie;
                };
                this.afterModel = function() {
                    var user = c6State.get('Selfie').cModel,
                        cState = this;

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
                    return CampaignService.hasCampaigns()
                        .then(function(hasCampaigns) {
                            cState.hasCampaigns = hasCampaigns;
                        });
                };
                this.enter = function() {
                    if (this.hasCampaigns) {
                        c6State.goTo('Selfie:CampaignDashboard', null, null, true);
                    } else {
                        c6State.goTo('Selfie:NewCampaign', null, {}, true);
                    }
                };
            }]);
        }]);
});
