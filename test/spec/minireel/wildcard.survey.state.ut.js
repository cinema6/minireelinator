define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Survey'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                wildcardSurvey;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');

                    wildcardSurvey = c6State.get(stateName);
                });
            });

            it('should exist', function() {
                expect(wildcardSurvey).toEqual(jasmine.any(Object));
            });
        });
    });
});
