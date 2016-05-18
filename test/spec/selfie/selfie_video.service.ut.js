define(['app', 'c6_defines'], function(appModule, c6Defines) {
    'use strict';

    describe('SelfieVideoService', function() {
        var $rootScope,
            $httpBackend,
            $q,
            SelfieVideoService,
            YouTubeDataService,
            VimeoDataService,
            DailymotionDataService,
            metagetta;

        beforeEach(function() {
            module(appModule.name);

            module(function($provide) {
                metagetta = jasmine.createSpy();
                $provide.value('metagetta', metagetta);
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');
                $q = $injector.get('$q');
                SelfieVideoService = $injector.get('SelfieVideoService');
                YouTubeDataService = $injector.get('YouTubeDataService');
                VimeoDataService = $injector.get('VimeoDataService');
                DailymotionDataService = $injector.get('DailymotionDataService');
            });
        });

        afterAll(function() {
            $rootScope = null;
            $httpBackend = null;
            $q = null;
            SelfieVideoService = null;
            YouTubeDataService = null;
            VimeoDataService = null;
            DailymotionDataService = null;
            metagetta = null;
        });

        it('should exist', function() {
            expect(SelfieVideoService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('dataFromText(text)', function() {
                var success, failure;

                function fromUrl() {
                    return SelfieVideoService.dataFromText.apply(SelfieVideoService, arguments)
                        .then(success, failure);
                }

                beforeEach(function() {
                    success = jasmine.createSpy('success');
                    failure = jasmine.createSpy('failure');
                });

                it('should return a promise', function() {
                    expect(fromUrl('').then).toBeDefined();
                });

                it('should call the VideoService for data', function() {

                });

                describe('when no service is found', function() {
                    describe('when not a valid url', function() {
                        it('should reject the promise', function() {
                            $rootScope.$apply(function() {
                                fromUrl('lkhjasdfhuisfkljahsd');
                            });

                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalled();
                        });
                    });

                    describe('when we have a valid url', function() {
                        describe('when it is a valid vast tag', function() {
                            describe('when response contains "VAST" and is "text/xml"', function() {
                                it('should return an adUnit object', function() {
                                    $httpBackend.expect('GET', 'https://vasttag.com/vast.xml').respond(200, '<VAST></VAST>', {'content-type': 'text/xml'});

                                    $rootScope.$apply(function() {
                                        fromUrl('https://vasttag.com/vast.xml');
                                    });

                                    $httpBackend.flush();

                                    expect(failure).not.toHaveBeenCalled();
                                    expect(success).toHaveBeenCalledWith({
                                        service: 'adUnit',
                                        id: '{"vast":"https://vasttag.com/vast.xml"}'
                                    });
                                });
                            });
                        });

                        describe('when it is not a valid vast tag', function() {
                            describe('when response does not contain "VAST"', function() {
                                it('should return an adUnit object', function() {
                                    $httpBackend.expect('GET', 'https://vasttag.com/vast.xml').respond(200, 'Some text', {'content-type': 'text/xml'});

                                    $rootScope.$apply(function() {
                                        fromUrl('https://vasttag.com/vast.xml');
                                    });

                                    $httpBackend.flush();

                                    expect(failure).toHaveBeenCalled();
                                    expect(success).not.toHaveBeenCalled();
                                });
                            });

                            describe('when response header does not set "text/xml" type', function() {
                                it('should return an adUnit object', function() {
                                    $httpBackend.expect('GET', 'https://vasttag.com/vast.xml').respond(200, '<VAST></VAST>');

                                    $rootScope.$apply(function() {
                                        fromUrl('https://vasttag.com/vast.xml');
                                    });

                                    $httpBackend.flush();

                                    expect(failure).toHaveBeenCalled();
                                    expect(success).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe('when the url is http', function() {
                            it('should validate and save the url with a protocol of https', function() {
                                $httpBackend.expect('GET', 'https://vasttag.com/vast.xml').respond(200, '<VAST></VAST>', {'content-type': 'text/xml'});

                                $rootScope.$apply(function() {
                                    fromUrl('http://vasttag.com/vast.xml');
                                });

                                $httpBackend.flush();

                                expect(failure).not.toHaveBeenCalled();
                                expect(success).toHaveBeenCalledWith({
                                    service: 'adUnit',
                                    id: '{"vast":"https://vasttag.com/vast.xml"}'
                                });
                            });
                        });

                        describe('when the url is protocol relative', function() {
                            it('should validate and save the url with a protocol of https', function() {
                                $httpBackend.expect('GET', 'https://vasttag.com/vast.xml').respond(200, '<VAST></VAST>', {'content-type': 'text/xml'});

                                $rootScope.$apply(function() {
                                    fromUrl('//vasttag.com/vast.xml');
                                });

                                $httpBackend.flush();

                                expect(failure).not.toHaveBeenCalled();
                                expect(success).toHaveBeenCalledWith({
                                    service: 'adUnit',
                                    id: '{"vast":"https://vasttag.com/vast.xml"}'
                                });
                            });
                        });
                    });
                });
            });

            describe('urlFromData(service, id, hostname)', function() {
                function fromData() {
                    return SelfieVideoService.urlFromData.apply(SelfieVideoService, arguments);
                }

                it('should create a youtube url', function() {
                    expect(fromData('youtube', 'xKLRGJYna-8')).toBe('https://www.youtube.com/watch?v=xKLRGJYna-8');
                    expect(fromData('youtube', 'QhMufR7MiqA')).toBe('https://www.youtube.com/watch?v=QhMufR7MiqA');
                    expect(fromData('youtube', '0M1L15hpphQ')).toBe('https://www.youtube.com/watch?v=0M1L15hpphQ');
                });

                it('should create a vimeo url', function() {
                    expect(fromData('vimeo', '83486021')).toBe('http://vimeo.com/83486021');
                    expect(fromData('vimeo', '89501438')).toBe('http://vimeo.com/89501438');
                    expect(fromData('vimeo', '26404699')).toBe('http://vimeo.com/26404699');
                });

                it('should create a dailymotion url', function() {
                    expect(fromData('dailymotion', 'x17nw7w')).toBe('http://www.dailymotion.com/video/x17nw7w');
                    expect(fromData('dailymotion', 'x1d5q7o')).toBe('http://www.dailymotion.com/video/x1d5q7o');
                    expect(fromData('dailymotion', 'x3pih4')).toBe('http://www.dailymotion.com/video/x3pih4');
                });

                it('should create an adUnit url', function() {
                    expect(fromData('adUnit', '{"vast":"http://vasttag.com/vast.xml"}')).toBe('http://vasttag.com/vast.xml');
                });

                it('should create a wistia url', function() {
                    expect(fromData('wistia', 'a401lat6bl', {
                        hostname: 'ezra.wistia.com'
                    })).toBe('https://ezra.wistia.com/medias/a401lat6bl?preview=true');
                });

                it('should create a brightcove url', function() {
                    expect(fromData('brightcove', '4655415742001', {
                        accountid: '4652941506001',
                        playerid: '71cf5be9-7515-44d8-bb99-29ddc6224ff8',
                        embedid: 'default'
                    })).toBe('https://players.brightcove.net/4652941506001/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=4655415742001');
                });
            });

            describe('statsFromService(service, id)', function() {
                var success, failure, deferred;

                function statsFromService() {
                    return SelfieVideoService.statsFromService.apply(SelfieVideoService, arguments)
                        .then(success, failure);
                }

                beforeEach(function() {
                    success = jasmine.createSpy('success');
                    failure = jasmine.createSpy('failure');
                    deferred = $q.defer();
                });

                it('should return a promise', function() {
                    expect(statsFromService('').then).toBeDefined();
                });

                describe('any unrecognized service', function() {
                    it('should resolve the promise with null', function() {
                        $rootScope.$apply(function() {
                            statsFromService('unrecognized', '1234');
                        });

                        expect(success).toHaveBeenCalledWith(null);
                    });
                });

                describe('YouTube data', function() {
                    beforeEach(function() {
                        metagetta.and.returnValue(deferred.promise);
                        c6Defines.kYouTubeDataApiKey = 'you_key';
                        $rootScope.$apply(function() {
                            statsFromService('youtube', 'xKLRGJYna-8');
                        });
                    });

                    it('should query metagetta', function() {
                        expect(metagetta).toHaveBeenCalledWith({
                            type: 'youtube',
                            id: 'xKLRGJYna-8',
                            fields: ['title', 'duration', 'views', 'uri', 'thumbnails', 'description'],
                            youtube: {
                                key: 'you_key'
                            }
                        });
                    });

                    it('should resolve with a data object', function() {
                        deferred.resolve({
                            title: 'Youtube title',
                            duration: 10,
                            views: 1000,
                            uri: 'https://www.youtube.com/watch?v=xKLRGJYna-8',
                            thumbnails: {
                                small: 'small.jpg',
                                large: 'large.jpg'
                            },
                            description: 'hello there'
                        });

                        $rootScope.$digest();

                        expect(success).toHaveBeenCalledWith({
                            title: 'Youtube title',
                            duration: 10,
                            views: 1000,
                            href: 'https://www.youtube.com/watch?v=xKLRGJYna-8',
                            thumbnails: {
                                small: 'small.jpg',
                                large: 'large.jpg'
                            },
                            description: 'hello there'
                        });
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if query fails', function() {
                        deferred.reject('epic fail');
                        $rootScope.$digest();
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalledWith('epic fail');
                    });
                });

                describe('Vimeo data', function() {
                    beforeEach(function() {
                        metagetta.and.returnValue(deferred.promise);
                        $rootScope.$apply(function() {
                            statsFromService('vimeo', '83486021');
                        });
                    });

                    it('should query metagetta', function() {
                        expect(metagetta).toHaveBeenCalledWith({
                            type: 'vimeo',
                            id: '83486021',
                            fields: ['title', 'duration', 'views', 'uri', 'thumbnails', 'description']
                        });
                    });

                    it('should resolve with a data object', function() {
                        deferred.resolve({
                            title: 'Vimeo Video Title',
                            duration: 100,
                            views: 1000,
                            uri: 'https://vimeo.com/83486021',
                            thumbnails: {
                                small: 'small.jpg',
                                large: 'large.jpg'
                            },
                            description: 'hello there'
                        });

                        $rootScope.$digest();

                        expect(success).toHaveBeenCalledWith({
                            title: 'Vimeo Video Title',
                            duration: 100,
                            views: 1000,
                            href: 'https://vimeo.com/83486021',
                            thumbnails: {
                                small: 'small.jpg',
                                large: 'large.jpg'
                            },
                            description: 'hello there'
                        });
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if query fails', function() {
                        deferred.reject('epic fail');
                        $rootScope.$digest();
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalledWith('epic fail');
                    });
                });

                describe('DailyMotion data', function() {
                    var dailyMotionVideoObject;

                    beforeEach(function() {

                        dailyMotionVideoObject = {
                            get: jasmine.createSpy('video.get()').and.returnValue(deferred.promise)
                        }

                        spyOn(DailymotionDataService, 'video').and.returnValue(dailyMotionVideoObject);

                        $rootScope.$apply(function() {
                            statsFromService('dailymotion', 'x17nw7w');
                        });
                    });

                    it('should query the DailymotionDataService', function() {
                        expect(DailymotionDataService.video).toHaveBeenCalledWith('x17nw7w')
                        expect(dailyMotionVideoObject.get).toHaveBeenCalledWith({
                            fields: ['viewsTotal','duration','title']
                        });
                    });

                    it('should resolve with a data object', function() {
                        deferred.resolve({
                            title: 'DailyMotion Video Title',
                            duration: 500,
                            viewsTotal: 5000
                        });

                        $rootScope.$digest();

                        expect(success).toHaveBeenCalledWith({
                            title: 'DailyMotion Video Title',
                            duration: 500,
                            views: 5000,
                            href: SelfieVideoService.urlFromData('dailymotion', 'x17nw7w')
                        });
                    });

                    it('should reject the promise if query fails', function() {
                        deferred.reject();
                        $rootScope.$digest();

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });

                describe('Instagram data', function() {
                    beforeEach(function() {
                        metagetta.and.returnValue(deferred.promise);
                        c6Defines.kInstagramDataApiKey = 'insta_key';
                        $rootScope.$apply(function() {
                            statsFromService('instagram', '6DD1crjvG7');
                        });
                    });

                    it('should query metagetta', function() {
                        expect(metagetta).toHaveBeenCalledWith({
                            type: 'instagram',
                            id: '6DD1crjvG7',
                            fields: ['title', 'duration', 'views', 'uri'],
                            instagram: {
                                key: 'insta_key'
                            }
                        });
                    });

                    it('should resolve with a data object', function() {
                        deferred.resolve({
                            title: 'Instagram title',
                            duration: 10,
                            views: 1000,
                            uri: 'https://instagram.com/p/6DD1crjvG7'
                        });

                        $rootScope.$digest();

                        expect(success).toHaveBeenCalledWith({
                            title: 'Instagram title',
                            duration: 10,
                            views: 1000,
                            href: 'https://instagram.com/p/6DD1crjvG7'
                        });
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if query fails', function() {
                        deferred.reject('epic fail');
                        $rootScope.$digest();
                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalledWith('epic fail');
                    });

                    it('should reject the promise if it is not a video', function() {
                        deferred.resolve({
                            description: 'Once upon a time there was an Instagram',
                            duration: null,
                            views: 1000,
                            uri: 'https://instagram.com/p/6DD1crjvG7'
                        });

                        $rootScope.$digest();

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalledWith(new Error('not an Instagram video'));
                    });
                });
            });
        });
    });
});
