define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:ManageCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            manageCampaignState,
            CampaignService;

        var card, campaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                CampaignService = $injector.get('CampaignService');

                manageCampaignState = c6State.get('Selfie:ManageCampaign');
            });

            card = {
                id: 'rc-123',
                title: 'Sponsored Card',
                params: {
                    sponsor: 'Diageo'
                }
            };

            campaign = {
                id: 'cam-c3fd97889f4fb9',
                name: '$$$',
                cards: [card]
            };

            spyOn(CampaignService, 'normalize').and.returnValue(campaign);

        });

        it('should exist', function() {
            expect(manageCampaignState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var model,
                success, failure;

            beforeEach(function() {
                model = {
                    id: 'cam-c3fd97889f4fb9',
                    name: '$$$',
                    cards: [{
                        item: {
                            id: 'rc-123'
                        }
                    }]
                };

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'find').and.returnValue($q.when(model));

                $rootScope.$apply(function() {
                    manageCampaignState.model({ campaignId: model.id }).then(success, failure);
                });
            });

            it('should return the campaign', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('selfieCampaign', model.id);
                expect(success).toHaveBeenCalledWith(model);
            });
        });

        describe('afterModel()', function() {
            it('should normalize the campaign and put it on the state', function() {
                $rootScope.$apply(function() {
                    manageCampaignState.afterModel(campaign);
                });

                expect(CampaignService.normalize).toHaveBeenCalled();
                expect(manageCampaignState.campaign).toEqual(campaign);
            });

            it('should put the card on the state object', function() {
                $rootScope.$apply(function() {
                    manageCampaignState.afterModel(campaign);
                });

                expect(manageCampaignState.card).toEqual(card);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                manageCampaignState.enter();
            });

            it('should go to the Selfie:Manage:Campaign state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign', null, null, true);
            });
        });
    });
});