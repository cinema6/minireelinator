define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:App State', function() {
        var $rootScope,
            $q,
            c6State,
            selfie,
            selfieApps,
            selfieApp;

        var selfieExperience;

        beforeEach(function() {
            selfieExperience = {};

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                $q = $injector.get('$q');
            });

            selfie = c6State.get('Selfie');
            selfieApps = c6State.get('Selfie:Apps');
            selfieApp = c6State.get('Selfie:App');

            selfieApps.cModel = {
                selfie: selfieExperience
            };
        });

        it('should exist', function() {
            expect(selfieApp).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = selfieApp.model();
            });

            it('should be the MiniReel experience', function() {
                expect(result).toBe(selfieExperience);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                $rootScope.$apply(function() {
                    selfieApp.enter();
                });
            });

            it('should go to the "Selfie:CampaignDashboard" state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard', null, null, true);
            });
        });
    });
});