define(['minireel/services'], function(servicesModule) {
    'use strict';

    ddescribe('VideoDataService', function() {
        var $rootScope,
            $q,
            YouTubeDataService,
            VimeoDataService,
            DailymotionDataService,
            VideoDataService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                YouTubeDataService = $injector.get('YouTubeDataService');
                VimeoDataService = $injector.get('VimeoDataService');
                DailymotionDataService = $injector.get('DailymotionDataService');
                VideoDataService = $injector.get('VideoDataService');
            });
        });

        it('should exist', function() {
            expect(VideoDataService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('getVideos(config)', function() {
                /*
                 *  {
                 *      views: Number,
                 *      type: String
                 *  }
                 */

                var youtubeVideos, vimeoVideos, dailymotionVideos,
                    dailymotionGetSpies,
                    success, failure;

                beforeEach(function() {
                    dailymotionGetSpies = [];

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    youtubeVideos = [
                        /* jshint quotmark:false */
                        {
                            "kind": "youtube#video",
                            "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/hzP1v0vmzGrUC0vX0FKK6Lm9sWA\"",
                            "id": "-U3jrS-uhuo",
                            "statistics": {
                                "viewCount": "4209567",
                                "likeCount": "45964",
                                "dislikeCount": "875",
                                "favoriteCount": "0",
                                "commentCount": "11191"
                            }
                        },
                        {
                            "kind": "youtube#video",
                            "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/BsAmc9FTEVeSn3bh6XFZowELrYQ\"",
                            "id": "7IylzJNaW5k",
                            "statistics": {
                                "viewCount": "414038",
                                "likeCount": "3050",
                                "dislikeCount": "38",
                                "favoriteCount": "0",
                                "commentCount": "468"
                            }
                        }
                        /* jshint quotmark:single */
                    ];
                    vimeoVideos = {
                        '88504479': {
                            statsNumberOfPlays: 50909
                        },
                        '103437078': {
                            statsNumberOfPlays: 23719
                        }
                    };
                    dailymotionVideos = {
                        'x24lb1b': {
                            viewsTotal: 871
                        },
                        'x23clhv': {
                            viewsTotal: 36548
                        }
                    };

                    spyOn(YouTubeDataService.videos, 'list').and.returnValue($q.when(youtubeVideos));
                    spyOn(VimeoDataService, 'getVideo').and.callFake(function(id) {
                        var video = vimeoVideos[id];

                        return video ? $q.when(video) : $q.reject('NOT FOUND');
                    });
                    spyOn(DailymotionDataService, 'video').and.callFake(function(id) {
                        return {
                            get: dailymotionGetSpies[dailymotionGetSpies.push(
                                jasmine.createSpy('video().get()')
                                    .and.callFake(function() {
                                        var video = dailymotionVideos[id];

                                        return video ? $q.when(video) : $q.reject('NOT FOUND');
                                    })
                            ) - 1]
                        };
                    });

                    $rootScope.$apply(function() {
                        VideoDataService.getVideos([
                            ['youtube', '-U3jrS-uhuo'],
                            ['dailymotion', 'x23clhv'],
                            ['vimeo', '88504479'],
                            ['youtube', '7IylzJNaW5k'],
                            ['dailymotion', 'x24lb1b'],
                            ['vimeo', '103437078']
                        ]).then(success, failure);
                    });
                });

                it('should get the youtube video data', function() {
                    expect(YouTubeDataService.videos.list).toHaveBeenCalledWith({
                        part: ['statistics'],
                        id: ['-U3jrS-uhuo', '7IylzJNaW5k']
                    });
                });

                it('should get the vimeo video data', function() {
                    Object.keys(vimeoVideos).forEach(function(id) {
                        expect(VimeoDataService.getVideo).toHaveBeenCalledWith(id);
                    });
                });

                it('should get the dailymotion video data', function() {
                    ['x23clhv', 'x24lb1b'].forEach(function(id, index) {
                        expect(DailymotionDataService.video).toHaveBeenCalledWith(id);
                        expect(dailymotionGetSpies[index]).toHaveBeenCalledWith({
                            fields: ['viewsTotal']
                        });
                    });
                });

                it('should resolve to normalized data from each service', function() {
                    expect(success).toHaveBeenCalledWith([
                        {
                            service: 'youtube',
                            views: 4209567
                        },
                        {
                            service: 'dailymotion',
                            views: 36548
                        },
                        {
                            service: 'vimeo',
                            views: 50909
                        },
                        {
                            service: 'youtube',
                            views: 414038
                        },
                        {
                            service: 'dailymotion',
                            views: 871
                        },
                        {
                            service: 'vimeo',
                            views: 23719
                        }
                    ]);
                });
            });
        });
    });
});
