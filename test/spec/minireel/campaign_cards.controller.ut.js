define(['app'], function(appModule) {
    'use strict';

    describe('CampaignCardsController', function() {
        var $rootScope,
            $controller,
            cinema6,
            c6State,
            $scope,
            ThumbnailService,
            CampaignCtrl,
            CampaignCardsCtrl;

        var campaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                ThumbnailService = $injector.get('ThumbnailService');

                campaign = cinema6.db.create('campaign', {
                    id: 'cam-74070a860d121e',
                    links: {},
                    miniReels: [],
                    cards: [],
                    brand: 'Diageo'
                });

                $scope = $rootScope.$new();
                $scope.MiniReelCtrl = {
                    model: {
                        data: {
                            campaigns: {
                                pricing: {
                                    dailyLimit: {},
                                    budget: {},
                                    cost: {}
                                }
                            }
                        }
                    }
                };
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

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            cinema6 = null;
            c6State = null;
            $scope = null;
            ThumbnailService = null;
            CampaignCtrl = null;
            CampaignCardsCtrl = null;
            campaign = null;
        });

        it('should exist', function() {
            expect(CampaignCardsCtrl).toEqual(jasmine.any(Object));
        });

        describe('getThumb(card)', function() {
            beforeEach(function() {
                spyOn(ThumbnailService, 'getThumbsFor').and.returnValue({
                    small: 'www.example.com/small.jpg'
                });
            });

            it('should return null if not passed a card', function() {
                expect(CampaignCardsCtrl.getThumb(undefined)).toBe(null);
                expect(CampaignCardsCtrl.getThumb(null)).toBe(null);
            });

            it('should return the thumb property if it exists', function() {
                var input = {
                    thumb: 'www.example.com/thumb.jpg'
                };
                expect(CampaignCardsCtrl.getThumb(input)).toBe('www.example.com/thumb.jpg');
            });

            it('should return the thumbUrl property if it exists', function() {
                var input = {
                    data: {
                        thumbUrl: 'www.example.com/thumb.jpg'
                    }
                };
                expect(CampaignCardsCtrl.getThumb(input)).toBe('www.example.com/thumb.jpg');
            });

            it('should get thumbs for a video card', function() {
                var input = {
                    data: {
                        videoid: 'abc123',
                        service: 'youtube'
                    }
                };
                CampaignCardsCtrl.getThumb(input);
                expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', 'abc123', {
                    videoid: 'abc123',
                    service: 'youtube'
                });
            });

            it('should get thumbs for an image card', function() {
                var input = {
                    data: {
                        imageid: 'abc123',
                        service: 'flickr'
                    }
                };
                CampaignCardsCtrl.getThumb(input);
                expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('flickr', 'abc123', {
                    imageid: 'abc123',
                    service: 'flickr'
                });
            });

            it('should get thumbs for an instagram card', function() {
                var input = {
                    data: {
                        id: 'abc123'
                    },
                    type: 'instagram'
                };
                CampaignCardsCtrl.getThumb(input);
                expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('instagram', 'abc123', {
                    id: 'abc123'
                });
            });
        });

        describe('remove(card)', function() {
            var card;

            beforeEach(function() {
                campaign.cards.push.apply(campaign.cards, ['rc-69f8ae2e995e0d', 'rc-fe5d81d4ad982f', 'rc-9555f364197617'].map(function(id) {
                    return {
                        id: id,
                        type: 'adUnit',
                        data: {},
                        campaign: {}
                    };
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
                    return {
                        id: id,
                        item: cinema6.db.create('card', {
                            id: id,
                            data: {}
                        })
                    };
                }));

                card = {
                    id: 'rc-5480ecc1063d7e',
                    data: {}
                };

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

                it('should not add the card again', function() {
                    expect(campaign.cards[4]).not.toBeDefined();
                });
            });
        });
    });
});
