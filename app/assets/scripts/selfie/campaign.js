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

    var _campaignListParams = {};

    function pad(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    }

    return angular.module('c6.app.selfie.campaign', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:CampaignDashboard', ['c6State','cinema6',
                                                               'CampaignService',
            function                                          ( c6State , cinema6 ,
                                                                CampaignService ) {
                this.beforeModel = function() {
                    var cState = this,
                        user = c6State.get('Selfie').cModel,
                        org = user.org.id;

                    cinema6.db.findAll('advertiser', {org: org})
                        .then(function(advertisers) {
                            cState.hasAdvertisers = !!advertisers.length;
                        });
                };

                this.afterModel = function() {
                    var cState = this;

                    return CampaignService.getOrgs()
                        .then(function(orgs) {
                            cState.orgs = orgs;
                        });
                };

                this.enter = function() {
                    c6State.goTo('Selfie:Campaigns');
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Campaigns', ['$injector','SettingsService','$q',
                                                       'paginatedDbList','c6State',
                                                       'SpinnerService','$location',
            function                                  ( $injector , SettingsService , $q ,
                                                        paginatedDbList , c6State ,
                                                        SpinnerService , $location ) {
                var pending = $location.search().pending;

                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/selfie/campaigns.html';
                this.controller = 'SelfieCampaignsController';
                this.controllerAs = 'SelfieCampaignsCtrl';

                this.params = _campaignListParams;

                this.beforeModel = function() {
                    var user = c6State.get('Selfie').cModel,
                        config = user.config,
                        orgs = this.cParent.orgs || [],
                        hasSingleOrg = orgs.length === 1 && orgs[0].id === user.org.id,
                        excludeOrgs = (config.platform && config.platform.excludeOrgs) || [],
                        params = SettingsService.getReadOnly('Selfie::params');

                    if (!params) {
                        SettingsService.register('Selfie::params', this.params, {
                            defaults: {
                                filter: 'error,draft,pending,active,paused,canceled,'+
                                    'completed,outOfBudget,expired',
                                filterBy: 'statuses',
                                sort: 'lastUpdated,-1',
                                search: null,
                                excludeOrgs: (!hasSingleOrg && excludeOrgs.join(',')) || null
                            },
                            sync: function(settings) {
                                var savedOrgs = (config.platform || {}).excludeOrgs,
                                    newOrgs = (!hasSingleOrg && settings.excludeOrgs &&
                                        settings.excludeOrgs.split(',')) || [];

                                if (!equals(savedOrgs, newOrgs)) {
                                    config.platform = config.platform || {};
                                    config.platform.excludeOrgs = newOrgs;
                                    user.save();
                                }
                            },
                            localSync: user.id,
                            validateLocal: function(currentUserId, prevUserId) {
                                return currentUserId === prevUserId;
                            }
                        });

                        params = SettingsService.getReadOnly('Selfie::params');
                    }

                    this.filter = params.filter;
                    this.filterBy = params.filterBy;
                    this.sort = params.sort;
                    this.search = params.search;
                    this.excludeOrgs = params.excludeOrgs;

                    extend(this.queryParams, {
                        filter: '=',
                        filterBy: '=',
                        sort: '=',
                        search: '=',
                        excludeOrgs: '='
                    });
                };

                this.model = function() {
                    SpinnerService.display();

                    return paginatedDbList(
                        'selfieCampaign',
                        extend({
                            sort: this.sort,
                            application: 'selfie',
                            statuses: this.filter,
                            text: this.search,
                            excludeOrgs: this.excludeOrgs
                        }, (pending ? {pendingUpdate: true } : {})),
                        this.limit,
                        this.page
                    ).ensureResolution()
                        .finally(function() {
                            SpinnerService.close();
                        });
                };
                this.afterModel = function() {
                    var user = c6State.get('Selfie').cModel;

                    this.isAdmin = (user.entitlements.adminCampaigns === true);
                };
            }]);
        }])

        .controller('SelfieCampaignsController', ['$injector','$scope','$q','cState',
                                                  'ConfirmDialogService','ThumbnailService',
                                                  'CampaignService','cinema6','SpinnerService',
        function                                 ( $injector , $scope , $q , cState ,
                                                   ConfirmDialogService , ThumbnailService ,
                                                   CampaignService , cinema6 , SpinnerService ) {
            var SelfieCampaignsCtrl = this;

            $injector.invoke(PaginatedListController, this, {
                cState: cState,
                $scope: $scope
            });

            function thumbFor(card) {
                var data = card.data,
                    service = data.service,
                    id = data.videoid,
                    thumb = card.thumb;

                if (thumb) { return $q.when(thumb); }

                if (service && id) {
                    return ThumbnailService.getThumbsFor(service, id, data)
                        .ensureFulfillment()
                        .then(function(thumbs) {
                            return thumbs.large;
                        });
                }

                return $q.when(null);
            }

            function generateStats(stats, campaign) {
                var totalSpend = parseFloat(stats.summary.totalSpend),
                    todaySpend = parseFloat(stats.today.totalSpend),
                    budget = campaign.pricing.budget,
                    limit = campaign.pricing.dailyLimit;

                return {
                    total: {
                        views: stats.summary.views,
                        spend: totalSpend,
                        budget: budget,
                        remaining: totalSpend ? ((1 - (totalSpend / budget)) * 100) : 100,
                        interactions: (function() {
                            var total = 0;
                            forEach(stats.summary.linkClicks, function(clicks) {
                                total += clicks;
                            });
                            forEach(stats.summary.shareClicks, function(clicks) {
                                total += clicks;
                            });
                            return total;
                        }())
                    },
                    today: {
                        views: stats.today.views,
                        spend: todaySpend,
                        budget: limit || null,
                        remaining: limit ?
                            (((todaySpend / limit && (1 - todaySpend / limit)) * 100) || 100) :
                            null,
                        interactions: (function() {
                            var total = 0;
                            forEach(stats.today.linkClicks, function(clicks) {
                                total += clicks;
                            });
                            forEach(stats.today.shareClicks, function(clicks) {
                                total += clicks;
                            });
                            return total;
                        }())
                    }
                };
            }

            function updateModelData() {
                var Ctrl = SelfieCampaignsCtrl,
                    model = Ctrl.model.items.value,
                    ids = {
                        campaigns: [],
                        users: [],
                        updateRequests: []
                    };

                // create an object that contains all sorts of computed data
                // for each camapign. Each campaign object is stored by id
                // for access in the view. As we loop through all the
                // campaigns in the model we keep track of all the different
                // campaign ids, user ids and update request ids so we can
                // query for data as needed. We initialize each campaign
                // object with a "campaign" property containing the current
                // campaign object and preview url. The campaign data will
                // be replaced later if there is a pending update request on
                // the campaign because we want to show the most current data.
                Ctrl.data = model.reduce(function(result, campaign) {
                    if (ids.campaigns.indexOf(campaign.id) < 0) {
                        ids.campaigns.push(campaign.id);
                    }
                    if (ids.users.indexOf(campaign.user) < 0) {
                        ids.users.push(campaign.user);
                    }
                    if (campaign.updateRequest &&
                        ids.updateRequests.indexOf(campaign.updateRequest) < 0) {
                        ids.updateRequests.push(campaign.updateRequest);
                    }

                    result[campaign.id] = {
                        campaign: campaign,
                        previewUrl: CampaignService.previewUrlOf(campaign),
                        status: /completed|outOfBudget/.test(campaign.status) ?
                            'Out of Budget' : campaign.status
                    };

                    return result;
                }, {});

                // request needed data
                $q.all({
                    updateRequests: ids.updateRequests.length ?
                        cinema6.db.findAll('updateRequest', {ids: ids.updateRequests.join(',')}) :
                        [],
                    analytics: ids.campaigns.length ?
                        CampaignService.getAnalytics({ids: ids.campaigns.join(',')}) :
                        [],
                    users: ids.users.length && cState.isAdmin ?
                        CampaignService.getUserData(ids.users.join(',')) :
                        {}
                }).then(function(data) {
                    // update requests: loop through all the found update requests
                    // and replace the original campaign with the updated data
                    data.updateRequests.forEach(function(updateRequest) {
                        var id = updateRequest.campaign;

                        Ctrl.data[id].campaign = updateRequest.data;
                    });

                    // analytics: loop through each set of stats we found and
                    // generate the stats data (uses function defined above)
                    data.analytics.forEach(function(stat) {
                        var id = stat.campaignId;

                        Ctrl.data[id].stats = generateStats(stat, Ctrl.data[id].campaign);
                    });

                    // now that all campaign objects contain the latest and greatest
                    // data we loop through every campaign and get the thumbnail,
                    // logo, and user data (if necessary)
                    model.forEach(function(campaign) {
                        var id = campaign.id,
                            camp = Ctrl.data[id].campaign,
                            card = camp.cards && camp.cards[0];

                        if (!card) { return; }

                        // add logo
                        Ctrl.data[id].logo = card.collateral.logo;

                        // add user
                        Ctrl.data[id].user = data.users[campaign.user];

                        // add thumbnail
                        thumbFor(card).then(function(thumb) {
                            Ctrl.data[id].thumb = thumb;
                        });
                    });
                });
            }

            Object.defineProperties(this, {
                allStatusesChecked: {
                    get: function() {
                        return this.filters.filter(function(status) {
                            return status.checked;
                        }).length === this.filters.length;
                    }
                },
                allOrgsChecked: {
                    get: function() {
                        return this.orgs.filter(function(status) {
                            return status.checked;
                        }).length === this.orgs.length;
                    }
                }
            });

            this.initWithModel = function(model) {
                this.model = model;
                this.hasAdvertisers = cState.cParent.hasAdvertisers;
                this.params = cState.params;
                this.searchText = this.params.search;

                updateModelData();
                model.on('PaginatedListHasUpdated', updateModelData);
                model.on('PaginatedListHasUpdated', SpinnerService.close);
                model.on('PaginatedListWillUpdate', SpinnerService.display);

                this.filters = [
                    'draft',
                    'pending',
                    'active',
                    'paused',
                    'canceled',
                    'completed,outOfBudget',
                    'expired'
                ].map(function(filter) {
                    var name = filter === 'completed,outOfBudget' ? 'Out of Budget' : filter;

                    return {
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        id: filter,
                        checked: SelfieCampaignsCtrl.filter.indexOf(filter) > -1
                    };
                });

                this.allOrgs = cState.cParent.orgs.map(function(org) {
                    return {
                        name: org.name,
                        id: org.id,
                        checked: (SelfieCampaignsCtrl.excludeOrgs || '').indexOf(org.id) === -1
                    };
                });
                this.orgs = this.allOrgs;
                this.showOrgFilter = false;
                this.showFilterDropdown = false;
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
                this.params.sort = this.sort;
            };

            this.doSearch = function(text) {
                this.search = text || undefined;
                this.params.search = this.search;
            };

            this.applyFilters = function() {
                if (this.showFilterDropdown) {
                    this.toggleFilter();
                    this.toggleOrg();
                    this.showFilterDropdown = false;
                }
            };

            this.toggleDropdown = function() {
                if (this.showFilterDropdown) {
                    this.applyFilters();
                } else {
                    this.showFilterDropdown = true;
                }
            };

            this.toggleFilter = function() {
                this.filter = this.filters.reduce(function(filters, filter) {
                    return filter.checked ? filters.concat(filter.id) : filters;
                },['error']).join(',');
                this.params.filter = this.filter;
            };

            this.toggleAllStatuses = function(bool) {
                this.filters.forEach(function(status) {
                    status.checked = bool;
                });
            };

            this.toggleOrg = function(org) {
                if (org) {
                    this.allOrgs[this.allOrgs.indexOf(org)].checked = org.checked;
                }

                this.excludeOrgs = this.allOrgs.reduce(function(filters, filter) {
                    return !filter.checked ? filters.concat(filter.id) : filters;
                },[]).join(',') || null;

                this.params.excludeOrgs = this.excludeOrgs;
            };

            this.toggleAllOrgs = function(bool) {
                var allOrgs = this.allOrgs;

                this.orgs.forEach(function(org) {
                    allOrgs[allOrgs.indexOf(org)].checked = bool;
                });
            };

            this.searchOrgs = function(text) {
                this.orgs = this.allOrgs.filter(function(org) {
                    var lowerCase = text.toLowerCase();

                    return !text || org.name.toLowerCase().indexOf(lowerCase) > -1 ||
                        org.id.toLowerCase().indexOf(lowerCase) > -1;
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:NewCampaign', ['cinema6','c6State','CampaignService',
            function                                    ( cinema6 , c6State , CampaignService ) {
                this.beforeModel = function() {
                    var cState = this,
                        user = c6State.get('Selfie').cModel,
                        org = user.org.id;

                    this.user = user;

                    return cinema6.db.findAll('advertiser', {org: org})
                        .then(function(advertisers) {
                            cState.advertiser = advertisers[0];
                        });
                };

                this.model = function() {
                    return CampaignService.create(null, this.user, this.advertiser);
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

                    return $q.all({
                        updateRequest: (id ? cinema6.db.find('updateRequest', id) : $q.when(null)),
                        user: cinema6.db.find('user', campaign.user),
                        advertiser: cinema6.db.find('advertiser', campaign.advertiserId)
                    }).then(function(promises) {
                        var ur = promises.updateRequest;

                        if (ur && ur.data) {
                            ur.data = CampaignService.normalize(ur.data, promises.user);
                        }

                        cState.updateRequest = ur;
                        cState.user = promises.user;
                        cState.advertiser = promises.advertiser;
                        cState.campaign = CampaignService.normalize(campaign, promises.user);
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
                                                      'SpinnerService','intercom',
            function                                 ( cinema6 , SelfieLogoService , c6State , $q ,
                                                       CampaignService , ConfirmDialogService ,
                                                       SpinnerService , intercom ) {
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
                    this.advertiser = this.cParent.advertiser;
                    this.isCreator = !this.campaign.user ||
                        this.campaign.user === SelfieState.cModel.id;

                    this.user = this.cParent.user;
                    this.paymentOptional = !!SelfieState.cModel.entitlements.paymentOptional;
                };

                this.model = function() {
                    SpinnerService.display();

                    return $q.all({
                        categories: cinema6.db.findAll('category', {type: 'interest'}),
                        logos: SelfieLogoService.getLogos(this.campaign.org || this.user.org.id),
                        paymentMethods: cinema6.db.findAll('paymentMethod', {
                            org: this.campaign.org || SelfieState.cModel.org.id
                        })
                    }).catch(function() {
                        c6State.goTo('Selfie:CampaignDashboard');
                        return $q.reject();
                    })
                    .finally(function() {
                        SpinnerService.close();
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
                        isNew = !current.status && !master.status,
                        saveable = this.isCreator && !master._erased &&
                            (!current.status || current.status === 'draft');

                    if (!saveable) {
                        return $q.when(cState.campaign);
                    }

                    return campaignExtend(this._campaign, this.campaign).save()
                        .then(function() {
                            var intercomData = {
                                    campaignId: master.id,
                                    campaignName: master.name || null,
                                    advertiserId: master.advertiserId,
                                    advertiserName: master.advertiserDisplayName || null
                                },
                                shouldSendUpdate = !cState.intercomData ||
                                    !equals(cState.intercomData, intercomData);

                            if (isNew) {
                                intercom('trackEvent', 'createCampaign', intercomData);
                            } else if (shouldSendUpdate) {
                                intercom('trackEvent', 'updateCampaign', intercomData);
                                cState.intercomData = intercomData;
                            }

                            return cState.campaign;
                        });
                };
            }]);
        }])

        .controller('SelfieCampaignController', ['$scope','$log','c6State','cState','cinema6','$q',
                                                 'c6Debounce','c6AsyncQueue','ConfirmDialogService',
                                                 'CampaignService','SelfieCampaignSummaryService',
                                                 'SoftAlertService','intercom',
        function                                ( $scope , $log , c6State , cState , cinema6 , $q ,
                                                  c6Debounce , c6AsyncQueue , ConfirmDialogService ,
                                                  CampaignService , SelfieCampaignSummaryService ,
                                                  SoftAlertService , intercom ) {
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
                SelfieCampaignSummaryService.close();
                SelfieCampaignSummaryService.pending(false);

                return c6State.goTo('Selfie:CampaignDashboard');
            }

            function handleSuccess() {
                SoftAlertService.display({
                    success: true,
                    action: 'saved',
                    timer: 3500
                });
            }

            function handleSaveError() {
                SoftAlertService.display({
                    success: false,
                    timer: 3500
                });
            }

            function showErrorModal(error) {
                ConfirmDialogService.display({
                    prompt: 'There was an a problem processing your request: ' + error.data,
                    affirm: 'OK',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    }
                });
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
                }).save().then(function() {
                    if (isDraft) {
                        intercom('trackEvent', 'submitCampaign', {
                            campaignId: campaign.id,
                            campaignName: campaign.name,
                            advertiserId: campaign.advertiserId,
                            advertiserName: campaign.advertiserDisplayName
                        });
                    }
                });
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
            this.maxHeadlineLength = 40;
            this.maxDescriptionLength = 400;
            this.maxCallToActionLength = 25;

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
                radius: true,
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
                            section5: this.radius,
                            section6: this.budget && this.dailyLimit,
                            section7: !!campaign.paymentMethod ||
                                !!SelfieCampaignCtrl.paymentOptional,
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
                this.user = cState.user;
                this.paymentOptional = cState.paymentOptional;

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

                SoftAlertService.display({
                    success: true,
                    action: 'saving'
                });

                $scope.$broadcast('SelfieCampaignWillSave');

                return saveCampaign()
                    .then(updateProxy)
                    .then(handleSuccess)
                    .catch(handleSaveError);
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
                        SelfieCampaignSummaryService.pending(true);

                        return (isDraft ? saveCampaign() : $q.when(SelfieCampaignCtrl.campaign))
                            .then(createUpdateRequest)
                            .then(setPending)
                            .then(returnToDashboard)
                            .catch(function(err) {
                                SelfieCampaignSummaryService.close();
                                SelfieCampaignSummaryService.pending(false);
                                return $q.reject(err);
                            })
                            .catch(showErrorModal);
                    })
                });
            };

            // debounce the auto-save
            this.autoSave = c6Debounce(SelfieCampaignCtrl.save, 5000);

            this.copy = queue.debounce(function() {
                SelfieCampaignCtrl.pendingCopy = true;

                return CampaignService.create(this.campaign, this.user, this.advertiser).save()
                    .then(function(campaign) {
                        return c6State.goTo('Selfie:EditCampaign', [campaign]);
                    })
                    .catch(showErrorModal)
                    .finally(function() {
                        SelfieCampaignCtrl.pendingCopy = false;
                    });
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
                            }).catch(showErrorModal);
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
                SelfieFlightDatesCtrl = this,
                originalCampaign = SelfieCampaignCtrl.originalCampaign,
                campaign = SelfieCampaignCtrl.campaign,
                card = SelfieCampaignCtrl.card,
                campaignHash = card.campaign;

            var now = new Date();
            now.setHours(0,0,1);

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

            function setDatesOnCard() {
                var self = SelfieFlightDatesCtrl;

                campaignHash.startDate = self.validStartDate ?
                    toISO('start', self.startDate) : campaignHash.startDate;
                campaignHash.endDate = self.validEndDate ?
                    toISO('end', self.endDate) : campaignHash.endDate;
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
            this.hasDates = !!this.startDate || !!this.endDate;
            this.isPending = originalCampaign.status === 'pending';

            this.setDates = function() {
                if (this.startDate !== fromISO(campaignHash.startDate) ||
                    this.endDate !== fromISO(campaignHash.endDate)) {
                    this.hasChanged = true;
                }

                setDatesOnCard();
            };

            this.setTimelineOption = function() {
                if (!this.hasDates) {
                    campaignHash.startDate = undefined;
                    campaignHash.endDate = undefined;
                } else {
                    setDatesOnCard();
                }
            };
        }])

        .controller('SelfieCampaignSponsorController', ['$scope','CollateralService','c6State',
        function                                       ( $scope , CollateralService , c6State ) {
            var AppCtrl = $scope.AppCtrl,
                SelfieCampaignSponsorCtrl = this,
                SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                advertiser = SelfieCampaignCtrl.advertiser,
                defaultLogo = advertiser.defaultLogos && advertiser.defaultLogos.square,
                card = SelfieCampaignCtrl.card,
                websiteLogo = card.collateral.logoType === 'website' && card.collateral.logo;

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
                }, websiteLogo ?
                [{
                    type: 'website',
                    label: 'Website Default',
                    src: websiteLogo
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
                    'Sharing','Facebook','Twitter',
                    'Instagram','YouTube','Pinterest',
                    'Vimeo'
                ].map(function(name) {
                    var href = card.links[name] || '',
                        cssClass = name.toLowerCase();

                    return {
                        cssClass: cssClass,
                        name: name,
                        href: href,
                        required: false
                    };
                });

            this.website = card.links.Website;
            this.sharing = card.shareLinks.facebook;
            this.bindShareToWebsite = !this.sharing;
            this.loadingSiteData = false;
            this.siteDataFailure = false;
            this.siteDataSuccess = false;
            this.hasImported = !!this.website || !!this.links.filter(function(link) {
                return !!link.href;
            }).length;

            // this is called on-focus of website input,
            // the allowImport flag will show the import
            // button when appropriate
            this.checkImportability = function() {
                this.allowImport = this.hasImported;
            };

            // return a url with a protocol or undefined
            this.validateWebsite = function () {
                var website = this.website;

                if (!website) { return; }

                if (!(/^http:\/\/|https:\/\//).test(website)) {
                    website = 'http://' + website;
                }

                return website;
            };

            // this is called when website data is successfully fetched,
            // it updates props on the Ctrl not the actual card
            this.setWebsiteData = function(data) {
                var links = data.links,
                    logo = data.images && data.images.profile;

                if (links) {
                    this.links.forEach(function(link) {
                        var name = link.name.toLowerCase();
                        link.href = (!!links[name] || links[name] === null) ?
                            links[name] : link.href;
                    });
                }

                if (logo) {
                    if (this.logoOptions[0].type === 'website') {
                        this.logoOptions[0].src = logo;
                    } else {
                        this.logoOptions = [{
                            type: 'website',
                            label: 'Website Default',
                            src: logo
                        }].concat(this.logoOptions);
                    }

                    this.logoType = this.logoOptions[0];
                    this.logo = logo;
                }
            };

            // there's a UI button for this, it's only available once
            // a website is set and the user clicks into the input
            this.importWebsite = function() {
                var website = this.validateWebsite();
                if (!website) { return; }

                this.allowImport = false;

                c6State.goTo('Selfie:Campaign:Website', [{website: website}]);
            };

            // this is the method that is called from modal
            this.saveWebsiteData = function(data) {
                this.setWebsiteData(data);
                this.updateLinks();
            };

            // this is called on-blur of website input,
            // we only automatically call CollateralService
            // the first time a user enters a website,
            // after that they need to use the "import" button
            this.checkWebsite = function() {
                var website = this.validateWebsite();

                this.siteDataSuccess = false;
                this.siteDataFailure = false;

                if (!website || this.allowImport) {
                    this.updateLinks();
                    return;
                }

                this.loadingSiteData = true;

                CollateralService.websiteData(website)
                    .then(function(data) {
                        SelfieCampaignSponsorCtrl.siteDataSuccess = {
                            logo: !!data.images.profile,
                            links: Object.keys(data.links).filter(function(key) {
                                return !!data.links[key];
                            }).length
                        };
                        SelfieCampaignSponsorCtrl.setWebsiteData(data);
                    })
                    .catch(function() {
                        SelfieCampaignSponsorCtrl.siteDataFailure = true;
                    })
                    .finally(function() {
                        SelfieCampaignSponsorCtrl.updateLinks();
                        SelfieCampaignSponsorCtrl.hasImported = true;
                        SelfieCampaignSponsorCtrl.loadingSiteData = false;
                    });
            };

            // this is called on-blur of all links inputs (except website)
            // it's also called during importing/updating of website
            this.updateLinks = function() {
                var website = SelfieCampaignSponsorCtrl.validateWebsite(),
                    sharing, shareLink;

                SelfieCampaignSponsorCtrl.links.forEach(function(link) {
                    if (link.href && link.href === card.links[link.name]) { return; }

                    if (link.href) {
                        card.links[link.name] = AppCtrl.validUrl.test(link.href) ?
                            link.href : 'http://' + link.href;
                    } else if (card.links[link.name]) {
                        card.links[link.name] = undefined;
                    }
                });

                card.links.Website = website;

                // ensure that sharing link is updated if appropriate
                if (SelfieCampaignSponsorCtrl.bindShareToWebsite) {
                    SelfieCampaignSponsorCtrl.sharing = website;
                }

                sharing = SelfieCampaignSponsorCtrl.sharing;
                shareLink = AppCtrl.validUrl.test(sharing) ? sharing : 'http://' + sharing;

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
                card.collateral.logoType = /file|url|website/.test(selectedType) ?
                    selectedType : undefined;
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
                case 'website':
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

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Campaign:Website', [function() {
                this.templateUrl = 'views/selfie/campaigns/edit/website_scraping_dialog.html';
                this.controller = 'SelfieCampaignWebsiteController';
                this.controllerAs = 'SelfieCampaignWebsiteCtrl';
            }]);
        }])

        .controller('SelfieCampaignWebsiteController', ['c6State','cState','CollateralService',
        function                                       ( c6State , cState , CollateralService ) {
            var SelfieCampaignWebsiteCtrl = this;

            Object.defineProperties(this, {
                data: {
                    get: function() {
                        var logo = this.logo || {},
                            links = this.links || [];

                        return {
                            links: links.reduce(function(result, link) {
                                if (link.selected) { result[link.name] = link.href; }
                                return result;
                            }, {}),
                            images: {
                                profile: logo.selected && logo.href
                            }
                        };
                    }
                }
            });

            this.close = function() {
                c6State.goTo(cState.cParent.cName);
            };

            this.initWithModel = function(model) {
                this.loading = true;

                CollateralService.websiteData(model.website).then(function(data) {
                    SelfieCampaignWebsiteCtrl.logo = {
                        href: data.images.profile,
                        selected: true
                    };

                    SelfieCampaignWebsiteCtrl.links = (function() {
                        var options = [];

                        forEach(data.links, function(link, key) {
                            options.push({
                                cssClass: ((/instagram|google/).test(key) ?
                                    key : key + '-square'),
                                name: key,
                                href: link,
                                selected: true
                            });
                        });

                        return options;
                    }());

                    SelfieCampaignWebsiteCtrl.loading = false;

                }, function() {
                    SelfieCampaignWebsiteCtrl.loading = false;
                    SelfieCampaignWebsiteCtrl.error = true;
                });
            };
        }])

        .controller('SelfieCampaignVideoController', ['$injector','$scope','SelfieVideoService',
                                                      'c6Debounce',
        function                                     ( $injector , $scope , SelfieVideoService ,
                                                       c6Debounce ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignVideoCtrl = this,
                card = SelfieCampaignCtrl.card,
                data = card.data,
                service = data.service,
                id = data.videoid,
                hasExistingVideo = !!service && !!id;

            function handleVideoError() {
                SelfieCampaignVideoCtrl.videoError = true;
                SelfieCampaignVideoCtrl.video = null;
            }

            this.videoUrl = SelfieVideoService.urlFromData(service, id, data);
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
                var service, id, otherParsedData,
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
                        otherParsedData = data.data;

                        return SelfieVideoService.statsFromService(service, id);
                    })
                    .then(function(data) {
                        var title = ((data || {}).title || '')
                            .slice(0, SelfieCampaignCtrl.maxHeadlineLength);

                        SelfieCampaignVideoCtrl.videoError = false;
                        SelfieCampaignVideoCtrl.video = data;
                        card.title = SelfieCampaignVideoCtrl.disableTitleOverwrite ?
                            card.title : (title.length && title) || undefined;
                        card.data.service = service;
                        card.data.videoid = id;
                        extend(card.data, otherParsedData);
                    })
                    .catch(handleVideoError);
            }, 1000);

            // watch the video link/embed/vast tag input
            // and then do all the checking/getting of data
            $scope.$watch(function() {
                return SelfieCampaignVideoCtrl.videoUrl;
            }, SelfieCampaignVideoCtrl.updateUrl);

        }])

        .controller('SelfieCampaignTextController', ['$scope','c6State',
        function                                    ( $scope , c6State ) {
            var SelfieCampaignCtrl = $scope.SelfieCampaignCtrl,
                SelfieCampaignTextCtrl = this,
                card = SelfieCampaignCtrl.card,
                selfieApp = c6State.get('Selfie:App');

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
            this.actionLabelOptions = selfieApp.cModel.data.callToActionOptions;
            this.actionLabel = this.actionLabelOptions.indexOf(card.params.action.label) > -1 ?
                card.params.action.label : 'Custom';

            this.updateActionLabel = function() {
                if (this.actionLabel !== 'Custom') {
                    card.params.action.label = this.actionLabel;
                }
            };

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
                SelfieCampaignCtrl.pendingCreditCard = false;
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
                    var cState = this;

                    return cinema6.db.find('user', campaign.user)
                        .then(function(user) {
                            cState.campaign = CampaignService.normalize(campaign, user);
                            cState.card = campaign.cards[0];
                            cState.user = user;
                        });
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
                    this.user = this.cParent.user;
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
                        advertiser: cinema6.db.find('advertiser', this.campaign.advertiserId)
                    });
                };

                this.afterModel = function(model) {
                    var cState = this,
                        user = c6State.get('Selfie').cModel,
                        interests = (model.updateRequest && model.updateRequest.data &&
                            model.updateRequest.data.targeting.interests) ||
                            this.campaign.targeting.interests;

                    this.isAdmin = (user.entitlements.adminCampaigns === true);
                    this.updateRequest = model.updateRequest;

                    if (interests.length) {
                        return cinema6.db.findAll('category', {ids: interests.join(',')})
                            .then(function(interests) {
                                cState.interests = interests;
                            });
                    }
                };

                this.enter = function() {
                    // if user is Admin and campaign has an update request
                    // go to Selfie:Manage:Campaign:Admin
                    if (this.isAdmin && this.updateRequest) {
                        return c6State.goTo('Selfie:Manage:Campaign:Admin', null, null, true);
                    } else {
                        return c6State.goTo('Selfie:Manage:Campaign:Manage', null, null, true);
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
                ConfirmDialogService.pending(true);

                return createUpdateRequest(action)
                    .then(setUpdateRequest)
                    .then(updateProxy)
                    .then(function() {
                        ConfirmDialogService.close();
                        ConfirmDialogService.pending(false);

                        if ((/delete|cancel/).test(action)) {
                            // if user has deleted or canceled the campaign
                            // we probably want to go back the dashboard
                            c6State.goTo('Selfie:CampaignDashboard');
                        }
                    })
                    .catch(function(err) {
                        ConfirmDialogService.close();
                        ConfirmDialogService.pending(false);

                        return $q.reject(err);
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
                this.campaign = cState.campaign;
                this.showAdminTab = cState.isAdmin;
                this.user = cState.user;

                this.categories = model.categories;
                this.paymentMethods = model.paymentMethods;
                this.updateRequest = model.updateRequest;
                this.advertiser = model.advertiser;

                this.card = (this.updateRequest && this.updateRequest.data &&
                    this.updateRequest.data.cards[0]) || cState.card;

                this.summary = CampaignService.getSummary({
                    campaign: (this.updateRequest && this.updateRequest.data) || this.campaign,
                    interests: cState.interests || []
                });

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
                SelfieManageCampaignCtrl.pendingCopy = true;

                return CampaignService.create(this.campaign.pojoify(), this.user, this.advertiser)
                    .save()
                    .then(function(campaign) {
                        return c6State.goTo('Selfie:EditCampaign', [campaign]);
                    })
                    .catch(handleError)
                    .finally(function() {
                        SelfieManageCampaignCtrl.pendingCopy = false;
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
            c6StateProvider.state('Selfie:Manage:Campaign:Stats', ['c6State','CampaignService',
            function                                              ( c6State , CampaignService ) {
                this.templateUrl = 'views/selfie/campaigns/manage/stats.html';
                this.controller = 'SelfieManageCampaignStatsController';
                this.controllerAs = 'SelfieManageCampaignStatsCtrl';

                this.model = function() {
                    return CampaignService.getAnalytics({ids: this.cParent.campaign.id});
                };
            }]);
        }])

        .controller('SelfieManageCampaignStatsController', ['$scope','CampaignService','cState',
        function                                           ( $scope , CampaignService , cState ) {
            var SelfieManageCampaignStatsCtrl = this,
                campaign = cState.cParent.campaign,
                defaultStats = {};

            function formatDate(date, joiner, replace) {
                var dateArray;

                if (!date) { return date; }

                if (replace) {
                    dateArray = date.split(replace);

                    return dateArray[2] + joiner +
                        dateArray[0] + joiner +
                        dateArray[1];
                }

                return pad(date.getMonth()+1) + joiner +
                    pad(date.getDate()) + joiner +
                    pad(date.getFullYear());
            }

            function offsetDateObject(startOffset, endOffset) {
                var end = new Date(),
                    start = new Date();

                start.setDate(start.getDate() - startOffset);
                end.setDate(end.getDate() - endOffset);

                return {
                    start: formatDate(start, '/'),
                    end: formatDate(end, '/')
                };
            }

            Object.defineProperties(this, {
                stats: {
                    get: function() {
                        var stats = SelfieManageCampaignStatsCtrl._stats[0] || {};

                        return  stats.range || stats.summary || defaultStats;
                    }
                },
                max: {
                    get: function() {
                        return this.customRange.dates.end || 0;
                    }
                },
                hasViews: {
                    get: function() {
                        return !!this.stats.views;
                    }
                },
                selectedRange: {
                    get: function() {
                        return this.rangeOptions.filter(function(option) {
                            return option.selected;
                        })[0] || this.customRange;
                    }
                },
                totalWebsiteInteractions: {
                    get: function() {
                        var total = 0,
                            linkClicks = this.stats.linkClicks || {};

                        forEach(linkClicks, function(item, key) {
                            if ((/action|website/).test(key)) {
                                total += item;
                            }
                        });
                        return total;
                    }
                },
                totalSocialClicks: {
                    get: function() {
                        var total = 0,
                            linkClicks = this.stats.linkClicks || {};

                        forEach(linkClicks, function(item, key) {
                            if (!(/action|website/).test(key)) {
                                total += item;
                            }
                        });
                        return total;
                    }
                },
                totalShares: {
                    get: function() {
                        var total = 0,
                            shareClicks = this.stats.shareClicks || {};

                        forEach(shareClicks, function(item) {
                            total += item;
                        });

                        return total;
                    }
                },
                totalInteractions: {
                    get: function() {
                        return this.totalWebsiteInteractions +
                            this.totalSocialClicks +
                            this.totalShares;
                    }
                }
            });

            this._stats = [];
            this.showDropdown = false;
            this.showCustom = false;
            this.rangeOptions = [
                {
                    label: 'Lifetime',
                    selected: true,
                    dates: {
                        start: null,
                        end: null
                    }
                },
                {
                    label: 'Yesterday',
                    selected: false,
                    dates: offsetDateObject(1, 1)
                },
                {
                    label: 'Last 7 Days',
                    selected: false,
                    dates: offsetDateObject(7, 0)
                },
                {
                    label: 'Last 30 Days',
                    selected: false,
                    dates: offsetDateObject(30, 0)
                }
            ];
            this.customRange = {
                label: 'Custom',
                selected: false,
                dates: {
                    start: null,
                    end: null
                }
            };

            this.initWithModel = function(model) {
                this._stats = model;
            };

            this.getStats = function(option) {
                var isLifetime = option.label === 'Lifetime',
                    isCustom = option.label === 'Custom';

                this.customRange.selected = isCustom;

                this.rangeOptions.forEach(function(opt) {
                    opt.selected = opt.label === option.label;
                });

                this.showDropdown = false;
                this.showCustom = isCustom;

                CampaignService.getAnalytics({
                    ids: campaign.id,
                    startDate: isLifetime ? undefined : formatDate(option.dates.start, '-', '/'),
                    endDate: isLifetime ? undefined : formatDate(option.dates.end, '-', '/')
                }).then(function(stats) {
                    SelfieManageCampaignStatsCtrl._stats = stats;
                });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Manage:Campaign:Admin', ['cinema6','$q','c6State',
            function                                              ( cinema6 , $q , c6State ) {
                this.templateUrl = 'views/selfie/campaigns/manage/admin.html';
                this.controller = 'SelfieManageCampaignAdminController';
                this.controllerAs = 'SelfieManageCampaignAdminCtrl';

                var self = this;
                this.campaign = null;

                this.beforeModel = function() {
                    this._campaign = this.cParent.campaign;
                    this._updateRequest = this.cParent.updateRequest;
                };

                this.afterModel = function() {
                    this.campaign = this._campaign.pojoify();
                    this.updateRequest = (this._updateRequest) ? this._updateRequest.pojoify() :
                        null;
                    var ids = getInterests(this.campaign);
                    if(this.updateRequest) {
                        ids = ids.concat(getInterests(this.updateRequest.data));
                    }
                    if(ids.length === 0) {
                        return;
                    }
                    var interestData = {};
                    ids.forEach(function(id) {
                        interestData[id] = undefined;
                    });
                    return cinema6.db.findAll('category', {
                        ids: ids.join(',')
                    }).then(function(data) {
                        data.forEach(function(interest) {
                            interestData[interest.id] = interest;
                        });
                        self._decorateInterests(self.campaign, interestData);
                        if(self.updateRequest) {
                            self._decorateInterests(self.updateRequest.data, interestData);
                        }
                    });
                };

                this.enter = function() {
                    if (!this.cParent.isAdmin) {
                        return c6State.goTo('Selfie:Manage:Campaign:Manage', null, null, true);
                    }
                };
                
                this.saveUpdateRequest = function(changes) {
                    if(changes.data) {
                        this._undecorateInterests(changes.data);
                    }
                    Object.keys(changes).forEach(function(prop) {
                        self._updateRequest[prop] = changes[prop];
                    });
                    return this._updateRequest.save();
                };
                
                function getInterests(campaign) {
                    return (campaign && campaign.targeting && campaign.targeting.interests || []);
                }

                this._decorateInterests = function(campaign, interestData) {
                    if(campaign.targeting && campaign.targeting.interests) {
                        campaign.targeting.interests = campaign.targeting.interests.map(
                            function(id) {
                                return interestData[id];
                            }
                        );
                    }
                };
                
                this._undecorateInterests = function(campaign) {
                    if(campaign.targeting && campaign.targeting.interests) {
                        campaign.targeting.interests = campaign.targeting.interests.map(
                            function(interest) {
                                return interest.id;
                            }
                        );
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
                var campaign = cState.campaign;
                updateRequest = cState.updateRequest;
                var updatedCampaign = (updateRequest) ? updateRequest.data : campaign;
                extend(self, {
                    showApproval: !!(updateRequest),
                    campaign: campaign,
                    updatedCampaign: updatedCampaign,
                    previewCard: (updateRequest) ? copy(updatedCampaign.cards[0]) : null,
                    rejectionReason: '',
                    error: null
                });
            };

            this.approveCampaign = function() {
                cState.saveUpdateRequest({
                    data: self.updatedCampaign,
                    status: 'approved'
                }).then(function() {
                    c6State.goTo('Selfie:CampaignDashboard');
                }).catch(function(error) {
                    self.error = 'There was a problem approving the campaign: ' + error.data;
                });
            };

            this.rejectCampaign = function() {
                cState.saveUpdateRequest({
                    status: 'rejected',
                    rejectionReason: self.rejectionReason
                }).then(function() {
                    c6State.goTo('Selfie:CampaignDashboard');
                }).catch(function(error) {
                    self.error = 'There was a problem rejecting the campaign: ' + error.data;
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
                if(card) {
                    self._loadPreview(card);
                }
            }, true);
        }]);
});
