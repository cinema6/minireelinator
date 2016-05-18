define(['app'], function(appModule) {
    'use strict';

    describe('MR:EditMiniReelGroup state', function() {
        var c6State,
            campaignMiniReelGroups,
            editMiniReelGroup;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');

                campaignMiniReelGroups = c6State.get('MR:Campaign.MiniReelGroups');
                editMiniReelGroup = c6State.get('MR:EditMiniReelGroup');
            });
        });

        afterAll(function() {
            c6State = null;
            campaignMiniReelGroups = null;
            editMiniReelGroup = null;
        });

        it('should exist', function() {
            expect(editMiniReelGroup).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                campaignMiniReelGroups.cModel = [{}, {}, {}];

                result = editMiniReelGroup.model({
                    index: 1
                });
            });

            it('should be the group at the given index in the miniReelGroups array', function() {
                expect(result).toBe(campaignMiniReelGroups.cModel[1]);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                editMiniReelGroup.enter();
            });

            it('should redirect to the "MR:Edit:MiniReelGroup" state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Edit:MiniReelGroup', null, null, true);
            });
        });

        describe('serializeParams(model)', function() {
            var result;

            beforeEach(function() {
                campaignMiniReelGroups.cModel = [{}, {}, {}, {}, {}];

                result = editMiniReelGroup.serializeParams(campaignMiniReelGroups.cModel[3]);
            });

            it('should indicate the index of the group in the campaign', function() {
                expect(result).toEqual({
                    index: 3
                });
            });
        });
    });
});
