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
                spyOn(EditCardImageCtrl._private, 'updateEmbedInfo');
            });

            it('should watch for service changes', function() {
                model.data.service = 'flickr';
                $rootScope.$apply();
                expect(EditCardImageCtrl._private.updateEmbedInfo).toHaveBeenCalled();
            });

            it('should watch for image id changes', function() {
                model.data.imageid = 'flickr';
                $rootScope.$apply();
                expect(EditCardImageCtrl._private.updateEmbedInfo).toHaveBeenCalled();
            });
        });

        describe('properties', function() {
            describe('imageUrl', function() {

                describe('getting', function() {
                    it('should use the service and imageid to formulate a url for the image', function() {
                        model.data.service = 'flickr';
                        model.data.imageid = '16767833635';
                        expect(EditCardImageCtrl.imageUrl).toBe('https://flic.kr/p/rxHwKV');

                        model.data.service = 'getty';
                        model.data.imageid = '559333651';
                        expect(EditCardImageCtrl.imageUrl).toBe('http://gty.im/559333651');
                    });
                });

                describe('setting', function() {
                    it('should parse the service and imageid', function() {
                        EditCardImageCtrl.imageUrl = 'https://www.flickr.com/photos/sebanado/16767833635/';
                        expect(model.data.service).toBe('flickr');
                        expect(model.data.imageid).toBe('16767833635');

                        EditCardImageCtrl.imageUrl = 'http://www.gettyimages.com/detail/photo/young-woman-sitting-by-the-pool-wearing-hat-royalty-free-image/559333651';
                        expect(model.data.service).toBe('getty');
                        expect(model.data.imageid).toBe('559333651');
                    });

                    it('should not freak out when getting a mangled url', function() {
                        expect(function() {
                            EditCardImageCtrl.imageUrl = 'apple.com';
                        }).not.toThrow();
                        expect(EditCardImageCtrl.imageUrl).toBe('apple.com');
                        expect(model.data.service).toBeNull();
                        expect(model.data.imageid).toBeNull();

                        expect(function() {
                            EditCardImageCtrl.imageUrl = '84fh439#';
                        }).not.toThrow();
                        expect(EditCardImageCtrl.imageUrl).toBe('84fh439#');
                        expect(model.data.service).toBeNull();
                        expect(model.data.imageid).toBeNull();

                        expect(function() {
                            EditCardImageCtrl.imageUrl = 'fli.kr/p/';
                        }).not.toThrow();
                        expect(EditCardImageCtrl.imageUrl).toBe('fli.kr/p/');
                        expect(model.data.service).toBeNull();
                        expect(model.data.imageid).toBeNull();

                        expect(function() {
                            EditCardImageCtrl.imageUrl = 'gty.im/';
                        }).not.toThrow();
                        expect(EditCardImageCtrl.imageUrl).toBe('gty.im/');
                        expect(model.data.service).toBeNull();
                        expect(model.data.imageid).toBeNull();
                    });
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
                        spyOn(ImageService, 'getEmbedInfo').and.returnValue(
                            $q.when({
                                href: 'www.site.com/image.jpg',
                                width: 200,
                                height: 100,
                                embedCode: '<img src=""></img>'
                            })
                        );
                        updateEmbedInfo('site', 123);
                        $rootScope.$apply();
                    });

                    it('should update the embed info on the model', function() {
                        expect(model.data.href).toEqual('www.site.com/image.jpg');
                        expect(model.data.width).toEqual(200);
                        expect(model.data.height).toEqual(100);
                        expect(model.data.embedCode).toEqual('<img src=""></img>');
                    });

                    it('should not erase existing properties on the model', function() {
                        expect(model.data.service).toEqual('site');
                        expect(model.data.imageid).toEqual('123');
                    });
                });
            });
        });
    });
});
