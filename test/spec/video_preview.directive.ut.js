(function() {
    'use strict';

    define(['editor'], function() {
        describe('<video-preview>', function() {
            var $rootScope,
                $scope,
                $compile,
                $timeout,
                c6EventEmitter,
                $q,
                $preview,
                $httpBackend;

            beforeEach(function() {
                module('c6.mrmaker', function($provide) {
                    $provide.value('youtube', {
                        Player: function() {}
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    $timeout = $injector.get('$timeout');
                    $q = $injector.get('$q');
                    $httpBackend = $injector.get('$httpBackend');

                    $scope = $rootScope.$new();
                });

                $scope.service = null;
                $scope.videoid = null;

                $scope.$apply(function() {
                    $preview = $compile('<video-preview service="{{service}}" videoid="{{videoid}}" start="start" end="end"></video-preview>')($scope);
                });

                expect($preview.find('iframe').length).toBe(0);
            });

            describe('when the chosen player has an interface', function() {
                var video;

                function VideoInterface() {
                    var ready = false;

                    this.currentTime = 0;
                    this.readyState = 3;

                    this.pause = jasmine.createSpy('video.pause()');
                    this.play = jasmine.createSpy('video.play()');

                    c6EventEmitter(this);

                    this.once('ready', function() { ready = true; });

                    this.on('newListener', function(event) {
                        if (event.search(
                            /^(newListener|ready)$/
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
                    var $player = $('<mock-player></mock-player>');

                    video = new VideoInterface();
                    $player.data('video', video);

                    $scope.$apply(function() {
                        $scope.videoid = '85377978';
                    });
                    $preview.find('div').append($player);
                    $timeout.flush();

                    expect($preview.isolateScope().video).not.toBeDefined();
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

            describe('when the player has no interface', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.videoid = 'abc123';
                        $scope.service = 'dailymotion';
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
                    $scope.$apply(function() {
                        $scope.service = 'youtube';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a youtube player when a videoid is provided', function() {
                    var $youtube;

                    $httpBackend.expectGET('//gdata.youtube.com/feeds/api/videos/gy1B3agGNxw?v=2&alt=jsonc')
                        .respond(200, {data:{duration:100}});

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
                    $scope.$apply(function() {
                        $scope.service = 'dailymotion';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a vimeo embed iframe when a videoid is provided', function() {
                    var $iframe;

                    $scope.$apply(function() {
                        $scope.videoid = 'x199caf';
                    });
                    $iframe = $preview.find('iframe');

                    expect($iframe.length).toBe(1);

                    expect($iframe.attr('src')).toBe('//www.dailymotion.com/embed/video/x199caf');
                });
            });
        });
    });
}());
