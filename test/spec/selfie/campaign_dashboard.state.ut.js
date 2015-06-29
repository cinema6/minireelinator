define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:CampaignDashboard State', function() {
        var $rootScope,
            c6State,
            selfieCampaignDashboard;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$injector');
                c6State = $injector.get('c6State');
            });

            selfieCampaignDashboard = c6State.get('Selfie:CampaignDashboard');
        });

        it('should exist', function() {
            expect(selfieCampaignDashboard).toEqual(jasmine.any(Object));
        });

        describe('enter()', function() {
            it('should go to the "Selfie:Campaigns" state', function() {
                spyOn(c6State, 'goTo');

                selfieCampaignDashboard.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Campaigns');
            });
        });
    });
});