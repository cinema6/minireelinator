define (['angular','c6_state','./editor','./mixins/MiniReelListController',
'./mixins/WizardController','./mixins/VideoCardController','./mixins/LinksController'],
function( angular , c6State  , editor   , MiniReelListController          ,
WizardController           , VideoCardController          , LinksController          ) {
    'use strict';

    var noop = angular.noop,
        fromJson = angular.fromJson,
        toJson = angular.toJson,
        extend = angular.extend;

    function wrap(text, character) {
        return [character, text, character].join('');
    }

    function positionLabel(card) {
        return 'Before ' + wrap(card.title || card.label, card.title ? '"' : '');
    }

    return angular.module('c6.app.minireel.sponsor', [c6State.name, editor.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Sponsor', [function() {}]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Sponsor.Manager', ['$location','c6State','EditorService',
            function                                    ( $location , c6State , EditorService ) {
                var miniReel = c6State.get('MiniReel');

                this.templateUrl = 'views/minireel/sponsor/manager.html';
                this.controller = 'SponsorManagerController';
                this.controllerAs = 'SponsorManagerCtrl';

                this.queryParams = {
                    filter: '=',
                    page: '=',
                    limit: '='
                };

                this.filter = null;
                this.page = parseInt($location.search().page) || 1;
                this.limit = parseInt($location.search().limit) || 50;

                this.title = function() {
                    return 'Cinema6 Sponsorship Manager';
                };
                this.model = function() {
                    return miniReel.getMiniReelList(this.filter, this.limit, this.page)
                        .ensureResolution();
                };
                this.enter = function() {
                    return EditorService.close();
                };
            }]);
        }])

        .controller('SponsorManagerController', ['$scope','cState','$injector',
        function                                ( $scope , cState , $injector ) {
            $injector.invoke(MiniReelListController, this, {
                $scope: $scope,
                cState: cState
            });

            this.brandedCardCountOf = function(minireel) {
                return minireel.data.deck.filter(function(card) {
                    return card.sponsored;
                }).length;
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorMiniReel', ['cinema6','EditorService',
            function                                    ( cinema6 , EditorService ) {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel.html';
                this.controller = 'SponsorMiniReelController';
                this.controllerAs = 'SponsorMiniReelCtrl';

                this.model = function(params) {
                    return cinema6.db.find('experience', params.minireelId);
                };
                this.afterModel = function(model) {
                    var alreadyOpen = EditorService.state.minireel &&
                        EditorService.state.minireel.id === model.id;

                    if (!alreadyOpen) {
                        EditorService.open(model);
                    }
                };
            }]);
        }])

        .controller('SponsorMiniReelController', ['$scope','EditorService','c6State','c6Computed',
                                                  '$timeout','cState','$injector',
        function                                 ( $scope , EditorService , c6State , c6Computed ,
                                                   $timeout , cState , $injector ) {
            var self = this,
                c = c6Computed($scope);

            function redirectToFirstTab() {
                return $timeout(noop).then(function() {
                    return c6State.goTo(self.tabs[0].sref, null, null, true);
                });
            }

            $injector.invoke(WizardController, this);

            c(this, 'tabs', function() {
                return this.model.data.sponsored ?
                    [
                        {
                            name: 'Branding',
                            sref: 'MR:SponsorMiniReel.Branding',
                            required: true
                        },
                        {
                            name: 'Links',
                            sref: 'MR:SponsorMiniReel.Links',
                            required: true
                        },
                        {
                            name: 'Advertising',
                            sref: 'MR:SponsorMiniReel.Ads',
                            required: true
                        },
                        {
                            name: 'Tracking',
                            sref: 'MR:SponsorMiniReel.Tracking',
                            required: true
                        },
                        {
                            name: 'Cards',
                            sref: 'MR:SponsorMiniReel.Cards',
                            required: false
                        },
                        {
                            name: 'Display Ad Card',
                            sref: 'MR:SponsorMiniReel.DisplayAd',
                            required: false
                        }
                    ] :
                    [
                        {
                            name: 'Cards',
                            sref: 'MR:SponsorMiniReel.Cards',
                            required: false
                        }
                    ];
            }, ['SponsorMiniReelCtrl.model.data.sponsored']);

            this.initWithModel = function() {
                this.model = EditorService.state.minireel;
            };

            this.enableSponsorship = function() {
                this.model.data.sponsored = true;

                return redirectToFirstTab();
            };

            this.disableSponsorship = function() {
                this.model.data.sponsored = false;

                return redirectToFirstTab();
            };

            this.save = function() {
                $scope.$broadcast('SponsorMiniReelCtrl:beforeSave');

                return EditorService.sync()
                    .then(function transition() {
                        return c6State.goTo(cState.cParent.cName);
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorMiniReel.Branding', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel/branding.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorMiniReel.Links', ['EditorService',
            function                                          ( EditorService ) {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel/links.html';
                this.controller = 'SponsorMiniReelLinksController';
                this.controllerAs = 'SponsorMiniReelLinksCtrl';

                this.model = function() {
                    var minireel = EditorService.state.minireel;

                    return minireel.data.links || (minireel.data.links = {});
                };
            }]);
        }])

        .controller('SponsorMiniReelLinksController', ['$scope','$injector',
        function                                      ( $scope , $injector ) {
            var self = this;

            function save() {
                return self.save();
            }

            $injector.invoke(LinksController, this, {
                $scope: $scope
            });

            $scope.$on('SponsorMiniReelCtrl:beforeSave', save);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorMiniReel.Ads', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel/ads.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorMiniReel.Tracking', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel/tracking.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorMiniReel.DisplayAd', ['EditorService',
            function                                              ( EditorService ) {
                this.templateUrl =
                    'views/minireel/sponsor/manager/sponsor_mini_reel/display_ad.html';
                this.controller = 'SponsorMiniReelDisplayAdController';
                this.controllerAs = 'SponsorMiniReelDisplayAdCtrl';

                this.model = function() {
                    return EditorService.state.minireel.data.deck;
                };
            }]);
        }])

        .controller('SponsorMiniReelDisplayAdController', ['MiniReelService',
        function                                          ( MiniReelService ) {
            Object.defineProperties(this, {
                adInserted: {
                    get: function() {
                        return this.model[this.model.length - 2].type === 'displayAd';
                    },
                    set: function(bool) {
                        if (this.adInserted === bool) { return; }

                        if (bool) {
                            this.model.splice(-1, 0, MiniReelService.createCard('displayAd'));
                        } else {
                            this.model.splice(-1, 1);
                        }
                    }
                }
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorMiniReel.Cards', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel/cards.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard', ['MiniReelService','$location','$q','cinema6',
                                                     'EditorService',
            function                                ( MiniReelService , $location , $q , cinema6 ,
                                                      EditorService ) {
                function createCard() {
                    var card = MiniReelService.createCard('video');

                    card.sponsored = true;
                    card.data.autoadvance = false;

                    return $q.when(card);
                }

                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card.html';
                this.controller = 'SponsorCardController';
                this.controllerAs = 'SponsorCardCtrl';

                this.model = function(params) {
                    var minireelId = $location.search().minireel,
                        alreadyOpen = EditorService.state.minireel &&
                            EditorService.state.minireel.id === minireelId;

                    function getCard(minireel) {
                        return $q.when(minireel.data.deck.reduce(function(result, card) {
                            return card.id === params.cardId ? card : result;
                        }));
                    }

                    if (!minireelId) {
                        return createCard();
                    }

                    if (alreadyOpen) {
                        return getCard(EditorService.state.minireel);
                    }

                    EditorService.close();

                    return cinema6.db.find('experience', minireelId)
                        .then(function(minireel) {
                            return getCard(EditorService.open(minireel));
                        });
                };
            }]);
        }])

        .controller('SponsorCardController', ['$scope','$injector','$q','cinema6','EditorService',
                                              'c6State','cState','$location',
        function                             ( $scope , $injector , $q , cinema6 , EditorService ,
                                               c6State , cState , $location ) {
            var SponsorManagerCtrl = $scope.SponsorManagerCtrl,
                self = this;

            $injector.invoke(WizardController, this);

            this.placements = [];

            this.initWithModel = function(model) {
                var minireel = EditorService.state.minireel,
                    cardCount = minireel && minireel.data.deck.length,
                    exclude = (model.sponsored ? [] : [
                        'MR:SponsorCard.Copy',
                        'MR:SponsorCard.Links',
                        'MR:SponsorCard.Ads',
                        'MR:SponsorCard.Tracking',
                        'MR:SponsorCard.Position',
                        'MR:SponsorCard.Placement'
                    ]).concat(cardCount === 1 ? [
                        'MR:SponsorCard.Position'
                    ] : []);

                this.model = model;
                this.minireel = minireel;
                this.tabs = [
                    {
                        name: 'Editorial Content',
                        sref: 'MR:SponsorCard.Copy',
                        required: true
                    },
                    {
                        name: 'Video Content',
                        sref: 'MR:SponsorCard.Video',
                        required: true
                    },
                    {
                        name: 'Branding',
                        sref: 'MR:SponsorCard.Branding',
                        required: true
                    },
                    {
                        name: 'Links',
                        sref: 'MR:SponsorCard.Links',
                        required: false
                    },
                    {
                        name: 'Advertising',
                        sref: 'MR:SponsorCard.Ads',
                        required: true
                    },
                    {
                        name: 'Tracking',
                        sref: 'MR:SponsorCard.Tracking',
                        required: true
                    },
                    this.minireel ? {
                        name: 'Placement',
                        sref: 'MR:SponsorCard.Position',
                        required: false
                    } : {
                        name: 'Placement',
                        sref: 'MR:SponsorCard.Placement',
                        required: true
                    }
                ].filter(function(tab) {
                    return exclude.indexOf(tab.sref) < 0;
                });
            };

            this.place = function(minireel, index) {
                /* jshint boss:true */
                return (this.placements = this.placements.concat([{
                    minireel: minireel,
                    index: index
                }]));
            };

            this.unplace = function(minireel, index) {
                /* jshint boss:true */
                return (this.placements = this.placements.filter(function(placement) {
                    return !(placement.minireel === minireel && placement.index === index);
                }));
            };

            this.save = function() {
                function place() {
                    var card = self.model;

                    return $q.all(self.placements.map(function(placement) {
                        var minireel = placement.minireel;

                        return $q.all({
                            minireel: minireel.id ?
                                cinema6.db.find('experience', minireel.id) : minireel,
                            index: placement.index
                        });
                    })).then(function(placements) {
                        var promise = $q.when(null);

                        placements.forEach(function(placement) {
                            promise = promise.then(function() {
                                var proxy = EditorService.open(placement.minireel);

                                proxy.data.deck.splice(placement.index, 0, card);

                                return EditorService.sync()
                                    .then(function close() {
                                        return EditorService.close();
                                    });
                            });
                        });

                        return promise;
                    }).then(function() {
                        return SponsorManagerCtrl.refetchMiniReels();
                    }).then(function() {
                        return c6State.goTo(cState.cParent.cName);
                    });
                }

                function save() {
                    return cinema6.db.find('experience', self.minireel.id)
                        .then(function close(minireel) {
                            return c6State.goTo('MR:SponsorMiniReel', [minireel]);
                        });
                }

                return (this.minireel ? save() : place());
            };

            $scope.$on('$destroy', function() {
                $location.search('minireel', null);
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard.Copy', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/copy.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard.Video', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/video.html';
                this.controller = 'SponsorCardVideoController';
                this.controllerAs = 'SponsorCardVideoCtrl';

                this.model = function() {
                    return this.cParent.cModel;
                };
            }]);
        }])

        .controller('SponsorCardVideoController', ['$injector',
        function                                  ( $injector ) {
            function getJSONProp(json, prop) {
                return (fromJson(json) || {})[prop];
            }

            function setJSONProp(json, prop, value) {
                var proto = {};

                proto[prop] = value;

                return toJson(extend(fromJson(json) || {}, proto));
            }

            $injector.invoke(VideoCardController, this);

            this.skipOptions = {
                'No, users cannot skip': 'never',
                'Yes, after six seconds': 'delay',
                'Yes, skip at any time': 'anytime'
            };
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
                }
            });
        }])

        .controller('AdPlayerController', ['$scope',
        function                          ( $scope ) {
            var self = this;

            function handlePlayerInit($event, player) {
                player.once('ready', function() {
                    self.player = player;
                });
            }

            this.player = null;

            ['<vast-player>:init', '<vpaid-player>:init'].forEach(function($event) {
                $scope.$on($event, handlePlayerInit);
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard.Branding', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/branding.html';
                this.controller = 'SponsorCardBrandingController';
                this.controllerAs = 'SponsorCardBrandingCtrl';
            }]);
        }])

        .controller('SponsorCardBrandingController', ['$scope',
        function                                     ( $scope ) {
            var SponsorCardCtrl = $scope.SponsorCardCtrl,
                card = SponsorCardCtrl.model;

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
            c6StateProvider.state('MR:SponsorCard.Links', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/links.html';
                this.controller = 'SponsorCardLinksController';
                this.controllerAs = 'SponsorCardLinksCtrl';

                this.model = function() {
                    return this.cParent.cModel.links;
                };
            }]);
        }])

        .controller('SponsorCardLinksController', ['$scope','$injector',
        function                                  ( $scope , $injector ) {
            $injector.invoke(LinksController, this, {
                $scope: $scope
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard.Ads', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/ads.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard.Tracking', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/tracking.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard.Placement', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/placement.html';
                this.controller = 'SponsorCardPlacementController';
                this.controllerAs = 'SponsorCardPlacementCtrl';
            }]);
        }])

        .controller('SponsorCardPlacementController', ['$scope','cinema6','scopePromise',
        function                                      ( $scope , cinema6 , scopePromise ) {
            var PortalCtrl = $scope.PortalCtrl;

            this.result = null;
            this.query = '';

            this.search = function() {
                return (this.result = scopePromise(cinema6.db.findAll('experience', {
                    org: PortalCtrl.model.org.id,
                    text: this.query
                }))).promise;
            };

            this.isUnsponsored = function(minireel) {
                return !minireel.data.sponsored;
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Placement.MiniReel', ['EditorService',
            function                                       ( EditorService ) {
                this.templateUrl =
                    'views/minireel/sponsor/manager/sponsor_card/placement/mini_reel.html';
                this.controller = 'PlacementMiniReelController';
                this.controllerAs = 'PlacementMiniReelCtrl';

                this.afterModel = function(model) {
                    this.cModel = EditorService.open(model);
                };
            }]);
        }])

        .controller('PlacementMiniReelController', [function() {
            this.initWithModel = function(model) {
                this.model = model;

                this.placement = 0;
                this.placementOptions = model.data.deck.reduce(function(options, card, index) {
                    options[positionLabel(card)] = index;

                    return options;
                }, {});
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Placement.Placements', [function() {
                this.templateUrl =
                    'views/minireel/sponsor/manager/sponsor_card/placement/placements.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Placement.Standalone', [function() {
                this.templateUrl =
                    'views/minireel/sponsor/manager/sponsor_card/placement/standalone.html';
                this.controller = 'PlacementStandaloneController';
                this.controllerAs = 'PlacementStandaloneCtrl';
            }]);
        }])

        .controller('PlacementStandaloneController', ['$scope','MiniReelService','c6State',
        function                                     ( $scope , MiniReelService , c6State ) {
            var SponsorCardCtrl = $scope.SponsorCardCtrl,
                card = SponsorCardCtrl.model;

            this.data = {
                title: card.title,
                mode: 'lightbox'
            };
            Object.defineProperties(this, {
                enableCompanionAd: {
                    get: function() {
                        return this.data.mode === 'lightbox-ads';
                    },
                    set: function(bool) {
                        this.data.mode = 'lightbox' + (bool ? '-ads' : '');
                    }
                }
            });

            this.place = function() {
                var data = this.data;

                return MiniReelService.create()
                    .then(function(minireel) {
                        extend(minireel.data, data);
                        minireel.data.deck = [];

                        return minireel;
                    })
                    .then(function(minireel) {
                        return SponsorCardCtrl.place(minireel, 0);
                    })
                    .then(function() {
                        return c6State.goTo('MR:Placement.Placements');
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:SponsorCard.Position', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card/position.html';
                this.controller = 'SponsorCardPositionController';
                this.controllerAs = 'SponsorCardPositionCtrl';
            }]);
        }])

        .controller('SponsorCardPositionController', ['$scope',
        function                                     ( $scope ) {
            var SponsorCardCtrl = $scope.SponsorCardCtrl;

            this.positionOptions = SponsorCardCtrl.minireel.data.deck
                .filter(function(card) {
                    return card !== SponsorCardCtrl.model;
                })
                .reduce(function(options, card, index) {
                    options[positionLabel(card)] = index;
                    return options;
                }, { 'Removed': -1 });

            Object.defineProperties(this, {
                position: {
                    get: function() {
                        return SponsorCardCtrl.minireel.data.deck.indexOf(SponsorCardCtrl.model);
                    },
                    set: function(index) {
                        var deck = SponsorCardCtrl.minireel.data.deck,
                            card = SponsorCardCtrl.model,
                            removalIndex = deck.indexOf(card);

                        if (removalIndex > -1) {
                            deck.splice(removalIndex, 1);
                        }

                        if (index > -1) {
                            deck.splice(index, 0, card);
                        }
                    }
                }
            });
        }]);
});
