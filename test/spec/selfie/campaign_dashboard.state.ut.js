define(['app'], function(appModule) {
    'use strict';

    ['Selfie:All:CampaignDashboard','Selfie:Pending:CampaignDashboard'].forEach(function(stateName) {
        describe('Selfie:CampaignDashboard State', function() {
            var $rootScope,
                c6State,
                selfieCampaignDashboard,
                selfieState,
                cinema6,
                CampaignService,
                $q;

            var deferredOrgs,
                deferredAdvertisers;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    CampaignService = $injector.get('CampaignService');
                    $q = $injector.get('$q');
                });

                deferredOrgs = $q.defer();
                deferredAdvertisers = $q.defer();
                spyOn(CampaignService, 'getOrgs').and.returnValue(deferredOrgs.promise);

                selfieState = c6State.get('Selfie');
                selfieState.cModel = {
                    id: 'u-123',
                    org: {
                        id: 'o-123'
                    }
                };
                selfieCampaignDashboard = c6State.get(stateName);
            });

            afterAll(function() {
                $rootScope = null;
                c6State = null;
                selfieCampaignDashboard = null;
                selfieState = null;
                cinema6 = null;
                CampaignService = null;
                $q = null;
                deferredOrgs = null;
                deferredAdvertisers = null;
            });

            it('should exist', function() {
                expect(selfieCampaignDashboard).toEqual(jasmine.any(Object));
            });

            describe('afterModel()', function() {
                beforeEach(function() {
                    spyOn(cinema6.db, 'findAll').and.returnValue(deferredAdvertisers.promise);

                    selfieCampaignDashboard.afterModel();
                });

                it('should pass the hasCampaigns flag from the cParent state', function() {
                    expect(selfieCampaignDashboard.hasCampaigns).toBeFalsy();

                    selfieCampaignDashboard.cParent.hasCampaigns = true;

                    selfieCampaignDashboard.afterModel();

                    expect(selfieCampaignDashboard.hasCampaigns).toBe(true);
                });

                it('should fetch all orgs', function() {
                    expect(CampaignService.getOrgs).toHaveBeenCalled();
                });

                it('should fetch all advertisers', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('advertiser', {org: 'o-123'});
                });

                describe('when orgs and advertisers are returned', function() {
                    it('should put them on the cState', function() {
                        var orgs = [{id: '1'},{id: '2'}],
                            advertisers = [{id: '1'},{id: '2'}];

                        $rootScope.$apply(function() {
                            deferredOrgs.resolve(orgs);
                            deferredAdvertisers.resolve(advertisers);
                        });

                        expect(selfieCampaignDashboard.orgs).toBe(orgs);
                        expect(selfieCampaignDashboard.advertisers).toBe(advertisers);
                    });
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
});
