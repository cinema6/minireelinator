(function() {
    'use strict';

    define(['minireel/services', 'c6_defines'], function(servicesModule, c6Defines) {
        describe('ImageService', function() {
            var InstagramService, $q, $http, $httpBackend, $rootScope;
            var success, failure;
            var mocks = { };

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    InstagramService        = $injector.get('InstagramService');
                    $q                      = $injector.get('$q');
                    $http                   = $injector.get('$http');
                    $httpBackend            = $injector.get('$httpBackend');
                    $rootScope              = $injector.get('$rootScope');
                });

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                mocks.apiMedia = {
                    image: $q.when({
                        type: 'image',
                        users_in_photo: [],
                        filter: 'Walden',
                        tags: [],
                        comments: {
                            data: [],
                            count: '3'
                        },
                        caption: {
                            text: 'fancy image'
                        },
                        likes: {
                            data: [],
                            count: '42'
                        },
                        link: 'www.instagram.com/p/abc123',
                        user: {
                            username: 'agent007',
                            full_name: 'James Bond',
                            profile_picture: 'www.instagram.com/swag.jpg',
                            id: '7'
                        },
                        created_time: '1438092576',
                        images: {
                            standard_resolution: {
                                url: 'www.instagram.com/abc123.jpg'
                            }
                        },
                        location: null
                    }),
                    video: $q.when({
                        type: 'video',
                        users_in_photo: [],
                        filter: 'Walden',
                        tags: [],
                        comments: {
                            data: [],
                            count: '3'
                        },
                        caption: {
                            text: 'fancy video'
                        },
                        likes: {
                            data: [],
                            count: '42'
                        },
                        link: 'www.instagram.com/p/abc123',
                        user: {
                            username: 'agent007',
                            full_name: 'James Bond',
                            profile_picture: 'www.instagram.com/swag.jpg',
                            id: '7'
                        },
                        created_time: '1438092576',
                        images: {
                            standard_resolution: {
                                url: 'www.instagram.com/abc123.jpg'
                            }
                        },
                        videos: {
                            standard_resolution: {
                                url: 'www.instagram.com/abc123.mp4'
                            }
                        },
                        location: null
                    })
                };

                mocks.apiUser = {
                    james: $q.when({
                        id: '7',
                        username: 'agent007',
                        full_name: 'James Bond',
                        profile_picture: 'www.instagram.com/swag.jpg',
                        bio: 'classified',
                        website: 'something.com',
                        counts: {
                            media: '24',
                            follows: '7',
                            followed_by: '78623'
                        }
                    })
                };

            });

            it('should exist', function() {
                expect(InstagramService).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {

                describe('methods', function() {

                    describe('apiMedia', function() {
                        beforeEach(function() {
                            spyOn(InstagramService._private, 'apiRequest');
                        });

                        it('should call apiRequest with teh media endpoint', function() {
                            var input = 'abc123';
                            InstagramService._private.apiMedia(input);
                            expect(InstagramService._private.apiRequest).toHaveBeenCalledWith('/media/shortcode/abc123');
                        });
                    });

                    describe('apiUser', function() {

                        beforeEach(function() {
                            spyOn(InstagramService._private, 'apiRequest');
                        });

                        it('should call apiRequest with the user endpoint', function() {
                            var input = '123';
                            InstagramService._private.apiUser(input);
                            expect(InstagramService._private.apiRequest).toHaveBeenCalledWith('/users/123');
                        });
                    });

                    describe('apiRequest', function() {

                        beforeEach(function() {
                            c6Defines.kInstagramDataApiKey = 'key123';
                            spyOn($http, 'jsonp').and.returnValue($q.when());
                        });

                        it('should make a valid Instagram jsonp request', function() {
                            var input = '/some_endpoint';
                            InstagramService._private.apiRequest(input);
                            expect($http.jsonp).toHaveBeenCalledWith('https://api.instagram.com/v1/some_endpoint' +
                                '?client_id=key123&callback=JSON_CALLBACK', {cache: true});
                        });

                        describe('on success', function() {

                            beforeEach(function() {
                                $http.jsonp.and.returnValue($q.when({
                                    status: 200,
                                    data: {
                                        meta: {
                                            code: 200
                                        },
                                        data: {
                                            prop: 'value',
                                            foo: 'bar'
                                        }
                                    }
                                }));
                            });

                            it('should return the data contained in the response', function() {
                                var input = '/some_endpoint';
                                var expectedOutput = {
                                    prop: 'value',
                                    foo: 'bar'
                                };
                                InstagramService._private.apiRequest(input).then(success, failure);
                                $rootScope.$apply();
                                expect(success).toHaveBeenCalledWith(expectedOutput);
                                expect(failure).not.toHaveBeenCalled();
                            });
                        });

                        describe('when the request succeeds with an error code', function() {
                            beforeEach(function() {
                                $http.jsonp.and.returnValue($q.when({
                                    status: 200,
                                    data: {
                                        meta: {
                                            code: 500
                                        }
                                    }
                                }));
                            });

                            it('should reject the promise', function() {
                                InstagramService._private.apiRequest('').then(success, failure);
                                $rootScope.$apply();
                                expect(success).not.toHaveBeenCalled();
                                expect(failure).toHaveBeenCalledWith('There was a problem retrieving the media from Instagram.');
                            });
                        });

                        describe('when the jsonp request fails', function() {

                            beforeEach(function() {
                                $http.jsonp.and.returnValue($q.reject());
                            });

                            it('should reject the promise', function() {
                                InstagramService._private.apiRequest('').then(success, failure);
                                $rootScope.$apply();
                                expect(success).not.toHaveBeenCalled();
                                expect(failure).toHaveBeenCalledWith('There was a problem contacting Instagram.');
                            });
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('methods', function() {

                    beforeEach(function() {
                        spyOn(InstagramService._private, 'apiMedia');
                        spyOn(InstagramService._private, 'apiUser');
                    });

                    describe('dataFromUrl(url)', function() {
                        it('should parse valid instagram urls', function() {
                            var input = [
                                'https://www.instagram.com/p/abc123',
                                'www.instagram.com/p/abc123',
                                'www.instagram.com/p/abc123',
                                'http://www.instagram.com/p/abc123/'
                            ];
                            var expectedOutput = input.map(function() {
                                return {
                                    id: 'abc123'
                                };
                            });
                            var output = input.map(function(url) {
                                return InstagramService.dataFromUrl(url);
                            });
                            expect(output).toEqual(expectedOutput);
                        });

                        it('should not parse invalid instagram urls', function() {
                            var input = [
                                'https://www.not-instagram.com/p/abc123',
                                'https://www.instagram.com/abc123'
                            ];
                            var expectedOutput = input.map(function() {
                                return {
                                    id: null
                                };
                            });
                            var output = input.map(function(url) {
                                return InstagramService.dataFromUrl(url);
                            });
                            expect(output).toEqual(expectedOutput);
                        });
                    });

                    describe('getCardInfo(id)', function() {
                        describe('when the media request succeeds', function() {
                            beforeEach(function() {
                                InstagramService._private.apiMedia.and.returnValue(mocks.apiMedia.image);
                            });

                            describe('when the user request succeeds', function() {

                                beforeEach(function() {
                                    InstagramService._private.apiUser.and.returnValue(mocks.apiUser.james);
                                });

                                it('should return info necessary to construct the player card', function() {
                                    var input = 'abc123';
                                    var expectedOutput = {
                                        type: 'image',
                                        src: 'www.instagram.com/abc123.jpg',
                                        href: 'www.instagram.com/p/abc123',
                                        likes: '42',
                                        date: '1438092576',
                                        caption: 'fancy image',
                                        comments: '3',
                                        user: {
                                            fullname: 'James Bond',
                                            picture: 'www.instagram.com/swag.jpg',
                                            username: 'agent007',
                                            follow: 'https://instagram.com/accounts/login/?next=%2Fp%2Fabc123%2F&source=follow',
                                            bio: 'classified',
                                            website: 'something.com',
                                            posts: '24',
                                            followers: '78623',
                                            following: '7'
                                        }
                                    };
                                    InstagramService.getCardInfo(input).then(success, failure);
                                    $rootScope.$apply();
                                    expect(success).toHaveBeenCalledWith(expectedOutput);
                                    expect(failure).not.toHaveBeenCalled();
                                });
                            });

                            describe('when the user request fails', function() {
                                beforeEach(function() {
                                    InstagramService._private.apiUser.and.returnValue(
                                        $q.reject('some error')
                                    );
                                });

                                it('should reject the promise', function() {
                                    var input = 'abc123';
                                    InstagramService.getCardInfo(input).then(success, failure);
                                    $rootScope.$apply();
                                    expect(success).not.toHaveBeenCalled();
                                    expect(failure).toHaveBeenCalledWith('some error');
                                });
                            });

                        });

                        describe('when the media request fails', function() {

                            beforeEach(function() {
                                InstagramService._private.apiMedia.and.returnValue(
                                    $q.reject('some error')
                                );
                            });

                            it('should reject the promise', function() {
                                var input = 'abc123';
                                InstagramService.getCardInfo(input).then(success, failure);
                                $rootScope.$apply();
                                expect(success).not.toHaveBeenCalled();
                                expect(failure).toHaveBeenCalledWith('some error');
                            });
                        });
                    });

                    describe('getEmbedInfo(id)', function() {

                        describe('for images', function() {

                            beforeEach(function() {
                                InstagramService._private.apiMedia.and.returnValue(mocks.apiMedia.image);
                            });

                            it('should return information neccessary to embed the image', function() {
                                var input = 'abc123';
                                var expectedOutput = {
                                    type: 'image',
                                    src: 'www.instagram.com/abc123.jpg'
                                };
                                InstagramService.getEmbedInfo(input).then(success, failure);
                                $rootScope.$apply();
                                expect(success).toHaveBeenCalledWith(expectedOutput);
                                expect(failure).not.toHaveBeenCalled();
                            });
                        });

                        describe('for videos', function() {

                            beforeEach(function() {
                                InstagramService._private.apiMedia.and.returnValue(mocks.apiMedia.video);
                            });

                            it('should return information neccessary to embed the video', function() {
                                var input = 'abc123';
                                var expectedOutput = {
                                    type: 'video',
                                    src: 'www.instagram.com/abc123.mp4'
                                };
                                InstagramService.getEmbedInfo(input).then(success, failure);
                                $rootScope.$apply();
                                expect(success).toHaveBeenCalledWith(expectedOutput);
                                expect(failure).not.toHaveBeenCalled();
                            });
                        });
                    });

                    describe('urlFromData(id)', function() {
                        it('should construct a valid instagram url', function() {
                            var input = 'abc123';
                            var expectedOutput = 'https://instagram.com/p/abc123';
                            var output = InstagramService.urlFromData(input);
                            expect(output).toEqual(expectedOutput);
                        });

                        it('should return null when passed a falsy id', function() {
                            var input = '';
                            var expectedOutput = null;
                            var output = InstagramService.urlFromData(input);
                            expect(output).toEqual(expectedOutput);
                        });
                    });
                });
            });
        });
    });
}());
