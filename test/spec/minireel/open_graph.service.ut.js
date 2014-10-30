define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('OpenGraphService', function() {
        var $rootScope,
            $q,
            YQLService,
            OpenGraphService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                YQLService = $injector.get('YQLService');

                OpenGraphService = $injector.get('OpenGraphService');
            });
        });

        it('should exist', function() {
            expect(OpenGraphService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('getData(page)', function() {
                var yqlDeferred,
                    success, failure;

                function resolve(value) {
                    $rootScope.$apply(function() {
                        yqlDeferred.resolve(value);
                    });
                }

                beforeEach(function() {
                    yqlDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(YQLService, 'query').and.returnValue(yqlDeferred.promise);

                    $rootScope.$apply(function() {
                        OpenGraphService.getData('https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html')
                            .then(success, failure);
                    });
                });

                it('should query YQL', function() {
                    expect(YQLService.query).toHaveBeenCalledWith('select * from html where url="https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html" and xpath="//head//meta" and compat="html5"');
                });

                describe('if there are no meta tags on the page', function() {
                    beforeEach(function() {
                        resolve(null);
                    });

                    it('should reject with an error', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.any(Error));
                    });
                });

                describe('if there are no OpenGraph meta tags on the page', function() {
                    beforeEach(function() {
                        resolve({
                            meta: [
                                {
                                    content: 'IE=Edge',
                                    'http-equiv': 'X-UA-Compatible'
                                },
                                {
                                    charset: 'UTF-8'
                                },
                                {
                                    content: 'player',
                                    name: 'twitter:card'
                                },
                                {
                                    content: 'Can you handle the ultimate driving course? | A Broad Abroad - Yahoo Screen',
                                    name: 'twitter:title'
                                },
                                {
                                    content: 'Paula Froelich of Yahoo Travel gets the road lesson of her life from Adrenalin Driving Academy, who teach advanced driving tactics to police and the military.',
                                    name: 'twitter:description'
                                },
                                {
                                    content: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html?format=embed',
                                    name: 'twitter:player'
                                },
                                {
                                    content: '624',
                                    name: 'twitter:player:width'
                                },
                                {
                                    content: '351',
                                    name: 'twitter:player:height'
                                },
                                {
                                    content: 'https://s.yimg.com/lo/api/res/1.2/D.ZJ5PttbhEjW0e7XEgRgw--/YXBwaWQ9eXZpZGVvZmVlZHM7Zmk9ZmlsbDtoPTM2MDt3PTY0MA--/http://media.zenfs.com/en-US/video/video.pd2upload.com/video.abroadabroad.com@f32d1a97-346a-39ed-843c-ba41d1a55ecb_FULL.jpg',
                                    name: 'twitter:image'
                                },
                                {
                                    content: 'Yahoo Screen',
                                    name: 'application-name'
                                },
                                {
                                    content: '#6e329d',
                                    name: 'msapplication-TileColor'
                                },
                                {
                                    content: '423db4d61a29a437435ff00f86aa220e',
                                    name: 'p:domain_verify'
                                },
                                {
                                    content: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html',
                                    itemprop: 'url'
                                },
                                {
                                    content: 'https://s.yimg.com/lo/api/res/1.2/D.ZJ5PttbhEjW0e7XEgRgw--/YXBwaWQ9eXZpZGVvZmVlZHM7Zmk9ZmlsbDtoPTM2MDt3PTY0MA--/http://media.zenfs.com/en-US/video/video.pd2upload.com/video.abroadabroad.com@f32d1a97-346a-39ed-843c-ba41d1a55ecb_FULL.jpg',
                                    itemprop: 'thumbnailUrl'
                                },
                                {
                                    content: 'PY0M0D0TH0M2S2',
                                    itemprop: 'duration'
                                },
                                {
                                    content: '2014-09-11T10:00:38T+00:0011',
                                    itemprop: 'datePublished'
                                },
                                {
                                    content: '2014-09-11T09:55:57T+00:0011',
                                    itemprop: 'uploadDate'
                                },
                                {
                                    content: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html?format=embed',
                                    itemprop: 'embedURL'
                                }
                            ]
                        });
                    });

                    it('should reject with an error', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.any(Error));
                    });
                });

                describe('if there are open graph tags', function() {
                    beforeEach(function() {
                        resolve({
                            meta: [
                                {
                                    content: 'IE=Edge',
                                    'http-equiv': 'X-UA-Compatible'
                                },
                                {
                                    charset: 'UTF-8'
                                },
                                {
                                    content: 'Can you handle the ultimate driving course? | A Broad Abroad - Yahoo Screen',
                                    property: 'og:title'
                                },
                                {
                                    content: 'Paula Froelich of Yahoo Travel gets the road lesson of her life from Adrenalin Driving Academy, who teach advanced driving tactics to police and the military.',
                                    'name': 'description'
                                },
                                {
                                    content: 'Paula Froelich of Yahoo Travel gets the road lesson of her life from Adrenalin Driving Academy, who teach advanced driving tactics to police and the military.',
                                    property: 'og:description'
                                },
                                {
                                    content: 'video.other',
                                    property: 'og:type'
                                },
                                {
                                    content: 'Yahoo Screen',
                                    property: 'og:site_name'
                                },
                                {
                                    content: 'https://s.yimg.com/lo/api/res/1.2/D.ZJ5PttbhEjW0e7XEgRgw--/YXBwaWQ9eXZpZGVvZmVlZHM7Zmk9ZmlsbDtoPTM2MDt3PTY0MA--/http://media.zenfs.com/en-US/video/video.pd2upload.com/video.abroadabroad.com@f32d1a97-346a-39ed-843c-ba41d1a55ecb_FULL.jpg',
                                    property: 'og:image'
                                },
                                {
                                    content: 'image/jpeg',
                                    property: 'og:image:type'
                                },
                                {
                                    content: '640',
                                    property: 'og:image:width'
                                },
                                {
                                    content: '360',
                                    property: 'og:image:height'
                                },
                                {
                                    content: 'second-image.jpg',
                                    property: 'og:image'
                                },
                                {
                                    content: '800',
                                    property: 'og:image:width'
                                },
                                {
                                    content: '600',
                                    property: 'og:image:height'
                                },
                                {
                                    content: 'player',
                                    name: 'twitter:card'
                                },
                                {
                                    content: 'Can you handle the ultimate driving course? | A Broad Abroad - Yahoo Screen',
                                    name: 'twitter:title'
                                },
                                {
                                    content: 'Paula Froelich of Yahoo Travel gets the road lesson of her life from Adrenalin Driving Academy, who teach advanced driving tactics to police and the military.',
                                    name: 'twitter:description'
                                },
                                {
                                    content: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html?format=embed',
                                    name: 'twitter:player'
                                },
                                {
                                    content: '624',
                                    name: 'twitter:player:width'
                                },
                                {
                                    content: '351',
                                    name: 'twitter:player:height'
                                },
                                {
                                    content: 'https://s.yimg.com/lo/api/res/1.2/D.ZJ5PttbhEjW0e7XEgRgw--/YXBwaWQ9eXZpZGVvZmVlZHM7Zmk9ZmlsbDtoPTM2MDt3PTY0MA--/http://media.zenfs.com/en-US/video/video.pd2upload.com/video.abroadabroad.com@f32d1a97-346a-39ed-843c-ba41d1a55ecb_FULL.jpg',
                                    name: 'twitter:image'
                                },
                                {
                                    content: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html',
                                    property: 'og:url'
                                },
                                {
                                    content: 'Yahoo Screen',
                                    name: 'application-name'
                                },
                                {
                                    content: '#6e329d',
                                    name: 'msapplication-TileColor'
                                },
                                {
                                    content: '423db4d61a29a437435ff00f86aa220e',
                                    name: 'p:domain_verify'
                                },
                                {
                                    content: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html',
                                    itemprop: 'url'
                                },
                                {
                                    content: 'https://s.yimg.com/lo/api/res/1.2/D.ZJ5PttbhEjW0e7XEgRgw--/YXBwaWQ9eXZpZGVvZmVlZHM7Zmk9ZmlsbDtoPTM2MDt3PTY0MA--/http://media.zenfs.com/en-US/video/video.pd2upload.com/video.abroadabroad.com@f32d1a97-346a-39ed-843c-ba41d1a55ecb_FULL.jpg',
                                    itemprop: 'thumbnailUrl'
                                },
                                {
                                    content: 'PY0M0D0TH0M2S2',
                                    itemprop: 'duration'
                                },
                                {
                                    content: '2014-09-11T10:00:38T+00:0011',
                                    itemprop: 'datePublished'
                                },
                                {
                                    content: '2014-09-11T09:55:57T+00:0011',
                                    itemprop: 'uploadDate'
                                },
                                {
                                    content: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html?format=embed',
                                    itemprop: 'embedURL'
                                },
                                {
                                    content: 'video/mp4',
                                    property: 'og:video:type'
                                },
                                {
                                    content: 'video.mp4',
                                    property: 'og:video'
                                }
                            ]
                        });
                    });

                    it('should return open graph data', function() {
                        expect(success).toHaveBeenCalledWith({
                            title: {
                                value: 'Can you handle the ultimate driving course? | A Broad Abroad - Yahoo Screen'
                            },
                            description: {
                                value: 'Paula Froelich of Yahoo Travel gets the road lesson of her life from Adrenalin Driving Academy, who teach advanced driving tactics to police and the military.'
                            },
                            type: {
                                value: 'video.other'
                            },
                            siteName: {
                                value: 'Yahoo Screen'
                            },
                            images: [
                                {
                                    value: 'https://s.yimg.com/lo/api/res/1.2/D.ZJ5PttbhEjW0e7XEgRgw--/YXBwaWQ9eXZpZGVvZmVlZHM7Zmk9ZmlsbDtoPTM2MDt3PTY0MA--/http://media.zenfs.com/en-US/video/video.pd2upload.com/video.abroadabroad.com@f32d1a97-346a-39ed-843c-ba41d1a55ecb_FULL.jpg',
                                    type: 'image/jpeg',
                                    width: 640,
                                    height: 360
                                },
                                {
                                    value: 'second-image.jpg',
                                    width: 800,
                                    height: 600
                                }
                            ],
                            url: {
                                value: 'https://screen.yahoo.com/handle-ultimate-driving-course-220038490.html'
                            },
                            videos: [
                                {
                                    value: 'video.mp4',
                                    type: 'video/mp4'
                                }
                            ]
                        });
                    });
                });
            });
        });
    });
});
