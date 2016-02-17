define(['app'], function(appModule) {
    'use strict';

    ['Selfie:All:Manage:Campaign:Admin','Selfie:Pending:Manage:Campaign:Admin'].forEach(function(stateName) {
        describe('Selfie:Manage:Campaign:Admin State', function() {
            var $rootScope,
                $q,
                campaignState,
                selfieState,
                newCampaignState,
                c6State,
                cinema6,
                MiniReelService;

            var card,
                updateRequest, updateRequestPojo,
                campaign, campaignPojo,
                paymentMethods;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');

                    card = cinema6.db.create('card', MiniReelService.createCard('video'));
                    updateRequest = {
                        id: 'ur-12345',
                        status: 'pending',
                        data: {
                            title: 'title'
                        },
                        pojoify: jasmine.createSpy('pojoify()'),
                        save: jasmine.createSpy('save()')
                    };
                    updateRequestPojo = {
                        data: {
                            targeting: {
                                interests: ['cat-3', 'cat-4']
                            }
                        }
                    };
                    campaign = {
                        id: 'cam-123',
                        cards: [],
                        links: {},
                        updateRequest: 'ur-12345',
                        pojoify: jasmine.createSpy('pojoify()')
                    };
                    campaignPojo = {
                        targeting: {
                            interests: ['cat-1', 'cat-2']
                        }
                    };
                    paymentMethods = [
                        {
                            id: 'pay-1',
                            token: 'pay-1'
                        },
                        {
                            id: 'pay-2',
                            token: 'pay-2'
                        },
                        {
                            id: 'pay-3',
                            token: 'pay-3'
                        }
                    ];

                    selfieState = c6State.get('Selfie');
                    selfieState.cModel = {
                        advertiser: {},
                        org: {
                            id: 'o-123'
                        }
                    };
                    campaignState = c6State.get(stateName);
                    campaignState.cParent = {
                        isAdmin: false
                    };

                    spyOn(cinema6.db, 'findAll');
                    spyOn(campaignState, '_decorateInterests');
                });
            });

            it('should exist', function() {
                expect(campaignState).toEqual(jasmine.any(Object));
            });

            describe('campaign', function() {
                it('should be null', function() {
                    expect(campaignState.campaign).toBe(null);
                });
            });

            describe('beforeModel()', function() {
                it('should put the campaign and updateRequest on the state object', function() {
                    campaignState.cParent.campaign = campaign;
                    campaignState.cParent.updateRequest = updateRequest;
                    campaignState.beforeModel();
                    expect(campaignState._campaign).toEqual(campaign);
                    expect(campaignState._updateRequest).toEqual(updateRequest);
                });
            });

            describe('afterModel()', function() {
                describe('when there is an update request', function() {
                    beforeEach(function() {
                        campaignState.cParent.campaign = campaign;
                        campaignState.cParent.updateRequest = updateRequest;
                        campaignState.beforeModel();
                        campaign.pojoify.and.returnValue(campaignPojo);
                        updateRequest.pojoify.and.returnValue(updateRequestPojo);
                        cinema6.db.findAll.and.returnValue($q.when([
                            {id: 'cat-1'},
                            {id: 'cat-3'},
                            {id: 'cat-2'},
                            {id: 'cat-4'}
                        ]));
                        $rootScope.$apply(function() {
                            campaignState.afterModel();
                        });
                    });
                    
                    it('should set pojoified objects on the state', function() {
                        expect(campaign.pojoify).toHaveBeenCalledWith();
                        expect(updateRequest.pojoify).toHaveBeenCalledWith();
                        expect(campaignState.campaign).toBe(campaignPojo);
                        expect(campaignState.updateRequest).toBe(updateRequestPojo);
                    });
                    
                    it('should only make one request for interests', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('category', {
                            ids: 'cat-1,cat-2,cat-3,cat-4'
                        });
                        expect(cinema6.db.findAll.calls.count()).toBe(1);
                    });
                    
                    it('should decorate the proper objects with the interest data', function() {
                        var interestData = {
                            'cat-1': {id: 'cat-1'},
                            'cat-2': {id: 'cat-2'},
                            'cat-3': {id: 'cat-3'},
                            'cat-4': {id: 'cat-4'}
                        };
                        expect(campaignState._decorateInterests).toHaveBeenCalledWith(campaignState.campaign, interestData);
                        expect(campaignState._decorateInterests).toHaveBeenCalledWith(campaignState.updateRequest.data, interestData);
                    });
                });
                
                describe('when there is no update request', function() {
                    beforeEach(function() {
                        campaignState.cParent.campaign = campaign;
                        campaignState.cParent.updateRequest = null;
                        campaignState.beforeModel();
                        campaign.pojoify.and.returnValue(campaignPojo);
                        cinema6.db.findAll.and.returnValue($q.when([
                            {id: 'cat-2'},
                            {id: 'cat-1'}
                        ]));
                        $rootScope.$apply(function() {
                            campaignState.afterModel();
                        });
                    });
                    
                    it('should set pojoified objects on the state', function() {
                        expect(campaign.pojoify).toHaveBeenCalled();
                        expect(updateRequest.pojoify).not.toHaveBeenCalled();
                        expect(campaignState.campaign).toBe(campaignPojo);
                        expect(campaignState.updateRequest).toBeNull();
                    });
                    
                    it('should only make one request for interests', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('category', {
                            ids: 'cat-1,cat-2'
                        });
                        expect(cinema6.db.findAll.calls.count()).toBe(1);
                    });
                    
                    it('should decorate the proper objects with the interest data', function() {
                        var interestData = {
                            'cat-1': {id: 'cat-1'},
                            'cat-2': {id: 'cat-2'}
                        };
                        expect(campaignState._decorateInterests).toHaveBeenCalledWith(campaignState.campaign, interestData);
                        expect(campaignState._decorateInterests.calls.count()).toBe(1);
                    });
                });
                
                describe('when there are no interests on the campaign or updateRequest', function() {
                    beforeEach(function() {
                        delete campaign.targeting;
                        campaignState._campaign = campaign;
                        delete updateRequest.data.targeting;
                        campaignState._updateRequest = updateRequest;
                    });
                    
                    it('should not make a request for interest data', function() {
                        expect(cinema6.db.findAll).not.toHaveBeenCalled();
                    });
                    
                    it('should not attempt to decorate entities with interests', function() {
                        expect(campaignState._decorateInterests).not.toHaveBeenCalled();
                    });
                });
            });
            
            describe('_decorateInterests', function() {
                var interestData;
                
                beforeEach(function() {
                    campaignState._decorateInterests.and.callThrough();
                    interestData = {
                        'cat-1': {id: 'cat-1'},
                        'cat-2': {id: 'cat-2'},
                        'cat-3': {id: 'cat-3'},
                        'cat-4': {id: 'cat-4'}
                    };
                });
                
                it('should be able to decorate the interests on a campaign', function() {
                    var campaign = {
                        targeting: {
                            interests: ['cat-1', 'cat-2']
                        }
                    };
                    campaignState._decorateInterests(campaign, interestData);
                    expect(campaign).toEqual({
                        targeting: {
                            interests: [{id: 'cat-1'}, {id: 'cat-2'}]
                        }
                    });
                });
                
                it('should be able to handle campaigns without interests', function() {
                    var campaign = {
                        targeting: { }
                    };
                    campaignState._decorateInterests(campaign, interestData);
                    expect(campaign).toEqual({
                        targeting: { }
                    });
                });
            });
            
            describe('_undecorateInterests', function() {
                beforeEach(function() {
                    
                });
                
                it('should be able to undecorate the interests on a campaign', function() {
                    var campaign = {
                        targeting: {
                            interests: [{id: 'cat-1'}, {id: 'cat-2'}]
                        }
                    };
                    campaignState._undecorateInterests(campaign);
                    expect(campaign).toEqual({
                        targeting: {
                            interests: ['cat-1', 'cat-2']
                        }
                    });
                });
                
                it('should be able to handle campaigns without interests', function() {
                    var campaign = {
                        targeting: { }
                    };
                    campaignState._undecorateInterests(campaign);
                    expect(campaign).toEqual({
                        targeting: { }
                    });
                });
            });

            describe('enter()', function() {
                it('should do nothing if user is an admin', function() {
                    spyOn(c6State, 'goTo');
                    campaignState.cParent.isAdmin = true;

                    campaignState.enter();

                    expect(c6State.goTo).not.toHaveBeenCalled();
                });

                it('should redirect to the manager if user is no an admin', function() {
                    spyOn(c6State, 'goTo');

                    campaignState.enter();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Manage', null, null, true);
                });
            });
            
            describe('saveUpdateRequest', function() {
                beforeEach(function() {
                    spyOn(campaignState, '_undecorateInterests').and.callThrough();
                });
                
                it('should extend the db model with any changes', function() {
                    campaignState._updateRequest = updateRequest;
                    campaignState.updateRequest = updateRequestPojo;
                    campaignState.saveUpdateRequest({
                        status: 'approved',
                        data: {
                            title: 'new title'
                        }
                    });
                    expect(campaignState._updateRequest).toEqual({
                        id: 'ur-12345',
                        status: 'approved',
                        data: {
                            title: 'new title'
                        },
                        pojoify: jasmine.any(Function),
                        save: jasmine.any(Function)
                    });
                });
                
                it('should save the db model', function() {
                    campaignState._updateRequest = updateRequest;
                    campaignState.updateRequest = updateRequestPojo;
                    campaignState.saveUpdateRequest({});
                    expect(updateRequest.save).toHaveBeenCalled();
                });
                
                it('should undecorate any interests in the changes object', function() {
                    campaignState._updateRequest = updateRequest;
                    var changes = {
                        status: 'approved',
                        data: {
                            title: 'new title',
                            targeting: {
                                interests: [{id: 'cat-1'},{id: 'cat-2'}]
                            }
                        }
                    };
                    campaignState.saveUpdateRequest(changes);
                    expect(campaignState._undecorateInterests).toHaveBeenCalledWith(changes.data);
                    expect(campaignState._updateRequest).toEqual({
                        id: 'ur-12345',
                        status: 'approved',
                        data: {
                            title: 'new title',
                            targeting: {
                                interests: ['cat-1', 'cat-2']
                            }
                        },
                        pojoify: jasmine.any(Function),
                        save: jasmine.any(Function)
                    });
                });
            });
        });
    });
});
