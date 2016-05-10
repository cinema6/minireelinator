(function() {
    'use strict';

    define(['jquerymasked', 'app'], function(jquerymasked, appModule) {
        describe('inputMask', function() {
            var $rootScope,
                $scope,
                $compile,
                $input;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                    $scope.text = '';
                    spyOn($.fn, 'mask');
                    $scope.$apply(function() {
                        $input = $compile('<input type="text" input-mask="mask-999" ng-model="text"></input>')($scope);
                    });
                });
            });

            it('should exist', function() {
                expect($input).toBeDefined();
            });

            it('should mask the input element', function() {
                expect($.fn.mask).toHaveBeenCalledWith('mask-999');
            });
        });
    });
}());
