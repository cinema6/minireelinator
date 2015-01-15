define(['app'], function(appModule) {
    'use strict';

    describe('MiniReelGroupCardsController', function() {
        var $rootScope,
            $controller,
            cinema6,
            MiniReelService,
            $scope,
            CampaignCtrl,
            MiniReelGroupCardsCtrl;

        var cards, campaignCards;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignCtrl = $scope.CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(cinema6.db.create('campaign', {
                        links: {},
                        cards: []
                    }));
                    campaignCards = CampaignCtrl.model.cards;

                    MiniReelGroupCardsCtrl = $scope.MiniReelGroupCardsCtrl = $controller('MiniReelGroupCardsController', {
                        $scope: $scope
                    });
                    cards = MiniReelGroupCardsCtrl.model = [];
                });
            });
        });

        it('should exist', function() {
            expect(MiniReelGroupCardsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('campaignCards', function() {
                it('should be the campaign\'s cards', function() {
                    expect(MiniReelGroupCardsCtrl.campaignCards).toBe(CampaignCtrl.model.cards);
                });
            });
        });

        describe('methods', function() {
            describe('add(card)', function() {
                var card;

                beforeEach(function() {
                    card = cinema6.db.create('card', MiniReelService.createCard('videoBallot'));

                    cards.push.apply(cards, ['video', 'videoBallot'].map(function(type) {
                        return cinema6.db.create('card', MiniReelService.createCard(type));
                    }));

                    MiniReelGroupCardsCtrl.add(card);
                });

                it('should add the cards to its model', function() {
                    expect(cards[2]).toBe(card);
                });
            });

            describe('remove(card)', function() {
                var removed;

                beforeEach(function() {
                    cards.push.apply(cards, ['video', 'videoBallot', 'video', 'text'].map(function(type) {
                        return cinema6.db.create('card', MiniReelService.createCard(type));
                    }));
                    removed = cards[2];

                    MiniReelGroupCardsCtrl.remove(removed);
                });

                it('should remove the card from its model', function() {
                    expect(cards.length).toBe(3);
                    expect(cards).not.toContain(removed);
                });
            });

            describe('isNotBeingTargeted(card)', function() {
                var isNotBeingTargeted;

                var notTargeted;

                beforeEach(function() {
                    isNotBeingTargeted = MiniReelGroupCardsCtrl.isNotBeingTargeted;

                    cards.push.apply(cards, ['video', 'videoBallot', 'video', 'text'].map(function(type) {
                        return cinema6.db.create('card', MiniReelService.createCard(type));
                    }));
                    notTargeted = ['video', 'videoBallot', 'video'].map(function(type) {
                        return cinema6.db.create('card', MiniReelService.createCard(type));
                    });
                });

                describe('if the card is not in the model array', function() {
                    it('should be true', function() {
                        notTargeted.forEach(function(card) {
                            expect(isNotBeingTargeted(card)).toBe(true);
                        });
                    });
                });

                describe('if the card is in the model array', function() {
                    it('should be false', function() {
                        cards.forEach(function(card) {
                            expect(isNotBeingTargeted(card)).toBe(false);
                        });
                    });
                });
            });
        });
    });
});
