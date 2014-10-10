define (['angular','c6_state','./editor','./mixins/MiniReelListController',
'./mixins/WizardController'],
function( angular , c6State  , editor   , MiniReelListController          ,
WizardController          ) {
    'use strict';

    var noop = angular.noop;

    return angular.module('c6.app.minireel.sponsor', [c6State.name, editor.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Sponsor', [function() {}]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Sponsor.Manager', ['$location','c6State',
            function                                    ( $location , c6State ) {
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
            }]);
        }])

        .controller('SponsorManagerController', ['$scope','cState','$injector',
        function                                ( $scope , cState , $injector ) {
            $injector.invoke(MiniReelListController, this, {
                $scope: $scope,
                cState: cState
            });
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
                    return EditorService.open(model);
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
                            name: 'End-Cap',
                            sref: 'MR:SponsorMiniReel.Endcap',
                            required: false
                        }
                    ] :
                    [
                        {
                            name: 'Sponsored Cards',
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

                this.model.data.deck.forEach(function(card) {
                    card.disabled = !!card.sponsored;
                });

                return redirectToFirstTab();
            };

            this.disableSponsorship = function() {
                this.model.data.sponsored = false;

                this.model.data.deck.forEach(function(card) {
                    card.disabled = card.sponsored ? false : card.disabled;
                });

                return redirectToFirstTab();
            };

            this.save = function() {
                $scope.$broadcast('SponsorMiniReelCtrl:beforeSave');

                return EditorService.sync()
                    .then(function transition() {
                        return c6State.goTo(cState.cParent.cName);
                    });
            };

            $scope.$on('$destroy', function() {
                EditorService.close();
            });
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
                    var links = EditorService.state.minireel.data.links || {};

                    return ['Action', 'Website', 'Facebook', 'Twitter', 'Pinterest']
                        .concat(Object.keys(links))
                        .filter(function(name, index, names) {
                            return names.indexOf(name) === index;
                        })
                        .map(function(name) {
                            var href = links[name] || null;

                            return {
                                name: name,
                                href: href
                            };
                        });
                };
            }]);
        }])

        .controller('SponsorMiniReelLinksController', ['$scope',
        function                                      ( $scope ) {
            var self = this,
                SponsorMiniReelCtrl = $scope.SponsorMiniReelCtrl;

            function Link() {
                this.name = 'Untitled';
                this.href = null;
            }

            function save() {
                return self.save();
            }

            this.newLink = new Link();

            this.save = function() {
                /* jshint boss:true */
                return (SponsorMiniReelCtrl.model.data.links =
                    this.model.reduce(function(links, link) {
                        if (link.href) {
                            links[link.name] = link.href;
                        }

                        return links;
                    }, {}));
            };

            this.push = function() {
                this.model = this.model.concat([this.newLink]);

                /* jshint boss:true */
                return (this.newLink = new Link());
            };

            this.remove = function(link) {
                /* jshint boss:true */
                return (this.model = this.model.filter(function(item) {
                    return item !== link;
                }));
            };

            ['$destroy', 'SponsorMiniReelCtrl:beforeSave'].forEach(function($event) {
                $scope.$on($event, save);
            });
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
            c6StateProvider.state('MR:SponsorMiniReel.Endcap', ['EditorService',
            function                                           ( EditorService ) {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel/endcap.html';
                this.controller = 'SponsorMiniReelEndcapController';
                this.controllerAs = 'SponsorMiniReelEndcapCtrl';

                this.model = function() {
                    var deck = EditorService.state.minireel.data.deck;

                    return deck[deck.length - 1];
                };
            }]);
        }])

        .controller('SponsorMiniReelEndcapController', ['MiniReelService',
        function                                       ( MiniReelService ) {
            Object.defineProperties(this, {
                cardType: {
                    get: function() {
                        return this.model.type;
                    },
                    set: function(type) {
                        return MiniReelService.setCardType(this.model, type);
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
            c6StateProvider.state('MR:SponsorCard', ['MiniReelService',
            function                                ( MiniReelService ) {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_card.html';
                this.controller = 'SponsorCardController';
                this.controllerAs = 'SponsorCardCtrl';

                this.model = function() {
                    var card = MiniReelService.createCard('video');

                    card.sponsored = true;

                    return card;
                };
            }]);
        }])

        .controller('SponsorCardController', ['$injector',
        function                             ( $injector ) {
            $injector.invoke(WizardController, this);

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
                {
                    name: 'Placement',
                    sref: 'MR:SponsorCard.Placement',
                    required: true
                }
            ];
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
            }]);
        }]);
});
