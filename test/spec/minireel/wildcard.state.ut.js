define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                cinema6,
                MiniReelService,
                wildcard;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');

                    wildcard = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(wildcard).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var card, result;

                beforeEach(function() {
                    card = wildcard.cParent.cModel = cinema6.db.create('card', MiniReelService.createCard('videoBallot'));

                    result = wildcard.model();
                });

                it('should return its parent\'s model', function() {
                    expect(result).toBe(card);
                });
            });
        });
    });
});
