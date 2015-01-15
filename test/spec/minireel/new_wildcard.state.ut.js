define(['app', 'minireel/services', 'c6uilib'], function(appModule, servicesModule, c6uilib) {
    'use strict';

    describe('MR:NewWildcard state', function() {
        var c6State,
            cinema6,
            MiniReelService,
            campaign,
            newWildcard;

        var cardTemplate,
            card;

        beforeEach(function() {
            module(c6uilib.name, function($provide) {
                $provide.decorator('cinema6', function($delegate) {
                    var create = $delegate.db.create;

                    spyOn($delegate.db, 'create').and.callFake(function() {
                        return (card = create.apply($delegate.db, arguments));
                    });

                    return $delegate;
                });
            });

            module(servicesModule.name, function($provide) {
                $provide.decorator('MiniReelService', function($delegate) {
                    var createCard = $delegate.createCard;

                    spyOn($delegate, 'createCard').and.callFake(function() {
                        return (cardTemplate = createCard.apply($delegate, arguments));
                    });

                    return $delegate;
                });
            });

            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                campaign = c6State.get('MR:Campaign');
                newWildcard = c6State.get('MR:NewWildcard');
            });
        });

        it('should exist', function() {
            expect(newWildcard).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                campaign.cModel = cinema6.db.create('campaign', {
                    id: 'cam-0cfe6925aaf571',
                    logos: {
                        square: 'awesome-logo.png'
                    },
                    links: {
                        'YouTube': 'youtubepage.html',
                        'Facebook': 'facebookpage.html'
                    },
                    advertiser: cinema6.db.create('advertiser', {
                        id: 'cam-52fb2554b038bf',
                        name: 'Microsoft'
                    }),
                    minViewTime: 15
                });
                cinema6.db.create.calls.reset();

                result = newWildcard.model();
            });

            it('should be a new card', function() {
                expect(MiniReelService.createCard).toHaveBeenCalledWith('videoBallot');
                expect(cinema6.db.create).toHaveBeenCalledWith('card', cardTemplate);
                expect(result).toBe(card);
            });

            it('should be for a wildcard', function() {
                expect(result).toEqual(jasmine.objectContaining({
                    id: undefined,
                    campaignId: campaign.cModel.id,
                    sponsored: true,
                    collateral: jasmine.objectContaining({
                        logo: campaign.cModel.logos.square
                    }),
                    links: jasmine.objectContaining(campaign.cModel.links),
                    params: jasmine.objectContaining({
                        sponsor: campaign.cModel.advertiser.name
                    }),
                    campaign: jasmine.objectContaining({
                        minViewTime: campaign.cModel.minViewTime
                    }),
                    data: jasmine.objectContaining({
                        autoadvance: false
                    })
                }));
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                newWildcard.enter();
            });

            it('should go to the "MR:New:Wildcard" state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:New:Wildcard', null, null, true);
            });
        });
    });
});
