define( ['angular','c6uilib','c6_state','minireel/video_search','minireel/services','c6_defines',
'./mixins/VideoCardController','c6embed'],
function( angular , c6uilib , c6State  , videoSearch           , services          , c6Defines  ,
VideoCardController           , c6embed) {
    'use strict';

    var isNumber = angular.isNumber,
        equals = angular.equals,
        copy = angular.copy,
        forEach = angular.forEach,
        isDefined = angular.isDefined,
        noop = angular.noop,
        extend = angular.extend;

    return angular.module('c6.app.minireel.editor', [
        videoSearch.name,
        c6uilib.name,
        c6State.name,
        services.name
    ])
        .animation('.toolbar__publish', ['$timeout',
        function                        ( $timeout ) {
            return {
                beforeAddClass: function($element, className, done) {
                    function showConfirmation($element, done) {
                        $element.addClass('toolbar__publish--confirm');

                        $timeout(function() {
                            $element.removeClass('toolbar__publish--confirm');
                            done();
                        }, 3000, false);
                    }

                    switch (className) {
                    case 'toolbar__publish--disabled':
                        return showConfirmation($element, done);

                    default:
                        return done();
                    }
                }
            };
        }])

        .service('EditorService', ['MiniReelService','$q','c6AsyncQueue','VoteService',
                                   'CollateralService','SettingsService','ThumbnailService',
        function                  ( MiniReelService , $q , c6AsyncQueue , VoteService ,
                                    CollateralService , SettingsService , ThumbnailService ) {
            var _private = {},
                queue = c6AsyncQueue(),
                beforeSyncFns = {};

            function readOnly(source, key, target) {
                Object.defineProperty(target, key, {
                    enumerable: true,
                    configurable: true,
                    get: function() {
                        return source[key];
                    }
                });
            }

            function rejectNothingOpen() {
                return $q.reject('Cannot sync. There is no open MiniReel.');
            }

            function syncToProxy(minireel) {
                return _private.syncToProxy(_private.proxy, _private.editorMinireel, minireel);
            }

            function performPresync() {
                return _private.performPresync(_private.proxy);
            }

            function syncToMinireel() {
                return _private.syncToMinireel(
                    _private.minireel,
                    _private.editorMinireel,
                    _private.proxy
                );
            }

            /**
             * Accepts a property name and a collection.
             *
             * Returns an object with the members of the collection keyed by the provided prop.
             */
            function keyBy(prop, array) {
                return array.reduce(function(result, item) {
                    result[item[prop]] = item;
                    return result;
                }, {});
            }

            /**
             * Accepts an object and a string property name. The property name gave have "."s in it
             * to represent the properties of an object.
             *
             * Returns the value of the provided property from the object.
             *
             * Unlike native JS getters which will TypeError if it expects an object but gets a
             * non-object (e.g minireel.data.deck[0].ballot.election, if 'ballot' is undefined,)
             * this function will just return 'undefined' without throwing an Error.
             */
            function get(object, prop) {
                return prop.split('.')
                    .filter(function(prop) {
                        return !!prop;
                    })
                    .reduce(function(result, prop) {
                        return result && result[prop];
                    }, object);
            }

            /**
             * Accepts an object, a string property name and a value. Like get(), the property name
             * can have "."s in it to represent the properties of an object.
             *
             * This function sets the provided property of the provided object to the provided
             * value.
             *
             * Like get(), this function will not throw errors if it expects an object but gets a
             * non-object.
             */
            function set(object, prop, value) {
                var props = prop.split('.'),
                    lastProp = props.pop(),
                    target = get(object, props.join('.'));

                return target && (target[lastProp] = value);
            }

            /**
             * Accepts two objects (from and to) and a property name as a string.
             *
             * This function copies the value of "prop" on "from" to the "prop" on "to".
             *
             * Because this function uses get() and set(), it will not throw errors it encounters
             * any non-objects that it expects to be objects.
             */
            function attemptCopy(from, to, prop) {
                return set(to, prop, get(from, prop));
            }

            _private.minireel = null;
            _private.editorMinireel = null;
            _private.proxy = null;

            _private.campaign = null;

            _private.performPresync = function(proxy) {
                function syncWithCollateral(proxy) {
                    if (proxy.data.splash.source === 'specified') {
                        return $q.when(proxy);
                    }

                    return CollateralService.generateCollage({
                        minireel: proxy,
                        name: 'splash'
                    }).then(function store(data) {
                        proxy.data.collateral.splash = data.toString();
                    })
                    .catch(function rescue() {
                        return proxy;
                    });
                }

                function fetchThumbs(proxy) {
                    return $q.all(proxy.data.deck.filter(function(card) {
                        return (/^(yahoo|aol|rumble)$/).test(card.data.service) && !card.thumb;
                    }).map(function(card) {
                        var service = card.data.service,
                            videoid = card.data.videoid;

                        return ThumbnailService.getThumbsFor(service, videoid)
                            .ensureFulfillment()
                            .then(function(thumb) {
                                card.thumb = thumb.large;
                            });
                    }));
                }

                function beforeSync(proxy) {
                    return $q.all(Object.keys(beforeSyncFns).map(function(id) {
                        return beforeSyncFns[id](proxy);
                    })).finally(function() {
                        beforeSyncFns = {};
                    });
                }

                return beforeSync(proxy)
                    .then(function() {
                        return $q.all([syncWithCollateral, fetchThumbs].map(function(fn) {
                            return fn(proxy);
                        }));
                    })
                    .then(function() {
                        return proxy;
                    });
            };

            _private.syncToMinireel = function(minireel, editorMinireel, proxy) {
                copy(proxy.data, editorMinireel.data);
                return MiniReelService.convertForPlayer(editorMinireel, minireel);
            };

            _private.syncToProxy = function(proxy, editorMinireel, minireel) {
                // Card props that should be copied to the proxy
                var cardCopyProps = [
                    'data.ballot.election',
                    'data.survey.election'
                ];
                // MiniReel.data props that should be copied to the proxy
                var dataCopyProps = [
                    'election'
                ];

                function sync(editorMinireel) {
                    var cards = keyBy('id', editorMinireel.data.deck);

                    // Copy new MiniReel props to the proxy
                    forEach(editorMinireel, function(value, key) {
                        if (proxy.hasOwnProperty(key)) { return; }

                        return readOnly(editorMinireel, key, proxy);
                    });
                    // Delete deleted MiniReel props from the proxy
                    forEach(proxy, function(value, key) {
                        if (editorMinireel.hasOwnProperty(key)) { return; }

                        delete proxy[key];
                    });
                    // Copy necessary MiniReel.data props to the proxy
                    forEach(dataCopyProps, function(prop) {
                        attemptCopy(editorMinireel.data, proxy.data, prop);
                    });
                    // Copy necessary card props to the proxy
                    forEach(proxy.data.deck, function(proxyCard) {
                        cardCopyProps.forEach(function(prop) {
                            attemptCopy(cards[proxyCard.id], proxyCard, prop);
                        });
                    });

                    return proxy;
                }

                return MiniReelService.convertForEditor(minireel, editorMinireel).then(sync);
            };

            this.state = {};
            Object.defineProperties(this.state, {
                dirty: {
                    get: function() {
                        var proxy = _private.proxy,
                            editorMinireel = _private.editorMinireel;
                        return (proxy || null) && !equals(proxy, editorMinireel);
                    }
                },
                inFlight: {
                    get: function() {
                        return !!queue.queue.length;
                    }
                },
                minireel: {
                    configurable: true,
                    get: function() {
                        return _private.proxy;
                    }
                },

                campaign: {
                    get: function() {
                        return _private.campaign;
                    }
                }
            });

            this.open = function(minireel, campaign) {
                function createProxy(editorMinireel) {
                    var proxy = {};
                    var data = copy(editorMinireel.data);

                    forEach(editorMinireel, function(value, key) {
                        if (key === 'data') {
                            Object.defineProperty(proxy, key, {
                                enumerable: true,
                                get: function() {
                                    return data;
                                }
                            });
                            return;
                        }

                        return readOnly(editorMinireel, key, proxy);
                    });

                    SettingsService
                        .createBinding(proxy.data.splash, 'ratio',
                            'MR::user.minireelDefaults.splash.ratio')
                        .createBinding(proxy.data.splash, 'theme',
                            'MR::user.minireelDefaults.splash.theme');
                    proxy.data.splash.ratio = minireel.data.splash.ratio;
                    proxy.data.splash.theme = minireel.data.splash.theme;

                    _private.editorMinireel = editorMinireel;
                    _private.proxy = proxy;

                    return proxy;
                }

                _private.minireel = minireel;
                _private.campaign = campaign || null;

                return MiniReelService.convertForEditor(minireel).then(createProxy);
            };

            this.close = function() {
                ['minireel', 'editorMinireel', 'proxy']
                    .forEach(function(prop) {
                        _private[prop] = null;
                    });
            };

            this.beforeSync = function(id, fn) {
                beforeSyncFns[id] = fn;
            };

            this.sync = queue.wrap(function() {
                var minireel = _private.minireel;

                function syncWithElection(minireel) {
                    if (minireel.status !== 'active'){
                        return $q.when(minireel);
                    }

                    return VoteService.syncMiniReel(minireel);
                }

                if (!minireel) {
                    return rejectNothingOpen();
                }

                return performPresync()
                    .then(syncToMinireel)
                    .then(syncWithElection)
                    .then(function save(minireel){
                        return minireel.save();
                    })
                    .then(syncToProxy);
            }, this);

            this.enablePreview = queue.wrap(function() {
                if (!_private.minireel) {
                    return rejectNothingOpen();
                }

                return performPresync()
                    .then(syncToMinireel)
                    .then(function enablePreview(minireel) {
                        return MiniReelService.enablePreview(minireel);
                    })
                    .then(syncToProxy);
            }, this);

            this.disablePreview = queue.wrap(function() {
                if (!_private.minireel) {
                    return rejectNothingOpen();
                }

                return performPresync()
                    .then(syncToMinireel)
                    .then(function enablePreview(minireel) {
                        return MiniReelService.disablePreview(minireel);
                    })
                    .then(syncToProxy);
            }, this);

            this.publish = queue.wrap(function() {
                var minireel = _private.minireel;

                if (!minireel) {
                    return rejectNothingOpen();
                }

                return performPresync()
                    .then(syncToMinireel)
                    .then(function publish(minireel) {
                        return MiniReelService.publish(minireel);
                    })
                    .then(syncToProxy);
            }, this);

            this.unpublish = queue.wrap(function() {
                var minireel = _private.minireel;

                if (!minireel) {
                    return rejectNothingOpen();
                }

                return performPresync()
                    .then(syncToMinireel)
                    .then(function unpublish(minireel) {
                        return MiniReelService.unpublish(minireel);
                    })
                    .then(syncToProxy);
            }, this);

            this.erase = queue.wrap(function() {
                var minireel = _private.minireel;

                if (!minireel) {
                    return rejectNothingOpen();
                }

                return MiniReelService.erase(minireel);
            }, this);

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Editor', ['cinema6','EditorService','$q',
            function                           ( cinema6 , EditorService , $q ) {
                this.controller = 'EditorController';
                this.controllerAs = 'EditorCtrl';
                this.templateUrl = 'views/minireel/editor.html';

                this.model = function(params) {
                    return cinema6.db.find('experience', params.minireelId);
                };
                this.afterModel = function(model, params) {
                    var campaignId = params.campaign;

                    return $q.all([
                        model,
                        (campaignId ? cinema6.db.find('campaign', campaignId) : null)
                    ]).then(function(args) {
                        return EditorService.open.apply(EditorService, args);
                    });
                };
                this.title = function(model) {
                    return 'Cinema6: Editing "' + model.data.title + '"';
                };
            }]);
        }])

        .controller('EditorController', ['c6State','$scope','EditorService','cinema6',
                                         'ConfirmDialogService','c6Debounce','$q','$log',
                                         'MiniReelService','CollateralService',
                                         'VideoErrorService',
        function                        ( c6State , $scope , EditorService , cinema6 ,
                                          ConfirmDialogService , c6Debounce , $q , $log ,
                                          MiniReelService , CollateralService ,
                                          VideoErrorService ) {
            var self = this,
                MiniReelCtrl = $scope.MiniReelCtrl,
                cardLimits = {
                    copy: Infinity
                },
                saveAfterTenSeconds = c6Debounce(function() {
                    if (!shouldAutoSave()) { return; }

                    $log.info('Autosaving MiniReel');
                    self.save();
                }, 10000),
                generateTemporaryCollage = c6Debounce(function() {
                    var isSpecified = self.model.data.splash.source === 'specified';

                    if (shouldAutoSave() || isSpecified || !self.minireelState.dirty) { return; }

                    $log.info('Generating temporary collage.');

                    CollateralService.generateCollage({
                        minireel: self.model,
                        name: 'splash--temp.jpg',
                        allRatios: false
                    }).then(function attach(collage) {
                        self.model.data.collateral.splash = collage.toString();
                        self.bustCache();
                    });
                }, 10000);

            function shouldAutoSave() {
                return self.model.status !== 'active';
            }

            function setFocus(state) {
                if (state.cName === 'MR:EditCard') {
                    self.focusOn('modal');
                }
            }

            $log = $log.context('EditorController');

//            this.pageObject = { page : 'editor', title : 'Editor' };
            this.preview = false;
            this.showSearch = false;
            this.focus = 'video-search';
            this.editTitle = false;
            this.dismissDirtyWarning = false;
            this.minireelState = EditorService.state;
            this.cacheBuster = 0;

            Object.defineProperties(this, {
                videoErrors: {
                    get: function() {
                        return this.model.data.deck.map(function(card) {
                            var data = card.data;

                            return VideoErrorService.getErrorFor(data.service, data.videoid);
                        });
                    }
                },
                prettyMode: {
                    get: function() {
                        var categories = MiniReelCtrl.model.data.modes,
                            targetMode = this.model.data.mode;

                        return categories && (function() {
                            var result;

                            forEach(categories, function(category) {
                                forEach(category.modes, function(mode) {
                                    if (mode.value === targetMode) {
                                        result = mode.name;
                                    }
                                });
                            });

                            return result;
                        }());
                    }
                },
                cardLimits: {
                    configurable: true,
                    get: function() {
                        var config = MiniReelCtrl.model,
                            mode;

                        if (!config) { return cardLimits; }

                        mode = MiniReelService.modeDataOf(
                            this.model,
                            config.data.modes
                        );

                        forEach(cardLimits, function(limit, prop) {
                            cardLimits[prop] = mode.limits[prop] || Infinity;
                        });

                        return cardLimits;
                    }
                },
                splashSrc: {
                    get: function() {
                        var splash = this.model.data.collateral.splash,
                            isBlob = (/^blob:/).test(splash);

                        return splash && (splash + (isBlob ? '' : ('?cb=' + this.cacheBuster)));
                    }
                },
                previewUrl: {
                    get: function() {
                        return MiniReelService.previewUrlOf(this.model);
                    }
                },
                lastEditableIndex: {
                    get: function() {
                        return this.model.data.deck.map(this.canEditCard)
                            .lastIndexOf(true);
                    }
                }
            });

            this.initWithModel = function(minireel) {
                this.__minireel__ = minireel;
                this.model = EditorService.state.minireel;
                this.campaign = EditorService.state.campaign;

                MiniReelCtrl.branding = this.model.data.branding;
            };

            this.bustCache = function() {
                this.cacheBuster++;
            };

            this.toggleSearch = function() {
                this.showSearch = !this.showSearch;
            };

            this.focusOn = function(value) {
                /* jshint boss:true */
                return this.focus = value;
            };

            this.queueSearch = function(query) {
                this.showSearch = true;
                this.focusOn('video-search');
                $scope.$broadcast('EditorCtrl:searchQueued', query);
            };

            this.errorForCard = function(card) {
                var limit = this.cardLimits.copy,
                    text = card.note || '',
                    error = this.videoErrors[this.model.data.deck.indexOf(card)] || {};

                if (error.present) {
                    switch (error.code) {
                    case 403:
                        return 'Video not embeddable.';
                    case 404:
                        return 'Video not found.';
                    default:
                        return error.message;
                    }
                }

                return (text.length > limit) ?
                    'Character limit exceeded (+' + (text.length - limit) + ').' :
                    null;
            };

            this.canEditCard = function(card) {
                switch (card.type) {
                case 'wildcard':
                    return true;
                case 'recap':
                case 'displayAd':
                    return false;
                default:
                    return !card.sponsored;
                }
            };

            this.publish = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this MiniReel public?',
                    affirm: 'Publish',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        EditorService.publish();
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.makePrivate = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this MiniReel private?',
                    affirm: 'Make Private',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        EditorService.unpublish();
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.newCard = function(insertionIndex) {
                return c6State.goTo('MR:Editor.NewCard', null, {
                    insertAt: insertionIndex
                });
            };

            this.editCard = function(card) {
                return c6State.goTo('MR:EditCard', [copy(card)]);
            };

            this.deleteCard = function(card/*,evtSrc*/) {
//                if (evtSrc){
//                    MiniReelCtrl.sendPageEvent('Editor','Click','Delete Card',self.pageObject);
//                }
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this card?',
                    affirm: 'Delete',
                    cancel: 'Keep',
                    onAffirm: function() {
                        var deck = self.model.data.deck;

                        ConfirmDialogService.close();

                        deck.splice(deck.indexOf(card), 1);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            this.pushCard = function(card) {
                this.model.data.deck.splice(-1, 0, card);

                return card;
            };

            this.previewMode = function(card/*,evtSrc*/) {
//                if (evtSrc){
//                    MiniReelCtrl.sendPageEvent('Editor','Click','Preview Card',self.pageObject);
//                }
                var experience = copy(self.model);
                experience.data.adConfig = experience.data.adConfig || self.model.user.org.adConfig;
                self.preview = true;
                $scope.$broadcast('mrPreview:updateExperience', experience, card);
            };

            this.closePreview = function() {
                self.preview = false;
                $scope.$broadcast('mrPreview:reset');
            };

            this.deleteMinireel = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this MiniReel?',
                    affirm: 'Delete',
                    cancel: 'Keep',
                    onCancel: function() {
                        ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        EditorService.erase()
                            .then(function backToManager() {
                                c6State.goTo('MR:Manager');
                            });

                        ConfirmDialogService.close();
                    }
                });
            };

            this.save = function() {
                return EditorService.sync()
                    .then(function log(minireel) {
                        $log.info('MiniReel save success!', minireel);

                        self.dismissDirtyWarning = false;
                        self.bustCache();
                        return minireel;
                    });
            };

            this.confirmSave = function() {
                ConfirmDialogService.display({
                    prompt: 'You are making changes to a published MiniReel. ' +
                        'Are you sure you want to continue?',
                    affirm: 'Yes, publish my changes',
                    cancel: 'Cancel',
                    onCancel: function() {
                        ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        self.save();
                        ConfirmDialogService.close();
                    }
                });
            };

            this.returnToCampaign = function() {
                var campaign = this.campaign;

                return $q.all([this.save(), campaign.save()]).then(function() {
                    return c6State.goTo('MR:Campaign.MiniReels', [campaign, null]);
                }).then(function() {
                    return campaign;
                }).catch(function(err) {
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the campaign. ' + err.data,
                        affirm: 'OK',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                            return c6State.goTo('MR:Campaign.MiniReels', [campaign, null]);
                        },
                        onCancel: function() {
                            ConfirmDialogService.close();
                            return c6State.goTo('MR:Campaign.MiniReels', [campaign, null]);
                        }
                    });

                    return $q.reject(err);
                });

            };

            this.backToDashboard = function() {
                if (this.model.status === 'active' && this.minireelState.dirty) {
                    ConfirmDialogService.display({
                        prompt: 'You have unpublished changes.',
                        message: 'Are you sure you want to leave this screen? ' +
                            'All changes will be lost.',
                        affirm: 'Yes, lose changes',
                        cancel: 'No, publish my changes first',
                        onCancel: function() {
                            self.save();
                            c6State.goTo('MR:Manager');
                            ConfirmDialogService.close();
                        },
                        onAffirm: function() {
                            c6State.goTo('MR:Manager');
                            ConfirmDialogService.close();
                        }
                    });
                } else {
                    c6State.goTo('MR:Manager');
                }
            };

            $scope.$watch(function() {
                return self.model.data.mode + self.model.data.autoplay;
            }, function(newMode, oldMode) {
                if(newMode === oldMode) { return; }
                $scope.$broadcast('mrPreview:updateMode', self.model);
            });

            $scope.$watch(function() { return self.minireelState.dirty; }, function(isDirty) {
                if (!isDirty) { return; }

                $log.info('MiniReel is dirty!');
                generateTemporaryCollage();

                if (!shouldAutoSave()) {
                    $log.warn('MiniReel is published. Will not autosave.');
                    return;
                }

                saveAfterTenSeconds();
            });

            c6State.on('stateChange', setFocus);

            $scope.$on('mrPreview:closePreview', self.closePreview);

            $scope.$on('VideoSearchCtrl:addVideo', function($event, card, id) {
                var existingCard = MiniReelService.findCard(self.model.data.deck, id);

                if (existingCard && existingCard.type === 'recap') {
                    return;
                }

                if (existingCard) {
                    return ConfirmDialogService.display({
                        prompt: 'This will overwrite "' + existingCard.title + '".' +
                            ' Are you sure you want to add this video to the card?',
                        affirm: 'Yes, I\'m Sure',
                        cancel: 'Cancel',
                        onAffirm: function() {
                            if (!(/^video/).test(existingCard.type)) {
                                MiniReelService.setCardType(existingCard, 'video');
                            }

                            ['service', 'videoid'].forEach(function(prop) {
                                existingCard.data[prop] = card.data[prop];
                            });

                            ConfirmDialogService.close();

                            self.editCard(existingCard);
                        },
                        onCancel: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                return c6State.goTo('MR:EditCard', [card], {
                    insertAt: self.model.data.deck.length - 1
                });
            });

            $scope.$on('$destroy', function() {
                function save() {
                    if (shouldAutoSave()) {
                        return self.save();
                    }

                    return $q.when(self.model);
                }

                MiniReelCtrl.branding = null;
                c6State.removeListener('stateChange', setFocus);

                save()
                    .then(function close() {
                        EditorService.close();
                    });
            });


        //    MiniReelCtrl.sendPageView(this.pageObject);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider
                .state('MR:Editor.Settings', ['c6UrlMaker','EditorService',
                function                     ( c6UrlMaker , EditorService ) {
                    this.controller = 'NewController';
                    this.controllerAs = 'NewCtrl';
                    this.templateUrl = 'views/minireel/manager/new.html';

                    this.model = function() {
                        return EditorService.state.minireel;
                    };
                }])

                .state('MR:Settings.Category', ['cinema6',
                function                       ( cinema6 ) {
                    this.templateUrl = 'views/minireel/manager/new/category.html';
                    this.controller = 'GenericController';
                    this.controllerAs = 'NewCategoryCtrl';

                    this.model = function() {
                        return cinema6.db.findAll('category');
                    };
                }])

                .state('MR:Settings.Mode', [function() {
                    this.templateUrl = 'views/minireel/manager/new/mode.html';
                }])

                .state('MR:Settings.Autoplay', [function() {
                    this.templateUrl = 'views/minireel/manager/new/autoplay.html';
                }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Editor.Splash', ['EditorService',
            function                                  ( EditorService ) {
                this.controller = 'EditorSplashController';
                this.controllerAs = 'EditorSplashCtrl';
                this.templateUrl = 'views/minireel/editor/splash.html';

                this.model = function() {
                    return copy(EditorService.state.minireel);
                };
            }]);
        }])

        .controller('EditorSplashController', ['$scope','c6State','$log',
        function                              ( $scope , c6State , $log ) {
            var self = this;

            function tabBySref(sref) {
                return self.tabs.reduce(function(result, next) {
                    return next.sref === sref ? next : result;
                }, null);
            }

            function incrementTabVisits(state) {
                tabBySref(state.cName).visits++;
            }

            $log = ($log.context || function() { return $log; })('EditorSplashCtrl');

            this.tabs = [
                {
                    name: 'Source Type',
                    sref: 'MR:Splash.Source',
                    visits: 0,
                    requiredVisits: 0
                },
                {
                    name: 'Image Settings',
                    sref: 'MR:Splash.Image',
                    visits: 0,
                    requiredVisits: 0
                }
            ];
            Object.defineProperties(this, {
                currentTab: {
                    configurable: true,
                    get: function() {
                        return this.tabs.reduce(function(result, next) {
                            return next.sref === c6State.current ?
                                next : result;
                        }, null);
                    }
                }
            });

            this.initWithModel = function(model) {
                this.splashSrc = model.data.collateral.splash;

                this.model = model;
            };

            this.isAsFarAs = function(tab) {
                var tabs = this.tabs;

                return tabs.indexOf(tab) <= tabs.indexOf(this.currentTab);
            };

            this.tabIsValid = function(tab) {
                if (!tab) { return tab; }

                switch (tab.sref) {
                case 'MR:Splash.Image':
                    switch (this.model.data.splash.source) {
                    case 'generated':
                        return this.isAsFarAs(tab);
                    case 'specified':
                        return this.isAsFarAs(tab) && !!this.splashSrc;
                    }
                    break;
                default:
                    return this.isAsFarAs(tab);
                }
            };

            c6State.on('stateChange', incrementTabVisits);

            $scope.$on('$destroy', function() {
                c6State.removeListener('stateChange', incrementTabVisits);
            });

            $scope.$watch(
                function() { return self.model.data.splash.source; },
                function(source, prevSource) {
                    var imageTab;

                    if (source === prevSource) { return; }
                    imageTab = tabBySref('MR:Splash.Image');

                    imageTab.requiredVisits = imageTab.visits + 1;
                    self.splashSrc = null;
                    self.model.data.collateral.splash = null;
                }
            );
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider
                .state('MR:Splash.Source', [function() {
                    this.controller = 'GenericController';
                    this.controllerAs = 'SplashSourceCtrl';
                    this.templateUrl = 'views/minireel/editor/splash/source.html';
                }])

                .state('MR:Splash.Image', [function() {
                    this.controller = 'SplashImageController';
                    this.controllerAs = 'SplashImageCtrl';
                    this.templateUrl = 'views/minireel/editor/splash/image.html';
                }]);
        }])

        .controller('SplashImageController', ['$scope','CollateralService','$log','$q','c6State',
                                              'FileService','EditorService',
        function                             ( $scope , CollateralService , $log , $q , c6State ,
                                               FileService , EditorService ) {
            var EditorCtrl = $scope.EditorCtrl,
                EditorSplashCtrl = $scope.EditorSplashCtrl;
            var self = this,
                minireel = EditorSplashCtrl.model,
                splash = minireel.data.splash;

            $log = ($log.context || function() { return $log; })('EditorSplashCtrl');

            this.isGenerating = false;
            this.maxFileSize = 307200;
            this.splash = null;
            this.currentUpload = null;
            this.generatedSrcs = {
                '1-1': null,
                '6-5': null,
                '3-2': null,
                '16-9': null
            };
            Object.defineProperties(this, {
                fileTooBig: {
                    configurable: true,
                    get: function() {
                        return ((this.splash || {}).size || 0) > this.maxFileSize;
                    }
                },
                splashSrc: {
                    get: function() {
                        switch (splash.source) {
                        case 'specified':
                            return EditorSplashCtrl.splashSrc;
                        case 'generated':
                            return this.generatedSrcs[splash.ratio];
                        }
                    }
                }
            });

            this.uploadSplash = function(minireel) {
                var upload;

                $log.info('Upload started: ', this.splash);
                this.currentUpload = upload =
                    CollateralService.set('splash', this.splash, minireel);

                return upload
                    .finally(function cleanup() {
                        $log.info('Uploaded completed!');
                        self.currentUpload = null;
                    });
            };

            this.generateSplash = function(permanent) {
                this.isGenerating = true;

                return CollateralService.generateCollage({
                    minireel: minireel,
                    name: 'splash',
                    allRatios: !permanent
                }).then(function setSplashSrc(data) {
                    copy(data, self.generatedSrcs);

                    return data;
                })
                .finally(function setFlag() {
                    self.isGenerating = false;
                });
            };

            this.save = function() {
                var data = EditorCtrl.model.data;

                function copy(source, dest) {
                    forEach(source, function(value, prop) {
                        dest[prop] = source[prop];
                    });

                    return dest;
                }

                function handleImageAsset(minireel) {
                    function generated(minireel) {
                        minireel.data.collateral.splash = self.splashSrc;

                        return EditorService.beforeSync('splash', noop);
                    }

                    function specified(minireel) {
                        if (!self.splash) { return; }

                        minireel.data.collateral.splash = self.splashSrc;

                        return EditorService.beforeSync('splash', function(proxy) {
                            return self.uploadSplash(proxy)
                                .then(function close() {
                                    return FileService.open(self.splash).close();
                                });
                        });
                    }

                    switch (splash.source) {
                    case 'generated':
                        generated(minireel);
                        break;
                    case 'specified':
                        specified(minireel);
                        break;
                    }

                    return $q.when(minireel);
                }

                return handleImageAsset(minireel)
                    .then(function copyData(minireel) {
                        $log.info('Saving data: ', minireel);
                        copy(minireel.data.collateral, data.collateral);
                        copy(minireel.data.splash, data.splash);
                        $log.info('Save complete: ', EditorCtrl.model);

                        c6State.goTo('MR:Editor');
                        EditorCtrl.bustCache();

                        return EditorCtrl.model;
                    });
            };

            $scope.$watch(function() { return self.splash; }, function(newImage, oldImage) {
                var file;

                if (!newImage) { return; }
                file = FileService.open(newImage);

                EditorSplashCtrl.splashSrc = file.url;

                if (!oldImage) { return; }

                FileService.open(oldImage).close();
            });

            if (splash.source === 'generated') {
                this.generateSplash(false);
            }
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider
                .state('MR:EditCard', ['c6UrlMaker','MiniReelService','c6State','$q',
                                       'EditorService',
                function              ( c6UrlMaker , MiniReelService , c6State , $q ,
                                        EditorService ) {
                    this.controller = 'EditCardController';
                    this.controllerAs = 'EditCardCtrl';
                    this.templateUrl = 'views/minireel/editor/edit_card.html';
                    this.queryParams = {
                        insertionIndex: '&insertAt'
                    };

                    this.model = function(params) {
                        var deck = EditorService.state.minireel.data.deck;

                        return copy(MiniReelService.findCard(deck, params.cardId));
                    };

                    this.afterModel = function(model) {
                        var types = ['image', 'video', 'videoBallot', 'text', 'instagram'];

                        if (!model || types.indexOf(model.type) < 0 || model.sponsored) {
                            c6State.goTo('MR:Editor', null, {}, true);
                            return $q.reject('Cannot edit this card.');
                        }
                    };
                }])

                .state('MR:EditCard.Copy', [function() {
                    this.controller = 'GenericController';
                    this.controllerAs = 'EditCardCopyCtrl';
                    this.templateUrl = 'views/minireel/editor/edit_card/copy.html';
                }])

                .state('MR:EditCard.Video', ['MiniReelService',
                function                    ( MiniReelService ) {
                    this.controller = 'EditCardVideoController';
                    this.controllerAs = 'EditCardVideoCtrl';
                    this.templateUrl = 'views/minireel/editor/edit_card/video.html';

                    this.model = function() {
                        var card = this.cParent.cModel;

                        if (!(/^video/).test(card.type)) {
                            return MiniReelService.setCardType(card, 'video');
                        }

                        return card;
                    };
                }])

                .state('MR:EditCard.Ballot', ['c6UrlMaker','MiniReelService',
                function                     ( c6UrlMaker , MiniReelService ) {
                    this.controller = 'GenericController';
                    this.controllerAs = 'EditCardBallotCtrl';
                    this.templateUrl = 'views/minireel/editor/edit_card/ballot.html';
                    this.model = function() {
                        var card = this.cParent.cModel;

                        if (card.type !== 'videoBallot') {
                            MiniReelService.setCardType(card, 'videoBallot');
                        }

                        return card.data.ballot;
                    };
                }])

                .state('MR:EditCard.Image', ['MiniReelService',
                function                    ( MiniReelService ) {
                    this.controller = 'EditCardImageController';
                    this.controllerAs = 'EditCardImageCtrl';
                    this.templateUrl = 'views/minireel/editor/edit_card/image.html';

                    this.model = function() {
                        var card = this.cParent.cModel;

                        if (card.type !== 'image') {
                            MiniReelService.setCardType(card, 'image');
                        }

                        return card;
                    };
                }])

                .state('MR:EditCard.Instagram', ['MiniReelService',
                function                    ( MiniReelService ) {
                    this.controller = 'EditCardInstagramController';
                    this.controllerAs = 'EditCardInstagramCtrl';
                    this.templateUrl = 'views/minireel/editor/edit_card/instagram.html';

                    this.model = function() {
                        var card = this.cParent.cModel;

                        if (card.type !== 'instagram') {
                            MiniReelService.setCardType(card, 'instagram');
                        }

                        return card;
                    };
                }]);
        }])

        .controller('EditCardController', ['$scope','$injector','c6State','VideoService',
                                           'MiniReelService','ConfirmDialogService',
        function                          ( $scope , $injector , c6State , VideoService ,
                                            MiniReelService , ConfirmDialogService ) {
            var self = this,
                EditorCtrl = $scope.EditorCtrl,
                primaryButton = {},
                negativeButton = {};

            $injector.invoke(VideoCardController, this);

            Object.defineProperties(this, {
                currentTab: {
                    configurable: true,
                    get: function() {
                        return this.tabs.filter(function(tab) {
                            return tab.sref === c6State.current;
                        })[0] || null;
                    }
                },
                canSave: {
                    configurable: true,
                    get: function() {
                        if (this.error) {
                            return false;
                        }

                        switch (this.model.type) {
                        case 'image':
                        case 'video':
                        case 'videoBallot':
                            return [this.copyComplete].indexOf(false) < 0 &&
                                !EditorCtrl.errorForCard(this.model);

                        default:
                            return true;
                        }
                    }
                },
                copyComplete: {
                    configurable: true,
                    get: function() {
                        var model = this.model;

                        switch (this.model.type) {
                        case 'image':
                        case 'video':
                        case 'videoBallot':
                            return ['title'].map(function(prop) {
                                return !!model[prop];
                            }).indexOf(false) < 0;
                        default:
                            return undefined;
                        }
                    }
                },
                cardComplete: {
                    get: function() {
                        if(this.error) {
                            return false;
                        }
                        var model = this.model;
                        switch (model.type) {
                        case 'image':
                            return ['service', 'imageid'].map(function(prop) {
                                return !!model.data[prop];
                            }).indexOf(false) < 0;
                        case 'instagram':
                            return !!model.data.id;
                        case 'video':
                        case 'videoBallot':
                            return true;
                        default:
                            return undefined;
                        }
                    }
                },
                primaryButton: {
                    get: function() {
                        var state = c6State.current;

                        if (/^(MR:EditCard.(Copy|Ballot|Instagram))$/.test(state)) {
                            return copy({
                                text: EditorCtrl.model.status === 'active' ? 'I\'m Done!' : 'Save',
                                action: function() { self.save(); },
                                enabled: this.cardComplete && this.canSave
                            }, primaryButton);
                        }

                        return copy({
                            text: 'Next Step',
                            action: function() { c6State.goTo('MR:EditCard.Copy'); },
                            enabled: this.cardComplete && !EditorCtrl.errorForCard(this.model)
                        }, primaryButton);
                    }
                },
                negativeButton: {
                    get: function() {
                        var prevTab = self.tabs[self.tabs.indexOf(self.currentTab) - 1];

                        return copy({
                            text: (this.isNew && !!prevTab) ?
                                'Prev Step' : 'Cancel',
                            action: this.isNew ?
                                function() {
                                    c6State.goTo((prevTab || { sref: 'MR:Editor' }).sref);
                                } :
                                function() {
                                    c6State.goTo('MR:Editor');
                                },
                            enabled: true
                        }, negativeButton);
                    }
                }
            });

            this.error = null;

            this.initWithModel = function(model) {
                var minireelData = EditorCtrl.model.data,
                    deck = minireelData.deck;

                var copyTab = {
                        name: 'Editorial Content',
                        sref: 'MR:EditCard.Copy',
                        icon: 'text',
                        required: true
                    },
                    videoTab = {
                        name: 'Video Content',
                        sref: 'MR:EditCard.Video',
                        icon: 'play',
                        required: true
                    },
                    ballotTab = {
                        name: 'Questionnaire',
                        sref: 'MR:EditCard.Ballot',
                        icon: 'ballot',
                        required: false,
                        customRequiredText: [
                            'Indicates required field (to include a questionnaire)'
                        ].join('')
                    },
                    imageTab = {
                        name: 'Image Content',
                        sref: 'MR:EditCard.Image',
                        required: true
                    },
                    instagramTab = {
                        name: 'Instagram Content',
                        sref: 'MR:EditCard.Instagram',
                        required: true
                    };

                this.model = model;
                this.tabs = (function() {
                    switch (model.type) {
                    case 'image':
                        return [imageTab, copyTab];
                    case 'instagram':
                        return [instagramTab];
                    case 'video':
                    case 'videoBallot':
                    case 'text':
                        return [videoTab, copyTab, ballotTab];
                    default:
                        return [];
                    }
                }());
                this.isNew = !deck.filter(function(card) {
                    return card.id === model.id;
                })[0];

                if (this.tabs.length) {
                    c6State.goTo(this.tabs[0].sref);
                }
            };

            this.setIdealType = function() {
                var choices;

                if (!(/^video/).test(this.model.type)) { return; }

                if (!this.model.data.videoid) {
                    return MiniReelService.setCardType(this.model, 'text');
                }

                choices = (this.model.data.ballot || {}).choices || [];

                if ((!choices[0] || !choices[1]) && this.model.type !== 'video') {
                    MiniReelService.setCardType(this.model, 'video');
                }
            };

            this.save = function() {
                var deck = EditorCtrl.model.data.deck,
                    index = deck.map(function(card) {
                        return card.id;
                    }).indexOf(this.model.id);

                this.setIdealType();

                if (index > -1) {
                    copy(this.model, deck[index]);
                } else {
                    deck.splice(this.insertionIndex, 0, this.model);
                }
                c6State.goTo('MR:Editor', null, {});
            };

            $scope.$watch(
                function() { return self.model.data.service; },
                function(service, prevService) {
                    var data = self.model.data;

                    if (prevService === 'dailymotion') {
                        data.start = null;
                        data.end = null;
                    }

                    if (service === 'dailymotion') {
                        data.start = undefined;
                        data.end = undefined;
                    }
                }
            );

            $scope.$watch(
                function() { return self.model.data.videoid; },
                function() {
                    self.error = null;
                }
            );

            $scope.$on('<video-preview>:error', function(event, error) {
                self.error = error;
            });

            $scope.$on('VideoSearchCtrl:addVideo', function($event, card) {
                function takeVideo(card) {
                    self.model.data.service = card.data.service;
                    self.model.data.videoid = card.data.videoid;
                }

                $event.stopPropagation();

                if (self.model.data.videoid) {
                    return ConfirmDialogService.display({
                        prompt: 'This will overwrite the existing video.' +
                            ' Are you sure you want to add this video to the card?',
                        affirm: 'Yes, I\'m Sure',
                        cancel: 'Cancel',
                        onAffirm: function() {
                            takeVideo(card);

                            ConfirmDialogService.close();
                        },
                        onCancel: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                return takeVideo(card);
            });
        }])

        .controller('EditCardVideoController', ['$scope',
        function                               ( $scope ) {
            var EditorCtrl = $scope.EditorCtrl,
                EditCardCtrl = $scope.EditCardCtrl;

            this.search = function() {
                if (!EditCardCtrl.videoUrl || this.model.data.videoid) {
                    return;
                }

                return EditorCtrl.queueSearch(EditCardCtrl.videoUrl);
            };
        }])

        .controller('EditCardImageController', ['$scope', 'c6State', 'ImageService',
        function                               ( $scope ,  c6State ,  ImageService ) {

            var EditCardCtrl = $scope.EditCardCtrl;
            var self = this;
            var _private = {};
            this.imageUrl = null;
            this.data = { };

            // Update the embed info on the controller
            _private.updateEmbedInfo = function(service, imageid) {
                self.data = { };
                ImageService.getEmbedInfo(service, imageid)
                    .then(function(embedInfo) {
                        Object.keys(embedInfo).forEach(function(key) {
                            self.data[key] = embedInfo[key];
                        });
                    })
                    .catch(function(reason) {
                        EditCardCtrl.error = reason;
                    });
            };

            $scope.$watch(function() {
                return self.imageUrl;
            }, function(imageUrl) {
                if(imageUrl !== null) {
                    EditCardCtrl.error = null;
                    var data = ImageService.dataFromUrl(imageUrl);
                    self.model.data.service = data.service;
                    self.model.data.imageid = data.imageid;
                    _private.updateEmbedInfo(data.service, data.imageid);
                } else {
                    self.imageUrl = ImageService.urlFromData(
                        self.model.data.service,
                        self.model.data.imageid
                    );
                }
            });

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .controller('EditCardInstagramController', ['$scope', 'InstagramService', '$sce',
        function                                   ( $scope ,  InstagramService ,  $sce ) {
            var EditCardCtrl = $scope.EditCardCtrl;
            var self = this;
            var _private = { };
            this.inputUrl = null;
            this.data = { };

            _private.updateEmbedInfo = function(id) {
                self.data = { };
                InstagramService.getEmbedInfo(id)
                    .then(function(embedInfo) {
                        Object.keys(embedInfo).forEach(function(key) {
                            self.data[key] = embedInfo[key];
                        });
                    })
                    .catch(function(reason) {
                        EditCardCtrl.error = reason;
                    });
            };

            $scope.trustSrc = function(src) {
                return $sce.trustAsResourceUrl(src);
            };

            $scope.$watch(function() {
                return self.inputUrl;
            }, function(inputUrl) {
                if(inputUrl !== null) {
                    EditCardCtrl.error = null;
                    var data = InstagramService.dataFromUrl(inputUrl);
                    self.model.data.id = data.id;
                    _private.updateEmbedInfo(data.id);
                } else {
                    self.inputUrl = InstagramService.urlFromData(
                        self.model.data.id
                    );
                }
            });

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Editor.NewCard', ['MiniReelService', 'c6State', '$q',
            function                                   ( MiniReelService ,  c6State ,  $q ) {
                var PortalState = c6State.get('Portal');

                this.controller = 'NewCardController';
                this.controllerAs = 'NewCardCtrl';
                this.templateUrl = 'views/minireel/editor/new_card.html';

                this.queryParams = {
                    insertionIndex: '&insertAt'
                };

                this.model = function() {
                    return MiniReelService.createCard('videoBallot');
                };

                this.afterModel = function(card, params) {
                    var user = PortalState.cModel;

                    if (!!user.permissions.campaigns) { return $q.when(true); }

                    c6State.goTo('MR:EditCard', [card], params, true);

                    return $q.reject(new Error('User does not have access to campaigns.'));
                };
            }]);
        }])

        .controller('NewCardController', ['c6State','MiniReelService','$scope',
        function                         ( c6State , MiniReelService , $scope ) {
            var EditorCtrl = $scope.EditorCtrl,
                minireel = EditorCtrl.model;

            this.type = 'videoBallot';

            this.edit = function() {
                var card = MiniReelService.setCardType(this.model, this.type),
                    insertionIndex = this.insertionIndex;

                return c6State.goTo('MR:EditCard', [card], { insertAt: this.insertionIndex }, true)
                    .catch(function() {
                        return minireel.data.deck.splice(insertionIndex, 0, card);
                    })
                    .then(function() {
                        return card;
                    });
            };
        }])

        .directive('c6Embed', ['$timeout',
        function              ( $timeout ) {
            var props = '[experience, active, profile, card, standalone]';

            function link(scope, $element) {
                var settings = null;

                scope.$watchCollection(props, function(vals, oldVals) {
                    var experience = vals[0], active = vals[1], profile = vals[2], card = vals[3];
                    var standalone = vals[4];
                    var oldExperience = oldVals[0], oldProfile = oldVals[2];
                    var needsEmbedding = !!(
                        (experience !== oldExperience) ||
                        (profile !== oldProfile) ||
                        (experience && !settings)
                    );

                    if (needsEmbedding) {
                        settings = experience ? {
                            experience: experience,
                            profile: profile,
                            standalone: standalone,
                            allowFullscreen: (profile || {}).device !== 'phone',
                            embed: $element[0],
                            splashDelegate: {},
                            config: {
                                container: 'studio',
                                exp: experience.id,
                                responsive: true,
                                title: experience.data.title
                            }
                        } : null;

                        $element.empty();
                        $element.attr('style', '');
                    }

                    if (settings) {
                        if (needsEmbedding || active) {
                            c6embed.loadExperience(settings, !active);
                        } else {
                            settings.state.set('active', false);
                        }
                    }

                    if (needsEmbedding && settings) {
                        settings.state.observe('active', function(value, previousValue) {
                            if (value === previousValue) { return; }

                            scope.$apply(function() {
                                scope.active = value;
                            });
                        });
                    }

                    if (settings && card && active) {
                        settings.getPlayer().then(function(player) {
                            return player.getReadySession();
                        }).then(function(session) {
                            $timeout(function() { session.ping('showCard', card.id); });
                        });
                    }
                });
            }

            return {
                restrict: 'E',
                scope: { experience: '=', card: '=', profile: '=', active: '=', standalone: '=' },
                link: link
            };
        }])

        .controller('PreviewController',['$scope','MiniReelService','postMessage','c6BrowserInfo',
        function                        ( $scope , MiniReelService , postMessage , c6BrowserInfo ) {
            var PreviewCtrl = this;

            function updateExperience($event, experience, card) {
                MiniReelService.convertForPlayer(experience).then(function(experience) {
                    experience.data.adConfig = {
                        video: {
                            firstPlacement: -1,
                            frequency: 0
                        },
                        display: {}
                    };

                    if (!equals(experience, PreviewCtrl.experience)) {
                        PreviewCtrl.experience = experience;
                    }

                    PreviewCtrl.card = card || null;

                    if (card) {
                        PreviewCtrl.active = true;
                    }
                });
            }

            this.active = false;
            this.device = 'desktop';
            this.experience = null;
            this.card = null;
            this.profile = copy(c6BrowserInfo.profile);

            $scope.$on('mrPreview:splashClick', function() {
                PreviewCtrl.active = true;
            });

            $scope.$on('mrPreview:updateExperience', updateExperience);
            $scope.$on('mrPreview:updateMode', updateExperience);

            $scope.$on('mrPreview:reset', function() {
                PreviewCtrl.card = null;
                PreviewCtrl.experience = null;
                PreviewCtrl.active = false;
            });

            $scope.$watch(function() {
                return PreviewCtrl.device;
            }, function(device) {
                var profile = PreviewCtrl.profile;

                if (device === profile.device) { return; }

                PreviewCtrl.profile = extend(copy(profile), {
                    device: device,
                    flash: device !== 'phone'
                });
            });

            $scope.$watch(function() {
                return PreviewCtrl.active;
            }, function(active) {
                if (active) {
                    $scope.$broadcast('mrPreview:splashHide');
                } else {
                    $scope.$broadcast('mrPreview:splashShow');

                    // If a card was being previewed (and the user did not wish to preview the
                    // splash page) close the entire preview modal
                    if (PreviewCtrl.card) {
                        $scope.$emit('mrPreview:closePreview');
                    }
                }
            });
        }])

        .directive('splashPage', ['c6UrlMaker','requireCJS',
        function                 ( c6UrlMaker , requireCJS ) {
            return {
                templateUrl: 'views/minireel/directives/splash_page.html',
                scope: {
                    minireel: '=splashPage',
                    splashSrc: '@'
                },
                link: function(scope, $element) {
                    var delegate = null;

                    function callDelegate(method) {
                        ((delegate || {})[method] || noop)();
                    }

                    Object.defineProperties(scope, {
                        title: {
                            get: function() {
                                return scope.minireel.data.title;
                            }
                        },
                        splash: {
                            get: function() {
                                return scope.splashSrc || scope.minireel.data.collateral.splash;
                            }
                        }
                    });
                    scope.splashLoad = function() {
                        requireCJS('/collateral/splash/splash.js')
                            .then(function bind(splashJS) {
                                var c6 = {
                                        loadExperience: function() {
                                            scope.$apply(function() {
                                                scope.$emit('mrPreview:splashClick');
                                            });
                                        }
                                    },
                                    settings = {},
                                    splash = $element.find('ng-include')[0];

                                delegate = splashJS(c6, settings, splash) || null;
                            });
                    };

                    scope.$on('mrPreview:splashHide', function() {
                        callDelegate('didHide');
                    });
                    scope.$on('mrPreview:splashShow', function() {
                        callDelegate('didShow');
                    });
                }
            };
        }])

        .directive('videoTrimmer', ['c6UrlMaker','$window','c6Debounce','$q',
        function                   ( c6UrlMaker , $window , c6Debounce , $q ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireel/directives/video_trimmer.html',
                scope: {
                    duration: '@',
                    currentTime: '=',
                    start: '=',
                    end: '=',
                    onStartScan: '&',
                    onEndScan: '&'
                },
                link: function(scope, $element) {
                    var startMarker = $element.find('#start-marker').data('cDrag'),
                        endMarker = $element.find('#end-marker').data('cDrag'),
                        seekBar = $element.find('#seek-bar').data('cDragZone'),
                        currentScanDeferred = null,
                        notifyProgress = c6Debounce(function(args) {
                            var marker = args[0],
                                scopeProp = args[1],
                                value = Math.max(
                                    0,
                                    Math.min(
                                        duration(),
                                        positionToValue(
                                            marker.display,
                                            scopeProp
                                        )
                                    )
                                );

                            currentScanDeferred.notify(value);
                            scope[scopeProp + 'Stamp'] = secondsToTimestamp(value);
                        }, 250);

                    function start() {
                        return Math.min((scope.start || 0), end());
                    }

                    function end() {
                        return isNumber(scope.end) ?
                            Math.min(scope.end, scope.duration) : scope.duration;
                    }

                    function duration() {
                        return parseFloat(scope.duration);
                    }

                    function eachMarker(cb) {
                        [startMarker, endMarker].forEach(cb);
                    }

                    function secondsToTimestamp(seconds) {
                        var minutes = Math.floor(seconds / 60);
                        seconds = Math.floor(seconds - (minutes * 60));

                        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
                    }

                    function positionToValue(rect, prop) {
                        var pxMoved = rect.left - seekBar.display.left,
                            total = seekBar.display.width;

                        if (prop === 'end') {
                            pxMoved += rect.width;
                        }

                        return ((pxMoved * duration()) / total);
                    }

                    function scopePropForMarker(marker) {
                        return marker.id.replace(/-marker$/, '');
                    }

                    function constrain(marker, desired) {
                        switch (marker.id) {
                        case 'start-marker':
                            return Math.max(
                                Math.min(
                                    desired.left,
                                    endMarker.display.left
                                ),
                                seekBar.display.left
                            );

                        case 'end-marker':
                            return Math.max(
                                Math.min(
                                    desired.left,
                                    seekBar.display.right - desired.width
                                ),
                                startMarker.display.left
                            );
                        }
                    }

                    function begin(marker) {
                        var scopeProp = scopePropForMarker(marker),
                            methodBit = scopeProp.substring(0, 1).toUpperCase() +
                                scopeProp.substring(1);

                        eachMarker(function(marker) {
                            marker.refresh(true);
                        });

                        currentScanDeferred = $q.defer();

                        scope['on' + methodBit + 'Scan']({
                            promise: currentScanDeferred.promise
                        });
                    }

                    function beforeMove(marker, event) {
                        var $marker = marker.$element,
                            desired = event.desired,
                            position = constrain(marker, desired),
                            scopeProp = scopePropForMarker(marker);

                        event.preventDefault();

                        $marker.css({
                            left: position + 'px'
                        });

                        notifyProgress(
                            marker,
                            scopeProp
                        );
                    }

                    function absStartMarkerPos() {
                        return ((start() * seekBar.display.width) /
                            duration()) + 'px';
                    }

                    function absEndMarkerPos() {
                        return ((end() * seekBar.display.width) /
                            duration()) - endMarker.display.width + 'px';
                    }

                    function dropStart(marker) {
                        var scopeProp = scopePropForMarker(marker),
                            absCompFns = {
                                start: absStartMarkerPos,
                                end: absEndMarkerPos
                            };

                        scope[scopeProp] = positionToValue(marker.display, scopeProp);
                        currentScanDeferred.resolve(scope[scopeProp]);

                        marker.$element.css({
                            top: '',
                            left: absCompFns[scopeProp]()
                        });
                    }

                    Object.defineProperties(scope, {
                        enabled: {
                            get: function() {
                                return isDefined(this.start) &&
                                    isDefined(this.end) &&
                                    !!duration();
                            }
                        }
                    });

                    scope.position = {};
                    Object.defineProperties(scope.position, {
                        startMarker: {
                            get: absStartMarkerPos
                        },
                        endMarker: {
                            get: absEndMarkerPos
                        },
                        playhead: {
                            get: function() {
                                return ((scope.currentTime * 100) / duration()) + '%';
                            }
                        }
                    });

                    eachMarker(function(marker) {
                        marker.on('begin', begin)
                            .on('beforeMove', beforeMove)
                            .on('dropStart', dropStart);
                    });

                    scope.$watch(start, function(start) {
                        scope.startStamp = secondsToTimestamp(start);
                    });
                    scope.$watch(end, function(end) {
                        scope.endStamp = secondsToTimestamp(end);
                    });
                }
            };
        }])

        .directive('jwPlayer', [function() {
            return {
                restrict: 'E',
                scope: {
                    videoid: '@'
                },
                link: function(scope, $element) {
                    function loadPreview(videoid) {
                        if(!videoid) { return; }
                        $element.empty();
                        var id = 'botr_' + videoid.replace('-', '_') + '_div';
                        var style = document.createElement('style');
                        var script = document.createElement('script');
                        var div = document.createElement('div');
                        var iframe = document.createElement('iframe');

                        /* The JWPlayer embed is responsive only to certain aspect ratios.
                            This style hack is needed to ensure it displays properly. */
                        style.innerHTML = 'div#' + id +
                            '{ width: 100% !important; height: 100% !important; }';
                        script.setAttribute('type', 'application/javascript');
                        script.setAttribute('src', '//content.jwplatform.com/players/' + videoid +
                            '.js');
                        div.setAttribute('id', id);
                        div.appendChild(script);
                        iframe.setAttribute('src', 'blank.html');
                        iframe.setAttribute('width', '100%');
                        iframe.setAttribute('height', '100%');
                        iframe.setAttribute('frameBorder', 0);
                        iframe.onload = function() {
                            iframe.contentDocument.head.appendChild(style);
                            iframe.contentDocument.body.appendChild(div);
                        };

                        $element.addClass('jwplayerPreview');
                        $element.append(iframe);
                    }

                    scope.$watch('videoid', loadPreview);
                }
            };
        }])

        .directive('vidyardPlayer', [function() {
            var noop = function() {};
            var deregistrationFn = noop;
            return {
                restrict: 'E',
                scope: {
                    videoid: '@'
                },
                link: function(scope, $element) {
                    function loadPreview(videoid) {
                        if(!videoid) { return; }
                        deregistrationFn();
                        $element.empty();
                        var script = document.createElement('script');

                        script.setAttribute('type', 'text/javascript');
                        script.setAttribute('id', 'vidyard_embed_code_' + videoid);
                        script.setAttribute('src', '//play.vidyard.com/' + videoid +
                            '.js?v=3.1.1&type=inline');

                        $element.addClass('vidyardPreview');
                        $element.css('display', 'none');

                        // Watch out for the vidyard iframe
                        deregistrationFn = scope.$watch(function() {
                            var results = $element.find('iframe#vidyard_iframe_' + videoid);
                            return (results && results.length === 1) ? results[0] : null;
                        }, function(iframe) {
                            if(iframe) {
                                iframe.width = '100%';
                                iframe.height = '100%';
                                var span = iframe.parentElement;
                                span.style.width = '100%';
                                span.style.height = '100%';
                                $element.css('display', 'inline');
                                deregistrationFn();
                                deregistrationFn = noop;
                            }
                        });

                        $element.append(script);
                    }

                    scope.$watch('videoid', loadPreview);
                }
            };
        }])

        .directive('videoPreview', ['c6UrlMaker','$timeout','VideoService',
        function                   ( c6UrlMaker , $timeout , VideoService ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireel/directives/video_preview.html',
                scope: {
                    service: '@',
                    videoid: '@',
                    start: '=',
                    end: '=',
                    disableTrimmer: '&'
                },
                link: function(scope, $element) {
                    function controlVideo($video) {
                        var video = $video.data('video'),
                            startScanTime = null;

                        function start() {
                            return scope.start || 0;
                        }
                        function end() {
                            return scope.end || Infinity;
                        }

                        function $emitError() {
                            scope.$emit('<video-preview>:error', video.error);
                        }

                        function handleEvents() {
                            video.on('timeupdate', function timeupdate() {
                                    var startTime = start(),
                                        endTime = end();

                                    if (isNumber(startScanTime)) {
                                        return;
                                    }

                                    if (video.currentTime < (startTime - 1)) {
                                        video.currentTime = startTime;
                                    }

                                    if (video.currentTime >= endTime) {
                                        video.pause();
                                    }
                                })
                                .on('playing', function playing() {
                                    if (video.currentTime >= end()) {
                                        video.currentTime = start();
                                    }
                                });

                            scope.video = video;
                        }

                        function scan(time) {
                            if (video.readyState < 3) {
                                video.play();
                            }

                            if (video.readyState > 0) {
                                video.currentTime = time;
                            }
                        }

                        function finishScan() {
                            video.currentTime = startScanTime;

                            startScanTime = null;
                        }

                        scope.video = undefined;

                        if (!video) { return; }

                        if (video.error) {
                            $emitError();
                        }

                        scope.onMarkerSeek = function(promise) {
                            startScanTime = video.currentTime;

                            promise.then(finishScan, null, scan);
                        };

                        Object.defineProperties(scope, {
                            currentTime: {
                                configurable: true,
                                get: function() {
                                    if (isNumber(startScanTime)) {
                                        return startScanTime;
                                    }

                                    return video.currentTime;
                                }
                            }
                        });

                        video.once('ready', handleEvents)
                            .on('error', $emitError);
                    }

                    scope.disableTrimmer = function() {
                        return (scope.service === 'vine' || scope.service === 'vzaar' ||
                            scope.service === 'wistia' || scope.service === 'jwplayer' ||
                            scope.service === 'vidyard');
                    };

                    Object.defineProperties(scope, {
                        embedCode: {
                            get: function() {
                                return VideoService.embedCodeFromData(scope.service, scope.videoid);
                            }
                        }
                    });

                    scope.$watch('videoid', function(id) {
                        if (!id) { return; }

                        $timeout(function() {
                            controlVideo($element.find('#videoEmbedPlayer *'));
                        });
                    });
                }
            };
        }])

        .directive('gettyPreview', [ '$sce',
        function($sce) {
            function link(scope) {
                scope.trustSrc = function(src) {
                    return $sce.trustAsResourceUrl(src);
                };
            }

            return {
                restrict: 'E',
                templateUrl: 'views/minireel/directives/getty_preview.html',
                scope: {
                    frameSrc: '@',
                    imageid: '@',
                    frameWidth: '@',
                    frameHeight: '@'
                },
                link: link
            };
        }]);
});
