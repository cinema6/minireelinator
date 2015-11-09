define(['app'], function(appModule) {
    'use strict';

    describe('SelfieVideoService', function() {
        var $rootScope,
            $httpBackend,
            $q,
            SelfieVideoService,
            YouTubeDataService,
            VimeoDataService,
            DailymotionDataService;

        beforeEach(function() {
            module(appModule.name);

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
                                    $httpBackend.expect('GET', 'http://vasttag.com/vast.xml').respond(200, '<VAST></VAST>', {'content-type': 'text/xml'});

                                    $rootScope.$apply(function() {
                                        fromUrl('http://vasttag.com/vast.xml');
                                    });

                                    $httpBackend.flush();

                                    expect(failure).not.toHaveBeenCalled();
                                    expect(success).toHaveBeenCalledWith({
                                        service: 'adUnit',
                                        id: '{"vast":"http://vasttag.com/vast.xml"}'
                                    });
                                });
                            });
                        });

                        describe('when it is not a valid vast tag', function() {
                            describe('when response does not contain "VAST"', function() {
                                it('should return an adUnit object', function() {
                                    $httpBackend.expect('GET', 'http://vasttag.com/vast.xml').respond(200, 'Some text', {'content-type': 'text/xml'});

                                    $rootScope.$apply(function() {
                                        fromUrl('http://vasttag.com/vast.xml');
                                    });

                                    $httpBackend.flush();

                                    expect(failure).toHaveBeenCalled();
                                    expect(success).not.toHaveBeenCalled();
                                });
                            });

                            describe('when response header does not set "text/xml" type', function() {
                                it('should return an adUnit object', function() {
                                    $httpBackend.expect('GET', 'http://vasttag.com/vast.xml').respond(200, '<VAST></VAST>');

                                    $rootScope.$apply(function() {
                                        fromUrl('http://vasttag.com/vast.xml');
                                    });

                                    $httpBackend.flush();

                                    expect(failure).toHaveBeenCalled();
                                    expect(success).not.toHaveBeenCalled();
                                });
                            });
                        });
                    });
                });
            });

            describe('urlFromData(service, id)', function() {
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
                        spyOn(YouTubeDataService.videos, 'list').and.returnValue(deferred.promise);

                        $rootScope.$apply(function() {
                            statsFromService('youtube', 'xKLRGJYna-8');
                        });
                    });

                    it('should query the YouTubeDataService', function() {
                        expect(YouTubeDataService.videos.list).toHaveBeenCalledWith({
                            part: ['snippet','statistics','contentDetails'],
                            id: 'xKLRGJYna-8'
                        });
                    });

                    it('should resolve with a data object', function() {
                        deferred.resolve({
                            snippet: {
                                title: 'Video Title'
                            },
                            contentDetails: {
                                duration: 200
                            },
                            statistics: {
                                viewCount: 3000
                            }
                        });

                        $rootScope.$digest();

                        expect(success).toHaveBeenCalledWith({
                            title: 'Video Title',
                            duration: 200,
                            views: 3000,
                            href: SelfieVideoService.urlFromData('youtube', 'xKLRGJYna-8')
                        });
                    });

                    it('should reject the promise if query fails', function() {
                        deferred.reject();
                        $rootScope.$digest();

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });

                describe('Vimeo data', function() {
                    beforeEach(function() {
                        spyOn(VimeoDataService, 'getVideo').and.returnValue(deferred.promise);

                        $rootScope.$apply(function() {
                            statsFromService('vimeo', '83486021');
                        });
                    });

                    it('should query the VimeoDataService', function() {
                        expect(VimeoDataService.getVideo).toHaveBeenCalledWith('83486021');
                    });

                    it('should resolve with a data object', function() {
                        deferred.resolve({
                            title: 'Vimeo Video Title',
                            duration: 100,
                            statsNumberOfPlays: 1000
                        });

                        $rootScope.$digest();

                        expect(success).toHaveBeenCalledWith({
                            title: 'Vimeo Video Title',
                            duration: 100,
                            views: 1000,
                            href: SelfieVideoService.urlFromData('vimeo', '83486021')
                        });
                    });

                    it('should reject the promise if query fails', function() {
                        deferred.reject();
                        $rootScope.$digest();

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
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

                describe('AdUnit data', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            statsFromService('adUnit', '{"vast":"http://vasttag.com/vast.xml"}');
                        });
                    });

                    it('should resolve with a data object', function() {
                        expect(success).toHaveBeenCalledWith({
                            title: null,
                            duration: 0,
                            views: 0,
                            href: SelfieVideoService.urlFromData('adUnit', '{"vast":"http://vasttag.com/vast.xml"}')
                        });
                    });
                });
            });
        });
    });
});