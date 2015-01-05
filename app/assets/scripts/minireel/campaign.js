define (['angular','c6_state','./mixins/PaginatedListState','./mixins/PaginatedListController',
         './mixins/WizardController'],
function( angular , c6State  , PaginatedListState          , PaginatedListController          ,
          WizardController          ) {
    'use strict';

    var equals = angular.equals,
        extend = angular.extend,
        copy = angular.copy;

    return angular.module('c6.app.minireel.campaign', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:CampaignTab', ['c6State',
            function                                ( c6State ) {
                this.enter = function() {
                    c6State.goTo('MR:Campaigns');
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaigns', ['$injector','paginatedDbList',
            function                              ( $injector , paginatedDbList ) {
                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/minireel/campaigns.html';
                this.controller = 'CampaignsController';
                this.controllerAs = 'CampaignsCtrl';

                this.title = function() {
                    return 'Cinema6 Campaign Manager';
                };
                this.model = function() {
                    return paginatedDbList('campaign', {
                        sort: 'lastUpdated,-1'
                    }, this.limit, this.page).ensureResolution();
                };
            }]);
        }])

        .controller('CampaignsController', ['$injector','$scope','cState','$q',
                                            'ConfirmDialogService',
        function                           ( $injector , $scope , cState , $q ,
                                             ConfirmDialogService ) {
            var CampaignsCtrl = this;

            $injector.invoke(PaginatedListController, this, {
                cState: cState,
                $scope: $scope
            });

            this.remove = function(campaigns) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete ' + campaigns.length + ' campaign(s)?',
                    affirm: 'Delete',
                    cancel: 'Keep',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        ConfirmDialogService.close();


                        return $q.all(campaigns.map(function(campaign) {
                            return campaign.erase();
                        })).then(function() {
                            return CampaignsCtrl.model.refresh();
                        });
                    }
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaigns.New', ['$q','cinema6',
            function                                 ( $q , cinema6 ) {
                this.templateUrl = 'views/minireel/campaigns/new.html';
                this.controller = 'CampaignsNewController';
                this.controllerAs = 'CampaignsNewCtrl';

                this.model = function() {
                    return $q.all({
                        campaign: cinema6.db.create('campaign', {
                            name: null,
                            categories: [],
                            minViewTime: -1,
                            advertiser: null,
                            customer: null,
                            logos: {
                                square: null
                            },
                            links: {},
                            miniReels: [],
                            cards: [],
                            targetMiniReels: []
                        }),
                        advertisers: cinema6.db.findAll('advertiser')
                    });
                };
            }]);
        }])

        .controller('CampaignsNewController', ['c6State',
        function                              ( c6State ) {
            this.initWithModel = function(model) {
                this.model = model.campaign;
                this.advertisers = model.advertisers;

                this.advertiserOptions = this.advertisers.reduce(function(result, advertiser) {
                    result[advertiser.name] = advertiser;
                    return result;
                }, { None: null });
            };

            this.save = function() {
                return this.model.save()
                    .then(function(campaign) {
                        return c6State.goTo('MR:Campaign', [campaign]);
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign', ['cinema6','c6State',
            function                             ( cinema6 , c6State ) {
                this.templateUrl = 'views/minireel/campaigns/campaign.html';
                this.controller = 'CampaignController';
                this.controllerAs = 'CampaignCtrl';

                this.enter = function() {
                    c6State.goTo('MR:Campaign.General');
                };

                this.model = function(params) {
                    return cinema6.db.find('campaign', params.campaignId);
                };
            }]);
        }])

        .controller('CampaignController', [function() {
            var CampaignCtrl = this;

            function createModelLinks(uiLinks) {
                return uiLinks.filter(function(link) {
                    return !!link.href;
                }).reduce(function(links, link) {
                    links[link.name] = link.href;
                    return links;
                }, {});
            }

            Object.defineProperties(this, {
                isClean: {
                    get: function() {
                        return equals(
                            extend(this.model.pojoify(), {
                                links: createModelLinks(this.links)
                            }),
                            this.cleanModel
                        );
                    }
                }
            });

            this.initWithModel = function(campaign) {
                this.model = campaign;
                this.cleanModel = campaign.pojoify();

                this.links = ['Action', 'Website', 'Facebook', 'Twitter', 'YouTube', 'Pinterest']
                    .concat(Object.keys(campaign.links))
                    .filter(function(name, index, names) {
                        return names.indexOf(name) === index;
                    })
                    .map(function(name) {
                        var href = campaign.links[name] || null;

                        return {
                            name: name,
                            href: href
                        };
                    });
            };

            this.removeLink = function(link) {
                this.links = this.links.filter(function(listLink) {
                    return listLink !== link;
                });
            };

            this.addLink = function(link) {
                this.links = this.links.concat([link]);
            };

            this.save = function() {
                this.model.links = createModelLinks(this.links);

                return this.model.save().then(function(campaign) {
                    CampaignCtrl.cleanModel = campaign.pojoify();

                    return campaign;
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.General', ['cinema6',
            function                                     ( cinema6 ) {
                this.templateUrl = 'views/minireel/campaigns/campaign/general.html';
                this.controller = 'CampaignGeneralController';
                this.controllerAs = 'CampaignGeneralCtrl';

                this.model = function() {
                    return cinema6.db.findAll('category');
                };
            }]);
        }])

        .controller('CampaignGeneralController', [function() {
            this.initWithModel = function(model) {
                this.categories = model;
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.Assets', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/assets.html';
                this.controller = 'CampaignAssetsController';
                this.controllerAs = 'CampaignAssetsCtrl';
            }]);
        }])

        .controller('CampaignAssetsController', ['$scope',
        function                                ( $scope ) {
            var CampaignCtrl = $scope.CampaignCtrl;

            function Link() {
                this.name = 'Untitled';
                this.href = null;
            }

            this.newLink = new Link();

            this.push = function() {
                CampaignCtrl.addLink(this.newLink);

                this.newLink = new Link();
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.Creatives', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/creatives.html';
                this.controller = 'CampaignCreativesController';
                this.controllerAs = 'CampaignCreativesCtrl';
            }]);
        }])

        .controller('CampaignCreativesController', ['$scope',
        function                                   ( $scope ) {
            var CampaignCtrl = $scope.CampaignCtrl,
                campaign = CampaignCtrl.model;

            function removeFromArray(array, item) {
                var index = array.indexOf(item);

                if (index < 0) {
                    return null;
                }

                array.splice(index, 1);
                return item;
            }

            this.remove = function(item) {
                function removeItemFrom(array) {
                    return removeFromArray(array, item);
                }

                [campaign.miniReels, campaign.cards].forEach(removeItemFrom);
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Creatives.NewMiniReel', ['c6State','MiniReelService',
            function                                          ( c6State , MiniReelService ) {
                var CampaignState = c6State.get('MR:Campaign');

                this.templateUrl = 'views/minireel/campaigns/campaign/creatives/new_mini_reel.html';
                this.controller = 'CreativesNewMiniReelController';
                this.controllerAs = 'CreativesNewMiniReelCtrl';

                this.model = function() {
                    var campaign = CampaignState.cModel;

                    return MiniReelService.create()
                        .then(function addCampaignData(minireel) {
                            return extend(minireel, {
                                campaignId: campaign.id,
                                categoryList: copy(campaign.categories)
                            });
                        });
                };
            }]);
        }])

        .controller('CreativesNewMiniReelController', ['$injector',
        function                                      ( $injector ) {
            $injector.invoke(WizardController, this);

            this.tabs = [
                {
                    name: 'General',
                    sref: 'MR:Creatives.NewMiniReel.General'
                },
                {
                    name: 'MiniReel Type',
                    sref: 'MR:Creatives.NewMiniReel.Type'
                },
                {
                    name: 'Playback Settings',
                    sref: 'MR:Creatives.NewMiniReel.Playback'
                }
            ];
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Creatives.NewMiniReel.General', ['cinema6','$q',
            function                                                  ( cinema6 , $q ) {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/creatives/new_mini_reel/general.html';
                this.controller = 'GenericController';
                this.controllerAs = 'CreativesNewMiniReelGeneralCtrl';

                this.model = function() {
                    return $q.all({
                        categories: cinema6.db.findAll('category')
                    });
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.Placements', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/placements.html';
                this.controller = 'CampaignPlacementsController';
                this.controllerAs = 'CampaignPlacementsCtrl';
            }]);
        }])

        .controller('CampaignPlacementsController', ['$scope','scopePromise','cinema6',
        function                                    ( $scope , scopePromise , cinema6 ) {
            var PortalCtrl = $scope.PortalCtrl,
                CampaignCtrl = $scope.CampaignCtrl,
                campaign = CampaignCtrl.model;

            this.result = null;
            this.query = '';

            this.search = function() {
                return (this.result = scopePromise(cinema6.db.findAll('experience', {
                    org: PortalCtrl.model.org.id,
                    text: this.query
                }))).promise;
            };

            this.add = function(minireel) {
                campaign.targetMiniReels.push(minireel);
            };

            this.remove = function(minireel) {
                var targetMiniReels = campaign.targetMiniReels;

                targetMiniReels.splice(targetMiniReels.indexOf(minireel), 1);
            };

            this.isNotAlreadyTargeted = function(minireel) {
                return campaign.targetMiniReels.indexOf(minireel) < 0;
            };
        }]);
});
