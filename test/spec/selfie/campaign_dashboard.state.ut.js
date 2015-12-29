define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:CampaignDashboard State', function() {
        var $rootScope,
            c6State,
            selfieCampaignDashboard,
            selfieState,
            cinema6,
            $q;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                $q = $injector.get('$q');
            });

            selfieState = c6State.get('Selfie');
            selfieState.cModel = {
                id: 'u-123',
                org: {
                    id: 'o-123'
                }
            };
            selfieCampaignDashboard = c6State.get('Selfie:CampaignDashboard');
        });

        it('should exist', function() {
            expect(selfieCampaignDashboard).toEqual(jasmine.any(Object));
        });

        describe('beforeModel()', function() {
            it('should fetch the users advertisers and set a hasAdvertisers flag on the state', function() {
                spyOn(cinema6.db, 'findAll').and.returnValue($q.when([]));

                $rootScope.$apply(function() {
                    selfieCampaignDashboard.beforeModel();
                });

                expect(selfieCampaignDashboard.hasAdvertisers).toBe(false);

                cinema6.db.findAll.and.returnValue($q.when([
                    {
                        id: 'a-123'
                    }
                ]));

                $rootScope.$apply(function() {
                    selfieCampaignDashboard.beforeModel();
                });

                expect(selfieCampaignDashboard.hasAdvertisers).toBe(true);
            });
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