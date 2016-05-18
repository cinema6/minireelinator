define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Copy', 'MR:Edit:Wildcard.Copy'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                wildcardCopy;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });

                wildcardCopy = c6State.get(stateName);
            });

            afterAll(function() {
                c6State = null;
                wildcardCopy = null;
            });

            it('should exist', function() {
                expect(wildcardCopy).toEqual(jasmine.any(Object));
            });
        });
    });
});
