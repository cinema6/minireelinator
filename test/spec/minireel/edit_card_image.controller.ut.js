define(['app'], function(appModule) {
    'use strict';

    describe('EditCardImageController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            MiniReelService,
            PortalCtrl,
            EditorCtrl,
            EditCardCtrl,
            EditCardImageCtrl,
            ImageService;

        var model;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                MiniReelService = $injector.get('MiniReelService');
                ImageService = $injector.get('ImageService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    PortalCtrl = $scope.PortalCtrl = $controller('PortalController', {
                        $scope: $scope
                    });
                    PortalCtrl.model = {
                        permissions: {}
                    };

                    EditorCtrl = $scope.EditorCtrl = $controller('EditorController', {
                        $scope: $scope,
                        $log: {
                            context: function() { return this; }
                        }
                    });
                    EditorCtrl.model = { data: {} };

                    EditCardCtrl = $scope.EditCardCtrl = $controller('EditCardController', {
                        $scope: $scope
                    });
                    EditCardCtrl.model = MiniReelService.createCard('image');

                    EditCardImageCtrl = $controller('EditCardImageController', {
                        $scope: $scope
                    });
                    model = EditCardImageCtrl.model = EditCardCtrl.model;
                });
            });
        });

        it('should exist', function() {
            expect(EditCardImageCtrl).toEqual(jasmine.any(Object));
        });

        describe('$watch', function() {
            beforeEach(function() {
                spyOn(ImageService, 'dataFromUrl').and.returnValue({
                    service: 'site',
                    imageid: '123'
                });
                spyOn(EditCardImageCtrl._private, 'updateEmbedInfo');
                EditCardImageCtrl.imageUrl = 'www.site.com/123';
                $rootScope.$apply();
            });

            it('should watch for imageUrl changes', function() {
                expect(ImageService.dataFromUrl).toHaveBeenCalledWith('www.site.com/123');
            });

            describe('when imageUrl is null', function() {
                beforeEach(function() {
                    spyOn(ImageService, 'urlFromData').and.returnValue('https://flickr.com/p/abc123');
                    EditCardImageCtrl.imageUrl = null;
                    model.data = {
                        service: 'site',
                        imageid: '123'
                    };
                    $rootScope.$apply();
                });

                it('should set the image url from the model', function() {
                    expect(ImageService.urlFromData).toHaveBeenCalledWith('site', '123');
                    expect(EditCardImageCtrl.imageUrl).toEqual('https://flickr.com/p/abc123');
                });
            });

            describe('when imageUrl is not null', function() {
                it('should update the model', function() {
                    expect(ImageService.dataFromUrl).toHaveBeenCalledWith('www.site.com/123');
                    expect(model.data.service).toEqual('site');
                    expect(model.data.imageid).toEqual('123');
                    expect(EditCardImageCtrl._private.updateEmbedInfo).toHaveBeenCalledWith('site', '123');
                });
            });

        });

        describe('methods', function(){
            describe('private', function(){
                describe('updateEmbedInfo', function() {

                    function updateEmbedInfo() {
                        return EditCardImageCtrl._private.updateEmbedInfo.apply(EditCardImageCtrl, arguments);
                    }

                    beforeEach(function() {
                        EditCardImageCtrl.model.data = {
                            service: 'site',
                            imageid: '123'
                        };
                    });

                    describe('on success', function() {
                        beforeEach(function() {
                            spyOn(ImageService, 'getEmbedInfo').and.returnValue(
                                $q.when({
                                    src: 'www.site.com/image.jpg',
                                    width: 200,
                                    height: 100
                                })
                            );
                            updateEmbedInfo('site', 123);
                            $rootScope.$apply();
                        });

                        it('should update the embed info on the controller', function() {
                            expect(EditCardImageCtrl.data).toEqual({
                                src: 'www.site.com/image.jpg',
                                width: 200,
                                height: 100
                            });
                        });

                        it('should not erase existing properties on the model', function() {
                            expect(model.data.service).toEqual('site');
                            expect(model.data.imageid).toEqual('123');
                        });
                    });

                    describe('on failure', function() {
                        beforeEach(function() {
                            spyOn(ImageService, 'getEmbedInfo').and.returnValue(
                                $q.reject('error message')
                            );
                            updateEmbedInfo('site', 123);
                            $rootScope.$apply();
                        });

                        it('should update the error message', function() {
                            expect(EditCardImageCtrl.error).toEqual('error message');
                        });

                        it('should remove the data properties', function() {
                            expect(EditCardImageCtrl.data).toEqual({ });
                        });
                    });
                });
            });
        });
    });
});
