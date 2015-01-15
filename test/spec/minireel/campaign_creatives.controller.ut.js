define(['minireel/campaign'], function(campaignModule) {
    'use strict';

    describe('CampaignCreativesController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            CampaignCtrl,
            CampaignCreativesCtrl;

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

                    $scope.CampaignCreativesCtrl = CampaignCreativesCtrl = $controller('CampaignCreativesController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CampaignCreativesCtrl).toEqual(jasmine.any(Object));
        });

        describe('remove(item)', function() {
            beforeEach(function() {
                campaign.miniReels.push.apply(campaign.miniReels, ['e-f8f1341c77fb57', 'e-095e8df1cdd0c1', 'e-11e1cc3b9efa7f'].map(function(id) {
                    return cinema6.db.create('experience', {
                        id: id,
                        data: {
                            deck: []
                        }
                    });
                }));

                campaign.cards.push.apply(campaign.cards, ['rc-69f8ae2e995e0d', 'rc-fe5d81d4ad982f', 'rc-9555f364197617'].map(function(id) {
                    return cinema6.db.create('card', {
                        id: id,
                        data: {}
                    });
                }));
            });

            describe('if called with a minireel', function() {
                var minireel;

                beforeEach(function() {
                    minireel = campaign.miniReels[2];

                    CampaignCreativesCtrl.remove(minireel);
                });

                it('should remove the minireel', function() {
                    expect(campaign.cards.length).toBe(3);
                    expect(campaign.miniReels.length).toBe(2);
                    expect(campaign.miniReels).not.toContain(minireel);
                });
            });

            describe('if called with a card', function() {
                var card;

                beforeEach(function() {
                    card = campaign.cards[1];

                    CampaignCreativesCtrl.remove(card);
                });

                it('should remove the card', function() {
                    expect(campaign.miniReels.length).toBe(3);
                    expect(campaign.cards.length).toBe(2);
                    expect(campaign.cards).not.toContain(card);
                });
            });
        });

        describe('add(item)', function() {
            var result;

            beforeEach(function() {
                campaign.miniReels.push.apply(campaign.miniReels, ['e-f8f1341c77fb57', 'e-095e8df1cdd0c1', 'e-11e1cc3b9efa7f'].map(function(id) {
                    return cinema6.db.create('experience', {
                        id: id,
                        data: {
                            deck: []
                        }
                    });
                }));

                campaign.cards.push.apply(campaign.cards, ['rc-69f8ae2e995e0d', 'rc-fe5d81d4ad982f', 'rc-9555f364197617'].map(function(id) {
                    return cinema6.db.create('card', {
                        id: id,
                        data: {}
                    });
                }));
            });

            describe('if called with a minireel', function() {
                var minireel;

                beforeEach(function() {
                    minireel = cinema6.db.create('experience', {
                        id: 'e-5480ecc1063d7e',
                        data: {
                            deck: []
                        }
                    });

                    result = CampaignCreativesCtrl.add(minireel);
                });

                it('should add the minireel to the campaign', function() {
                    expect(campaign.miniReels[3]).toBe(minireel);
                });

                it('should return the minireel', function() {
                    expect(result).toBe(minireel);
                });

                describe('if called with a minireel that is already added', function() {
                    beforeEach(function() {
                        result = CampaignCreativesCtrl.add(minireel);
                    });

                    it('should return the minireel', function() {
                        expect(result).toBe(minireel);
                    });

                    it('should not add the minireel again', function() {
                        expect(campaign.miniReels[3]).toBe(minireel);
                        expect(campaign.miniReels[4]).not.toBeDefined();
                    });
                });
            });

            describe('if called with a card', function() {
                var card;

                beforeEach(function() {
                    card = cinema6.db.create('card', {
                        id: 'rc-5480ecc1063d7e',
                        data: {}
                    });

                    result = CampaignCreativesCtrl.add(card);
                });

                it('should add the card to the campaign', function() {
                    expect(campaign.cards[3]).toBe(card);
                });

                it('should return the card', function() {
                    expect(result).toBe(card);
                });

                describe('if called with a card that is already added', function() {
                    beforeEach(function() {
                        result = CampaignCreativesCtrl.add(card);
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
});
