define(['app'], function(appModule) {
    'use strict';

    ['Selfie:New:Campaign', 'Selfie:Edit:Campaign'].forEach(function(stateName) {
        describe('Selfie:Campaign State', function() {
            var $rootScope,
                $q,
                campaignState,
                newCampaignState,
                c6State,
                cinema6,
                MiniReelService;

            var card,
                categories,
                campaign;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');

                    card = cinema6.db.create('card', MiniReelService.createCard('video'));
                    categories = [
                        {
                            id: 'cat-1'
                        },
                        {
                            id: 'cat-2'
                        },
                        {
                            id: 'cat-3'
                        }
                    ];
                    campaign = {
                        id: 'cam-123',
                        cards: [],
                        links: {}
                    };

                    campaignState = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(campaignState).toEqual(jasmine.any(Object));
            });

            describe('card', function() {
                it('should be null', function() {
                    expect(campaignState.card).toBe(null);
                });
            });

            describe('campaign', function() {
                it('should be null', function() {
                    expect(campaignState.campaign).toBe(null);
                });
            });

            describe('beforeModel()', function() {
                it('should put the card and campaign on the state object', function() {
                    campaignState.cParent.cModel = campaign;
                    campaignState.cParent.card = card;

                    campaignState.beforeModel();

                    expect(campaignState.card).toEqual(card.pojoify());
                    expect(campaignState.campaign).toEqual(campaign);
                });
            });

            describe('model()', function() {
                it('should find all categories', function() {
                    var success = jasmine.createSpy('success()'),
                        failure = jasmine.createSpy('failure()');

                    spyOn(cinema6.db, 'findAll').and.returnValue($q.when(categories));

                    $rootScope.$apply(function() {
                        campaignState.model().then(success, failure);
                    });
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('category');
                    expect(success).toHaveBeenCalledWith(categories);
                });
            });

            describe('updateCard()', function() {
                var saveDeferred,
                    success, failure;

                beforeEach(function() {
                    saveDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    campaignState.cParent.card = card;
                    campaignState.card = card.pojoify();
                    spyOn(campaignState.cParent.card, '_update').and.returnValue(campaignState.cParent.card);
                    spyOn(campaignState.cParent.card, 'save').and.returnValue(saveDeferred.promise);

                    $rootScope.$apply(function() {
                        campaignState.updateCard().then(success, failure);
                    });
                });

                it('should update the card with the data from the model', function() {
                    expect(campaignState.cParent.card._update).toHaveBeenCalledWith(campaignState.card);
                });

                it('should save the card', function() {
                    expect(campaignState.cParent.card.save).toHaveBeenCalled();
                });

                describe('when the save completes', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            saveDeferred.resolve(campaignState.cParent.card);
                        });
                    });

                    it('should resolve to the card', function() {
                        expect(success).toHaveBeenCalledWith(campaignState.cParent.card);
                    });
                });
            });
        });
    });
});