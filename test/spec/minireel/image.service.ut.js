(function() {
    'use strict';

    define(['minireel/services', 'c6_defines'], function(servicesModule, c6Defines) {
        describe('ImageService', function() {
            var ImageService, $q, $http, $rootScope;
            var success, failure;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    ImageService = $injector.get('ImageService');
                    $q           = $injector.get('$q');
                    $http        = $injector.get('$http');
                    $rootScope       = $injector.get('$rootScope');
                });

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');
            });

            it('should exist', function() {
                expect(ImageService).toEqual(jasmine.any(Object));
            });

            describe('@private', function() {
                describe('methods', function() {
                    describe('decodeBase58', function() {

                        // Uses the following digits: 123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ

                        function decodeBase58() {
                            return ImageService._private.decodeBase58.apply(ImageService, arguments);
                        }

                        it('should correctly decode base 58 strings', function() {
                            var input = [ 'QiRQ5no','bTzFoe1','fT1TY9U','4fbJUji','b5tzXej', '1'];
                            var expectedOutput = [1839019195544,414542249106,566446030396,123516608037,383624522392, 0];
                            var output = input.map(decodeBase58);
                            expect(output).toEqual(expectedOutput);
                        });

                        it('should return -1 for invalid input', function() {
                            var input = ['-1', '0', 'I', null];
                            var expectedOutput = input.map(function() {
                                return -1;
                            });
                            var output = input.map(decodeBase58);
                            expect(output).toEqual(expectedOutput);
                        });
                    });

                    describe('encodeBase58', function() {

                        // Uses the following digits: 123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ

                        function encodeBase58(num) {
                            return ImageService._private.encodeBase58.apply(ImageService, arguments);
                        }

                        it('should correctly encode base 58 strings', function() {
                            var input = [1839019195544,414542249106,566446030396,123516608037,383624522392, 0];
                            var expectedOutput = [ 'QiRQ5no','bTzFoe1','fT1TY9U','4fbJUji','b5tzXej', '1'];
                            var output = input.map(encodeBase58);
                            expect(output).toEqual(expectedOutput);
                        });

                        it('should return -1 for invalid input', function() {
                            var input = ['-1', 'hello', ':)', null];
                            var expectedOutput = input.map(function() {
                                return -1;
                            });
                            var output = input.map(encodeBase58);
                            expect(output).toEqual(expectedOutput);
                        });
                    });

                    describe('getFlickrEmbedInfo', function() {

                        function fromData() {
                            return ImageService._private.getFlickrEmbedInfo.apply(ImageService, arguments);
                        }

                        it('should successfully return a properly formatted Flickr source url', function() {
                            spyOn($http, 'jsonp').and.returnValue(
                                $q.when({
                                    data: {
                                        sizes: {
                                            size: [
                                                {
                                                    label: 'Thumbnail',
                                                    source: 'www.small_thumb.jpg',
                                                    width: '1',
                                                    height: '1'
                                                },
                                                {
                                                    label: 'Medium',
                                                    source: 'www.large_thumb.jpg',
                                                    width: '2',
                                                    height: '2'
                                                },
                                                {
                                                    label: 'Original',
                                                    source: 'https://www.someimage.jpg',
                                                    width: '123',
                                                    height: '456'
                                                }
                                            ]
                                        }
                                    }
                                })
                            );
                            var input = 123;
                            var expectedOutput = {
                                src: 'https://www.someimage.jpg',
                                width: '123',
                                height: '456',
                                thumbs: {
                                    small: 'www.small_thumb.jpg',
                                    large: 'www.large_thumb.jpg'
                                }
                            };
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).toHaveBeenCalledWith(expectedOutput);
                            expect(failure).not.toHaveBeenCalled();
                        });

                        it('should reject the promise if flickr returns unrecognized JSON', function() {
                            spyOn($http, 'jsonp').and.returnValue(
                                $q.when({
                                    data: {
                                        message: 'I\'m not a valid Flickr API response!'
                                    }
                                })
                            );
                            var input = 123;
                            var expectedOutput = 'There was a problem retrieving the image from Flickr.';
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalledWith(expectedOutput);
                        });

                        it('should reject the promise if the API request to flickr fails', function() {
                            spyOn($http, 'jsonp').and.returnValue($q.reject());
                            var input = 123;
                            var expectedOutput = 'There was a problem contacting Flickr.';
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalledWith(expectedOutput);
                        });

                        it('should use Flickr\'s getSizes endpoint', function() {
                            spyOn($http, 'jsonp').and.returnValue($q.when());
                            c6Defines.kFlickrDataApiKey = 'abc123';
                            var input = 123;
                            var expectedOutput = 'https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=abc123&photo_id=123&jsoncallback=JSON_CALLBACK';
                            fromData(input);
                            expect($http.jsonp).toHaveBeenCalledWith(expectedOutput);
                        });

                        it('should reject the promise if no image sizes are available', function() {
                            spyOn($http, 'jsonp').and.returnValue(
                                $q.when({
                                    data: {
                                        sizes: {
                                            // no available sizes
                                            size: []
                                        }
                                    }
                                })
                            );
                            var input = 123;
                            var expectedOutput = 'There was a problem retrieving the image from Flickr.';
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalledWith(expectedOutput);
                        });

                        it('should use the two smallest thumbs if Flickr\'s API doesn\'t return a Thumbnail label', function() {
                            spyOn($http, 'jsonp').and.returnValue(
                                $q.when({
                                    data: {
                                        sizes: {
                                            size: [
                                                {
                                                    type: 'small square',
                                                    source: 'www.small_square.jpg',
                                                    width: 10,
                                                    height: 10
                                                },
                                                {
                                                    type: 'large square',
                                                    source: 'www.large_square.jpg',
                                                    width: 50,
                                                    height: 50
                                                }
                                            ]
                                        }
                                    }
                                })
                            );
                            var input = 123;
                            var expectedOutput = {
                                src: 'www.large_square.jpg',
                                width: 50,
                                height: 50,
                                thumbs: {
                                    small: 'www.small_square.jpg',
                                    large: 'www.large_square.jpg'
                                }
                            };
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).toHaveBeenCalledWith(expectedOutput);
                            expect(failure).not.toHaveBeenCalled();
                        });

                    });

                    describe('getGettyEmbedInfo', function() {
                        function fromData() {
                            return ImageService._private.getGettyEmbedInfo.apply(ImageService, arguments);
                        }

                        it('should successfully return Getty embed info', function() {
                            spyOn($http, 'get').and.returnValue(
                                $q.when({
                                    data: {
                                        html: '<iframe src="//embed.gettyimages.com/embed/123?params" width="456" height="789"></iframe>'
                                    }
                                })
                            );
                            var input = 123;
                            var expectedOutput = {
                                src: '//embed.gettyimages.com/embed/123?params',
                                width: '456',
                                height: '789'
                            };
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).toHaveBeenCalledWith(expectedOutput);
                        });

                        it('should reject the promise if GettyImages returns unrecognized JSON', function() {
                            spyOn($http, 'get').and.returnValue(
                                $q.when({
                                    data: {
                                        message: 'I\'m not a valid GettyImages API response!'
                                    }
                                })
                            );
                            var input = 123;
                            var expectedOutput = 'There was a problem retrieving the image from GettyImages.';
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalledWith(expectedOutput);
                        });

                        it('should reject the promise if the API request to GettyImages fails', function() {
                            spyOn($http, 'get').and.returnValue($q.reject());
                            var input = 123;
                            var expectedOutput = 'There was a problem contacting GettyImages.';
                            fromData(input).then(success, failure);
                            $rootScope.$apply();
                            expect(success).not.toHaveBeenCalled();
                            expect(failure).toHaveBeenCalledWith(expectedOutput);
                        });

                        it('should use GettyImages\' oEmbed endpoint', function() {
                            spyOn($http, 'get').and.returnValue($q.when());
                            var input = 123;
                            var expectedOutput = 'http://embed.gettyimages.com/oembed?url=http%3A%2F%2Fgty.im%2F123';
                            fromData(input).then(success, failure);
                            expect($http.get).toHaveBeenCalledWith(expectedOutput);
                        });
                    });
                });
            });

            describe('@public', function() {
                describe('dataFromUrl', function() {
                    function fromUrl() {
                        return ImageService.dataFromUrl.apply(ImageService, arguments);
                    }

                    it('should parse valid flickr photo urls', function() {
                        spyOn(ImageService._private, 'getFlickrEmbedInfo').and.returnValue(
                            $q.when({
                                src: 'http://www.someimage.jpg',
                                width: '123',
                                height: '456',
                                thumbs: {
                                    small: 'www.small_thumb.jpg',
                                    large: 'www.large_thumb.jpg'
                                }
                            })
                        );
                        // note: 12345 in flickr's base 58 format is 4ER
                        var input = [
                            'https://www.flickr.com/photos/author/12345/',
                            'https://www.flickr.com/photos/author/12345',
                            'http://www.flickr.com/photos/author/12345/',
                            'www.flickr.com/photos/author/12345/',
                            'flickr.com/photos/author/12345/',
                            'https://flic.kr/p/4ER/',
                            'http://flic.kr/p/4ER/',
                            'https://www.flickr.com/photos/author/12345/in/explore/'
                        ];
                        var expectedOutput = input.map(function() {
                            return {
                                imageid: '12345',
                                service: 'flickr'
                            };
                        });
                        var output = input.map(fromUrl);
                        expect(output).toEqual(expectedOutput);
                    });

                    it('should parse getty urls', function() {
                        spyOn(ImageService._private,'getGettyEmbedInfo').and.returnValue(
                            $q.when({
                                src: 'http://www.someimage.jpg',
                                width: '123',
                                height: '456'
                            })
                        );
                        var input = [
                            'https://www.gettyimages.com/detail/photo/amazing-photo/12345/',
                            'https://www.gettyimages.com/detail/photo/amazing-photo/12345',
                            'http://www.gettyimages.com/detail/photo/amazing-photo/12345',
                            'www.gettyimages.com/detail/photo/amazing-photo/12345',
                            'https://gty.im/12345',
                            'http://gty.im/12345',
                            'https://www.gettyimages.com/detail/news-photo/amazing-photo/12345/'
                        ];
                        var expectedOutput = input.map(function() {
                            return {
                                imageid: '12345',
                                service: 'getty',
                            };
                        });
                        var output = input.map(fromUrl);
                        expect(output).toEqual(expectedOutput);
                    });

                    it('should return nulls if the URL could not be recognized', function() {
                        var input = 'www.google.com';
                        var expectedOutput = {
                            service: null,
                            imageid: null
                        };
                        var output = fromUrl(input);
                        expect(output).toEqual(expectedOutput);
                    });
                });

                describe('urlFromData', function() {
                    function fromData() {
                        return ImageService.urlFromData.apply(ImageService, arguments);
                    }

                    it('should constuct a valid flickr url', function() {
                        var input = {
                            service: 'flickr',
                            imageid: '12345'
                        };
                        var expectedOutput = 'https://flic.kr/p/4ER';
                        var output = fromData(input.service, input.imageid);
                        expect(output).toEqual(expectedOutput);
                    });

                    it('should construct a valid getty url', function() {
                        var input = {
                            service: 'getty',
                            imageid: '12345'
                        };
                        var expectedOutput = 'http://gty.im/12345';
                        var output = fromData(input.service, input.imageid);
                        expect(output).toEqual(expectedOutput);
                    });

                    it('should return null if passed an unrecognized service', function() {
                        var output = fromData('awesome_site', '123');
                        expect(output).toBeNull();
                    });

                    it('should return null if not passed an imageid', function() {
                        var output = fromData('awesome_site', null);
                        expect(output).toBeNull();
                    });
                });

                describe('getEmbedInfo', function() {
                    function embedInfo() {
                        return ImageService.getEmbedInfo.apply(ImageService, arguments);
                    }

                    it('should return flickr embed info', function() {
                        spyOn(ImageService._private, 'getFlickrEmbedInfo').and.returnValue(
                            $q.when({
                                src: 'www.site.com/image.jpg',
                                width: '200',
                                height: '100',
                                thumbs: {
                                    small: 'www.site.com/small.jpg',
                                    large: 'www.site.com/large.jpg'
                                }
                            })
                        );
                        var expectedOutput = {
                            href: 'www.site.com/image.jpg',
                            width: '200',
                            height: '100',
                            thumbs: {
                                small: 'www.site.com/small.jpg',
                                large: 'www.site.com/large.jpg'
                            }
                        };
                        embedInfo('flickr', '12345').then(success, failure);
                        $rootScope.$apply();
                        var output = success.calls.mostRecent().args[0];
                        expect(output).toEqual(expectedOutput);
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should construct a getty embed code', function() {
                        spyOn(ImageService._private, 'getGettyEmbedInfo').and.returnValue(
                            $q.when({
                                src: '//site.com/iframe-content',
                                width: '200',
                                height: '100'
                            })
                        );
                        var expectedOutput = {
                            href: '//site.com/iframe-content',
                            width: '200',
                            height: '100'
                        };
                        embedInfo('getty', '12345').then(success, failure);
                        $rootScope.$apply();
                        var output = success.calls.mostRecent().args[0];
                        expect(output).toEqual(expectedOutput);
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('should resolve the promise with nulls if passed an unrecognized service', function() {
                        var expectedOutput = 'Unrecognized service.';
                        embedInfo('apple', '12345').then(success, failure);
                        $rootScope.$apply();
                        expect(success).toHaveBeenCalledWith({
                            href: null,
                            width: null,
                            height: null,
                            embedCode: null
                        });
                    });
                });

            });
        });
    });
}());
