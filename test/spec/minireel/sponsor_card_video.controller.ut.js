define(['app','minireel/mixins/VideoCardController'], function(appModule, VideoCardController) {
    'use strict';

    describe('SponsorCardVideoController', function() {
        var $injector,
            $rootScope,
            $controller,
            MiniReelService,
            $scope,
            c6State, portal,
            SponsorCardVideoCtrl;

        var card;

        beforeEach(function() {
            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                MiniReelService = $injector.get('MiniReelService');
                c6State = $injector.get('c6State');
                portal = c6State.get('Portal');
                portal.cModel = {};

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardVideoCtrl = $controller('SponsorCardVideoController', {
                        $scope: $scope
                    });
                    card = SponsorCardVideoCtrl.model = MiniReelService.createCard('video');
                    card.data.service = 'youtube';
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

            describe('canSkip', function() {
                describe('getting', function() {
                    describe('when card.data.skip === "anytime"', function() {
                        beforeEach(function() {
                            card.data.skip = 'anytime';
                        });

                        it('should be true', function() {
                            expect(SponsorCardVideoCtrl.canSkip).toBe(true);
                        });
                    });

                    describe('when card.data.skip is anything else', function() {
                        it('should be false', function() {
                            card.data.skip = 'delay';
                            expect(SponsorCardVideoCtrl.canSkip).toBe(false);

                            card.data.skip = 'never';
                            expect(SponsorCardVideoCtrl.canSkip).toBe(false);

                            card.data.skip = 'delay';
                            expect(SponsorCardVideoCtrl.canSkip).toBe(false);

                            card.data.skip = 30;
                            expect(SponsorCardVideoCtrl.canSkip).toBe(false);
                        });
                    });
                });

                describe('setting', function() {
                    describe('to true', function() {
                        beforeEach(function() {
                            card.data.skip = 6;

                            SponsorCardVideoCtrl.canSkip = true;
                        });

                        it('should set card.data.skip to "anytime"', function() {
                            expect(card.data.skip).toBe('anytime');
                        });
                    });

                    describe('to false', function() {
                        beforeEach(function() {
                            card.data.skip = 'anytime';

                            SponsorCardVideoCtrl.canSkip = false;
                        });

                        it('should set card.data.skip to "delay"', function() {
                            expect(card.data.skip).toBe('delay');
                        });
                    });
                });
            });

            describe('skip', function() {
                describe('getting', function() {
                    describe('if card.data.skip === "delay"', function() {
                        beforeEach(function() {
                            card.data.skip = 'delay';
                        });

                        it('should be the numerical delayed skip value', function() {
                            expect(SponsorCardVideoCtrl.skip).toBe(MiniReelService.convertCard(card).data.skip);
                        });
                    });

                    describe('if card.data.skip is numerical', function() {
                        it('should be that number', function() {
                            [1, 5, 7, 6, 4].forEach(function(number) {
                                card.data.skip = number;

                                expect(SponsorCardVideoCtrl.skip).toBe(number);
                            });
                        });
                    });
                });

                describe('setting', function() {
                    it('should proxy to card.data.skip', function() {
                        [1, 3, 2, 6, 10].forEach(function(number) {
                            SponsorCardVideoCtrl.skip = number;

                            expect(card.data.skip).toBe(number);
                        });
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
