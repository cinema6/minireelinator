(function(window$){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.mrmaker', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide',
        function( $provide ) {
            var config = {
                modernizr: 'Modernizr',
                gsap: [
                    'TimelineLite',
                    'TimelineMax',
                    'TweenLite',
                    'TweenMax',
                    'Back',
                    'Bounce',
                    'Circ',
                    'Cubic',
                    'Ease',
                    'EaseLookup',
                    'Elastic',
                    'Expo',
                    'Linear',
                    'Power0',
                    'Power1',
                    'Power2',
                    'Power3',
                    'Power4',
                    'Quad',
                    'Quart',
                    'Quint',
                    'RoughEase',
                    'Sine',
                    'SlowMo',
                    'SteppedEase',
                    'Strong'
                ],
                googleAnalytics: 'ga',
                crypto: 'CryptoJS'
            };

            angular.forEach(config, function(value, key) {
                if (angular.isString(value)) {
                    $provide.value(key, window[value]);
                } else if (angular.isArray(value)) {
                    $provide.factory(key, function() {
                        var service = {};

                        angular.forEach(value, function(global) {
                            service[global] = window[global];
                        });

                        return service;
                    });
                }
            });
        }])

        .config(['$sceDelegateProvider',
        function( $sceDelegateProvider ) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                '*://www.youtube.com/**',
                '*://player.vimeo.com/**',
                '*://www.dailymotion.com/**'
            ]);
        }])

        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,'default');
            c6UrlMakerProvider.location(c6Defines.kVideoUrls[(function() {
                return 'local';
            }())] ,'video');
        }])

        .config(['cinema6Provider','c6UrlMakerProvider',
        function( cinema6Provider , c6UrlMakerProvider ) {
            var FixtureAdapter = cinema6Provider.adapters.fixture;

            FixtureAdapter.config = {
                jsonSrc: c6UrlMakerProvider.makeUrl('mock/fixtures.json')
            };

            cinema6Provider.useAdapter(FixtureAdapter);
        }])

        .config(['c6StateProvider','c6UrlMakerProvider',
        function( c6StateProvider , c6UrlMakerProvider ) {
            var assets = c6UrlMakerProvider.makeUrl.bind(c6UrlMakerProvider);

            c6StateProvider
                .state('manager', {
                    controller: 'ManagerController',
                    controllerAs: 'ManagerCtrl',
                    templateUrl: assets('views/manager.html'),
                    model:  ['cinema6',
                    function( cinema6 ) {
                        return cinema6.db.findAll('currentUser')
                            .then(function(currentUsers) {
                                var user = currentUsers[0];

                                return cinema6.db.findAll('experience', { appUri: 'rumble', org: user.org });
                            });
                    }]
                })
                .state('editor', {
                    controller: 'EditorController',
                    controllerAs: 'EditorCtrl',
                    templateUrl: assets('views/editor.html'),
                    model:  ['cinema6','c6StateParams','MiniReelService',
                    function( cinema6 , c6StateParams , MiniReelService ) {
                        return MiniReelService.open(c6StateParams.id);
                    }],
                    children: {
                        editCard: {
                            controller: 'EditCardController',
                            controllerAs: 'EditCardCtrl',
                            templateUrl: assets('views/editor/edit_card.html'),
                            model:  ['c6StateParams','MiniReelService',
                            function( c6StateParams , MiniReelService ) {
                                var minireel = this.cParent.cModel;

                                return MiniReelService.findCard(
                                    minireel.data.deck,
                                    c6StateParams.id
                                );
                            }]
                        },
                        newCard: {
                            templateUrl: assets('views/editor/new_card.html'),
                            model:  ['MiniReelService',
                            function( MiniReelService ) {
                                return MiniReelService.createCard();
                            }],
                            children: {
                                type: {
                                    controller: 'NewCardTypeController',
                                    controllerAs: 'NewCardTypeCtrl',
                                    templateUrl: assets('views/editor/new_card/type.html'),
                                    model: [function() {
                                        return this.cParent.cModel;
                                    }]
                                },
                                edit: {
                                    controller: 'NewCardEditController',
                                    controllerAs: 'NewCardEditCtrl',
                                    templateUrl: assets('views/editor/new_card/edit.html'),
                                    model:  ['c6StateParams','MiniReelService',
                                    function( c6StateParams , MiniReelService ) {
                                        var card = this.cParent.cModel;

                                        return MiniReelService.setCardType(card, c6StateParams.type);
                                    }]
                                }
                            }
                        }
                    }
                })
                .index('manager');
        }])

        .controller('AppController', ['$scope', '$log', 'cinema6', 'gsap',
        function                     ( $scope ,  $log ,  cinema6 ,  gsap ) {
            var self = this;

            $log.info('AppCtlr loaded.');

            cinema6.init({
                setup: function(appData) {
                    self.experience = appData.experience;
                    self.profile = appData.profile;

                    gsap.TweenLite.ticker.useRAF(self.profile.raf);
                }
            });

            $scope.AppCtrl = this;
        }]);
}(window));
