define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Wildcard.Article', 'MR:Edit:Wildcard.Article'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                wildcardArticle;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });

                wildcardArticle = c6State.get(stateName);
            });

            it('should exist', function() {
                expect(wildcardArticle).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('controller', function() {
                    it('should have the right value', function() {
                        expect(wildcardArticle.controller).toEqual('WildcardArticleController');
                    });
                });

                describe('controllerAs', function() {
                    it('should have the right value', function() {
                        expect(wildcardArticle.controllerAs).toEqual('wildcardArticleCtrl');
                    });
                });

                describe('templateUrl', function() {
                    it('should have the right value', function() {
                        expect(wildcardArticle.templateUrl).toEqual('views/minireel/campaigns/campaign/cards/wildcard/article.html');
                    });
                });
            });

            describe('functions', function() {
                describe('model()', function() {
                    it('should take after its parent', function() {
                        wildcardArticle.cParent.cModel = {
                            name: 'model'
                        };
                        expect(wildcardArticle.model()).toEqual({
                            name: 'model'
                        });
                    });
                });
            });
        });
    });
});
