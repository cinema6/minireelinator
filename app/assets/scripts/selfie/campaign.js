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
            c6StateProvider.state('Selfie:Campaigns.New', ['$q','cinema6',
            function                                      ( $q , cinema6 ) {
                this.templateUrl = 'views/selfie/campaigns/campaign.html';
                this.controller = 'SelfieCampaignsNewController';
                this.controllerAs = 'SelfieCampaignsNewCtrl';

                this.model = function() {
                    return $q.all({
                        campaign: cinema6.db.create('campaign', {
                            name: null,
                            categories: [],
                            minViewTime: -1,
                            advertiser: null,
                            brand: null,
                            customer: null,
                            logos: {
                                square: null
                            },
                            links: {},
                            miniReels: [],
                            cards: [],
                            staticCardMap: [],
                            miniReelGroups: []
                        }),
                        customers: cinema6.db.findAll('customer')
                    });
                };
            }]);
        }])

        .controller('SelfieCampaignsNewController', ['$scope','c6State','c6Computed',
        function                                    ( $scope , c6State , c6Computed ) {
            var c = c6Computed($scope),
                SelfieCtrl = $scope.SelfieCtrl;

            function optionsByName(items, type) {
                return items.reduce(function(result, item) {
                    var blacklist = SelfieCtrl.model.data.blacklists[type];

                    if (blacklist.indexOf(item.id) === -1) {
                        result[item.name] = item;
                    }

                    return result;
                }, { None: null });
            }

            c(this, 'advertiserOptions', function() {
                var customer = this.model.customer;

                return optionsByName(customer && customer.advertisers || [], 'advertisers');
            }, ['SelfieCampaignsNewCtrl.model.customer']);

            this.initWithModel = function(model) {
                this.model = model.campaign;
                this.customers = model.customers;

                this.customerOptions = optionsByName(this.customers, 'customers');
            };

            this.save = function() {
                var advertiser = this.model.advertiser;

                deepExtend(this.model, {
                    links: advertiser.defaultLinks,
                    logos: advertiser.defaultLogos,
                    brand: advertiser.name
                });

                return this.model.save()
                    .then(function(campaign) {
                        return c6State.goTo('Selfie:Campaign', [campaign]);
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign', ['cinema6',
            function                             ( cinema6 ) {
                this.templateUrl = 'views/selfie/campaigns/campaign.html';
                this.controller = 'SelfieCampaignController';
                this.controllerAs = 'SelfieCampaignCtrl';

                this.model = function(params) {
                    return cinema6.db.find('campaign', params.campaignId);
                };
            }]);
        }])

        .controller('SelfieCampaignController', [function() {}]);
});
