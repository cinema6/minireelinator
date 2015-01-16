define(['app'], function(appModule) {
    'use strict';

    describe('EditCardVideoController', function() {
        var $rootScope,
            $scope,
            $controller,
            MiniReelService,
            PortalCtrl,
            EditorCtrl,
            EditCardCtrl,
            EditCardVideoCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                MiniReelService = $injector.get('MiniReelService');

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
                    EditCardCtrl.model = MiniReelService.createCard('video');

                    EditCardVideoCtrl = $controller('EditCardVideoController', {
                        $scope: $scope
                    });
                    EditCardVideoCtrl.model = EditCardCtrl.model;
                });
            });
        });

        it('should exist', function() {
            expect(EditCardVideoCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('search()', function() {
                beforeEach(function() {
                    spyOn(EditorCtrl, 'queueSearch').and.callThrough();
                });

                describe('if there is a video URL', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            EditCardCtrl.videoUrl = 'http://www.youtube.com/watch?v=qTKaWcpyBdY';
                        });
                        EditCardVideoCtrl.search();
                    });

                    it('should do nothing', function() {
                        expect(EditorCtrl.queueSearch).not.toHaveBeenCalled();
                    });
                });

                describe('if there is a search term', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            EditCardCtrl.videoUrl = 'Ketchup Bot';
                        });
                        EditCardVideoCtrl.search();
                    });

                    it('should queue a search', function() {
                        expect(EditorCtrl.queueSearch).toHaveBeenCalledWith('Ketchup Bot');
                    });
                });

                describe('if there is no value', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            EditCardCtrl.videoUrl = '';
                        });
                        EditCardVideoCtrl.search();
                    });

                    it('should do nothing', function() {
                        expect(EditorCtrl.queueSearch).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
