define( ['angular','c6_state','../minireel/mixins/PaginatedListState',
         '../minireel/mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState                    ,
          PaginatedListController                    ) {
    /* jshint -W106 */
    'use strict';

    var copy = angular.copy,
        extend = angular.extend,
        forEach = angular.forEach,
        isObject = angular.isObject,
        fromJson = angular.fromJson,
        toJson = angular.toJson;

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

        .controller('SelfieCampaignsController', ['$injector','$scope','$q','cState',
                                                  'ConfirmDialogService',
        function                                 ( $injector , $scope , $q , cState ,
                                                   ConfirmDialogService ) {
            var SelfieCampaignsCtrl = this;

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
                            return SelfieCampaignsCtrl.model.refresh();
                        });
                    }
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:NewCampaign', ['cinema6','c6State','MiniReelService',
            function                                    ( cinema6 , c6State , MiniReelService ) {
                var SelfieState = c6State.get('Selfie');

                this.model = function() {
                    var user = SelfieState.cModel;

                    return cinema6.db.create('campaign', {
                            name: null,
                            categories: [],
                            minViewTime: 3,
                            brand: user.org.name,
                            advertiser: {
                                id: user.advertiserId
                            },
                            customer: {
                                id: user.customerId
                            },
                            logos: {
                                square: user.org.logos && user.org.logos.square ?
                                    user.org.logos.square :
                                    null
                            },
                            links: user.org.links || {},
                            cards: [],
                            miniReels: [],
                            staticCardMap: [],
                            miniReelGroups: [],
                            status: 'new'
                        });
                };

                this.afterModel = function(campaign) {
                    var card = cinema6.db.create('card', MiniReelService.createCard('video'));

                    this.card = deepExtend(card, {
                            id: undefined,
                            campaignId: undefined,
                            campaign: {
                                minViewTime: campaign.minViewTime
                            },
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
                            data: {
                                autoadvance: false,
                                controls: false,
                                autoplay: true,
                                skip: 30,
                                moat: {
                                    campaign: campaign.brand,
                                    advertiser: campaign.brand,
                                    creative: campaign.brand
                                }
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
                    this.card = this.cParent.card.pojoify();
                    this.campaign = this.cParent.cModel;
                };

                this.model = function() {
                    return cinema6.db.findAll('category');
                };

                this.updateCard = function() {
                    return this.cParent.card._update(this.card).save();
                };
            }]);
        }])

        .controller('SelfieCampaignController', ['$scope','$log','c6State','c6Computed','cState',
        function                                ( $scope , $log , c6State , c6Computed , cState ) {

            var SelfieCampaignCtrl = this;

            function addCardId(card) {
                SelfieCampaignCtrl.card.id = card.id;

                return card;
            }

            function addCardToCampaign(card) {
                SelfieCampaignCtrl.campaign.cards = [{
                    id: card.id,
                    endDate: null,
                    name: null,
                    reportingId: null
                }];

                return card;
            }

            function saveCampaign() {
                return SelfieCampaignCtrl.campaign.save();
            }

            function setCampaignId(campaign) {
                SelfieCampaignCtrl.card.campaignId = campaign.id;
                SelfieCampaignCtrl.card.campaign.campaignId = campaign.id;

                return campaign;
            }

            function handleError(err) {
                $log.error('Could not save the Campaign', err);
            }

            this.initWithModel = function(categories) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = categories;
            };

            this.save = function() {
                $scope.$broadcast('SelfieCampaignWillSave');

                if (this.card.id) {
                    // TODO: determine if card object on campaign model is editable:
                    // endDate, name, reportingId

                    return cState.updateCard()
                        .then(saveCampaign)
                        .catch(handleError);
                } else {
                    return cState.updateCard()
                        .then(addCardId)
                        .then(addCardToCampaign)
                        .then(saveCampaign)
                        .then(setCampaignId)
                        .then(function() {
                            cState.updateCard();
                        })
                        .catch(handleError);
                }
            };
        }])

        .controller('SelfieCampaignSponsorController', ['$scope', function($scope) {
            var SelfieCampaignSponsorCtrl = this,
                AppCtrl = $scope.AppCtrl,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                card = SelfieCampaignCtrl.card;

            function createModelLinks(uiLinks) {
                var start = card.links.Action ? {
                    Action: card.links.Action
                } : {};

                return uiLinks.filter(function(link) {
                    return !!link.href;
                }).reduce(function(links, link) {
                    links[link.name] = link.href;
                    return links;
                }, start);
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
                card.links = createModelLinks(SelfieCampaignSponsorCtrl.links);
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

            $scope.$on('SelfieCampaignWillSave', this.updateLinks);
        }])

        .controller('SelfieCampaignVideoController', ['$injector','$scope','VideoService',
        function                                     ( $injector , $scope , VideoService ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                val;

            function getJSONProp(json, prop) {
                return (fromJson(json) || {})[prop];
            }

            function setJSONProp(json, prop, value) {
                var proto = {};

                proto[prop] = value;

                return toJson(extend(fromJson(json) || {}, proto));
            }

            this.model = SelfieCampaignCtrl.card;
            this.adPreviewType = 'vpaid';
            this.adPreviewPageUrl = '';

            Object.defineProperties(this, {
                videoUrl: {
                    enumerable: true,
                    configurable: true,
                    get: function() {
                        var service = this.model.data.service,
                            id = this.model.data.videoid;

                        return VideoService.urlFromData(service, id) || val;
                    },
                    set: function(value) {
                        var info = VideoService.dataFromUrl(value) || {
                            service: null,
                            id: null
                        };

                        val = value;

                        this.model.data.service = info.service;
                        this.model.data.videoid = info.id;
                    }
                },
                isAdUnit: {
                    get: function() {
                        return this.model.data.service === 'adUnit';
                    },
                    set: function(bool) {
                        this.model.data.service = bool ? 'adUnit' : null;
                    }
                },
                vastTag: {
                    get: function() {
                        return getJSONProp(this.model.data.videoid, 'vast') || null;
                    },
                    set: function(value) {
                        this.model.data.videoid = setJSONProp(
                            this.model.data.videoid,
                            'vast',
                            value
                        );
                    }
                },
                vpaidTag: {
                    get: function() {
                        return getJSONProp(this.model.data.videoid, 'vpaid') || null;
                    },
                    set: function(value) {
                        this.model.data.videoid = setJSONProp(
                            this.model.data.videoid,
                            'vpaid',
                            value
                        );
                    }
                },
                adTag: {
                    get: function() {
                        var tag = (function() {
                            switch (this.adPreviewType) {
                            case 'vast':
                                return this.vastTag;
                            case 'vpaid':
                                return this.vpaidTag;
                            }
                        }.call(this));

                        return tag && tag.replace(
                            '{pageUrl}',
                            encodeURIComponent(this.adPreviewPageUrl)
                        );
                    }
                }
            });
        }]);
});
