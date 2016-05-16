define(['account/app'], function(accountModule) {
    'use strict';

    describe('AccountController', function() {
        var $rootScope,
            $scope,
            $controller,
            AccountCtrl;

        beforeEach(function() {
            module(accountModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    AccountCtrl = $controller('AccountController', { $scope: $scope });
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            AccountCtrl = null;
        });

        it('should exist', function() {
            expect(AccountCtrl).toEqual(jasmine.any(Object));
        });
    });
});
