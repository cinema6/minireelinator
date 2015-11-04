define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Manage:Campaign:Admin State', function() {
        var $rootScope,
            $q,
            campaignState,
            selfieState,
            newCampaignState,
            c6State,
            cinema6,
            MiniReelService;

        var card,
            updateRequest,
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
                updateRequest = {
                    id: 'ur-12345',
                    status: 'pending'
                };
                campaign = {
                    id: 'cam-123',
                    cards: [],
                    links: {},
                    updateRequest: 'ur-12345'
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
                campaignState = c6State.get('Selfie:Manage:Campaign:Admin');
                campaignState.cParent = {
                    isAdmin: false
                };
            });
        });

        it('should exist', function() {
            expect(campaignState).toEqual(jasmine.any(Object));
        });

        describe('campaign', function() {
            it('should be null', function() {
                expect(campaignState.campaign).toBe(null);
            });
        });

        describe('beforeModel()', function() {
            it('should put the card and campaign on the state object', function() {
                campaignState.cParent.campaign = campaign;
                campaignState.beforeModel();
                expect(campaignState.campaign).toEqual(campaign);
            });
        });

        describe('model()', function() {
            it('should find the latest updateRequest for the current campaign', function() {
                var success = jasmine.createSpy('success()'),
                    failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'find').and.callFake(function(type) {
                    if (type === 'updateRequest') {
                        return $q.when(updateRequest);
                    }
                });

                campaignState.campaign = campaign;

                $rootScope.$apply(function() {
                    campaignState.model().then(success, failure);
                });
                expect(cinema6.db.find).toHaveBeenCalledWith('updateRequest', 'cam-123:ur-12345');
                expect(success).toHaveBeenCalledWith({updateRequest: updateRequest});
            });
        });

        describe('enter()', function() {
            it('should do nothing if user is an admin', function() {
                spyOn(c6State, 'goTo');
                campaignState.cParent.isAdmin = true;

                campaignState.enter();

                expect(c6State.goTo).not.toHaveBeenCalled();
            });

            it('should redirect to the manager if user is no an admin', function() {
                spyOn(c6State, 'goTo');

                campaignState.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Manage');
            });
        });
    });
});
