define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('YouTubeDataService', function() {
        var YouTubeDataService,
            $httpBackend;

        var apiKey = 'AIzaSyCmHsFIiXhjAuHM_piTxSHPsQgvZwueLlk';

        beforeEach(function() {
            module(servicesModule.name);
            module(function(YouTubeDataServiceProvider) {
                YouTubeDataServiceProvider.apiKey(apiKey);
            });

            inject(function($injector) {
                YouTubeDataService = $injector.get('YouTubeDataService');
                $httpBackend = $injector.get('$httpBackend');
            });
        });

        afterAll(function() {
            YouTubeDataService = null;
            $httpBackend = null;
        });

        it('should exist', function() {
            expect(YouTubeDataService).toEqual(jasmine.any(Object));
        });

        describe('videos', function() {
            it('should exist', function() {
                expect(YouTubeDataService.videos).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success');
                    failure = jasmine.createSpy('failure');
                });

                describe('list(config)', function() {
                    describe('with an array id', function() {
                        var response;

                        beforeEach(function() {
                            /* jshint quotmark:false */
                            response = {
                                "kind": "youtube#videoListResponse",
                                "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/9ysUGIwA2ijAY7HMmh49vOeveug\"",
                                "pageInfo": {
                                    "totalResults": 1,
                                    "resultsPerPage": 1
                                },
                                "items": [
                                    {
                                        "kind": "youtube#video",
                                        "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/2anxyKf5AvY-GWe12EwFluQsctQ\"",
                                        "id": "MYC-waukYWo",
                                        "snippet": {
                                            "publishedAt": "2012-11-21T08:19:59.000Z",
                                            "channelId": "UC67f2Qf7FYhtoUIF4Sf29cA",
                                            "title": "\"MORE TWILIGHT\" — A Bad Lip Reading of The Twilight Saga: New Moon",
                                            "description": "Bella... Jacob... Edward... and soul food. \nLike on Facebook! http://www.facebook.com/badlipreading \nFollow on Twitter! http://twitter.com/badlipreading",
                                            "thumbnails": {
                                                "default": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/default.jpg",
                                                    "width": 120,
                                                    "height": 90
                                                },
                                                "medium": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/mqdefault.jpg",
                                                    "width": 320,
                                                    "height": 180
                                                },
                                                "high": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/hqdefault.jpg",
                                                    "width": 480,
                                                    "height": 360
                                                },
                                                "standard": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/sddefault.jpg",
                                                    "width": 640,
                                                    "height": 480
                                                }
                                            },
                                            "channelTitle": "Bad Lip Reading",
                                            "categoryId": "23",
                                            "liveBroadcastContent": "none"
                                        },
                                        "contentDetails": {
                                            "duration": "PT3M57S",
                                            "dimension": "2d",
                                            "definition": "sd",
                                            "caption": false,
                                            "licensedContent": true
                                        }
                                    }
                                ]
                            };
                            /* jshint quotmark:single */

                            $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet,contentDetails')
                                .respond(200, response);

                            YouTubeDataService.videos.list({
                                part: ['snippet', 'contentDetails'],
                                id: ['MYC-waukYWo']
                            }).then(success, failure);

                            $httpBackend.flush();
                        });

                        it('should return an array response', function() {
                            response.items[0].contentDetails.duration = 237;
                            expect(success).toHaveBeenCalledWith(response.items);
                        });

                        describe('if the duration string is missing units', function() {
                            beforeEach(function() {
                                success.calls.reset();

                                response.items[0].contentDetails.duration = 'PT3M';
                                $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet,contentDetails')
                                    .respond(200, response);

                                YouTubeDataService.videos.list({
                                    part: ['snippet', 'contentDetails'],
                                    id: 'MYC-waukYWo'
                                }).then(success, failure);

                                $httpBackend.flush();
                            });

                            it('should still work', function() {
                                var video = success.calls.mostRecent().args[0];

                                expect(video.contentDetails.duration).toBe(180);
                            });
                        });

                        describe('if there are no results', function() {
                            beforeEach(function() {
                                /* jshint quotmark:false */
                                response = {
                                    "kind": "youtube#videoListResponse",
                                    "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/9ysUGIwA2ijAY7HMmh49vOeveug\"",
                                    "pageInfo": {
                                        "totalResults": 1,
                                        "resultsPerPage": 1
                                    },
                                    "items": []
                                };
                                /* jshint quotmark:single */

                                $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet,contentDetails')
                                    .respond(200, response);

                                YouTubeDataService.videos.list({
                                    part: ['snippet', 'contentDetails'],
                                    id: ['MYC-waukYWo']
                                }).then(success, failure);

                                $httpBackend.flush();
                            });

                            it('should succeed with no results', function() {
                                expect(success).toHaveBeenCalledWith([]);
                            });
                        });
                    });

                    describe('with a string id', function() {
                        var response;

                        beforeEach(function() {
                            /* jshint quotmark:false */
                            response = {
                                "kind": "youtube#videoListResponse",
                                "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/9ysUGIwA2ijAY7HMmh49vOeveug\"",
                                "pageInfo": {
                                    "totalResults": 1,
                                    "resultsPerPage": 1
                                },
                                "items": [
                                    {
                                        "kind": "youtube#video",
                                        "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/2anxyKf5AvY-GWe12EwFluQsctQ\"",
                                        "id": "MYC-waukYWo",
                                        "snippet": {
                                            "publishedAt": "2012-11-21T08:19:59.000Z",
                                            "channelId": "UC67f2Qf7FYhtoUIF4Sf29cA",
                                            "title": "\"MORE TWILIGHT\" — A Bad Lip Reading of The Twilight Saga: New Moon",
                                            "description": "Bella... Jacob... Edward... and soul food. \nLike on Facebook! http://www.facebook.com/badlipreading \nFollow on Twitter! http://twitter.com/badlipreading",
                                            "thumbnails": {
                                                "default": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/default.jpg",
                                                    "width": 120,
                                                    "height": 90
                                                },
                                                "medium": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/mqdefault.jpg",
                                                    "width": 320,
                                                    "height": 180
                                                },
                                                "high": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/hqdefault.jpg",
                                                    "width": 480,
                                                    "height": 360
                                                },
                                                "standard": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/sddefault.jpg",
                                                    "width": 640,
                                                    "height": 480
                                                }
                                            },
                                            "channelTitle": "Bad Lip Reading",
                                            "categoryId": "23",
                                            "liveBroadcastContent": "none"
                                        }
                                    }
                                ]
                            };
                            /* jshint quotmark:single */

                            $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet')
                                .respond(200, response);

                            YouTubeDataService.videos.list({
                                part: ['snippet'],
                                id: 'MYC-waukYWo'
                            }).then(success, failure);

                            $httpBackend.flush();
                        });

                        it('should return a singular item', function() {
                            expect(success).toHaveBeenCalledWith(response.items[0]);
                        });

                        describe('if there are no results', function() {
                            beforeEach(function() {
                            /* jshint quotmark:false */
                                response = {
                                    "kind": "youtube#videoListResponse",
                                    "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/9ysUGIwA2ijAY7HMmh49vOeveug\"",
                                    "pageInfo": {
                                        "totalResults": 0,
                                        "resultsPerPage": 0
                                    },
                                    "items": []
                                };
                                /* jshint quotmark:single */

                                $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?id=nrjp6e04dZ8&key=' + apiKey + '&part=snippet')
                                    .respond(200, response);

                                YouTubeDataService.videos.list({
                                    part: ['snippet'],
                                    id: 'nrjp6e04dZ8'
                                }).then(success, failure);

                                $httpBackend.flush();
                            });

                            it('should reject the promise', function() {
                                expect(failure).toHaveBeenCalledWith({
                                    code: 404,
                                    message: 'No video was found.'
                                });
                            });
                        });
                    });

                    describe('with no parts specified', function() {
                        var response;

                        beforeEach(function() {
                            /* jshint quotmark:false */
                            response = {
                                "kind": "youtube#videoListResponse",
                                "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/9ysUGIwA2ijAY7HMmh49vOeveug\"",
                                "pageInfo": {
                                    "totalResults": 1,
                                    "resultsPerPage": 1
                                },
                                "items": [
                                    {
                                        "kind": "youtube#video",
                                        "etag": "\"gMjDJfS6nsym0T-NKCXALC_u_rM/2anxyKf5AvY-GWe12EwFluQsctQ\"",
                                        "id": "MYC-waukYWo",
                                        "snippet": {
                                            "publishedAt": "2012-11-21T08:19:59.000Z",
                                            "channelId": "UC67f2Qf7FYhtoUIF4Sf29cA",
                                            "title": "\"MORE TWILIGHT\" — A Bad Lip Reading of The Twilight Saga: New Moon",
                                            "description": "Bella... Jacob... Edward... and soul food. \nLike on Facebook! http://www.facebook.com/badlipreading \nFollow on Twitter! http://twitter.com/badlipreading",
                                            "thumbnails": {
                                                "default": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/default.jpg",
                                                    "width": 120,
                                                    "height": 90
                                                },
                                                "medium": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/mqdefault.jpg",
                                                    "width": 320,
                                                    "height": 180
                                                },
                                                "high": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/hqdefault.jpg",
                                                    "width": 480,
                                                    "height": 360
                                                },
                                                "standard": {
                                                    "url": "https://i.ytimg.com/vi/MYC-waukYWo/sddefault.jpg",
                                                    "width": 640,
                                                    "height": 480
                                                }
                                            },
                                            "channelTitle": "Bad Lip Reading",
                                            "categoryId": "23",
                                            "liveBroadcastContent": "none"
                                        }
                                    }
                                ]
                            };
                            /* jshint quotmark:single */

                            $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet')
                                .respond(200, response);

                            YouTubeDataService.videos.list({
                                id: 'MYC-waukYWo'
                            }).then(success, failure);

                            $httpBackend.flush();
                        });

                        it('should succeed', function() {
                            expect(success).toHaveBeenCalledWith(response.items[0]);
                        });
                    });
                });
            });
        });
    });
});
