define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('VideoSearchService', function() {
        var $rootScope,
            $q,
            VideoDataService,
            VideoSearchService,
            $httpBackend;

        beforeEach(function() {
            module(servicesModule.name);
            module(function(c6UrlMakerProvider) {
                c6UrlMakerProvider.location('/api', 'api');
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                VideoDataService = $injector.get('VideoDataService');
                VideoSearchService = $injector.get('VideoSearchService');
                $httpBackend = $injector.get('$httpBackend');
            });
        });

        it('should exist', function() {
            expect(VideoSearchService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('find(query, limit, skip)', function() {
                var query, response,
                    videoData, videoDataDeferred,
                    success, failure;

                function pickRandom(array) {
                    return array[Math.floor(Math.random() * array.length)];
                }

                function randomIntBetween(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                function generateResults(num) {
                    return (function(total) {
                        var array = [];

                        while (total--) {
                            array[total] = total;
                        }

                        return array;
                    }(num)).map(function(index) {
                        var source = pickRandom(['youtube', 'dailymotion', 'vimeo']);

                        return {
                            title: 'Video at Index: ' + index,
                            link: 'http://www.' + source + '.com/videos/' + index + '.html',
                            description: 'The video at index ' + index + ' is the best video for just about every possible reason',
                            thumbnail: {
                                src: 'http://www.' + source + '.com/images/' + index + '.jpg',
                                width: pickRandom([300, 400, 500, 600]),
                                height: pickRandom([200, 300, 400, 500])
                            },
                            videoid: Math.random().toString(34).slice(20),
                            site: source,
                            hd: pickRandom([true, false]),
                            duration: randomIntBetween(10, 300)
                        };
                    });
                }

                beforeEach(function() {
                    query = 'The Best Videos';
                    success = jasmine.createSpy('success()'); failure = jasmine.createSpy('failure()');

                    response = {
                        meta: {
                            skipped: 30,
                            numResults: 15,
                            totalResults: 403
                        },
                        items: generateResults(15)
                    };

                    videoData = response.items.map(function(item) {
                        return {
                            service: item.site,
                            views: randomIntBetween(600, 1000000)
                        };
                    });

                    videoDataDeferred = $q.defer();

                    spyOn(VideoDataService, 'getVideos').and.returnValue(videoDataDeferred.promise);

                    $httpBackend.expectGET('/api/search/videos?limit=15&query=' + query.split(' ').join('+') + '&skip=30')
                        .respond(200, response);

                    $rootScope.$apply(function() {
                        VideoSearchService.find({ query: query }, 15, 30).then(success, failure);
                    });

                    $httpBackend.flush();
                });

                it('should resolve to an object that includes the results', function() {
                    expect(success).toHaveBeenCalledWith(jasmine.objectContaining({
                        videos: response.items
                    }));
                });

                it('should fetch data for all of the videos', function() {
                    expect(VideoDataService.getVideos).toHaveBeenCalledWith(response.items.map(function(item) {
                        return [item.site, item.videoid];
                    }));
                });

                describe('when the video data has been fetched', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            videoDataDeferred.resolve(videoData);
                        });
                    });

                    it('should extend each video result with the video data', function() {
                        var videos = success.calls.mostRecent().args[0].videos;

                        videos.forEach(function(video, index) {
                            expect(video).toEqual(jasmine.objectContaining(videoData[index]));
                        });
                    });
                });

                describe('if limit and skip are omitted', function() {
                    var result;

                    beforeEach(function() {
                        [success, failure].forEach(function(spy) {
                            spy.calls.reset();
                        });

                        $httpBackend.expectGET('/api/search/videos?query=' + query.split(' ').join('+') + '&skip=0')
                            .respond(200, response);

                        $rootScope.$apply(function() {
                            VideoSearchService.find({ query: query }).then(success, failure);
                        });

                        $httpBackend.flush();
                        result = success.calls.mostRecent().args[0];
                    });

                    it('should still have all of its properties', function() {
                        expect(result.limit).toBe(response.meta.numResults);
                        expect(result.position).toBe(3);
                    });
                });

                describe('the search results object', function() {
                    var result;

                    beforeEach(function() {
                        result = success.calls.mostRecent().args[0];
                    });

                    it('should contain metadata about pagination', function() {
                        var meta = response.meta;

                        expect(result.before).toBe(meta.skipped, 'result.before');
                        expect(result.length).toBe(meta.numResults, 'result.length');
                        expect(result.total).toBe(meta.totalResults, 'result.total');
                        expect(result.after).toBe(meta.totalResults - (meta.skipped + meta.numResults), 'result.after');
                        expect(result.pages).toBe(Math.ceil(meta.totalResults / meta.numResults), 'result.pages');
                        expect(result.position).toBe((meta.skipped / meta.numResults) + 1);
                    });

                    describe('methods', function() {
                        var initialVideos, initialVideoData;

                        beforeEach(function() {
                            [success, failure].forEach(function(spy) {
                                spy.calls.reset();
                            });

                            $rootScope.$apply(function() {
                                videoDataDeferred.resolve(videoData);
                            });

                            VideoDataService.getVideos.and.returnValue($q.defer().promise);

                            initialVideos = result.videos;
                            initialVideoData = videoData;
                        });

                        describe('next()', function() {
                            beforeEach(function() {
                                response = {
                                    meta: {
                                        skipped: 45,
                                        numResults: 15,
                                        totalResults: 403
                                    },
                                    items: generateResults(15)
                                };

                                $httpBackend.expectGET('/api/search/videos?limit=15&query=' + query.split(' ').join('+') + '&skip=45')
                                    .respond(200, response);

                                $rootScope.$apply(function() {
                                    result.next().then(success, failure);
                                });

                                $httpBackend.flush();
                            });

                            it('should resolve to itself', function() {
                                expect(success.calls.mostRecent().args[0]).toBe(result);
                            });

                            it('should update its properties', function() {
                                var meta = response.meta;

                                expect(result.videos).toEqual(response.items);
                                expect(result.before).toBe(meta.skipped);
                                expect(result.length).toBe(meta.numResults);
                                expect(result.total).toBe(meta.totalResults);
                                expect(result.after).toBe(meta.totalResults - (meta.skipped + meta.numResults));
                                expect(result.position).toBe((meta.skipped / meta.numResults) + 1);
                            });
                        });

                        describe('prev()', function() {
                            beforeEach(function() {
                                response = {
                                    meta: {
                                        skipped: 15,
                                        numResults: 15,
                                        totalResults: 403
                                    },
                                    items: generateResults(15)
                                };

                                $httpBackend.expectGET('/api/search/videos?limit=15&query=' + query.split(' ').join('+') + '&skip=15')
                                    .respond(200, response);

                                $rootScope.$apply(function() {
                                    result.prev().then(success, failure);
                                });

                                $httpBackend.flush();
                            });

                            it('should resolve to itself', function() {
                                expect(success.calls.mostRecent().args[0]).toBe(result);
                            });

                            it('should update its properties', function() {
                                var meta = response.meta;

                                expect(result.videos).toEqual(response.items);
                                expect(result.before).toBe(meta.skipped);
                                expect(result.length).toBe(meta.numResults);
                                expect(result.total).toBe(meta.totalResults);
                                expect(result.after).toBe(meta.totalResults - (meta.skipped + meta.numResults));
                                expect(result.position).toBe((meta.skipped / meta.numResults) + 1);
                            });
                        });

                        describe('page(num)', function() {
                            beforeEach(function() {
                                response = {
                                    meta: {
                                        skipped: 165,
                                        numResults: 15,
                                        totalResults: 403
                                    },
                                    items: generateResults(15)
                                };

                                videoData = response.items.map(function(item) {
                                    return {
                                        service: item.site,
                                        views: randomIntBetween(1000, 2000000)
                                    };
                                });

                                videoDataDeferred = $q.defer();

                                VideoDataService.getVideos.and.returnValue(videoDataDeferred.promise);


                                $httpBackend.expectGET('/api/search/videos?limit=15&query=' + query.split(' ').join('+') + '&skip=165')
                                    .respond(200, response);

                                $rootScope.$apply(function() {
                                    result.page(12).then(success, failure);
                                });

                                $httpBackend.flush();
                            });

                            it('should resolve to itself', function() {
                                expect(success.calls.mostRecent().args[0]).toBe(result);
                            });

                            it('should update its properties', function() {
                                var meta = response.meta;

                                expect(result.videos).toEqual(response.items);
                                expect(result.before).toBe(meta.skipped);
                                expect(result.length).toBe(meta.numResults);
                                expect(result.total).toBe(meta.totalResults);
                                expect(result.after).toBe(meta.totalResults - (meta.skipped + meta.numResults));
                                expect(result.position).toBe((meta.skipped / meta.numResults) + 1);
                            });

                            it('should fetch additional video data', function() {
                                expect(VideoDataService.getVideos).toHaveBeenCalledWith(response.items.map(function(item) {
                                    return [item.site, item.videoid];
                                }));
                            });

                            describe('when the additional data is fetched', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        videoDataDeferred.resolve(videoData);
                                    });
                                });

                                it('should update the videos with the additional data', function() {
                                    result.videos.forEach(function(video, index) {
                                        expect(video).toEqual(jasmine.objectContaining(videoData[index]));
                                    });
                                });
                            });

                            describe('if it already has a page', function() {
                                beforeEach(function() {
                                    [success, failure].forEach(function(spy) {
                                        spy.calls.reset();
                                    });
                                    VideoDataService.getVideos.calls.reset();

                                    $rootScope.$apply(function() {
                                        result.page(3).then(success, failure);
                                    });
                                });

                                it('should not hit the search service again', function() {
                                    $httpBackend.verifyNoOutstandingRequest();
                                });

                                it('should not hit the VideoDataService again', function() {
                                    expect(VideoDataService.getVideos).not.toHaveBeenCalled();
                                });

                                it('should update to reflect the new page', function() {
                                    expect(success.calls.mostRecent().args[0]).toBe(result);
                                });

                                it('should reflect the new page', function() {
                                    expect(result.videos).toEqual(initialVideos);
                                    expect(result.before).toBe(30);
                                    expect(result.length).toBe(15);
                                    expect(result.total).toBe(403);
                                    expect(result.after).toBe(358);
                                    expect(result.position).toBe(3);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
