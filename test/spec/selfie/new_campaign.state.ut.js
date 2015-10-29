define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:NewCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            selfieState,
            newCampaignState,
            CampaignService;

        var campaign,
            card;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                CampaignService = $injector.get('CampaignService');

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
                    },
                    company: 'My Company, Inc.'
                };
                newCampaignState = c6State.get('Selfie:NewCampaign');
            });

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
        });

        it('should exist', function() {
            expect(newCampaignState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(CampaignService, 'create').and.returnValue($q.when(campaign));

                $rootScope.$apply(function() {
                    newCampaignState.model().then(success, failure);
                });
            });

            it('should create a new campaign', function() {
                expect(CampaignService.create).toHaveBeenCalled();
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