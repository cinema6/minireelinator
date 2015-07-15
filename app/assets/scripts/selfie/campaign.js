define( ['angular','c6_state','../minireel/mixins/PaginatedListState',
         '../minireel/mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState                    ,
          PaginatedListController                    ) {
    /* jshint -W106 */
    'use strict';

    var copy = angular.copy,
        extend = angular.extend,
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
                    // TODO: query by type also
                    return paginatedDbList('selfieCampaign', {
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

                    return cinema6.db.create('selfieCampaign', {
                            name: null,
                            // accountName: user.org.name,
                            categories: [],
                            cards: [],
                            pricing: {}
                        });
                };

                this.afterModel = function() {
                    var user = SelfieState.cModel,
                        advertiser = user.advertiser,
                        card = cinema6.db.create('card', MiniReelService.createCard('video'));

                    // TODO: what values should MOAT use?
                    // How does thumbnail work??
                    // Where does 'note' go??

                    this.card = deepExtend(card, {
                            id: undefined,
                            campaignId: undefined,
                            campaign: {
                                minViewTime: 3
                            },
                            sponsored: true,
                            collateral: {
                                logo: advertiser.defaultLogos && advertiser.defaultLogos.square ?
                                    advertiser.defaultLogos.square :
                                    null
                            },
                            links: advertiser.defaultLinks || {},
                            params: {
                                sponsor: advertiser.name,
                                ad: true,
                                action: null
                            },
                            data: {
                                autoadvance: false,
                                controls: false,
                                autoplay: true,
                                skip: 30
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
                    return cinema6.db.find('selfieCampaign', params.campaignId);
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

            function addCardToCampaign(card) {
                SelfieCampaignCtrl.campaign.cards = [{
                    id: card.id
                }];

                return card;
            }

            function saveCampaign() {
                return SelfieCampaignCtrl.campaign.save();
            }

            function updateCard() {
                return cState.updateCard();
            }

            function addCampaignToCard(campaign) {
                SelfieCampaignCtrl.card.campaignId = campaign.id;
                // SelfieCampaignCtrl.card.campaign.campaignId = campaign.id;

                return campaign;
            }

            function setMoatValues(campaign) {
                SelfieCampaignCtrl.card.data.moat = {
                    campaign: campaign.name,
                    advertiser: SelfieCampaignCtrl.card.params.sponsor,
                    creative: campaign.name
                };

                return campaign;
            }

            function returnToDashboard() {
                return c6State.goTo('Selfie:CampaignDashboard');
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
                    return cState.updateCard()
                        .then(saveCampaign)
                        .then(returnToDashboard)
                        .catch(handleError);
                } else {
                    return saveCampaign()
                        .then(addCampaignToCard)
                        .then(setMoatValues)
                        .then(updateCard)
                        .then(addCardToCampaign)
                        .then(saveCampaign)
                        .then(returnToDashboard)
                        .catch(handleError);
                }
            };
        }])

        .controller('SelfieCampaignSponsorController', ['$scope', function($scope) {
            var SelfieCampaignSponsorCtrl = this,
                AppCtrl = $scope.AppCtrl,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                card = SelfieCampaignCtrl.card;

            Object.defineProperties(this, {
                validLogo: {
                    get: function() {
                        var logo = card && card.collateral &&
                            card.collateral.logo;

                        return !logo || AppCtrl.validImgSrc.test(logo);
                    }
                }
            });

            this.links = ['Website','Facebook','Twitter','Pinterest','YouTube','Instagram']
                .map(function(name) {
                    var href = card.links[name] || null,
                        cssClass = name.toLowerCase();

                    return {
                        cssClass: /website/.test(cssClass) ? 'link' : cssClass,
                        name: name,
                        href: href
                    };
                });

            this.updateLinks = function() {
                SelfieCampaignSponsorCtrl.links.forEach(function(link) {
                    if (link.href) {
                        card.links[link.name] = link.href;
                    }
                });
            };

            $scope.$on('SelfieCampaignWillSave', this.updateLinks);
        }])

        .controller('SelfieCampaignVideoController', ['$injector','$scope','SelfieVideoService',
                                                      'c6Debounce','VideoThumbnailService',
                                                      'YouTubeDataService','FileService',
                                                      'CollateralService',
        function                                     ( $injector , $scope , SelfieVideoService ,
                                                       c6Debounce , VideoThumbnailService ,
                                                       YouTubeDataService , FileService ,
                                                       CollateralService ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignVideoCtrl = this,
                card = SelfieCampaignCtrl.card,
                service = card.data.service,
                id = card.data.videoid;

            this.useDefaultThumb = !card.thumb;
            this.customThumbSrc = card.thumb;
            this.videoUrl = SelfieVideoService.urlFromData(service, id);
            this.disableTrimmer = function() { return true; };

            this.updateThumbs = function() {
                card.thumb = !this.useDefaultThumb ?
                    SelfieCampaignVideoCtrl.customThumbSrc :
                    null;
            };

            this.updateUrl = c6Debounce(function() {
                SelfieVideoService.dataFromUrl(SelfieCampaignVideoCtrl.videoUrl)
                    .then(function(data) {
                        card.data.service = data.service;
                        card.data.videoid = data.id;
                    });
            }, 1000);

            $scope.$watch(function() {
                return SelfieCampaignVideoCtrl.useDefaultThumb;
            }, function(useDefault) {
                if (useDefault) {
                    card.thumb = null;
                }
            });

            $scope.$watch(function() {
                return SelfieCampaignVideoCtrl.customThumbFile;
            }, function(newFile, oldFile) {
                var file;

                if (!newFile) { return; }
                file = FileService.open(newFile);

                // SelfieCampaignVideoCtrl.customThumbSrc = file.url;
                // SelfieCampaignVideoCtrl.useDefaultThumb = false;

                CollateralService.uploadFromFile(newFile)
                    .then(function(path) {
                        SelfieCampaignVideoCtrl.customThumbSrc = '/' + path;
                        SelfieCampaignVideoCtrl.useDefaultThumb = false;
                        card.thumb = '/' + path;
                    });

                if (!oldFile) { return; }

                FileService.open(oldFile).close();
            });

            $scope.$watch(function() {
                return card.data.service + ':' + card.data.videoid;
            }, function(newParams) {
                if (!newParams) { return; }

                var params = newParams.split(':'),
                    service = params[0],
                    videoid = params[1];

                if (service === 'adUnit') {
                    SelfieCampaignVideoCtrl.useDefaultThumb = false;
                    SelfieCampaignVideoCtrl.defaultThumb = null;
                } else {
                    VideoThumbnailService.getThumbsFor(service, videoid)
                        .ensureFulfillment()
                        .then(function(thumbs) {
                            SelfieCampaignVideoCtrl.defaultThumb = thumbs.large;
                            SelfieCampaignVideoCtrl.useDefaultThumb = !card.thumb;
                        });

                    if (service === 'youtube') {
                        YouTubeDataService.videos.list({
                            part: ['snippet','statistics','contentDetails'],
                            id: videoid
                        }).then(function(video) {
                            SelfieCampaignVideoCtrl.video = {
                                title: video.snippet.title,
                                duration: video.contentDetails.duration,
                                views: video.statistics.viewCount
                            };
                            card.title = video.snippet.title;
                        });
                    }
                }
            });

            $scope.$on('SelfieCampaignWillSave', this.upadteThumbs);

        }])

        .controller('SelfieCampaignTextController', ['$scope',
        function                                    ( $scope ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignTextCtrl = this,
                card = SelfieCampaignCtrl.card;

            function updateActionLink() {
                var type = SelfieCampaignTextCtrl.actionType.type;

                card.params.action = card.links.Action && type !== 'none' ? {
                    type: type,
                    label: card.params.action.label
                } : null;
            }

            card.params.action = card.params.action || {
                type: 'button',
                label: ''
            };

            this.actionTypeOptions = ['None','Button', 'Link']
                .map(function(option) {
                    return {
                        name: option,
                        type: option === 'Link' ? 'text' : option.toLowerCase()
                    };
                });

            this.actionType = this.actionTypeOptions
                .filter(function(option) {
                    return option.type === card.params.action.type;
                })[0];

            $scope.$on('SelfieCampaignWillSave', updateActionLink);

            $scope.$watch(function() {
                var label = card.params.action && card.params.action.label;

                return label + ':' + SelfieCampaignTextCtrl.actionType.type;
            }, function(newParams, oldParams) {
                if (newParams === oldParams) { return; }
            });

        }])

        .controller('SelfieCampaignPreviewController', ['$scope','cinema6','MiniReelService',
                                                        'c6BrowserInfo','c6Debounce',
        function                                       ( $scope , cinema6 , MiniReelService ,
                                                         c6BrowserInfo , c6Debounce ) {
            var SelfieCampaignPreviewCtrl = this,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl;

            var experience = cinema6.db.create('experience', {
                type: 'minireel',
                appUri: 'mini-reel-player',
                org: 'o-123',
                data: {
                    title: null,
                    mode: 'light',
                    autoplay: false,
                    autoadvance: false,
                    sponsored: false,
                    splash: {
                        source: 'generated',
                        ratio: '6-5',
                        theme: 'horizontal-stack'
                    },
                    adConfig: {
                        video: {
                            firstPlacement: -1,
                            frequency: 0
                        },
                        display: {}
                    },
                    collateral: {
                        splash: null
                    },
                    campaign: {},
                    params: {},
                    links: {},
                    deck: []
                }
            });
            experience.id = 'e-123';

            this.device = 'desktop';
            this.card = null;
            this.profile = copy(c6BrowserInfo.profile);
            this.active = true;
            this.loadPreview = c6Debounce(function() {
                var card = SelfieCampaignCtrl.card;

                MiniReelService.convertCardForPlayer(card)
                    .then(function(cardForPlayer) {
                        var newExperience = copy(experience);

                        cardForPlayer.data.autoplay = false;
                        cardForPlayer.data.skip = true;
                        cardForPlayer.data.controls = true;

                        newExperience.data.deck = [cardForPlayer];

                        SelfieCampaignPreviewCtrl.card = cardForPlayer;
                        SelfieCampaignPreviewCtrl.experience = newExperience;
                    });

            }, 1000);

            $scope.$watch(function() {
                return SelfieCampaignPreviewCtrl.device;
            }, function(device) {
                var profile = SelfieCampaignPreviewCtrl.profile;

                if (device === profile.device) { return; }

                SelfieCampaignPreviewCtrl.profile = extend(copy(profile), {
                    device: device,
                    flash: device !== 'phone'
                });
            });

            $scope.$watchCollection(function() {
                return SelfieCampaignCtrl.card.links;
            }, SelfieCampaignPreviewCtrl.loadPreview);

            $scope.$watchCollection(function() {
                var card = SelfieCampaignCtrl.card,
                    data = card.data,
                    params = card.params,
                    label = params.action && params.action.label;

                return [
                    card.title,
                    card.note,
                    card.thumb,
                    label,
                    params.sponsor,
                    data.videoid,
                    data.service
                ];
            }, SelfieCampaignPreviewCtrl.loadPreview);
        }]);
});
