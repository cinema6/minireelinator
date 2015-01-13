define (['angular','c6_state','./mixins/PaginatedListState','./mixins/PaginatedListController',
         './mixins/WizardController','./mixins/VideoCardController','./mixins/LinksController'],
function( angular , c6State  , PaginatedListState          , PaginatedListController          ,
          WizardController          , VideoCardController          , LinksController          ) {
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
                            targetMiniReels: [],
                            staticCardMap: []
                        }),
                        customers: cinema6.db.findAll('customer')
                    });
                };
            }]);
        }])

        .controller('CampaignsNewController', ['$scope','c6State','c6Computed',
        function                              ( $scope , c6State , c6Computed ) {
            var c = c6Computed($scope);

            function optionsByName(items) {
                return items.reduce(function(result, item) {
                    result[item.name] = item;
                    return result;
                }, { None: null });
            }

            c(this, 'advertiserOptions', function() {
                var customer = this.model.customer;

                return optionsByName(customer && customer.advertisers || []);
            }, ['CampaignsNewCtrl.model.customer']);

            this.initWithModel = function(model) {
                this.model = model.campaign;
                this.customers = model.customers;

                this.customerOptions = optionsByName(this.customers);
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

            this.add = function(item) {
                var collection = [
                    {
                        matcher: (/^e-/),
                        value: campaign.miniReels
                    },
                    {
                        matcher: (/^rc-/),
                        value: campaign.cards
                    }
                ].reduce(function(value, collection) {
                    return collection.matcher.test(item.id) ? collection.value : value;
                }, null);

                if (collection.indexOf(item) > -1) { return item; }

                return collection[collection.push(item) - 1];
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
                            return deepExtend(minireel, {
                                campaignId: campaign.id,
                                categoryList: campaign.categories,
                                data: {
                                    links: campaign.links,
                                    collateral: {
                                        logo: campaign.logos.square
                                    },
                                    params: {
                                        sponsor: campaign.advertiser.name
                                    }
                                }
                            });
                        });
                };
            }]);
        }])

        .controller('CreativesNewMiniReelController', ['$injector','$scope','c6State',
        function                                      ( $injector , $scope , c6State ) {
            var CampaignCreativesCtrl = $scope.CampaignCreativesCtrl,
                CampaignCtrl = $scope.CampaignCtrl;

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

            this.confirm = function() {
                return this.model.save()
                    .then(function(minireel) {
                        return CampaignCreativesCtrl.add(minireel);
                    })
                    .then(function(minireel) {
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
            c6StateProvider.state('MR:Creatives.NewMiniReel.Type', ['c6State',
            function                                               ( c6State ) {
                var MiniReelState = c6State.get('MiniReel');

                this.templateUrl =
                    'views/minireel/campaigns/campaign/creatives/new_mini_reel/type.html';
                this.controller = 'GenericController';
                this.controllerAs = 'CreativesNewMiniReelTypeCtrl';

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
            c6StateProvider.state('MR:Creatives.NewMiniReel.Playback', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/creatives/new_mini_reel/playback.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:NewWildcard', ['MiniReelService','cinema6','c6State',
            function                                ( MiniReelService , cinema6 , c6State ) {
                var CampaignState = c6State.get('MR:Campaign');

                this.model = function() {
                    var campaign = CampaignState.cModel,
                        card = cinema6.db.create('card', MiniReelService.createCard('videoBallot'));

                    return deepExtend(card, {
                        id: undefined,
                        campaignId: campaign.id,
                        sponsored: true,
                        collateral: {
                            logo: campaign.logos.square
                        },
                        links: campaign.links,
                        params: {
                            sponsor: campaign.advertiser.name
                        },
                        campaign: {
                            minViewTime: campaign.minViewTime
                        },
                        data: {
                            autoadvance: false
                        }
                    });
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

                this.enter = function() {
                    return c6State.goTo('MR:Edit:Wildcard', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/creatives/wildcard.html';
                this.controller = 'WildcardController';
                this.controllerAs = 'WildcardCtrl';

                this.model = function() {
                    return this.cParent.cModel;
                };
            }]);
        }])

        .controller('WildcardController', ['$injector','$scope','c6State',
        function                          ( $injector , $scope , c6State ) {
            var CampaignCreativesCtrl = $scope.CampaignCreativesCtrl;

            $injector.invoke(WizardController, this);

            this.tabs = [
                {
                    name: 'Editorial Content',
                    sref: 'MR:Wildcard.Copy',
                    required: true
                },
                {
                    name: 'Video Content',
                    sref: 'MR:Wildcard.Video',
                    required: true
                },
                {
                    name: 'Survey',
                    sref: 'MR:Wildcard.Survey'
                },
                {
                    name: 'Branding',
                    sref: 'MR:Wildcard.Branding'
                },
                {
                    name: 'Links',
                    sref: 'MR:Wildcard.Links'
                },
                {
                    name: 'Advertising',
                    sref: 'MR:Wildcard.Advertising'
                }
            ];

            this.save = function() {
                var card = this.model;

                return this.model.save().then(function() {
                    return CampaignCreativesCtrl.add(card);
                }).then(function() {
                    return c6State.goTo('MR:Campaign.Creatives');
                }).then(function() {
                    return card;
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Copy', [function() {
                this.templateUrl = 'views/minireel/campaigns/campaign/creatives/wildcard/copy.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Wildcard.Video', [function() {
                this.templateUrl =
                    'views/minireel/campaigns/campaign/creatives/wildcard/video.html';
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
                        return MiniReelService.convertCard(this.model).data.skip;
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
                    'views/minireel/campaigns/campaign/creatives/wildcard/survey.html';
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
                    'views/minireel/campaigns/campaign/creatives/wildcard/branding.html';
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
                    'views/minireel/campaigns/campaign/creatives/wildcard/links.html';
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
                    'views/minireel/campaigns/campaign/creatives/wildcard/advertising.html';
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

        .controller('CampaignPlacementsController', ['$scope','scopePromise','cinema6','c6State',
        function                                    ( $scope , scopePromise , cinema6 , c6State ) {
            var CampaignPlacementsCtrl = this,
                PortalCtrl = $scope.PortalCtrl;

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

            function createCardEntries(minireel) {
                return minireel.data.deck.filter(function(card) {
                    return card.type === 'wildcard';
                }).map(function(placeholder) {
                    return {
                        placeholder: placeholder,
                        wildcard: null
                    };
                });
            }

            this.result = null;
            this.query = '';

            this.initWithModel = function(staticCardMap) {
                this.model = overwrite(staticCardMap, staticCardMap.map(function(entry) {
                    var minireel = entry.minireel,
                        cards = entry.cards;

                    return extend(entry, {
                        cards: createCardEntries(minireel).map(function(entry) {
                            var placeholder = entry.placeholder;

                            return find(cards, function(entry) {
                                return entry.placeholder === placeholder;
                            }) || entry;
                        })
                    });
                }));
            };

            this.search = function() {
                return (this.result = scopePromise(cinema6.db.findAll('experience', {
                    org: PortalCtrl.model.org.id,
                    text: this.query
                }))).promise;
            };

            this.add = function(minireel) {
                return c6State.goTo('MR:Placements.MiniReel', [
                    this.model[this.model.push({
                        minireel: minireel,
                        cards: createCardEntries(minireel)
                    }) - 1]
                ]);
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

            this.isNotAlreadyTargeted = function(minireel) {
                return CampaignPlacementsCtrl.model.map(function(entry) {
                    return entry.minireel;
                }).indexOf(minireel) < 0;
            };
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
                cards = CampaignCtrl.model.cards;

            this.cardOptions = cards.reduce(function(cardOptions, card) {
                cardOptions[card.title] = card;
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

            this.confirm = function() {
                extend(this.original, {
                    cards: this.model.cards
                });

                return c6State.goTo('MR:Campaign.Placements');
            };
        }]);
});
