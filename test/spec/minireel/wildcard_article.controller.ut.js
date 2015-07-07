define(['app'], function(appModule) {
    'use strict';

    describe('WildcardArticleController', function() {
        var $injector,
            $rootScope,
            $controller,
            $scope,
            $q,
            MiniReelService,
            c6State, portal,
            WildcardArticleCtrl,
            OpenGraphService,
            c6Debounce;

        var card,
            debounceFunc;

        beforeEach(function() {
            module(appModule.name);

            module(function($provide) {
                debounceFunc = function() { };
                $provide.value('c6Debounce', jasmine.createSpy().and.returnValue(debounceFunc));
            });

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                MiniReelService = $injector.get('MiniReelService');
                c6State = $injector.get('c6State');
                OpenGraphService = $injector.get('OpenGraphService');
                c6Debounce = $injector.get('c6Debounce');
                portal = c6State.get('Portal');
                portal.cModel = {};

                spyOn(OpenGraphService, 'getData').and.returnValue($q.when({}));
                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    WildcardArticleCtrl = $controller('WildcardArticleController', {
                        $scope: $scope
                    });
                    spyOn(WildcardArticleCtrl._private, 'updateModel').and.returnValue($q.when());
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

            describe('updateDebounce', function() {
                it('should be defined', function() {
                    expect(WildcardArticleCtrl._private.updateDebounce).toBeDefined();
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

            describe('updateModel()', function() {
                beforeEach(function() {
                    WildcardArticleCtrl._private.updateModel.and.callThrough();
                    WildcardArticleCtrl.model.data = { };
                    WildcardArticleCtrl.articleUrl = 'http://www.cinema6.com';
                    WildcardArticleCtrl._private.updateModel();
                });

                it('should update the model', function() {
                    expect(WildcardArticleCtrl.model.data.src).toEqual('http://www.cinema6.com');
                });

                it('should update the iframeSrc', function() {
                    expect(WildcardArticleCtrl.iframeSrc).toEqual('http://www.cinema6.com');
                });

                it('should call on the OpenGraphService', function() {
                    expect(OpenGraphService.getData).toHaveBeenCalledWith('http://www.cinema6.com');
                });

                it('should update the model if there is a result from the OpenGraphService', function() {
                    OpenGraphService.getData.and.returnValue($q.when({
                        images: [
                            {
                                value: 'http://www.cinema6.com/logo'
                            }
                        ]
                    }));
                    WildcardArticleCtrl._private.updateModel('http://www.cinema6.com');
                    $scope.$apply();
                    expect(WildcardArticleCtrl.model.data.thumbUrl).toEqual('http://www.cinema6.com/logo');
                });

                it('should not update the model if there is not a result from the OpenGraphService', function() {
                    OpenGraphService.getData.and.returnValue($q.when({}));
                    WildcardArticleCtrl._private.updateModel('http://www.cinema6.com');
                    expect(WildcardArticleCtrl.model.data.thumbUrl).not.toBeDefined();
                });
            });
        });

    });
});
