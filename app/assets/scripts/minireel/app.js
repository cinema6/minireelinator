define( ['angular','c6uilib','c6_state','minireel/services','minireel/tracker',
         'minireel/c6_drag','minireel/card_table','minireel/editor','minireel/manager',
         'minireel/ad_manager','minireel/sponsor','minireel/campaign','c6_defines','cryptojs'],
function( angular , c6uilib , c6State  , services          , tracker          ,
          c6Drag           , cardTable           , editor          , manager          ,
          adManager           , sponsor          , campaign          , c6Defines  , cryptojs ) {
    /* jshint -W106 */
    'use strict';

    var isDefined = angular.isDefined,
        copy = angular.copy,
        jqLite = angular.element;

    return angular.module('c6.app.minireel', [
        c6uilib.name, c6State.name, c6Drag.name,
        services.name, tracker.name, cardTable.name, editor.name,
        manager.name, adManager.name, sponsor.name, campaign.name
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

        .config(['YouTubeDataServiceProvider',
        function( YouTubeDataServiceProvider ) {
            YouTubeDataServiceProvider.apiKey(c6Defines.kYouTubeDataApiKey);
        }])

        .config(['VPAIDServiceProvider', function(VPAIDServiceProvider) {
            VPAIDServiceProvider.swfUrl(
                'http://lib.cinema6.com/c6ui/v3.1.0-0-g58b71cd/videos/swf/player.swf'
            );
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.map('MiniReel', function() {
                this.route('/studio', 'MR:Studio', function() {
                    this.route('/dashboard', 'MR:Manager', function() {
                        this.route('/new', 'MR:New', function() {
                            this.state('MR:New.General');
                            this.state('MR:New.Category');
                            this.state('MR:New.Mode');
                            this.state('MR:New.Autoplay');
                        });
                        this.route('/embed/:minireelId', 'MR:Manager.Embed');
                    });

                    this.route('/edit/:minireelId', 'MR:Editor', function() {
                        this.route('/settings', 'MR:Editor.Settings', function() {
                            this.state('MR:Settings.Category');
                            this.state('MR:Settings.Mode');
                            this.state('MR:Settings.Autoplay');
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

                this.route('/advertising', 'MR:AdManager', function() {
                    this.route('/settings', 'MR:AdManager.Settings', function() {
                        this.route('/', 'MR:AdManager.Settings.Frequency');
                        this.route('/', 'MR:AdManager.Settings.VideoServer');
                        this.route('/', 'MR:AdManager.Settings.DisplayServer');
                    });
                    this.route('/embed/:minireelId', 'MR:AdManager.Embed');
                });

                this.route('/sponsorship', 'MR:Sponsor', function() {
                    this.route('/manager', 'MR:Sponsor.Manager', function() {
                        this.route('/minireel/:minireelId', 'MR:SponsorMiniReel', function() {
                            this.state('MR:SponsorMiniReel.Branding');
                            this.state('MR:SponsorMiniReel.Links');
                            this.state('MR:SponsorMiniReel.Ads');
                            this.state('MR:SponsorMiniReel.Tracking');
                            this.state('MR:SponsorMiniReel.DisplayAd');

                            this.state('MR:SponsorMiniReel.Cards');
                        });

                        this.route('/card/:cardId', 'MR:SponsorCard', function() {
                            this.state('MR:SponsorCard.Copy');
                            this.state('MR:SponsorCard.Video');
                            this.state('MR:SponsorCard.Survey');
                            this.state('MR:SponsorCard.Branding');
                            this.state('MR:SponsorCard.Links');
                            this.state('MR:SponsorCard.Ads');
                            this.state('MR:SponsorCard.Tracking');
                            this.state('MR:SponsorCard.Placement', function() {
                                this.state('MR:Placement.MiniReel');
                                this.state('MR:Placement.Placements');
                                this.state('MR:Placement.Standalone');
                            });
                            this.state('MR:SponsorCard.Position');
                        });
                    });
                });

                this.route('/campaigns', 'MR:CampaignTab', function() {
                    this.state('MR:Campaigns', function() {
                        this.route('/new', 'MR:Campaigns.New');
                    });

                    this.route('/:campaignId', 'MR:Campaign', function() {
                        this.route('/general', 'MR:Campaign.General');
                        this.route('/assets', 'MR:Campaign.Assets');
                    });
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
            function isInElement(child, container) {
                return !!child && (child === container || isInElement(child.parentNode, container));
            }

            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    function handleClick(event) {
                        if (isInElement(event.target, $element[0])) {
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

        .directive('c6Autoselect', [function() {
            function link(scope, $element) {
                $element.on('focus', function() {
                    this.select();

                    jqLite(this).one('mouseup', function($event) {
                        $event.preventDefault();
                    });
                });
            }

            return {
                link: link
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

        .filter('gravatar', [function() {
            return function(email) {
                return '//www.gravatar.com/avatar/' +
                    cryptojs.MD5(email.trim().toLowerCase()).toString(cryptojs.enc.Hex);
            };
        }])

        .filter('timestamp', [function() {
            var divisors = [3600, 60, 1];

            return function(duration) {
                return divisors
                    .map(function(divisor) {
                        return Math.floor(duration / divisor) % 60;
                    })
                    .filter(function(time, index) {
                        return time > 0 || index > 0;
                    })
                    .map(function(time, index) {
                        var string = time.toString();

                        switch (time) {
                        case 0:
                            return (index > 0) ? '00' : '0';
                        default:
                            return (string.length < 2 && index > 0) ? ('0' + string) : string;
                        }
                    })
                    .join(':');
            };
        }])

        .filter('hugeNumber', [function() {
            return function(number) {
                var thousands = number / 1000,
                    millions = number / 1000000;

                if (millions >= 1) {
                    return '1m+';
                }

                if (thousands >= 1) {
                    return (Math.round(thousands * 10) / 10) + 'k';
                }

                return number.toString();
            };
        }])

        .filter('embedid', ['VideoService',
        function           ( VideoService ) {
            var embedIdFromVideoId = VideoService.embedIdFromVideoId;

            function reverse(array) {
                return Array.prototype.reverse.call(array);
            }

            return function() {
                return embedIdFromVideoId.apply(null, reverse(arguments));
            };
        }])

        .directive('paginatorControls', [function() {
            return {
                scope: {
                    limit: '=',
                    page: '=',
                    total: '=',
                    limits: '='
                },
                restrict: 'E',
                templateUrl: 'views/minireel/directives/paginator_controls.html',
                controller: 'PaginatorControlsController',
                controllerAs: 'Ctrl'
            };
        }])

        .controller('PaginatorControlsController', ['$scope','c6Computed',
        function                                   ( $scope , c6Computed ) {
            var self = this,
                c = c6Computed($scope),
                state = {
                    page: $scope.page
                };

            function limitTo(num, min, max) {
                return Math.max(Math.min(num, max), min);
            }

            this.showDropDown = false;
            Object.defineProperties(this, {
                page: {
                    get: function() {
                        return state.page;
                    },
                    set: function(page) {
                        /* jshint boss:true */
                        if (!(/^(\d+|)$/).test(page)) {
                            return state.page;
                        }

                        return state.page = page;
                    }
                }
            });
            c(this, 'limitsObject', function() {
                return ($scope.limits || [])
                    .reduce(function(object, limit) {
                        object[limit + ' per page'] = limit;
                        return object;
                    }, {});
            }, ['limits']);

            this.goTo = function(page) {
                /* jshint boss:true */
                return $scope.page = limitTo(page, 1, $scope.total);
            };

            this.setLimit = function(limit) {
                /* jshint boss:true */
                return $scope.limit = limit;
            };

            $scope.$watch('page', function(page) {
                self.page = page;
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MiniReel', ['c6State','SettingsService','scopePromise',
                                               'cinema6',
            function                          ( c6State , SettingsService , scopePromise ,
                                                cinema6 ) {
                this.templateUrl = 'views/minireel/app.html';
                this.controller = 'MiniReelController';
                this.controllerAs = 'MiniReelCtrl';

                this.getMiniReelList = function(filter, limit, page, previous) {
                    var org = c6State.get('Portal').cModel.org,
                        scopedPromise = scopePromise(cinema6.db.findAll('experience', {
                            type: 'minireel',
                            org: org.id,
                            sort: 'lastUpdated,-1',
                            status: (filter === 'all') ? null : filter,
                            limit: limit,
                            skip: (page - 1) * limit
                        }), previous && previous.value);

                    scopedPromise.selected = (previous || null) && previous.selected;
                    scopedPromise.page = (previous || null) && previous.page;

                    scopedPromise.ensureResolution()
                        .then(function(scopedPromise) {
                            var minireels = scopedPromise.value,
                                items = minireels.meta.items;

                            scopedPromise.selected = minireels.map(function() {
                                return false;
                            });
                            scopedPromise.page = {
                                current: (Math.max(items.start - 1, 0) / limit) + 1,
                                total: Math.max(Math.ceil(items.total / limit), 1)
                            };
                        });

                    return scopedPromise;
                };

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
                                embedTypes: ['script'],
                                minireelDefaults: {
                                    mode: 'light',
                                    autoplay: true,
                                    splash: {
                                        ratio: '3-2',
                                        theme: 'img-text-overlay'
                                    }
                                },
                                embedDefaults: {
                                    size: null
                                }
                            }
                        })
                        .register('MR::user', user.config.minireelinator, {
                            defaults: {
                                minireelDefaults: {
                                    splash: {
                                        ratio: SettingsService.getReadOnly('MR::org')
                                            .minireelDefaults.splash.ratio,
                                        theme: SettingsService.getReadOnly('MR::org')
                                            .minireelDefaults.splash.theme
                                    }
                                }
                            },
                            sync: function(settings) {
                                user.config.minireelinator = settings;
                                return user.save();
                            },
                            localSync: user.id,
                            validateLocal: function(currentUserId, prevUserId) {
                                return currentUserId === prevUserId;
                            }
                        });
                };
                this.enter = function() {
                    c6State.goTo('MR:Manager', null, null, true);
                };
            }]);

            c6StateProvider.state('MR:Studio', ['c6State',
            function                           ( c6State ) {
                this.enter = function() {
                    c6State.goTo('MR:Manager', null, null, true);
                };
            }]);
        }])

        .controller('MiniReelController', ['$scope','$log','c6State','tracker',
        function                          ( $scope , $log , c6State , tracker ) {
            var self = this;

            $log.info('MiniReelController loaded.');

            this.branding = null;
            this.config = null;

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
                soloPlayerUrl = minireelState.cModel.data.soloPlayerUrl,
                orgSettings = SettingsService.getReadOnly('MR::org');

            var allFormats = {
                script: {
                    name: 'Script Tag',
                    value: 'script'
                },
                shortcode: {
                    name: 'Wordpress Shortcode',
                    value: 'shortcode'
                },
                iframe: {
                    name: 'IFrame',
                    value: 'iframe'
                }
            };

            function formatEmbed(template, data, _processors) {
                var repeatedMatcher = (/\|.+?\|/),
                    repeated = template.match(repeatedMatcher)[0].replace(/^.|.$/g, ''),
                    bookends = template.split(repeatedMatcher),
                    processors = _processors || {};

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
            this.mode = orgSettings.embedDefaults.size ? 'custom' : this.modes[0].value;

            this.formats = orgSettings.embedTypes.map(function(type) {
                return allFormats[type];
            });
            this.format = this.formats[0].value;

            this.size = copy(orgSettings.embedDefaults.size) || {
                width: '650px',
                height: '522px'
            };

            Object.defineProperty(this, 'code', {
                get: function() {
                    var minireel = $scope.minireel,
                        splash = minireel.data.splash,
                        isInline = MiniReelService.modeCategoryOf(minireel, categories)
                            .value === 'inline',
                        explicitDimensions = this.mode === 'custom';

                    var data = {
                        'exp': minireel.id,
                        'splash': splash.theme + ':' + splash.ratio.replace('-', '/'),
                        'width': explicitDimensions ? this.size.width : false,
                        'height': explicitDimensions ? this.size.height : false,
                        'preload': isInline
                    };

                    switch (this.format) {
                    case 'shortcode':
                        return formatEmbed('[minireel version="1" |{attr}="{value}"|]', data, {
                            preload: function(string) {
                                return string + '="preload"';
                            }
                        });
                    case 'script':
                        return formatEmbed(
                            '<script src="' + c6EmbedSrc + '" |data-{attr}="{value}"|></script>',
                            data
                        );
                    case 'iframe':
                        return formatEmbed(
                            '<iframe |{attr}="{value}"|></iframe>',
                            {
                                src: soloPlayerUrl + '?id=' + minireel.id,
                                frameborder: '0',
                                width: explicitDimensions ? this.size.width : '100%',
                                height: explicitDimensions ? this.size.height : '100%'
                            }
                        );
                    }
                }
            });
        }]);
});
