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

        afterAll(function() {
            $rootScope = null;
            c6State = null;
            cinema6 = null;
            MiniReelService = null;
            CampaignState = null;
            editWildcard = null;
        });

        it('should exist', function() {
            expect(editWildcard).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var card, id;
            var result;

            beforeEach(function() {
                id = 'rc-74246042cd7b59';

                CampaignState.cModel = cinema6.db.create('campaign', {
                    cards: [
                        {
                            id: 'rc-f4970a95123ea9',
                            endDate: new Date()
                        },
                        {
                            id: id,
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
                card = CampaignState.cModel.cards[1];

                $rootScope.$apply(function() {
                    result = editWildcard.model({ cardId: id });
                });
            });

            it('should return the card based on the id', function() {
                expect(result).toBe(card);
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
