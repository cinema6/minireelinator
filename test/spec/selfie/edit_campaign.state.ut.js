define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:EditCampaign State', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            editCampaignState,
            CampaignService;

        var card, campaign,
            advertiser, user, updateRequest;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                CampaignService = $injector.get('CampaignService');

                editCampaignState = c6State.get('Selfie:EditCampaign');
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
                name: '$$$',
                user: 'u-123',
                advertiserId: 'a-123',
                cards: [card]
            };

            user = {
                id: 'u-123'
            };

            advertiser = {
                id: 'a-123'
            };

            updateRequest = {
                id: 'ur-123',
                data: {
                    id: 'cam-123'
                }
            };

            spyOn(CampaignService, 'normalize').and.returnValue(campaign);
        });

        it('should exist', function() {
            expect(editCampaignState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var model,
                success, failure;

            beforeEach(function() {
                model = {
                    id: 'cam-c3fd97889f4fb9',
                    name: '$$$',
                    cards: [
                        {
                            id: 'rc-123'
                        }
                    ]
                };

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'find').and.returnValue($q.when(model));

                $rootScope.$apply(function() {
                    editCampaignState.model({ campaignId: model.id }).then(success, failure);
                });
            });

            it('should return the campaign', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('selfieCampaign', model.id);
                expect(success).toHaveBeenCalledWith(model);
            });
        });

        describe('afterModel()', function() {
            var success, failure, updateRequestDeferred, userDeferred, advertiserDeferred;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');
                updateRequestDeferred = $q.defer();
                userDeferred = $q.defer();
                advertiserDeferred = $q.defer();

                spyOn(cinema6.db, 'find').and.callFake(function(type) {
                    var response;

                    switch(type) {
                        case 'updateRequest':
                            response = updateRequestDeferred.promise;
                            break;
                        case 'user':
                            response = userDeferred.promise;
                            break;
                        case 'advertiser':
                            response = advertiserDeferred.promise;
                            break;
                    }

                    return response;
                });
            });

            describe('when the campaign has an update request', function() {
                beforeEach(function() {
                    campaign.updateRequest = 'ur-123';

                    $rootScope.$apply(function() {
                        editCampaignState.afterModel(campaign).then(success, failure);
                    });
                });

                it('should find the update request', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('updateRequest', 'cam-c3fd97889f4fb9:ur-123');
                });

                it('should find the user and advertiser', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('user', 'u-123');
                    expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', 'a-123');
                });

                describe('when the requests are successful', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            updateRequestDeferred.resolve(updateRequest);
                            userDeferred.resolve(user);
                            advertiserDeferred.resolve(advertiser);
                        });
                    });

                    it('should put it on the cState', function() {
                        expect(editCampaignState.updateRequest).toEqual(updateRequest);
                        expect(editCampaignState.user).toEqual(user);
                        expect(editCampaignState.advertiser).toEqual(advertiser);
                    });

                    it('should normalize the campaign and the update request data', function() {
                        expect(CampaignService.normalize).toHaveBeenCalledWith(campaign, user);
                        expect(CampaignService.normalize).toHaveBeenCalledWith(updateRequest.data, user);
                        expect(editCampaignState.campaign).toEqual(campaign);
                    });
                });

                describe('when any request fails', function() {
                    it('should trigger failure', function() {
                        $rootScope.$apply(function() {
                            updateRequestDeferred.resolve(updateRequest);
                            userDeferred.resolve(user);
                            advertiserDeferred.reject('Not Found');
                        });

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });

            describe('when the campaign has no pending updateRequest', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        editCampaignState.afterModel(campaign).then(success, failure);
                    });
                });

                it('should find the user and advertiser', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('user', 'u-123');
                    expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', 'a-123');
                });

                it('should not put any update request on the cState', function() {
                    expect(cinema6.db.find).not.toHaveBeenCalledWith('updateRequest', jasmine.any(String));
                });

                describe('when the requests are successful', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            userDeferred.resolve(user);
                            advertiserDeferred.resolve(advertiser);
                        });
                    });

                    it('should put it on the cState', function() {
                        expect(editCampaignState.updateRequest).toEqual(null);
                        expect(editCampaignState.user).toEqual(user);
                        expect(editCampaignState.advertiser).toEqual(advertiser);
                    });

                    it('should normalize the campaign', function() {
                        expect(CampaignService.normalize).toHaveBeenCalledWith(campaign, user);
                        expect(CampaignService.normalize.calls.count()).toBe(1);
                        expect(editCampaignState.campaign).toEqual(campaign);
                    });
                });

                describe('when any request fails', function() {
                    it('should trigger failure', function() {
                        $rootScope.$apply(function() {
                            userDeferred.resolve(user);
                            advertiserDeferred.reject('Not Found');
                        });

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                editCampaignState.enter();
            });

            it('should go to the Selfie:Edit:Campaign state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Edit:Campaign', null, null, true);
            });
        });
    });
});