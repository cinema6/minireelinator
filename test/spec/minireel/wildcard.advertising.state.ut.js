define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Advertising', 'MR:Edit:Wildcard.Advertising'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                wildcardAdvertising;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });

                wildcardAdvertising = c6State.get(stateName);
            });

            afterAll(function() {
                c6State = null;
                wildcardAdvertising = null;
            });

            it('should exist', function() {
                expect(wildcardAdvertising).toEqual(jasmine.any(Object));
            });
        });
    });
});
