define( ['angular','c6_state','../minireel/mixins/PaginatedListState',
         '../minireel/mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState                    ,
          PaginatedListController ) {
    /* jshint -W106 */
    'use strict';

    var copy = angular.copy,
        forEach = angular.forEach,
        isObject = angular.isObject;

    function deepExtend(target, extension) {
        forEach(extension, function(extensionValue, prop) {
            var targetValue = target[prop];

            if (isObject(extensionValue) && isObject(targetValue)) {
                deepExtend(targetValue, extensionValue);
            } else {
                target[prop] = copy(extensionValue);
            }
        });

        return target;
    }

    return angular.module('c6.app.selfie.campaign', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:CampaignDashboard', ['c6State',
            function                                          ( c6State ) {
                this.enter = function() {
                    c6State.goTo('Selfie:Campaigns');
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Campaigns', ['c6State','$injector','paginatedDbList',
            function                                  ( c6State , $injector , paginatedDbList ) {
                var SelfieState = c6State.get('Selfie');

                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/selfie/campaigns.html';
                this.controller = 'SelfieCampaignsController';
                this.controllerAs = 'SelfieCampaignsCtrl';

                this.title = function() {
                    return 'Selfie Campaign Manager';
                };
                this.model = function() {
                    return paginatedDbList('campaign', {
                        sort: 'lastUpdated,-1',
                        org: SelfieState.cModel.org.id
                    }, this.limit, this.page).ensureResolution();
                };
            }]);
        }])

        .controller('SelfieCampaignsController', ['$injector','$scope','cState',
        function                                 ( $injector , $scope , cState ) {
            $injector.invoke(PaginatedListController, this, {
                cState: cState,
                $scope: $scope
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:NewCampaign', ['cinema6','c6State','MiniReelService',
            function                                    ( cinema6 , c6State , MiniReelService ) {
                var SelfieState = c6State.get('Selfie');

                this.model = function() {
                    var user = SelfieState.cModel;

                    console.log(user);

                    return cinema6.db.create('campaign', {
                            name: null,
                            categories: [],
                            minViewTime: 3,
                            advertiser: user.advertiserId,
                            brand: user.org.name,
                            customer: user.customerId,
                            logos: {
                                square: user.org.logos && user.org.logos.square ?
                                    user.org.logos.square :
                                    null
                            },
                            links: user.org.links || {},
                            miniReels: [],
                            cards: [],
                            staticCardMap: [],
                            miniReelGroups: []
                        });
                };

                this.afterModel = function(campaign) {
                    var card = cinema6.db.create('card', MiniReelService.createCard('video'));

                    this.card = deepExtend(card, {
                            id: undefined,
                            campaignId: undefined,
                            sponsored: true,
                            collateral: {
                                logo: campaign.logos.square
                            },
                            links: campaign.links,
                            params: {
                                sponsor: campaign.brand,
                                ad: true,
                                action: null
                            },
                            campaign: {
                                minViewTime: campaign.minViewTime
                            },
                            data: {
                                autoadvance: false,
                                autoplay: true,
                                skip: 30
                            },
                            moat: {
                                campaign: campaign.brand,
                                advertiser: campaign.brand,
                                creative: campaign.brand
                            }
                        });
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:New:Campaign', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:EditCampaign', ['cinema6','c6State',
            function                                     ( cinema6 , c6State ) {
                this.model = function(params) {
                    return cinema6.db.find('campaign', params.campaignId);
                };

                this.afterModel = function(campaign) {
                    this.card = campaign.cards[0].item;
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:Edit:Campaign', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Campaign', ['cinema6',
            function                                 ( cinema6 ) {
                this.templateUrl = 'views/selfie/campaigns/campaign.html';
                this.controller = 'SelfieCampaignController';
                this.controllerAs = 'SelfieCampaignCtrl';

                this.card = null;
                this.campaign = null;

                this.beforeModel = function() {
                    this.card = this.cParent.card;
                    this.campaign = this.cParent.cModel;
                };

                this.model = function() {
                    return cinema6.db.findAll('category');
                };
            }]);
        }])

        .controller('SelfieCampaignController', ['$scope','c6State','c6Computed','cState',
        function                                ( $scope , c6State , c6Computed , cState ) {

            console.log('CAMPAIGN CTRL');

            this.initWithModel = function(categories) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = categories;
            };
        }])

        .controller('SelfieCampaignGeneralController', [function() {}])

        .controller('SelfieCampaignSponsorController', ['$scope', function($scope) {
            var AppCtrl = $scope.AppCtrl,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                campaign = SelfieCampaignCtrl.campaign,
                card = SelfieCampaignCtrl.card;

            console.log('SPONSOR CTRL');

            function createModelLinks(uiLinks) {
                return uiLinks.filter(function(link) {
                    return !!link.href;
                }).reduce(function(links, link) {
                    links[link.name] = link.href;
                    return links;
                }, {});
            }

            function Link() {
                this.name = 'Untitled';
                this.href = null;
            }

            Object.defineProperties(this, {
                validLogo: {
                    get: function() {
                        var logo = card && card.collateral &&
                            card.collateral.logo;

                        return !logo || AppCtrl.validImgSrc.test(logo);
                    }
                }
            });

            this.newLink = new Link();

            this.links = ['Website', 'Facebook', 'Twitter', 'YouTube', 'Pinterest']
                .concat(Object.keys(card.links))
                .filter(function(name, index, names) {
                    return names.indexOf(name) === index &&
                        name.indexOf('Action') < 0;
                })
                .map(function(name) {
                    var href = card.links[name] || null;

                    return {
                        name: name,
                        href: href
                    };
                });

            this.addNewLink = function() {
                this.addLink(this.newLink);

                this.newLink = new Link();
            };

            this.removeLink = function(link) {
                this.links = this.links.filter(function(listLink) {
                    return listLink !== link;
                });
            };

            this.addLink = function(link) {
                this.links = this.links.concat([link]);
            };

            this.updateLinks = function() {
                card.links = createModelLinks(this.links);
            };

            this.actionTypeOptions = ['Button', 'Text']
                .reduce(function(options, label) {
                    options[label] = label.toLowerCase();
                    return options;
                }, {});

            card.params.action = card.params.action || {
                type: 'button',
                label: ''
            };

            $scope.$on('$destroy', function() {
                if (!card.params.action.label) {
                    card.params.action = null;
                }
            });
        }])

        .controller('SelfieCampaignVideoController', ['$scope', function($scope) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl;

            console.log('VIDEO CTRL', SelfieCampaignCtrl);
        }])

        .controller('SelfieCampaignTargetingController', [function() {}])

        .controller('SelfieCampaignPreviewController', [function() {}]);
});
