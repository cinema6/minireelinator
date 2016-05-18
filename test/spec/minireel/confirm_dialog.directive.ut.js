(function() {
    'use strict';

    define(['minireel/app','templates'], function(minireelModule) {
        describe('<confirm-dialog>', function() {
            var $rootScope,
                $scope,
                $compile,
                ConfirmDialogService,
                $confirm;

            beforeEach(function() {
                module('c6.app');
                module(minireelModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $confirm = $compile('<confirm-dialog></confirm-dialog>')($scope);
                    });
                });
            });

            afterEach(function() {
                $confirm.remove();
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $compile = null;
                ConfirmDialogService = null;
                $confirm = null;
            });

            it('should set its scope.model propertry to be the ConfirmDialogService\'s model', function() {
                expect($confirm.isolateScope().model).toBe(ConfirmDialogService.model);
            });
        });
    });
}());
