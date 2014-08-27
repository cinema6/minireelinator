define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('VimeoDataService', function() {
        var $rootScope,
            $httpBackend,
            VimeoDataService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');
                VimeoDataService = $injector.get('VimeoDataService');
            });
        });

        it('should exist', function() {
            expect(VimeoDataService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('getVideo(id)', function() {
                var response,
                    success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    response = [
                        /* jshint quotmark:false */
                        {
                            "id": 103437078,
                            "title": "My Big Brother",
                            "description": "A film by Jason Rayner debuting online exclusively in Cartoon Brew's 5th annual Student Animation Festival.<br />\r\n<br />\r\nVISIT Jason's website: http://www.jasonrayner.com<br />\r\n<br />\r\nTo learn more about the production of this film, visit:<br />\r\nhttp://www.cartoonbrew.com/brewtv/my-big-brother-102799.html",
                            "url": "https://vimeo.com/103437078",
                            "upload_date": "2014-08-14 11:28:14",
                            "thumbnail_small": "https://i.vimeocdn.com/video/485687128_100x75.jpg",
                            "thumbnail_medium": "https://i.vimeocdn.com/video/485687128_200x150.jpg",
                            "thumbnail_large": "https://i.vimeocdn.com/video/485687128_640.jpg",
                            "user_id": 2702070,
                            "user_name": "Jason Rayner",
                            "user_url": "https://vimeo.com/jasonrayner",
                            "user_portrait_small": "https://i.vimeocdn.com/portrait/7922041_30x30.jpg",
                            "user_portrait_medium": "https://i.vimeocdn.com/portrait/7922041_75x75.jpg",
                            "user_portrait_large": "https://i.vimeocdn.com/portrait/7922041_100x100.jpg",
                            "user_portrait_huge": "https://i.vimeocdn.com/portrait/7922041_300x300.jpg",
                            "stats_number_of_likes": 520,
                            "stats_number_of_plays": 9310,
                            "stats_number_of_comments": 17,
                            "duration": 162,
                            "width": 1280,
                            "height": 720,
                            "tags": "animation, student, short, brother, giant, cg, 3d, film, SCAD",
                            "embed_privacy": "anywhere"
                        }
                        /* jshint quotmark:single */
                    ];

                    $httpBackend.expectGET('//vimeo.com/api/v2/video/103437078.json')
                        .respond(200, response);

                    $rootScope.$apply(function() {
                        VimeoDataService.getVideo('103437078').then(success, failure);
                    });

                    $httpBackend.flush();
                });

                it('should return the single item with the snake_case converted to camelCase', function() {
                    expect(success).toHaveBeenCalledWith({
                        id: 103437078,
                        title: 'My Big Brother',
                        description: 'A film by Jason Rayner debuting online exclusively in Cartoon Brew\'s 5th annual Student Animation Festival.<br />\r\n<br />\r\nVISIT Jason\'s website: http://www.jasonrayner.com<br />\r\n<br />\r\nTo learn more about the production of this film, visit:<br />\r\nhttp://www.cartoonbrew.com/brewtv/my-big-brother-102799.html',
                        url: 'https://vimeo.com/103437078',
                        uploadDate: '2014-08-14 11:28:14',
                        thumbnailSmall: 'https://i.vimeocdn.com/video/485687128_100x75.jpg',
                        thumbnailMedium: 'https://i.vimeocdn.com/video/485687128_200x150.jpg',
                        thumbnailLarge: 'https://i.vimeocdn.com/video/485687128_640.jpg',
                        userId: 2702070,
                        userName: 'Jason Rayner',
                        userUrl: 'https://vimeo.com/jasonrayner',
                        userPortraitSmall: 'https://i.vimeocdn.com/portrait/7922041_30x30.jpg',
                        userPortraitMedium: 'https://i.vimeocdn.com/portrait/7922041_75x75.jpg',
                        userPortraitLarge: 'https://i.vimeocdn.com/portrait/7922041_100x100.jpg',
                        userPortraitHuge: 'https://i.vimeocdn.com/portrait/7922041_300x300.jpg',
                        statsNumberOfLikes: 520,
                        statsNumberOfPlays: 9310,
                        statsNumberOfComments: 17,
                        duration: 162,
                        width: 1280,
                        height: 720,
                        tags: ['animation', 'student', 'short', 'brother', 'giant', 'cg', '3d', 'film', 'SCAD'],
                        embedPrivacy: 'anywhere'
                    });
                });
            });
        });
    });
});
