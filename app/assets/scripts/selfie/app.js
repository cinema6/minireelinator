define( ['angular','c6_state','./services','./directives','./campaign','c6_defines',
         './containers'],
function( angular , c6State  , services   , directives   , campaign   , c6Defines  ,
          containers   ) {
    /* jshint -W106 */
    'use strict';

    return angular.module('c6.app.selfie.app', [
        c6State.name,
        services.name,
        campaign.name,
        directives.name,
        containers.name
    ])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.map('Selfie:App', function() {
                this.route('/campaigns',
                    'Selfie:CampaignDashboard',
                    'Selfie:All:CampaignDashboard',
                    function() {
                        this.state('Selfie:Campaigns', 'Selfie:All:Campaigns');

                        this.route('/new', 'Selfie:NewCampaign', function() {
                            this.state('Selfie:Campaign', 'Selfie:New:Campaign', function() {
                                this.state(
                                    'Selfie:Campaign:Website',
                                    'Selfie:New:Campaign:Website'
                                );
                                this.state(
                                    'Selfie:Campaign:Fund',
                                    'Selfie:New:Campaign:Fund',
                                    function() {
                                        this.state(
                                            'Selfie:Campaign:Fund:Deposit',
                                            'Selfie:New:Campaign:Fund:Deposit'
                                        );
                                        this.state(
                                            'Selfie:Campaign:Fund:Confirm',
                                            'Selfie:New:Campaign:Fund:Confirm'
                                        );
                                    });
                            });
                        });
                        this.route('/edit/:campaignId', 'Selfie:EditCampaign', function() {
                            this.state('Selfie:Campaign', 'Selfie:Edit:Campaign', function() {
                                this.state(
                                    'Selfie:Campaign:Website',
                                    'Selfie:Edit:Campaign:Website'
                                );
                                this.state(
                                    'Selfie:Campaign:Fund',
                                    'Selfie:Edit:Campaign:Fund',
                                    function() {
                                        this.state(
                                            'Selfie:Campaign:Fund:Deposit',
                                            'Selfie:Edit:Campaign:Fund:Deposit'
                                        );
                                        this.state(
                                            'Selfie:Campaign:Fund:Confirm',
                                            'Selfie:Edit:Campaign:Fund:Confirm'
                                        );
                                    });
                            });
                        });
                        this.route('/manage/:campaignId',
                            'Selfie:ManageCampaign',
                            'Selfie:All:ManageCampaign',
                            function() {
                                this.state(
                                    'Selfie:Manage:Campaign',
                                    'Selfie:All:Manage:Campaign',
                                    function() {
                                        this.route('/manage',
                                            'Selfie:Manage:Campaign:Manage',
                                            'Selfie:All:Manage:Campaign:Manage'
                                        );
                                        this.route('/stats',
                                            'Selfie:Manage:Campaign:Stats',
                                            'Selfie:All:Manage:Campaign:Stats'
                                        );
                                        this.route('/admin',
                                            'Selfie:Manage:Campaign:Admin',
                                            'Selfie:All:Manage:Campaign:Admin'
                                        );
                                        this.route('/placements',
                                            'Selfie:Manage:Campaign:Placements',
                                            'Selfie:All:Manage:Campaign:Placements',
                                            function() {
                                                this.state(
                                                    'Selfie:Manage:Campaign:Placements:Tag',
                                                    'Selfie:All:Manage:Campaign:Placements:Tag'
                                                );
                                            });
                                    });
                            });
                    });

                this.route('/pending',
                    'Selfie:CampaignDashboard',
                    'Selfie:Pending:CampaignDashboard',
                    function() {
                        this.state('Selfie:Campaigns', 'Selfie:Pending:Campaigns');

                        this.route('/manage/:campaignId',
                            'Selfie:ManageCampaign',
                            'Selfie:Pending:ManageCampaign',
                            function() {
                                this.state(
                                    'Selfie:Manage:Campaign',
                                    'Selfie:Pending:Manage:Campaign',
                                    function() {
                                        this.route('/manage',
                                            'Selfie:Manage:Campaign:Manage',
                                            'Selfie:Pending:Manage:Campaign:Manage'
                                        );
                                        this.route('/payment',
                                            'Selfie:Manage:Campaign:Payment',
                                            'Selfie:Pending:Manage:Campaign:Payment'
                                        );
                                        this.route('/stats',
                                            'Selfie:Manage:Campaign:Stats',
                                            'Selfie:Pending:Manage:Campaign:Stats'
                                        );
                                        this.route('/admin',
                                            'Selfie:Manage:Campaign:Admin',
                                            'Selfie:Pending:Manage:Campaign:Admin'
                                        );
                                        this.route('/placements',
                                            'Selfie:Manage:Campaign:Placements',
                                            'Selfie:Pending:Manage:Campaign:Placements',
                                            function() {
                                                this.state(
                                                    'Selfie:Manage:Campaign:Placements:Tag',
                                                    'Selfie:Pending:Manage:Campaign:Placements:Tag'
                                                );
                                            });
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

                this.route('/containers', 'Selfie:Containers', function() {
                    this.state('Selfie:Containers:List');

                    this.route('/new', 'Selfie:New:Container');
                    this.route('/edit/:id', 'Selfie:Edit:Container');
                });
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:App', ['c6State','SettingsService','CampaignService',
                                                 'intercom',
            function                            ( c6State , SettingsService , CampaignService ,
                                                  intercom ) {
                this.templateUrl = 'views/selfie/app.html';

                this.model = function() {
                    return this.cParent.cModel.selfie;
                };
                this.afterModel = function() {
                    var user = c6State.get('Selfie').cModel,
                        intercomSettings = {
                            app_id: c6Defines.kIntercomId,
                            name: user.firstName + ' ' + user.lastName,
                            email: user.email,
                            created_at: user.created
                        },
                        cState = this;

                    intercom('boot', intercomSettings);

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
