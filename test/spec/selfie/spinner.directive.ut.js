(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('<spinner>', function() {
            var $rootScope,
                $scope,
                $compile,
                SpinnerService,
                $spinner;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    SpinnerService = $injector.get('SpinnerService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $spinner = $compile('<spinner></spinner>')($scope);
                    });
                });
            });

            it('should set its scope.model propertry to be the SpinnerService\'s model', function() {
                expect($spinner.isolateScope().model).toBe(SpinnerService.model);
            });
        });
    });
}());
