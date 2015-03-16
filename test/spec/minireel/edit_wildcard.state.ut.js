define(['app'], function(appModule) {
    'use strict';

    describe('MR:EditWildcard state', function() {
        var $rootScope,
            c6State,
            cinema6,
            MiniReelService,
            CampaignState,
            editWildcard;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                CampaignState = c6State.get('MR:Campaign');
                editWildcard = c6State.get('MR:EditWildcard');
            });
        });

        it('should exist', function() {
            expect(editWildcard).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var card, id,
                success, failure;

            beforeEach(function() {
                id = 'rc-74246042cd7b59';

                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                cinema6.db.push('card', id, MiniReelService.createCard('video'));

                $rootScope.$apply(function() {
                    cinema6.db.find('card', id).then(function(_card) {
                        card = _card;
                    });
                });

                $rootScope.$apply(function() {
                    editWildcard.model({
                        cardId: id
                    }).then(success, failure);
                });
            });

            it('should return the card based on the id', function() {
                expect(success).toHaveBeenCalledWith(card);
            });
        });

        describe('afterModel()', function() {
            var card;

            beforeEach(function() {
                card = cinema6.db.create('card', MiniReelService.createCard('video'));

                CampaignState.cModel = cinema6.db.create('campaign', {
                    cards: [
                        {
                            id: 'rc-f4970a95123ea9',
                            endDate: new Date()
                        },
                        {
                            id: card.id,
                            endDate: new Date(),
                            name: 'wazzup',
                            reportingId: '12345'
                        },
                        {
                            id: 'rc-7ff198e3585ea4',
                            endDate: new Date()
                        }
                    ]
                });

                editWildcard.afterModel(card);
            });

            it('should set the metaData property based on the campaign', function() {
                expect(editWildcard.metaData).toEqual({
                    endDate: CampaignState.cModel.cards[1].endDate,
                    name: CampaignState.cModel.cards[1].name,
                    reportingId: CampaignState.cModel.cards[1].reportingId
                });
                expect(editWildcard.metaData.endDate).toBe(CampaignState.cModel.cards[1].endDate);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                editWildcard.enter();
            });

            it('should go to the "MR:Edit:Wildcard" state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Edit:Wildcard', null, null, true);
            });
        });
    });
});
