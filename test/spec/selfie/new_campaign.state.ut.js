define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:NewCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            selfieState,
            newCampaignState,
            CampaignService,
            cinema6;

        var campaign,
            card,
            advertisers;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                CampaignService = $injector.get('CampaignService');
                cinema6 = $injector.get('cinema6');

                selfieState = c6State.get('Selfie');
                selfieState.cModel = {
                    advertiser: {
                        id: 'a-123'
                    },
                    org: {
                        id: 'o-123',
                        name: 'My Org'
                    },
                    company: 'My Company, Inc.'
                };

                card = {
                    data: {
                        autoadvance: false,
                        autoplay: true
                    },
                    params: {
                        ad: true,
                        action: null
                    }
                };

                campaign = {
                    id: 'cam-c3fd97889f4fb9',
                    name: null,
                    cards: [card],
                    advertiserDisplatName: selfieState.cModel.company
                };

                advertisers = [
                    {
                        id: 'a-123'
                    },
                    {
                        id: 'a-999'
                    }
                ];

                newCampaignState = c6State.get('Selfie:NewCampaign');
                newCampaignState.cParent = {
                    advertisers: advertisers
                };
            });
        });

        afterAll(function() {
            $rootScope = null;
            $q = null;
            c6State = null;
            selfieState = null;
            newCampaignState = null;
            CampaignService = null;
            cinema6 = null;
            campaign = null;
            card = null;
            advertisers = null;
        });

        it('should exist', function() {
            expect(newCampaignState).toEqual(jasmine.any(Object));
        });

        describe('beforeModel()', function() {
            beforeEach(function() {
                newCampaignState.beforeModel();
            });

            it('should add the Selfie user to the state', function() {
                expect(newCampaignState.user).toEqual(selfieState.cModel);
            });

            it('should add the first advertiser from parent state', function() {
                expect(newCampaignState.advertiser).toEqual(advertisers[0]);
            });
        });

        describe('model()', function() {
            var success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(CampaignService, 'create').and.returnValue($q.when(campaign));

                newCampaignState.advertiser = advertisers[0];
                newCampaignState.user = selfieState.cModel;

                $rootScope.$apply(function() {
                    newCampaignState.model().then(success, failure);
                });
            });

            it('should create a new campaign', function() {
                expect(CampaignService.create).toHaveBeenCalledWith(null, selfieState.cModel, advertisers[0]);
            });

            it('should be a new campaign object', function() {
                expect(success).toHaveBeenCalledWith(campaign);
            });
        });

        describe('afterModel()', function() {
            it('should add campaign data', function() {
                newCampaignState.afterModel(campaign);

                expect(newCampaignState.campaign).toEqual(campaign);
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
