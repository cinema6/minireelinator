define(['app','minireel/mixins/VideoCardController'], function(appModule, VideoCardController) {
    'use strict';

    describe('WildcardVideoController', function() {
        var $injector,
            $rootScope,
            $controller,
            MiniReelService,
            $scope,
            c6State, portal,
            WildcardVideoCtrl;

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
                    WildcardVideoCtrl = $controller('WildcardVideoController', {
                        $scope: $scope
                    });
                    card = WildcardVideoCtrl.model = MiniReelService.createCard('video');
                    card.data.service = 'youtube';
                });
            });
        });

        it('should exist', function() {
            expect(WildcardVideoCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the VideoCardController mixin', function() {
            expect(Object.keys(WildcardVideoCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(VideoCardController))));
        });

        describe('properties', function() {
            describe('vastTag', function() {
                describe('getting', function() {
                    describe('if there is no videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = null;
                        });

                        it('should be null', function() {
                            expect(WildcardVideoCtrl.vastTag).toBeNull();
                        });
                    });

                    describe('if there is a videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = JSON.stringify({
                                vast: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            });
                        });

                        it('should be the vast tag', function() {
                            expect(WildcardVideoCtrl.vastTag).toBe('http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov');
                        });
                    });
                });

                describe('setting', function() {
                    describe('if there is no videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = null;

                            WildcardVideoCtrl.vastTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
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

                            WildcardVideoCtrl.vastTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvTfWmlP8j6NQnxBMIgFJa80=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
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
                            expect(WildcardVideoCtrl.vpaidTag).toBeNull();
                        });
                    });

                    describe('if there is a videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = JSON.stringify({
                                vpaid: 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov'
                            });
                        });

                        it('should be the vast tag', function() {
                            expect(WildcardVideoCtrl.vpaidTag).toBe('http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov');
                        });
                    });
                });

                describe('setting', function() {
                    describe('if there is no videoid', function() {
                        beforeEach(function() {
                            card.data.videoid = null;

                            WildcardVideoCtrl.vpaidTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
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

                            WildcardVideoCtrl.vpaidTag = 'http://u-ads.adap.tv/a/h/DCQzzI0K2rv1k0TZythPvYyD60pQS_90o8grI6Qm2PI=?cb={cachebreaker}&pageUrl={pageUrl}&eov=eov';
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
                    expect(WildcardVideoCtrl.adPreviewType).toBe('vpaid');
                });
            });

            describe('adPreviewPageUrl', function() {
                it('should be an empty string', function() {
                    expect(WildcardVideoCtrl.adPreviewPageUrl).toBe('');
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
                            WildcardVideoCtrl.adPreviewPageUrl = 'http://www.mutantplayground.com';

                            WildcardVideoCtrl.adPreviewType = type;
                        });

                        it('should compile the ad tag with the pageUrl macro', function() {
                            expect(WildcardVideoCtrl.adTag).toBe(WildcardVideoCtrl[type + 'Tag'].replace('{pageUrl}', encodeURIComponent('http://www.mutantplayground.com')));
                        });

                        describe('if there is no ad tag', function() {
                            beforeEach(function() {
                                card.data.videoid = null;
                            });

                            it('should be null', function() {
                                expect(WildcardVideoCtrl.adTag).toBeNull();
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
                            expect(WildcardVideoCtrl.isAdUnit).toBe(true);
                        });
                    });

                    describe('if the service is anything else', function() {
                        ['youtube', 'vimeo', 'dailymotion'].forEach(function(service) {
                            it('should be false', function() {
                                card.data.service = service;
                                expect(WildcardVideoCtrl.isAdUnit).toBe(false);
                            });
                        });
                    });
                });

                describe('setting', function() {
                    describe('when set to true', function() {
                        beforeEach(function() {
                            WildcardVideoCtrl.isAdUnit = true;
                        });

                        it('should set the service to "adUnit"', function() {
                            expect(card.data.service).toBe('adUnit');
                        });
                    });

                    describe('when set to false', function() {
                        beforeEach(function() {
                            card.data.service = 'adUnit';
                            WildcardVideoCtrl.isAdUnit = false;
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
                            expect(WildcardVideoCtrl.canSkip).toBe(true);
                        });
                    });

                    describe('when card.data.skip is anything else', function() {
                        it('should be false', function() {
                            card.data.skip = 'delay';
                            expect(WildcardVideoCtrl.canSkip).toBe(false);

                            card.data.skip = 'never';
                            expect(WildcardVideoCtrl.canSkip).toBe(false);

                            card.data.skip = 'delay';
                            expect(WildcardVideoCtrl.canSkip).toBe(false);

                            card.data.skip = 30;
                            expect(WildcardVideoCtrl.canSkip).toBe(false);
                        });
                    });
                });

                describe('setting', function() {
                    describe('to true', function() {
                        beforeEach(function() {
                            card.data.skip = 6;

                            WildcardVideoCtrl.canSkip = true;
                        });

                        it('should set card.data.skip to "anytime"', function() {
                            expect(card.data.skip).toBe('anytime');
                        });
                    });

                    describe('to false', function() {
                        beforeEach(function() {
                            card.data.skip = 'anytime';

                            WildcardVideoCtrl.canSkip = false;
                        });

                        it('should set card.data.skip to "delay"', function() {
                            expect(card.data.skip).toBe('delay');
                        });
                    });
                });
            });

            describe('skipTime', function() {
                describe('getting', function() {
                    describe('if card.data.skip === "delay"', function() {
                        beforeEach(function() {
                            card.data.skip = 'delay';
                        });

                        it('should be the numerical delayed skip value', function() {
                            expect(WildcardVideoCtrl.skipTime).toBe(MiniReelService.getSkipValue(card.data.skip));
                        });
                    });

                    describe('if card.data.skip is numerical', function() {
                        it('should be that number', function() {
                            [1, 5, 7, 6, 4].forEach(function(number) {
                                card.data.skip = number;

                                expect(WildcardVideoCtrl.skipTime).toBe(number);
                            });
                        });
                    });
                });

                describe('setting', function() {
                    it('should proxy to card.data.skip', function() {
                        [1, 3, 2, 6, 10].forEach(function(number) {
                            WildcardVideoCtrl.skipTime = number;

                            expect(card.data.skip).toBe(number);
                        });
                    });
                });
            });

            describe('mustWatchInEntirety', function() {
                describe('getting', function() {
                    describe('if card.data.skip === "never"', function() {
                        beforeEach(function() {
                            card.data.skip = 'never';
                        });

                        it('should be true', function() {
                            expect(WildcardVideoCtrl.mustWatchInEntirety).toBe(true);
                        });
                    });

                    ['anytime', 'delay', 3, 6, 1].forEach(function(value) {
                        describe('if card.data.skip === ' + value, function() {
                            beforeEach(function() {
                                card.data.skip = value;
                            });

                            it('should be false', function() {
                                expect(WildcardVideoCtrl.mustWatchInEntirety).toBe(false);
                            });
                        });
                    });
                });

                describe('setting', function() {
                    describe('to true', function() {
                        beforeEach(function() {
                            card.data.skip = 'delay';

                            WildcardVideoCtrl.mustWatchInEntirety = true;
                        });

                        it('should set card.data.skip to "never"', function() {
                            expect(card.data.skip).toBe('never');
                        });
                    });

                    describe('to false', function() {
                        beforeEach(function() {
                            card.data.skip = 'never';

                            WildcardVideoCtrl.mustWatchInEntirety = false;
                        });

                        it('should set card.data.skip to "delay"', function() {
                            expect(card.data.skip).toBe('delay');
                        });
                    });
                });
            });

            describe('autoplayOptions', function() {
                it('should be a hash of autoplay options', function() {
                    expect(WildcardVideoCtrl.autoplayOptions).toEqual({
                        'Use MiniReel defaults': null,
                        'Yes': true,
                        'No': false
                    });
                });
            });

            describe('autoadvanceOptions', function() {
                it('should be a hash of autoadvance options', function() {
                    expect(WildcardVideoCtrl.autoadvanceOptions).toEqual({
                        'Yes': true,
                        'No': false
                    });
                });
            });
        });
    });
});
