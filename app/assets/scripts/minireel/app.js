define( ['angular','c6ui','c6log','c6_state','minireel/services','minireel/tracker',
         'minireel/c6_drag','minireel/card_table','minireel/editor','minireel/manager',
         'minireel/players','c6_defines'],
function( angular , c6ui , c6log , c6State  , services          , tracker          ,
          c6Drag           , cardTable           , editor          , manager          ,
          players          , c6Defines  ) {
    /* jshint -W106 */
    'use strict';

    var isDefined = angular.isDefined;

    return angular.module('c6.app.minireel', [
        c6ui.name, c6log.name, c6State.name, c6Drag.name,
        services.name, tracker.name, cardTable.name, editor.name, manager.name, players.name
    ])
        .config(['$sceDelegateProvider','$compileProvider',
        function( $sceDelegateProvider , $compileProvider ) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/)
                .imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

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
            c6StateProvider.state('MiniReel', ['c6State','SettingsService',
            function                          ( c6State , SettingsService ) {
                this.templateUrl = 'views/minireel/app.html';
                this.controller = 'MiniReelController';
                this.controllerAs = 'MiniReelCtrl';

                this.model = function() {
                    return this.cParent.cModel[0];
                };
                this.afterModel = function() {
                    var user = c6State.get('Portal').cModel;

                    if (!user.org.config.minireelinator) {
                        user.org.config.minireelinator = {};
                    }
                    if (!user.config.minireelinator) {
                        user.config.minireelinator = {};
                    }


                    SettingsService
                        .register('MR::org', user.org.config.minireelinator, {
                            localSync: false,
                            defaults: {
                                embedTypes: ['script']
                            }
                        })
                        .register('MR::user', user.config.minireelinator, {
                            defaults: {
                                defaultSplash: {
                                    ratio: '3-2',
                                    theme: 'img-text-overlay'
                                }
                            },
                            sync: function(settings) {
                                user.config.minireelinator = settings;
                                return user.save();
                            }
                        });
                };
                this.enter = function() {
                    c6State.goTo('MR:Manager', null, null, true);
                };
            }]);
        }])

        .controller('MiniReelController', ['$scope','$log','c6State','tracker',
        function                          ( $scope , $log , c6State , tracker ) {
            var self = this;

            $log.info('AppCtlr loaded.');

            this.branding = null;
            this.config = null;
            this.user = null;

            this.trackStateChange = function(state){
                $log.info('trackChange:',state.cName);
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

            c6State.on('stateChange', this.trackStateChange);

            $log.info('Initialize tracker with:',c6Defines.kTracker);
            tracker.create(c6Defines.kTracker.accountId,c6Defines.kTracker.config);

            $scope.$on('$destroy', function() {
                c6State.removeListener('stateChange', self.trackStateChange);
            });
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

        .controller('EmbedCodeController', ['$scope','$attrs','MiniReelService','c6State',
                                            'SettingsService',
        function                           ( $scope , $attrs , MiniReelService , c6State ,
                                             SettingsService ) {
            var minireelState = c6State.get('MiniReel'),
                categories = minireelState.cModel.data.modes,
                c6EmbedSrc = minireelState.cModel.data.c6EmbedSrc,
                orgSettings = SettingsService.getReadOnly('MR::org');

            var allFormats = {
                script: {
                    name: 'Script Tag',
                    value: 'script'
                },
                shortcode: {
                    name: 'Wordpress Shortcode',
                    value: 'shortcode'
                }
            };

            function formatEmbed(template, data, processors) {
                var repeatedMatcher = (/\|.+?\|/),
                    repeated = template.match(repeatedMatcher)[0].replace(/^.|.$/g, ''),
                    bookends = template.split(repeatedMatcher);

                function identity(arg) {
                    return arg;
                }

                return bookends[0] +
                    Object.keys(data)
                        .filter(function(attr) {
                            return data[attr] !== false;
                        })
                        .map(function(attr) {
                            var value = data[attr],
                                processor = processors[attr] || identity;

                            return processor((value === true ?
                                repeated.split('=')[0] : repeated)
                                    .replace('{attr}', attr)
                                    .replace('{value}', data[attr]));
                        }).join(' ') +
                    bookends[1];
            }

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

            this.formats = orgSettings.embedTypes.map(function(type) {
                return allFormats[type];
            });
            this.format = this.formats[0].value;

            this.size = {
                width: '650px',
                height: '522px'
            };

            Object.defineProperty(this, 'code', {
                get: function() {
                    var minireel = $scope.minireel,
                        splash = minireel.data.splash,
                        branding = minireel.data.branding,
                        isInline = MiniReelService.modeCategoryOf(minireel, categories)
                            .value === 'inline',
                        explicitDimensions = this.mode === 'custom';

                    function shortcodeBase64(string) {
                        var value = string.match(/"(.*?)"/)[1];

                        return string.replace(value, 'data:text/plain;base64,' + btoa(value));
                    }

                    function scriptBase64(string) {
                        var value = string.match(/"(.*?)"/)[1];

                        return string
                            .replace(/^data-/, 'data-:')
                            .replace(value, btoa(value));
                    }

                    var data = {
                        'exp': minireel.id,
                        'title': minireel.data.title,
                        'splash': splash.theme + ':' + splash.ratio.replace('-', '/'),
                        'branding': branding ? branding : false,
                        'width': explicitDimensions ? this.size.width : false,
                        'height': explicitDimensions ? this.size.height : false,
                        'preload': isInline
                    };

                    switch (this.format) {
                    case 'shortcode':
                        return formatEmbed('[minireel version="1" |{attr}="{value}"|]', data, {
                            title: shortcodeBase64,
                            branding: shortcodeBase64,
                            preload: function(string) {
                                return string + '="preload"';
                            }
                        });
                    case 'script':
                        return formatEmbed(
                            '<script src="' + c6EmbedSrc + '" |data-{attr}="{value}"|></script>',
                            data,
                            {
                                title: scriptBase64,
                                branding: scriptBase64
                            }
                        );
                    }
                }
            });
        }]);
});
