define(['minireel/sponsor','minireel/mixins/VideoCardController'], function(sponsorModule, VideoCardController) {
    'use strict';

    describe('SponsorCardVideoController', function() {
        var $injector,
            $rootScope,
            $controller,
            $scope,
            SponsorCardVideoCtrl;

        var card;

        beforeEach(function() {
            module(sponsorModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardVideoCtrl = $controller('SponsorCardVideoController', {
                        $scope: $scope
                    });
                    card = SponsorCardVideoCtrl.model = {
                        data: {
                            service: null,
                            videoid: null
                        }
                    };
                });
            });
        });

        it('should exist', function() {
            expect(SponsorCardVideoCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the VideoCardController mixin', function() {
            expect(Object.keys(SponsorCardVideoCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(VideoCardController))));
        });

        describe('properties', function() {
            describe('vastTag', function() {
                describe('getting', function() {
                    describe('if there is no videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = null;
                        });

                        it('should be null', function() {
                            expect(SponsorCardVideoCtrl.vastTag).toBeNull();
                        });
                    });

                    describe('if there is a videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = JSON.stringify({
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            });
                        });

                        it('should be the vast tag', function() {
                            expect(SponsorCardVideoCtrl.vastTag).toBe('http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov');
                        });
                    });
                });

                describe('setting', function() {
                    describe('if there is no videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = null;

                            SponsorCardVideoCtrl.vastTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
                        });

                        it('should create the property as a json string', function() {
                            expect(card.data.videoid).toBe(JSON.stringify({
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            }));
                        });
                    });

                    describe('if there is a videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = JSON.stringify({
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=voe',
                                vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            });

                            SponsorCardVideoCtrl.vastTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
                        });

                        it('should just change the property that changed', function() {
                            expect(card.data.videoid).toEqual(JSON.stringify({
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            }));
                        });
                    });
                });
            });

            describe('vpaidTag', function() {
                describe('getting', function() {
                    describe('if there is no videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = null;
                        });

                        it('should be null', function() {
                            expect(SponsorCardVideoCtrl.vpaidTag).toBeNull();
                        });
                    });

                    describe('if there is a videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = JSON.stringify({
                                vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            });
                        });

                        it('should be the vast tag', function() {
                            expect(SponsorCardVideoCtrl.vpaidTag).toBe('http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov');
                        });
                    });
                });

                describe('setting', function() {
                    describe('if there is no videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = null;

                            SponsorCardVideoCtrl.vpaidTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
                        });

                        it('should create the property as a json string', function() {
                            expect(card.data.videoid).toBe(JSON.stringify({
                                vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            }));
                        });
                    });

                    describe('if there is a videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = JSON.stringify({
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=voe'
                            });

                            SponsorCardVideoCtrl.vpaidTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
                        });

                        it('should just change the property that changed', function() {
                            expect(card.data.videoid).toEqual(JSON.stringify({
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                                vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            }));
                        });
                    });
                });
            });

            describe('adPreviewType', function() {
                it('should be vpaid', function() {
                    expect(SponsorCardVideoCtrl.adPreviewType).toBe('vpaid');
                });
            });

            describe('adPreviewPageUrl', function() {
                it('should be an empty string', function() {
                    expect(SponsorCardVideoCtrl.adPreviewPageUrl).toBe('');
                });
            });

            describe('adTag', function() {
                beforeEach(function() {
                    card.data.videoid = JSON.stringify({
                        vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov',
                        vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                    });
                });

                ['vast', 'vpaid'].forEach(function(type) {
                    describe('if the adPreviewType is "' + type + '"', function() {
                        beforeEach(function() {
                            SponsorCardVideoCtrl.adPreviewPageUrl = 'http://www.mutantplayground.com';

                            SponsorCardVideoCtrl.adPreviewType = type;
                        });

                        it('should compile the ad tag with the pageUrl macro', function() {
                            expect(SponsorCardVideoCtrl.adTag).toBe(SponsorCardVideoCtrl[type + 'Tag'].replace('{pageUrl}', encodeURIComponent('http://www.mutantplayground.com')));
                        });

                        describe('if there is no ad tag', function() {
                            beforeEach(function() {
                                card.data.videoid = null;
                            });

                            it('should be null', function() {
                                expect(SponsorCardVideoCtrl.adTag).toBeNull();
                            });
                        });
                    });
                });
            });

            describe('isAdUnit', function() {
                describe('getting', function() {
                    describe('if the service is "adUnit"', function() {
                        beforeEach(function() {
                            card.data.service = 'adUnit';
                        });

                        it('should be true', function() {
                            expect(SponsorCardVideoCtrl.isAdUnit).toBe(true);
                        });
                    });

                    describe('if the service is anything else', function() {
                        ['youtube', 'vimeo', 'dailymotion'].forEach(function(service) {
                            it('should be false', function() {
                                card.data.service = service;
                                expect(SponsorCardVideoCtrl.isAdUnit).toBe(false);
                            });
                        });
                    });
                });

                describe('setting', function() {
                    describe('when set to true', function() {
                        beforeEach(function() {
                            SponsorCardVideoCtrl.isAdUnit = true;
                        });

                        it('should set the service to "adUnit"', function() {
                            expect(card.data.service).toBe('adUnit');
                        });
                    });

                    describe('when set to false', function() {
                        beforeEach(function() {
                            card.data.service = 'adUnit';
                            SponsorCardVideoCtrl.isAdUnit = false;
                        });

                        it('should set the service to null', function() {
                            expect(card.data.service).toBeNull();
                        });
                    });
                });
            });

            describe('skipOptions', function() {
                it('should be a hash of skip options', function() {
                    expect(SponsorCardVideoCtrl.skipOptions).toEqual({
                        'No, users cannot skip': 'never',
                        'Yes, after six seconds': 'delay',
                        'Yes, skip at any time': 'anytime'
                    });
                });
            });

            describe('autoplayOptions', function() {
                it('should be a hash of autoplay options', function() {
                    expect(SponsorCardVideoCtrl.autoplayOptions).toEqual({
                        'Use MiniReel defaults': null,
                        'Yes': true,
                        'No': false
                    });
                });
            });

            describe('autoadvanceOptions', function() {
                it('should be a hash of autoadvance options', function() {
                    expect(SponsorCardVideoCtrl.autoadvanceOptions).toEqual({
                        'Yes': true,
                        'No': false
                    });
                });
            });
        });
    });
});
