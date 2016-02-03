(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('<soft-alert>', function() {
            var $rootScope,
                $scope,
                $compile,
                SoftAlertService,
                $alert;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    SoftAlertService = $injector.get('SoftAlertService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $alert = $compile('<soft-alert></soft-alert>')($scope);
                    });
                });
            });

            it('should set its scope.model propertry to be the SoftAlertService\'s model', function() {
                expect($alert.isolateScope().model).toBe(SoftAlertService.model);
            });
        });
    });
}());
