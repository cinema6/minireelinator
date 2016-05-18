define(['app','minireel/sponsor'], function(appModule, sponsorModule) {
    'use strict';

    describe('SponsorMiniReelDisplayAdController', function() {
        var $rootScope,
            $controller,
            MiniReelService,
            $scope,
            SponsorMiniReelDisplayAdCtrl;

        var deck;

        beforeEach(function() {
            module(appModule.name);
            module(sponsorModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                MiniReelService = $injector.get('MiniReelService');

                deck = [
                    'text',
                    'video',
                    'video',
                    'videoBallot',
                    'video',
                    'recap'
                ].map(function(type) {
                    return MiniReelService.createCard(type);
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorMiniReelDisplayAdCtrl = $controller('SponsorMiniReelDisplayAdController', {
                        $scope: $scope
                    });
                    SponsorMiniReelDisplayAdCtrl.model = deck;
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            MiniReelService = null;
            $scope = null;
            SponsorMiniReelDisplayAdCtrl = null;
            deck = null;
        });

        it('should exist', function() {
            expect(SponsorMiniReelDisplayAdCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('adInserted', function() {
                describe('getting', function() {
                    describe('if the penultimate card is not a displayAd', function() {
                        beforeEach(function() {
                            MiniReelService.setCardType(deck[deck.length - 2], 'video');
                        });

                        it('should be false', function() {
                            expect(SponsorMiniReelDisplayAdCtrl.adInserted).toBe(false);
                        });
                    });
                });
            });
        });
    });
});
