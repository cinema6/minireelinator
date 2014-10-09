define (['angular','c6_state','./editor','./mixins/MiniReelListController'],
function( angular , c6State  , editor   , MiniReelListController          ) {
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
                                                  '$timeout','cState',
        function                                 ( $scope , EditorService , c6State , c6Computed ,
                                                   $timeout , cState ) {
            var self = this,
                c = c6Computed($scope);

            function redirectToFirstTab() {
                return $timeout(noop).then(function() {
                    return c6State.goTo(self.tabs[0].sref, null, null, true);
                });
            }

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
            Object.defineProperties(this, {
                currentTab: {
                    get: function() {
                        return this.tabs[this.tabs.map(function(tab) {
                            return tab.sref;
                        }).indexOf(c6State.current)] || null;
                    }
                }
            });

            this.initWithModel = function() {
                this.model = EditorService.state.minireel;

                redirectToFirstTab();
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
            c6StateProvider.state('MR:SponsorMiniReel.Cards', [function() {
                this.templateUrl = 'views/minireel/sponsor/manager/sponsor_mini_reel/cards.html';
            }]);
        }]);
});
