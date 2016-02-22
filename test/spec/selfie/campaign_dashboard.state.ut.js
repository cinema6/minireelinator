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

            var deferredOrgs;

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

            describe('afterModel()', function() {
                beforeEach(function() {
                    selfieCampaignDashboard.afterModel();
                });

                it('should fetch all orgs', function() {
                    expect(CampaignService.getOrgs).toHaveBeenCalled();
                });

                describe('when orgs are returned', function() {
                    it('should put them on the cState', function() {
                        var orgs = [{id: '1'},{id: '2'}];

                        $rootScope.$apply(function() {
                            deferredOrgs.resolve(orgs);
                        });

                        expect(selfieCampaignDashboard.orgs).toBe(orgs);
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