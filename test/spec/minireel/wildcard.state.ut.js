define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    var copy = angular.copy;

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

            afterAll(function() {
                $rootScope = null;
                $q = null;
                c6State = null;
                cinema6 = null;
                MiniReelService = null;
                wildcard = null;
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
                    card = wildcard.cParent.cModel = MiniReelService.createCard('videoBallot');

                    wildcard.beforeModel();
                });

                it('should set its card property to its parent\'s model', function() {
                    expect(wildcard.card).toBe(card);
                });
            });

            describe('model()', function() {
                var card, result;

                beforeEach(function() {
                    card = wildcard.cParent.cModel = MiniReelService.createCard('videoBallot');
                    wildcard.beforeModel();

                    result = wildcard.model();
                });

                it('should return a pojo of its parent\'s model', function() {
                    expect(result).toEqual(card);
                    expect(result).not.toBe(card);
                });
            });

            describe('updateCard()', function() {
                var saveDeferred,
                    card, proxy,
                    success, failure;

                beforeEach(function() {
                    saveDeferred = $q.defer();

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    card = wildcard.card = MiniReelService.createCard('videoBallot');
                    proxy = wildcard.cModel = copy(wildcard.card);

                    proxy.title = 'Some Title';
                    proxy.note = 'A description.';

                    $rootScope.$apply(function() {
                        wildcard.updateCard().then(success, failure);
                    });
                });

                it('should update the card with the data from the model', function() {
                    expect(card).toEqual(proxy);
                    expect(wildcard.card).toBe(card);
                });

                it('should resolve to the card', function() {
                    expect(success).toHaveBeenCalledWith(wildcard.card);
                    expect(success.calls.mostRecent().args[0]).toBe(wildcard.card);
                });
            });
        });
    });
});
