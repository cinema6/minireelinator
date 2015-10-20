define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Manage:Campaign State', function() {
        var $rootScope,
            $q,
            campaignState,
            selfieState,
            newCampaignState,
            c6State,
            cinema6,
            MiniReelService;

        var card,
            categories,
            campaign,
            paymentMethods;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                card = cinema6.db.create('card', MiniReelService.createCard('video'));
                categories = [
                    {
                        id: 'cat-1'
                    },
                    {
                        id: 'cat-2'
                    },
                    {
                        id: 'cat-3'
                    }
                ];
                campaign = {
                    id: 'cam-123',
                    cards: [],
                    links: {}
                };
                paymentMethods = [
                    {
                        id: 'pay-1',
                        token: 'pay-1'
                    },
                    {
                        id: 'pay-2',
                        token: 'pay-2'
                    },
                    {
                        id: 'pay-3',
                        token: 'pay-3'
                    }
                ];

                selfieState = c6State.get('Selfie');
                selfieState.cModel = {
                    advertiser: {},
                    org: {
                        id: 'o-123'
                    }
                };
                campaignState = c6State.get('Selfie:Manage:Campaign');
            });
        });

        it('should exist', function() {
            expect(campaignState).toEqual(jasmine.any(Object));
        });

        describe('card', function() {
            it('should be null', function() {
                expect(campaignState.card).toBe(null);
            });
        });

        describe('campaign', function() {
            it('should be null', function() {
                expect(campaignState.campaign).toBe(null);
            });
        });

        describe('beforeModel()', function() {
            it('should put the card and campaign on the state object', function() {
                campaignState.cParent.campaign = campaign;
                campaignState.cParent.card = card;

                campaignState.beforeModel();

                expect(campaignState.card).toEqual(card);
                expect(campaignState.campaign).toEqual(campaign);
            });
        });

        describe('model()', function() {
            it('should find all categories', function() {
                var success = jasmine.createSpy('success()'),
                    failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'findAll').and.callFake(function(type) {
                    if (type === 'category') {
                        return $q.when(categories);
                    }
                    if (type === 'paymentMethod') {
                        return $q.when(paymentMethods);
                    }
                });

                $rootScope.$apply(function() {
                    campaignState.model().then(success, failure);
                });
                expect(cinema6.db.findAll).toHaveBeenCalledWith('category');
                expect(cinema6.db.findAll).toHaveBeenCalledWith('paymentMethod');
                expect(success).toHaveBeenCalledWith({ categories: categories, paymentMethods: paymentMethods });
            });
        });
    });
});