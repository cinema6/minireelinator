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
                                                  'ConfirmDialogService','LogoService',
        function                                 ( $injector , $scope , $q , cState ,
                                                   ConfirmDialogService , LogoService ) {
            var SelfieCampaignsCtrl = this;

            $injector.invoke(PaginatedListController, this, {
                cState: cState,
                $scope: $scope
            });

            cState.cModel.items.value.forEach(function(campaign) {
                LogoService.registerLogo(campaign, campaign.cards[0].item);
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
                            pricing: {},
                            geoTargeting: []
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
                SelfieCampaignCtrl._proxyCard = copy(SelfieCampaignCtrl.card);
                SelfieCampaignCtrl._proxyCampaign = copy(SelfieCampaignCtrl.campaign);
            }

            function watchForPreview(params, oldParams) {
                if (params === oldParams) { return; }

                var card = SelfieCampaignCtrl.card;

                if (card.data.service && card.data.videoid) {
                    console.log('loadPreview');
                    $scope.$broadcast('loadPreview');
                }

                if (shouldSave()) {
                    SelfieCampaignCtrl.autoSave();
                }
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

            function watchForSaving(params, oldParams) {
                if (params === oldParams) { return; }

                if (shouldSave()) {
                    SelfieCampaignCtrl.autoSave();
                }
            }

            function shouldSave() {
                return !equals(SelfieCampaignCtrl.card, SelfieCampaignCtrl._proxyCard) ||
                    !equals(SelfieCampaignCtrl.campaign, SelfieCampaignCtrl._proxyCampaign);
            }

            // watch for saving only
            $scope.$watchCollection(function() {
                // categroies, geo, budget, limit,
                var campaign = SelfieCampaignCtrl.campaign;

                return [
                    campaign.categories,
                    campaign.geoTargeting,
                    campaign.pricing.budget,
                    campaign.pricing.dailyLimit
                ];
            }, watchForSaving);

            $scope.$watchCollection(function() {
                // watch the Sponsor Links for autosaving and previewing
                return SelfieCampaignCtrl.card.links;
            }, watchForPreview);

            $scope.$watchCollection(function() {
                // watch the necessary card properties
                var campaign = SelfieCampaignCtrl.campaign,
                    card = SelfieCampaignCtrl.card,
                    data = card.data,
                    params = card.params,
                    label = params.action && params.action.label,
                    actionType = params.action && params.action.type;

                return [
                    campaign.name,
                    card.title,
                    card.note,
                    card.thumb,
                    card.collateral.logo,
                    params.sponsor,
                    label,
                    actionType,
                    data.videoid,
                    data.service,
                ];
            }, watchForPreview);
        }])

        .controller('SelfieCampaignSponsorController', ['$scope','CollateralService',
                                                        'FileService','LogoService',
        function                                       ( $scope , CollateralService ,
                                                         FileService , LogoService ) {
            var SelfieCampaignSponsorCtrl = this,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                card = SelfieCampaignCtrl.card;

            function idify(name) {
                return name.replace(/\s+/g, '-').toLowerCase();
            }

            this.defaultLogo = card && card.collateral && card.collateral.logo;

            this.logoOptions = ['None','Upload from URL','Upload from File']
                .reduce(function(result, option) {
                    result.push({
                        type: idify(option),
                        label: option
                    });
                    return result;
                }, this.defaultLogo ?
                [{
                    type: 'use-default',
                    label: 'Use Default',
                    src: this.defaultLogo
                }] : [])
                .concat(LogoService.fetchLogos(SelfieCampaignCtrl.campaign.name)
                    .map(function(logo) {
                        return {
                            type: 'custom',
                            label: logo.name,
                            src: logo.src
                        };
                    }));

            this.logoType = this.logoOptions[0];
            this.logo = this.defaultLogo;
            this.previouslyUploadedLogo = null;

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
                // new logo urls come from various places, sometimes asynchronously
                // so we only want to trigger a real change when we get a new, valid url
                return SelfieCampaignSponsorCtrl.logo;
            }, function(newLogo, oldLogo) {
                if (newLogo === oldLogo) { return; }

                card.collateral.logo = newLogo;
            });

            $scope.$watch(function() {
                // we do very different things depending on what the
                // user chooses from the dropdown
                return SelfieCampaignSponsorCtrl.logoType.type;
            },function(type) {
                var Ctrl = SelfieCampaignSponsorCtrl;

                switch (type) {
                case 'use-default':
                    Ctrl.logo = Ctrl.defaultLogo;
                    break;
                case 'upload-from-file':
                case 'upload-from-url':
                    if (Ctrl.previouslyUploadedLogo) {
                        Ctrl.logo = Ctrl.previouslyUploadedLogo;
                    }
                    break;
                case 'custom':
                    Ctrl.logo = SelfieCampaignSponsorCtrl.logoType.src;
                    break;
                case 'none':
                    Ctrl.logo = null;
                    break;
                }
            });

            $scope.$watch(function() {
                // as soon as someone selects a local file we upload it
                return SelfieCampaignSponsorCtrl.logoFile;
            }, function(newFile, oldFile) {
                var file;

                if (!newFile) { return; }
                file = FileService.open(newFile);

                CollateralService.uploadFromFile(newFile)
                    .then(function(path) {
                        SelfieCampaignSponsorCtrl.logo = '/' + path;
                        SelfieCampaignSponsorCtrl.previouslyUploadedLogo = '/' + path;
                    });

                if (!oldFile) { return; }

                FileService.open(oldFile).close();
            });

            $scope.$on('SelfieCampaignWillSave', this.updateLinks);
        }])

        .controller('SelfieCampaignVideoController', ['$injector','$scope','SelfieVideoService',
                                                      'c6Debounce','VideoThumbnailService',
                                                      'FileService','CollateralService',
        function                                     ( $injector , $scope , SelfieVideoService ,
                                                       c6Debounce , VideoThumbnailService ,
                                                       FileService , CollateralService ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignVideoCtrl = this,
                card = SelfieCampaignCtrl.card,
                service = card.data.service,
                id = card.data.videoid;

            function setDefaultThumbs(service, id) {
                if (service === 'adUnit') {
                    SelfieCampaignVideoCtrl.useDefaultThumb = false;
                    SelfieCampaignVideoCtrl.defaultThumb = null;
                } else {
                    VideoThumbnailService.getThumbsFor(service, id)
                        .ensureFulfillment()
                        .then(function(thumbs) {
                            SelfieCampaignVideoCtrl.defaultThumb = thumbs.large;
                            SelfieCampaignVideoCtrl.useDefaultThumb = !card.thumb;
                        });
                }
            }

            function handleVideoError(err) {
                console.log('ERROR: ', err);
                SelfieCampaignVideoCtrl.videoError = true;
                SelfieCampaignVideoCtrl.video = null;
            }

            this.useDefaultThumb = !card.thumb;
            this.customThumbSrc = card.thumb;
            this.videoUrl = SelfieVideoService.urlFromData(service, id);
            this.disableTrimmer = function() { return true; };

            this.updateThumbs = function() {
                card.thumb = !SelfieCampaignVideoCtrl.useDefaultThumb ?
                    SelfieCampaignVideoCtrl.customThumbSrc :
                    null;
            };

            this.updateUrl = c6Debounce(function(args) {
                var service, id,
                    url = args[0];

                if (!url) {
                    SelfieCampaignVideoCtrl.video = null;
                    return;
                }

                SelfieVideoService.dataFromUrl(url)
                    .then(function(data) {
                        service = data.service;
                        id = data.id;

                        setDefaultThumbs(service, id);

                        return SelfieVideoService.statsFromService(service, id);
                    })
                    .then(function(data) {
                        SelfieCampaignVideoCtrl.videoError = false;
                        SelfieCampaignVideoCtrl.video = data;
                        card.title = card.title || data.title;
                        card.data.service = service;
                        card.data.videoid = id;
                    })
                    .catch(handleVideoError);
            }, 1000);

            $scope.$watch(function() {
                // watch the thumbnail selector button
                return SelfieCampaignVideoCtrl.useDefaultThumb;
            }, function(useDefault) {
                if (useDefault) {
                    card.thumb = null;
                } else {
                    card.thumb = SelfieCampaignVideoCtrl.customThumbSrc;
                }
            });

            $scope.$watch(function() {
                // watch the the File <input> and upload when chosen
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
                // watch the video link/embed/vast tag input
                // and then do all the checking/getting of data
                return SelfieCampaignVideoCtrl.videoUrl;
            }, SelfieCampaignVideoCtrl.updateUrl);

            $scope.$on('SelfieCampaignWillSave', this.updateThumbs);

        }])

        .controller('SelfieCampaignTextController', ['$scope',
        function                                    ( $scope ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignTextCtrl = this,
                card = SelfieCampaignCtrl.card;

            function updateActionLink() {
                var type = SelfieCampaignTextCtrl.actionType.type;

                if (SelfieCampaignTextCtrl.actionLink) {
                    card.links.Action = SelfieCampaignTextCtrl.actionLink;
                }

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
                    var type = card.params.action && card.params.action.type || 'none';

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

            this.budget = campaign.pricing.budget || null;
            this.limit = campaign.pricing.dailyLimit || null;

            this.geoOptions = [{state: 'No Geo Targeting', none: true}]
                .concat(GeoService.usa.map(function(state) {
                    return {
                        state: state,
                        country: 'usa'
                    };
                }));

            this.geo = this.geoOptions.filter(function(option) {
                var state = campaign.geoTargeting[0] && campaign.geoTargeting[0].state ||
                    'No Geo Targeting';

                return state === option.state;
            })[0];

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        var hasCategories = campaign.categories.length,
                            hasGeo = this.geo !== this.geoOptions[0];

                        return 50 + ([hasCategories, hasGeo]
                            .filter(function(bool) { return bool; }).length * 0.5);
                    }
                },
                validBudget: {
                    get: function() {
                        var budget = parseInt(this.budget);

                        return !budget || (budget > 50 && budget < 20000);
                    }
                },
                dailyLimitError: {
                    get: function() {
                        var budget = parseInt(this.budget),
                            max = parseInt(this.limit);

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

            $scope.$watch(function() {
                return SelfieCampaignTargetingCtrl.geo;
            }, function(newGeo, oldGeo) {
                if (newGeo === oldGeo) { return; }

                campaign.geoTargeting = newGeo.none ? [] : [{ state: newGeo.state }];
            });

            $scope.$watchCollection(function() {
                return [
                    SelfieCampaignTargetingCtrl.budget,
                    SelfieCampaignTargetingCtrl.limit
                ];
            }, function(params, oldParams) {
                if (params === oldParams) { return; }

                var Ctrl = SelfieCampaignTargetingCtrl;

                if (Ctrl.validBudget && !Ctrl.dailyLimitError) {
                    campaign.pricing.budget = params[0];
                    campaign.pricing.dailyLimit = params[1];
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
