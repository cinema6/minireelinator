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
            c6StateProvider.state('Selfie:NewCampaign', ['$q','cinema6','c6State','MiniReelService',
            function                                    ( $q , cinema6 , c6State , MiniReelService ) {
                this.model = function() {
                    return $q.all({
                        campaign: cinema6.db.create('campaign', {
                            name: null,
                            categories: [],
                            minViewTime: 3,
                            advertiser: null, // id from user
                            brand: null, // name of Org
                            customer: null, // id from user
                            logos: {
                                square: null // url from Org
                            },
                            links: {},
                            miniReels: [],
                            cards: [],
                            staticCardMap: [],
                            miniReelGroups: []
                        }),
                        card: cinema6.db.create('card', MiniReelService.createCard('video'));
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
                    var deferred = $q.defer(),
                        model = {};

                    cinema6.db.find('campaign', params.campaignId)
                        .then(function(campaign) {
                            model.campaign = campaign;

                            return $q.all(campaign.cards.map(function(card) {
                                return cinema6.db.find('card', card.id);
                            }));
                        })
                        .then(function(cards) {
                            model.card = cards[0];

                            deferred.resolve(model);
                        })
                        .catch(function(err) {
                            deferred.reject(err);
                        });

                    return deferred.promise;
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

                // the parent is either NewCampaign or EditCampaign
                // this is just like MR:WildCard + WildcardController
                // this is a shared state between New and Edit

                this.card = null;
                this.campaign = null;

                this.beforeModel = function() {
                    this.card = this.cParent.cModel.card;
                    this.campaign = this.cParent.cModel.campaign;
                };

                this.model = function() {
                    // pojoify the campaign??

                    return cinema6.db.findAll('category');
                    // return cinema6.db.find('campaign', params.campaignId);
                };
            }]);
        }])

        .controller('SelfieCampaignController', ['$scope','c6State','c6Computed','cState',
        function                                ( $scope , c6State , c6Computed , cState ) {
            var AppCtrl = $scope.AppCtrl;

            console.log('CAMPAIGN CTRL');

            this.initWithModel = function(categories) {
                var campaign = cState.campaign,
                    card = cState.card;

                this.card = card;
                this.campaign = campaign;
                this.categories = categories;
            };

            Object.defineProperties(this, {
                validLogo: {
                    get: function() {
                        var logo = this.card.collateral.logo;

                        return !logo || AppCtrl.validImgSrc.test(logo);
                    }
                }
            });
        }])

        .controller('SelfieCampaignGeneralController', ['$scope', function($scope) {
            var SelfieAppCtrl = $scope.SelfieAppCtrl,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl;

            console.log('GENERAL CTRL', SelfieAppCtrl);
        }])

        .controller('SelfieCampaignLogoController', ['$scope', function($scope) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl;

            console.log('LOGO CTRL');
        }])

        .controller('SelfieCampaignLinksController', ['$scope', function($scope) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                campaign = SelfieCampaignCtrl.model;

            console.log('LINKS CTRL');

            function createModelLinks(uiLinks) {
                return uiLinks.filter(function(link) {
                    return !!link.href;
                }).reduce(function(links, link) {
                    links[link.name] = link.href;
                    return links;
                }, {});
            }

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

            function Link() {
                this.name = 'Untitled';
                this.href = null;
            }

            this.newLink = new Link();

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
                campaign.links = createModelLinks(this.links);
            };
        }])

        .controller('SelfieCampaignVideoController', ['$scope', function($scope) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl;

            console.log('VIDEO CTRL');
        }])

        .controller('SelfieCampaignPreviewController', ['$scope', function($scope) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl;

            console.log('PREVIEW CTRL');
        }]);
});
