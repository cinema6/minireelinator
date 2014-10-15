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
        });
    });
});
