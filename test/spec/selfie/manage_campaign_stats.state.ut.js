define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Manage:Campaign:Stats State', function() {
        var $rootScope,
            c6State,
            selfieCampaignStats;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$injector');
                c6State = $injector.get('c6State');
            });

            selfieCampaignStats = c6State.get('Selfie:Manage:Campaign:Stats');
            selfieCampaignStats.cParent = {
                hasStats: false
            };
        });

        it('should exist', function() {
            expect(selfieCampaignStats).toEqual(jasmine.any(Object));
        });

        describe('enter()', function() {
            describe('when campaign has no stats', function() {
                it('should go to the "Selfie:Manage:Campaign:Manage" state', function() {
                    spyOn(c6State, 'goTo');

                    selfieCampaignStats.enter();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Manage', null, null, true);
                });
            });

            describe('when campaign does have stats', function() {
                it('should not go to Manage tab', function() {
                    spyOn(c6State, 'goTo');
                    selfieCampaignStats.cParent.hasStats = true;

                    selfieCampaignStats.enter();

                    expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:Manage:Campaign:Manage', null, null, true);
                });
            });
        });
    });
});