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
        isObject = angular.isObject,
        isArray = angular.isArray,
        isFunction = angular.isFunction,
        isDate = angular.isDate;

    /* Adapted from Angular 1.4.7, modified to not handle regular expressions.
        Used for merging objects. */
    function baseExtend(dst, objs, deep) {
        for (var i = 0, ii = objs.length; i < ii; ++i) {
            var obj = objs[i];
            if (!isObject(obj) && !isFunction(obj)) {
                continue;
            }
            var keys = Object.keys(obj);
            for (var j = 0, jj = keys.length; j < jj; j++) {
                var key = keys[j];
                var src = obj[key];
                if (deep && isObject(src)) {
                    if (isDate(src)) {
                        dst[key] = new Date(src.valueOf());
                    } else {
                        if (!isObject(dst[key])) {
                            dst[key] = isArray(src) ? [] : {};
                        }
                        baseExtend(dst[key], [src], true);
                    }
                } else {
                    dst[key] = src;
                }
            }
        }
        return dst;
    }

    /* Adapted from Angular 1.4.7 as the currently used version of Angular
        does not include a merge function. */
    function merge(dst) {
        return baseExtend(dst, [].slice.call(arguments, 1), true);
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
            c6StateProvider.state('Selfie:Campaigns', ['$injector','$location',
                                                       'paginatedDbList','c6State',
            function                                  ( $injector , $location ,
                                                        paginatedDbList , c6State ) {
                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/selfie/campaigns.html';
                this.controller = 'SelfieCampaignsController';
                this.controllerAs = 'SelfieCampaignsCtrl';

                this.filter = $location.search().filter ||
                    'draft,pending,approved,active,paused,error';
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
                this.afterModel = function() {
                    var user = c6State.get('Selfie').cModel;

                    this.isAdmin = (user.entitlements.adminCampaigns === true);
                };
            }]);
        }])

        .controller('SelfieCampaignsController', ['$injector','$scope','$q','cState',
                                                  'ConfirmDialogService','ThumbnailService',
                                                  'CampaignService',
        function                                 ( $injector , $scope , $q , cState ,
                                                   ConfirmDialogService , ThumbnailService ,
                                                   CampaignService ) {
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

            function addMetaData() {
                var Ctrl = SelfieCampaignsCtrl,
                    model = Ctrl.model.items.value,
                    ids = model.reduce(function(idsHash, campaign) {
                        if (idsHash.campaigns.indexOf(campaign.id) < 0) {
                            idsHash.campaigns.push(campaign.id);
                        }
                        if (idsHash.users.indexOf(campaign.user) < 0) {
                            idsHash.users.push(campaign.user);
                        }
                        return idsHash;
                    }, {campaigns: [], users: []});

                Ctrl.metaData = model.reduce(function(result, campaign) {
                    var card = campaign.cards && campaign.cards[0];

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

                if (ids.campaigns.length) {
                    CampaignService.getAnalytics(ids.campaigns.join(','))
                        .then(function(stats) {
                            stats.forEach(function(stat) {
                                var campaignId = stat.campaignId;

                                if (!campaignId || !Ctrl.metaData[campaignId]) {
                                    return;
                                }

                                Ctrl.metaData[campaignId].stats = {
                                    views: stat.summary.views,
                                    spend: stat.summary.totalSpend
                                };
                            });
                        });
                }

                if (ids.users.length && cState.isAdmin) {
                    CampaignService.getUserData(ids.users.join(','))
                        .then(function(userHash) {
                            model.forEach(function(campaign) {
                                Ctrl.metaData[campaign.id].user = userHash[campaign.user];
                            });
                        });
                }
            }

            this.initWithModel = function(model) {
                this.model = model;

                addMetaData();
                model.on('PaginatedListHasUpdated', addMetaData);

                this.filters = [
                    'draft',
                    'pending',
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
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:NewCampaign', ['cinema6','c6State','CampaignService',
            function                                    ( cinema6 , c6State , CampaignService ) {
                this.model = function() {
                    return CampaignService.create();
                };

                this.afterModel = function(campaign) {
                    this.campaign = campaign;
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:New:Campaign', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:EditCampaign', ['cinema6','c6State','$q',
                                                          'CampaignService',
            function                                     ( cinema6 , c6State , $q ,
                                                           CampaignService ) {
                this.model = function(params) {
                    return cinema6.db.find('selfieCampaign', params.campaignId)
                        .catch(function() {
                            c6State.goTo('Selfie:CampaignDashboard');
                            return $q.reject();
                        });
                };

                this.afterModel = function(campaign) {
                    this.campaign = CampaignService.normalize(campaign);
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:Edit:Campaign', null, null, true);
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Campaign', ['cinema6','SelfieLogoService','c6State','$q',
                                                      'CampaignService','ConfirmDialogService',
            function                                 ( cinema6 , SelfieLogoService , c6State , $q ,
                                                       CampaignService , ConfirmDialogService ) {
                var SelfieState = c6State.get('Selfie');

                function campaignExtend(target, extension) {
                    forEach(extension, function(extensionValue, prop) {
                        var targetValue = target[prop];

                        if (isArray(extensionValue) && isArray(targetValue)) {
                            if (isObject(extensionValue[0]) && isObject(targetValue[0])) {
                                // If it's an array of objects then keep extending.
                                // We're assuming that if the first item is an object
                                // then all the items are objects. In campaigns this
                                // is always true. This is to handle the 'cards' array.
                                // If the cards ever end up in a different order then
                                // this could have unexpected results.
                                campaignExtend(targetValue, extensionValue);
                            } else {
                                // If the array doesn't conatin objects then simply copy
                                // over the entire array. This nicely handles changes to
                                // campaign 'targeting' arrays.
                                target[prop] = copy(extensionValue);
                            }
                        } else if (isObject(extensionValue) && isObject(targetValue)) {
                            campaignExtend(targetValue, extensionValue);
                        } else {
                            target[prop] = copy(extensionValue);
                        }
                    });

                    return target;
                }

                this.templateUrl = 'views/selfie/campaigns/campaign.html';
                this.controller = 'SelfieCampaignController';
                this.controllerAs = 'SelfieCampaignCtrl';

                this.card = null;
                this.campaign = null;
                this._campaign = null;

                this.beforeModel = function() {
                    this._campaign = this.cParent.campaign;

                    this.campaign = this.cParent.campaign.pojoify();
                    this.card = this.campaign.cards[0];
                    this.advertiser = SelfieState.cModel.advertiser;
                    this.isCreator = !this.campaign.user ||
                        this.campaign.user === SelfieState.cModel.id;
                };

                this.model = function() {
                    return $q.all({
                        categories: cinema6.db.findAll('category'),
                        logos: SelfieLogoService.getLogos(),
                        paymentMethods: cinema6.db.findAll('paymentMethod')
                    }).catch(function() {
                        c6State.goTo('Selfie:CampaignDashboard');
                        return $q.reject();
                    });
                };

                this.afterModel = function(model) {
                    var cState = this,
                        primaryPaymentMethod = model.paymentMethods
                            .filter(function(method) {
                                return method.default;
                            })[0] || {};

                    this.campaign.paymentMethod = this.campaign.paymentMethod ||
                        primaryPaymentMethod.token;

                    return CampaignService.getSchema()
                        .then(function(schema) {
                            cState.schema = schema;
                        });
                };

                this.exit = function() {
                    if (this._campaign.status !== 'draft') {
                        return $q.when(null);
                    }

                    return this.saveCampaign()
                        .catch(function() {
                            var deferred = $q.defer();

                            ConfirmDialogService.display({
                                prompt: 'There was a problem saving your campaign, would ' +
                                    'you like to stay on this page to edit the campaign?',
                                affirm: 'Yes, stay on this page',
                                cancel: 'No',

                                onCancel: function() {
                                    deferred.resolve();

                                    return ConfirmDialogService.close();
                                },
                                onAffirm: function() {
                                    deferred.reject();

                                    return ConfirmDialogService.close();
                                }
                            });

                            return deferred.promise;
                        });
                };

                this.saveCampaign = function() {
                    var cState = this,
                        master = this._campaign,
                        current = this.campaign,
                        saveable = this.isCreator && !master._erased &&
                            (!current.status || current.status === 'draft');

                    if (!saveable) {
                        return $q.when(cState.campaign);
                    }

                    return campaignExtend(this._campaign, this.campaign).save()
                        .then(function() {
                            return cState.campaign;
                        });
                };
            }]);
        }])

        .controller('SelfieCampaignController', ['$scope','$log','c6State','cState','cinema6','$q',
                                                 'c6Debounce','c6AsyncQueue','CampaignService',
                                                 'ConfirmDialogService',
        function                                ( $scope , $log , c6State , cState , cinema6 , $q ,
                                                  c6Debounce , c6AsyncQueue , CampaignService ,
                                                  ConfirmDialogService ) {
            var SelfieCampaignCtrl = this,
                queue = c6AsyncQueue();

            function saveCampaign() {
                return cState.saveCampaign();
            }

            function updateProxy(campaign) {
                SelfieCampaignCtrl._proxyCard = copy(campaign.cards[0]);
                SelfieCampaignCtrl._proxyCampaign = copy(campaign);
            }

            function returnToDashboard() {
                return c6State.goTo('Selfie:CampaignDashboard');
            }

            function handleError(err) {
                // Show alert? Show indicator?
                $log.error('Could not save the Campaign', err);
            }

            function watchForPreview(params, oldParams) {
                if (params === oldParams) { return; }

                $log.info('load preview');
                $scope.$broadcast('loadPreview');

                if (SelfieCampaignCtrl.shouldSave) {
                    SelfieCampaignCtrl.autoSave();
                }
            }

            function createUpdateRequest() {
                var status = cState._campaign.status,
                    isDraft = status === 'draft',
                    campaign = extend((isDraft ? cState._campaign.pojoify() : cState.campaign), {
                        status: isDraft ? 'active' : status
                    });

                return cinema6.db.create('updateRequest', {
                    data: campaign,
                    campaign: campaign.id
                }).save();
            }

            function setPending() {
                var currentCampaign = SelfieCampaignCtrl.campaign,
                    status = currentCampaign.status;

                currentCampaign.status = !status || status === 'draft' ?
                    'pending' : currentCampaign.status;

                return currentCampaign;
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
                        return this.isCreator &&
                            (!this.campaign.status || this.campaign.status === 'draft') &&
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
                            campaign.paymentMethod,
                            this.validation.budget,
                            card.data.service,
                            card.data.videoid,
                            card.links.Website
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
                this.logos = model.logos;
                this.categories = model.categories;
                this.paymentMethods = model.paymentMethods;

                this.card = cState.card;
                this.campaign = cState.campaign;
                this.advertiser = cState.advertiser;
                this.schema = cState.schema;
                this.isCreator = cState.isCreator;

                this._proxyCard = copy(this.card);
                this._proxyCampaign = copy(this.campaign);
            };

            this.save = function() {
                $log.info('saving');

                $scope.$broadcast('SelfieCampaignWillSave');

                return saveCampaign()
                    .then(updateProxy)
                    .catch(handleError);
            };

            this.submit = queue.debounce(function() {
                var isDraft = cState._campaign.status === 'draft';

                return (isDraft ? saveCampaign() : $q.when(this.campaign))
                    .then(createUpdateRequest)
                    .then(setPending)
                    .then(returnToDashboard)
                    .catch(handleError);
            }, this);

            // debounce the auto-save
            this.autoSave = c6Debounce(SelfieCampaignCtrl.save, 5000);

            this.copy = queue.debounce(function() {
                return CampaignService.create(this.campaign)
                    .save().then(function(campaign) {
                        return c6State.goTo('Selfie:EditCampaign', [campaign]);
                    }).catch(handleError);
            }, this);

            this.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete your campaign?',
                    affirm: 'Yes',
                    cancel: 'Cancel',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        ConfirmDialogService.close();

                        return cState._campaign.erase()
                            .then(function() {
                                return c6State.goTo('Selfie:CampaignDashboard');
                            }).catch(handleError);
                    })
                });
            };

            // watch for saving only
            $scope.$watch(function() {
                var campaign = SelfieCampaignCtrl.campaign || {};

                return [
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
            $scope.$watch(function() {
                return [
                    SelfieCampaignCtrl.card.links,
                    SelfieCampaignCtrl.card.shareLinks
                ];
            }, watchForPreview, true);

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
            var AppCtrl = $scope.AppCtrl,
                SelfieCampaignSponsorCtrl = this,
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
            this.previouslyUploadedLogo = undefined;

            this.links = [
                    'Website','Sharing','Facebook','Twitter',
                    'Instagram','YouTube','Pinterest'
                ].map(function(name) {
                    var href = card.links[name] || null,
                        cssClass = name.toLowerCase(),
                        isWebsite = cssClass === 'website';

                    return {
                        cssClass: isWebsite ? 'link' : cssClass,
                        name: name,
                        href: href,
                        required: isWebsite
                    };
                });

            this.sharing = card.shareLinks.facebook;

            this.updateLinks = function() {
                var sharing = SelfieCampaignSponsorCtrl.sharing,
                    shareLink = AppCtrl.validUrl.test(sharing) ? sharing : 'http://' + sharing;

                SelfieCampaignSponsorCtrl.links.forEach(function(link) {
                    if (link.href && link.href === card.links[link.name]) { return; }

                    if (link.href) {
                        card.links[link.name] = AppCtrl.validUrl.test(link.href) ?
                            link.href : 'http://' + link.href;
                    } else if (card.links[link.name]) {
                        card.links[link.name] = undefined;
                    }
                });

                if (sharing === card.shareLinks.facebook) { return; }

                card.shareLinks = {
                    facebook: sharing ? shareLink : undefined,
                    twitter: sharing ? shareLink : undefined,
                    pinterest: sharing ? shareLink : undefined
                };
            };

            this.uploadFromUri = function(uri) {
                if (!uri) { return; }

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
                card.collateral.logoType = /file|url/.test(selectedType) ? selectedType : undefined;
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
                    Ctrl.logo = undefined;
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
                    card.data.service = null;
                    card.data.videoid = null;
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
                            card.title : (data || {}).title;
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
            var AppCtrl = $scope.AppCtrl,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignTextCtrl = this,
                card = SelfieCampaignCtrl.card;

            function validLink(link) {
                return link && link !== 'http://';
            }

            // we only set the action object if we have
            // an action link and a valid type
            function updateActionLink() {
                var type = SelfieCampaignTextCtrl.actionType.type,
                    actionLink = SelfieCampaignTextCtrl.actionLink,
                    actionLabel = SelfieCampaignTextCtrl.actionLabel,
                    isValid = validLink(actionLink);

                if (isValid) {
                    card.links.Action = AppCtrl.validUrl.test(actionLink) ?
                        actionLink : 'http://' + actionLink;
                }

                if (type === 'none' || !isValid) {
                    card.links.Action = undefined;
                }

                card.params.action = isValid && type !== 'none' ? {
                    type: type,
                    label: actionLabel
                } : null;
            }

            this.actionLink = card.links.Action;
            this.actionLabel = (card.params.action && card.params.action.label) || 'Learn More';

            // there's only one valid type: 'button'
            // if the user chooses 'none' then we null out the 'action' prop
            this.actionTypeOptions = ['None','Button']
                .map(function(option) {
                    return {
                        name: option,
                        type: option.toLowerCase()
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
            }, function(newProps, oldProps) {
                if (newProps === oldProps) { return; }

                var newType = newProps[0],
                    oldType = oldProps[0];

                if (newType !== oldType && newType !== 'none') {
                    SelfieCampaignTextCtrl.actionLink = SelfieCampaignTextCtrl.actionLink ||
                        card.links.Website || 'http://';
                }

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
                    this.card = campaign.cards[0];
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

                this.afterModel = function() {
                    var user = c6State.get('Selfie').cModel;

                    this.isAdmin = (user.entitlements.adminCampaigns === true);
                };

                this.enter = function() {
                    // if user is Admin go to Selfie:Manage:Campaign:Admin
                    if (this.isAdmin) {
                        return c6State.goTo('Selfie:Manage:Campaign:Admin');
                    } else {
                        return c6State.goTo('Selfie:Manage:Campaign:Manage');
                    }
                };
            }]);
        }])

        .controller('SelfieManageCampaignController', ['$scope','cState','c6AsyncQueue','$q',
                                                       'c6State', 'CampaignService','cinema6',
                                                       'ConfirmDialogService',
        function                                      ( $scope , cState , c6AsyncQueue , $q ,
                                                        c6State ,  CampaignService , cinema6 ,
                                                        ConfirmDialogService ) {
            var SelfieManageCampaignCtrl = this,
                queue = c6AsyncQueue();

            function statusFor(action) {
                switch (action) {
                case 'pause':
                    return 'paused';
                case 'resume':
                    return 'active';
                case 'cancel':
                    return 'canceled';
                }
            }

            function handleError(error) {
                ConfirmDialogService.display({
                    prompt: 'There was an a problem updating your campaign: ' + error.data,
                    affirm: 'OK',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    }
                });
            }

            function createUpdateRequest(action) {
                var campaign = SelfieManageCampaignCtrl.campaign.pojoify(),
                    id = campaign.id;

                if (action) {
                    campaign.status = statusFor(action);
                }

                if (action === 'paymentMethod') {
                    campaign = {
                        paymentMethod: campaign.paymentMethod
                    };
                }

                return cinema6.db.create('updateRequest', {
                    data: campaign,
                    campaign: id
                }).save();
            }

            function setUpdateRequest(updateRequest) {
                var campaign = SelfieManageCampaignCtrl.campaign;

                if (updateRequest.status !== 'approved') {
                    campaign.updateRequest = updateRequest.id;
                }

                return campaign;
            }

            function updateProxy(campaign) {
                SelfieManageCampaignCtrl._proxyCampaign = copy(campaign);
            }

            function submitUpdate(action) {
                return createUpdateRequest(action)
                    .then(setUpdateRequest)
                    .then(updateProxy)
                    .catch(handleError);
            }

            Object.defineProperties(this, {
                canSubmit: {
                    get: function() {
                        return !equals(this.campaign, this._proxyCampaign) &&
                            !!this.campaign.paymentMethod && !this.campaign.updateRequest;
                    }
                },
                isLocked: {
                    get: function() {
                        return (/expired|canceled/).test(this.campaign.status) ||
                            !!this.campaign.updateRequest;
                    }
                }
            });

            this.initWithModel = function(model) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.categories = model.categories;
                this.paymentMethods = model.paymentMethods;
                this.showAdminTab = cState.isAdmin;

                this._proxyCampaign = copy(cState.campaign);
            };

            this.update = function(action) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to ' + action + ' your campaign? ' +
                        'Submitting this update will lock your campaign from further' +
                        ' edits until the change is approved.',
                    affirm: 'Yes, submit this change',
                    cancel: 'Cancel',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        ConfirmDialogService.close();

                        return submitUpdate(action);
                    })
                });
            };

            this.safeUpdate = queue.debounce(function() {
                if (this.canSubmit) {
                    return submitUpdate();
                }
            }, this);

            this.updatePaymentMethod = queue.debounce(function() {
                SelfieManageCampaignCtrl.paymentStatus = null;

                if (this.canSubmit) {
                    return submitUpdate('paymentMethod')
                        .then(function() {
                            SelfieManageCampaignCtrl.paymentStatus = 'success';
                        })
                        .catch(function() {
                            SelfieManageCampaignCtrl.paymentStatus = 'failed';
                        });
                }
            }, this);

            this.copy = queue.debounce(function() {
                return CampaignService.create(this.campaign.pojoify())
                    .save().then(function(campaign) {
                        return c6State.goTo('Selfie:EditCampaign', [campaign]);
                    });
            }, this);

            this.edit = function(campaign) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to edit your campaign? Submitting ' +
                        'changes will lock the campaign until they are approved.',
                    affirm: 'Yes, take me to the editor',
                    cancel: 'No, leave me here',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        ConfirmDialogService.close();

                        return c6State.goTo('Selfie:EditCampaign', [campaign]);
                    })
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Manage:Campaign:Manage', [function() {
                this.templateUrl = 'views/selfie/campaigns/manage/manage.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Manage:Campaign:Payment', [function() {
                this.templateUrl = 'views/selfie/campaigns/manage/payment.html';
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Manage:Campaign:Admin', ['cinema6','$q','c6State',
            function                                              ( cinema6 , $q , c6State ) {
                this.templateUrl = 'views/selfie/campaigns/manage/admin.html';
                this.controller = 'SelfieManageCampaignAdminController';
                this.controllerAs = 'SelfieManageCampaignAdminCtrl';

                this.campaign = null;

                this.beforeModel = function() {
                    this.campaign = this.cParent.campaign;
                };

                this.model = function() {
                    var model = {
                        updateRequest: null
                    };
                    if(this.campaign.updateRequest) {
                        var updateHash = this.campaign.id + ':' + this.campaign.updateRequest;
                        model.updateRequest = cinema6.db.find('updateRequest', updateHash);
                    }
                    return $q.all(model);
                };

                this.enter = function() {
                    if (!this.cParent.isAdmin) {
                        return c6State.goTo('Selfie:Manage:Campaign:Manage');
                    }
                };
            }]);
        }])

        .controller('SelfieManageCampaignAdminController', ['c6State', 'cState', 'cinema6',
                                                            '$scope', 'c6Debounce',
        function                                           ( c6State ,  cState ,  cinema6 ,
                                                             $scope ,  c6Debounce ){
            var self = this;
            var updateRequest;

            this.initWithModel = function(model) {
                updateRequest = model.updateRequest;
                extend(self, {
                    showApproval: false,
                    campaign: cState.campaign.pojoify(),
                    updatedCampaign: cState.campaign.pojoify(),
                    previewCard: null,
                    rejectionReason: ''
                });
                if(updateRequest) {
                    var updates = updateRequest.data;
                    merge(self.updatedCampaign, updates);
                    extend(self, {
                        showApproval: true,
                        previewCard: copy(self.updatedCampaign.cards[0])
                    });
                }
            };

            this.approveCampaign = function() {
                updateRequest.data = self.updatedCampaign;
                updateRequest.status = 'approved';
                updateRequest.save().then(function() {
                    c6State.goTo('Selfie:CampaignDashboard');
                });
            };

            this.rejectCampaign = function() {
                extend(updateRequest, {
                    status: 'rejected',
                    rejectionReason: self.rejectionReason
                }).save().then(function() {
                    c6State.goTo('Selfie:CampaignDashboard');
                });
            };

            this._loadPreview = c6Debounce(function(args) {
                var _card = copy(args[0]);
                _card.params.sponsor = self.updatedCampaign.advertiserDisplayName;
                self.previewCard = _card;
            }, 2000);

            $scope.$watch(function() {
                return self.updatedCampaign.cards[0];
            }, function(card) {
                self._loadPreview(card);
            }, true);
        }]);
});
