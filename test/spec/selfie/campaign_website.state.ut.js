define(['app'], function(appModule) {
    'use strict';

    ['Selfie:New:Campaign:Website','Selfie:Edit:Campaign:Website'].forEach(function(stateName) {
        describe('Selfie:Campaign:Website State', function() {
            var c6State,
                $rootScope,
                $q,
                WebsiteState;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');

                    c6State = $injector.get('c6State');
                });

                WebsiteState = c6State.get(stateName);
            });

            it('should exist', function() {
                expect(WebsiteState).toEqual(jasmine.any(Object));
            });
        });
    });
});
