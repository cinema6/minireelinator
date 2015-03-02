define(['minireel/campaign'], function(campaignModule) {
    'use strict';

    describe('CampaignCardsController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            CampaignCtrl,
            CampaignCardsCtrl;

        var campaign;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');

                campaign = cinema6.db.create('campaign', {
                    id: 'cam-74070a860d121e',
                    links: {},
                    miniReels: [],
                    cards: []
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.CampaignCtrl = CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign);

                    $scope.CampaignCardsCtrl = CampaignCardsCtrl = $controller('CampaignCardsController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CampaignCardsCtrl).toEqual(jasmine.any(Object));
        });

        describe('remove(item)', function() {
            var card;

            beforeEach(function() {
                campaign.cards.push.apply(campaign.cards, ['rc-69f8ae2e995e0d', 'rc-fe5d81d4ad982f', 'rc-9555f364197617'].map(function(id) {
                    return cinema6.db.create('card', {
                        id: id,
                        data: {}
                    });
                }));

                card = campaign.cards[1];

                CampaignCardsCtrl.remove(card);
            });

            it('should remove the card', function() {
                expect(campaign.cards.length).toBe(2);
                expect(campaign.cards).not.toContain(card);
            });
        });

        describe('add(item)', function() {
            var result;
            var card;

            beforeEach(function() {
                campaign.cards.push.apply(campaign.cards, ['rc-69f8ae2e995e0d', 'rc-fe5d81d4ad982f', 'rc-9555f364197617'].map(function(id) {
                    return cinema6.db.create('card', {
                        id: id,
                        data: {}
                    });
                }));

                card = cinema6.db.create('card', {
                    id: 'rc-5480ecc1063d7e',
                    data: {}
                });

                result = CampaignCardsCtrl.add(card);
            });

            it('should add the card to the campaign', function() {
                expect(campaign.cards[3]).toBe(card);
            });

            it('should return the card', function() {
                expect(result).toBe(card);
            });

            describe('if called with a card that is already added', function() {
                beforeEach(function() {
                    result = CampaignCardsCtrl.add(card);
                });

                it('should return the card', function() {
                    expect(result).toBe(card);
                });

                it('should not add the minireel again', function() {
                    expect(campaign.cards[3]).toBe(card);
                    expect(campaign.cards[4]).not.toBeDefined();
                });
            });
        });
    });
});
