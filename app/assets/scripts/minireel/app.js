define( ['angular','c6ui','c6log','c6_state','minireel/services','minireel/tracker',
         'minireel/c6_drag','minireel/card_table','minireel/editor','minireel/manager',
         'minireel/players'],
function( angular , c6ui , c6log , c6State  , services          , tracker          ,
          c6Drag           , cardTable           , editor          , manager          ,
          players          ) {
    /* jshint -W106 */
    'use strict';

    var jqLite = angular.element,
        isDefined = angular.isDefined;

    return angular.module('c6.app.minireel', [
        c6ui.name, c6log.name, c6State.name, c6Drag.name,
        services.name, tracker.name, cardTable.name, editor.name, manager.name, players.name
    ])
        .config(['$sceDelegateProvider',
        function( $sceDelegateProvider ) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                '*://www.youtube.com/**',
                '*://player.vimeo.com/**',
                '*://www.dailymotion.com/**'
            ]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.map('MiniReel', function() {
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

        .directive('confirmDialog', ['ConfirmDialogService',
        function                    ( ConfirmDialogService ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireel/directives/confirm_dialog.html',
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

        .filter('splashPageSrc', ['$sce',
        function                 ( $sce ) {
            return function(minireel) {
                var splash = minireel.data.splash;

                return $sce.trustAsResourceUrl(
                    ('/collateral/splash/' + splash.theme + '/' + splash.ratio + '.html')
                );
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MiniReel', ['c6State',
            function                          ( c6State ) {
                this.templateUrl = 'views/minireel/app.html';
                this.controller = 'MiniReelController';
                this.controllerAs = 'MiniReelCtrl';

                this.enter = function() {
                    c6State.goTo('MR:Manager');
                };
            }]);
        }])

        .controller('MiniReelController', ['$scope','$log','cinema6','c6State','c6Defines',
                                           'tracker','$window',
        function                          ( $scope , $log , cinema6 , c6State , c6Defines ,
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
            });

            $parentWindow.on('resize', function setScreenSpace() {
                self.setScreenSpace();
            });
            this.setScreenSpace();

            $log.info('Initialize tracker with:',c6Defines.kTracker);
            tracker.create(c6Defines.kTracker.accountId,c6Defines.kTracker.config);
        }])

        .directive('embedCode', [function() {
            return {
                restrict: 'E',
                templateUrl: 'views/minireel/directives/embed_code.html',
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
});
