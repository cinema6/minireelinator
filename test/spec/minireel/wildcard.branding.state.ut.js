define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Branding', 'MR:Edit:Wildcard.Branding'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                wildcardBranding;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });

                wildcardBranding = c6State.get(stateName);
            });

            afterAll(function() {
                c6State = null;
                wildcardBranding = null;
            });

            it('should exist', function() {
                expect(wildcardBranding).toEqual(jasmine.any(Object));
            });
        });
    });
});
