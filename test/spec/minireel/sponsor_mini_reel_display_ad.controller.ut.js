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

                    describe('if the penultimate card is a displayAd', function() {
                        beforeEach(function() {
                            MiniReelService.setCardType(deck[deck.length - 2], 'displayAd');
                        });

                        it('should be true', function() {
                            expect(SponsorMiniReelDisplayAdCtrl.adInserted).toBe(true);
                        });
                    });
                });

                describe('setting', function() {
                    var length;

                    beforeEach(function() {
                        length = deck.length;
                    });

                    describe('to true', function() {
                        beforeEach(function() {
                            MiniReelService.setCardType(deck[deck.length - 2], 'video');

                            SponsorMiniReelDisplayAdCtrl.adInserted = true;
                            SponsorMiniReelDisplayAdCtrl.adInserted = true;
                        });

                        it('should insert a new displayAd card as the penultimate card', function() {
                            expect(deck[deck.length - 2]).toEqual(jasmine.objectContaining((function() {
                                var card = MiniReelService.createCard('displayAd');

                                delete card.id;

                                return card;
                            }())));
                            expect(deck.length).toBe(length + 1);
                        });
                    });

                    describe('to false', function() {
                        var displayAdCard;

                        beforeEach(function() {
                            displayAdCard = MiniReelService.setCardType(deck[deck.length - 2], 'displayAd');

                            SponsorMiniReelDisplayAdCtrl.adInserted = false;
                            SponsorMiniReelDisplayAdCtrl.adInserted = false;
                        });

                        it('should remove the penultimate card', function() {
                            expect(deck[deck.length - 2]).not.toBe(displayAdCard);
                            expect(deck.length).toBe(length - 1);
                        });
                    });
                });
            });
        });
    });
});
