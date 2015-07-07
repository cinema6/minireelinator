define (['angular','c6_state','./mixins/PaginatedListState','./mixins/PaginatedListController',
         './mixins/WizardController','./mixins/VideoCardController','./mixins/LinksController',
         './mixins/MiniReelSearchController'],
function( angular , c6State  , PaginatedListState          , PaginatedListController          ,
          WizardController          , VideoCardController          , LinksController          ,
          MiniReelSearchController          ) {
    'use strict';

    var equals = angular.equals,
        extend = angular.extend,
        copy = angular.copy,
        forEach = angular.forEach,
        isObject = angular.isObject,
        fromJson = angular.fromJson,
        toJson = angular.toJson;

    function shallowCopy(object, to) {
        return Object.keys(object).reduce(function(result, key) {
            result[key] = object[key];
            return result;
        }, copy({}, to || {}));
    }

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
            c6StateProvider.state('MR:Campaigns', ['$injector','paginatedDbList','c6State',
            function                              ( $injector , paginatedDbList , c6State ) {
                var PortalState = c6State.get('Portal');

                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/minireel/campaigns.html';
                this.controller = 'CampaignsController';
                this.controllerAs = 'CampaignsCtrl';

                this.title = function() {
                    return 'Cinema6 Campaign Manager';
                };
                this.model = function() {
                    return paginatedDbList('campaign', {
                        sort: 'lastUpdated,-1',
                        org: PortalState.cModel.org.id
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

            this.targetMiniReelsOf = function(campaign) {
                return campaign.miniReelGroups.map(function(group) {
                    return group.miniReels;
                }).reduce(function(result, minireels) {
                    return result.concat(minireels);
                }, []).filter(function(minireel, index, minireels) {
                    return minireels.indexOf(minireel) === index;
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.Embed', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/embed.html';
                this.controller = 'CampaignEmbedController';
                this.controllerAs = 'CampaignEmbedCtrl';
            }]);
        }])

        .controller('CampaignEmbedController', ['cState',
        function(cState) {
            this.parentState = cState.cParent.cName;
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

        .controller('CampaignsNewController', ['$scope','c6State','c6Computed',
        function                              ( $scope , c6State , c6Computed ) {
            var c = c6Computed($scope),
                MiniReelCtrl = $scope.MiniReelCtrl;

            function optionsByName(items, type) {
                return items.reduce(function(result, item) {
                    var blacklist = MiniReelCtrl.model.data.blacklists[type];

                    if (blacklist.indexOf(item.id) === -1) {
                        result[item.name] = item;
                    }

                    return result;
                }, { None: null });
            }

            c(this, 'advertiserOptions', function() {
                var customer = this.model.customer;

                return optionsByName(customer && customer.advertisers || [], 'advertisers');
            }, ['CampaignsNewCtrl.model.customer']);

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
                    c6State.goTo('MR:Campaign.General', null, null, true);
                };

                this.model = function(params) {
                    return cinema6.db.find('campaign', params.campaignId);
                };
            }]);
        }])

        .controller('CampaignController', ['$scope','$q','ConfirmDialogService',
        function                          ( $scope , $q , ConfirmDialogService ) {
            var CampaignCtrl = this,
                AppCtrl = $scope.AppCtrl;

            function createModelLinks(uiLinks) {
                return uiLinks.filter(function(link) {
                    return !!link.href;
                }).reduce(function(links, link) {
                    links[link.name] = link.href;
                    return links;
                }, {});
            }

            function trimEmptyPlaceholders(staticCardMap) {
                return staticCardMap.map(function(entry) {
                    return extend(entry, {
                        cards: entry.cards.filter(function(item) {
                            return !!item.wildcard;
                        })
                    });
                });
            }

            function handleError(err) {
                ConfirmDialogService.display({
                    prompt: 'There was a problem saving the campaign. ' + err.data,
                    affirm: 'OK',
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    },
                    onCancel: function() {
                        return ConfirmDialogService.close();
                    }
                });

                return $q.reject(err);
            }

            Object.defineProperties(this, {
                isClean: {
                    get: function() {
                        var model = this.model.pojoify();

                        return equals(
                            extend(model, {
                                links: createModelLinks(this.links),
                                staticCardMap: trimEmptyPlaceholders(model.staticCardMap)
                            }),
                            this.cleanModel
                        );
                    }
                },
                validLogo: {
                    get: function() {
                        var logo = this.model.logos.square;

                        return !logo || AppCtrl.validImgSrc.test(logo);
                    }
                }
            });

            this.initWithModel = function(campaign) {
                campaign.brand = campaign.brand || campaign.advertiser.name;
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

            this.updateLinks = function() {
                this.model.links = createModelLinks(this.links);
            };

            this.save = function() {
                this.updateLinks();
                trimEmptyPlaceholders(this.model.staticCardMap);

                return this.model.save().then(function(campaign) {
                    CampaignCtrl.cleanModel = campaign.pojoify();
                    $scope.$broadcast('CampaignCtrl:campaignDidSave');

                    return campaign;
                })
                .catch(handleError);
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

            $scope.$on('$destroy', function() { CampaignCtrl.updateLinks(); });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.MiniReels', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/mini_reels.html';
                this.controller = 'CampaignMiniReelsController';
                this.controllerAs = 'CampaignMiniReelsCtrl';
            }]);
        }])

        .controller('CampaignMiniReelsController', ['$scope','$window','MiniReelService',
        function                                   ( $scope , $window , MiniReelService ) {
            var CampaignCtrl = $scope.CampaignCtrl,
                campaign = CampaignCtrl.model;

            this.remove = function(minireel) {
                var items = campaign.miniReels;
                var minireels = items.map(function(item) {
                    return item.item;
                });
                var index = minireels.indexOf(minireel);

                if (index < 0) {
                    return null;
                }

                items.splice(index, 1);
                return minireel;
            };

            this.add = function(minireel, data) {
                var items = campaign.miniReels;
                var minireels = items.map(function(item) {
                    return item.item;
                });
                var index = minireels.indexOf(minireel);

                if (index > -1) {
                    // update an existing minireel with data
                    extend(items[index], data);
                    return minireel;
                }

                items.push(extend({
                    id: minireel.id,
                    item: minireel
                }, data));
                return minireel;
            };

            this.previewUrlOf = function(minireel) {
                if (!minireel) { return; }
                return MiniReelService.previewUrlOf(minireel) +
                    '&campaign=' + CampaignCtrl.model.id;
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.NewMiniReel', ['c6State','MiniReelService',
            function                                         ( c6State , MiniReelService ) {
                var CampaignState = c6State.get('MR:Campaign');

                this.model = function() {
                    var campaign = CampaignState.cModel;

                    return MiniReelService.create()
                        .then(function addCampaignData(minireel) {
                            return deepExtend(minireel, {
                                campaignId: campaign.id,
                                categories: campaign.categories,
                                data: {
                                    links: campaign.links,
                                    collateral: {
                                        logo: campaign.logos.square
                                    },
                                    params: {
                                        sponsor: campaign.brand
                                    }
                                }
                            });
                        });
                };

                this.afterModel = function() {
                    this.metaData = {
                        endDate: null,
                        name: null
                    };
                };

                this.enter = function() {
                    return c6State.goTo('MR:New:Campaign.MiniReel', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.EditMiniReel', ['c6State','cinema6',
            function                                          ( c6State , cinema6 ) {
                this.model = function(params) {
                    return cinema6.db.find('experience', params.minireelId);
                };

                this.afterModel = function(miniReel) {
                    var campaign = c6State.get('MR:Campaign').cModel;
                    var item = campaign.miniReels.reduce(function(result, item) {
                        return item.id === miniReel.id ? item : result;
                    }, null);

                    this.metaData = {
                        endDate: item.endDate,
                        name: item.name
                    };
                };

                this.enter = function() {
                    return c6State.goTo('MR:Edit:Campaign.MiniReel', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.MiniReel', ['c6State','MiniReelService',
            function                                      ( c6State , MiniReelService ) {
                this.templateUrl = 'views/minireel/campaigns/campaign/mini_reels/mini_reel.html';
                this.controller = 'CampaignMiniReelController';
                this.controllerAs = 'CampaignMiniReelCtrl';

                this.minireel = null;

                this.beforeModel = function() {
                    this.minireel = this.cParent.cModel;
                };

                this.model = function() {
                    return this.minireel.pojoify();
                };

                this.afterModel = function() {
                    this.metaData = this.cParent.metaData;
                };

                this.updateMiniReel = function() {
                    if (this.minireel.id) {
                        return this.minireel._update(this.cModel).save();
                    } else {
                        return MiniReelService.publish(this.minireel._update(this.cModel));
                    }
                };
            }]);
        }])

        .controller('CampaignMiniReelController', ['$injector','$scope','c6State',
                                                   'MiniReelService','cState',
        function                                  ( $injector , $scope , c6State ,
                                                    MiniReelService , cState ) {
            var CampaignMiniReelCtrl = this,
                CampaignMiniReelsCtrl = $scope.CampaignMiniReelsCtrl,
                CampaignCtrl = $scope.CampaignCtrl;

            var now = new Date().getTime();

            $injector.invoke(WizardController, this);

            this.tabs = [
                {
                    name: 'General',
                    sref: 'MR:Campaign.MiniReel.General'
                },
                {
                    name: 'MiniReel Type',
                    sref: 'MR:Campaign.MiniReel.Type'
                },
                {
                    name: 'Playback Settings',
                    sref: 'MR:Campaign.MiniReel.Playback'
                }
            ];

            this.initWithModel = function(miniReel) {
                miniReel.data.params.sponsor = miniReel.data.params.sponsor ||
                    CampaignCtrl.model.brand;
                this.model = miniReel;
                this.campaignData = cState.metaData;
                // TO DO: add MOAT tracking to Sponsored MiniReels
                // this.enableMoat = !!miniReel.data.moat;
            };

            Object.defineProperties(this, {
                validDate: {
                    get: function() {
                        var endDate = (this.campaignData && this.campaignData.endDate);

                        return (endDate === null) ||
                            (endDate && endDate instanceof Date && endDate > now);
                    }
                }
            });

            this.confirm = function() {
                return cState.updateMiniReel()
                    .then(function(minireel) {
                        return CampaignMiniReelsCtrl.add(minireel, {
                            endDate: CampaignMiniReelCtrl.campaignData.endDate,
                            name: CampaignMiniReelCtrl.campaignData.name
                        });
                    })
                    .then(function(minireel) {
                        return CampaignCtrl.save().then(function() { return minireel; });
                    })
                    .then(function(minireel) {
                        if (cState.cName === 'MR:Edit:Campaign.MiniReel') {
                            return c6State.goTo('MR:Campaign.MiniReels')
                                .then(function() {
                                    return minireel;
                                });
                        }

                        return c6State.goTo('MR:Editor', [minireel], {
                            campaign: CampaignCtrl.model.id
                        }).then(function() {
                            return minireel;
                        });
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.MiniReel.General', ['cinema6','$q',
            function                                                 ( cinema6 , $q ) {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/mini_reels/mini_reel/general.html';
                this.controller = 'GenericController';
                this.controllerAs = 'CampaignMiniReelGeneralCtrl';

                this.model = function() {
                    return $q.all({
                        categories: cinema6.db.findAll('category')
                    });
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.MiniReel.Type', ['c6State',
            function                                              ( c6State ) {
                var MiniReelState = c6State.get('MiniReel');

                this.templateUrl =
                    'views/minireel/campaigns/campaign/mini_reels/mini_reel/type.html';
                this.controller = 'GenericController';
                this.controllerAs = 'CampaignMiniReelTypeCtrl';

                this.model = function() {
                    var modes = MiniReelState.cModel.data.modes;

                    return modes.map(function(mode) {
                        return mode.modes;
                    }).reduce(function(result, modes) {
                        // Flatten modes into a single array (get rid of hierarchy.)
                        return result.concat(modes);
                    }).filter(function(mode) {
                        return !mode.deprecated;
                    });
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.MiniReel.Playback', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/mini_reels/mini_reel/playback.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.Cards', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/cards.html';
                this.controller = 'CampaignCardsController';
                this.controllerAs = 'CampaignCardsCtrl';
            }]);
        }])

        .controller('CampaignCardsController', ['$scope',
        function                               ( $scope ) {
            var CampaignCtrl = $scope.CampaignCtrl,
                campaign = CampaignCtrl.model;

            this.remove = function(card) {
                var items = campaign.cards;
                var cards = items.map(function(data) {
                    return data.item;
                });
                var index = cards.indexOf(card);

                if (index < 0) {
                    return null;
                }

                items.splice(index, 1);
                return card;
            };

            this.add = function(card, data) {
                var items = campaign.cards;
                var cards = items.map(function(data) {
                    return data.item;
                });
                var item = items[cards.indexOf(card)];

                if (item) {
                    extend(item, data);
                    return card;
                }

                items.push(extend({
                    id: card.id,
                    item: card
                }, data));
                return card;
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:NewWildcard', ['MiniReelService','cinema6','c6State',
            function                                ( MiniReelService , cinema6 , c6State ) {
                var CampaignState = c6State.get('MR:Campaign');

                this.model = function(params) {
                    var campaign = CampaignState.cModel,
                        card = cinema6.db.create('card', MiniReelService.createCard(params.type));

                    return deepExtend(card, {
                        id: undefined,
                        campaignId: campaign.id,
                        sponsored: true,
                        collateral: {
                            logo: campaign.logos.square
                        },
                        links: campaign.links,
                        params: {
                            sponsor: campaign.brand,
                            ad: true
                        },
                        campaign: {
                            minViewTime: campaign.minViewTime
                        },
                        data: {
                            autoadvance: false
                        }
                    });
                };

                this.afterModel = function() {
                    this.metaData = {
                        endDate: null,
                        name: null,
                        reportingId: null
                    };
                };

                this.enter = function() {
                    return c6State.goTo('MR:New:Wildcard', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:EditWildcard', ['cinema6','c6State',
            function                                 ( cinema6 , c6State ) {
                this.model = function(params) {
                    return cinema6.db.find('card', params.cardId);
                };

                this.afterModel = function(card) {
                    var campaign = c6State.get('MR:Campaign').cModel;
                    var item = campaign.cards.reduce(function(result, item) {
                        return item.id === card.id ? item : result;
                    }, null);

                    this.metaData = {
                        endDate: item.endDate,
                        name: item.name,
                        reportingId: item.reportingId
                    };
                };

                this.enter = function() {
                    return c6State.goTo('MR:Edit:Wildcard', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/cards/wildcard.html';
                this.controller = 'WildcardController';
                this.controllerAs = 'WildcardCtrl';

                this.card = null;

                this.beforeModel = function() {
                    this.card = this.cParent.cModel;
                };

                this.model = function() {
                    return this.card.pojoify();
                };

                this.afterModel = function() {
                    this.metaData = this.cParent.metaData;
                };

                this.updateCard = function() {
                    return this.card._update(this.cModel).save();
                };
            }]);
        }])

        .controller('WildcardController', ['$injector','$scope','c6State','cState',
        function                          ( $injector , $scope , c6State , cState ) {
            var WildcardCtrl = this,
                AppCtrl = $scope.AppCtrl,
                CampaignCtrl = $scope.CampaignCtrl,
                CampaignCardsCtrl = $scope.CampaignCardsCtrl;

            var now = new Date().getTime();
            var _private = {};

            $injector.invoke(WizardController, this);

            Object.defineProperties(this, {
                validArticleModel: {
                    get: function() {
                        var validSrc = false;
                        if(WildcardCtrl.model.data.src) {
                            validSrc = WildcardCtrl.model.data.src !== '';
                        }
                        return validSrc;
                    }
                },
                validDate: {
                    configurable: true,
                    get: function() {
                        var endDate = this.campaignData.endDate;

                        return (endDate === null) ||
                            (endDate && endDate instanceof Date && endDate > now);
                    }
                },
                validReportingId: {
                    configurable: true,
                    get: function() {
                        var moat = this.enableMoat,
                            hasId = !!this.campaignData.reportingId;

                        return !moat || (moat && hasId);
                    }
                },
                validLogo: {
                    get: function() {
                        var logo = this.model.collateral.logo;

                        return !logo || AppCtrl.validImgSrc.test(logo);
                    }
                },
                validThumb: {
                    get: function() {
                        var thumb = this.model.thumb;

                        return !thumb || AppCtrl.validImgSrc.test(thumb);
                    }
                },
                validImageSrcs: {
                    configurable: true,
                    get: function() {
                        return this.validThumb && this.validLogo;
                    }
                },
                canSave: {
                    get: function() {
                        switch(WildcardCtrl.model.type) {
                        case 'article':
                            return WildcardCtrl.validArticleModel;
                        case 'video':
                            return (WildcardCtrl.placements.length > 0 ||
                                   WildcardCtrl.minireel) &&
                                   WildcardCtrl.validDate &&
                                   WildcardCtrl.validReportingId &&
                                   WildcardCtrl.validImageSrcs;
                        }
                    }
                }
            });

            _private.tabsForCardType = function(type) {
                var copyTab = {
                        name: 'Editorial Content',
                        sref: 'MR:Wildcard.Copy',
                        required: true
                    },
                    videoTab = {
                        name: 'Video Content',
                        sref: 'MR:Wildcard.Video',
                        required: true
                    },
                    surveyTab = {
                        name: 'Survey',
                        sref: 'MR:Wildcard.Survey'
                    },
                    brandingTab = {
                        name: 'Branding',
                        sref: 'MR:Wildcard.Branding'
                    },
                    linksTab = {
                        name: 'Links',
                        sref: 'MR:Wildcard.Links'
                    },
                    advertTab = {
                        name: 'Advertising',
                        sref: 'MR:Wildcard.Advertising'
                    },
                    articleTab = {
                        name: 'Webpage Content',
                        required: true,
                        sref: 'MR:Wildcard.Article'
                    },
                    thumbsTab = {
                        name: 'Thumbnail Content',
                        required: false,
                        sref: 'MR:Wildcard.Thumbs'
                    };
                switch(type) {
                case 'video':
                    return [copyTab, videoTab, surveyTab,
                            brandingTab, linksTab, advertTab];
                case 'article':
                    return [articleTab, thumbsTab];
                }
            };

            this.initWithModel = function(card) {
                card.params.sponsor = card.params.sponsor || CampaignCtrl.model.brand;
                card.params.ad = card.params.ad !== false;
                card.campaign.countUrls = card.campaign.countUrls || [];
                card.campaign.clickUrls = card.campaign.clickUrls || [];
                this.model = card;
                this.campaignData = cState.metaData;
                this.enableMoat = !!card.data.moat;
                this.tabs = _private.tabsForCardType(card.type);
            };

            this.save = function() {
                if (this.enableMoat) {
                    this.model.data.moat = {
                        campaign: CampaignCtrl.model.name,
                        advertiser: this.model.params.sponsor,
                        creative: this.campaignData.reportingId
                    };
                }

                return cState.updateCard().then(function(card) {
                    return CampaignCardsCtrl.add(card, WildcardCtrl.campaignData);
                }).then(function(card) {
                    return c6State.goTo('MR:Campaign.Cards')
                        .then(function() { return card; });
                });
            };

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Article', [function() {
                this.controller = 'WildcardArticleController';
                this.controllerAs = 'wildcardArticleCtrl';
                this.templateUrl = 'views/minireel/campaigns/campaign/cards/wildcard/article.html';

                this.model = function() {
                    return this.cParent.cModel;
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Thumbs', [function() {
                this.controller = 'GenericController';
                this.controllerAs = 'wildcardThumbsCtrl';
                this.templateUrl = 'views/minireel/campaigns/campaign/cards/wildcard/thumbs.html';

                this.model = function() {
                    return this.cParent.cModel;
                };
            }]);
        }])

        .controller('WildcardArticleController', ['$sce', '$scope', 'c6Debounce',
        function                                 ( $sce,   $scope,   c6Debounce ) {
            var self = this;
            var _private = { };
            this.articleUrl = '';
            this.iframeSrc = null;

            this.initWithModel = function(card) {
                if(card.data.src) {
                    self.articleUrl = card.data.src;
                }
                this.model = card;
            };

            this.trustSrc = function(src) {
                return $sce.trustAsResourceUrl(src);
            };

            _private.updateModel = function() {
                var iframeSrc = self.articleUrl;
                self.model.data.src = iframeSrc;
                self.iframeSrc = iframeSrc;
            };

            _private.updateDebounce = c6Debounce(_private.updateModel, 250);

            $scope.$watch(function() {
                return self.articleUrl;
            }, function() {
                if(self.model) {
                    _private.updateDebounce();
                }
            });

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Copy', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/cards/wildcard/copy.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Video', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/cards/wildcard/video.html';
                this.controller = 'WildcardVideoController';
                this.controllerAs = 'WildcardVideoCtrl';

                this.model = function() {
                    return this.cParent.cModel;
                };
            }]);
        }])

        .controller('WildcardVideoController', ['$injector','MiniReelService',
        function                               ( $injector , MiniReelService ) {
            function getJSONProp(json, prop) {
                return (fromJson(json) || {})[prop];
            }

            function setJSONProp(json, prop, value) {
                var proto = {};

                proto[prop] = value;

                return toJson(extend(fromJson(json) || {}, proto));
            }

            $injector.invoke(VideoCardController, this);

            this.autoplayOptions = {
                'Use MiniReel defaults': null,
                'Yes': true,
                'No': false
            };
            this.autoadvanceOptions = {
                'Yes': true,
                'No': false
            };
            this.adPreviewType = 'vpaid';
            this.adPreviewPageUrl = '';
            Object.defineProperties(this, {
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
                },
                canSkip: {
                    get: function() {
                        return this.model.data.skip === 'anytime';
                    },
                    set: function(bool) {
                        this.model.data.skip = bool ? 'anytime' : 'delay';
                    }
                },
                mustWatchInEntirety: {
                    get: function() {
                        return this.model.data.skip === 'never';
                    },
                    set: function(bool) {
                        this.model.data.skip = bool ? 'never' : 'delay';
                    }
                },
                skipTime: {
                    get: function() {
                        return MiniReelService.getSkipValue(this.model.data.skip);
                    },
                    set: function(value) {
                        this.model.data.skip = value;
                    }
                }
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Survey', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/cards/wildcard/survey.html';
                this.controller = 'WildcardSurveyController';
                this.controllerAs = 'WildcardSurveyCtrl';
            }]);
        }])

        .controller('WildcardSurveyController', ['$scope',
        function                                   ( $scope ) {
            var WildcardCtrl = $scope.WildcardCtrl,
                card = WildcardCtrl.model;

            Object.defineProperties(this, {
                hasSurvey: {
                    get: function() {
                        return !!card.data.survey;
                    },
                    set: function(bool) {
                        card.data.survey = !!bool ? {
                            election: null,
                            prompt: null,
                            choices: []
                        } : null;
                    }
                }
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Branding', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/cards/wildcard/branding.html';
                this.controller = 'WildcardBrandingController';
                this.controllerAs = 'WildcardBrandingCtrl';
            }]);
        }])

        .controller('WildcardBrandingController', ['$scope',
        function                                  ( $scope ) {
            var WildcardCtrl = $scope.WildcardCtrl,
                card = WildcardCtrl.model;

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

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Links', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/cards/wildcard/links.html';
                this.controller = 'WildcardLinksController';
                this.controllerAs = 'WildcardLinksCtrl';

                this.model = function() {
                    return this.cParent.cModel.links;
                };
            }]);
        }])

        .controller('WildcardLinksController', ['$scope','$injector',
        function                                  ( $scope , $injector ) {
            $injector.invoke(LinksController, this, {
                $scope: $scope
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Advertising', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/cards/wildcard/advertising.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.Placements', ['c6State',
            function                                        ( c6State ) {
                var CampaignState = c6State.get('MR:Campaign');

                this.templateUrl = 'views/minireel/campaigns/campaign/placements.html';
                this.controller = 'CampaignPlacementsController';
                this.controllerAs = 'CampaignPlacementsCtrl';

                this.model = function() {
                    var campaign = CampaignState.cModel;

                    return campaign.staticCardMap;
                };
            }]);
        }])

        .controller('CampaignPlacementsController', ['$scope','$injector','$window',
                                                     'c6State','cState','MiniReelService',
        function                                    ( $scope , $injector , $window ,
                                                      c6State , cState , MiniReelService ) {
            var CampaignPlacementsCtrl = this,
                CampaignCtrl = $scope.CampaignCtrl;

            function overwrite(array, newArray) {
                array.length = 0;
                array.push.apply(array, newArray);
                return array;
            }

            function find(collection, predicate) {
                return collection.reduce(function(result, item) {
                    return predicate(item) ? item : result;
                }, null);
            }

            function wildcardsOf(minireel) {
                return minireel.data.deck.filter(function(card) {
                    return card.type === 'wildcard';
                });
            }

            function createCardEntries(minireel) {
                return wildcardsOf(minireel).map(function(placeholder) {
                    return {
                        placeholder: placeholder,
                        wildcard: null
                    };
                });
            }

            $injector.invoke(MiniReelSearchController, this, {
                $scope: $scope
            });

            this.initWithModel = function(staticCardMap) {
                this.model = overwrite(staticCardMap, staticCardMap.map(function(entry) {
                    var minireel = entry.minireel,
                        cards = entry.cards;

                    return extend(entry, {
                        cards: createCardEntries(minireel).map(function(entry) {
                            var placeholder = entry.placeholder;

                            return find(cards, function(entry) {
                                return entry.placeholder.id === placeholder.id;
                            }) || entry;
                        })
                    });
                }));
            };

            this.add = function(placement) {
                var exists = this.model.filter(function(existing) {
                    if (placement.minireel.id === existing.minireel.id) {
                        /* jshint boss:true */
                        return (existing.cards = placement.cards);
                    }
                    return false;
                }).length;

                return exists ? this.model : this.model.push(placement);
            };

            this.use = function(minireel) {
                return c6State.goTo('MR:Placements.MiniReel', [{
                    minireel: minireel,
                    cards: createCardEntries(minireel)
                }]);
            };

            this.remove = function(minireel) {
                overwrite(this.model, this.model.filter(function(entry) {
                    return entry.minireel !== minireel;
                }));
            };

            this.filledCardsOf = function(entry) {
                return entry.cards.filter(function(item) {
                    return !!item.wildcard;
                });
            };

            this.availableSlotsIn = function(minireel) {
                return wildcardsOf(minireel).length;
            };

            this.isNotAlreadyTargeted = function(minireel) {
                return CampaignPlacementsCtrl.model.map(function(entry) {
                    return entry.minireel;
                }).indexOf(minireel) < 0;
            };

            this.previewUrlOf = function(minireel) {
                if (!minireel) { return; }
                return MiniReelService.previewUrlOf(minireel) +
                    '&campaign=' + CampaignCtrl.model.id;
            };

            $scope.$on('CampaignCtrl:campaignDidSave', function() {
                CampaignPlacementsCtrl.initWithModel(cState.cModel);
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Placements.MiniReel', ['c6State',
            function                                        ( c6State ) {
                var CampaignPlacementsState = c6State.get('MR:Campaign.Placements');

                this.templateUrl = 'views/minireel/campaigns/campaign/placements/mini_reel.html';
                this.controller = 'PlacementsMiniReelController';
                this.controllerAs = 'PlacementsMiniReelCtrl';

                this.serializeParams = function(model) {
                    return {
                        minireelId: model.minireel.id
                    };
                };

                this.model = function(params) {
                    var staticCardMap = CampaignPlacementsState.cModel;

                    return staticCardMap[staticCardMap.map(function(entry) {
                        return entry.minireel.id;
                    }).indexOf(params.minireelId)];
                };
            }]);
        }])

        .controller('PlacementsMiniReelController', ['$scope','c6State',
        function                                    ( $scope , c6State ) {
            var CampaignCtrl = $scope.CampaignCtrl,
                CampaignPlacementsCtrl = $scope.CampaignPlacementsCtrl,
                cards = CampaignCtrl.model.cards;

            this.cardOptions = cards.reduce(function(cardOptions, data) {
                var card = data.item,
                    name = data.name;

                cardOptions[card.title + (name ? ' (' + name + ')' : '')] = card;
                return cardOptions;
            }, { 'None': null });

            this.initWithModel = function(entry) {
                this.model = extend(shallowCopy(entry), {
                    cards: entry.cards.map(function(item) {
                        return shallowCopy(item);
                    })
                });

                this.original = entry;
            };

            this.valid = function() {
                return true;
            };

            this.confirm = function() {
                var isEmpty = this.model.cards.every(function(card) {
                    return !card.wildcard;
                });

                extend(this.original, {
                    cards: this.model.cards
                });

                if (!isEmpty) {
                    CampaignPlacementsCtrl.add(this.original);
                } else {
                    CampaignPlacementsCtrl.remove(this.original.minireel);
                }

                return c6State.goTo('MR:Campaign.Placements');
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaign.MiniReelGroups', ['c6State',
            function                                            ( c6State ) {
                var CampaignState = c6State.get('MR:Campaign');

                this.templateUrl = 'views/minireel/campaigns/campaign/mini_reel_groups.html';
                this.controller = 'CampaignMiniReelGroupsController';
                this.controllerAs = 'CampaignMiniReelGroupsCtrl';

                this.model = function() {
                    return CampaignState.cModel.miniReelGroups;
                };
            }]);
        }])

        .controller('CampaignMiniReelGroupsController', [function() {
            this.add = function(group) {
                if (this.model.indexOf(group) > -1) { return; }

                this.model.push(group);
            };

            this.remove = function(group) {
                this.model.splice(this.model.indexOf(group), 1);
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:NewMiniReelGroup', ['c6State',
            function                                     ( c6State ) {
                var CampaignMiniReelGroupsState = c6State.get('MR:Campaign.MiniReelGroups');

                this.model = function() {
                    var groups = CampaignMiniReelGroupsState.cModel;

                    return {
                        name: 'Group ' + (groups.length + 1),
                        miniReels: [],
                        cards: []
                    };
                };

                this.enter = function() {
                    return c6State.goTo('MR:New:MiniReelGroup', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:EditMiniReelGroup', ['c6State',
            function                                      ( c6State ) {
                var CampaignMiniReelGroupsState = c6State.get('MR:Campaign.MiniReelGroups');

                this.model = function(params) {
                    return CampaignMiniReelGroupsState.cModel[params.index];
                };

                this.enter = function() {
                    return c6State.goTo('MR:Edit:MiniReelGroup', null, null, true);
                };

                this.serializeParams = function(model) {
                    return {
                        index: CampaignMiniReelGroupsState.cModel.indexOf(model)
                    };
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:MiniReelGroup', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/mini_reel_groups/mini_reel_group.html';
                this.controller = 'MiniReelGroupController';
                this.controllerAs = 'MiniReelGroupCtrl';

                this.group = null;

                this.beforeModel = function() {
                    this.group = this.cParent.cModel;
                };

                this.model = function() {
                    return extend(copy(this.group), {
                        miniReels: this.group.miniReels.slice(),
                        cards: this.group.cards.slice()
                    });
                };

                this.updateGroup = function() {
                    return shallowCopy(this.cModel, this.group);
                };
            }]);
        }])

        .controller('MiniReelGroupController', ['$scope','c6State','$injector','cState',
        function                               ( $scope , c6State , $injector , cState ) {
            var CampaignMiniReelGroupsCtrl = $scope.CampaignMiniReelGroupsCtrl;

            $injector.invoke(WizardController, this);

            this.tabs = [
                {
                    name: 'General',
                    sref: 'MR:MiniReelGroup.General'
                },
                {
                    name: 'Cards',
                    sref: 'MR:MiniReelGroup.Cards'
                },
                {
                    name: 'MiniReels',
                    sref: 'MR:MiniReelGroup.MiniReels'
                }
            ];

            this.save = function() {
                CampaignMiniReelGroupsCtrl.add(cState.updateGroup());

                return c6State.goTo('MR:Campaign.MiniReelGroups');
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:MiniReelGroup.General', [function() {
                this.templateUrl = [
                    'views/minireel/campaigns/campaign/',
                    'mini_reel_groups/mini_reel_group/general.html'
                ].join('\n');
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:MiniReelGroup.Cards', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/mini_reel_groups/mini_reel_group/cards.html';
                this.controller = 'MiniReelGroupCardsController';
                this.controllerAs = 'MiniReelGroupCardsCtrl';

                this.model = function() {
                    return this.cParent.cModel.cards;
                };
            }]);
        }])

        .controller('MiniReelGroupCardsController', ['$scope',
        function                                    ( $scope ) {
            var MiniReelGroupCardsCtrl = this,
                CampaignCtrl = $scope.CampaignCtrl,
                campaign = CampaignCtrl.model;

            this.campaignCards = campaign.cards.map(function(data) {
                return data.item;
            });

            this.add = function(card) {
                return this.model.push(card);
            };

            this.remove = function(card) {
                return this.model.splice(this.model.indexOf(card), 1);
            };

            this.isNotBeingTargeted = function(card) {
                return MiniReelGroupCardsCtrl.model.indexOf(card) < 0;
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:MiniReelGroup.MiniReels', [function() {
                this.templateUrl = [
                    'views/minireel/campaigns/campaign/',
                    'mini_reel_groups/mini_reel_group/mini_reels.html'
                ].join('\n');
                this.controller = 'MiniReelGroupMiniReelsController';
                this.controllerAs = 'MiniReelGroupMiniReelsCtrl';

                this.model = function() {
                    return this.cParent.cModel.miniReels;
                };
            }]);
        }])

        .controller('MiniReelGroupMiniReelsController', ['$scope','$injector',
        function                                        ( $scope , $injector ) {
            var MiniReelGroupMiniReelsCtrl = this;

            $injector.invoke(MiniReelSearchController, this, {
                $scope: $scope
            });

            this.add = function(minireel) {
                return this.model.push(minireel);
            };

            this.remove = function(minireel) {
                return this.model.splice(this.model.indexOf(minireel), 1);
            };

            this.isNotBeingTargeted = function(minireel) {
                return MiniReelGroupMiniReelsCtrl.model.indexOf(minireel) < 0;
            };

            this.hasWildcardSlots = function(minireel) {
                return minireel.data.deck.some(function(card) {
                    return card.type === 'wildcard';
                });
            };
        }]);
});
