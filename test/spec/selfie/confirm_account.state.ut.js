define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:ConfirmAccount State', function() {
        var $rootScope,
            $q,
            $location,
            c6State,
            cinema6,
            AccountService,
            SelfieConfirmAcctState;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $location = $injector.get('$location');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                AccountService = $injector.get('AccountService');
                $q = $injector.get('$q');
            });

            spyOn($location, 'search').and.returnValue({
                userId: 'u-111',
                token: '1234567'
            });

            SelfieConfirmAcctState = c6State.get('Selfie:ConfirmAccount');
        });

        it('should exist', function() {
            expect(SelfieConfirmAcctState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                spyOn(AccountService, 'confirmUser');
            });

            it('should use the id and token params to confirm the user', function() {
                AccountService.confirmUser.and.returnValue($q.when(null));
                $rootScope.$apply(function() {
                    SelfieConfirmAcctState.model().then(success, failure);
                });

                expect(AccountService.confirmUser).toHaveBeenCalledWith('u-111','1234567');
            });

            describe('if the user is confirmed', function() {
                var user;

                beforeEach(function() {
                    user = {
                        email: 'josh@cinema6.com'
                    };

                    AccountService.confirmUser.and.returnValue($q.when(user));
                    $rootScope.$apply(function() {
                        SelfieConfirmAcctState.model().then(success, failure);
                    });
                });

                it('should return the user', function() {
                    expect(success).toHaveBeenCalledWith(user);
                });
            });

            describe('if the user is not confirmed', function() {
                beforeEach(function() {
                    AccountService.confirmUser.and.returnValue($q.reject());
                    spyOn(c6State, 'goTo');
                    $rootScope.$apply(function() {
                        SelfieConfirmAcctState.model().then(success, failure);
                    });
                });

                it('should transition to the login state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Login', null, {reason:0});
                });
            });
        });

        describe('enter()', function() {
            it('should go to the "Selfie:Login" state', function() {
                spyOn(c6State, 'goTo');

                $rootScope.$apply(function() {
                    SelfieConfirmAcctState.enter();
                });

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Login', null, {reason:1});
            });
        });
    });
});