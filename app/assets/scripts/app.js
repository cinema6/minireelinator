define( ['angular','ngAnimate','minireel/app','account/app','login','portal','c6uilib','c6log',
         'c6_defines','templates','forgot_password','ui','version','selfie','selfie/app',
         'libs'],
function( angular , ngAnimate , minireel     , account     , login , portal , c6uilib , c6log ,
          c6Defines  , templates , forgotPassword  , ui , version , selfie , selfieApp,
          libs ) {
    'use strict';

    var forEach = angular.forEach,
        copy = angular.copy,
        noop = angular.noop,
        isObject = angular.isObject,
        extend = angular.extend;

    function find(array, predicate) {
        var length = array.length;

        var index = 0;
        for (; index < length; index++) {
            if (predicate(array[index], index, array)) {
                return array[index];
            }
        }
    }

    return angular.module('c6.app', [
        ui.name,
        templates.name,
        ngAnimate.name,
        account.name,
        minireel.name,
        login.name,
        c6uilib.name,
        c6log.name,
        portal.name,
        forgotPassword.name,
        selfie.name,
        selfieApp.name,
        libs.name
    ])
        .config(['c6UrlMakerProvider',
        function( c6UrlMakerProvider ) {
            c6UrlMakerProvider.location(c6Defines.kApiUrl, 'api');
        }])

        .config(['$provide','$httpProvider',
        function( $provide , $httpProvider ) {
            function pick(prop) {
                return function(object) {
                    return object[prop];
                };
            }

            function putInArray(item) {
                return [item];
            }

            function value(val) {
                return function() {
                    return val;
                };
            }

            function fillMeta(meta) {
                return function(response) {
                    var data = {
                        items: response.headers('Content-Range')
                            .match(/\d+/g)
                            .map(function(num, index) {
                                return [this[index], parseInt(num)];
                            }, ['start', 'end', 'total'])
                            .reduce(function(obj, pair) {
                                obj[pair[0]] = pair[1];
                                return obj;
                            }, {})
                    };

                    extend(meta, data);

                    return response;
                };
            }

            $provide.factory('Accepted202Interceptor', ['$q','$interval','$injector',
            function                            ( $q , $interval , $injector ) {
                return {
                    response: function(response) {
                        var deferred = $q.defer(),
                            status = response.status,
                            config = response.config,
                            isRetry = config.retry,
                            data = response.data,
                            checkAgain;


                        if (!isRetry && status === 202 && data.url) {
                            $injector.invoke(['$http', function($http) {
                                var attempts = 0;

                                checkAgain = $interval(function() {
                                    attempts++;

                                    if (attempts >= 15) {
                                        deferred.reject('Request timed out.');
                                        $interval.cancel(checkAgain);
                                        return;
                                    }

                                    $http.get(data.url, {retry: true})
                                        .then(function(resp) {
                                            if (resp.status !== 202) {
                                                deferred.resolve(resp);
                                                $interval.cancel(checkAgain);
                                            }
                                        }, function(err) {
                                            deferred.reject(err);
                                            $interval.cancel(checkAgain);
                                        });
                                }, 2000);
                            }]);
                        } else {
                            deferred.resolve(response);
                        }

                        return deferred.promise;
                    }
                };
            }]);
            $httpProvider.interceptors.push('Accepted202Interceptor');

            $provide.factory('Unauthorized401Interceptor', ['$q','$injector','c6UrlParser',
                                                            'SelfieLoginDialogService',
            function                                       ( $q , $injector , c6UrlParser ,
                                                             SelfieLoginDialogService ) {
                var requests = [];

                function validUrl(url) {
                    var currentUrl = c6UrlParser(''),
                        requestUrl = c6UrlParser(url),
                        currentHost = currentUrl.hostname,
                        requestHost = requestUrl.hostname,
                        path = requestUrl.pathname;

                    return (currentHost === requestHost) && !(/auth/).test(path);
                }

                return {
                    responseError: function(response) {
                        var deferred = $q.defer(),
                            status = response.status,
                            config = response.config,
                            url = config.url;

                        if (status === 401 && validUrl(url)) {
                            // add all requests to the array since there
                            // might be multiple requests that failed
                            // before the login succeeds
                            requests.push({
                                deferred: deferred,
                                config: config
                            });

                            // when multiple requests fail display() gets called
                            // multiple times, but since we only want the user
                            // to login once we only fulfill the last display()
                            // call, meaning we need to re-attempt all failed
                            // previously failed attempts in this handler.
                            SelfieLoginDialogService.display()
                                .then(function() {
                                    var $http = $injector.get('$http');

                                    // we loop through all the requests,
                                    // re-attempt them, and if they succeed
                                    // we resolve/reject the original promise
                                    // that was returned.
                                    $q.all(requests.map(function(req) {
                                        return $http(req.config)
                                            .then(function(resp) {
                                                req.deferred.resolve(resp);
                                            }, function(err) {
                                                req.deferred.reject(err);
                                            });
                                    })).then(function() {
                                        // once all the re-attempts succeed
                                        // we need to reset the array
                                        requests = [];
                                    });
                                });

                            return deferred.promise;
                        } else {
                            return $q.reject(response);
                        }
                    }
                };
            }]);
            $httpProvider.interceptors.push('Unauthorized401Interceptor');

            $provide.constant('VoteAdapter', ['$http','config','$q',
            function                         ( $http , config , $q ) {
                function clean(model) {
                    delete model.org;
                    delete model.created;
                    delete model.id;

                    return model;
                }

                function url(end) {
                    return config.apiBase + '/election' + (end ? ('/' + end) : '');
                }

                this.findAll = function() {
                    return $q.reject('The vote service does not support finding all elections.');
                };

                this.find = function(type, id) {
                    return $http.get(url(id), {
                        cache: true
                    }).then(function arrayify(response) {
                        return [response.data];
                    });
                };

                this.findQuery = function(type, query) {
                    return this.find(type, query.id);
                };

                this.create = function(type, data) {
                    return $http.post(url(), clean(data))
                        .then(function arrayify(response) {
                            return [response.data];
                        });
                };

                this.erase = function(type, model) {
                    return $http.delete(url(model.id))
                        .then(function returnNull() {
                            return null;
                        });
                };

                this.update = function(type, model) {
                    return $http.put(url(model.id), clean(model))
                        .then(function arrayify(response) {
                            return [response.data];
                        });
                };
            }]);

            $provide.constant('UserAdapter', ['$http','$q','cinema6','config',
            function                         ( $http , $q , cinema6 , config ) {
                // var self = this;

                function clean(model) {
                    var advertiser = model.advertiser;

                    delete model.id;
                    delete model.created;
                    delete model.org;
                    delete model.email;
                    delete model.permissions;

                    if (advertiser) {
                        model.advertiser = advertiser.id;
                    }

                    return model;
                }

                function url(id) {
                    return config.apiBase + '/account/user/' + id;
                }

                /*function decorateAllUsersWithOrgs(users) {
                    return $q.all(users.map(self.decorateWithOrg));
                }*/

                this.decorateWithOrg = function(user) {
                    return cinema6.db.find('org', user.org)
                        .then(function attach(org) {
                            user.org = org;
                            return user;
                        });
                };

                /*this.findAll = function() {
                    return $http.get(config.apiBase + '/account/users')
                        .then(pick('data'))
                        .then(decorateAllUsersWithOrgs);
                };*/

                this.find = function(type, id) {
                    return $http.get(url(id), {
                        cache: true
                    }).then(pick('data'))
                        .then(this.decorateWithOrg)
                        .then(putInArray);
                };

                /*this.findQuery = function(type, query) {
                    function handleError(response) {
                        return response.status === 404 ?
                            [] : $q.reject(response);
                    }

                    return $http.get(config.apiBase + '/account/users', {
                            params: query
                        })
                        .then(pick('data'))
                        .then(decorateAllUsersWithOrgs)
                        .catch(handleError);
                };*/

                /*this.create = function(type, data) {
                    return $http.post(config.apiBase + '/account/user', data)
                        .then(returnData)
                        .then(self.decorateWithOrg)
                        .then(arrayify);
                };*/

                /*this.erase = function(type, model) {
                    return $http.delete(config.apiBase + '/account/user/' + model.id)
                        .then(function returnNull() {
                            return null;
                        });
                };*/

                this.update = function(type, model) {
                    return $http.put(url(model.id) + '?decorated=true', clean(model))
                        .then(pick('data'))
                        .then(this.decorateWithOrg)
                        .then(putInArray);
                };

                ['findAll', 'findQuery', 'create', 'erase'].forEach(function(method) {
                    this[method] = function() {
                        return $q.reject('UserAdapter.' + method + '() method is not implemented.');
                    };
                }, this);
            }]);

            $provide.constant('OrgAdapter', ['$http','$q','config',
            function                        ( $http , $q , config ) {
                function clean(model) {
                    delete model.id;
                    delete model.created;

                    return model;
                }

                function url(end) {
                    return config.apiBase + '/account/' + end;
                }

                this.findAll = function() {
                    return $http.get(url('orgs'))
                        .then(function returnData(response) {
                            return response.data;
                        });
                };

                this.find = function(type, id) {
                    return $http.get(url('org/' + id), {
                        cache: true
                    }).then(function arrayify(response) {
                        return [response.data];
                    });
                };

                this.findQuery = function(type, query) {
                    function handleError(response) {
                        return response.status === 404 ?
                            [] : $q.reject(response);
                    }

                    return $http.get(url('orgs'), {
                        params: query
                    }).then(pick('data'), handleError);
                };

                this.create = function(type, data) {
                    return $http.post(config.apiBase + '/account/org', clean(data))
                        .then(function arrayify(response) {
                            return [response.data];
                        });
                };

                this.erase = function(type, model) {
                    return $http.delete(config.apiBase + '/account/org/' + model.id)
                        .then(function returnNull() {
                            return null;
                        });
                };

                this.update = function(type, model) {
                    return $http.put(config.apiBase + '/account/org/' + model.id, clean(model))
                        .then(function arrayify(response) {
                            return [response.data];
                        });
                };
            }]);

            $provide.constant('ContentAdapter', ['$http','$q','cinema6','config',
            function                            ( $http , $q , cinema6 , config ) {
                var self = this;

                function url(end) {
                    return config.apiBase + '/content/' + end;
                }

                function clean(model) {
                    delete model.id;
                    delete model.org;
                    delete model.created;
                    model.user = model.user && model.user.id;

                    return model;
                }

                function decorateWithUsers(experiences) {
                    return $q.all(experiences.map(self.decorateWithUser));
                }

                this.decorateWithUser = function(experience) {
                    return cinema6.db.find('user', experience.user)
                        .then(function decorate(user) {
                            experience.user = user;
                            return experience;
                        })
                        .catch(function objectify() {
                            experience.user = { id: experience.user || null };
                            return experience;
                        });
                };

                this.findAll = function() {
                    return $http.get(url('experiences'))
                        .then(pick('data'))
                        .then(decorateWithUsers);
                };

                this.find = function(type, id) {
                    return $http.get(url('experience/' + id), {
                        cache: true
                    }).then(pick('data'))
                        .then(this.decorateWithUser)
                        .then(putInArray);
                };

                this.findQuery = function(type, query, meta) {
                    function handleError(response) {
                        return response.status === 404 ?
                            [] : $q.reject(response);
                    }

                    return $http.get(url('experiences'), {
                            params: query
                        }).then(fillMeta(meta))
                            .then(pick('data'), handleError)
                            .then(decorateWithUsers);
                };

                this.create = function(type, data) {
                    return $http.post(url('experience'), clean(data))
                        .then(pick('data'))
                        .then(this.decorateWithUser)
                        .then(putInArray);
                };

                this.erase = function(type, model) {
                    return $http.delete(url('experience/' + model.id))
                        .then(value(null));
                };

                this.update = function(type, model) {
                    return $http.put(url('experience/' + model.id), clean(model))
                        .then(pick('data'))
                        .then(this.decorateWithUser)
                        .then(putInArray);
                };
            }]);

            $provide.constant('CategoryAdapter', ['config','$http','$q',
            function                             ( config , $http , $q ) {
                function makeQuery(obj) {
                    return extend({ sort: 'label,1' }, obj);
                }

                function url() {
                    return config.apiBase + '/content/categories';
                }

                this.findAll = function() {
                    return $http.get(url(), { params: makeQuery() })
                        .then(pick('data'));
                };

                this.findQuery = function(type, query) {
                    return $http.get(url(), { params: makeQuery(query) })
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        });
                };

                ['find', 'create', 'update', 'erase'].forEach(function(method) {
                    this[method] = function() {
                        return $q.reject('CategoryAdapter.' + method + '() is not implemented.');
                    };
                }, this);
            }]);

            $provide.constant('AdvertiserAdapter', ['config','$http','$q',
            function                               ( config , $http , $q ) {
                function url(end) {
                    return config.apiBase + '/account/' + end;
                }

                this.findAll = function() {
                    return $http.get(url('advrs'))
                        .then(pick('data'));
                };

                this.find = function(type, id) {
                    return $http.get(url('advrs/' + id), { cache: true })
                        .then(pick('data'))
                        .then(putInArray);
                };

                this.findQuery = function(type, query) {
                    return $http.get(url('advrs'), { params: query })
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        });
                };

                ['create', 'update', 'erase'].forEach(function(method) {
                    this[method] = function() {
                        return $q.reject('AdvertiserAdapter.' + method + '() is not implemented.');
                    };
                }, this);
            }]);

            $provide.constant('CampaignAdapter', ['config','$http','$q','cinema6',
                                                  'MiniReelService','VoteService',
            function                             ( config , $http , $q , cinema6 ,
                                                   MiniReelService , VoteService ) {
                var adapter = this;

                function url(end) {
                    return config.apiBase + '/' + end;
                }

                function decorateCampaigns(campaigns) {
                    return $q.all(campaigns.map(function(campaign) {
                        return adapter.decorateCampaign(campaign);
                    }));
                }

                function makeCreativeWrapper(data) {
                    return extend(data, {
                        item: undefined
                    });
                }

                function syncElections(campaign) {
                    return $q.all(campaign.cards.map(function(card) {
                        return VoteService.syncCard(card);
                    })).then(function() { return campaign; });
                }

                function undecorateCampaign(campaign) {
                    return $q.all(campaign.cards.map(function(card) {
                        return MiniReelService.convertCardForPlayer(card);
                    })).then(function(cards) {
                        return extend(campaign, {
                            created: undefined,

                            advertiser: undefined,
                            advertiserId: campaign.advertiser.id,

                            cards: cards,
                            miniReels: campaign.miniReels.map(makeCreativeWrapper),

                            staticCardMap: (function() {
                                function hasWildcard(entry) {
                                    return !!entry.wildcard;
                                }

                                return campaign.staticCardMap.filter(function(entry) {
                                    return entry.cards.some(hasWildcard);
                                }).reduce(function(result, entry) {
                                    result[entry.minireel.id] = entry.cards
                                        .filter(hasWildcard)
                                        .reduce(function(result, entry) {
                                            result[entry.placeholder.id] = entry.wildcard.id;
                                            return result;
                                        }, {});
                                    return result;
                                }, {});
                            }())
                        });
                    });
                }

                this.decorateCampaign = function(campaign) {
                    var findCard = MiniReelService.findCard;
                    var staticCardMap = campaign.staticCardMap;

                    function getDbModel(type) {
                        return function(id) {
                            return cinema6.db.find(type, id);
                        };
                    }

                    function parseWrapper(data) {
                        return extend(data, {
                            endDate: data.endDate && new Date(data.endDate)
                        });
                    }

                    return $q.all(campaign.cards.map(function(card) {
                        return MiniReelService.convertCardForEditor(card).then(function(card) {
                            var endDate = card.campaign.endDate;

                            card.campaign.endDate = endDate && new Date(endDate);

                            return card;
                        });
                    })).then(function(cards) {
                        return $q.all({
                            advertiser: getDbModel('advertiser')(campaign.advertiserId),

                            miniReels: $q.all(campaign.miniReels.map(function(data) {
                                return $q.all(extend(parseWrapper(data), {
                                    item: getDbModel('experience')(data.id)
                                }));
                            })),

                            cards: cards,

                            staticCardMap: $q.all(Object.keys(staticCardMap).map(function(mrId) {
                                var map = staticCardMap[mrId],
                                    findMiniReel = getDbModel('experience')(mrId);

                                return $q.all({
                                    minireel: findMiniReel,
                                    cards: $q.all(Object.keys(map).map(function(placeholderId) {
                                        var wildcardId = map[placeholderId];

                                        return $q.all({
                                            placeholder: findMiniReel.then(function(minireel) {
                                                var deck = minireel.data.deck;

                                                return findCard(deck, placeholderId) || {};
                                            }),
                                            wildcard: find(cards, function(card) {
                                                return card.id === wildcardId;
                                            })
                                        });
                                    }))
                                }).catch(function() {
                                    return null;
                                });
                            })).then(function(map) {
                                return map.filter(function(entry) { return !!entry; });
                            })
                        }).then(function(data) {
                            return extend(campaign, data);
                        });
                    });
                };

                this.findAll = function() {
                    return $http.get(url('campaigns'))
                        .then(pick('data'))
                        .then(decorateCampaigns);
                };

                this.find = function(type, id) {
                    return $http.get(url('campaign/' + id), { cache: true })
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };

                this.findQuery = function(type, query, meta) {
                    return $http.get(url('campaigns'), { params: query })
                        .then(fillMeta(meta))
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        })
                        .then(decorateCampaigns);
                };

                this.create = function(type, data) {
                    return undecorateCampaign(data)
                        .then(syncElections)
                        .then(function(campaign) {
                            return $http.post(url('campaign'), campaign);
                        })
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };

                this.erase = function(type, campaign) {
                    return $http.delete(url('campaign/' + campaign.id))
                        .then(value(null));
                };

                this.update = function(type, campaign) {
                    return undecorateCampaign(campaign)
                        .then(syncElections)
                        .then(function(campaign) {
                            return $http.put(url('campaign/' + campaign.id), campaign);
                        })
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };
            }]);

            $provide.constant('SelfieCampaignAdapter', ['config','$http','$q',
                                                        'MiniReelService',
            function                                   ( config , $http , $q ,
                                                         MiniReelService ) {
                var adapter = this,
                    convertCardForEditor = MiniReelService.convertCardForEditor,
                    convertCardForPlayer = MiniReelService.convertCardForPlayer;

                function url(end) {
                    return config.apiBase + '/' + end;
                }

                function decorateCampaigns(campaigns) {
                    return $q.all(campaigns.map(function(campaign) {
                        return adapter.decorateCampaign(campaign);
                    }));
                }

                function undecorateCampaign(campaign) {
                    return $q.all((campaign.cards || []).map(function(card) {
                        return convertCardForPlayer(card);
                    })).then(function(cards) {
                        return extend(campaign, {
                            created: undefined,
                            // advertiserId: undefined,
                            cards: campaign.cards ? cards : undefined
                        });
                    });
                }

                this.decorateCampaign = function(campaign) {
                    return $q.all((campaign.cards || []).map(function(card) {
                        return convertCardForEditor(card);
                    })).then(function(cards) {
                        campaign.cards = cards.length ? cards : undefined;
                        return campaign;
                    });
                };

                this.findAll = function() {
                    return $http.get(url('campaigns'))
                        .then(pick('data'))
                        .then(decorateCampaigns);
                };

                this.find = function(type, id) {
                    return $http.get(url('campaign/' + id), { cache: true })
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };

                this.findQuery = function(type, query, meta) {
                    return $http.get(url('campaigns'), { params: query })
                        .then(fillMeta(meta))
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        })
                        .then(decorateCampaigns);
                };

                this.create = function(type, data) {
                    return undecorateCampaign(data)
                        .then(function(campaign) {
                            return $http.post(url('campaign'), campaign);
                        })
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };

                this.erase = function(type, campaign) {
                    return $http.delete(url('campaign/' + campaign.id))
                        .then(value(null));
                };

                this.update = function(type, campaign) {
                    return undecorateCampaign(campaign)
                        .then(function(data) {
                            return $http.put(url('campaign/' + campaign.id), data);
                        })
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };
            }]);

            $provide.constant('UpdateRequestAdapter', ['config','$http','$q','MiniReelService',
            function                                  ( config , $http , $q , MiniReelService ) {
                var convertCardForPlayer = MiniReelService.convertCardForPlayer,
                    convertCardForEditor = MiniReelService.convertCardForEditor;

                function url(end) {
                    return config.apiBase + '/' + end;
                }

                function decorateUpdates(updates) {
                    return $q.all(updates.map(function(update) {
                        return decorateUpdate(update);
                    }));
                }

                function decorateUpdate(update) {
                    var card = update.data && update.data.cards && update.data.cards[0];

                    update.id = update.campaign + ':' + update.id;

                    return (card ? convertCardForEditor(card) : $q.when(null))
                        .then(function(card) {
                            if (card) {
                                update.data.cards[0] = card;
                            }
                            return update;
                        });
                }

                function undecorateUpdate(update) {
                    var card = update.data && update.data.cards && update.data.cards[0];

                    if (update.id) {
                        update.id = update.id.split(':')[1];
                    }

                    return (card ? convertCardForPlayer(card) : $q.when(null))
                        .then(function(card) {
                            if (card) {
                                update.data.cards[0] = card;
                            }
                            return update;
                        });
                }

                this.find = function(type, id) {
                    var parts = id.split(':');
                    var campId = parts[0];
                    var updateId = parts[1];
                    var endpoint = url('campaigns/' + campId + '/updates/' + updateId);
                    return $http.get(endpoint, { cache: true })
                        .then(pick('data'))
                        .then(decorateUpdate)
                        .then(putInArray);
                };

                this.update = function(type, updateRequest) {
                    var campId = updateRequest.campaign;
                    var updateId = updateRequest.id.split(':')[1];
                    var endpoint = url('campaigns/' + campId + '/updates/' + updateId);
                    var requestBody = {
                        status: updateRequest.status
                    };
                    if(updateRequest.status === 'rejected') {
                        requestBody.rejectionReason = updateRequest.rejectionReason;
                    } else {
                        requestBody.data = updateRequest.data;
                    }
                    return undecorateUpdate(requestBody)
                        .then(function(body) {
                            return $http.put(endpoint, body);
                        })
                        .then(pick('data'))
                        .then(decorateUpdate)
                        .then(putInArray);
                };

                this.findQuery = function(type, data) {
                    var campId = data.campaign,
                        endpoint = url('campaigns/' + (campId ? campId + '/' : '') + 'updates');

                    delete data.campaign;

                    return $http.get(endpoint, { params: data })
                        .then(pick('data'))
                        .then(decorateUpdates);
                };

                this.create = function(type, data) {
                    var campId = data.campaign;
                    if(!campId) {
                        return $q.reject('Must provide a campaign id');
                    }
                    var endpoint = url('campaigns/' + campId + '/updates');
                    return undecorateUpdate(data)
                        .then(function(body) {
                            return $http.post(endpoint, body);
                        })
                        .then(pick('data'))
                        .then(decorateUpdate)
                        .then(putInArray);
                };

                ['erase', 'findAll'].forEach(function(method) {
                    this[method] = function() {
                        return $q.reject('UpdateRequestAdapter.' + method +
                            '() is not implemented.');
                    };
                }, this);
            }]);

            $provide.constant('PaymentMethodAdapter', ['config','$http','$q',
            function                                  ( config , $http , $q ) {
                function url(end) {
                    return config.apiBase + '/payments/methods' + (end || '');
                }

                function undecoratePayment(payment) {
                    return extend(payment, {
                        makeDefault: payment.makeDefault,
                        id: undefined,
                        token: undefined,
                        createdAt: undefined,
                        updatedAt: undefined,
                        imageUrl: undefined,
                        default: undefined,
                        type: undefined,
                        cardType: undefined,
                        email: undefined,
                        expirationDate: undefined,
                        last4: undefined
                    });
                }

                function decoratePayments(payments) {
                    return payments.map(decoratePayment);
                }

                function decoratePayment(payment) {
                    return extend(payment, {
                        id: payment.token
                    });
                }

                this.findAll = function() {
                    return $http.get(url())
                        .then(pick('data'))
                        .then(decoratePayments);
                };

                this.find = function() {
                    return $q.reject('PaymentMethodAdapter.find() is not implemented.');
                };

                this.findQuery = function(type, query) {
                    return $http.get(url(), { params: query })
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        })
                        .then(decoratePayments);
                };

                this.create = function(type, data) {
                    return $http.post(url(), data)
                        .then(pick('data'))
                        .then(decoratePayment)
                        .then(putInArray);
                };

                this.erase = function(type, payment) {
                    return $http.delete(url('/' + payment.token))
                        .then(value(null));
                };

                this.update = function(type, payment) {
                    return $http.put(url('/' + payment.token), undecoratePayment(payment))
                        .then(pick('data'))
                        .then(decoratePayment)
                        .then(putInArray);
                };
            }]);

            $provide.constant('ExpGroupAdapter', ['config','$http','$q',
            function                             ( config , $http , $q ) {
                function url() {
                    return config.apiBase + '/expgroups';
                }

                this.findAll = function() {
                    return $http.get(url())
                        .then(pick('data'));
                };

                this.findQuery = function(type, query) {
                    return $http.get(url(), { params: query })
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        });
                };

                ['find', 'create', 'update', 'erase'].forEach(function(method) {
                    this[method] = function() {
                        return $q.reject('ExpGroupAdapter.' + method + '() is not implemented.');
                    };
                }, this);
            }]);

            $provide.constant('ContainerAdapter', ['config','$http','$q',
            function                              ( config , $http , $q ) {
                function url(end) {
                    return config.apiBase + '/containers' + (end || '');
                }

                this.findAll = function() {
                    return $http.get(url())
                        .then(pick('data'));
                };

                this.find = function(type, id) {
                    return $http.get(url('/' + id))
                        .then(pick('data'))
                        .then(putInArray);
                };

                this.findQuery = function(type, query) {
                    return $http.get(url(), { params: query })
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        });
                };

                this.create = function(type, data) {
                    return $http.post(url(), data)
                        .then(pick('data'))
                        .then(putInArray);
                };

                this.erase = function(type, container) {
                    return $http.delete(url('/' + container.id))
                        .then(value(null));
                };

                this.update = function(type, container) {
                    return $http.put(url('/' + container.id), container)
                        .then(pick('data'))
                        .then(putInArray);
                };
            }]);

            $provide.constant('PlacementAdapter', ['config','$http','$q',
            function                              ( config , $http , $q ) {
                function url(end) {
                    return config.apiBase + '/placements' + (end || '');
                }

                this.findAll = function() {
                    return $http.get(url())
                        .then(pick('data'));
                };

                this.find = function(type, id) {
                    return $http.get(url('/' + id))
                        .then(pick('data'))
                        .then(putInArray);
                };

                this.findQuery = function(type, query) {
                    return $http.get(url(), { params: query })
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        });
                };

                this.create = function(type, data) {
                    return $http.post(url(), data)
                        .then(pick('data'))
                        .then(putInArray);
                };

                this.erase = function(type, placement) {
                    return $http.delete(url('/' + placement.id))
                        .then(value(null));
                };

                this.update = function(type, placement) {
                    return $http.put(url('/' + placement.id), placement)
                        .then(pick('data'))
                        .then(putInArray);
                };
            }]);

            $provide.constant('CWRXAdapter', ['config','$injector',
            function                         ( config , $injector ) {
                var self = this,
                    adapters = {};

                forEach(config, function(Constructor, type) {
                    adapters[type] = $injector.instantiate(Constructor, {
                        config: Constructor.config
                    });
                });

                ['find', 'findAll', 'findQuery', 'create', 'erase', 'update']
                    .forEach(function(method) {
                        self[method] = function(type) {
                            var delegate = adapters[type];

                            return delegate[method].apply(delegate, arguments);
                        };
                    });
            }]);
        }])

        .config(['cinema6Provider','ContentAdapter','CWRXAdapter','CampaignAdapter',
                 'VoteAdapter','OrgAdapter','UserAdapter','CategoryAdapter',
                 'AdvertiserAdapter','ExpGroupAdapter','SelfieCampaignAdapter',
                 'PaymentMethodAdapter','UpdateRequestAdapter','ContainerAdapter',
                 'PlacementAdapter',
        function( cinema6Provider , ContentAdapter , CWRXAdapter , CampaignAdapter ,
                  VoteAdapter , OrgAdapter , UserAdapter , CategoryAdapter ,
                  AdvertiserAdapter , ExpGroupAdapter , SelfieCampaignAdapter ,
                  PaymentMethodAdapter , UpdateRequestAdapter , ContainerAdapter ,
                  PlacementAdapter ) {

            [
                ContentAdapter,
                VoteAdapter,
                OrgAdapter,
                UserAdapter,
                CategoryAdapter,
                ExpGroupAdapter,
                CampaignAdapter,
                SelfieCampaignAdapter,
                PaymentMethodAdapter,
                AdvertiserAdapter,
                UpdateRequestAdapter,
                ContainerAdapter,
                PlacementAdapter
            ].forEach(function(Adapter) {
                Adapter.config = {
                    apiBase: '/api'
                };
            });

            CWRXAdapter.config = {
                election: VoteAdapter,
                experience: ContentAdapter,
                org: OrgAdapter,
                user: UserAdapter,
                category: CategoryAdapter,
                advertiser: AdvertiserAdapter,
                expGroup: ExpGroupAdapter,
                campaign: CampaignAdapter,
                selfieCampaign: SelfieCampaignAdapter,
                paymentMethod: PaymentMethodAdapter,
                updateRequest: UpdateRequestAdapter,
                container: ContainerAdapter,
                placement: PlacementAdapter
            };

            cinema6Provider.useAdapter(CWRXAdapter);
        }])

        .service('SettingsService', ['c6LocalStorage','$rootScope','c6Debounce',
        function                    ( c6LocalStorage , $rootScope , c6Debounce ) {
            var settings = {};

            function setDefaults(defaults, object) {
                forEach(defaults, function(value, key) {
                    if (!object.hasOwnProperty(key)) {
                        object[key] = value;
                    }
                });
            }

            function deepFreeze(object) {
                Object.freeze(object);

                forEach(object, function(value) {
                    if (isObject(value)) {
                        deepFreeze(value);
                    }
                });

                return object;
            }

            function get(object, props) {
                return props.reduce(function(result, prop) {
                    return result[prop];
                }, object);
            }

            this.get = function(id) {
                return settings[id];
            };

            this.getReadOnly = function(id) {
                return deepFreeze(copy(settings[id]));
            };

            this.createBinding = function(object, prop, binding) {
                var props = binding.split('.'),
                    settings = this.get(props.shift()),
                    lastProp = props.pop();

                Object.defineProperty(object, prop, {
                    get: function() {
                        return get(settings, props)[lastProp];
                    },
                    set: function(value) {
                        /* jshint boss:true */
                        return get(settings, props)[lastProp] = value;
                    }
                });

                return this;
            };

            this.register = function(id, object, _config) {
                var config = _config || {};

                var localStorageKey = 'SettingsService::' + id,
                    sync = c6Debounce(function() {
                        config.sync(object);
                    }, 30000);

                function pullLatestFromLocalStorage() {
                    var latest = c6LocalStorage.get(localStorageKey) || {},
                        isValid = config.validateLocal(config.localSync, latest.meta);

                    if (latest.settings && isValid) {
                        copy(latest.settings, object);
                    }
                }

                setDefaults({
                    localSync: true,
                    sync: noop,
                    defaults: {},
                    validateLocal: function() {
                        return true;
                    }
                }, config);

                if (config.localSync) {
                    pullLatestFromLocalStorage();
                }

                setDefaults(config.defaults, object);

                settings[id] = object;

                $rootScope.$watch(function() { return object; }, function(object, prevObject) {
                    if (config.localSync) {
                        c6LocalStorage.set(localStorageKey, {
                            meta: config.localSync === true ? null : config.localSync,
                            settings: object
                        });
                    }

                    if (object !== prevObject) {
                        sync();
                    }
                }, true);

                return this;
            };
        }])

        .run   (['$rootScope',
        function( $rootScope ) {
            $rootScope.Infinity = Infinity;
        }])

        .controller('GenericController', noop)

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider
                .state('Application', ['c6State',
                function              ( c6State ) {
                    this.templateUrl = 'views/app.html';
                    this.controller = 'AppController';
                    this.controllerAs = 'AppCtrl';

                    this.name = c6Defines.kSelfie ? 'Selfie' : 'Portal';

                    this.title = function() {
                        return c6Defines.kSelfie ? 'Reelcontent' : 'Studio';
                    };

                    this.enter = function() {
                        c6State.goTo(this.name, null, null, true);
                    };
                }])

                .state('Error', [function() {
                    this.controller = 'GenericController';
                    this.controllerAs = 'ErrorCtrl';
                    this.templateUrl = 'views/error.html';

                    this.model = function() {
                        return 'Something went horribly wrong!';
                    };
                }]);

            c6StateProvider.map(function() {
                this.state('Portal', function() {
                    this.route('/apps', 'Apps', function() {
                        this.route('/minireel', 'MiniReel');
                    });
                    this.route('/account', 'Account');
                });

                this.state('Selfie', function() {
                    this.route('/resend', 'Selfie:ResendActivation');

                    this.route('/apps','Selfie:Apps', function() {
                        this.route('/selfie', 'Selfie:App');
                    });
                });

                this.state('Selfie:Login');
                this.route('/pass/forgot', 'Selfie:ForgotPassword');
                this.route('/pass/reset', 'Selfie:ResetPassword');
                this.route('/signup', 'Selfie:SignUp', 'Selfie:SignUp:Full');
                this.route('/signup/form', 'Selfie:SignUp', 'Selfie:SignUp:Form');
                this.route('/signup/success', 'Selfie:SignUpSuccess');
                this.route('/confirm', 'Selfie:ConfirmAccount');

                this.state('Login');

                this.route('/password/forgot', 'ForgotPassword');
                this.route('/password/reset', 'ResetPassword');

                this.route('/preview/minireel', 'PreviewMiniReel');
            });
        }])

        .controller('AppController', ['CSSLoadingService','cState','c6State','$rootScope',
        function                     ( CSSLoadingService , cState , c6State , $rootScope ) {
            var appStyles = {
                Portal: [
                    'styles/c6main.css',
                    'styles/minireel/c6studio.css'
                ],
                Selfie: [
                    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,' +
                        '600,700,300italic,400italic,600italic,700italic|Roboto+Conde' +
                        'nsed:300italic,400italic,300,400',
                    'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
                    'styles/selfie/css/select2.min.css',
                    'styles/selfie/css/css-wizardry-grids.css',
                    'styles/selfie/css/c6selfie__base.css',
                    'styles/selfie/css/hint.min.css'
                ]
            };

            Object.defineProperties($rootScope, {
                currentState: {
                    get: function() {
                        return c6State.current;
                    }
                }
            });

            CSSLoadingService.load(appStyles[cState.name]);

            this.year = (new Date()).getFullYear();
            this.version = version;
            this.validImgSrc = /^(http:\/\/|https:\/\/|\/\/)/;
            this.validUrl = /^(http:\/\/|https:\/\/|\/\/)/;
        }]);
});
