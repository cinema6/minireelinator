(function() {
    'use strict';

    var isNumber = angular.isNumber,
        equals = angular.equals,
        copy = angular.copy,
        forEach = angular.forEach,
        isDefined = angular.isDefined;

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

        .controller('EditorController', ['c6State','$scope','MiniReelService','cinema6',
                                         'ConfirmDialogService','c6Debounce','$log',
        function                        ( c6State , $scope , MiniReelService , cinema6 ,
                                          ConfirmDialogService , c6Debounce , $log ) {
            var self = this,
                AppCtrl = $scope.AppCtrl,
                saveAfterTenSeconds = c6Debounce(function() {
                    $log.info('Autosaving MiniReel');
                    self.save();
                }, 10000);

            $log = $log.context('EditorController');

//            this.pageObject = { page : 'editor', title : 'Editor' };
            this.preview = false;
            this.editTitle = false;
            this.isDirty = false;
            this.inFlight = false;
            this.dismissDirtyWarning = false;

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
                }
            });

            this.publish = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to make this MiniReel public?',
                    affirm: 'Publish',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        MiniReelService.publish(self.model.id)
                            .then(function setActive() {
                                self.model.status = 'active';
                            });
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

                        MiniReelService.unpublish(self.model.id)
                            .then(function setActive() {
                                self.model.status = 'pending';
                            });
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
                c6State.goTo('editor.editCard.copy', { cardId: card.id });
            };

            this.newCard = function(insertionIndex/*,evtSrc*/) {
//                if (evtSrc){
//                    AppCtrl.sendPageEvent('Editor','Click','New Card',self.pageObject);
//                }
                c6State.goTo('editor.newCard', { insertionIndex: insertionIndex });
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
                        MiniReelService.erase(self.model.id)
                            .then(function backToManager() {
                                c6State.goTo('manager');
                            });

                        ConfirmDialogService.close();
                    }
                });
            };

            this.save = function() {
                this.inFlight = true;

                MiniReelService.save()
                    .then(function log(minireel) {
                        $log.info('MiniReel save success!', minireel);

                        ['isDirty', 'inFlight', 'dismissDirtyWarning']
                            .forEach(function setFalse(prop) {
                                self[prop] = false;
                            });
                    });
            };

            $scope.$watch(function() {
                return self.model.data.mode + self.model.data.autoplay;
            }, function(newMode, oldMode) {
                if(newMode === oldMode) { return; }
                $scope.$broadcast('mrPreview:updateMode', self.model);
            });

            $scope.$watch(function() { return self.model; }, function(minireel, prevMinireel) {
                if (minireel === prevMinireel) { return; }

                self.isDirty = true;

                if (minireel.status === 'active') {
                    $log.warn('MiniReel is published. Will not autosave.');
                    return;
                }

                saveAfterTenSeconds();
            }, true);

            $scope.$on('addCard', function(event, card, index) {
                self.model.data.deck.splice(index, 0, card);
            });

            $scope.$on('updateCard', function(event, cardProxy) {
                var card = self.model.data.deck.filter(function(card) {
                    return card.id === cardProxy.id;
                })[0];

                copy(cardProxy, card);
            });

            $scope.$on('$destroy', function() {
                if (self.model.status !== 'active') {
                    self.save();
                }

                MiniReelService.close();
            });

        //    AppCtrl.sendPageView(this.pageObject);
        }])

        .controller('EditorSplashController', ['$scope','FileService','CollateralService',
                                               'c6State','$log',
        function                              ( $scope , FileService , CollateralService ,
                                                c6State , $log ) {
            var self = this,
                EditorCtrl = $scope.EditorCtrl;

            $log = ($log.context || function() { return $log; })('EditorSplashCtrl');

            this.maxFileSize = 204800;
            this.splash = null;
            this.currentUpload = null;
            Object.defineProperties(this, {
                fileTooBig: {
                    get: function() {
                        return ((this.splash || {}).size || 0) > this.maxFileSize;
                    }
                }
            });

            this.upload = function() {
                var upload;

                $log.info('Upload started: ', this.splash);
                this.currentUpload = upload = CollateralService.set(
                    'splash',
                    this.splash,
                    this.model
                );

                upload.finally(function() {
                    $log.info('Uploaded completed!');
                    self.currentUpload = null;
                });
            };

            this.save = function() {
                var data = EditorCtrl.model.data;

                $log.info('Saving data: ', this.model);
                copy(this.model.data.collateral, data.collateral || (data.collateral = {}));
                $log.info('Save complete: ', EditorCtrl.model);

                c6State.goTo('editor');
            };

            $scope.$on('$destroy', function() {
                if (!self.splash) { return; }

                FileService.open(self.splash).close();
            });

            $scope.$watch(function() { return self.splash; }, function(newImage, oldImage) {
                if (!oldImage) { return; }

                FileService.open(oldImage).close();
            });
        }])

        .controller('EditCardController', ['$scope','c6Computed','c6State','VideoService',
                                           'MiniReelService','cinema6',
        function                          ( $scope , c6Computed , c6State , VideoService ,
                                            MiniReelService , cinema6 ) {
            var self = this,
                c = c6Computed($scope),
                EditorCtrl = $scope.EditorCtrl;

            this.limits = {
                copy: Infinity
            };
            cinema6.getAppData()
                .then(function setLimits(data) {
                    var mode = MiniReelService.modeDataOf(
                        EditorCtrl.model,
                        data.experience.data.modes
                    );

                    forEach(self.limits, function(limit, prop) {
                        self.limits[prop] = mode.limits[prop] || Infinity;
                    });
                });

            Object.defineProperties(this, {
                canSave: {
                    get: function() {
                        return (this.model.note || '').length <= this.limits.copy;
                    }
                }
            });

            VideoService.createVideoUrl(c, this, 'EditCardCtrl');

            this.save = function() {
                $scope.$emit('updateCard', this.model);

                c6State.goTo('editor');
            };
        }])

        .controller('NewCardController', ['$scope','c6State','c6StateParams','MiniReelService',
        function                         ( $scope , c6State , c6StateParams , MiniReelService ) {
            this.type = 'video';

            this.edit = function() {
                MiniReelService.setCardType(this.model, this.type);

                $scope.$emit('addCard', this.model, c6StateParams.insertionIndex);
                c6State.goTo('editor.editCard.copy', { cardId: this.model.id });
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
                            profile: profile
                        }
                    });
                });

                // add a listener for the 'getCard' request.
                // when a user is previewing a specific card
                // we remember it, and if they change the mode
                // and the app reloads, it's going to call back
                // and see if it still needs to go to that card
                session.on('mrPreview:getCard', function(data, respond) {
                    respond(card);
                });

                session.on('fullscreenMode', function(bool) {
                    self.fullscreen = bool;
                    $scope.$digest();
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
                        card = MiniReelService.convertCard(newCard);
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
                });
            });
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
                        return scope.start || 0;
                    }

                    function end() {
                        return isNumber(scope.end) ? scope.end : scope.duration;
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
                        return ((scope.start * seekBar.display.width) /
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
