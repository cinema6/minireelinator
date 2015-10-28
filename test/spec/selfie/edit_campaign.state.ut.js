define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:EditCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            editCampaignState,
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

                editCampaignState = c6State.get('Selfie:EditCampaign');
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
            expect(editCampaignState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var model,
                success, failure;

            beforeEach(function() {
                model = {
                    id: 'cam-c3fd97889f4fb9',
                    name: '$$$',
                    cards: [
                        {
                            id: 'rc-123'
                        }
                    ]
                };

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'find').and.returnValue($q.when(model));

                $rootScope.$apply(function() {
                    editCampaignState.model({ campaignId: model.id }).then(success, failure);
                });
            });

            it('should return the campaign', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('selfieCampaign', model.id);
                expect(success).toHaveBeenCalledWith(model);
            });
        });

        describe('afterModel()', function() {
            it('should normalize the campaign', function() {
                $rootScope.$apply(function() {
                    editCampaignState.afterModel(campaign);
                });

                expect(CampaignService.normalize).toHaveBeenCalled();
                expect(editCampaignState.campaign).toEqual(campaign);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                editCampaignState.enter();
            });

            it('should go to the Selfie:Edit:Campaign state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Edit:Campaign', null, null, true);
            });
        });
    });
});