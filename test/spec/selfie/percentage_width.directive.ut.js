define(['app'], function(appModule) {
    'use strict';

    describe('percentage-width directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $div;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
            });
        });

        it('should set the width of the element based on the value passed in', function() {
            $scope.$apply(function() {
                $div = $compile('<div percentage-width="{{value}}"></div>')($scope);
            });

            $scope.$apply(function() {
                $scope.value = 76.3;
            });

            expect($div[0].style.width).toEqual('76.3%');

            $scope.$apply(function() {
                $scope.value = 4;
            });

            expect($div[0].style.width).toEqual('4%');
        });
    });
});