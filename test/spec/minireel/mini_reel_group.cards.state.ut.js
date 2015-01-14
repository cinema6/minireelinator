define(['app'], function(appModule) {
    'use strict';

    ['MR:New:MiniReelGroup.Cards'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                miniReelGroupCards;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');

                    miniReelGroupCards = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(miniReelGroupCards).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    miniReelGroupCards.cParent.cModel = {
                        label: 'My Group',
                        miniReels: [],
                        cards: []
                    };

                    result = miniReelGroupCards.model();
                });

                it('should return the group\'s cards array', function() {
                    expect(result).toBe(miniReelGroupCards.cParent.cModel.cards);
                });
            });
        });
    });
});
