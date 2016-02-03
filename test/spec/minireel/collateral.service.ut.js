(function() {
    'use strict';

    define(['minireel/services','selfie/services'], function(servicesModule, selfieServicesModule) {
        describe('CollateralService', function() {
            var $rootScope,
                $q,
                $httpBackend,
                CollateralServiceProvider,
                CollateralService,
                ThumbnailService,
                FileService;

            beforeEach(function() {
                module(selfieServicesModule.name);
                module(servicesModule.name, function($injector) {
                    CollateralServiceProvider = $injector.get('CollateralServiceProvider');
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    FileService = $injector.get('FileService');
                    $q = $injector.get('$q');
                    $httpBackend = $injector.get('$httpBackend');
                    ThumbnailService = $injector.get('ThumbnailService');

                    CollateralService = $injector.get('CollateralService');
                });
            });

            it('should exist', function() {
                expect(CollateralService).toEqual(jasmine.any(Object));
            });

            describe('generating a collage of a minireel containing instagram cards', function() {
                beforeEach(function() {
                    spyOn(ThumbnailService, 'getThumbsFor').and.returnValue({
                        ensureFulfillment: function() {
                            return $q.when({
                                small: 'small.jpg',
                                large: 'large.jpg'
                            });
                        }
                    });
                });

                it('should work with instagram cards', function() {
                    var minireel = {
                        id: 'e-ef657e8ea90c84',
                        data: {
                            splash: {
                                ratio: '16-9'
                            },
                            deck: [{
                                type: 'instagram',
                                data: {
                                    id: 'abc123',
                                    thumbs: {
                                        small: 'small.jpg',
                                        large: 'large.jpg'
                                    }
                                }
                            }]
                        }
                    };
                    CollateralService.generateCollage({
                        minireel: minireel,
                        name: 'splash',
                        width: 600,
                        allRatios: true
                    });
                    expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('instagram', 'abc123', {
                        id: 'abc123',
                        thumbs: {
                            small: 'small.jpg',
                            large: 'large.jpg'
                        }
                    });
                });
            });

            describe('methods', function() {
                describe('generateCollage(options)', function() {
                    var minireel, thumbs,
                        success;

                    function Thumb(card) {
                        this.small = card ?
                            (card.data.videoid + '--small.jpg') :
                            null;

                        this.large = card ?
                            (card.data.videoid + '--large.jpg') :
                            null;

                        this.ensureFulfillment = jasmine.createSpy('thumb.ensureFulfillment()')
                            .and.callFake(function() {
                                return $q.when(this);
                            });
                    }

                    beforeEach(function() {
                        success = jasmine.createSpy('generateCollage() success');

                        minireel = {
                            id: 'e-ef657e8ea90c84',
                            data: {
                                splash: {
                                    ratio: '16-9'
                                },
                                deck: [
                                    {
                                        data: {
                                            service: 'youtube',
                                            videoid: '123'
                                        }
                                    },
                                    {
                                        data: {
                                            service: 'vimeo',
                                            videoid: 'abc'
                                        }
                                    },
                                    {
                                        thumb: 'foo/bar.jpg',
                                        data: {}
                                    },
                                    {
                                        data: {
                                            service: 'dailymotion',
                                            videoid: 'abc123'
                                        }
                                    },
                                    {
                                        data: {}
                                    }
                                ]
                            }
                        };

                        thumbs = {
                            '123': new Thumb(minireel.data.deck[0]),
                            'abc': new Thumb(minireel.data.deck[1]),
                            'abc123': new Thumb(minireel.data.deck[3])
                        };

                        spyOn(ThumbnailService, 'getThumbsFor').and.callFake(function(service, id) {
                            return thumbs[id] || new Thumb();
                        });

                        $httpBackend.expectPOST('/api/collateral/splash', {
                            imageSpecs: [
                                {
                                    name: 'splash',
                                    width: 600,
                                    height: 600 * (9 / 16),
                                    ratio: '16-9'
                                }
                            ],
                            thumbs: [
                                '123--large.jpg',
                                'abc--large.jpg',
                                'foo/bar.jpg',
                                'abc123--large.jpg'
                            ]
                        }).respond(201, [
                            {
                                path: 'collateral/' + minireel.id + '/splash',
                                code: 201,
                                ratio: '16-9',
                                name: 'splash'
                            }
                        ]);

                        CollateralService.generateCollage({
                            minireel: minireel,
                            name: 'splash',
                            width: 600
                        }).then(success);

                        $httpBackend.flush();
                    });

                    it('should make sure every ThumbModel is fulfilled', function() {
                        Object.keys(thumbs).forEach(function(key) {
                            expect(thumbs[key].ensureFulfillment).toHaveBeenCalled();
                        });
                    });

                    it('should resolve to the path of the generated image', function() {
                        expect(success).toHaveBeenCalledWith({
                            '16-9': '/collateral/' + minireel.id + '/splash'
                        });
                        expect(success.calls.mostRecent().args[0].toString()).toBe(
                            '/collateral/' + minireel.id + '/splash'
                        );
                    });

                    it('should allow a default width to be configured', function() {
                        $httpBackend.expectPOST('/api/collateral/splash', {
                            imageSpecs: [
                                {
                                    name: 'foo',
                                    width: 800,
                                    height: 800 * (9 / 16),
                                    ratio: '16-9',
                                }
                            ],
                            thumbs: [
                                '123--large.jpg',
                                'abc--large.jpg',
                                'foo/bar.jpg',
                                'abc123--large.jpg'
                            ]
                        }).respond(201, [
                            {
                                name: 'foo',
                                ratio: '16-9',
                                path: 'collateral/' + minireel.id + '/foo',
                                code: 201
                            }
                        ]);

                        CollateralServiceProvider.defaultCollageWidth(800);

                        CollateralService.generateCollage({
                            minireel: minireel,
                            name: 'foo'
                        });

                        $httpBackend.flush();
                    });

                    it('should offer the option not to cache the image', function() {
                        $httpBackend.expectPOST('/api/collateral/splash', {
                            imageSpecs: [
                                {
                                    name: 'splash',
                                    width: 800,
                                    height: 800 * (9 / 16),
                                    ratio: '16-9'
                                }
                            ],
                            thumbs: [
                                '123--large.jpg',
                                'abc--large.jpg',
                                'foo/bar.jpg',
                                'abc123--large.jpg'
                            ]
                        }).respond(201, [
                            {
                                name: 'splash',
                                ratio: '16-9',
                                path: 'collateral/' + minireel.id + '/splash',
                                code: 201
                            }
                        ]);

                        CollateralService.generateCollage({
                            minireel: minireel,
                            name: 'splash',
                            cache: false,
                            width: 800
                        });

                        $httpBackend.flush();
                    });

                    it('should offer the option to generate all image ratios', function() {
                        var ratios = ['1-1', '6-5', '6-4', '16-9'];

                        CollateralServiceProvider.ratios(ratios);

                        $httpBackend.expectPOST('/api/collateral/splash', {
                            imageSpecs: ratios.map(function(ratio) {
                                ratio = ratio.split('-');

                                return {
                                    name: 'splash--' + ratio.join('-'),
                                    width: 600,
                                    height: 600 * (ratio[1] / ratio[0]),
                                    ratio: ratio.join('-')
                                };
                            }),
                            thumbs: [
                                '123--large.jpg',
                                'abc--large.jpg',
                                'foo/bar.jpg',
                                'abc123--large.jpg'
                            ]
                        }).respond(201, ratios.map(function(ratio) {
                            return {
                                name: 'splash--' + ratio,
                                ratio: ratio,
                                code: 201,
                                path: 'collateral/e-123/splash--' + ratio
                            };
                        }));

                        CollateralService.generateCollage({
                            minireel: minireel,
                            name: 'splash',
                            width: 600,
                            allRatios: true
                        }).then(success);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith((function() {
                            var hash = {};

                            ratios.forEach(function(ratio) {
                                hash[ratio] = '/collateral/e-123/splash--' + ratio;
                            });

                            return hash;
                        }()));
                        expect(success.calls.mostRecent().args[0].toString()).toBe(ratios.map(function(ratio) {
                            return '/collateral/e-123/splash--' + ratio;
                        }).join(','));
                    });
                });

                describe('set(key, file, experience)', function() {
                    var experience, splashImage,
                        uploadDeferred, splashImageWrapper,
                        result, success, notify;

                    beforeEach(function() {
                        splashImage = {};
                        splashImageWrapper = {
                            file: splashImage,
                            url: 'http://localhost:9000/f7394fn83'
                        };
                        experience = {
                            id: 'e-cdbe0a2260e870',
                            data: {
                                collateral: {}
                            }
                        };
                        uploadDeferred = $q.defer();

                        spyOn(FileService, 'upload')
                            .and.returnValue(uploadDeferred.promise);
                        spyOn(FileService, 'open')
                            .and.returnValue(splashImageWrapper);

                        success = jasmine.createSpy('set success');
                        notify = jasmine.createSpy('set notify');

                        $rootScope.$apply(function() {
                            result = CollateralService.set('splash', splashImage, experience);

                            result.then(success, null, notify);
                        });
                    });

                    it('should upload the file to the collateral service', function() {
                        expect(FileService.open).toHaveBeenCalledWith(splashImage);
                        expect(FileService.upload).toHaveBeenCalledWith('/api/collateral/files', [splashImageWrapper]);
                    });

                    it('should attach the progress state of the upload to the promise', function() {
                        var state1 = {
                                uploaded: 45,
                                total: 1024,
                                complete: 45 / 1024
                            },
                            state2 = {
                                uploaded: 356,
                                total: 1024,
                                complete: 356 / 1024
                            },
                            state3 = {
                                uploaded: 674,
                                total: 1024,
                                complete: 674 / 1024
                            };

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state1);
                        });
                        expect(result.progress).toBe(state1);
                        expect(notify).toHaveBeenCalledWith(state1);

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state2);
                        });
                        expect(result.progress).toBe(state2);
                        expect(notify).toHaveBeenCalledWith(state2);

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state3);
                        });
                        expect(result.progress).toBe(state3);
                        expect(notify).toHaveBeenCalledWith(state3);
                    });

                    describe('after the upload is complete', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                uploadDeferred.resolve({
                                    status: 201,
                                    data: [
                                        {
                                            name: 'splash',
                                            code: 201,
                                            path: 'collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg'
                                        }
                                    ]
                                });
                            });
                        });

                        it('should set the collateral asset\'s path to the provided key on the collateral object of the experience', function() {
                            expect(experience.data.collateral.splash).toBe('/collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg');
                        });

                        it('should resolve to the experience', function() {
                            expect(success).toHaveBeenCalledWith(experience);
                        });
                    });

                    it('should be forgiving of experiences without a "collateral" hash', function() {
                        experience = {
                            data: {}
                        };

                        $rootScope.$apply(function() {
                            CollateralService.set('splash', splashImage, experience);
                        });
                        $rootScope.$apply(function() {
                            uploadDeferred.resolve({
                                status: 201,
                                data: [
                                    {
                                        name: 'splash',
                                        code: 201,
                                        path: 'collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg'
                                    }
                                ]
                            });
                        });

                        expect(experience.data.collateral).toEqual({
                            splash: '/collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg'
                        });
                    });
                });

                describe('uploadFromFile(file)', function() {
                    var splashImage,
                        uploadDeferred, splashImageWrapper,
                        result, success, notify;

                    beforeEach(function() {
                        splashImage = {};
                        splashImageWrapper = {
                            file: splashImage,
                            url: 'http://localhost:9000/f7394fn83'
                        };

                        uploadDeferred = $q.defer();

                        spyOn(FileService, 'upload')
                            .and.returnValue(uploadDeferred.promise);
                        spyOn(FileService, 'open')
                            .and.returnValue(splashImageWrapper);

                        success = jasmine.createSpy('set success');
                        notify = jasmine.createSpy('set notify');

                        $rootScope.$apply(function() {
                            result = CollateralService.uploadFromFile(splashImage);

                            result.then(success, null, notify);
                        });
                    });

                    it('should upload the file to the collateral service', function() {
                        expect(FileService.open).toHaveBeenCalledWith(splashImage);
                        expect(FileService.upload).toHaveBeenCalledWith('/api/collateral/files', [splashImageWrapper]);
                    });

                    it('should attach the progress state of the upload to the promise', function() {
                        var state1 = {
                                uploaded: 45,
                                total: 1024,
                                complete: 45 / 1024
                            },
                            state2 = {
                                uploaded: 356,
                                total: 1024,
                                complete: 356 / 1024
                            },
                            state3 = {
                                uploaded: 674,
                                total: 1024,
                                complete: 674 / 1024
                            };

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state1);
                        });
                        expect(result.progress).toBe(state1);
                        expect(notify).toHaveBeenCalledWith(state1);

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state2);
                        });
                        expect(result.progress).toBe(state2);
                        expect(notify).toHaveBeenCalledWith(state2);

                        $rootScope.$apply(function() {
                            uploadDeferred.notify(state3);
                        });
                        expect(result.progress).toBe(state3);
                        expect(notify).toHaveBeenCalledWith(state3);
                    });

                    describe('after the upload is complete', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                uploadDeferred.resolve({
                                    status: 201,
                                    data: [
                                        {
                                            name: 'splash',
                                            code: 201,
                                            path: 'collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg'
                                        }
                                    ]
                                });
                            });
                        });

                        it('should resolve to the path', function() {
                            expect(success).toHaveBeenCalledWith('collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg');
                        });
                    });
                });

                describe('uploadFromUri(uri)', function() {
                    it('should resolve to the path', function() {
                        var success = jasmine.createSpy('success');

                        $httpBackend.expectPOST('/api/collateral/uri', { uri: 'http://foo.com/bar.jpg' })
                            .respond(201, [{ path: 'collateral/userFiles/ce114e4501d2f4e2dcea3e17b546f339.jpg'}]);

                        CollateralService.uploadFromUri('http://foo.com/bar.jpg')
                            .then(success);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith('collateral/userFiles/ce114e4501d2f4e2dcea3e17b546f339.jpg');
                    });
                });

                describe('websiteData(uri)', function() {
                    var success, failure, deferred, response, data;

                    beforeEach(function() {
                        success = jasmine.createSpy('success');
                        failure = jasmine.createSpy('failure');
                        deferred = $q.defer();
                    });

                    describe('when request succeeds', function() {
                        it('should reject promise if no data is found', function() {
                            response = {
                                links: {
                                    facebook: null,
                                    twitter: null,
                                    instagram: null,
                                    pinterest: null
                                },
                                images: {
                                    profile: null
                                }
                            };

                            $httpBackend.expectGET('/api/collateral/website-data?uri=' + encodeURIComponent('http://mysite.com'))
                                .respond(200, response);

                            CollateralService.websiteData('http://mysite.com')
                                .then(success, failure);

                            $httpBackend.flush();

                            expect(failure).toHaveBeenCalled();
                            expect(success).not.toHaveBeenCalled();
                        });

                        it('should resolve with whitelisted data if any links exist', function() {
                            response = {
                                links: {
                                    facebook: null,
                                    twitter: null,
                                    instagram: 'http://instagram.com',
                                    pinterest: null,
                                    google: 'http://google.com',
                                    tumblr: 'http://tumblr.com',
                                    vimeo: 'http://vimeo.com'
                                },
                                images: {
                                    profile: null
                                }
                            };

                            data = {
                                links: {
                                    facebook: null,
                                    twitter: null,
                                    instagram: 'http://instagram.com',
                                    pinterest: null,
                                    vimeo: 'http://vimeo.com'
                                },
                                images: {
                                    profile: null
                                }
                            }

                            $httpBackend.expectGET('/api/collateral/website-data?uri=' + encodeURIComponent('http://mysite.com'))
                                .respond(200, response);

                            CollateralService.websiteData('http://mysite.com')
                                .then(success, failure);

                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith(data);
                            expect(failure).not.toHaveBeenCalled();
                        });

                        it('should resolve with data if logo exists', function() {
                            response = {
                                links: {
                                    facebook: null,
                                    twitter: null,
                                    instagram: null,
                                    pinterest: null
                                },
                                images: {
                                    profile: 'http://mysite.com/logo.jpg'
                                }
                            };

                            $httpBackend.expectGET('/api/collateral/website-data?uri=' + encodeURIComponent('http://mysite.com'))
                                .respond(200, response);

                            CollateralService.websiteData('http://mysite.com')
                                .then(success, failure);

                            $httpBackend.flush();

                            expect(success).toHaveBeenCalledWith(response);
                            expect(failure).not.toHaveBeenCalled();
                        });
                    });

                    describe('when request fails', function() {
                        it('should reject the promise', function() {
                            $httpBackend.expectGET('/api/collateral/website-data?uri=' + encodeURIComponent('http://mysite.com'))
                                .respond(404, 'NOT FOUND');

                            CollateralService.websiteData('http://mysite.com')
                                .then(success, failure);

                            $httpBackend.flush();

                            expect(failure).toHaveBeenCalled();
                            expect(success).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());
