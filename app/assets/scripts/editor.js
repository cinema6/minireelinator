(function() {
    'use strict';

    var isNumber = angular.isNumber,
        equals = angular.equals,
        copy = angular.copy,
        forEach = angular.forEach,
        isDefined = angular.isDefined,
        noop = angular.noop;

    angular.module('c6.mrmaker')
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
                                   'CollateralService',
        function                  ( MiniReelService , $q , c6AsyncQueue , VoteService ,
                                    CollateralService ) {
            var _private = {},
                queue = c6AsyncQueue();

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

            function syncToMinireel() {
                return _private.syncToMinireel(
                    _private.minireel,
                    _private.editorMinireel,
                    _private.proxy
                );
            }

            _private.minireel = null;
            _private.editorMinireel = null;
            _private.proxy = null;

            _private.syncToMinireel = function(minireel, editorMinireel, proxy) {
                copy(proxy.data, editorMinireel.data);
                MiniReelService.convertForPlayer(editorMinireel, minireel);

                return minireel;
            };

            _private.syncToProxy = function(proxy, editorMinireel, minireel) {
                MiniReelService.convertForEditor(minireel, editorMinireel);

                forEach(editorMinireel, function(value, key) {
                    if (proxy.hasOwnProperty(key)) { return; }

                    return readOnly(editorMinireel, key, proxy);
                });
                forEach(proxy, function(value, key) {
                    if (editorMinireel.hasOwnProperty(key)) { return; }

                    delete proxy[key];
                });

                return proxy;
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
                }
            });

            this.open = function(minireel) {
                var editorMinireel = MiniReelService.convertForEditor(minireel),
                    proxy = {},
                    data = copy(editorMinireel.data);

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

                _private.minireel = minireel;
                _private.editorMinireel = editorMinireel;
                _private.proxy = proxy;

                return proxy;
            };

            this.close = function() {
                ['minireel', 'editorMinireel', 'proxy']
                    .forEach(function(prop) {
                        _private[prop] = null;
                    });
            };

            this.sync = queue.wrap(function() {
                var minireel = _private.minireel,
                    proxy = _private.proxy;

                function syncWithCollateral() {
                    if (proxy.data.splash.source === 'specified' ||
                        proxy.status === 'active') {
                        return $q.when(proxy);
                    }

                    return CollateralService.generateCollage({
                        minireel: proxy,
                        name: 'splash',
                        cache: proxy.status === 'active'
                    }).then(function store(data) {
                        proxy.data.collateral.splash = data.toString();
                    })
                    .catch(function rescue() {
                        return proxy;
                    });
                }

                function syncWithElection(miniReel) {
                    if (miniReel.status !== 'active'){
                        return $q.when(miniReel);
                    }

                    if (miniReel.data.election) {
                        return VoteService
                            .update(miniReel)
                            .then(function(){
                                return miniReel;
                            });
                    }

                    return VoteService
                        .initialize(miniReel)
                        .then(function(){
                            return miniReel;
                        });
                }

                if (!minireel) {
                    return rejectNothingOpen();
                }

                return syncWithCollateral()
                        .then(syncToMinireel)
                       .then(syncWithElection)
                       .then(function save(minireel){
                            return minireel.save();
                        })
                       .then(syncToProxy)
                       .then(function updateElection(proxy){
                            // See comment in publish
                            proxy.data.election = minireel.data.election;
                            return proxy;
                        });
            }, this);

            this.publish = queue.wrap(function() {
                var minireel = _private.minireel,
                    editorMinireel = _private.editorMinireel;

                if (!minireel) {
                    return rejectNothingOpen();
                }

                return MiniReelService.publish(syncToMinireel())
                    .then(syncToProxy)
                    .then(function updateElection(proxy) {
                        // Because the proxy is the source of truth for the data object, we need to
                        // make sure it gets updated with the election.
                        proxy.data.election = editorMinireel.data.election;

                        return proxy;
                    });
            }, this);

            this.unpublish = queue.wrap(function() {
                var minireel = _private.minireel;

                if (!minireel) {
                    return rejectNothingOpen();
                }

                return MiniReelService.unpublish(syncToMinireel())
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

        .controller('EditorController', ['c6State','$scope','EditorService','cinema6',
                                         'ConfirmDialogService','c6Debounce','$q','$log',
                                         'MiniReelService','cModel',
        function                        ( c6State , $scope , EditorService , cinema6 ,
                                          ConfirmDialogService , c6Debounce , $q , $log ,
                                          MiniReelService , cModel ) {
            var self = this,
                AppCtrl = $scope.AppCtrl,
                cardLimits = {
                    copy: Infinity
                },
                saveAfterTenSeconds = c6Debounce(function() {
                    if (!shouldAutoSave()) { return; }

                    $log.info('Autosaving MiniReel');
                    self.save();
                }, 10000);

            function shouldAutoSave() {
                return self.model.status !== 'active';
            }

            $log = $log.context('EditorController');

//            this.pageObject = { page : 'editor', title : 'Editor' };
            this.preview = false;
            this.editTitle = false;
            this.dismissDirtyWarning = false;
            this.minireelState = EditorService.state;
            this.cacheBuster = 0;

            Object.defineProperties(this, {
                prettyMode: {
                    get: function() {
                        var categories = AppCtrl.config && AppCtrl.config.data.modes,
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
                        var config = AppCtrl.config,
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
                        var splash = this.model.data.collateral.splash;

                        return splash && (splash + '?cb=' + this.cacheBuster);
                    }
                }
            });

            this.bustCache = function() {
                this.cacheBuster++;
            };

            this.errorForCard = function(card) {
                var limit = this.cardLimits.copy,
                    text = card.note || '';

                return (text.length > limit) ?
                    'Character limit exceeded (+' + (text.length - limit) + ').' :
                    null;
            };

            this.canDeleteCard = function(card) {
                switch (card.type) {
                case 'ad':
                    return (function() {
                        var deck = this.model.data.deck,
                            totalAdCards = deck.filter(function(card) {
                                return card.type === 'ad';
                            }).length,
                            minAdCount = AppCtrl.user ?
                                (AppCtrl.user.org.minAdCount || 0) :
                                Infinity;

                        return totalAdCards > minAdCount;
                    }.call(this));
                case 'recap':
                    return false;
                default:
                    return true;
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

            this.editCard = function(card/*,evtSrc*/) {
//                if (evtSrc){
//                    AppCtrl.sendPageEvent('Editor','Click','Edit Card',self.pageObject);
//                }
                c6State.goTo('editor.editCard', { cardId: card.id });
            };

            this.newCard = function(insertionIndex/*,evtSrc*/) {
//                if (evtSrc){
//                    AppCtrl.sendPageEvent('Editor','Click','New Card',self.pageObject);
//                }
                c6State.goTo('editor.newCard', {
                    insertionIndex: insertionIndex
                });
            };

            this.deleteCard = function(card/*,evtSrc*/) {
//                if (evtSrc){
//                    AppCtrl.sendPageEvent('Editor','Click','Delete Card',self.pageObject);
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

            this.previewMode = function(card/*,evtSrc*/) {
//                if (evtSrc){
//                    AppCtrl.sendPageEvent('Editor','Click','Preview Card',self.pageObject);
//                }
                self.preview = true;
                $scope.$broadcast('mrPreview:updateExperience', self.model, card);
                cinema6.getSession()
                    .then(function pingStateChange(session) {
                        session.ping('stateChange', { name: 'editor.preview' });
                    });
            };

            this.closePreview = function() {
                this.preview = false;
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
                                c6State.goTo('manager');
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
                            c6State.goTo('manager');
                            ConfirmDialogService.close();
                        },
                        onAffirm: function() {
                            c6State.goTo('manager');
                            ConfirmDialogService.close();
                        }
                    });
                } else {
                    c6State.goTo('manager');
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

                if (!shouldAutoSave()) {
                    $log.warn('MiniReel is published. Will not autosave.');
                    return;
                }

                saveAfterTenSeconds();
            });

            $scope.$on('$destroy', function() {
                function save() {
                    if (shouldAutoSave()) {
                        return self.save();
                    }

                    return $q.when(self.model);
                }

                AppCtrl.branding = null;

                save()
                    .then(function close() {
                        EditorService.close();
                    });
            });

            AppCtrl.branding = cModel.data.branding;

        //    AppCtrl.sendPageView(this.pageObject);
        }])

        .controller('EditorSplashController', ['$scope','c6State','$log','cModel',
        function                              ( $scope , c6State , $log , cModel ) {
            var self = this;

            function tabBySref(sref) {
                return self.tabs.reduce(function(result, next) {
                    return next.sref === sref ? next : result;
                }, null);
            }

            function incrementTabVisits(state) {
                tabBySref(state.name).visits++;
            }

            $log = ($log.context || function() { return $log; })('EditorSplashCtrl');

            this.tabs = [
                {
                    name: 'Source Type',
                    sref: 'editor.splash.source',
                    visits: 0,
                    requiredVisits: 0
                },
                {
                    name: 'Image Settings',
                    sref: 'editor.splash.image',
                    visits: 0,
                    requiredVisits: 0
                }
            ];
            this.splashSrc = cModel.data.collateral.splash;
            Object.defineProperties(this, {
                currentTab: {
                    configurable: true,
                    get: function() {
                        return this.tabs.reduce(function(result, next) {
                            return next.sref === c6State.current.name ?
                                next : result;
                        }, null);
                    }
                }
            });

            this.isAsFarAs = function(tab) {
                var tabs = this.tabs;

                return tabs.indexOf(tab) <= tabs.indexOf(this.currentTab);
            };

            this.tabIsValid = function(tab) {
                if (!tab) { return tab; }

                switch (tab.sref) {
                case 'editor.splash.image':
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

            c6State.on('stateChangeSuccess', incrementTabVisits);

            $scope.$on('$destroy', function() {
                c6State.removeListener('stateChangeSuccess', incrementTabVisits);
            });

            $scope.$watch(
                function() { return self.model.data.splash.source; },
                function(source, prevSource) {
                    var imageTab;

                    if (source === prevSource) { return; }
                    imageTab = tabBySref('editor.splash.image');

                    imageTab.requiredVisits = imageTab.visits + 1;
                    self.splashSrc = null;
                    self.model.data.collateral.splash = null;
                }
            );
        }])

        .controller('SplashImageController', ['$scope','CollateralService','$log','$q','c6State',
                                              'FileService',
        function                             ( $scope , CollateralService , $log , $q , c6State ,
                                               FileService ) {
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
                '6-4': null,
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

            this.uploadSplash = function() {
                var upload;

                $log.info('Upload started: ', this.splash);
                this.currentUpload = upload = CollateralService.set(
                    'splash',
                    this.splash,
                    EditorSplashCtrl.model
                );

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
                    allRatios: !permanent,
                    cache: false
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

                function handleImageAsset() {
                    switch (splash.source) {
                    case 'specified':
                        return !!self.splash ?
                            self.uploadSplash() :
                            $q.when(minireel);
                    case 'generated':
                        return self.generateSplash(true)
                            .then(function save(data) {
                                minireel.data.collateral.splash = data.toString();

                                return minireel;
                            })
                            .catch(function fix() {
                                return minireel;
                            });
                    }
                }

                return handleImageAsset()
                    .then(function copyData(minireel) {
                        $log.info('Saving data: ', minireel);
                        copy(minireel.data.collateral, data.collateral);
                        copy(minireel.data.splash, data.splash);
                        $log.info('Save complete: ', EditorCtrl.model);

                        c6State.goTo('editor');
                        EditorCtrl.bustCache();

                        return EditorCtrl.model;
                    });
            };

            $scope.$on('$destroy', function() {
                if (!self.splash) { return; }

                FileService.open(self.splash).close();
            });

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

        .controller('EditCardController', ['$scope','c6Computed','c6State','VideoService',
                                           'MiniReelService','cinema6','c6StateParams',
        function                          ( $scope , c6Computed , c6State , VideoService ,
                                            MiniReelService , cinema6 , c6StateParams ) {
            var self = this,
                c = c6Computed($scope),
                EditorCtrl = $scope.EditorCtrl,
                primaryButton = {},
                negativeButton = {},
                removeInitWatcher = $scope.$watch(
                    function() { return self.tabs; },
                    function(tabs) {
                        c6State.goTo(tabs[0].sref);
                        removeInitWatcher();
                    }
                );

            Object.defineProperties(this, {
                currentTab: {
                    configurable: true,
                    get: function() {
                        return this.tabs.filter(function(tab) {
                            return tab.sref === c6State.current.name;
                        })[0] || null;
                    }
                },
                canSave: {
                    configurable: true,
                    get: function() {
                        switch (this.model.type) {
                        case 'video':
                        case 'videoBallot':
                            return [this.copyComplete, this.videoComplete].indexOf(false) < 0 &&
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
                videoComplete: {
                    get: function() {
                        var model = this.model;

                        switch (this.model.type) {
                        case 'video':
                        case 'videoBallot':
                            return ['service', 'videoid'].map(function(prop) {
                                return !!model.data[prop];
                            }).indexOf(false) < 0;
                        default:
                            return undefined;
                        }
                    }
                },
                primaryButton: {
                    get: function() {
                        var state = c6State.current.name;

                        if (this.canSave || /^(editor.editCard.(video|ballot))$/.test(state)) {
                            return copy({
                                text: EditorCtrl.model.status === 'active' ? 'I\'m Done!' : 'Save',
                                action: function() { self.save(); },
                                enabled: this.canSave
                            }, primaryButton);
                        }

                        return copy({
                            text: 'Next Step',
                            action: function() { c6State.goTo('editor.editCard.video'); },
                            enabled: this.copyComplete && !EditorCtrl.errorForCard(this.model)
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
                                    c6State.goTo((prevTab || { sref: 'editor' }).sref);
                                } :
                                function() {
                                    c6State.goTo('editor');
                                },
                            enabled: true
                        }, negativeButton);
                    }
                }
            });

            VideoService.createVideoUrl(c, this, 'EditCardCtrl');

            this.setIdealType = function() {
                var choices;

                if (this.model.type !== 'videoBallot') { return; }

                choices = this.model.data.ballot.choices;

                if (!choices[0] || !choices[1]) {
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
                    deck.splice(c6StateParams.insertionIndex, 0, this.model);
                }

                c6State.goTo('editor');
            };

            $scope.$watch(
                function() { return self.model.data.service; },
                function(service, prevService) {
                    var data = self.model.data;

                    if (service === 'dailymotion') {
                        data.start = undefined;
                        data.end = undefined;
                    }

                    if (prevService === 'dailymotion') {
                        data.start = null;
                        data.end = null;
                    }
                }
            );
        }])

        .controller('EditCardDisplayAdController', ['appData','MiniReelService',
        function                                   ( appData , MiniReelService ) {
            this.choices = MiniReelService.adChoicesOf(appData);
        }])

        .controller('EditCardServerController', ['appData','MiniReelService',
        function                                 ( appData , MiniReelService ) {
            this.choices = MiniReelService.adChoicesOf(appData);
        }])

        .controller('NewCardController', ['c6State','c6StateParams','MiniReelService',
        function                         ( c6State , c6StateParams , MiniReelService ) {
            this.type = 'videoBallot';

            this.edit = function() {
                var card = MiniReelService.createCard(this.type);

                c6State.goTo('editor.editCard', { cardId: card.id, card: card });
            };
        }])

        .controller('PreviewController',['$scope','MiniReelService','postMessage','c6BrowserInfo',
                                         'c6Defines','c6UrlMaker',
        function                        ( $scope , MiniReelService , postMessage , c6BrowserInfo ,
                                          c6Defines , c6UrlMaker ) {
            var self = this,
                profile,
                card,
                experience = {
                    data: {
                        mode: 'full',
                        autoplay: false
                    }
                };

            this.active = false;
            // set a default device mode
            this.device = 'desktop';
            this.fullscreen = false;
            Object.defineProperty(this, 'playerSrc', {
                get: function() {
                    return c6UrlMaker((
                        'rumble' + (c6Defines.kLocal ?
                            ('/app/index.html?kCollateralUrl=' +
                                encodeURIComponent('../c6Content') +
                                '&kDebug=true&kDevMode=true') :
                            ('/?kCollateralUrl=' + encodeURIComponent(c6Defines.kCollateralUrl))) +
                        '&autoplay=' + encodeURIComponent(experience.data.autoplay) +
                        '&kDevice=' + encodeURIComponent(this.device) +
                        '&kMode=' + encodeURIComponent(experience.data.mode) +
                        '&kEnvUrlRoot='
                    ), 'app');
                }
            });

            // set a profile based on the current browser
            // this is needed to instantiate a player
            profile = c6BrowserInfo.profile;

            // override the device setting for previewing
            profile.device = this.device;

            $scope.$on('mrPreview:initExperience', function(event, exp, session) {
                // convert the MRinator experience to a MRplayer experience
                experience = MiniReelService.convertForPlayer(exp);

                // add the converted experience to the session for comparing later
                session.experience = copy(experience);

                // add the listener for 'handshake' request
                // we aren't using once() cuz the MR player
                // will be calling for this every time we change modes
                session.on('handshake', function(data, respond) {
                    respond({
                        success: true,
                        appData: {
                            // this will send the most updated experience
                            // whenever the MR player is (re)loaded
                            experience: experience,
                            profile: profile,
                            preload: true
                        }
                    });
                });

                // add a listener for the 'getCard' request.
                // when a user is previewing a specific card
                // we remember it, and if they change the mode
                // and the app reloads, it's going to call back
                // and see if it still needs to go to that card
                session
                    .on('mrPreview:getCard', function(data, respond) {
                        respond(card);
                    })
                    .on('fullscreenMode', function(bool) {
                        self.fullscreen = bool;
                        $scope.$digest();
                    })
                    .on('open', function() {
                        self.active = true;
                    })
                    .on('close', function() {
                        self.active = false;
                    });

                $scope.$on('mrPreview:splashClick', function() {
                    self.active = true;
                });

                // register another listener within the init handler
                // this will share the session
                $scope.$on('mrPreview:updateExperience', function(event, exp, newCard) {
                    // the EditorCtrl $broadcasts the most up-to-date experience model
                    // when the user clicks 'preview'.
                    // it may have a newCard to go to

                    // we convert the experience
                    experience = MiniReelService.convertForPlayer(exp);

                    // if it's been changed or we're previewing a specific card
                    // then we ping the player
                    // and send the updated experience
                    // the MRplayer is listening in the RumbleCtrl
                    // and will update the deck
                    if(!equals(experience, session.experience)) {
                        session.ping('mrPreview:updateExperience', experience);
                    }

                    if(newCard) {
                        card = MiniReelService.convertCard(newCard, experience);
                        session.ping('mrPreview:jumpToCard', card);
                    } else {
                        card = null;
                        session.ping('mrPreview:reset');
                    }
                });

                $scope.$on('mrPreview:updateMode', function(event, exp) {
                    // the EditorCtrl $broadcasts the experience
                    // when the mode (full, light, etc) changes.
                    // we need to convert and save the updated
                    // experience, this will trigger a refresh automatically
                    experience = MiniReelService.convertForPlayer(exp);
                });

                $scope.$on('mrPreview:reset', function() {
                    card = null;
                    self.active = false;
                    session.ping('mrPreview:reset');
                });

                $scope.$watch(function() {
                    return self.device;
                }, function(newDevice, oldDevice) {
                    if(newDevice === oldDevice) { return; }
                    // we longer have to tell the player that the mode changed
                    // the iframe src will update and trigger a refresh automatically
                    // we just prepare the profile for the refresh handshake call
                    profile.device = newDevice;
                    self.fullscreen = false;
                    self.active = false;
                });

                $scope.$watch(function() {
                    return self.active;
                }, function(active) {
                    if (active) {
                        $scope.$broadcast('mrPreview:splashHide');
                        session.ping('show');
                    } else {
                        $scope.$broadcast('mrPreview:splashShow');
                        session.ping('hide');
                    }
                });
            });
        }])

        .directive('splashPage', ['c6UrlMaker','requireCJS',
        function                 ( c6UrlMaker , requireCJS ) {
            return {
                templateUrl: c6UrlMaker('views/directives/splash_page.html'),
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
                        requireCJS(c6UrlMaker('splash/splash.js', 'collateral'))
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

        .directive('mrPreview', ['postMessage',
        function                ( postMessage ) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var iframe,
                        session;

                    scope.$watch(attrs.mrPreview, function(experience) {
                        if(experience) {
                            // store the MR player window
                            iframe = element.prop('contentWindow');

                            // create a postMessage session (as defined in c6ui.postMessage)
                            session = postMessage.createSession(iframe);

                            scope.$emit('mrPreview:initExperience', experience, session);
                        }
                    });
                }
            };
        }])

        .directive('videoTrimmer', ['c6UrlMaker','$window','c6Debounce','$q',
        function                   ( c6UrlMaker , $window , c6Debounce , $q ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_trimmer.html'),
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

        .directive('videoPreview', ['c6UrlMaker','$timeout',
        function                   ( c6UrlMaker , $timeout ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/directives/video_preview.html'),
                scope: {
                    service: '@',
                    videoid: '@',
                    start: '=',
                    end: '='
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

                        video.once('ready', handleEvents);
                    }


                    scope.$watch('videoid', function(id) {
                        if (!id) { return; }

                        $timeout(function() {
                            controlVideo($element.find('#videoEmbedPlayer *'));
                        });
                    });
                }
            };
        }]);
}());
