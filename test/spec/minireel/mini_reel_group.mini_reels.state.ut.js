define(['app'], function(appModule) {
    'use strict';

    ['MR:New:MiniReelGroup.MiniReels', 'MR:Edit:MiniReelGroup.MiniReels'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                miniReelGroupMiniReels;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');

                    miniReelGroupMiniReels = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(miniReelGroupMiniReels).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    miniReelGroupMiniReels.cParent.cModel = {
                        label: 'Killer Group Bruh',
                        miniReels: [],
                        cards: []
                    };

                    result = miniReelGroupMiniReels.model();
                });

                it('should be the group\'s miniReels array', function() {
                    expect(result).toBe(miniReelGroupMiniReels.cParent.cModel.miniReels);
                });
            });
        });
    });
});
