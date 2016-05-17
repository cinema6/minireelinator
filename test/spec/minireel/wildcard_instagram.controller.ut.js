define(['app'], function(appModule) {
    'use strict';

    describe('WildcardInstagramController', function() {
        var $injector,
            $rootScope,
            $controller,
            $scope,
            $q,
            MiniReelService,
            c6State, portal,
            WildcardInstagramCtrl,
            InstagramService,
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
                c6Debounce = $injector.get('c6Debounce');
                InstagramService = $injector.get('InstagramService');
                portal = c6State.get('Portal');
                portal.cModel = {};

                $scope = $rootScope.$new();
                WildcardInstagramCtrl = $controller('WildcardInstagramController', {
                    $scope: $scope
                });
                card = WildcardInstagramCtrl.model = MiniReelService.createCard('instagram');
            });
        });

        afterAll(function() {
            $injector = null;
            $rootScope = null;
            $controller = null;
            $scope = null;
            $q = null;
            MiniReelService = null;
            c6State = null;
            portal = null;
            WildcardInstagramCtrl = null;
            InstagramService = null;
            c6Debounce = null;
            card = null;
            debounceFunc = null;
        });

        it('should exist', function() {
            expect(WildcardInstagramCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('error', function() {
                it('should be initialized to null', function() {
                    expect(WildcardInstagramCtrl.error).toBeNull();
                });
            });

            describe('inputUrl', function() {
                it('should be initialized to null', function() {
                    expect(WildcardInstagramCtrl.inputUrl).toBeNull();
                });
            });

            describe('data', function() {
                it('should be initialized to an empty object', function() {
                    expect(WildcardInstagramCtrl.data).toEqual({});
                })
            });
        });

        describe('methods', function() {
            describe('private', function() {
                describe('updateEmbedInfo', function() {
                    beforeEach(function() {
                        spyOn(InstagramService, 'getEmbedInfo').and.returnValue(
                            $q.when({
                                type: 'image',
                                src: 'www.instagram.com/image.jpg'
                            })
                        );
                    });

                    it('should set data to be an empty object', function() {
                        WildcardInstagramCtrl.data = { key: 'value' };
                        WildcardInstagramCtrl._private.updateEmbedInfo('abc123');
                        expect(WildcardInstagramCtrl.data).toEqual({});
                    });

                    it('should get the embed info and set properties on data', function() {
                        WildcardInstagramCtrl.data = { };
                        WildcardInstagramCtrl._private.updateEmbedInfo('abc123');
                        $scope.$apply();
                        expect(InstagramService.getEmbedInfo).toHaveBeenCalledWith('abc123');
                        expect(WildcardInstagramCtrl.data).toEqual({
                            type: 'image',
                            src: 'www.instagram.com/image.jpg'
                        });
                    });

                    describe('when there is an error retrieving the embed info', function() {
                        beforeEach(function() {
                            InstagramService.getEmbedInfo.and.returnValue(
                                $q.reject('an error occurred')
                            );
                        });

                        it('should set the error property', function() {
                            WildcardInstagramCtrl._private.updateEmbedInfo('abc123');
                            $scope.$apply();
                            expect(WildcardInstagramCtrl.error).toBe('an error occurred');
                        });
                    });
                });
            });
        });

        describe('inputUrl watcher', function() {
            beforeEach(function() {
                spyOn(WildcardInstagramCtrl._private, 'updateEmbedInfo');
            });

            describe('when the inputUrl is null', function() {
                beforeEach(function() {
                    spyOn(InstagramService, 'urlFromData').and.callThrough();
                    WildcardInstagramCtrl.inputUrl = null;
                    WildcardInstagramCtrl.model.data.id = 'abc123';
                    $scope.$apply();
                });

                it('should set the inputUrl from the model', function() {
                    expect(InstagramService.urlFromData).toHaveBeenCalledWith('abc123');
                    expect(WildcardInstagramCtrl.inputUrl).toBe('https://instagram.com/p/abc123');
                });
            });

            describe('when the inputUrl is not null', function() {
                beforeEach(function() {
                    spyOn(InstagramService, 'dataFromUrl').and.callThrough();
                    WildcardInstagramCtrl.inputUrl = 'www.instagram.com/p/abc123';
                    $scope.$apply();
                });

                it('should update the model', function() {
                    expect(InstagramService.dataFromUrl).toHaveBeenCalledWith('www.instagram.com/p/abc123');
                    expect(WildcardInstagramCtrl.model.data.id).toBe('abc123');
                });

                it('should update the embed info', function() {
                    expect(WildcardInstagramCtrl._private.updateEmbedInfo).toHaveBeenCalledWith('abc123');
                });
            });
        });
    });
});
