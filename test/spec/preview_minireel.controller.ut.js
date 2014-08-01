define(['preview_minireel'], function(previewMiniReelModule) {
    'use strict';

    describe('PreviewMiniReelController', function() {
        var $rootScope,
            $controller,
            $scope,
            PreviewMiniReelCtrl;

        beforeEach(function() {
            module(previewMiniReelModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    PreviewMiniReelCtrl = $controller('PreviewMiniReelController', { $scope: $scope });
                });
            });
        });

        it('should exist', function() {
            expect(PreviewMiniReelCtrl).toEqual(jasmine.any(Object));
        });
    });
});
