define(['app'], function(appModule) {
    'use strict';

    describe('SelfieAppController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieAppCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
            });

            $scope = $rootScope.$new();
            SelfieAppCtrl = $controller('SelfieAppController', { $scope: $scope });
        });

        it('should exist', function() {
            expect(SelfieAppCtrl).toEqual(jasmine.any(Object));
        });
    });
});