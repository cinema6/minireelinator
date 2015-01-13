define(['angular', 'app'], function(angular, appModule) {
    'use strict';

    var extend = angular.extend;

    describe('PlacementsMiniReelController', function() {
        var $rootScope,
            $controller,
            cinema6,
            c6State,
            MiniReelService,
            $scope,
            CampaignCtrl,
            PlacementsMiniReelCtrl;

        var campaign, entry;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignCtrl = $scope.CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign = cinema6.db.create('campaign', {
                        links: {},
                        cards: [
                            cinema6.db.create('card', extend(MiniReelService.createCard('video'), {
                                title: 'The Coolest Card'
                            })),
                            cinema6.db.create('card', extend(MiniReelService.createCard('video'), {
                                title: 'The Funniest Card'
                            })),
                            cinema6.db.create('card', extend(MiniReelService.createCard('video'), {
                                title: 'My Favorite Card'
                            }))
                        ]
                    }));

                    PlacementsMiniReelCtrl = $scope.PlacementsMiniReelCtrl = $controller('PlacementsMiniReelController', {
                        $scope: $scope
                    });
                    PlacementsMiniReelCtrl.initWithModel(entry = {
                        minireel: cinema6.db.create('experience', {
                            id: 'e-a064b66a0c2527',
                            data: {
                                deck: []
                            }
                        }),
                        cards: [
                            {
                                placeholder: {
                                    id: 'rc-6b4f450701bced'
                                },
                                wildcard: null
                            },
                            {
                                placeholder: {
                                    id: 'rc-6495aab6453c51'
                                },
                                wildcard: campaign.cards[1]
                            },
                            {
                                placeholder: {
                                    id: 'rc-8df0f78f0b5832'
                                },
                                wildcard: campaign.cards[0]
                            }
                        ]
                    });
                });
            });
        });

        it('should exist', function() {
            expect(PlacementsMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be a shallow copy of the entry', function() {
                    var model = PlacementsMiniReelCtrl.model;

                    expect(model).not.toBe(entry);
                    expect(model).toEqual(entry);
                    expect(model.minireel).toBe(entry.minireel);
                    expect(model.cards).not.toBe(entry.cards);
                    model.cards.forEach(function(item, index) {
                        expect(item).not.toBe(entry.cards[index]);

                        expect(item.placeholder).toBe(entry.cards[index].placeholder);
                        expect(item.wildcard).toBe(entry.cards[index].wildcard);
                    });
                });
            });

            describe('original', function() {
                it('should be the entry', function() {
                    expect(PlacementsMiniReelCtrl.original).toBe(entry);
                });
            });

            describe('cardOptions', function() {
                it('should be a map of card titles to card objects', function() {
                    expect(PlacementsMiniReelCtrl.cardOptions).toEqual({
                        'None': null,
                        'The Coolest Card': campaign.cards[0],
                        'The Funniest Card': campaign.cards[1],
                        'My Favorite Card': campaign.cards[2]
                    });
                });
            });
        });

        describe('methods', function() {
            describe('confirm()', function() {
                var model;

                beforeEach(function() {
                    model = PlacementsMiniReelCtrl.model;

                    spyOn(c6State, 'goTo');

                    model.cards[0].wildcard = campaign.cards[2];
                    model.cards[1].wildcard = campaign.cards[0];
                    model.cards[2].wildcard = null;

                    $scope.$apply(function() {
                        PlacementsMiniReelCtrl.confirm();
                    });
                });

                it('should just copy the wildcards from the copy to the original', function() {
                    expect(entry.minireel).toBe(model.minireel);

                    entry.cards.forEach(function(item, index) {
                        var copyItem = model.cards[index];

                        expect(item.placeholder).toBe(copyItem.placeholder);
                        expect(item.wildcard).toBe(copyItem.wildcard);
                    });
                });

                it('should go to the "MR:Campaign.Placements" state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.Placements');
                });
            });
        });
    });
});
