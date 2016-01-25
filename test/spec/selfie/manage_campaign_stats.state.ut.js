define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Manage:Campaign:Stats State', function() {
        var $rootScope,
            c6State,
            CampaignService,
            selfieCampaignStats;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$injector');
                c6State = $injector.get('c6State');
                CampaignService = $injector.get('CampaignService');
            });

            selfieCampaignStats = c6State.get('Selfie:Manage:Campaign:Stats');
            selfieCampaignStats.cParent = {
                campaign: {
                    id: 'cam-123'
                }
            };
        });

        it('should exist', function() {
            expect(selfieCampaignStats).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            it('should call fetch the stats', function() {
                spyOn(CampaignService, 'getAnalytics');

                selfieCampaignStats.model();

                expect(CampaignService.getAnalytics).toHaveBeenCalledWith({ids: selfieCampaignStats.cParent.campaign.id});
            });
        });
    });
});