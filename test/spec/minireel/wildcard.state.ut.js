define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard', 'MR:Edit:Wildcard'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var $rootScope,
                $q,
                c6State,
                cinema6,
                MiniReelService,
                wildcard;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');

                    wildcard = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(wildcard).toEqual(jasmine.any(Object));
            });

            describe('card', function() {
                it('should be null', function() {
                    expect(wildcard.card).toBeNull();
                });
            });

            describe('beforeModel()', function() {
                var card;

                beforeEach(function() {
                    card = wildcard.cParent.cModel = cinema6.db.create('card', MiniReelService.createCard('videoBallot'));

                    wildcard.beforeModel();
                });

                it('should set its card property to its parent\'s model', function() {
                    expect(wildcard.card).toBe(card);
                });
            });

            describe('model()', function() {
                var card, result;

                beforeEach(function() {
                    card = wildcard.cParent.cModel = cinema6.db.create('card', MiniReelService.createCard('videoBallot'));
                    wildcard.beforeModel();

                    result = wildcard.model();
                });

                it('should return a pojo of its parent\'s model', function() {
                    expect(result).toEqual(card.pojoify());
                });
            });

            describe('updateCard()', function() {
                var saveDeferred,
                    success, failure;

                beforeEach(function() {
                    saveDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    wildcard.card = cinema6.db.create('card', MiniReelService.createCard('videoBallot'));
                    wildcard.cModel = wildcard.card.pojoify();
                    spyOn(wildcard.card, '_update').and.returnValue(wildcard.card);
                    spyOn(wildcard.card, 'save').and.returnValue(saveDeferred.promise);

                    $rootScope.$apply(function() {
                        wildcard.updateCard().then(success, failure);
                    });
                });

                it('should update the card with the data from the model', function() {
                    expect(wildcard.card._update).toHaveBeenCalledWith(wildcard.cModel);
                });

                it('should save the card', function() {
                    expect(wildcard.card.save).toHaveBeenCalled();
                });

                describe('when the save completes', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            saveDeferred.resolve(wildcard.card);
                        });
                    });

                    it('should resolve to the card', function() {
                        expect(success).toHaveBeenCalledWith(wildcard.card);
                    });
                });
            });
        });
    });
});
