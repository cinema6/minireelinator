define(['minireel/players'], function(playersModule) {
    'use strict';

    describe('DailymotionPlayerService', function() {
        var $window,
            DailymotionPlayerService;

        beforeEach(function() {
            module(playersModule.name);

            inject(function($injector) {
                $window = $injector.get('$window');
                spyOn($window, 'addEventListener').and.callThrough();
                DailymotionPlayerService = $injector.get('DailymotionPlayerService');
            });
        });

        afterEach(function() {
            $window.addEventListener.calls.all().forEach(function(call) {
                $window.removeEventListener.apply($window, call.args);
            });
        });

        it('should exist', function() {
            expect(DailymotionPlayerService).toEqual(jasmine.any(Object));
        });

        describe('constructors', function() {
            describe('Player($iframe)', function() {
                var $iframe, contentWindow, postMessage,
                    player;

                beforeEach(function() {
                    $iframe = $('<iframe src="http://www.dailymotion.com/embed/video/x23h8sn?api=postMessage&html&id=foo"></iframe>');
                    player = new DailymotionPlayerService.Player($iframe);

                    $('body').append($iframe);
                    contentWindow = $iframe.prop('contentWindow');
                    postMessage = spyOn(contentWindow, 'postMessage');
                });

                afterEach(function() {
                    $iframe.remove();
                });

                describe('initialization', function() {
                    describe('if no id is in the src', function() {
                        beforeEach(function() {
                            $iframe = $('<iframe src="http://www.dailymotion.com/embed/video/x23h8sn?api=postMessage&html"></iframe>');
                        });

                        it('should throw an error', function() {
                            expect(function() {
                                player = new DailymotionPlayerService.Player($iframe);
                            }).toThrow(new Error('Provided iFrame has no id specified in the search params.'));
                        });
                    });

                    ['fragment', 'location'].forEach(function(apiMode) {
                        describe('if api is set to ' + apiMode, function() {
                            beforeEach(function() {
                                $iframe = $('<iframe src="http://www.dailymotion.com/embed/video/x23h8sn?api=' + apiMode + '&html&id=foo"></iframe>');
                            });

                            it('should throw an error', function() {
                                expect(function() {
                                    player = new DailymotionPlayerService.Player($iframe);
                                }).toThrow(new Error('Provided iFrame must have "api" set to "postMessage" in the search params.'));
                            });
                        });
                    });
                });

                describe('methods', function() {
                    describe('call(method, data)', function() {
                        describe('if called with no data', function() {
                            beforeEach(function() {
                                player.call('play');
                            });

                            it('should post a message to the iframe', function() {
                                expect(postMessage).toHaveBeenCalledWith('play', '*');
                            });
                        });

                        describe('if called with data', function() {
                            beforeEach(function() {
                                player.call('seek', 1.34);
                            });

                            it('should post a message with data to the iframe', function() {
                                expect(postMessage).toHaveBeenCalledWith('seek=1.34', '*');
                            });
                        });
                    });
                });

                describe('events', function() {
                    var apireadySpy, playSpy, timeupdateSpy;

                    function trigger(data) {
                        var event = document.createEvent('Event');
                        event.initEvent('message');

                        event.origin = 'http://www.dailymotion.com';
                        event.data = Object.keys(data)
                            .map(function(key) {
                                return [key, data[key]]
                                    .map(encodeURIComponent)
                                    .join('=');
                            })
                            .join('&');

                        $window.dispatchEvent(event);
                    }

                    beforeEach(function() {
                        apireadySpy = jasmine.createSpy('apiready');
                        playSpy = jasmine.createSpy('play');
                        timeupdateSpy = jasmine.createSpy('timeupdate');

                        player.on('apiready', apireadySpy)
                            .on('play', playSpy)
                            .on('timeupdate', timeupdateSpy);
                    });

                    it('should ignore messages not from dailymotion', function() {
                        function trigger(data, origin) {
                            var event = document.createEvent('Event');
                            event.initEvent('message');

                            event.origin = origin;
                            event.data = data;

                            $window.dispatchEvent(event);
                        }

                        expect(function() {
                            trigger(3, 'https://www.youtube.com');
                            trigger('f39fnw', 'https://player.vimeo.com');
                        }).not.toThrow();
                    });

                    it('should make the player emit the event', function() {
                        trigger({
                            id: 'foo',
                            event: 'apiready'
                        });
                        expect(apireadySpy).toHaveBeenCalledWith({});

                        trigger({
                            id: 'foo',
                            event: 'play'
                        });
                        expect(playSpy).toHaveBeenCalledWith({});

                        trigger({
                            id: 'foo',
                            event: 'timeupdate',
                            time: '3.14'
                        });
                        expect(timeupdateSpy).toHaveBeenCalledWith({
                            time: 3.14
                        });
                    });

                    describe('with multiple players', function() {
                        var $iframe2,
                            player2,
                            playSpy2;

                        beforeEach(function() {
                            $iframe2 = $('<iframe src="http://www.dailymotion.com/embed/video/x23h8sn?api=postMessage&html&id=bar"></iframe>');
                            player2 = new DailymotionPlayerService.Player($iframe2);
                            $('body').append($iframe2);

                            playSpy2 = jasmine.createSpy('play2');

                            player2.on('play', playSpy2);
                        });

                        it('should delegate events', function() {
                            trigger({
                                id: 'foo',
                                event: 'play'
                            });
                            expect(playSpy).toHaveBeenCalled();
                            expect(playSpy2).not.toHaveBeenCalled();

                            [playSpy, playSpy2].forEach(function(spy) {
                                spy.calls.reset();
                            });

                            trigger({
                                id: 'bar',
                                event: 'play'
                            });
                            expect(playSpy2).toHaveBeenCalled();
                            expect(playSpy).not.toHaveBeenCalled();
                        });
                    });

                    describe('when the $iframe is destroyed', function() {
                        var messageHandler;

                        beforeEach(function() {
                            messageHandler = $window.addEventListener.calls.mostRecent().args[1];
                            $iframe.remove();
                        });

                        it('should not hold references to the player anymore', function() {
                            expect(function() {
                                messageHandler({
                                    origin: 'http://www.dailymotion.com',
                                    data: 'id=foo&event=play'
                                });
                            }).toThrow();
                        });
                    });
                });
            });
        });
    });
});
