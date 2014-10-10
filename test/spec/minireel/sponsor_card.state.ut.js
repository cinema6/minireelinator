define(['app','minireel/services'], function(appModule, servicesModule) {
    'use strict';

    describe('MR:SponsorCard state', function() {
        var c6State,
            MiniReelService,
            sponsorCard;

        var card;

        beforeEach(function() {
            module(appModule.name);
            module(servicesModule.name, function($provide) {
                $provide.decorator('MiniReelService', function($delegate) {
                    var createCard = $delegate.createCard;

                    spyOn($delegate, 'createCard').and.callFake(function() {
                        return (card = createCard.apply($delegate, arguments));
                    });

                    return $delegate;
                });
            });

            inject(function($injector) {
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');
            });

            sponsorCard = c6State.get('MR:SponsorCard');
        });

        it('should exist', function() {
            expect(sponsorCard).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = sponsorCard.model();
            });

            it('should return a sponsored card', function() {
                expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                expect(result).toBe(card);
                expect(card.sponsored).toBe(true);
            });
        });
    });
});
