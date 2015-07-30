(function() {
    'use strict';

    define(['minireel/services'], function(servicesModule) {
        describe('VideoThumbnailService', function() {
            var $rootScope,
                $q,
                OpenGraphService,
                VideoService,
                VideoThumbnailService;

            var $httpBackend;

            var _private;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    OpenGraphService = $injector.get('OpenGraphService');
                    VideoService = $injector.get('VideoService');

                    $httpBackend = $injector.get('$httpBackend');

                    VideoThumbnailService = $injector.get('VideoThumbnailService');
                    _private = VideoThumbnailService._private;
                });
            });

            it('should exist', function() {
                expect(VideoThumbnailService).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {
                describe('methods', function() {
                    describe('fetchYouTubeThumbs(videoid)', function() {
                        var success;

                        beforeEach(function() {
                            success = jasmine.createSpy('fetchYouTubeThumbs()');

                            $rootScope.$apply(function() {
                                _private.fetchYouTubeThumbs('abc123').then(success);
                            });
                        });

                        it('should return an object that has thumbnail urls for the video', function() {
                            var model = success.calls.mostRecent().args[0];

                            expect(model.small).toBe('//img.youtube.com/vi/abc123/2.jpg');
                            expect(model.large).toBe('//img.youtube.com/vi/abc123/0.jpg');
                        });
                    });

                    describe('fetchVimeoThumbs(videoid)', function() {
                        var success;

                        beforeEach(function() {
                            success = jasmine.createSpy('fetchVimeoThumbs()');

                            $httpBackend.expectGET('//vimeo.com/api/v2/video/92354665.json')
                                .respond(200, [
                                    /* jshint quotmark:false */
                                    {
                                        "id": 92354665,
                                        "title": "Lunar Odyssey",
                                        "description": "Timelapse of the Lunar Eclipse that took place April 15th 2014. Shot on 2 5D Mark III cameras using Canon lenses and a RED Epic with a 300-1200mm Canon Century zoom lens that is used on IMAX cameras. Motion control was done using an eMotimo TB3 and the Dynamic Perception Stage Zero track.<br />\r\n<br />\r\nMusic:<br />\r\n2001: A Space Odyssey<br />\r\n<br />\r\nTwitter: Drew599<br />\r\n<br />\r\nWebsite: 599productions.com",
                                        "url": "http://vimeo.com/92354665",
                                        "upload_date": "2014-04-18 15:59:32",
                                        "mobile_url": "http://vimeo.com/m/92354665",
                                        "thumbnail_small": "http://i.vimeocdn.com/video/472061562_100x75.jpg",
                                        "thumbnail_medium": "http://i.vimeocdn.com/video/472061562_200x150.jpg",
                                        "thumbnail_large": "http://i.vimeocdn.com/video/472061562_640.jpg",
                                        "user_id": 703283,
                                        "user_name": "Andrew Walker",
                                        "user_url": "http://vimeo.com/user703283",
                                        "user_portrait_small": "http://i.vimeocdn.com/portrait/6740843_30x30.jpg",
                                        "user_portrait_medium": "http://i.vimeocdn.com/portrait/6740843_75x75.jpg",
                                        "user_portrait_large": "http://i.vimeocdn.com/portrait/6740843_100x100.jpg",
                                        "user_portrait_huge": "http://i.vimeocdn.com/portrait/6740843_300x300.jpg",
                                        "stats_number_of_likes": 154,
                                        "stats_number_of_plays": 3329,
                                        "stats_number_of_comments": 53,
                                        "duration": 177,
                                        "width": 1920,
                                        "height": 1080,
                                        "tags": "timelapse, Canon, nature, stars, lunar, eclipse, odyssey, 2001, April, 15th, 2014, CARMA, array, moon, blood moon, RED, 4K",
                                        "embed_privacy": "anywhere"
                                    }
                                    /* jshint quotmark:single */
                                ]);

                            _private.fetchVimeoThumbs('92354665').then(success);
                        });

                        it('should resolve to an object with small and large thumbs', function() {
                            expect(success).not.toHaveBeenCalled();

                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith({
                                small: 'http://i.vimeocdn.com/video/472061562_100x75.jpg',
                                large: 'http://i.vimeocdn.com/video/472061562_640.jpg'
                            });
                        });
                    });

                    describe('fetchDailyMotionThumbs(videoid)', function() {
                        var success;

                        beforeEach(function() {
                            success = jasmine.createSpy('fetchDailyMotionThumbs()');

                            $httpBackend.expectGET('https://api.dailymotion.com/video/x1quygb?fields=thumbnail_120_url,thumbnail_url&ssl_assets=1')
                                .respond(200, {
                                    /* jshint quotmark:false */
                                    "thumbnail_120_url": "http://s2.dmcdn.net/EZ-Ut/x120-3BS.jpg",
                                    "thumbnail_url": "http://s2.dmcdn.net/EZ-Ut.jpg"
                                    /* jshint quotmark:single */
                                });

                            _private.fetchDailyMotionThumbs('x1quygb').then(success);
                        });

                        it('should resolve to an object with small and large thumbs', function() {
                            expect(success).not.toHaveBeenCalled();

                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith({
                                small: 'http://s2.dmcdn.net/EZ-Ut/x120-3BS.jpg',
                                large: 'http://s2.dmcdn.net/EZ-Ut.jpg'
                            });
                        });
                    });

                    describe('fetchOpenGraphThumbs(service, videoid)', function() {
                        var success,
                            data;

                        beforeEach(function() {
                            success = jasmine.createSpy('success()');

                            data = {
                                images: [
                                    {
                                        value: 'https://s1.yimg.com/lo/api/res/1.2/_Jo44FiEC_QjAhRtNb0AHw--/YXBwaWQ9eXZpZGVvZmVlZHM7Zmk9ZmlsbDtoPTM2MDt3PTY0MA--/http://media.zenfs.com/en-US/video/video.associatedpressfree.com/e96c6d366033f659588444a884da7058'
                                    }
                                ]
                            };

                            spyOn(OpenGraphService, 'getData').and.returnValue($q.when(data));

                            $rootScope.$apply(function() {
                                _private.fetchOpenGraphThumbs('yahoo', '9034fj8394485hn').then(success);
                            });
                        });

                        it('should get the open graph data for the video', function() {
                            expect(OpenGraphService.getData).toHaveBeenCalledWith(VideoService.urlFromData('yahoo', '9034fj8394485hn'));
                        });

                        it('should resolve to an object with small and large thumbnails', function() {
                            expect(success).toHaveBeenCalledWith({
                                small: data.images[0].value,
                                large: data.images[0].value
                            });
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('getThumbsFor(service, videoid)', function() {
                        var result;

                        describe('youtube', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchYouTubeThumbs')
                                    .and.returnValue($q.when({
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }));

                                result = VideoThumbnailService.getThumbsFor('youtube', '12345');
                            });

                            it('should imediately retrun an object with null properties', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchYouTubeThumbs).toHaveBeenCalledWith('12345');
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });

                            describe('ensureFulfillment()', function() {
                                it('should return the same promise every time', function() {
                                    expect(result.ensureFulfillment()).toBe(result.ensureFulfillment());
                                });

                                it('should resolve to "this" when the thumbs are fetched', function() {
                                    var success = jasmine.createSpy('ensureFulfillment() success')
                                        .and.callFake(function(model) {
                                            ['small', 'large'].forEach(function(size) {
                                                expect(model[size]).toBe(size + '.jpg');
                                            });
                                        });

                                    result.ensureFulfillment().then(success);

                                    $rootScope.$digest();
                                    expect(success).toHaveBeenCalledWith(result);
                                });
                            });

                            it('should cache the model', function() {
                                expect(VideoThumbnailService.getThumbsFor('youtube', '12345')).toBe(result);

                                expect(VideoThumbnailService.getThumbsFor('youtube', 'abc123')).not.toBe(result);
                            });
                        });

                        describe('vimeo', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchVimeoThumbs')
                                    .and.returnValue($q.when({
                                        small: 'vimeo_small.jpg',
                                        large: 'vimeo_large.jpg'
                                    }));

                                result = VideoThumbnailService.getThumbsFor('vimeo', 'abcdef');
                            });

                            it('should immediately return an object with null properties', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchVimeoThumbs).toHaveBeenCalledWith('abcdef');
                                $rootScope.$digest();

                                expect(result.small).toBe('vimeo_small.jpg');
                                expect(result.large).toBe('vimeo_large.jpg');
                            });

                            it('should cache the model', function() {
                                expect(VideoThumbnailService.getThumbsFor('vimeo', 'abcdef')).toBe(result);

                                expect(VideoThumbnailService.getThumbsFor('vimeo', 'abc123')).not.toBe(result);
                            });
                        });

                        describe('dailymotion', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchDailyMotionThumbs')
                                    .and.returnValue($q.when({
                                        small: 'dailymotion_small.jpg',
                                        large: 'dailymotion_large.jpg'
                                    }));

                                result = VideoThumbnailService.getThumbsFor('dailymotion', 'abc123');
                            });

                            it('should immediately return an object with null properties', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchDailyMotionThumbs).toHaveBeenCalledWith('abc123');
                                $rootScope.$digest();

                                expect(result.small).toBe('dailymotion_small.jpg');
                                expect(result.large).toBe('dailymotion_large.jpg');
                            });

                            it('should cache the model', function() {
                                expect(VideoThumbnailService.getThumbsFor('dailymotion', 'abc123')).toBe(result);

                                expect(VideoThumbnailService.getThumbsFor('dailymotion', '12345')).not.toBe(result);
                            });
                        });

                        ['yahoo', 'aol', 'rumble', 'vine'].forEach(function(service) {
                            describe(service, function() {
                                var result;

                                beforeEach(function() {
                                    spyOn(_private, 'fetchOpenGraphThumbs')
                                        .and.returnValue($q.when({
                                            small: 'og--small.jpg',
                                            large: 'og--large.jpg'
                                        }));

                                    result = VideoThumbnailService.getThumbsFor(service, '2038fh349');
                                });

                                it('should immediately return an object with null properties', function() {
                                    expect(result.small).toBeNull();
                                    expect(result.large).toBeNull();
                                });

                                it('should set the small and large properties when the promise resolves', function() {
                                    expect(_private.fetchOpenGraphThumbs).toHaveBeenCalledWith(service, '2038fh349');
                                    $rootScope.$digest();

                                    expect(result.small).toBe('og--small.jpg');
                                    expect(result.large).toBe('og--large.jpg');
                                });

                                it('should cache the model', function() {
                                    expect(VideoThumbnailService.getThumbsFor(service, '2038fh349')).toBe(result);

                                    expect(VideoThumbnailService.getThumbsFor(service, 'wiuryu9b')).not.toBe(result);
                                });
                            });
                        });

                        describe('an unknown service', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = VideoThumbnailService.getThumbsFor('foo', 'abc');
                                });
                            });

                            it('should return an empty model', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });
                        });
                    });
                });
            });
        });
    });
}());
