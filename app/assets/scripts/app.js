define( ['angular','ngAnimate','minireel/app','account/app','login','portal','c6uilib','c6log',
         'c6_defines','templates','forgot_password','ui','version','selfie','selfie/app'],
function( angular , ngAnimate , minireel     , account     , login , portal , c6uilib , c6log ,
          c6Defines  , templates , forgotPassword  , ui , version , selfie , selfieApp ) {
    'use strict';

    var forEach = angular.forEach,
        copy = angular.copy,
        noop = angular.noop,
        isObject = angular.isObject,
        extend = angular.extend;

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
        selfieApp.name
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
                                checkAgain = $interval(function() {
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
                                }, 1000);
                            }]);
                        } else {
                            deferred.resolve(response);
                        }

                        return deferred.promise;
                    }
                };
            }]);
            $httpProvider.interceptors.push('Accepted202Interceptor');

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
                //var self = this;

                function clean(model) {
                    delete model.id;
                    delete model.created;
                    delete model.org;
                    delete model.email;
                    delete model.permissions;

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
                        .then(returnData)
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
                    function returnData(response) {
                        return response.data;
                    }

                    function handleError(response) {
                        return response.status === 404 ?
                            [] : $q.reject(response);
                    }

                    return $http.get(config.apiBase + '/account/users', {
                            params: query
                        })
                        .then(returnData)
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
                    return $http.put(url(model.id), clean(model))
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

            $provide.constant('CardAdapter', ['config','$http','$q','MiniReelService',
                                              'VoteService',
            function                         ( config , $http , $q , MiniReelService ,
                                               VoteService ) {
                var convertCardForEditor = MiniReelService.convertCardForEditor,
                    convertCardForPlayer = MiniReelService.convertCardForPlayer;

                function url(end) {
                    return config.apiBase + '/content/' + end;
                }

                function convertCardsForEditor(cards) {
                    return $q.all(cards.map(MiniReelService.convertCardForEditor));
                }

                this.findAll = function() {
                    return $http.get(url('cards'))
                        .then(pick('data'))
                        .then(convertCardsForEditor);
                };

                this.find = function(type, id) {
                    return $http.get(url('card/' + id))
                        .then(pick('data'))
                        .then(convertCardForEditor)
                        .then(putInArray);
                };

                this.findQuery = function(type, query) {
                    return $http.get(url('cards'), { params: query })
                        .then(pick('data'), function(response) {
                            return response.status === 404 ?
                                [] : $q.reject(response);
                        })
                        .then(convertCardsForEditor);
                };

                this.create = function(type, data) {
                    return convertCardForPlayer(data).then(function(playerData) {
                        return VoteService.syncCard(extend(playerData, {
                            campaignId: data.campaignId
                        }));
                    }).then(function(data) {
                        return $http.post(url('card'), data).then(pick('data'));
                    })
                    .then(function(data) {
                        return convertCardForEditor(data);
                    })
                    .then(function(editorData) {
                        return extend(editorData, { campaignId: data.campaignId });
                    })
                    .then(putInArray);
                };

                this.erase = function(type, card) {
                    return $http.delete(url('card/' + card.id))
                        .then(value(null));
                };

                this.update = function(type, card) {
                    return convertCardForPlayer(card).then(function(playerCard) {
                        return VoteService.syncCard(playerCard);
                    }).then(function(card) {
                        return $http.put(url('card/' + card.id), card).then(pick('data'));
                    })
                    .then(convertCardForEditor)
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

            $provide.constant('CustomerAdapter', ['config','$http','cinema6','$q',
            function                             ( config , $http , cinema6 , $q ) {
                var adapter = this;

                function url(end) {
                    return config.apiBase + '/account/' + end;
                }

                function decorateAll(customers) {
                    return $q.all(customers.map(function(customer) {
                        return adapter.decorate(customer);
                    }));
                }

                this.decorate = function(customer) {
                    return $q.all({
                        advertisers: $q.all(customer.advertisers.map(function(id) {
                            return cinema6.db.find('advertiser', id);
                        }))
                    }).then(function(data) {
                        return extend(customer, data);
                    });
                };

                this.findAll = function() {
                    return $http.get(url('customers'))
                        .then(pick('data'))
                        .then(decorateAll);
                };

                this.find = function(type, id) {
                    return $http.get(url('customer/' + id))
                        .then(pick('data'))
                        .then(this.decorate)
                        .then(putInArray);
                };

                this.findQuery = function(type, query) {
                    return $http.get(url('customers'), { params: query })
                        .then(pick('data'))
                        .then(decorateAll);
                };

                ['create', 'update', 'erase'].forEach(function(method) {
                    this[method] = function() {
                        return $q.reject(
                            new Error('CustomerAdapter.' + method + '() is not implemented.')
                        );
                    };
                }, this);
            }]);

            $provide.constant('AdvertiserAdapter', ['config','$http','$q',
            function                               ( config , $http , $q ) {
                function url(end) {
                    return config.apiBase + '/account/' + end;
                }

                this.findAll = function() {
                    return $http.get(url('advertisers'))
                        .then(pick('data'));
                };

                this.find = function(type, id) {
                    return $http.get(url('advertiser/' + id))
                        .then(pick('data'))
                        .then(putInArray);
                };

                this.findQuery = function(type, query) {
                    return $http.get(url('advertisers'), { params: query })
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
                                                  'MiniReelService',
            function                             ( config , $http , $q , cinema6 ,
                                                   MiniReelService ) {
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

                function undecorateCampaign(campaign) {
                    return extend(campaign, {
                        created: undefined,

                        advertiser: undefined,
                        advertiserId: campaign.advertiser.id,

                        customer: undefined,
                        customerId: campaign.customer.id,

                        cards: campaign.cards.map(makeCreativeWrapper),
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
                        }()),

                        miniReelGroups: campaign.miniReelGroups.map(function(group) {
                            return extend(group, {
                                miniReels: group.miniReels.map(pick('id')),
                                cards: group.cards.map(pick('id'))
                            });
                        })
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

                    return $q.all({
                        customer: getDbModel('customer')(campaign.customerId),
                        advertiser: getDbModel('advertiser')(campaign.advertiserId),

                        miniReels: $q.all(campaign.miniReels.map(function(data) {
                            return $q.all(extend(parseWrapper(data), {
                                item: getDbModel('experience')(data.id)
                            }));
                        })),

                        cards: $q.all(campaign.cards.map(function(data) {
                            return $q.all(extend(parseWrapper(data), {
                                item: getDbModel('card')(data.id)
                            }));
                        })),

                        staticCardMap: $q.all(Object.keys(staticCardMap).map(function(minireelId) {
                            var map = staticCardMap[minireelId],
                                findMiniReel = getDbModel('experience')(minireelId);

                            return $q.all({
                                minireel: findMiniReel,
                                cards: $q.all(Object.keys(map).map(function(placeholderId) {
                                    var wildcardId = map[placeholderId];

                                    return $q.all({
                                        placeholder: findMiniReel.then(function(minireel) {
                                            return findCard(minireel.data.deck, placeholderId);
                                        }),
                                        wildcard: getDbModel('card')(wildcardId)
                                    });
                                }))
                            }).catch(function() {
                                return null;
                            });
                        })).then(function(map) {
                            return map.filter(function(entry) { return !!entry; });
                        }),
                        miniReelGroups: $q.all(campaign.miniReelGroups.map(function(entry) {
                            return $q.all({
                                miniReels: $q.all(entry.miniReels.map(getDbModel('experience'))),
                                cards: $q.all(entry.cards.map(getDbModel('card')))
                            }).then(function(data) {
                                return extend(entry, data);
                            });
                        }))
                    }).then(function(data) {
                        return extend(campaign, data);
                    });
                };

                this.findAll = function() {
                    return $http.get(url('campaigns'))
                        .then(pick('data'))
                        .then(decorateCampaigns);
                };

                this.find = function(type, id) {
                    return $http.get(url('campaign/' + id))
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
                    return $http.post(url('campaign'), undecorateCampaign(data))
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };

                this.erase = function(type, campaign) {
                    return $http.delete(url('campaign/' + campaign.id))
                        .then(value(null));
                };

                this.update = function(type, campaign) {
                    return $http.put(url('campaign/' + campaign.id), undecorateCampaign(campaign))
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };
            }]);

            $provide.constant('SelfieCampaignAdapter', ['config','$http','$q','cinema6',
            function                                   ( config , $http , $q , cinema6 ) {
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

                function undecorateCampaign(campaign) {
                    return extend(campaign, {
                        created: undefined,
                        advertiserId: undefined,
                        customerId: undefined,
                        cards: campaign.cards.map(makeCreativeWrapper)
                    });
                }

                this.decorateCampaign = function(campaign) {
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

                    return $q.all(campaign.cards.map(function(data) {
                        return $q.all(extend(parseWrapper(data), {
                            item: getDbModel('card')(data.id)
                        }));
                    })).then(function(cards) {
                        campaign.cards = cards;
                        return campaign;
                    });
                };

                this.findAll = function() {
                    return $http.get(url('campaigns'))
                        .then(pick('data'))
                        .then(decorateCampaigns);
                };

                this.find = function(type, id) {
                    return $http.get(url('campaign/' + id))
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
                    return $http.post(url('campaign'), undecorateCampaign(data))
                        .then(pick('data'))
                        .then(this.decorateCampaign)
                        .then(putInArray);
                };

                this.erase = function(type, campaign) {
                    return $http.delete(url('campaign/' + campaign.id))
                        .then(value(null));
                };

                this.update = function(type, campaign) {
                    return $http.put(url('campaign/' + campaign.id), undecorateCampaign(campaign))
                        .then(pick('data'))
                        .then(this.decorateCampaign)
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
                 'VoteAdapter','OrgAdapter','UserAdapter','CardAdapter','CustomerAdapter',
                 'CategoryAdapter','AdvertiserAdapter','ExpGroupAdapter','SelfieCampaignAdapter',
        function( cinema6Provider , ContentAdapter , CWRXAdapter , CampaignAdapter ,
                  VoteAdapter , OrgAdapter , UserAdapter , CardAdapter , CustomerAdapter ,
                  CategoryAdapter , AdvertiserAdapter , ExpGroupAdapter , SelfieCampaignAdapter ) {

            [
                ContentAdapter,
                VoteAdapter,
                OrgAdapter,
                UserAdapter,
                CardAdapter,
                CategoryAdapter,
                ExpGroupAdapter,
                CampaignAdapter,
                SelfieCampaignAdapter,
                AdvertiserAdapter,
                CustomerAdapter
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
                card: CardAdapter,
                category: CategoryAdapter,
                advertiser: AdvertiserAdapter,
                expGroup: ExpGroupAdapter,
                campaign: CampaignAdapter,
                selfieCampaign: SelfieCampaignAdapter,
                customer: CustomerAdapter
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

                    this.name = /selfie/.test(window.location.href) || c6Defines.kSelfie ?
                        'Selfie' : 'Portal';

                    this.title = function() {
                        return 'Cinema6 Dashboard';
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
                    this.route('/apps','Selfie:Apps', function() {
                        this.route('/selfie', 'Selfie:App');
                    });
                });

                this.state('Login');

                this.route('/password/forgot', 'ForgotPassword');
                this.route('/password/reset', 'ResetPassword');

                this.route('/preview/minireel', 'PreviewMiniReel');
            });
        }])

        .controller('AppController', ['CSSLoadingService','cState',
        function                     ( CSSLoadingService , cState ) {
            var appStyles = {
                Portal: [
                    'styles/c6main.css',
                    'styles/minireel/c6studio.css'
                ],
                Selfie: [
                    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300' +
                        'italic,400italic,600italic,700italic|Roboto+Condensed:300italic,300',
                    'https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
                    'styles/selfie/css/select2.min.css',
                    'styles/selfie/css/css-wizardry-grids.css',
                    'styles/selfie/css/c6selfie__base.css',
                    'styles/selfie/css/jess.css',
                    'styles/selfie/css/scott.css'
                ]
            };

            CSSLoadingService.load(appStyles[cState.name]);

            this.version = version;
            this.validImgSrc = /^(http:\/\/|https:\/\/|\/\/)/;
            this.validUrl = /^(http:\/\/|https:\/\/|\/\/)/;
        }]);
});
