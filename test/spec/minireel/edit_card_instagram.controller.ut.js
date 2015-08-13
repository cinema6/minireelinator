define(['app'], function(appModule) {
    'use strict';

    describe('EditCardInstagramController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            MiniReelService,
            PortalCtrl,
            EditorCtrl,
            EditCardCtrl,
            EditCardInstagramCtrl,
            InstagramService;

        var model;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                MiniReelService = $injector.get('MiniReelService');
                InstagramService = $injector.get('InstagramService');

                $scope = $rootScope.$new();
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
                EditCardCtrl.model = MiniReelService.createCard('instagram');

                EditCardInstagramCtrl = $controller('EditCardInstagramController', {
                    $scope: $scope
                });
                model = EditCardInstagramCtrl.model = EditCardCtrl.model;
                $rootScope.$apply();
            });
        });

        it('should exist', function() {
            expect(EditCardInstagramCtrl).toEqual(jasmine.any(Object));
        });

        describe('$watch', function() {
            beforeEach(function() {
                spyOn(InstagramService, 'dataFromUrl').and.returnValue({
                    id: 'abc123'
                });
                spyOn(EditCardInstagramCtrl._private, 'updateEmbedInfo');
                EditCardInstagramCtrl.inputUrl = 'www.instagram.com/p/abc123';
                EditCardCtrl.error = 'error message';
                $rootScope.$apply();
            });

            it('should watch for inputUrl changes', function() {
                expect(InstagramService.dataFromUrl).toHaveBeenCalledWith('www.instagram.com/p/abc123');
            });

            describe('when inputUrl is null', function() {
                beforeEach(function() {
                    spyOn(InstagramService, 'urlFromData').and.returnValue('https://instagram.com/p/abc123');
                    EditCardInstagramCtrl.inputUrl = null;
                    model.data = {
                        id: 'abc123'
                    };
                    $rootScope.$apply();
                });

                it('should set the input url from the model', function() {
                    expect(InstagramService.urlFromData).toHaveBeenCalledWith('abc123');
                    expect(EditCardInstagramCtrl.inputUrl).toEqual('https://instagram.com/p/abc123');
                });
            });

            describe('when inputUrl is not null', function() {
                it('should clear any existing errors', function() {
                    expect(EditCardCtrl.error).toBeNull();
                });

                it('should update the model', function() {
                    expect(InstagramService.dataFromUrl).toHaveBeenCalledWith('www.instagram.com/p/abc123');
                    expect(model.data.id).toEqual('abc123');
                    expect(EditCardInstagramCtrl._private.updateEmbedInfo).toHaveBeenCalledWith('abc123');
                });
            });

        });

        describe('methods', function(){
            describe('private', function(){
                describe('updateEmbedInfo', function() {

                    function updateEmbedInfo() {
                        return EditCardInstagramCtrl._private.updateEmbedInfo.apply(EditCardInstagramCtrl, arguments);
                    }

                    beforeEach(function() {
                        EditCardInstagramCtrl.model.data = {
                            id: 'abc123'
                        };
                    });

                    describe('on success', function() {
                        beforeEach(function() {
                            spyOn(InstagramService, 'getEmbedInfo').and.returnValue(
                                $q.when({
                                    type: 'image',
                                    src: 'www.instagram.com/image.jpg'
                                })
                            );
                            updateEmbedInfo('abc123');
                            $rootScope.$apply();
                        });

                        it('should update the embed info on the controller', function() {
                            expect(EditCardInstagramCtrl.data).toEqual({
                                type: 'image',
                                src: 'www.instagram.com/image.jpg'
                            });
                        });

                        it('should not erase existing properties on the model', function() {
                            expect(model.data.id).toEqual('abc123');
                        });
                    });

                    describe('on failure', function() {
                        beforeEach(function() {
                            spyOn(InstagramService, 'getEmbedInfo').and.returnValue(
                                $q.reject('error message')
                            );
                            updateEmbedInfo('abc123');
                            $rootScope.$apply();
                        });

                        it('should update the error message', function() {
                            expect(EditCardCtrl.error).toEqual('error message');
                        });

                        it('should remove the data properties', function() {
                            expect(EditCardInstagramCtrl.data).toEqual({ });
                        });
                    });
                });
            });
        });
    });
});
