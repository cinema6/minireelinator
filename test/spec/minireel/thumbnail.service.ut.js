(function() {
    'use strict';

    define(['minireel/services', 'c6_defines'], function(servicesModule, c6Defines) {
        describe('ThumbnailService', function() {
            var $rootScope,
                $q,
                OpenGraphService,
                ImageService,
                ThumbnailService,
                VideoService,
                success, failure;

            var $httpBackend;

            var _private;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    OpenGraphService = $injector.get('OpenGraphService');
                    ImageService = $injector.get('ImageService');
                    $httpBackend = $injector.get('$httpBackend');
                    ThumbnailService = $injector.get('ThumbnailService');
                    VideoService = $injector.get('VideoService');
                    _private = ThumbnailService._private;
                });

                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');
            });

            it('should exist', function() {
                expect(ThumbnailService).toEqual(jasmine.any(Object));
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

                    describe('fetchVzaarThumbs(videoid)', function() {
                        var result;

                        beforeEach(function() {
                            result = _private.fetchVzaarThumbs('12345');
                        });

                        it('should resolve to an object with small and large thumbs', function() {
                            expect(result).toEqual({
                                small: 'https://view.vzaar.com/12345/thumb',
                                large: 'https://view.vzaar.com/12345/thumb'
                            });
                        });
                    });

                    describe('fetchWistiaThumbs', function() {
                        beforeEach(function() {
                            spyOn(VideoService, 'urlFromData').and.callThrough();
                            $httpBackend.expectGET('https://fast.wistia.com/oembed?url=https%3A%2F%2Fwistia.com%2Fmedias%2F12345%3Fpreview%3Dtrue')
                                .respond(200, {
                                    /* jshint quotmark:false */
                                    "version":"1.0",
                                    "type":"video",
                                    "html":"&lt;iframe src=\"http://fast.wistia.net/embed/iframe/e4a27b971d?version=v1&videoHeight=360&videoWidth=640\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" width=\"640\" height=\"360\"&gt;&lt;/iframe&gt;",
                                    "width":640,
                                    "height":360,
                                    "provider_name":"Wistia, Inc.",
                                    "provider_url":"http://wistia.com",
                                    "title":"Brendan - Make It Clap",
                                    "thumbnail_url":"http://embed.wistia.com/deliveries/2d2c14e15face1e0cc7aac98ebd5b6f040b950b5.jpg?image_crop_resized=100x60",
                                    "thumbnail_width":100,
                                    "thumbnail_height":60
                                    /* jshint quotmark:single */
                                });
                            _private.fetchWistiaThumbs('12345', 'cinema6.wistia.com').then(success, failure);
                        });

                        it('should get the video url from the video service', function() {
                            expect(VideoService.urlFromData).toHaveBeenCalled();
                        });

                        it('should request using oembed', function() {
                            $httpBackend.flush();
                            expect(success).toHaveBeenCalledWith({
                                small: 'http://embed.wistia.com/deliveries/2d2c14e15face1e0cc7aac98ebd5b6f040b950b5.jpg?image_crop_resized=100x60',
                                large: 'http://embed.wistia.com/deliveries/2d2c14e15face1e0cc7aac98ebd5b6f040b950b5.jpg?image_crop_resized=100x60'
                            });
                        });
                    });

                    describe('fetchJWPlayerThumbs(videoid)', function() {
                        it('should get the right thumbnail urls', function() {
                            expect(_private.fetchJWPlayerThumbs('12345-123')).toEqual({
                                small: 'https://content.jwplatform.com/thumbs/12345-320.jpg',
                                large: 'https://content.jwplatform.com/thumbs/12345-720.jpg'
                            });
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

                    describe('fetchFlickrThumbs(data)', function() {

                        describe('on success', function() {

                            describe('if the \'Thumbnail\' label exists in flickr\'s response', function() {

                                beforeEach(function() {
                                    c6Defines.kFlickrDataApiKey = 'abc123';
                                    var request = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=abc123&photo_id=12345&jsoncallback=JSON_CALLBACK'
                                    $httpBackend.whenJSONP(request).respond({
                                        sizes: {
                                            size: [
                                                {
                                                    label: 'first size',
                                                    source: 'www.site.com/tiny.jpg'
                                                },
                                                {
                                                    label: 'Thumbnail',
                                                    source: 'www.site.com/small.jpg'
                                                },
                                                {
                                                    label: 'larger',
                                                    source: 'www.site.com/large.jpg'
                                                }
                                            ]
                                        }
                                    });
                                });

                                it('should return the image with the \'Thumbnail\' label and its successor', function() {
                                    var expectedOutput = {
                                        small: 'www.site.com/small.jpg',
                                        large: 'www.site.com/large.jpg'
                                    };
                                    $rootScope.$apply(function() {
                                        ThumbnailService._private.fetchFlickrThumbs('12345').then(success, failure);
                                    });
                                    $httpBackend.flush();
                                    expect(success).toHaveBeenCalledWith(expectedOutput);
                                    expect(failure).not.toHaveBeenCalled();
                                });
                            });

                            describe('if the \'Thumbnail\' label does not exist in flickr\'s response', function() {

                                beforeEach(function() {
                                    c6Defines.kFlickrDataApiKey = 'abc123';
                                    var request = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=abc123&photo_id=12345&jsoncallback=JSON_CALLBACK'
                                    $httpBackend.whenJSONP(request).respond({
                                        sizes: {
                                            size: [
                                                {
                                                    label: 'first size',
                                                    source: 'www.site.com/small.jpg'
                                                },
                                                {
                                                    label: 'second size',
                                                    source: 'www.site.com/large.jpg'
                                                }
                                            ]
                                        }
                                    });
                                });

                                it('should return the first two image sizes as thumbs', function() {
                                    var expectedOutput = {
                                        small: 'www.site.com/small.jpg',
                                        large: 'www.site.com/large.jpg'
                                    };
                                    $rootScope.$apply(function() {
                                        ThumbnailService._private.fetchFlickrThumbs('12345').then(success, failure);
                                    });
                                    $httpBackend.flush();
                                    expect(success).toHaveBeenCalledWith(expectedOutput);
                                    expect(failure).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe('on error', function() {

                            describe('when flickr\'s response is not recognized', function() {

                                beforeEach(function() {
                                    c6Defines.kFlickrDataApiKey = 'abc123';
                                    var request = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=abc123&photo_id=12345&jsoncallback=JSON_CALLBACK'
                                    $httpBackend.whenJSONP(request).respond({
                                        response: "unrecognized response"
                                    });
                                });

                                it('should reject the promise', function() {
                                    $rootScope.$apply(function() {
                                        ThumbnailService._private.fetchFlickrThumbs('12345').then(success, failure);
                                    });
                                    $httpBackend.flush();
                                    expect(success).not.toHaveBeenCalled();
                                    expect(failure).toHaveBeenCalled();
                                });
                            });
                        });
                    });

                    describe('fetchGettyThumbs(imageid)', function() {
                        it('should return the thumbs from the imageid', function() {
                            var input = '12345';
                            var expectedOutput = {
                                small: '//embed-cdn.gettyimages.com/xt/12345.jpg?v=1&g=fs1|0|DV|33|651&s=1',
                                large: '//embed-cdn.gettyimages.com/xt/12345.jpg?v=1&g=fs1|0|DV|33|651&s=1'
                            };
                            var output = ThumbnailService._private.fetchGettyThumbs(input);
                            expect(output).toEqual(expectedOutput);
                        });
                    });

                    describe('fetchWebThumbs(imageid)', function() {
                        it('should return the thumbs from the imageid', function() {
                            var input = 'www.site.com/image.jpg';
                            var expectedOutput = {
                                small: 'www.site.com/image.jpg',
                                large: 'www.site.com/image.jpg'
                            };
                            var output = ThumbnailService._private.fetchWebThumbs(input);
                            expect(output).toEqual(expectedOutput);
                        });
                    });

                    describe('fetchInstagramThumbs(data)', function() {

                        var request;
                        beforeEach(function() {
                            c6Defines.kInstagramDataApiKey = 'abc123';
                            request = 'https://api.instagram.com/v1/media/shortcode/abc123?client_id=abc123&callback=JSON_CALLBACK';
                        });

                        describe('on success', function() {
                            beforeEach(function() {
                                $httpBackend.whenJSONP(request).respond({
                                    meta: {
                                        code: 200
                                    },
                                    data: {
                                        images: {
                                            thumbnail: {
                                                url: 'thumb.jpg'
                                            },
                                            low_resolution: {
                                                url: 'low_res.jpg'
                                            }
                                        }
                                    }
                                });
                            });

                            it('should fetch thumb urls from instagram\'s response', function() {
                                var expectedOutput = {
                                    small: 'thumb.jpg',
                                    large: 'low_res.jpg'
                                };
                                $rootScope.$apply(function() {
                                    ThumbnailService._private.fetchInstagramThumbs('abc123').then(success, failure);
                                });
                                $httpBackend.flush();
                                expect(success).toHaveBeenCalledWith(expectedOutput);
                                expect(failure).not.toHaveBeenCalled();
                            });
                        });

                        describe('on error', function() {
                            beforeEach(function() {
                                $httpBackend.whenJSONP(request).respond({
                                    meta: {
                                        code: 500
                                    }
                                });
                            });

                            it('should reject the promise', function() {
                                $rootScope.$apply(function() {
                                    ThumbnailService._private.fetchInstagramThumbs('abc123').then(success, failure);
                                });
                                $httpBackend.flush();
                                expect(success).not.toHaveBeenCalled();
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                    });

                });
            });

            describe('@public', function() {
                 describe('methods', function() {
                     describe('getThumbsFor(data)', function() {
                         var result;

                         ['instagram', 'flickr', 'getty', 'web', 'yahoo', 'aol', 'rumble', 'vzaar', 'wistia', 'jwplayer'].forEach(function(service) {
                             describe('when the service is ' + service, function() {
                                 beforeEach(function() {
                                     result = ThumbnailService.getThumbsFor(service, '12345');
                                 });

                                 it('should immediately return an object with null properties', function() {
                                     expect(result.small).toBeNull();
                                     expect(result.large).toBeNull();
                                 });
                             });
                         });

                         describe('youtube', function() {
                             beforeEach(function() {
                                 spyOn(_private, 'fetchYouTubeThumbs')
                                     .and.returnValue($q.when({
                                         small: 'small.jpg',
                                         large: 'large.jpg'
                                     }));

                                 result = ThumbnailService.getThumbsFor('youtube', '12345');
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
                                 expect(ThumbnailService.getThumbsFor('youtube', '12345')).toBe(result);

                                 expect(ThumbnailService.getThumbsFor('youtube', 'abc123')).not.toBe(result);
                             });
                         });

                         describe('vimeo', function() {
                             beforeEach(function() {
                                 spyOn(_private, 'fetchVimeoThumbs')
                                     .and.returnValue($q.when({
                                         small: 'vimeo_small.jpg',
                                         large: 'vimeo_large.jpg'
                                     }));

                                 result = ThumbnailService.getThumbsFor('vimeo', 'abcdef');
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
                                 expect(ThumbnailService.getThumbsFor('vimeo', 'abcdef')).toBe(result);

                                 expect(ThumbnailService.getThumbsFor('vimeo', 'abc123')).not.toBe(result);
                             });
                         });

                         describe('dailymotion', function() {
                             beforeEach(function() {
                                 spyOn(_private, 'fetchDailyMotionThumbs')
                                     .and.returnValue($q.when({
                                         small: 'dailymotion_small.jpg',
                                         large: 'dailymotion_large.jpg'
                                     }));

                                 result = ThumbnailService.getThumbsFor('dailymotion', 'abc123');
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
                                 expect(ThumbnailService.getThumbsFor('dailymotion', 'abc123')).toBe(result);

                                 expect(ThumbnailService.getThumbsFor('dailymotion', '12345')).not.toBe(result);
                             });
                         });

                         describe('flickr', function() {
                             beforeEach(function() {
                                 spyOn(_private, 'fetchFlickrThumbs')
                                     .and.returnValue(
                                         $q.when({
                                             small: 'small.jpg',
                                             large: 'large.jpg'
                                         })
                                     );

                                 result = ThumbnailService.getThumbsFor('flickr', '12345');
                             });

                             it('should set the small and large properties when the promise resolves', function() {
                                 expect(_private.fetchFlickrThumbs).toHaveBeenCalledWith('12345');
                                 $rootScope.$digest();

                                 expect(result.small).toBe('small.jpg');
                                 expect(result.large).toBe('large.jpg');
                             });
                         });

                         describe('getty', function() {
                             beforeEach(function() {
                                 spyOn(_private, 'fetchGettyThumbs')
                                     .and.returnValue(
                                         $q.when({
                                             small: 'small.jpg',
                                             large: 'large.jpg'
                                         })
                                     );

                                 result = ThumbnailService.getThumbsFor('getty', '12345');
                             });

                             it('should set the small and large properties when the promise resolves', function() {
                                 expect(_private.fetchGettyThumbs).toHaveBeenCalledWith('12345');
                                 $rootScope.$digest();

                                 expect(result.small).toBe('small.jpg');
                                 expect(result.large).toBe('large.jpg');
                             });
                         });

                         describe('web', function() {
                             beforeEach(function() {
                                 spyOn(_private, 'fetchWebThumbs')
                                     .and.returnValue(
                                         $q.when({
                                             small: 'small.jpg',
                                             large: 'large.jpg'
                                         })
                                     );

                                 result = ThumbnailService.getThumbsFor(
                                     'web', 'www.site.com/image.jpg');
                             });

                             it('should set the small and large properties when the promise resolves', function() {
                                 expect(_private.fetchWebThumbs).toHaveBeenCalledWith('www.site.com/image.jpg');
                                 $rootScope.$digest();

                                 expect(result.small).toBe('small.jpg');
                                 expect(result.large).toBe('large.jpg');
                             });
                         });

                        describe('instagram', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchInstagramThumbs')
                                    .and.returnValue(
                                        $q.when({
                                            small: 'small.jpg',
                                            large: 'large.jpg'
                                        })
                                    );

                                result = ThumbnailService.getThumbsFor('instagram', '12345');
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchInstagramThumbs).toHaveBeenCalledWith('12345');
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });
                        });

                        describe('vzaar', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchVzaarThumbs')
                                    .and.returnValue(
                                        $q.when({
                                            small: 'small.jpg',
                                            large: 'large.jpg'
                                        })
                                    );

                                result = ThumbnailService.getThumbsFor('vzaar', '12345');
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchVzaarThumbs).toHaveBeenCalledWith('12345');
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });
                        });

                        describe('wistia', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchWistiaThumbs').and.returnValue(
                                    $q.when({
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    })
                                );
                                result = ThumbnailService.getThumbsFor('wistia', 'cinema6|12345');
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchWistiaThumbs).toHaveBeenCalledWith('cinema6|12345');
                                $rootScope.$digest();
                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });
                        });

                        describe('jwplayer', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchJWPlayerThumbs').and.returnValue(
                                    $q.when({
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    })
                                );
                                result = ThumbnailService.getThumbsFor('jwplayer', '12345-123');
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchJWPlayerThumbs).toHaveBeenCalledWith('12345-123');
                                $rootScope.$digest();
                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });
                        });

                        describe('an unknown service', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = ThumbnailService.getThumbsFor('foo', '12345');
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
