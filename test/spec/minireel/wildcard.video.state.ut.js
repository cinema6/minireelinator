define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Video'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                wildcardVideo;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });

                wildcardVideo = c6State.get(stateName);
            });

            it('should exist', function() {
                expect(wildcardVideo).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    wildcardVideo.cParent.cModel = {};

                    result = wildcardVideo.model();
                });

                it('should return the parent\'s model', function() {
                    expect(result).toBe(wildcardVideo.cParent.cModel);
                });
            });
        });
    });
});
