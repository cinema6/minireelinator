(function() {
    'use strict';

    define(['minireel/services'], function(servicesModule) {
        describe('ImageThumbnailService', function() {
            var $rootScope,
                $q,
                OpenGraphService,
                ImageService,
                ImageThumbnailService;

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
                    _private = ImageThumbnailService._private;
                });
            });

            it('should exist', function() {
                expect(ImageThumbnailService).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {
                describe('methods', function() {
                    describe('fetchFlickrThumbs(data)', function() {
                        it('should return the thumbs from the data object', function() {
                            var input = {
                                href: 'www.site.com/image.jpg',
                                thumbs: {
                                    small: 'www.site.com/small.jpg',
                                    large: 'www.site.com/large.jpg'
                                }
                            };
                            var expectedOutput = {
                                small: 'www.site.com/small.jpg',
                                large: 'www.site.com/large.jpg'
                            };
                            var output = ImageThumbnailService._private.fetchFlickrThumbs(input);
                            expect(output).toEqual(expectedOutput);
                        });
                    });

                    describe('fetchGettyThumbs(imageid)', function() {
                        it('should return the thumbs from the imageid', function() {
                            var input = '12345';
                            var expectedOutput = {
                                small: 'http://embed-cdn.gettyimages.com/xt/12345.jpg?v=1&g=fs1|0|DV|33|651&s=1',
                                large: 'http://embed-cdn.gettyimages.com/xt/12345.jpg?v=1&g=fs1|0|DV|33|651&s=1'
                            };
                            var output = ImageThumbnailService._private.fetchGettyThumbs(input);
                            expect(output).toEqual(expectedOutput);
                        });
                    });
                });
            });

            describe('@public', function() {
                 describe('methods', function() {
                     describe('getThumbsFor(data)', function() {
                         var result;

                        describe('flickr', function() {
                            beforeEach(function() {
                                spyOn(_private, 'fetchFlickrThumbs')
                                    .and.returnValue({
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    });

                                result = ImageThumbnailService.getThumbsFor({
                                    service: 'flickr',
                                    id: '12345',
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                                });
                            });

                            it('should imediately retrun an object with null properties', function() {
                                expect(result.small).toBeNull();
                                expect(result.large).toBeNull();
                            });

                            it('should set the small and large properties when the promise resolves', function() {
                                expect(_private.fetchFlickrThumbs).toHaveBeenCalledWith({
                                    service: 'flickr',
                                    id: '12345',
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                                });
                                $rootScope.$digest();

                                expect(result.small).toBe('small.jpg');
                                expect(result.large).toBe('large.jpg');
                            });

                         });

                        describe('an unknown service', function() {
                            beforeEach(function() {
                                $rootScope.$apply(function() {
                                    result = ImageThumbnailService.getThumbsFor({
                                        service: 'foo'
                                    });
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
