define(['minireel/services'], function(servicesModule) {
    'use strict';

    ddescribe('YouTubeDataService', function() {
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

                            $httpBackend.expectGET('//www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet,contentDetails')
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
                    });

                    describe('with a string id', function() {
                        var response;

                        beforeEach(function() {
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

                            $httpBackend.expectGET('//www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet')
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
                    });

                    describe('with no parts specified', function() {
                        var response;

                        beforeEach(function() {
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

                            $httpBackend.expectGET('//www.googleapis.com/youtube/v3/videos?id=MYC-waukYWo&key=' + apiKey + '&part=snippet')
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
