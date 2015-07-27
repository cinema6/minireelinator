define( ['angular','c6_state','../minireel/mixins/PaginatedListState',
         '../minireel/mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState                    ,
          PaginatedListController                    ) {
    /* jshint -W106 */
    'use strict';

    var copy = angular.copy,
        equals = angular.equals,
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
                    // var user = SelfieState.cModel;

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
                    this.card = this.cParent.card;
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
                                                 'c6Debounce',
        function                                ( $scope , $log , c6State , c6Computed , cState ,
                                                  c6Debounce ) {

            var SelfieCampaignCtrl = this;

            function addCardToCampaign(card) {
                SelfieCampaignCtrl.campaign.cards = [{
                    id: card.id
                }];

                return card;
            }

            function saveCampaign(card) {
                console.log('cState.card: ',card);
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

            // function returnToDashboard() {
            //     return c6State.goTo('Selfie:CampaignDashboard');
            // }

            function handleError(err) {
                $log.error('Could not save the Campaign', err);
            }

            this.initWithModel = function(categories) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = categories;

                this._proxyCard = copy(this.card);
                this._proxyCampaign = copy(this.campaign);
            };

            function updateProxy() {
                console.log('Ctrl.card: ',SelfieCampaignCtrl.card);

                SelfieCampaignCtrl._proxyCard = copy(SelfieCampaignCtrl.card);
                SelfieCampaignCtrl._proxyCampaign = copy(SelfieCampaignCtrl.campaign);
            }

            this.save = function() {
                console.log('saving!');
                $scope.$broadcast('SelfieCampaignWillSave');

                if (SelfieCampaignCtrl.card.id) {
                    return cState.updateCard()
                        .then(saveCampaign)
                        .then(updateProxy)
                        // .then(returnToDashboard)
                        .catch(handleError);
                } else {
                    return saveCampaign()
                        .then(addCampaignToCard)
                        .then(setMoatValues)
                        .then(updateCard)
                        .then(addCardToCampaign)
                        .then(saveCampaign)
                        .then(updateProxy)
                        // .then(returnToDashboard)
                        .catch(handleError);
                }
            };

            this.autoSave = c6Debounce(SelfieCampaignCtrl.save, 5000);

            $scope.$watchCollection(function() {
                var card = SelfieCampaignCtrl.card,
                    campaign = SelfieCampaignCtrl.campaign,
                    data = card.data,
                    params = card.params,
                    label = params.action && params.action.label,
                    actionType = params.action && params.action.type;

                return [
                    card.title,
                    card.note,
                    params.sponsor,
                    label,
                    actionType,
                    card.thumb,
                    card.links, // doesn't work, needs it's own $watcher, also true for Action link!
                    card.collateral.logo,
                    data.videoid,
                    data.service,
                    campaign.name,
                    campaign.categories
                ];
            }, function(params, oldParams) {
                if (params === oldParams) { return; }

                if (SelfieCampaignCtrl.card.data.service && SelfieCampaignCtrl.card.data.videoid) {
                    console.log('loadPreview');
                    $scope.$broadcast('loadPreview');
                }

                console.log('$WATCHER TRIGGERED!', params, oldParams);

                var cardDirty = !equals(SelfieCampaignCtrl.card, SelfieCampaignCtrl._proxyCard);
                var campaignDirty = !equals(SelfieCampaignCtrl.campaign, SelfieCampaignCtrl._proxyCampaign);

                if (cardDirty) {
                    console.log('CARD IS DIRTY!!!!');
                }
                if (campaignDirty) {
                    console.log('CAMPAIGN IS DIRTY!!!!');
                }

                if (cardDirty || campaignDirty) {
                    SelfieCampaignCtrl.autoSave();

                }
            });
        }])

        .controller('SelfieCampaignSponsorController', ['$scope','CollateralService','FileService',
        function                                       ( $scope , CollateralService , FileService ) {
            var SelfieCampaignSponsorCtrl = this,
                AppCtrl = $scope.AppCtrl,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                card = SelfieCampaignCtrl.card;

            // card.collateral.logo = null;

            function idify(name) {
                return name.replace(/\s+/g, '-').toLowerCase();
            }

            this.defaultLogo = card && card.collateral && card.collateral.logo;

            this.logoOptions = ['None','Upload from URL','Upload from File'].reduce(function(result, option) {
                result.push({
                    type: idify(option),
                    label: option
                });
                return result;
            }, this.defaultLogo ?
                [{
                    type: 'use-default',
                    label: 'Use Default'
                }] : []);

            this.logoType = this.logoOptions[0];
            this.logo = this.defaultLogo;
            this.previouslyUploadedLogo = null;

            Object.defineProperties(this, {
                validLogo: {
                    get: function() {
                        return !this.defaultLogo || AppCtrl.validImgSrc.test(this.defaultLogo);
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

            this.uploadFromUri = function(uri) {
                CollateralService.uploadFromUri(uri).then(function(path) {
                    SelfieCampaignSponsorCtrl.logo = '/' + path;
                    SelfieCampaignSponsorCtrl.previouslyUploadedLogo = '/' + path;
                });
            };

            $scope.$watch(function() {
                return SelfieCampaignSponsorCtrl.logoType.type;
            },function(type) {
                if (type === 'use-default') {
                    SelfieCampaignSponsorCtrl.logo = SelfieCampaignSponsorCtrl.defaultLogo;
                }
                if (type === 'upload-from-file' || type === 'upload-from-url') {
                    SelfieCampaignSponsorCtrl.logo = SelfieCampaignSponsorCtrl.previouslyUploadedLogo;
                }
            });

            $scope.$watch(function() {
                return SelfieCampaignSponsorCtrl.logoFile;
            }, function(newFile, oldFile) {
                var file;

                if (!newFile) { return; }
                file = FileService.open(newFile);

                // SelfieCampaignVideoCtrl.customThumbSrc = file.url;
                // SelfieCampaignVideoCtrl.useDefaultThumb = false;

                CollateralService.uploadFromFile(newFile)
                    .then(function(path) {
                        SelfieCampaignSponsorCtrl.logo = '/' + path;
                        SelfieCampaignSponsorCtrl.previouslyUploadedLogo = '/' + path;
                        // card.collateral.logo = '/' + path;
                    });

                if (!oldFile) { return; }

                FileService.open(oldFile).close();
            });

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

                card.links.Action = SelfieCampaignTextCtrl.actionLink;

                card.params.action = SelfieCampaignTextCtrl.actionLink && type !== 'none' ? {
                    type: type,
                    label: SelfieCampaignTextCtrl.actionLabel
                } : null;
            }

            // card.params.action = card.params.action || {
            //     type: 'button',
            //     label: ''
            // };

            this.actionLink = card.links.Action;
            this.actionLabel = (card.params.action && card.params.action.label) || 'Learn More';

            this.actionTypeOptions = ['None','Button', 'Link']
                .map(function(option) {
                    return {
                        name: option,
                        type: option === 'Link' ? 'text' : option.toLowerCase()
                    };
                });

            this.actionType = this.actionTypeOptions
                .filter(function(option) {
                    var type = card.params.action || 'button';

                    return option.type === type;
                })[0];

            $scope.$on('SelfieCampaignWillSave', updateActionLink);

            $scope.$watchCollection(function() {
                return [
                    SelfieCampaignTextCtrl.actionType.type,
                    SelfieCampaignTextCtrl.actionLink,
                    SelfieCampaignTextCtrl.actionLabel
                ];
            }, function(type, oldType) {
                if (type === oldType) { return; }

                console.log('DUUUU');

                updateActionLink();
            });

            // $scope.$watch(function() {
            //     var label = card.params.action && card.params.action.label;

            //     return label + ':' + SelfieCampaignTextCtrl.actionType.type;
            // }, function(newParams, oldParams) {
            //     if (newParams === oldParams) { return; }
            // });

        }])

        .controller('SelfieCampaignTargetingController', ['$scope','GeoService',
        function                                         ( $scope , GeoService ) {
            var SelfieCampaignTargetingCtrl = this,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                campaign = SelfieCampaignCtrl.campaign;

            this.geoOptions = GeoService.usa.map(function(state) {
                return {
                    state: state,
                    country: 'usa'
                };
            });

            this.geo = this.geoOptions.filter(function(option) {
                var state = campaign.geoTargeting && campaign.geoTargeting.state;

                return state === option.state;
            })[0];

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        var categories = campaign.categories.length,
                            multiplier = categories + (this.geo ? 1 : 0),
                            increase = 0.5 * multiplier;

                        return 50 + increase;
                    }
                },
                validBudget: {
                    get: function() {
                        var budget = parseInt(campaign.pricing.budget);

                        return !budget || (budget > 50 && budget < 20000);
                    }
                },
                dailyLimitError: {
                    get: function() {
                        var budget = parseInt(campaign.pricing.budget),
                            max = parseInt(campaign.pricing.dailyLimit);

                        if (max && !budget) {
                            return 'Please enter your Total Budget first';
                        }

                        if (max < budget * 0.015) {
                            return 'Must be greater than 1.5% of the Total Budget';
                        }

                        if (max > budget) {
                            return 'Must be less than Total Budget';
                        }

                        return false;
                    }
                }
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
                console.log('loadpreview!!!!');
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

            // $scope.$watchCollection(function() {
            //     return SelfieCampaignCtrl.card.links;
            // }, SelfieCampaignPreviewCtrl.loadPreview);

            $scope.$on('loadPreview', SelfieCampaignPreviewCtrl.loadPreview);

            // $scope.$watchCollection(function() {
            //     var card = SelfieCampaignCtrl.card,
            //         data = card.data,
            //         params = card.params,
            //         label = params.action && params.action.label;

            //     return [
            //         card.title,
            //         card.note,
            //         card.thumb,
            //         label,
            //         params.sponsor,
            //         data.videoid,
            //         data.service
            //     ];
            // }, SelfieCampaignPreviewCtrl.loadPreview);
        }]);
});
