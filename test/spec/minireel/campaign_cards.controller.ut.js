define(['app'], function(appModule) {
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
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');

                campaign = cinema6.db.create('campaign', {
                    id: 'cam-74070a860d121e',
                    links: {},
                    miniReels: [],
                    cards: [],
                    brand: 'Diageo'
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
            var data;

            beforeEach(function() {
                campaign.cards.push.apply(campaign.cards, ['rc-69f8ae2e995e0d', 'rc-fe5d81d4ad982f', 'rc-9555f364197617'].map(function(id) {
                    return {
                        id: id,
                        item: cinema6.db.create('card', {
                            id: id,
                            data: {}
                        })
                    };
                }));

                data = campaign.cards[1];
                card = data.item;

                CampaignCardsCtrl.remove(card);
            });

            it('should remove the card', function() {
                expect(campaign.cards.length).toBe(2);
                expect(campaign.cards).not.toContain(data);
            });
        });

        describe('add(item)', function() {
            var result;
            var card;
            var data;

            beforeEach(function() {
                campaign.cards.push.apply(campaign.cards, ['rc-69f8ae2e995e0d', 'rc-fe5d81d4ad982f', 'rc-9555f364197617'].map(function(id) {
                    return {
                        id: id,
                        item: cinema6.db.create('card', {
                            id: id,
                            data: {}
                        })
                    };
                }));

                card = cinema6.db.create('card', {
                    id: 'rc-5480ecc1063d7e',
                    data: {}
                });

                data = {
                    endDate: new Date(),
                    reportingId: '12345'
                };

                result = CampaignCardsCtrl.add(card, data);
            });

            it('should add the card to the campaign', function() {
                expect(campaign.cards[3]).toEqual({
                    id: card.id,
                    item: card,
                    endDate: data.endDate,
                    reportingId: '12345'
                });
            });

            it('should return the card', function() {
                expect(result).toBe(card);
            });

            describe('if called with a card that is already added', function() {
                var newDate;

                beforeEach(function() {
                    newDate = new Date(0);

                    result = CampaignCardsCtrl.add(card, {
                        endDate: newDate,
                        reportingId: '999999'
                    });
                });

                it('should return the card', function() {
                    expect(result).toBe(card);
                });

                it('should not add the minireel again', function() {
                    expect(campaign.cards[4]).not.toBeDefined();
                });

                it('should udpate the item', function() {
                    expect(campaign.cards[3]).toEqual({
                        id: card.id,
                        item: card,
                        endDate: newDate,
                        reportingId: '999999'
                    });
                });
            });
        });
    });
});
