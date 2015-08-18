define(['app', 'minireel/services', 'c6uilib'], function(appModule, servicesModule, c6uilib) {
    'use strict';

    describe('Selfie:NewCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            selfieState,
            newCampaignState,
            MiniReelService;

        var dbModel,
            cardTemplate;

        beforeEach(function() {
            module(c6uilib.name, function($provide) {
                $provide.decorator('cinema6', function($delegate) {
                    var create = $delegate.db.create;

                    spyOn($delegate.db, 'create').and.callFake(function() {
                        return (dbModel = create.apply($delegate.db, arguments));
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
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                selfieState = c6State.get('Selfie');
                selfieState.cModel = {
                    advertiser: {
                        id: 'a-123'
                    },
                    customer: {
                        id: 'cus-123'
                    },
                    org: {
                        name: 'My Org'
                    }
                };
                newCampaignState = c6State.get('Selfie:NewCampaign');
            });
        });

        it('should exist', function() {
            expect(newCampaignState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = newCampaignState.model();
            });

            it('should create a new campaign', function() {
                expect(cinema6.db.create).toHaveBeenCalledWith('selfieCampaign', {
                    advertiserId: 'a-123',
                    customerId: 'cus-123',
                    name: null,
                    categories: [],
                    cards: [],
                    pricing: {},
                    geoTargeting: [],
                    status: 'draft',
                    application: 'selfie'
                });
            });

            it('should be a new campaign object', function() {
                expect(result).toEqual(dbModel);
            });
        });

        describe('afterModel()', function() {
            var campaign;

            beforeEach(function() {
                campaign = newCampaignState.model();

                newCampaignState.afterModel(campaign);
            });

            it('should create a new card', function() {
                expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                expect(cinema6.db.create).toHaveBeenCalledWith('card', cardTemplate);
            });

            it('should add campaign data', function() {
                expect(newCampaignState.card).toEqual(dbModel);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                newCampaignState.enter();
            });

            it('should go to the "Selfie:New:Campaign" state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:New:Campaign', null, null, true);
            });
        });
    });
});