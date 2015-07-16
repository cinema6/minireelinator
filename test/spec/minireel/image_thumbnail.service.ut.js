(function() {
    'use strict';

    define(['minireel/services', 'c6_defines'], function(servicesModule, c6Defines) {
        describe('ImageThumbnailService', function() {
            var $rootScope,
                $q,
                OpenGraphService,
                ImageService,
                ImageThumbnailService,
                CollateralUploadService,
                success, failure;

            var $httpBackend;

            var _private;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    OpenGraphService = $injector.get('OpenGraphService');
                    ImageService = $injector.get('ImageService');
                    $httpBackend = $injector.get('$httpBackend');
                    ImageThumbnailService = $injector.get('ImageThumbnailService');
                    CollateralUploadService = $injector.get('CollateralUploadService');
                    _private = ImageThumbnailService._private;
                });

                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');
            });

            it('should exist', function() {
                expect(ImageThumbnailService).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {
                describe('methods', function() {
                    describe('fetchFlickrThumbs(data)', function() {

                        describe('on success', function() {
                            describe('if the \'Thumbnail\' label exists in flickr\'s response', function() {
                                beforeEach(function() {
                                    c6Defines.kFlickrDataApiKey = 'abc123';
                                    var request = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=abc123&photo_id=12345&jsoncallback=JSON_CALLBACK'
                                    $httpBackend.whenJSONP(request).respond({
                                        sizes: {
                                            size: [
                                                {
                                                    label: 'first size',
                                                    source: 'www.site.com/tiny.jpg'
                                                },
                                                {
                                                    label: 'Thumbnail',
                                                    source: 'www.site.com/small.jpg'
                                                },
                                                {
                                                    label: 'larger',
                                                    source: 'www.site.com/large.jpg'
                                                }
                                            ]
                                        }
                                    });
                                });

                                it('should return the image with the \'Thumbnail\' label and its successor', function() {
                                    var expectedOutput = {
                                        small: 'www.site.com/small.jpg',
                                        large: 'www.site.com/large.jpg'
                                    };
                                    $rootScope.$apply(function() {
                                        ImageThumbnailService._private.fetchFlickrThumbs('12345').then(success, failure);
                                    });
                                    $httpBackend.flush();
                                    expect(success).toHaveBeenCalledWith(expectedOutput);
                                    expect(failure).not.toHaveBeenCalled();
                                });
                            });

                            describe('if the \'Thumbnail\' label does not exist in flickr\'s response', function() {
                                beforeEach(function() {
                                    c6Defines.kFlickrDataApiKey = 'abc123';
                                    var request = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=abc123&photo_id=12345&jsoncallback=JSON_CALLBACK'
                                    $httpBackend.whenJSONP(request).respond({
                                        sizes: {
                                            size: [
                                                {
                                                    label: 'first size',
                                                    source: 'www.site.com/small.jpg'
                                                },
                                                {
                                                    label: 'second size',
                                                    source: 'www.site.com/large.jpg'
                                                }
                                            ]
                                        }
                                    });
                                });

                                it('should return the first two image sizes as thumbs', function() {
                                    var expectedOutput = {
                                        small: 'www.site.com/small.jpg',
                                        large: 'www.site.com/large.jpg'
                                    };
                                    $rootScope.$apply(function() {
                                        ImageThumbnailService._private.fetchFlickrThumbs('12345').then(success, failure);
                                    });
                                    $httpBackend.flush();
                                    expect(success).toHaveBeenCalledWith(expectedOutput);
                                    expect(failure).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe('on error', function() {
                            describe('when flickr\'s response is not recognized', function() {
                                beforeEach(function() {
                                    c6Defines.kFlickrDataApiKey = 'abc123';
                                    var request = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=abc123&photo_id=12345&jsoncallback=JSON_CALLBACK'
                                    $httpBackend.whenJSONP(request).respond({
                                        response: "unrecognized response"
                                    });
                                });

                                it('should reject the promise', function() {
                                    $rootScope.$apply(function() {
                                        ImageThumbnailService._private.fetchFlickrThumbs('12345').then(success, failure);
                                    });
                                    $httpBackend.flush();
                                    expect(success).not.toHaveBeenCalled();
                                    expect(failure).toHaveBeenCalled();
                                });
                            });
                        });

                    });

                    describe('fetchGettyThumbs(imageid)', function() {
                        it('should return the thumbs from the imageid', function() {
                            var input = '12345';
                            var expectedOutput = {
                                small: '//embed-cdn.gettyimages.com/xt/12345.jpg?v=1&g=fs1|0|DV|33|651&s=1',
                                large: '//embed-cdn.gettyimages.com/xt/12345.jpg?v=1&g=fs1|0|DV|33|651&s=1'
                            };
                            var output = ImageThumbnailService._private.fetchGettyThumbs(input);
                            expect(output).toEqual(expectedOutput);
                        });
                    });

                    describe('fetchWebThumbs(imageid)', function() {
                        it('should return the thumbs from the imageid', function() {
                            spyOn(CollateralUploadService, 'uploadFromUri').and.returnValue(
                                $q.when('/collateral/image.jpg')
                            );
                            var input = 'www.site.com/image.jpg';
                            var expectedOutput = {
                                small: '/collateral/image.jpg',
                                large: '/collateral/image.jpg'
                            };
                            ImageThumbnailService._private.fetchWebThumbs(input)
                                .then(success, failure);
                            $rootScope.$apply();
                            expect(success).toHaveBeenCalledWith(expectedOutput);
                            expect(failure).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('@public', function() {
                 describe('methods', function() {
                     describe('getThumbsFor(data)', function() {
                         var result;

                         ['flickr', 'getty', 'web'].forEach(function(service) {
                             describe('when the service is ' + service, function() {
                                 beforeEach(function() {
                                     result = ImageThumbnailService.getThumbsFor('flickr', '12345');
                                 });

                                 it('should immediately return an object with null properties', function() {
                                     expect(result.small).toBeNull();
                                     expect(result.large).toBeNull();
                                 });
                             });
                         });

                        describe('flickr', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchFlickrThumbs')
                                    .and.returnValue(
                                        $q.when({
                                            small: 'small.jpg',
                                            large: 'large.jpg'
                                        })
                                    );

                                result = ImageThumbnailService.getThumbsFor('flickr', '12345');
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchFlickrThumbs).toHaveBeenCalledWith('12345');
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });
                        });

                        describe('getty', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchGettyThumbs')
                                    .and.returnValue(
                                        $q.when({
                                            small: 'small.jpg',
                                            large: 'large.jpg'
                                        })
                                    );

                                result = ImageThumbnailService.getThumbsFor('getty', '12345');
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchGettyThumbs).toHaveBeenCalledWith('12345');
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });
                        });

                        describe('web', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchWebThumbs')
                                    .and.returnValue(
                                        $q.when({
                                            small: 'small.jpg',
                                            large: 'large.jpg'
                                        })
                                    );

                                result = ImageThumbnailService.getThumbsFor(
                                    'web', 'www.site.com/image.jpg');
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchWebThumbs).toHaveBeenCalledWith('www.site.com/image.jpg');
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });
                        });

                        describe('an unknown service', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = ImageThumbnailService.getThumbsFor('foo', '12345');
                                });
                            });

                            it('should return an empty model', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });
                        });

                     });
                 });
            });
        });
    });
}());
