define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('VideoErrorService', function() {
        var $rootScope,
            $q,
            VideoErrorService,
            YouTubeDataService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                VideoErrorService = $injector.get('VideoErrorService');
                YouTubeDataService = $injector.get('YouTubeDataService');
            });
        });

        afterAll(function() {
            $rootScope = null;
            $q = null;
            VideoErrorService = null;
            YouTubeDataService = null;
        });

        it('should exist', function() {
            expect(VideoErrorService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('getErrorFor(service, videoid)', function() {
                var result;

                describe('with a youtube video', function() {
                    var videoId = 'PMG1trzznHg';

                    var listVideosDeferred,
                        response;

                    function call() {
                        var args = Array.prototype.slice.call(arguments);

                        return VideoErrorService.getErrorFor.apply(VideoErrorService, ['youtube'].concat(args));
                    }

                    beforeEach(function() {
                        response = {
                            status: {
                                embeddable: true
                            }
                        };

                        spyOn(YouTubeDataService.videos, 'list').and.returnValue((listVideosDeferred = $q.defer()).promise);

                        $rootScope.$apply(function() {
                            result = call(videoId);
                        });
                    });

                    it('should immediately return an error object', function() {
                        expect(result).toEqual(jasmine.objectContaining({
                            code: null,
                            message: null,
                            present: false
                        }));
                    });

                    it('should request data about the video', function() {
                        expect(YouTubeDataService.videos.list).toHaveBeenCalledWith({
                            id: videoId,
                            part: ['status']
                        });
                    });

                    describe('if the video is embeddable', function() {
                        beforeEach(function() {
                            response.status.embeddable = true;
                            $rootScope.$apply(function() {
                                listVideosDeferred.resolve(response);
                            });
                        });

                        it('should not set an error', function() {
                            expect(result).toEqual(jasmine.objectContaining({
                                code: null,
                                message: null,
                                present: false
                            }));
                        });
                    });

                    describe('if the video is not embeddable', function() {
                        beforeEach(function() {
                            response.status.embeddable = false;
                            $rootScope.$apply(function() {
                                listVideosDeferred.resolve(response);
                            });
                        });

                        it('should set an error', function() {
                            expect(result).toEqual(jasmine.objectContaining({
                                code: 403,
                                message: 'Embedding disabled by request',
                                present: true
                            }));
                        });
                    });

                    describe('if there is a problem with the YouTube data API', function() {
                        var error;

                        beforeEach(function() {
                            error = {
                                code: 404,
                                message: 'Video not found'
                            };

                            $rootScope.$apply(function() {
                                listVideosDeferred.reject(error);
                            });
                        });

                        it('should propagate the error', function() {
                            expect(result).toEqual(jasmine.objectContaining({
                                code: 404,
                                message: 'Video not found',
                                present: true
                            }));
                        });
                    });
                });

                ['vimeo', 'dailymotion'].forEach(function(service) {
                    describe('with a ' + service + ' video', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                result = VideoErrorService.getErrorFor(service, 'PMG1trzznHg');
                            });
                        });

                        it('should return an error object', function() {
                            expect(result).toEqual(jasmine.objectContaining({
                                code: null,
                                message: null,
                                present: false
                            }));
                        });
                    });
                });

                ['youtube', 'vimeo', 'dailymotion'].forEach(function(service, index, services) {
                    describe('with a ' + service + ' video', function() {
                        var result,
                            randomId;

                        beforeEach(function() {
                            randomId = Math.random().toString(34).substr(24);

                            spyOn(YouTubeDataService.videos, 'list').and.returnValue($q.defer().promise);

                            $rootScope.$apply(function() {
                                result = VideoErrorService.getErrorFor(service, randomId);
                            });
                        });

                        it('should return the same reference given a service/id', function() {
                            expect(VideoErrorService.getErrorFor(service, randomId)).toBe(result);
                            expect(VideoErrorService.getErrorFor(service, randomId + 'a')).not.toBe(result);
                            expect(VideoErrorService.getErrorFor(services[index + 1] || services[0], randomId)).not.toBe(result);
                        });
                    });
                });
            });
        });
    });
});
