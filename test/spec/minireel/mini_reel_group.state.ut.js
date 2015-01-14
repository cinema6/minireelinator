define(['app'], function(appModule) {
    'use strict';

    ['MR:New:MiniReelGroup'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                miniReelGroup;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');

                    miniReelGroup = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(miniReelGroup).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var group,
                    result;

                beforeEach(function() {
                    group = miniReelGroup.cParent.cModel = {
                        label: 'Group 2',
                        miniReels: [],
                        cards: []
                    };

                    result = miniReelGroup.model();
                });

                it('should return its parent\'s model', function() {
                    expect(result).toBe(group);
                });
            });
        });
    });
});
