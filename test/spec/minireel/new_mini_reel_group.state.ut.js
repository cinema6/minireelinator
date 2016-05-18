define(['app'], function(appModule) {
    'use strict';

    describe('MR:NewMiniReelGroup state', function() {
        var c6State,
            campaignMiniReelGroups,
            newMiniReelGroup;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignMiniReelGroups = c6State.get('MR:Campaign.MiniReelGroups');
                newMiniReelGroup = c6State.get('MR:NewMiniReelGroup');
            });
        });

        afterAll(function() {
            c6State = null;
            campaignMiniReelGroups = null;
            newMiniReelGroup = null;
        });

        it('should exist', function() {
            expect(newMiniReelGroup).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var miniReelGroups,
                result;

            beforeEach(function() {
                miniReelGroups = campaignMiniReelGroups.cModel = [{}, {}];

                result = newMiniReelGroup.model();
            });

            it('should return a new minireel group with a label indicating which number group this would be', function() {
                expect(result).toEqual({
                    name: 'Group 3',
                    miniReels: [],
                    cards: []
                });
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                newMiniReelGroup.enter();
            });

            it('should redirect to the "MR:New:MiniReelGroup" state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:New:MiniReelGroup', null, null, true);
            });
        });
    });
});
