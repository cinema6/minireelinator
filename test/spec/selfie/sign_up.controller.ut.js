define(['app'], function(appModule) {
    'use strict';

    describe('SelfieSignUpController', function() {
        var $rootScope,
            $controller,
            c6State,
            AccountService,
            $q,
            $scope,
            SelfieSignUpCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                AccountService = $injector.get('AccountService');
                $q = $injector.get('$q');
            });

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieSignUpCtrl = $controller('SelfieSignUpController');
            });
        });

        it('should exist', function() {
            expect(SelfieSignUpCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('submit()', function() {
                it('should sign up via the AccountService', function() {
                    spyOn(AccountService, 'signUp').and.returnValue($q.when(null));

                    SelfieSignUpCtrl.submit();

                    expect(AccountService.signUp).toHaveBeenCalled();
                });
            });
        });
    });
});