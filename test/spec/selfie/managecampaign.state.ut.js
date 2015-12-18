define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:ManageCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            manageCampaignState,
            CampaignService;

        var card, campaign, user;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                CampaignService = $injector.get('CampaignService');

                manageCampaignState = c6State.get('Selfie:ManageCampaign');
            });

            card = {
                id: 'rc-123',
                title: 'Sponsored Card',
                params: {
                    sponsor: 'Diageo'
                }
            };

            campaign = {
                id: 'cam-c3fd97889f4fb9',
                user: 'u-123',
                name: '$$$',
                cards: [card]
            };

            user = {
                id: 'u-123',
                org: 'o-123'
            };

            spyOn(CampaignService, 'normalize').and.returnValue(campaign);

        });

        it('should exist', function() {
            expect(manageCampaignState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var model,
                success, failure;

            beforeEach(function() {
                model = {
                    id: 'cam-c3fd97889f4fb9',
                    name: '$$$',
                    cards: [{
                        item: {
                            id: 'rc-123'
                        }
                    }]
                };

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'find').and.returnValue($q.when(model));

                $rootScope.$apply(function() {
                    manageCampaignState.model({ campaignId: model.id }).then(success, failure);
                });
            });

            it('should return the campaign', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('selfieCampaign', model.id);
                expect(success).toHaveBeenCalledWith(model);
            });
        });

        describe('afterModel()', function() {
            var success, failure, userDeferred;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');
                userDeferred = $q.defer();

                spyOn(cinema6.db, 'find').and.returnValue(userDeferred.promise);

                $rootScope.$apply(function() {
                    manageCampaignState.afterModel(campaign).then(success, failure);
                });
            });

            it('should find the campaign user', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('user', campaign.user);
            });

            describe('when the user is found', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        userDeferred.resolve(user);
                    });
                });

                it('should normalize the campaign and put it on the state', function() {
                    expect(CampaignService.normalize).toHaveBeenCalled();
                    expect(manageCampaignState.campaign).toEqual(campaign);
                });

                it('should put the card on the state object', function() {
                    expect(manageCampaignState.card).toEqual(card);
                });
            });

            describe('when the user is not found', function() {
                it('should trigger failure', function() {
                    $rootScope.$apply(function() {
                        userDeferred.reject('Not Found');
                    });

                    expect(failure).toHaveBeenCalled();
                });
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                manageCampaignState.enter();
            });

            it('should go to the Selfie:Manage:Campaign state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign', null, null, true);
            });
        });
    });
});