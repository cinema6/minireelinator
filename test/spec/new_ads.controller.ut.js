(function() {
    'use strict';

    define(['manager'], function() {
        xdescribe('NewAdsController', function() {
            var $rootScope,
                $controller,
                MiniReelService,
                NewAdsController;

            var adChoices;

            beforeEach(function() {
                adChoices = [
                    {
                        "name": "Cinema6 Only",
                        "value": "cinema6",
                        "description": "Only call the Cinema6 ad server"
                    },
                    {
                        "name": "Cinema6 with Publisher Fallback",
                        "value": "cinema6-publisher",
                        "description": "Try calling Cinema6 ad server first, but fall back to publisher ad tag"
                    },
                    {
                        "name": "Publisher Only",
                        "value": "publisher",
                        "description": "Only call the Publisher's provided ad tag"
                    },
                    {
                        "name": "Publisher with Cinema6 Fallback",
                        "value": "publisher-cinema6",
                        "description": "Try calling Publisher ad tag first, but fall back to Cinema6 ad server"
                    }
                ];

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    MiniReelService = $injector.get('MiniReelService');
                });

                spyOn(MiniReelService, 'adChoicesOf').and.returnValue(adChoices);

                $rootScope.$apply(function() {
                    NewAdsController = $controller('NewAdsController');
                });
            });

            it('should exist', function() {
                expect(NewAdsController).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('adChoices', function() {
                    it('should get an array of choices from the MiniReelService', function() {
                        expect(NewAdsController.adChoices).toEqual(adChoices);
                    })
                });
            });
        });
    });
}())