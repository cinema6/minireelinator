define( ['angular','ngAnimate','minireel/app','account/app','login','portal','c6uilib','c6log',
         'c6_defines','templates','forgot_password','preview_minireel','ui'],
function( angular , ngAnimate , minireel     , account     , login , portal , c6uilib , c6log ,
          c6Defines  , templates , forgotPassword  , previewMiniReel  , ui ) {
    'use strict';

    var forEach = angular.forEach,
        copy = angular.copy,
        noop = angular.noop,
        isObject = angular.isObject;

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
        previewMiniReel.name
    ])
        .config(['c6UrlMakerProvider',
        function( c6UrlMakerProvider ) {
            c6UrlMakerProvider.location(c6Defines.kApiUrl, 'api');
        }])

        .constant('VoteAdapter', ['$http','config','$q',
        function                 ( $http , config , $q ) {
            function clean(model) {
                delete model.org;
                delete model.created;
                delete model.id;

                return model;
            }

            this.findAll = function() {
                return $q.reject('The vote service does not support finding all elections.');
            };

            this.find = function(type, id) {
                return $http.get(config.apiBase + '/election/' + id, {
                    cache: true
                }).then(function arrayify(response) {
                    return [response.data];
                });
            };

            this.findQuery = function(type, query) {
                return this.find(type, query.id);
            };

            this.create = function(type, data) {
                return $http.post(config.apiBase + '/election', clean(data))
                    .then(function arrayify(response) {
                        return [response.data];
                    });
            };

            this.erase = function(type, model) {
                return $http.delete(config.apiBase + '/election/' + model.id)
                    .then(function returnNull() {
                        return null;
                    });
            };

            this.update = function(type, model) {
                return $http.put(config.apiBase + '/election/' + model.id, clean(model))
                    .then(function arrayify(response) {
                        return [response.data];
                    });
            };
        }])

        .constant('UserAdapter', ['$http','$q','cinema6','config',
        function                 ( $http , $q , cinema6 , config ) {
            //var self = this;

            function clean(model) {
                delete model.id;
                delete model.created;
                delete model.org;
                delete model.email;
                delete model.permissions;

                return model;
            }

            function returnData(response) {
                return response.data;
            }

            function arrayify(data) {
                return [data];
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
                return $http.get(config.apiBase + '/account/user/' + id, {
                    cache: true
                }).then(returnData)
                    .then(this.decorateWithOrg)
                    .then(arrayify);
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
                return $http.put(config.apiBase + '/account/user/' + model.id, clean(model))
                    .then(returnData)
                    .then(this.decorateWithOrg)
                    .then(arrayify);
            };

            ['findAll', 'findQuery', 'create', 'erase'].forEach(function(method) {
                this[method] = function() {
                    return $q.reject('UserAdapter.' + method + '() method is not implemented.');
                };
            }, this);
        }])

        .constant('OrgAdapter', ['$http','$q','config',
        function                ( $http , $q , config ) {
            function clean(model) {
                delete model.id;
                delete model.created;

                return model;
            }

            this.findAll = function() {
                return $http.get(config.apiBase + '/account/orgs')
                    .then(function returnData(response) {
                        return response.data;
                    });
            };

            this.find = function(type, id) {
                return $http.get(config.apiBase + '/account/org/' + id, {
                    cache: true
                }).then(function arrayify(response) {
                    return [response.data];
                });
            };

            this.findQuery = function(type, query) {
                function returnData(response) {
                    return response.data;
                }

                function handleError(response) {
                    return response.status === 404 ?
                        [] : $q.reject(response);
                }

                return $http.get(config.apiBase + '/account/orgs', {
                        params: query
                    })
                    .then(returnData, handleError);
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
        }])

        .constant('ContentAdapter', ['$http','$q','cinema6','config',
        function                    ( $http , $q , cinema6 , config ) {
            var self = this;

            function clean(model) {
                delete model.id;
                delete model.org;
                delete model.created;
                model.user = model.user && model.user.id;

                return model;
            }

            function returnData(response) {
                return response.data;
            }

            function arrayify(object) {
                return [object];
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
                    .catch(function nullify() {
                        experience.user = null;
                        return experience;
                    });
            };

            this.findAll = function() {
                return $http.get(config.apiBase + '/content/experiences')
                    .then(function returnData(response) {
                        return response.data;
                    })
                    .then(decorateWithUsers);
            };

            this.find = function(type, id) {
                return $http.get(config.apiBase + '/content/experience/' + id, {
                    cache: true
                }).then(returnData)
                    .then(this.decorateWithUser)
                    .then(arrayify);
            };

            this.findQuery = function(type, query, meta) {
                function setPageInfo(response) {
                    meta.items = response.headers('Content-Range')
                        .match(/\d+/g)
                        .map(function(num, index) {
                            return [this[index], parseInt(num)];
                        }, ['start', 'end', 'total'])
                        .reduce(function(obj, pair) {
                            obj[pair[0]] = pair[1];
                            return obj;
                        }, {});

                    return response;
                }

                function handleError(response) {
                    return response.status === 404 ?
                        [] : $q.reject(response);
                }

                return $http.get(config.apiBase + '/content/experiences', {
                        params: query
                    }).then(setPageInfo)
                        .then(returnData, handleError)
                        .then(decorateWithUsers);
            };

            this.create = function(type, data) {
                return $http.post(config.apiBase + '/content/experience', clean(data))
                    .then(returnData)
                    .then(this.decorateWithUser)
                    .then(arrayify);
            };

            this.erase = function(type, model) {
                return $http.delete(config.apiBase + '/content/experience/' + model.id)
                    .then(function returnNull() {
                        return null;
                    });
            };

            this.update = function(type, model) {
                return $http.put(config.apiBase + '/content/experience/' + model.id, clean(model))
                    .then(returnData)
                    .then(this.decorateWithUser)
                    .then(arrayify);
            };
        }])

        .constant('CWRXAdapter', ['config','$injector',
        function                 ( config , $injector ) {
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
        }])

        .config(['cinema6Provider','ContentAdapter','CWRXAdapter',
                 'VoteAdapter','OrgAdapter','UserAdapter',
        function( cinema6Provider , ContentAdapter , CWRXAdapter ,
                  VoteAdapter , OrgAdapter , UserAdapter ) {
            ContentAdapter.config = {
                apiBase: '/api'
            };
            VoteAdapter.config = {
                apiBase: '/api'
            };
            OrgAdapter.config = {
                apiBase: '/api'
            };
            UserAdapter.config = {
                apiBase: '/api'
            };

            CWRXAdapter.config = {
                election: VoteAdapter,
                experience: ContentAdapter,
                org: OrgAdapter,
                user: UserAdapter
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

                    this.title = function() {
                        return 'Cinema6 Dashboard';
                    };
                    this.enter = function() {
                        c6State.goTo('Portal', null, null, true);
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

                this.state('Login');

                this.route('/password/forgot', 'ForgotPassword');
                this.route('/password/reset', 'ResetPassword');

                this.route('/preview/minireel', 'PreviewMiniReel');
            });
        }])

        .controller('AppController', [function() {}]);

});
