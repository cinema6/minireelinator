define( ['angular','c6_state','../minireel/mixins/PaginatedListState',
         '../minireel/mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState                    ,
          PaginatedListController                    ) {
    /* jshint -W106 */
    'use strict';

    var copy = angular.copy,
        equals = angular.equals,
        extend = angular.extend;

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
            c6StateProvider.state('Selfie:Campaigns', ['$injector','$location',
                                                       'paginatedDbList',
            function                                  ( $injector , $location ,
                                                        paginatedDbList ) {
                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/selfie/campaigns.html';
                this.controller = 'SelfieCampaignsController';
                this.controllerAs = 'SelfieCampaignsCtrl';

                this.filter = $location.search().filter ||
                    'draft,pendingApproval,approved,active,paused,error';
                this.filterBy = $location.search().filterBy || 'statuses';
                this.sort = $location.search().sort || 'lastUpdated,-1';

                extend(this.queryParams, {
                    filter: '=',
                    filterBy: '=',
                    sort: '=',
                    search: '='
                });

                this.title = function() {
                    return 'Selfie Campaign Manager';
                };
                this.model = function() {
                    return paginatedDbList('selfieCampaign', {
                        sort: this.sort,
                        application: 'selfie',
                        statuses: this.filter,
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

            this.initWithModel = function(model) {
                this.model = model;

                this.filters = [
                    'draft',
                    'pendingApproval',
                    'approved',
                    'active',
                    'paused',
                    'error'
                ].map(function(filter) {
                    return {
                        name: filter.charAt(0).toUpperCase() + filter.slice(1),
                        id: filter,
                        checked: SelfieCampaignsCtrl.filter.indexOf(filter) > -1
                    };
                });
            };

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

            this.toggleFilter = function() {
                this.filter = this.filters.reduce(function(filters, filter) {
                    return filter.checked ? filters.concat(filter.id) : filters;
                },[]).join(',');
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
            c6StateProvider.state('Selfie:NewCampaign', ['cinema6','c6State','CampaignService',
            function                                    ( cinema6 , c6State , CampaignService ) {
                this.model = function() {
                    return CampaignService.create('campaign');
                };

                this.afterModel = function(campaign) {
                    this.campaign = campaign;
                    this.card = CampaignService.create('card');
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:New:Campaign', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:EditCampaign', ['cinema6','c6State','CampaignService',
            function                                     ( cinema6 , c6State , CampaignService ) {
                this.model = function(params) {
                    return cinema6.db.find('selfieCampaign', params.campaignId);
                };

                this.afterModel = function(campaign) {
                    this.campaign = CampaignService.normalize(campaign);
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
                    this.campaign = this.cParent.campaign;
                    this.advertiser = SelfieState.cModel.advertiser;
                };

                this.model = function() {
                    return $q.all({
                        categories: cinema6.db.findAll('category'),
                        logos: SelfieLogoService.getLogos(),
                        paymentMethods: cinema6.db.findAll('paymentMethod')
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
                            campaign.advertiserDisplayName,
                            campaign.contentCategories.primary,
                            campaign.paymentMethod,
                            this.validation.budget,
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
                // TODO: make sure campaign and card have necessary properties
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = model.categories;
                this.logos = model.logos;
                this.advertiser = cState.advertiser;
                this.paymentMethods = model.paymentMethods;

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
            $scope.$watch(function() {
                var campaign = SelfieCampaignCtrl.campaign || {};

                return [
                    campaign.contentCategories,
                    campaign.pricing,
                    campaign.targeting,
                    campaign.paymentMethod
                ];
            }, function(params, oldParams) {
                if (params === oldParams) { return; }

                if (SelfieCampaignCtrl.shouldSave) {
                    SelfieCampaignCtrl.autoSave();
                }
            }, true);

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
                    campaign.advertiserDisplayName,
                    card.title,
                    card.note,
                    card.thumb,
                    card.collateral.logo,
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
                    SelfieCampaignVideoCtrl.videoError = false;
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
                campaign = SelfieCampaignCtrl.campaign,
                card = SelfieCampaignCtrl.card;

            // debounce for 2 seconds then convert card for player,
            // then make a new copy of the default preview experience,
            // add a few preview-only settings on the card: autoplay, skip, controls,
            // add the card to the deck, then put the card and experience
            // on the Ctrl for binding in the template
            this.loadPreview = c6Debounce(function() {
                var _card = copy(card);
                $log.info('loading preview');

                _card.params.sponsor = campaign.advertiserDisplayName;

                SelfieCampaignPreviewCtrl.card = _card;
            }, 2000);

            // if we have what we need on initiation then load a preview
            if (card.data.service && card.data.videoid) {
                SelfieCampaignPreviewCtrl.loadPreview();
            }

            $scope.$on('loadPreview', SelfieCampaignPreviewCtrl.loadPreview);

        }])

        .controller('SelfieCampaignPaymentController', ['PaymentService','$scope','cinema6',
                                                        'ConfirmDialogService',
        function                                       ( PaymentService , $scope , cinema6 ,
                                                         ConfirmDialogService ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                methods = SelfieCampaignCtrl.paymentMethods,
                campaign = SelfieCampaignCtrl.campaign;

            function handleError(error) {
                ConfirmDialogService.display({
                    prompt: 'There was an a problem saving your payment method: ' + error.data,
                    affirm: 'OK',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    }
                });
            }

            this.paypalSuccess = function(method) {
                var newMethod = cinema6.db.create('paymentMethod', {
                    paymentMethodNonce: method.nonce
                });

                newMethod.save()
                    .then(function(method) {
                        methods.unshift(method);
                        campaign.paymentMethod = method.token;
                    }, handleError);
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Campaign:Payment:New', ['cinema6','PaymentService',
            function                                             ( cinema6 , PaymentService ) {
                var SelfieCampaignPaymentNewState = this;

                this.templateUrl = 'views/selfie/campaigns/edit/payment_new.html';
                this.controller = 'SelfieCampaignPaymentNewController';
                this.controllerAs = 'SelfieCampaignPaymentNewCtrl';

                this.model = function() {
                    return cinema6.db.create('paymentMethod', {
                        paymentMethodNonce: null,
                        cardholderName: null,
                        makeDefault: false
                    });
                };

                this.afterModel = function() {
                    return PaymentService.getToken()
                        .then(function(token) {
                            SelfieCampaignPaymentNewState.token = token;
                        });
                };
            }]);
        }])

        .controller('SelfieCampaignPaymentNewController', ['c6State','cinema6','cState','$scope',
        function                                          ( c6State , cinema6 , cState , $scope ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                paymentMethods = SelfieCampaignCtrl.paymentMethods,
                campaign = SelfieCampaignCtrl.campaign;

            this.initWithModel = function(model) {
                this.model = model;
                this.token = cState.token;
            };

            this.success = function(method) {
                extend(this.model, {
                    cardholderName: method.cardholderName,
                    paymentMethodNonce: method.nonce,
                    makeDefault: method.makeDefault
                });

                return this.model.save()
                    .then(function(method) {
                        paymentMethods.unshift(method);
                        campaign.paymentMethod = method.token;

                        return c6State.goTo('Selfie:Campaign');
                    });
            };

            this.cancel = function() {
                return c6State.goTo('Selfie:Campaign');
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:ManageCampaign', ['cinema6','c6State','CampaignService',
            function                                       ( cinema6 , c6State , CampaignService ) {
                this.model = function(params) {
                    return cinema6.db.find('selfieCampaign', params.campaignId);
                };

                this.afterModel = function(campaign) {
                    this.campaign = CampaignService.normalize(campaign);
                    this.card = campaign.cards[0].item;
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:Manage:Campaign', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Manage:Campaign', ['cinema6','$q','c6State',
            function                                        ( cinema6 , $q , c6State ) {
                this.templateUrl = 'views/selfie/campaigns/manage.html';
                this.controller = 'SelfieManageCampaignController';
                this.controllerAs = 'SelfieManageCampaignCtrl';

                this.card = null;
                this.campaign = null;

                this.beforeModel = function() {
                    this.card = this.cParent.card;
                    this.campaign = this.cParent.campaign;
                };

                this.model = function() {
                    return $q.all({
                        paymentMethods: cinema6.db.findAll('paymentMethod')
                    });
                };

                this.enter = function() {
                    // if user is Admin go to Selfie:Manage:Campaign:Admin
                    return c6State.goTo('Selfie:Manage:Campaign:Manage');
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

            this.initWithModel = function(model) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = model.categories;
                this.paymentMethods = model.paymentMethods;
            };

            this.update = queue.debounce(function() {
                return this.campaign.save();
            }, this);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Manage:Campaign:Manage', [function() {
                this.templateUrl = 'views/selfie/campaigns/manage/manage.html';
                this.controller = 'SelfieManageCampaignManageController';
                this.controllerAs = 'SelfieManageCampaignManageCtrl';

                this.card = null;
                this.campaign = null;

                this.beforeModel = function() {
                    this.card = this.cParent.card;
                    this.campaign = this.cParent.campaign;
                };
            }]);
        }])

        .controller('SelfieManageCampaignManageController', ['$scope','cState','c6AsyncQueue','c6State',
        function                                            ( $scope , cState , c6AsyncQueue , c6State ) {
            var queue = c6AsyncQueue();

            this.initWithModel = function() {
                this.card = cState.card;
                this.campaign = cState.campaign;
            };

            this.copy = queue.debounce(function() {
                return this.campaign.save();
            }, this);

            this.edit = function(campaign) {
                console.log(campaign);
                c6State.goTo('Selfie:EditCampaign', [campaign]);
            };
        }]);
});
