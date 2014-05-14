(function(window$){
    /* jshint -W106 */
    'use strict';

    var noop = angular.noop,
        copy = angular.copy,
        forEach = angular.forEach,
        jqLite = angular.element;

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

        .config(['c6StateProvider','c6UrlMakerProvider',
        function( c6StateProvider , c6UrlMakerProvider ) {
            var assets = c6UrlMakerProvider.makeUrl.bind(c6UrlMakerProvider);

            var newSubstates = {
                category: {
                    templateUrl: assets('views/manager/new/category.html')
                },
                mode: {
                    templateUrl: assets('views/manager/new/mode.html')
                },
                autoplay: {
                    templateUrl: assets('views/manager/new/autoplay.html')
                }
            };

            c6StateProvider
                .state('manager', {
                    controller: 'ManagerController',
                    controllerAs: 'ManagerCtrl',
                    templateUrl: assets('views/manager.html'),
                    model:  ['cinema6',
                    function( cinema6 ) {
                        return this.cModel || cinema6.getAppData()
                            .then(function(appData) {
                                var user = appData.user;

                                return cinema6.db.findAll(
                                    'experience',
                                    { type: 'minireel', org: user.org }
                                );
                            });
                    }],
                    children: {
                        embed: {
                            controller: 'GenericController',
                            controllerAs: 'ManagerEmbedCtrl',
                            templateUrl: assets('views/manager/embed.html'),
                            model:  ['c6StateParams',
                            function( c6StateParams ) {
                                return c6StateParams.minireelId;
                            }]
                        },
                        new: {
                            controller: 'NewController',
                            controllerAs: 'NewCtrl',
                            templateUrl: assets('views/manager/new.html'),
                            model:  ['cinema6','MiniReelService','$q',
                            function( cinema6 , MiniReelService , $q ) {
                                function getModes() {
                                    return cinema6.getAppData()
                                        .then(function returnModes(appData) {
                                            return appData.experience.data.modes;
                                        });
                                }

                                return this.cModel ||
                                    $q.all({
                                        modes: getModes(),
                                        minireel: MiniReelService.create()
                                    });
                            }],
                            updateControllerModel: ['controller','model',
                            function               ( controller , model ) {
                                controller.model = model;

                                controller.returnState = 'manager';
                                controller.baseState = 'manager.new';
                            }],
                            children: copy(newSubstates)
                        }
                    }
                })
                .state('editor', {
                    controller: 'EditorController',
                    controllerAs: 'EditorCtrl',
                    templateUrl: assets('views/editor.html'),
                    model:  ['cinema6','c6StateParams','EditorService',
                    function( cinema6 , c6StateParams , EditorService ) {
                        return this.cModel ||
                            cinema6.db.find('experience', c6StateParams.minireelId)
                                .then(function open(minireel) {
                                    return EditorService.open(minireel);
                                });
                    }],
                    children: {
                        splash: {
                            controller: 'EditorSplashController',
                            controllerAs: 'EditorSplashCtrl',
                            templateUrl: assets('views/editor/splash.html'),
                            model:  [function() {
                                return copy(this.cParent.cModel);
                            }]
                        },
                        setMode: {
                            controller: 'NewController',
                            controllerAs: 'NewCtrl',
                            templateUrl: assets('views/manager/new.html'),
                            model:  ['cinema6','$q',
                            function( cinema6 , $q ) {
                                function getModes() {
                                    return cinema6.getAppData()
                                        .then(function returnModes(appData) {
                                            return appData.experience.data.modes;
                                        });
                                }

                                return this.cModel ||
                                    $q.all({
                                        modes: getModes(),
                                        minireel: this.cParent.cModel
                                    });
                            }],
                            updateControllerModel: ['controller','model',
                            function               ( controller , model ) {
                                controller.model = model;

                                controller.returnState = 'editor';
                                controller.baseState = 'editor.setMode';
                            }],
                            children: copy(newSubstates)
                        },
                        editCard: {
                            controller: 'EditCardController',
                            controllerAs: 'EditCardCtrl',
                            templateUrl: assets('views/editor/edit_card.html'),
                            model:  ['c6StateParams','MiniReelService',
                            function( c6StateParams , MiniReelService ) {
                                var minireel = this.cParent.cModel;

                                return this.cModel ||
                                    copy(MiniReelService.findCard(
                                        minireel.data.deck,
                                        c6StateParams.cardId
                                    )) ||
                                    c6StateParams.card;
                            }],
                            afterModel: ['model','$q','c6State',
                            function    ( model , $q , c6State ) {
                                var types = ['video', 'videoBallot', 'ad'];

                                if(types.indexOf(model.type) < 0) {
                                    c6State.goTo('editor');

                                    return $q.reject('Cannot edit this card');
                                }
                            }],
                            updateControllerModel: ['controller','model',
                            function               ( controller , model ) {
                                var copy = {
                                        name: 'Editorial Content',
                                        sref: 'editor.editCard.copy'
                                    },
                                    video = {
                                        name: 'Video Content',
                                        sref: 'editor.editCard.video'
                                    },
                                    ballot = {
                                        name: 'Questionnaire',
                                        sref: 'editor.editCard.ballot'
                                    },
                                    adServer = {
                                        name: 'Server Settings',
                                        sref: 'editor.editCard.server'
                                    },
                                    adSkip = {
                                        name: 'Skip Settings',
                                        sref: 'editor.editCard.skip'
                                    };

                                controller.model = model;
                                controller.tabs = (function() {
                                    switch (model.type) {
                                    case 'video':
                                        return [copy, video];
                                    case 'videoBallot':
                                        return [copy, video, ballot];
                                    case 'ad':
                                        return [adServer, adSkip];

                                    default:
                                        return [];
                                    }
                                }());
                            }],
                            children: {
                                copy: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardCopyCtrl',
                                    templateUrl: assets('views/editor/edit_card/copy.html'),
                                    model:  [function() {
                                        return this.cParent.cModel;
                                    }]
                                },
                                video: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardVideoCtrl',
                                    templateUrl: assets('views/editor/edit_card/video.html'),
                                    model:  [function() {
                                        return this.cParent.cModel;
                                    }]
                                },
                                ballot: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardBallotCtrl',
                                    templateUrl: assets('views/editor/edit_card/ballot.html'),
                                    model:  [function() {
                                        return this.cParent.cModel.data.ballot;
                                    }],
                                    afterModel: ['model','$q','c6State',
                                    function    ( model , $q , c6State ) {
                                        if (!model) {
                                            c6State.goTo('editor.editCard.video');

                                            return $q.reject('Card doesn\'t support ballots.');
                                        }
                                    }]
                                },
                                server: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardServerCtrl',
                                    templateUrl: assets('views/editor/edit_card/server.html'),
                                    model:  [function() {
                                        return this.cParent.cModel;
                                    }]
                                },
                                skip: {
                                    controller: 'GenericController',
                                    controllerAs: 'EditCardSkipCtrl',
                                    templateUrl: assets('views/editor/edit_card/skip.html'),
                                    model:  [function() {
                                        return this.cParent.cModel;
                                    }]
                                }
                            }
                        },
                        newCard: {
                            controller: 'NewCardController',
                            controllerAs: 'NewCardCtrl',
                            templateUrl: assets('views/editor/new_card.html'),
                            model: ['MiniReelService',
                            function               ( MiniReelService ) {
                                return this.cModel || MiniReelService.createCard();
                            }]
                        }
                    }
                })
                .index('manager');
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

        .controller('GenericController', noop)

        .controller('AppController', [  '$scope','$log','cinema6','gsap',
                                        'c6State', 'c6Defines', 'tracker',
        function                     (  $scope , $log , cinema6 , gsap ,
                                        c6State, c6Defines, tracker ) {
            var self = this;

            $log.info('AppCtlr loaded.');

            this.config = null;
            cinema6.getAppData()
                .then(function setControllerProps(appData) {
                    $log.info('My current user is:',appData.user);
                    self.config = appData.experience;
                });

            cinema6.init({
                setup: function(appData) {
                    gsap.TweenLite.ticker.useRAF(appData.profile.raf);
                }
            });

            c6State.on('stateChangeSuccess', function(state) {
                self.trackStateChange(state);
                cinema6.getSession()
                    .then(function pingSession(session) {
                        session.ping('stateChange', { name: state.name });
                    });
            });

            self.trackStateChange = function(state){
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

            self.sendPageEvent = function() {
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

            self.sendPageView = function(pageObject) {
                if (self.config === null){
                    $log.error('Unable to send pageView for %1, config is null.',
                        pageObject.page);
                    return;
                }

                tracker.pageview('/' + self.config.uri + '/' + pageObject.page,
                    self.config.title + ' - ' + pageObject.title);
            };

            $log.info('Initialize tracker with:',c6Defines.kTracker);
            tracker.create(c6Defines.kTracker.accountId,c6Defines.kTracker.config);

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
                    minireelId: '@'
                }
            };
        }])

        .controller('EmbedCodeController', ['$scope','cinema6',
        function                           ( $scope , cinema6 ) {
            var self = this;

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
                width: 650,
                height: 522
            };

            this.c6EmbedSrc = null;
            cinema6.getAppData()
                .then(function setC6EmbedSrc(data) {
                    self.c6EmbedSrc = data.experience.data.c6EmbedSrc;
                });

            Object.defineProperties(this, {
                code: {
                    get: function() {
                        return '<script src="' +
                            this.c6EmbedSrc +
                            '" data-exp="' +
                            $scope.minireelId +
                            '"' + (this.mode === 'custom' ?
                                (' data-width="' +
                                    this.size.width +
                                    '" data-height="' +
                                    this.size.height + '"') :
                                '') +
                            '></script>';
                    }
                }
            });
        }]);
}(window));
