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
            campaign;

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
                campaignState.cParent.cModel = campaign;
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

                spyOn(cinema6.db, 'findAll').and.returnValue($q.when(categories));

                $rootScope.$apply(function() {
                    campaignState.model().then(success, failure);
                });
                expect(cinema6.db.findAll).toHaveBeenCalledWith('category');
                expect(success).toHaveBeenCalledWith(categories);
            });
        });
    });
});