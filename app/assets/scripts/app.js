(function(window$){
    /* jshint -W106 */
    'use strict';

    var noop = angular.noop,
        copy = angular.copy,
        forEach = angular.forEach,
        jqLite = angular.element,
        extend = angular.extend,
        isDefined = angular.isDefined;

    angular.module('c6.mrmaker', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide',
        function( $provide ) {
            var config = {
                modernizr: 'Modernizr',
                gsap: [
                    'TimelineLite',
                    'TimelineMax',
                    'TweenLite',
                    'TweenMax',
                    'Back',
                    'Bounce',
                    'Circ',
                    'Cubic',
                    'Ease',
                    'EaseLookup',
                    'Elastic',
                    'Expo',
                    'Linear',
                    'Power0',
                    'Power1',
                    'Power2',
                    'Power3',
                    'Power4',
                    'Quad',
                    'Quart',
                    'Quint',
                    'RoughEase',
                    'Sine',
                    'SlowMo',
                    'SteppedEase',
                    'Strong'
                ],
                crypto: 'CryptoJS',
                youtube: 'YT'
            };

            angular.forEach(config, function(value, key) {
                if (angular.isString(value)) {
                    $provide.value(key, window[value]);
                } else if (angular.isArray(value)) {
                    $provide.factory(key, function() {
                        var service = {};

                        angular.forEach(value, function(global) {
                            service[global] = window[global];
                        });

                        return service;
                    });
                }
            });
        }])

        .config(['$sceDelegateProvider',
        function( $sceDelegateProvider ) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                '*://www.youtube.com/**',
                '*://player.vimeo.com/**',
                '*://www.dailymotion.com/**'
            ]);
        }])

        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl,'default');
            c6UrlMakerProvider.location((c6Defines.kLocal ?
                'assets' + c6Defines.kExpUrl :
                c6Defines.kExpUrl
            ), 'app');
            c6UrlMakerProvider.location(c6Defines.kCollateralUrl, 'collateral');
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
                return $http.get(config.apiBase + '/election/' + id)
                    .then(function arrayify(response) {
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

        .constant('ContentAdapter', ['$http','$q','config',
        function                    ( $http , $q , config ) {
            function clean(model) {
                delete model.id;
                delete model.org;
                delete model.created;

                return model;
            }

            this.findAll = function() {
                return $http.get(config.apiBase + '/content/experiences')
                    .then(function returnData(response) {
                        return response.data;
                    });
            };

            this.find = function(type, id) {
                return $http.get(config.apiBase + '/content/experience/' + id)
                    .then(function arrayify(response) {
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

                return $http.get(config.apiBase + '/content/experiences', {
                        params: query
                    })
                    .then(returnData, handleError);
            };

            this.create = function(type, data) {
                return $http.post(config.apiBase + '/content/experience', clean(data))
                    .then(function arrayify(response) {
                        return [response.data];
                    });
            };

            this.erase = function(type, model) {
                return $http.delete(config.apiBase + '/content/experience/' + model.id)
                    .then(function returnNull() {
                        return null;
                    });
            };

            this.update = function(type, model) {
                return $http.put(config.apiBase + '/content/experience/' + model.id, clean(model))
                    .then(function arrayify(response) {
                        return [response.data];
                    });
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

        .config(['cinema6Provider','c6UrlMakerProvider','ContentAdapter','CWRXAdapter',
                 'VoteAdapter','c6Defines',
        function( cinema6Provider , c6UrlMakerProvider , ContentAdapter , CWRXAdapter ,
                  VoteAdapter , c6Defines ) {
            var FixtureAdapter = cinema6Provider.adapters.fixture;

            ContentAdapter.config = {
                apiBase: '/api'
            };
            VoteAdapter.config = {
                apiBase: '/api'
            };

            CWRXAdapter.config = {
                election: VoteAdapter,
                experience: ContentAdapter
            };

            FixtureAdapter.config = {
                jsonSrc: c6UrlMakerProvider.makeUrl('mock/fixtures.json')
            };

            cinema6Provider.useAdapter(c6Defines.kLocal ? FixtureAdapter : CWRXAdapter);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.map(function() {
                this.route('/dashboard', 'MR:Manager', function() {
                    this.route('/new', 'MR:New', function() {
                        this.route('/', 'MR:New.General');
                        this.route('/', 'MR:New.Category');
                        this.route('/', 'MR:New.Mode');
                        this.route('/', 'MR:New.Autoplay');
                    });
                    this.route('/embed/:minireelId', 'MR:Manager.Embed');
                });

                this.route('/edit/:minireelId', 'MR:Editor', function() {
                    this.route('/settings', 'MR:Editor.Settings', function() {
                        this.route('/', 'MR:Settings.Category');
                        this.route('/', 'MR:Settings.Mode');
                        this.route('/', 'MR:Settings.Autoplay');
                    });
                    this.route('/splash', 'MR:Editor.Splash', function() {
                        this.route('/', 'MR:Splash.Source');
                        this.route('/', 'MR:Splash.Image');
                    });
                    this.route('/card/:cardId', 'MR:EditCard', function() {
                        this.state('MR:EditCard.Copy');
                        this.state('MR:EditCard.Video');
                        this.state('MR:EditCard.Ballot');
                    });
                    this.route('/card/new', 'MR:Editor.NewCard');
                });
            });
        }])

        .config(['CollateralServiceProvider',
        function( CollateralServiceProvider ) {
            CollateralServiceProvider
                .defaultCollageWidth(600)
                .ratios(['1-1', '6-5', '3-2', '16-9']);
        }])

        .service('c6Runner', ['$timeout',
        function             ( $timeout ) {
            this.runOnce = function(fn, waitTime) {
                var timer;

                return function() {
                    $timeout.cancel(timer);
                    timer = $timeout(fn, waitTime);
                };
            };
        }])

        .run    (['c6Runner','cinema6',
        function ( c6Runner , cinema6 ) {
            var proto = jqLite.fn,
                notifyDOMModified = c6Runner.runOnce(function() {
                    cinema6.getSession()
                        .then(function ping(session) {
                            session.ping('domModified');
                        });
                }, 100);

            [
                'addClass',
                'after',
                'append',
                'attr',
                'css',
                'empty',
                'html',
                'prepend',
                'remove',
                'removeAttr',
                'removeClass'
            ].forEach(function(methodName) {
                var method = proto[methodName];

                proto[methodName] = function() {
                    var result = method.apply(this, arguments);
                    notifyDOMModified();

                    return result;
                };
            });
        }])

        .run   (['$rootScope',
        function( $rootScope ) {
            $rootScope.Infinity = Infinity;
        }])

        .service('ConfirmDialogService', [function() {
            var model = {},
                dialog = null;

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            Object.defineProperty(model, 'dialog', {
                get: function() {
                    return dialog;
                }
            });

            this.display = function(dialogModel) {
                dialog = dialogModel;
                dialog.onDismiss = dialog.onDismiss || this.close;
            };

            this.close = function() {
                dialog = null;
            };
        }])

        .directive('confirmDialog', ['c6UrlMaker','ConfirmDialogService',
        function                    ( c6UrlMaker , ConfirmDialogService ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/confirm_dialog.html'),
                scope: {},
                link: function(scope) {
                    scope.model = ConfirmDialogService.model;
                }
            };
        }])

        .directive('c6ClickOutside', ['$document','$timeout',
        function                     ( $document , $timeout ) {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    function handleClick(event) {
                        if (event.target === $element[0]) {
                            return;
                        }

                        scope.$apply(function() {
                            scope.$eval(attrs.c6ClickOutside);
                        });
                    }

                    $timeout(function() {
                        $document.on('click', handleClick);
                    }, 0, false);

                    $element.on('$destroy', function() {
                        $document.off('click', handleClick);
                    });
                }
            };
        }])

        .directive('input', [function() {
            return {
                restrict: 'E',
                require: '?ngModel',
                link: function(scope, $element, attrs, ctrl) {
                    var getFile;

                    if (!ctrl || attrs.type !== 'file') { return; }

                    getFile = function() {
                        return $element.prop('files')[0];
                    };

                    $element.on('change', function() {
                        var file = getFile();

                        scope.$apply(function() {
                            ctrl.$setViewValue(file, 'change');
                        });
                    });

                    ctrl.$render = function() {
                        if (!ctrl.$modelValue && !getFile()) { return; }

                        throw new Error(
                            'An <input type="file">\'s value cannot be set via data-binding.'
                        );
                    };
                }
            };
        }])

        .directive('c6BgImg', [function() {
            return {
                restrict: 'AC',
                link: function(scope, element, attrs) {
                    attrs.$observe('c6BgImg', function(src) {
                        element.css('background-image', (src || '') && ('url("' + src + '")'));
                    });
                }
            };
        }])

        .filter('percent', [function() {
            return function(number) {
                return ((number || 0) * 100) + '%';
            };
        }])

        .filter('image', ['FileService',
        function         ( FileService ) {
            return function(file) {
                return (file || null) && FileService.open(file).url;
            };
        }])

        .filter('splashPageSrc', ['$sce','c6UrlMaker',
        function                 ( $sce , c6UrlMaker ) {
            return function(minireel) {
                var splash = minireel.data.splash;

                return $sce.trustAsResourceUrl(c6UrlMaker(
                    ('splash/' + splash.theme + '/' + splash.ratio + '.html'),
                'collateral'));
            };
        }])

        .service('appData', ['cinema6',
        function            ( cinema6 ) {
            var self = this,
                promise = cinema6.getAppData()
                    .then(function fulfill(data) {
                        return extend(self, data);
                    });

            this.ensureFulfillment = function() {
                return promise;
            };
        }])

        .controller('GenericController', noop)

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider
                .state('Application', ['c6UrlMaker','cinema6','appData',
                function              ( c6UrlMaker , cinema6 , appData ) {
                    this.templateUrl = c6UrlMaker('views/app.html');
                    this.controller = 'AppController';
                    this.controllerAs = 'AppCtrl';

                    this.beforeModel = function() {
                        cinema6.init();

                        return appData.ensureFulfillment();
                    };
                }]);
        }])

        .controller('AppController', ['$scope','$log','cinema6','c6State','c6Defines',
                                      'tracker','$window',
        function                     ( $scope , $log , cinema6 , c6State , c6Defines ,
                                       tracker , $window ) {
            var self = this,
                $parentWindow = jqLite($window.parent);

            $log.info('AppCtlr loaded.');

            this.branding = null;
            this.config = null;
            this.user = null;
            cinema6.getAppData()
                .then(function setControllerProps(appData) {
                    $log.info('My current user is:',appData.user);
                    self.config = appData.experience;
                    self.user = appData.user;
                });

            this.screenSpace = {
                width: null,
                height: null
            };

            this.setScreenSpace = function() {
                return cinema6.getSession()
                    .then(function requestSpace(session) {
                        return session.request('availableSpace');
                    })
                    .then(function setScreenSpace(space) {
                        /* jshint boss:true */
                        return self.screenSpace = space;
                    });
            };

            this.trackStateChange = function(state){
                $log.info('trackChange:',state.name);
                if ((self.config === null) || (!state.templateUrl)){
                    return;
                }
                tracker.pageview(
                    state.templateUrl.replace(/.*views\/(.*).html$/,
                        '/' + self.config.uri + '/$1'),
                    self.config.title + ' - ' + state.name
                );
            };

            this.sendPageEvent = function() {
                if (self.config === null){
                    $log.error('Unable to send pageEvent for %1, config is null.',
                        arguments[0]);
                    return;
                }
                var args  = Array.prototype.slice.call(arguments,0),
                    pageObj = args.pop();
                pageObj.page  = '/' + self.config.uri + '/' + pageObj.page;
                pageObj.title = self.config.title + ' - ' + pageObj.title;
                args.push(pageObj);
                tracker.event.apply(tracker,args);
            };

            this.sendPageView = function(pageObject) {
                if (self.config === null){
                    $log.error('Unable to send pageView for %1, config is null.',
                        pageObject.page);
                    return;
                }

                tracker.pageview('/' + self.config.uri + '/' + pageObject.page,
                    self.config.title + ' - ' + pageObject.title);
            };

            c6State.on('stateChange', function(state) {
                self.trackStateChange(state);
                cinema6.getSession()
                    .then(function pingSession(session) {
                        session.ping('stateChange', { name: state.cName });
                    });
            });

            $parentWindow.on('resize', function setScreenSpace() {
                self.setScreenSpace();
            });
            this.setScreenSpace();

            $log.info('Initialize tracker with:',c6Defines.kTracker);
            tracker.create(c6Defines.kTracker.accountId,c6Defines.kTracker.config);

            //TODO: WRITE A TEST
            c6State.goTo('MR:Manager');

            $scope.AppCtrl = this;

        }])

        .directive('embedCode', ['c6UrlMaker',
        function                ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/embed_code.html'),
                controller: 'EmbedCodeController',
                controllerAs: 'Ctrl',
                scope: {
                    minireel: '=',
                    splashSrc: '@'
                }
            };
        }])

        .controller('EmbedCodeController', ['$scope','$attrs','MiniReelService','appData',
        function                           ( $scope , $attrs , MiniReelService , appData ) {
            var self = this,
                categories = null;

            this.readOnly = isDefined($attrs.readonly);
            this.modes = [
                {
                    name: 'Responsive Auto-fit *',
                    value: 'responsive'
                },
                {
                    name: 'Custom Size',
                    value: 'custom'
                }
            ];
            this.mode = this.modes[0].value;

            this.size = {
                width: '650px',
                height: '522px'
            };

            this.c6EmbedSrc = null;
            appData.ensureFulfillment()
                .then(function setC6EmbedSrc(data) {
                    self.c6EmbedSrc = data.experience.data.c6EmbedSrc;
                    categories = data.experience.data.modes;
                });

            Object.defineProperties(this, {
                code: {
                    get: function() {
                        var minireel = $scope.minireel,
                            splash = minireel.data.splash,
                            branding = minireel.data.branding,
                            isInline = MiniReelService.modeCategoryOf(
                                minireel,
                                categories
                            ).value === 'inline';

                        return '<script src="' + this.c6EmbedSrc + '"' +
                            ' data-exp="' + minireel.id + '"' +
                            ' data-:title="' + btoa(minireel.data.title) + '"' +
                            ' data-splash="' +
                                splash.theme + ':' + splash.ratio.split('-').join('/') +
                            '"' +
                            (isInline ?
                                ' data-preload' :
                                ''
                            ) +
                            (this.mode === 'custom' ?
                                (' data-width="' +
                                    this.size.width +
                                    '" data-height="' +
                                    this.size.height + '"') :
                                '') +
                            (!!branding ?
                                (' data-:branding="' +
                                    btoa(branding) +
                                    '"') :
                                '') +
                            '></script>';
                    }
                }
            });
        }]);
}(window));
