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
        isArray = angular.isArray;

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
                    'draft,pending,approved,active,paused,canceled,expired,error';
                this.filterBy = $location.search().filterBy || 'statuses';
                this.sort = $location.search().sort || 'lastUpdated,-1';

                extend(this.queryParams, {
                    filter: '=',
                    filterBy: '=',
                    sort: '=',
                    search: '='
                });

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

            Object.defineProperties(this, {
                allStatusesChecked: {
                    get: function() {
                        return this.filters.filter(function(status) {
                            return status.checked;
                        }).length === this.filters.length;
                    }
                }
            });

            this.toggleAllStatuses = function(bool) {
                this.filters.forEach(function(status) {
                    status.checked = bool;
                });
                this.toggleFilter();
            };

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
                    'canceled',
                    'expired',
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
                    var cState = this,
                        id = campaign.updateRequest ?
                            campaign.id + ':' + campaign.updateRequest :
                            null;

                    this.campaign = CampaignService.normalize(campaign);

                    return (id ? cinema6.db.find('updateRequest', id) : $q.when(null))
                        .then(function(updateRequest) {
                            cState.updateRequest = updateRequest;
                        });
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
                this.updateRequest = null;
                this._campaign = null;
                this._updateRequest = null;

                this.allowExit = false;

                this.beforeModel = function() {
                    // we need this for saving the update request
                    this._updateRequest = this.cParent.updateRequest;

                    // we need a copy of the update request for binding
                    // in the UI. We'll use this to update the DB model
                    // when we save/submit
                    this.updateRequest = this._updateRequest && this._updateRequest.pojoify();

                    // this will alwyas be a c6DB campaign model
                    // we need this for autosaving 'draft' campaigns
                    // and for deleting 'pending' campaigns
                    this._campaign = this.cParent.campaign;

                    // if we have an update request we want to use it
                    // to bind in the UI, this way it always refelects
                    // the latest updates the user has made.
                    this.campaign = (this.updateRequest && this.updateRequest.data) ||
                        this.cParent.campaign.pojoify();

                    // these are always necessary
                    this.card = this.campaign.cards[0];
                    this.advertiser = SelfieState.cModel.advertiser;
                    this.isCreator = !this.campaign.user ||
                        this.campaign.user === SelfieState.cModel.id;
                };

                this.model = function() {
                    return $q.all({
                        categories: cinema6.db.findAll('category', {type: 'interest'}),
                        logos: SelfieLogoService.getLogos(),
                        paymentMethods: cinema6.db.findAll('paymentMethod', {
                            org: this.campaign.org || SelfieState.cModel.org.id
                        })
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
                    var deferred = $q.defer(),
                        proxyCampaign = this.campaign,
                        masterCampaign = this._campaign,
                        masterUpdateRequest = this._updateRequest,
                        isClean = (masterCampaign.updateRequest &&
                            equals(masterUpdateRequest.data, proxyCampaign)) ||
                            (!masterCampaign.updateRequest &&
                            equals(masterCampaign.pojoify(), proxyCampaign));

                    if (masterCampaign.status !== 'draft') {
                        if (this.allowExit || isClean || !masterCampaign.status) {
                            return $q.when(null);
                        } else {
                            ConfirmDialogService.display({
                                prompt: 'Are you sure you want to leave? You will ' +
                                    'lose your changes if you continue.',
                                affirm: 'Yes',
                                cancel: 'No',

                                onCancel: function() {
                                    deferred.reject();

                                    return ConfirmDialogService.close();
                                },
                                onAffirm: function() {
                                    deferred.resolve();

                                    return ConfirmDialogService.close();
                                }
                            });

                            return deferred.promise;
                        }
                    }

                    return this.saveCampaign()
                        .catch(function() {
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

                this.saveUpdateRequest = function() {
                    var cState = this;

                    return campaignExtend(this._updateRequest, this.updateRequest).save()
                        .then(function() {
                            return cState.updateRequest;
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
                                                 'c6Debounce','c6AsyncQueue','ConfirmDialogService',
                                                 'CampaignService','SelfieCampaignSummaryService',
        function                                ( $scope , $log , c6State , cState , cinema6 , $q ,
                                                  c6Debounce , c6AsyncQueue , ConfirmDialogService ,
                                                  CampaignService , SelfieCampaignSummaryService ) {
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
                    campaign;

                if (cState.updateRequest) {
                    return cState.saveUpdateRequest();
                }

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

                cState.allowExit = true;

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
                        var sections = [];

                        forEach(this.validation.sections, function(section) {
                            sections.push(section);
                        });

                        return sections.indexOf(false) < 0;
                    }
                },
                isClean: {
                    get: function() {
                        return equals(this.campaign, this._proxyCampaign);
                    }
                }
            });

            this.validation = {
                budget: true,
                show: false
            };

            Object.defineProperties(this.validation, {
                sections: {
                    get: function() {
                        var campaign = SelfieCampaignCtrl.campaign,
                            card = SelfieCampaignCtrl.card;

                        return {
                            section1: !!campaign.name,
                            section2: !!campaign.advertiserDisplayName && !!card.links.Website,
                            section3: !!card.data.service && !!card.data.videoid,
                            section4: !!card.title && !!card.links.Action &&
                                !!card.params.action.label,
                            section5: true,
                            section6: this.budget,
                            section7: true,
                            section8: true
                        };
                    }
                }
            });

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

                // this is so we can go back to the manager screen
                // and pass the real campaign since this.campaign
                // might be bound to updateRequest.data instead of
                // an actual campaign
                this.originalCampaign = cState._campaign;
            };

            this.save = function() {
                $log.info('saving');

                $scope.$broadcast('SelfieCampaignWillSave');

                return saveCampaign()
                    .then(updateProxy)
                    .catch(handleError);
            };

            this.submit = function() {
                var isDraft = cState._campaign.status === 'draft';

                if (!SelfieCampaignCtrl.canSubmit) {
                    SelfieCampaignCtrl.validation.show = true;
                    return;
                }

                if (!isDraft && this.isClean) {
                    return ConfirmDialogService.display({
                        prompt: 'No changes have been detected.',
                        affirm: 'OK',

                        onCancel: function() {
                            return ConfirmDialogService.close();
                        },
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                SelfieCampaignSummaryService.display({
                    campaign: this.campaign,
                    interests: this.categories,
                    schema: this.schema,

                    onCancel: function() {
                        return SelfieCampaignSummaryService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        SelfieCampaignSummaryService.close();

                        return (isDraft ? saveCampaign() : $q.when(SelfieCampaignCtrl.campaign))
                            .then(createUpdateRequest)
                            .then(setPending)
                            .then(returnToDashboard)
                            .catch(handleError);
                    })
                });
            };

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
                var campaign = SelfieCampaignCtrl.campaign || {},
                    card = SelfieCampaignCtrl.card;

                return [
                    campaign.pricing,
                    campaign.targeting,
                    campaign.paymentMethod,
                    card.campaign.endDate,
                    card.campaign.startDate
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

        .controller('SelfieFlightDatesController', ['$scope',
        function                                   ( $scope ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                originalCampaign = SelfieCampaignCtrl.originalCampaign,
                campaign = SelfieCampaignCtrl.campaign,
                card = SelfieCampaignCtrl.card,
                campaignHash = card.campaign;

            var now = new Date();
            now.setHours(0,0,1);

            function pad(num) {
                var norm = Math.abs(Math.floor(num));
                return (norm < 10 ? '0' : '') + norm;
            }

            function fromISO(string) {
                if (!string) { return; }

                var date = new Date(string);

                return pad(date.getMonth() + 1) +
                    '/' + pad(date.getDate()) +
                    '/' + date.getFullYear();
            }

            function toISO(type, string) {
                if (!string) { return; }

                var date = new Date(string);

                date.setHours.apply(date, (type === 'start' ? [0,1] : [23,59]));

                return date.toISOString();
            }

            Object.defineProperties(this, {
                validStartDate: {
                    get: function() {
                        var startDate = this.startDate && new Date(this.startDate),
                            endDate = this.endDate && new Date(this.endDate);

                        // need this in case user chooses today.
                        // set to end of day so startDate > now
                        if (startDate) {
                            startDate.setHours(23,59);
                        }
                        if (endDate) {
                            endDate.setHours(23,59);
                        }

                        return !startDate || !this.editableStartDate ||
                            (startDate && startDate instanceof Date && startDate > now &&
                                (!endDate || (endDate && startDate <= endDate)));
                    }
                },
                validEndDate: {
                    get: function() {
                        var startDate = this.startDate && new Date(this.startDate),
                            endDate = this.endDate && new Date(this.endDate);

                        // need this in case user chooses today.
                        // set to end of day so endDate > now
                        if (endDate) {
                            endDate.setHours(23,59);
                        }

                        return !endDate || (endDate && endDate instanceof Date && endDate > now &&
                            (!startDate || (startDate && endDate > startDate)));
                    }
                },
                editableStartDate: {
                    get: function() {
                        var startDate = campaignHash.startDate && new Date(campaignHash.startDate);

                        return (!startDate || startDate > now) ||
                            (!campaign.status || campaign.status === 'draft' ||
                                originalCampaign.status === 'pending');
                    }
                },
                canShowError: {
                    get: function() {
                        return !originalCampaign.status ||
                            originalCampaign.status === 'draft' ||
                            this.hasChanged;
                    }
                },
                imminentDates: {
                    get: function() {
                        var start = this.startDate,
                            end = this.endDate,
                            today = fromISO(now),
                            tomorrow = new Date(now);

                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow = fromISO(tomorrow);

                        return this.editableStartDate && this.validStartDate && this.validEndDate &&
                            ((start && (start === today || start === tomorrow)) ||
                            (end && (end === today || end === tomorrow)));
                    }
                }
            });

            this.startDate = fromISO(campaignHash.startDate);
            this.endDate = fromISO(campaignHash.endDate);
            this.hasChanged = false;
            this.isPending = originalCampaign.status === 'pending';

            this.setDates = function() {
                if (this.startDate !== fromISO(campaignHash.startDate) ||
                    this.endDate !== fromISO(campaignHash.endDate)) {
                    this.hasChanged = true;
                }

                campaignHash.startDate = this.validStartDate ?
                    toISO('start', this.startDate) : campaignHash.startDate;
                campaignHash.endDate = this.validEndDate ?
                    toISO('end', this.endDate) : campaignHash.endDate;
            };
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
                    (card.collateral.logo && (option.src === card.collateral.logo)) ||
                    (!card.collateral.logo && defaultLogo && option.type === 'none');
            })[0] || this.logoOptions[1];

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
                                                      'c6Debounce',
        function                                     ( $injector , $scope , SelfieVideoService ,
                                                       c6Debounce ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignVideoCtrl = this,
                card = SelfieCampaignCtrl.card,
                service = card.data.service,
                id = card.data.videoid,
                hasExistingVideo = !!service && !!id;

            function handleVideoError() {
                SelfieCampaignVideoCtrl.videoError = true;
                SelfieCampaignVideoCtrl.video = null;
            }

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

            // watch the video link/embed/vast tag input
            // and then do all the checking/getting of data
            $scope.$watch(function() {
                return SelfieCampaignVideoCtrl.videoUrl;
            }, SelfieCampaignVideoCtrl.updateUrl);

        }])

        .controller('SelfieCampaignTextController', ['$scope',
        function                                    ( $scope ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignTextCtrl = this,
                card = SelfieCampaignCtrl.card;

            function generateLink(link) {
                var hasProtocol = (/^http:\/\/|https:\/\//).test(link),
                    hasSlashes = (/^\/\//).test(link);

                if (hasProtocol) {
                    return link;
                }

                if (link) {
                    return (hasSlashes ? 'http:' : 'http://') + link;
                }

                return link;
            }

            card.links.Action = card.links.Action || card.links.Website;
            card.params.action = card.params.action || { type: 'button' };
            card.params.action.label =  card.params.action.label || 'Learn More';

            this.bindLinkToWebsite = !card.links.Action;
            this.actionLink = card.links.Action;

            this.updateActionLink = function(link) {
                link = generateLink(link);

                card.links.Action = link;
                SelfieCampaignTextCtrl.actionLink = link;
            };

            $scope.$watch(function() {
                return card.links.Website;
            }, function(website) {
                if (website && SelfieCampaignTextCtrl.bindLinkToWebsite) {
                    SelfieCampaignTextCtrl.updateActionLink(website);
                }
            });

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
                _card.params.action = _card.params.action || { type: 'button' };
                _card.params.action.label = _card.params.action.label || 'Learn More';
                _card.links.Action = _card.links.Action || 'http://reelcontent.com';

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
            c6StateProvider.state('Selfie:Manage:Campaign', ['cinema6','$q','c6State','CampaignService',
            function                                        ( cinema6 , $q , c6State , CampaignService ) {
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
                    var updateRequest = this.campaign.updateRequest ?
                        this.campaign.id + ':' + this.campaign.updateRequest :
                        null;

                    return $q.all({
                        paymentMethods: cinema6.db.findAll('paymentMethod', {
                            org: this.campaign.org
                        }),
                        updateRequest:  updateRequest ?
                            cinema6.db.find('updateRequest', updateRequest) :
                            null,
                        stats: CampaignService.getAnalytics(this.campaign.id)
                    });
                };

                this.afterModel = function(model) {
                    var user = c6State.get('Selfie').cModel;

                    this.isAdmin = (user.entitlements.adminCampaigns === true);
                    this.updateRequest = model.updateRequest;
                    this.hasStats = !!model.stats.length;
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
                var Ctrl = SelfieManageCampaignCtrl,
                    updateRequest = Ctrl.updateRequest,
                    campaign = (updateRequest || {}).data || Ctrl.campaign.pojoify(),
                    id = Ctrl.campaign.id;

                if (action === 'delete') {
                    // if status is pending, expired, canceled
                    // use the campaigns endpoint
                    return Ctrl.campaign.erase();
                }

                if (action) {
                    // most actions are status changes, except for
                    // paymentMethod, which is handled below
                    campaign.status = statusFor(action);
                }

                if (action === 'paymentMethod') {
                    // the payment method can be auto-approved
                    // but to do this it must be the only property
                    // included in the body of the campaign
                    campaign = {
                        paymentMethod: campaign.paymentMethod
                    };
                }

                if (updateRequest) {
                    // if we have an existing updateRequest then
                    // update the data and save()
                    updateRequest.data = campaign;
                    return updateRequest.save();
                }

                return cinema6.db.create('updateRequest', {
                    data: campaign,
                    campaign: id
                }).save();
            }

            function setUpdateRequest(updateRequest) {
                var campaign = SelfieManageCampaignCtrl.campaign;

                if (updateRequest && updateRequest.status !== 'approved') {
                    // make sure the current campaign has the update request
                    // prop, make sure the Ctrl has the update request in
                    // case the user wants to make more updates, make sure
                    // the cState has the update request in case the user
                    // is an admin and wants access to it in the Admin tab
                    campaign.updateRequest = updateRequest.id.split(':')[1];
                    SelfieManageCampaignCtrl.updateRequest = updateRequest;
                    cState.updateRequest = updateRequest;
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
                    .then(function() {
                        if ((/delete|cancel/).test(action)) {
                            // if user has deleted or canceled the campaign
                            // we probably want to go back the dashboard
                            c6State.goTo('Selfie:CampaignDashboard');
                        }
                    })
                    .catch(handleError);
            }

            Object.defineProperties(this, {
                canSubmit: {
                    get: function() {
                        return !equals(this.campaign, this._proxyCampaign) &&
                            !!this.campaign.paymentMethod;
                    }
                },
                canEdit: {
                    get: function() {
                        return (/pending|active|paused/).test(this.campaign.status) &&
                            (!this.updateRequest ||
                                (this.updateRequest && this.updateRequest.data &&
                                this.updateRequest.data.status !== 'canceled'));
                    }
                },
                canCancel: {
                    get: function() {
                        return (/active|paused/).test(this.campaign.status) &&
                            (!this.updateRequest ||
                                (this.updateRequest && this.updateRequest.data &&
                                this.updateRequest.data.status !== 'canceled'));
                    }
                },
                canDelete: {
                    get: function() {
                        return (/expired|canceled|pending/).test(this.campaign.status);
                    }
                }
            });

            this.initWithModel = function(model) {
                this.card = cState.card;
                this.campaign = cState.campaign;
                this.showAdminTab = cState.isAdmin;

                this.categories = model.categories;
                this.paymentMethods = model.paymentMethods;
                this.updateRequest = model.updateRequest;
                this.stats = model.stats;

                this._proxyCampaign = copy(cState.campaign);
            };

            this.update = function(action) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to ' + action + ' your campaign? ' +
                        'This change may take up to 24 hours to be approved.',
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

            this.edit = queue.debounce(function() {
                return c6State.goTo('Selfie:EditCampaign', [this.campaign]);
            }, this);
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
            c6StateProvider.state('Selfie:Manage:Campaign:Stats', ['c6State',
            function                                              ( c6State ) {
                this.templateUrl = 'views/selfie/campaigns/manage/stats.html';
                this.controller = 'SelfieManageCampaignStatsController';
                this.controllerAs = 'SelfieManageCampaignStatsCtrl';

                this.enter = function() {
                    if (!this.cParent.hasStats) {
                        return c6State.goTo('Selfie:Manage:Campaign:Manage');
                    }
                };
            }]);
        }])

        .controller('SelfieManageCampaignStatsController', ['$scope',
        function                                           ( $scope ) {
            var SelfieManageCampaignCtrl = $scope.SelfieManageCampaignCtrl,
                stats = SelfieManageCampaignCtrl.stats[0] || {},
                linkClicks = (stats.summary && stats.summary.linkClicks) || [],
                shareClicks = (stats.summary && stats.summary.shareClicks) || [];

            this.totalClicks = (function() {
                var total = 0;
                forEach(linkClicks, function(item) { total += item; });
                return total;
            }());

            this.totalShares = (function() {
                var total = 0;
                forEach(shareClicks, function(item) { total += item; });
                return total;
            }());

            console.log(this.totalClicks, this.totalShares);
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
                    this.updateRequest = this.cParent.updateRequest;
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

            this.initWithModel = function() {
                updateRequest = cState.updateRequest;
                extend(self, {
                    showApproval: false,
                    campaign: cState.campaign.pojoify(),
                    updatedCampaign: cState.campaign.pojoify(),
                    previewCard: null,
                    rejectionReason: ''
                });
                if(updateRequest) {
                    self.updatedCampaign = updateRequest.data;
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
