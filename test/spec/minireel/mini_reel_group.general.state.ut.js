define(['app'], function(appModule) {
    'use strict';

    ['MR:New:MiniReelGroup.General', 'MR:Edit:MiniReelGroup.General'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                miniReelGroupGeneral;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');

                    miniReelGroupGeneral = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(miniReelGroupGeneral).toEqual(jasmine.any(Object));
            });
        });
    });
});
