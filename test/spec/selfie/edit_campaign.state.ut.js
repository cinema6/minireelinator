define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:EditCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            editCampaignState;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');

                editCampaignState = c6State.get('Selfie:EditCampaign');
            });
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
                    editCampaignState.model({ campaignId: model.id }).then(success, failure);
                });
            });

            it('should return the campaign', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('selfieCampaign', model.id);
                expect(success).toHaveBeenCalledWith(model);
            });
        });

        describe('afterModel()', function() {
            it('should put the card on the state object', function() {
                var card = {
                        id: 'rc-123',
                        title: 'Sponsored Card',
                        params: {
                            sponsor: 'Diageo'
                        }
                    },
                    campaign = {
                        id: 'cam-c3fd97889f4fb9',
                        name: '$$$',
                        cards: [{
                            item: card
                        }]
                    };

                $rootScope.$apply(function() {
                    editCampaignState.afterModel(campaign);
                });

                expect(editCampaignState.card).toEqual(card);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                editCampaignState.enter();
            });

            it('should go to the MR:Campaign.General state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Edit:Campaign', null, null, true);
            });
        });
    });
});