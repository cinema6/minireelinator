(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('<selfie-login-dialog>', function() {
            var $rootScope,
                $scope,
                $compile,
                SelfieLoginDialogService,
                $login;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    SelfieLoginDialogService = $injector.get('SelfieLoginDialogService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $login = $compile('<selfie-login-dialog></selfie-login-dialog>')($scope);
                    });
                });
            });

            afterEach(function() {
                $login.remove();
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $compile = null;
                SelfieLoginDialogService = null;
                $login = null;
            });

            it('should set its scope.model propertry to be the SelfieLoginDialogService\'s model', function() {
                expect($login.isolateScope().model).toBe(SelfieLoginDialogService.model);
            });
        });
    });
}());
