define(['app'], function(appModule) {
    'use strict';

    ['Selfie:New:Campaign:Website','Selfie:Edit:Campaign:Website'].forEach(function(stateName) {
        describe('Selfie:Campaign:Website State', function() {
            var c6State,
                $rootScope,
                $q,
                WebsiteState,
                selfieAppState;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');

                    c6State = $injector.get('c6State');
                });

                selfieAppState = c6State.get('Selfie:App');
                selfieAppState.cModel = {
                    data: {}
                };

                WebsiteState = c6State.get(stateName);
            });

            afterAll(function() {
                c6State = null;
                $rootScope = null;
                $q = null;
                WebsiteState = null;
            });

            it('should exist', function() {
                expect(WebsiteState).toEqual(jasmine.any(Object));
            });
        });
    });
});
