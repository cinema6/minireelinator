define(['app','minireel/sponsor'], function(appModule, sponsorModule) {
    'use strict';

    describe('SponsorMiniReelDisplayAdController', function() {
        var $rootScope,
            $controller,
            MiniReelService,
            $scope,
            SponsorMiniReelDisplayAdCtrl;

        var endcapCard;

        beforeEach(function() {
            module(appModule.name);
            module(sponsorModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                MiniReelService = $injector.get('MiniReelService');

                endcapCard = MiniReelService.createCard();

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorMiniReelDisplayAdCtrl = $controller('SponsorMiniReelDisplayAdController', {
                        $scope: $scope
                    });
                    SponsorMiniReelDisplayAdCtrl.model = endcapCard;
                });
            });
        });

        it('should exist', function() {
            expect(SponsorMiniReelDisplayAdCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('cardType', function() {
                describe('getting', function() {
                    it('should return the type of the card', function() {
                        expect(SponsorMiniReelDisplayAdCtrl.cardType).toBe(endcapCard.type);

                        MiniReelService.setCardType(endcapCard, 'displayAd');
                        expect(SponsorMiniReelDisplayAdCtrl.cardType).toBe(endcapCard.type);

                        MiniReelService.setCardType(endcapCard, 'recap');
                        expect(SponsorMiniReelDisplayAdCtrl.cardType).toBe(endcapCard.type);
                    });
                });

                describe('setting', function() {
                    beforeEach(function() {
                        spyOn(MiniReelService, 'setCardType').and.callThrough();
                    });

                    it('should set the card to the given type', function() {
                        ['displayAd', 'recap'].forEach(function(type) {
                            expect(SponsorMiniReelDisplayAdCtrl.cardType = type).toBe(type);
                            expect(MiniReelService.setCardType).toHaveBeenCalledWith(endcapCard, type);
                        });
                    });
                });
            });
        });
    });
});
