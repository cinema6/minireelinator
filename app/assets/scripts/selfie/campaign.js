define( ['angular','c6_state','../minireel/mixins/PaginatedListState',
         '../minireel/mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState                    ,
          PaginatedListController                    ) {
    /* jshint -W106 */
    'use strict';

    var copy = angular.copy,
        equals = angular.equals,
        forEach = angular.forEach,
        isObject = angular.isObject,
        extend = angular.extend;

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
            c6StateProvider.state('Selfie:Campaigns', ['c6State','$injector','$location',
                                                       'paginatedDbList',
            function                                  ( c6State , $injector , $location ,
                                                        paginatedDbList ) {
                var SelfieState = c6State.get('Selfie');

                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/selfie/campaigns.html';
                this.controller = 'SelfieCampaignsController';
                this.controllerAs = 'SelfieCampaignsCtrl';

                this.filter = $location.search().filter ||
                    'draft,pendingApproval,approved,active,paused,error';
                this.filterBy = $location.search().filterBy || 'status';
                this.sort = $location.search().sort || 'lastUpdated,-1';

                extend(this.queryParams, {
                    filter: '=',
                    filterBy: '=',
                    sort: '=',
                    search: '=',
                    searchBy: '='
                });

                this.title = function() {
                    return 'Selfie Campaign Manager';
                };
                this.model = function() {
                    return paginatedDbList('selfieCampaign', {
                        sort: this.sort,
                        org: SelfieState.cModel.org.id,
                        application: 'selfie',
                        status: this.filter,
                    }, this.limit, this.page).ensureResolution();
                };
            }]);
        }])

        .controller('SelfieCampaignsController', ['$injector','$scope','$q','cState',
                                                  'ConfirmDialogService','ThumbnailService',
        function                                 ( $injector , $scope , $q , cState ,
                                                   ConfirmDialogService , ThumbnailService ) {
            var SelfieCampaignsCtrl = this;

            $injector.invoke(PaginatedListController, this, {
                cState: cState,
                $scope: $scope
            });

            function thumbFor(card) {
                var service = card.data.service,
                    id = card.data.videoid,
                    thumb = card.thumb;

                if (thumb) { return $q.when(thumb); }

                if (service && id) {
                    return ThumbnailService.getThumbsFor(service, id)
                        .ensureFulfillment()
                        .then(function(thumbs) {
                            return thumbs.large;
                        });
                }

                return $q.when(null);
            }

            this.editStateFor = function(campaign) {
                return campaign.status === 'draft' ?
                    'Selfie:EditCampaign' :
                    'Selfie:ManageCampaign';
            };

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

            this.toggleSort = function(prop) {
                this.sort = prop + ',' + (parseInt(this.sort.split(',')[1]) === -1 ? 1 : -1);
            };

            this.doSearch = function(text) {
                this.search = text || undefined;
            };

            $scope.$watch(function() {
                return SelfieCampaignsCtrl.model.items.value;
            }, function(model) {

                SelfieCampaignsCtrl.metaData = model.reduce(function(result, campaign) {
                    var card = campaign.cards && campaign.cards[0] && campaign.cards[0].item;

                    if (!card) { return result; }

                    result[campaign.id] = {
                        sponsor: card.params.sponsor,
                        logo: card.collateral.logo
                    };

                    thumbFor(card).then(function(thumb) {
                        result[campaign.id].thumb = thumb;
                    });

                    return result;
                },{});
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:NewCampaign', ['cinema6','c6State','MiniReelService',
            function                                    ( cinema6 , c6State , MiniReelService ) {
                var SelfieState = c6State.get('Selfie');

                this.model = function() {
                    var advertiser = SelfieState.cModel.advertiser,
                        customer = SelfieState.cModel.customer;

                    return cinema6.db.create('selfieCampaign', {
                            advertiserId: advertiser.id,
                            customerId: customer.id,
                            name: null,
                            categories: [],
                            cards: [],
                            pricing: {},
                            geoTargeting: [],
                            status: 'draft',
                            application: 'selfie'
                        });
                };

                this.afterModel = function() {
                    var advertiser = SelfieState.cModel.advertiser,
                        card = cinema6.db.create('card', MiniReelService.createCard('video'));

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
            c6StateProvider.state('Selfie:Campaign', ['cinema6','SelfieLogoService',
                                                      'c6State','$q',
            function                                 ( cinema6 , SelfieLogoService ,
                                                       c6State , $q ) {
                var SelfieState = c6State.get('Selfie');

                this.templateUrl = 'views/selfie/campaigns/campaign.html';
                this.controller = 'SelfieCampaignController';
                this.controllerAs = 'SelfieCampaignCtrl';

                this.card = null;
                this.campaign = null;

                this.beforeModel = function() {
                    this.card = this.cParent.card;
                    this.campaign = this.cParent.cModel;
                    this.advertiser = SelfieState.cModel.advertiser;
                };

                this.model = function() {
                    return $q.all({
                        categories: cinema6.db.findAll('category'),
                        logos: SelfieLogoService.getLogos({
                            sort: 'lastUpdated,-1',
                            org: SelfieState.cModel.org.id,
                            application: 'selfie',
                            limit: 50,
                            skip: 0
                        })
                    });
                };
            }]);
        }])

        .controller('SelfieCampaignController', ['$scope','$log','c6State','cState',
                                                 'c6Debounce','c6AsyncQueue',
        function                                ( $scope , $log , c6State , cState ,
                                                  c6Debounce , c6AsyncQueue ) {
            var SelfieCampaignCtrl = this,
                queue = c6AsyncQueue();

            function saveCampaign() {
                return SelfieCampaignCtrl.campaign.save();
            }

            function saveCard() {
                return SelfieCampaignCtrl.card.save();
            }

            function addCardToCampaign(card) {
                SelfieCampaignCtrl.campaign.cards = [{
                    id: card.id
                }];

                return card;
            }

            function addCampaignToCard(campaign) {
                SelfieCampaignCtrl.card.campaignId = campaign.id;

                return campaign;
            }

            function updateProxy() {
                SelfieCampaignCtrl._proxyCard = copy(SelfieCampaignCtrl.card);
                SelfieCampaignCtrl._proxyCampaign = copy(SelfieCampaignCtrl.campaign);
            }

            function returnToDashboard() {
                return c6State.goTo('Selfie:CampaignDashboard');
            }

            function handleError(err) {
                $log.error('Could not save the Campaign', err);
            }

            function watchForPreview(params, oldParams) {
                if (params === oldParams) { return; }

                var card = SelfieCampaignCtrl.card;

                if (card.data.service && card.data.videoid) {
                    $log.info('load preview');
                    $scope.$broadcast('loadPreview');
                }

                if (SelfieCampaignCtrl.shouldSave) {
                    SelfieCampaignCtrl.autoSave();
                }
            }

            // this gets set to 'true' when a user clicks into
            // the video title input field, at which point we don't
            // want changes in videos to overwrite the video title.
            // It's defined on the this Ctrl because it affects
            // multiple child Ctrls that don't know about each other
            this.disableVideoTitleOverwrite = false;

            Object.defineProperties(this, {
                shouldSave: {
                    get: function() {
                        return  (!this.campaign.status || this.campaign.status === 'draft') &&
                            (!equals(this.card, this._proxyCard) ||
                            !equals(this.campaign, this._proxyCampaign));
                    }
                },
                canSubmit: {
                    get: function() {
                        var campaign = this.campaign,
                            card = this.card;

                        return [
                            campaign.name,
                            this.validation.budget,
                            card.params.sponsor,
                            card.data.service,
                            card.data.videoid
                        ].filter(function(prop) {
                            return !prop;
                        }).length === 0;
                    }
                }
            });

            this.validation = {
                budget: true
            };

            this.initWithModel = function(model) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = model.categories;
                this.logos = model.logos;
                this.advertiser = cState.advertiser;

                this._proxyCard = copy(this.card);
                this._proxyCampaign = copy(this.campaign);
            };

            this.save = function() {
                $log.info('saving');

                $scope.$broadcast('SelfieCampaignWillSave');

                if (SelfieCampaignCtrl.card.id) {
                    return saveCard()
                        .then(saveCampaign)
                        .then(updateProxy)
                        .catch(handleError);
                } else {
                    return saveCampaign()
                        .then(addCampaignToCard)
                        .then(saveCard)
                        .then(addCardToCampaign)
                        .then(saveCampaign)
                        .then(updateProxy)
                        .catch(handleError);
                }
            };

            this.submit = queue.debounce(function() {
                return this.save().then(returnToDashboard);
            }, this);

            // debounce the auto-save
            this.autoSave = c6Debounce(SelfieCampaignCtrl.save, 5000);

            // watch for saving only
            $scope.$watchCollection(function() {
                var campaign = SelfieCampaignCtrl.campaign || {};

                return [
                    campaign.categories,
                    campaign.geoTargeting,
                    campaign.pricing.budget,
                    campaign.pricing.dailyLimit
                ];
            }, function(params, oldParams) {
                if (params === oldParams) { return; }


                if (SelfieCampaignCtrl.shouldSave) {
                    SelfieCampaignCtrl.autoSave();
                }
            });

            // watch the Sponsor Links for autosaving and previewing
            $scope.$watchCollection(function() {
                return SelfieCampaignCtrl.card.links;
            }, watchForPreview);

            // watch the necessary card properties
            $scope.$watchCollection(function() {
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
        function                                       ( $scope , CollateralService ) {
            var SelfieCampaignSponsorCtrl = this,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                advertiser = SelfieCampaignCtrl.advertiser,
                defaultLogo = advertiser.defaultLogos && advertiser.defaultLogos.square,
                card = SelfieCampaignCtrl.card;

            function typeify(name) {
                switch (name) {
                case 'Upload from URL':
                    return 'url';
                case 'Upload from File':
                    return 'file';
                case 'None':
                    return 'none';
                default:
                    return 'custom';
                }
            }

            function handleUpload(path) {
                SelfieCampaignSponsorCtrl.logo = '/' + path;
                SelfieCampaignSponsorCtrl.previouslyUploadedLogo = '/' + path;
                SelfieCampaignSponsorCtrl.uploadError = false;
            }

            function handleUploadError() {
                SelfieCampaignSponsorCtrl.uploadError = true;
            }

            // we need to build an array of objects for the dropdown,
            // if we have an Account Default logo we'll put that first and
            // make it the default if this is a new campaign.
            // If there is no Account Default we'll default to "None"
            this.logoOptions = ['None','Upload from URL','Upload from File']
                .reduce(function(result, option) {
                    result.push({
                        type: typeify(option),
                        label: option
                    });
                    return result;
                }, defaultLogo ?
                [{
                    type: 'account',
                    label: 'Account Default',
                    src: defaultLogo
                }] : [])
                .concat(SelfieCampaignCtrl.logos
                    .map(function(logo) {
                        return {
                            type: 'custom',
                            label: logo.name,
                            src: logo.src
                        };
                    }));

            // if the logo 'type' matches that means we have a uploaded via URL of File
            // if the src matches that means we could be using an Account Default
            // or a logo from another campaign
            // if we have NO logo on the card but we DO have an Account Default
            // then "none" must have been selected
            this.logoType = this.logoOptions.filter(function(option) {
                return option.type === card.collateral.logoType ||
                    option.src === card.collateral.logo ||
                    (!card.collateral.logo && defaultLogo && option.type === 'none');
            })[0] || this.logoOptions[0];

            this.logo = card.collateral.logo;
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
                    if (link.href && link.href === card.links[link.name]) { return; }

                    if (link.href) {
                        card.links[link.name] = link.href;
                    } else if (card.links[link.name]) {
                        delete card.links[link.name];
                    }
                });
            };

            this.uploadFromUri = function(uri) {
                CollateralService.uploadFromUri(uri)
                    .then(handleUpload)
                    .catch(handleUploadError);
            };

            // new logo urls come from various places, sometimes asynchronously
            // so we only want to trigger a real change when we get a new, valid url
            $scope.$watch(function() {
                return SelfieCampaignSponsorCtrl.logo;
            }, function(newLogo, oldLogo) {
                if (newLogo === oldLogo) { return; }

                var selectedType = SelfieCampaignSponsorCtrl.logoType.type;

                card.collateral.logo = newLogo;
                card.collateral.logoType = /file|url/.test(selectedType) ? selectedType : null;
            });

            // we do very different things depending on what the
            // user chooses from the dropdown
            $scope.$watch(function() {
                return SelfieCampaignSponsorCtrl.logoType.type;
            },function(type) {
                var Ctrl = SelfieCampaignSponsorCtrl;

                Ctrl.uploadError = false;

                switch (type) {
                case 'file':
                case 'url':
                    if (Ctrl.previouslyUploadedLogo) {
                        Ctrl.logo = Ctrl.previouslyUploadedLogo;
                    }
                    break;
                case 'custom':
                    Ctrl.logo = Ctrl.logoType.src;
                    break;
                case 'account':
                    Ctrl.logo = defaultLogo;
                    break;
                case 'none':
                    Ctrl.logo = null;
                    break;
                }
            });

            // as soon as someone selects a local file we upload it
            $scope.$watch(function() {
                return SelfieCampaignSponsorCtrl.logoFile;
            }, function(newFile) {
                if (!newFile) { return; }

                CollateralService.uploadFromFile(newFile)
                    .then(handleUpload)
                    .catch(handleUploadError);
            });

            $scope.$on('SelfieCampaignWillSave', this.updateLinks);
        }])

        .controller('SelfieCampaignVideoController', ['$injector','$scope','SelfieVideoService',
                                                      'c6Debounce','ThumbnailService',
                                                      'FileService','CollateralService',
        function                                     ( $injector , $scope , SelfieVideoService ,
                                                       c6Debounce , ThumbnailService ,
                                                       FileService , CollateralService ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignVideoCtrl = this,
                card = SelfieCampaignCtrl.card,
                service = card.data.service,
                id = card.data.videoid,
                hasExistingVideo = !!service && !!id;

            function setDefaultThumbs(service, id) {
                if (service === 'adUnit') {
                    SelfieCampaignVideoCtrl.useDefaultThumb = false;
                    SelfieCampaignVideoCtrl.defaultThumb = null;
                } else {
                    ThumbnailService.getThumbsFor(service, id)
                        .ensureFulfillment()
                        .then(function(thumbs) {
                            SelfieCampaignVideoCtrl.defaultThumb = thumbs.large;
                            SelfieCampaignVideoCtrl.useDefaultThumb = !card.thumb;
                        });
                }
            }

            function handleVideoError() {
                SelfieCampaignVideoCtrl.videoError = true;
                SelfieCampaignVideoCtrl.video = null;
            }

            this.useDefaultThumb = !card.thumb;
            this.customThumbSrc = card.thumb;
            this.videoUrl = SelfieVideoService.urlFromData(service, id);
            this.disableTrimmer = function() { return true; };

            Object.defineProperties(this, {
                disableTitleOverwrite: {
                    get: function() {
                        return SelfieCampaignCtrl.disableVideoTitleOverwrite ||
                            hasExistingVideo;
                    }
                }
            });

            this.updateThumbs = function() {
                card.thumb = !SelfieCampaignVideoCtrl.useDefaultThumb ?
                    SelfieCampaignVideoCtrl.customThumbSrc :
                    null;
            };

            // when a user enters a new video url or emebd code we
            // first figure out the service and id, then get thumbs
            // then get the stats/data about the video
            this.updateUrl = c6Debounce(function(args) {
                var service, id,
                    url = args[0];

                if (!url) {
                    SelfieCampaignVideoCtrl.video = null;
                    return;
                }

                SelfieVideoService.dataFromText(url)
                    .then(function(data) {
                        service = data.service;
                        id = data.id;

                        setDefaultThumbs(service, id);

                        return SelfieVideoService.statsFromService(service, id);
                    })
                    .then(function(data) {
                        SelfieCampaignVideoCtrl.videoError = false;
                        SelfieCampaignVideoCtrl.video = data;
                        card.title = SelfieCampaignVideoCtrl.disableTitleOverwrite ?
                            card.title : data.title;
                        card.data.service = service;
                        card.data.videoid = id;
                    })
                    .catch(handleVideoError);
            }, 1000);

            // watch the thumbnail selector button and make the change
            // on the actual card to trigger save/preview
            $scope.$watch(function() {
                return SelfieCampaignVideoCtrl.useDefaultThumb;
            }, function(useDefault) {
                if (useDefault) {
                    card.thumb = null;
                } else {
                    card.thumb = SelfieCampaignVideoCtrl.customThumbSrc;
                }
            });

            // watch the the File <input> and upload when chosen,
            // on success we're assuming a choice of "custom"
            $scope.$watch(function() {
                return SelfieCampaignVideoCtrl.customThumbFile;
            }, function(newFile) {
                if (!newFile) { return; }

                CollateralService.uploadFromFile(newFile)
                    .then(function(path) {
                        SelfieCampaignVideoCtrl.customThumbSrc = '/' + path;
                        SelfieCampaignVideoCtrl.useDefaultThumb = false;
                        card.thumb = '/' + path;
                    });
            });

            // watch the video link/embed/vast tag input
            // and then do all the checking/getting of data
            $scope.$watch(function() {
                return SelfieCampaignVideoCtrl.videoUrl;
            }, SelfieCampaignVideoCtrl.updateUrl);

            $scope.$on('SelfieCampaignWillSave', this.updateThumbs);

        }])

        .controller('SelfieCampaignTextController', ['$scope',
        function                                    ( $scope ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignTextCtrl = this,
                card = SelfieCampaignCtrl.card;

            // we only set the action object if we have
            // an action link and a valid type
            function updateActionLink() {
                var type = SelfieCampaignTextCtrl.actionType.type,
                    actionLink = SelfieCampaignTextCtrl.actionLink,
                    actionLabel = SelfieCampaignTextCtrl.actionLabel;

                if (actionLink) {
                    card.links.Action = actionLink;
                }

                card.params.action = actionLink && type !== 'none' ? {
                    type: type,
                    label: actionLabel
                } : null;
            }

            this.actionLink = card.links.Action;
            this.actionLabel = (card.params.action && card.params.action.label) || 'Learn More';

            // there are only two valid types: 'button' or 'text'
            // but in the UI we want the choice to read 'Link' instead of 'text'
            this.actionTypeOptions = ['None','Button', 'Link']
                .map(function(option) {
                    return {
                        name: option,
                        type: option === 'Link' ? 'text' : option.toLowerCase()
                    };
                });

            // if we do not have an action object or valid type
            // then we're defaulting the choice to 'none'
            this.actionType = this.actionTypeOptions
                .filter(function(option) {
                    var type = card.params.action && card.params.action.type || 'none';

                    return option.type === type;
                })[0];


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

            $scope.$on('SelfieCampaignWillSave', updateActionLink);

        }])

        .controller('SelfieCampaignPreviewController', ['$scope','c6Debounce','$log',
        function                                       ( $scope , c6Debounce , $log ) {
            var SelfieCampaignPreviewCtrl = this,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                card = SelfieCampaignCtrl.card;

            // debounce for 2 seconds then convert card for player,
            // then make a new copy of the default preview experience,
            // add a few preview-only settings on the card: autoplay, skip, controls,
            // add the card to the deck, then put the card and experience
            // on the Ctrl for binding in the template
            this.loadPreview = c6Debounce(function() {
                $log.info('loading preview');
                SelfieCampaignPreviewCtrl.card = copy(card);
            }, 2000);

            // if we have what we need on initiation then load a preview
            if (card.data.service && card.data.videoid) {
                SelfieCampaignPreviewCtrl.loadPreview();
            }

            $scope.$on('loadPreview', SelfieCampaignPreviewCtrl.loadPreview);

        }])

        .controller('SelfieCategoriesController', ['$scope',
        function                                  ( $scope ) {
            var SelfieCategoriesCtrl = this,
                campaign = $scope.campaign,
                categories = $scope.categories;

            // we need to have a selectable item in the dropdown for 'none'
            this.categories = [{
                name: 'none',
                label: 'No Category Targeting'
            }].concat(categories);

            // we default to 'none'
            this.category = this.categories
                .filter(function(category) {
                    var name = campaign.categories[0] || 'none';

                    return name === category.name;
                })[0];

            // we watch the category choice and add only one to the campaign if chosen
            // and set to empty array if 'No Categories' is chosen
            $scope.$watch(function() {
                return SelfieCategoriesCtrl.category;
            }, function(newCat, oldCat) {
                if (newCat === oldCat) { return; }

                campaign.categories = newCat.name !== 'none' ? [newCat.name] : [];
            });
        }])

        .controller('SelfieGeotargetingController', ['$scope','GeoService',
        function                                    ( $scope , GeoService ) {
            var SelfieGeotargetingCtrl = this,
                campaign = $scope.campaign;

            this.geoOptions = GeoService.usa.map(function(state) {
                return {
                    state: state,
                    country: 'usa'
                };
            });

            // we filter the options and use only the ones saved on the campaign
            this.geo = this.geoOptions.filter(function(option) {
                return campaign.geoTargeting.filter(function(geo) {
                    return option.state === geo.state;
                }).length > 0;
            });

            // we watch the geo choices and save an array of states
            $scope.$watch(function() {
                return SelfieGeotargetingCtrl.geo;
            }, function(newGeo, oldGeo) {
                if (newGeo === oldGeo) { return; }

                campaign.geoTargeting = newGeo.map(function(geo) {
                    return { state: geo.state };
                });
            });
        }])

        .controller('SelfieBudgetController', ['$scope',
        function                              ( $scope ) {
            var SelfieBudgetCtrl = this,
                campaign = $scope.campaign,
                validation = $scope.validation || {};

            this.budget = campaign.pricing.budget || null;
            this.limit = campaign.pricing.dailyLimit || null;

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        var hasCategory = campaign.categories.length,
                            hasGeos = campaign.geoTargeting.length;

                        return 50 + ([hasCategory, hasGeos]
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

            // watch the budget and limit but only add them to the campaign
            // if they're valid so no bad values get autosaved
            $scope.$watchCollection(function() {
                return [
                    SelfieBudgetCtrl.budget,
                    SelfieBudgetCtrl.limit
                ];
            }, function(params, oldParams) {
                if (params === oldParams) { return; }

                var Ctrl = SelfieBudgetCtrl,
                    budget = params[0],
                    limit = params[1];

                if (Ctrl.validBudget && !Ctrl.dailyLimitError) {
                    campaign.pricing.budget = params[0];
                    campaign.pricing.dailyLimit = params[1];

                    validation.budget = !!budget && !!limit;
                } else {
                    validation.budget = false;
                }
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:ManageCampaign', ['cinema6','c6State',
            function                                       ( cinema6 , c6State ) {
                this.model = function(params) {
                    return cinema6.db.find('selfieCampaign', params.campaignId);
                };

                this.afterModel = function(campaign) {
                    this.card = campaign.cards[0].item;
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:Manage:Campaign', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Manage:Campaign', ['cinema6',
            function                                        ( cinema6 ) {
                this.templateUrl = 'views/selfie/campaigns/manage.html';
                this.controller = 'SelfieManageCampaignController';
                this.controllerAs = 'SelfieManageCampaignCtrl';

                this.card = null;
                this.campaign = null;

                this.beforeModel = function() {
                    this.card = this.cParent.card;
                    this.campaign = this.cParent.cModel;
                };

                this.model = function() {
                    return cinema6.db.findAll('category');
                };
            }]);
        }])

        .controller('SelfieManageCampaignController', ['$scope','cState','c6AsyncQueue',
        function                                      ( $scope , cState , c6AsyncQueue ) {
            var queue = c6AsyncQueue();

            Object.defineProperties(this, {
                canSubmit: {
                    get: function() {
                        return [
                            this.campaign.name,
                            this.validation.budget
                        ].filter(function(prop) {
                            return !prop;
                        }).length === 0;
                    }
                }
            });

            this.validation = {
                budget: true
            };
            this.tab = 'manage';

            this.initWithModel = function(categories) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = categories;
            };

            this.update = queue.debounce(function() {
                return this.campaign.save();
            }, this);
        }]);
});
