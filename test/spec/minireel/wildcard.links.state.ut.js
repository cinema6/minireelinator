define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Links'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                MiniReelService,
                wildcardLinks;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                    MiniReelService = $injector.get('MiniReelService');
                });

                wildcardLinks = c6State.get(stateName);

                wildcardLinks.cParent.cModel = MiniReelService.createCard('video');
            });

            it('should exist', function() {
                expect(wildcardLinks).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    result = wildcardLinks.model();
                });

                it('should be the card\'s links', function() {
                    expect(result).toBe(wildcardLinks.cParent.cModel.links);
                });
            });
        });
    });
});
