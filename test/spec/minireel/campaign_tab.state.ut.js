define(['app'], function(appModule) {
    'use strict';

    describe('MR:CampaignTab state', function() {
        var c6State,
            campaignTab;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignTab = c6State.get('MR:CampaignTab');
            });
        });

        afterAll(function() {
            c6State = null;
            campaignTab = null;
        });

        it('should exist', function() {
            expect(campaignTab).toEqual(jasmine.any(Object));
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                campaignTab.enter();
            });

            it('should go to the campaigns state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaigns');
            });
        });
    });
});
