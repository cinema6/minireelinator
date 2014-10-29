(function() {
    'use strict';

    define(['minireel/editor', 'app', 'templates'], function(editorModule, appModule) {
        describe('<video-preview>', function() {
            var $rootScope,
                $scope,
                $compile,
                $timeout,
                c6EventEmitter,
                c6VideoService,
                $q,
                $preview,
                $httpBackend,
                YouTubeDataService,
                VideoService;

            var scope;

            beforeEach(function() {
                module(appModule.name);
                module(editorModule.name, function($provide) {
                    $provide.value('youtube', {
                        Player: function() {}
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    c6VideoService = $injector.get('c6VideoService');
                    $timeout = $injector.get('$timeout');
                    $q = $injector.get('$q');
                    YouTubeDataService = $injector.get('YouTubeDataService');
                    $httpBackend = $injector.get('$httpBackend');
                    VideoService = $injector.get('VideoService');

                    $scope = $rootScope.$new();
                });

                spyOn(c6VideoService, 'bestFormat').and.returnValue();

                $scope.service = null;
                $scope.videoid = null;

                $scope.$apply(function() {
                    $preview = $compile('<video-preview service="{{service}}" videoid="{{videoid}}" start="start" end="end"></video-preview>')($scope);
                });

                scope = $preview.isolateScope();

                expect($preview.find('iframe').length).toBe(0);
            });

            describe('scope.embedCode', function() {
                it('should be the embedCode given the service and video id', function() {
                    $scope.$apply(function() {
                        $scope.service = 'yahoo';
                        $scope.videoid = '98fh3489r';
                    });
                    expect(scope.embedCode).toBe(VideoService.embedCodeFromData($scope.service, $scope.videoid));

                    $scope.$apply(function() {
                        $scope.service = 'aol';
                        $scope.videoid = '9834hfn34ior';
                    });
                    expect(scope.embedCode).toBe(VideoService.embedCodeFromData($scope.service, $scope.videoid));
                });
            });

            describe('when the chosen player has an interface', function() {
                var video, scope,
                    $player;

                function VideoInterface() {
                    var ready = false;

                    this.currentTime = 0;
                    this.readyState = 3;
                    this.error = null;

                    this.pause = jasmine.createSpy('video.pause()');
                    this.play = jasmine.createSpy('video.play()');

                    c6EventEmitter(this);

                    this.once('ready', function() { ready = true; });

                    this.on('newListener', function(event) {
                        if (event.search(
                            /^(newListener|ready|error)$/
                        ) < 0 && !ready) {
                            throw new Error('Can\'t add a listener before the player is ready!');
                        }
                    });
                }

                function timeupdate(time) {
                    video.currentTime = time;
                    video.emit('timeupdate');
                }

                beforeEach(function() {
                    scope = $preview.isolateScope();
                    $player = $('<mock-player></mock-player>');

                    spyOn(scope, '$emit').and.callThrough();

                    video = new VideoInterface();
                    $player.data('video', video);

                    $scope.$apply(function() {
                        $scope.videoid = '85377978';
                    });
                    $preview.find('div').append($player);
                    $timeout.flush();

                    expect(scope.video).not.toBeDefined();
                });

                describe('if the video has an error', function() {
                    beforeEach(function() {
                        video.error = {
                            name: 'YouTubePlayerError',
                            message: 'There was a problem'
                        };

                        $scope.$apply(function() {
                            $scope.videoid = '85377979';
                        });
                        $preview.find('div').append($player);
                        $timeout.flush();
                    });

                    it('should emit the <video-preview>:error event', function() {
                        expect(scope.$emit).toHaveBeenCalledWith('<video-preview>:error', video.error);
                    });
                });

                it('should not emit the <video-preview>:error event', function() {
                    expect(scope.$emit).not.toHaveBeenCalledWith('<video-preview>:error', null);
                });

                describe('when switching to a video without an interface', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.videoid = '853779789';
                        });
                        $player.replaceWith('<mock-player></mock-player>');
                        $timeout.flush();
                    });

                    it('should remove the interface from the scope', function() {
                        expect($preview.isolateScope().video).toBeUndefined();
                    });
                });

                describe('when the error event is emitted', function() {
                    beforeEach(function() {
                        video.error = {
                            name: 'YouTubePlayerError',
                            message: 'There was an async problem'
                        };

                        video.emit('error');
                    });

                    it('should emit the <video-preview>:error event', function() {
                        expect(scope.$emit).toHaveBeenCalledWith('<video-preview>:error', video.error);
                    });
                });

                describe('after the video is ready', function() {
                    beforeEach(function() {
                        video.emit('ready');
                    });

                    it('should put the video on the scope', function() {
                        expect($preview.isolateScope().video).toBe(video);
                    });

                    describe('scanning', function() {
                        var scanDeferred,
                            scope;

                        beforeEach(function() {
                            scanDeferred = $q.defer();
                            scope = $preview.isolateScope();

                            scope.onMarkerSeek(scanDeferred.promise);
                        });

                        function notify(time) {
                            $scope.$apply(function() {
                                scanDeferred.notify(time);
                            });
                            video.emit('timeupdate');
                        }

                        function done(time) {
                            $scope.$apply(function() {
                                scanDeferred.resolve(time);
                            });
                            scanDeferred = $q.defer();
                        }

                        describe('the start time', function() {
                            it('should update the currentTime on the video', function() {
                                notify(10);
                                expect(video.currentTime).toBe(10);

                                notify(15);
                                expect(video.currentTime).toBe(15);

                                notify(12);
                                expect(video.currentTime).toBe(12);
                            });
                        });

                        describe('the end time', function() {
                            it('should update the currentTime on the video', function() {
                                notify(10);
                                expect(video.currentTime).toBe(10);

                                notify(15);
                                expect(video.currentTime).toBe(15);

                                notify(12);
                                expect(video.currentTime).toBe(12);
                            });
                        });

                        describe('if a video has not played yet', function() {
                            beforeEach(function() {
                                video.readyState = 0;
                            });

                            it('should play the video', function() {
                                notify(5);
                                expect(video.play).toHaveBeenCalled();
                                expect(video.currentTime).toBe(0);

                                video.readyState = 1;
                                notify(10);
                                expect(video.currentTime).toBe(10);
                                expect(video.play.calls.count()).toBe(2);

                                video.readyState = 3;
                                video.play.calls.reset();
                                notify(13);
                                expect(video.play).not.toHaveBeenCalled();

                                notify(23);
                                expect(video.play).not.toHaveBeenCalled();
                            });
                        });

                        describe('scope.currentTime', function() {
                            beforeEach(function() {
                                done(0);
                            });

                            it('should "freeze" when the scan starts, and "unfreeze" when it ends', function() {
                                expect(scope.currentTime).toBe(0);

                                video.currentTime = 10;
                                expect(scope.currentTime).toBe(10);

                                video.currentTime = 20;
                                expect(scope.currentTime).toBe(20);

                                video.currentTime = 30;
                                expect(scope.currentTime).toBe(30);

                                scope.onMarkerSeek(scanDeferred.promise);

                                notify(5);
                                expect(scope.currentTime).toBe(30);

                                notify(10);
                                expect(scope.currentTime).toBe(30);

                                notify(27);
                                expect(scope.currentTime).toBe(30);

                                done(27);
                                expect(scope.currentTime).toBe(30);
                                expect(video.currentTime).toBe(30);

                                video.currentTime = 32;
                                expect(scope.currentTime).toBe(32);
                            });

                            it('should not let a start/end time get in its way', function() {
                                $scope.$apply(function() {
                                    $scope.start = 10;
                                    $scope.end = 30;
                                });
                                scope.onMarkerSeek(scanDeferred.promise);

                                notify(20);
                                expect(video.currentTime).toBe(20);

                                notify(7);
                                expect(video.currentTime).toBe(7);
                            });
                        });
                    });

                    describe('if there is no start/end specified', function() {
                        it('should not interfere with the video playback', function() {
                            timeupdate(0);
                            expect(video.currentTime).toBe(0);

                            timeupdate(1);
                            expect(video.currentTime).toBe(1);

                            timeupdate(2);
                            expect(video.currentTime).toBe(2);
                        });
                    });

                    describe('if there is a start/end time specified', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.start = 10;
                                $scope.end = 30;
                            });
                        });

                        it('should seek the video to the start time if there is a timeupdate and the currentTime is lower than the start - 1 second', function() {
                            expect(video.currentTime).toBe(0);
                            timeupdate(1);

                            expect(video.currentTime).toBe(10);

                            timeupdate(10.1);
                            expect(video.currentTime).toBe(10.1);

                            timeupdate(8);
                            expect(video.currentTime).toBe(10);

                            timeupdate(9);
                            expect(video.currentTime).toBe(9);
                        });

                        it('should pause the video if it goes past or reaches the end time', function() {
                            timeupdate(25);
                            timeupdate(26);
                            timeupdate(27);
                            timeupdate(28);
                            timeupdate(29);
                            timeupdate(29.999);

                            expect(video.pause).not.toHaveBeenCalled();

                            timeupdate(30);
                            expect(video.pause).toHaveBeenCalled();

                            video.pause.calls.reset();

                            timeupdate(28);
                            timeupdate(29.5);
                            expect(video.pause).not.toHaveBeenCalled();

                            timeupdate(31);
                            expect(video.pause).toHaveBeenCalled();
                        });

                        it('should restart the video from the beginning if it is played after ending', function() {
                            timeupdate(15);
                            expect(video.currentTime).toBe(15);

                            video.emit('playing');
                            expect(video.currentTime).toBe(15);

                            timeupdate(31);

                            video.emit('playing');

                            expect(video.currentTime).toBe(10);

                            timeupdate(11);
                            timeupdate(12);

                            video.emit('playing');

                            expect(video.currentTime).toBe(12);
                        });

                        it('should not restart the video from the beginning if the end time has changed since it ended', function() {
                            timeupdate(15);
                            expect(video.currentTime).toBe(15);

                            video.emit('playing');
                            expect(video.currentTime).toBe(15);

                            timeupdate(31);
                            $scope.$apply(function() {
                                $scope.end = 45;
                            });

                            video.emit('playing');
                            expect(video.currentTime).toBe(31);
                        });
                    });
                });
            });

            describe('when the player has no interface', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.videoid = 'abc123';
                        $scope.service = 'bleh';
                    });
                });

                it('should not throw errors', function() {
                    expect(function() {
                        $timeout.flush();
                    }).not.toThrow();
                });
            });

            describe('youtube', function() {
                beforeEach(function() {
                    spyOn(YouTubeDataService.videos, 'list')
                        .and.returnValue($q.defer().promise);

                    $scope.$apply(function() {
                        $scope.service = 'youtube';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a youtube player when a videoid is provided', function() {
                    var $youtube;

                    $scope.$apply(function() {
                        $scope.videoid = 'gy1B3agGNxw';
                    });
                    $youtube = $preview.find('youtube-player');

                    expect($youtube.length).toBe(1);

                    expect($youtube.attr('videoid')).toBe('gy1B3agGNxw');
                });
            });

            describe('vimeo', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.service = 'vimeo';
                    });
                });

                it('should not create any player when there is no videoid', function() {
                    expect($preview.find('vimeo-player').length).toBe(0);
                });

                it('should create a vimeo player when a videoid is provided', function() {
                    var $vimeo;

                    $scope.$apply(function() {
                        $scope.videoid = '2424355';
                    });
                    $vimeo = $preview.find('vimeo-player');

                    expect($vimeo.length).toBe(1);

                    expect($vimeo.attr('id')).toBe('preview');
                    expect($vimeo.attr('videoid')).toBe('2424355');
                });
            });

            describe('dailymotion', function() {
                beforeEach(function() {
                    $httpBackend.whenGET('https://api.dailymotion.com/video/x199caf?fields=duration')
                        .respond(404, 'NOT FOUND');
                    $scope.$apply(function() {
                        $scope.service = 'dailymotion';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('dailymotion-player').length).toBe(0);
                });

                it('should create a dailymotion-player when the videoid is provided', function() {
                    var $dailymotion;

                    $scope.$apply(function() {
                        $scope.videoid = 'x199caf';
                    });
                    $dailymotion = $preview.find('dailymotion-player');

                    expect($dailymotion.length).toBe(1);

                    expect($dailymotion.attr('id')).toBe('preview');
                    expect($dailymotion.attr('videoid')).toBe('x199caf');
                });
            });
        });
    });
}());
