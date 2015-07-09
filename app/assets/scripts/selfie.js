define( ['angular','c6_state','c6uilib','select2'],
function( angular , c6State  , c6uilib ) {
    'use strict';

    var extend = angular.extend,
        fromJson = angular.fromJson,
        toJson = angular.toJson;

    return angular.module('c6.app.selfie', [c6State.name, c6uilib.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie', ['$q','cinema6','c6State','AuthService',
            function                        ( $q , cinema6 , c6State , AuthService ) {
                this.templateUrl = 'views/selfie.html';
                this.controller = 'SelfieController';
                this.controllerAs = 'SelfieCtrl';

                this.model = function() {
                    return AuthService.checkStatus()
                        .catch(function redirect(reason) {
                            c6State.goTo('Login', null, null, true);
                            return $q.reject(reason);
                        });
                };
                this.enter = function() {
                    c6State.goTo('Selfie:Apps', null, null, true);
                };
            }]);
        }])

        .controller('SelfieController', ['AuthService','c6State','CSSLoadingService',
        function                        ( AuthService , c6State , CSSLoadingService ) {

            CSSLoadingService.load([
                'http://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300ita' +
                    'lic,400italic,600italic,700italic|Roboto+Condensed:300italic,300',
                'http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
                'styles/selfie/select2.min.css',
                'styles/selfie/css-wizardry-grids.css',
                'styles/selfie/c6selfie__base.css'
            ]);

            this.initWithModel = function(model) {
                this.model = model;
            };

            this.logout = function() {
                return AuthService.logout()
                    .then(function transition() {
                        return c6State.goTo('Login', null, {});
                    });
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Apps', ['c6State','cinema6','$q',
            function                             ( c6State , cinema6 , $q ) {
                this.model = function() {
                    var applications = this.cParent.cModel.applications;

                    return $q.all(applications.map(function(id) {
                        return cinema6.db.find('experience', id);
                    })).then(function(experiences) {
                        return experiences.reduce(function(result, experience) {
                            result[experience.appUri] = experience;
                            return result;
                        }, {});
                    });
                };
                this.enter = function() {
                    var experiences = this.cModel,
                        selfie = experiences.selfie;

                    if (selfie) {
                        return c6State.goTo('Selfie:App', [selfie], null, true);
                    }

                    c6State.goTo('Error', [
                        'You do not have any supported experiences!'
                    ], null, true);
                };
            }]);
        }])

        .service('CSSLoadingService', ['$document',
        function                      ( $document ) {
            this.load = function() {
                Array.prototype.slice.call(arguments)
                    .reduce(function(result, arg) {
                        (Array.isArray(arg) ? arg : [arg])
                            .forEach(function(path) {
                                result.push(path);
                            });
                        return result;
                    }, [])
                    .forEach(function(filepath) {
                        var file = document.createElement('link');
                        file.setAttribute('rel', 'stylesheet');
                        file.setAttribute('type', 'text/css');
                        file.setAttribute('href', filepath);

                        $document.find('head').append(file);
                    });
            };
        }])

        .directive('c6FillCheck', ['$timeout',
        function                  ( $timeout ) {
            return {
                restrict: 'A',
                link: function(scope, $element) {
                    $timeout(function() {
                        if ($element.val()) {
                            $element.addClass('form__fillCheck--filled');
                        }

                        $element.blur(function() {
                            if ($element.val()){
                                $element.addClass('form__fillCheck--filled');
                            } else {
                                $element.removeClass('form__fillCheck--filled');
                            }
                        });
                    });
                }
            };
        }])

        .directive('c6SelectBox', ['$timeout',
        function                  ( $timeout ) {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    $timeout(function() {
                        $element.select2({
                            minimumResultsForSearch: Infinity
                        });

                        if (attrs.preselected) {
                            $element.addClass('form__fillCheck--filled');
                        }

                        $element.on('select2:open', function() {
                            $element.addClass('form__fillCheck--filled');
                            $element.addClass('ui--active');
                        });

                        $element.on('select2:close', function() {
                            $element.removeClass('ui--active');
                        });
                    });
                }
            };
        }])

        .service('SelfieVideoService', ['$http','c6UrlParser','$q',
        function                       ( $http , c6UrlParser , $q ) {
            function getJSONProp(json, prop) {
                return (fromJson(json) || {})[prop];
            }

            function setJSONProp(json, prop, value) {
                var proto = {};

                proto[prop] = value;

                return toJson(extend(fromJson(json) || {}, proto));
            }

            function validateVast(url) {
                return $http.get(url)
                    .then(function(response) {
                        var isVast = /VAST/.test(response.data),
                            isXml = response.headers()['content-type'] === 'text/xml';

                        if (!isVast || !isXml) {
                            return $q.reject('Not a valid VAST tag');
                        }

                        return {
                            service: 'adUnit',
                            id: setJSONProp(null, 'vast', url)
                        };
                    });
            }

            this.dataFromUrl = function(url) {
                var parsed = c6UrlParser(url),
                    service = (parsed.hostname.match(
                        /youtube|dailymotion|vimeo|aol|yahoo|rumble/
                    ) || [])[0],
                    id,
                    idFetchers = {
                        youtube: function(url) {
                            return params(url.search).v;
                        },
                        vimeo: function(url) {
                            return url.pathname.replace(/^\//, '');
                        },
                        dailymotion: function(url) {
                            var pathname = url.pathname;

                            if (pathname.search(/^\/video\//) < 0) {
                                return null;
                            }

                            return (pathname
                                .replace(/\/video\//, '')
                                .match(/[a-zA-Z0-9]+/) || [])[0];
                        },
                        aol: function(url) {
                            return (url.pathname.match(/[^\/]+$/) || [null])[0];
                        },
                        yahoo: function(url) {
                            return (url.pathname
                                .match(/[^/]+(?=(\.html))/) || [null])[0];
                        },
                        rumble: function(url) {
                            return (url.pathname
                                .match(/[^/]+(?=(\.html))/) || [null])[0];
                        }
                    };

                function params(search) {
                    return search.split('&')
                        .map(function(pair) {
                            return pair.split('=')
                                .map(decodeURIComponent);
                        })
                        .reduce(function(params, pair) {
                            params[pair[0]] = pair[1];

                            return params;
                        }, {});
                }

                if (!service) {
                    if (/^http|https|\/\//.test(url)) {
                        return validateVast(url);
                    } else {
                        return $q.reject('Unable to determine service');
                    }
                }

                id = idFetchers[service](parsed);

                if (!id) { return $q.reject('Unable to find id'); }

                return $q.when({
                    service: service,
                    id: id
                });
            };

            this.urlFromData = function(service, id) {
                switch (service) {

                case 'youtube':
                    return 'https://www.youtube.com/watch?v=' + id;
                case 'vimeo':
                    return 'http://vimeo.com/' + id;
                case 'dailymotion':
                    return 'http://www.dailymotion.com/video/' + id;
                case 'aol':
                    return 'http://on.aol.com/video/' + id;
                case 'yahoo':
                    return 'https://screen.yahoo.com/' + id + '.html';
                case 'rumble':
                    return 'https://rumble.com/' + id + '.html';
                case 'adUnit':
                    return getJSONProp(id, 'vast');

                }
            };
        }]);
});
