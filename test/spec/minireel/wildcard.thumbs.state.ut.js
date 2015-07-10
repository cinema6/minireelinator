define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Thumbs', 'MR:Edit:Wildcard.Thumbs'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                wildcardThumbs;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });

                wildcardThumbs = c6State.get(stateName);
            });

            it('should exist', function() {
                expect(wildcardThumbs).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('controller', function() {
                    it('should have the right value', function() {
                        expect(wildcardThumbs.controller).toEqual('GenericController');
                    });
                });

                describe('controllerAs', function() {
                    it('should have the right value', function() {
                        expect(wildcardThumbs.controllerAs).toEqual('wildcardThumbsCtrl');
                    });
                });

                describe('templateUrl', function() {
                    it('should have the right value', function() {
                        expect(wildcardThumbs.templateUrl).toEqual('views/minireel/campaigns/campaign/cards/wildcard/thumbs.html');
                    });
                });
            });

            describe('functions', function() {
                describe('model()', function() {
                    it('should take after its parent', function() {
                        wildcardThumbs.cParent.cModel = {
                            name: 'model'
                        };
                        expect(wildcardThumbs.model()).toEqual({
                            name: 'model'
                        });
                    });
                });
            });
        });
    });
});
