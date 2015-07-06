define(['app'], function(appModule) {
    'use strict';

    describe('WildcardArticleController', function() {
        var $injector,
            $rootScope,
            $controller,
            MiniReelService,
            $scope,
            c6State, portal,
            WildcardArticleCtrl;

        var card;

        beforeEach(function() {
            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                MiniReelService = $injector.get('MiniReelService');
                c6State = $injector.get('c6State');
                portal = c6State.get('Portal');
                portal.cModel = {};

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    WildcardArticleCtrl = $controller('WildcardArticleController', {
                        $scope: $scope
                    });
                    card = WildcardArticleCtrl.model = MiniReelService.createCard('article');
                });
            });
        });

        it('should exist', function() {
            expect(WildcardArticleCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('articleUrl', function() {
                it('should be initialized to an empty string', function() {
                    expect(WildcardArticleCtrl.articleUrl).toEqual('');
                });
            });

            describe('iframeSrc', function() {
                it('should be initialized to null', function() {
                    expect(WildcardArticleCtrl.iframeSrc).toBeNull();
                });
            });
        });

        describe('functions', function() {
            describe('initWithModel(card)', function() {
                beforeEach(function() {
                    WildcardArticleCtrl.initWithModel({
                        data: {
                            src: 'article url'
                        }
                    });
                });

                it('should set the articleUrl', function() {
                    expect(WildcardArticleCtrl.articleUrl).toEqual('article url');
                });

                it('should set the model', function() {
                    expect(WildcardArticleCtrl.model).toEqual({
                        data: {
                            src: 'article url'
                        }
                    });
                });
            });
        });

        describe('the articleUrl watcher', function() {
            beforeEach(function() {
                WildcardArticleCtrl.articleUrl = 'new article url';
                $rootScope.$apply();
            });

            it('should update the model', function() {
                expect(WildcardArticleCtrl.model.data.src).toEqual('new article url');
            });

            it('should update the iframeSrc', function() {
                expect(WildcardArticleCtrl.iframeSrc).toEqual('new article url');
            });
        });

    });
});
