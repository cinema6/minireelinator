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
                id: 'u-111',
                token: '1234567'
            });

            spyOn(c6State, 'goTo');

            SelfieConfirmAcctState = c6State.get('Selfie:ConfirmAccount');
        });

        it('should exist', function() {
            expect(SelfieConfirmAcctState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var user, success, failure;

            beforeEach(function() {
                user = {
                    email: 'josh@cinema6.com',
                    org: 'o-123',
                    advertiser: 'a-123',
                    customer: 'cus-123'
                };

                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                spyOn(cinema6.db, 'find').and.callFake(function(entity) {
                    switch (entity) {
                        case 'org':
                            return {
                                id: 'o-123'
                            };
                        case 'advertiser':
                            return {
                                id: 'a-123'
                            };
                        case 'customer':
                            return {
                                id: 'cus-123'
                            };
                    }
                });

                spyOn(AccountService, 'confirmUser');
            });

            it('should use the id and token params to confirm the user', function() {
                AccountService.confirmUser.and.returnValue($q.when(user));
                $rootScope.$apply(function() {
                    SelfieConfirmAcctState.model().then(success, failure);
                });

                expect(AccountService.confirmUser).toHaveBeenCalledWith('u-111','1234567');
            });

            describe('if the user is confirmed', function() {
                beforeEach(function() {
                    AccountService.confirmUser.and.returnValue($q.when(user));
                    $rootScope.$apply(function() {
                        SelfieConfirmAcctState.model().then(success, failure);
                    });
                });

                it('should decorate the user', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', 'o-123');
                    expect(cinema6.db.find).toHaveBeenCalledWith('advertiser', 'a-123');
                    expect(cinema6.db.find).toHaveBeenCalledWith('customer', 'cus-123');
                });

                it('shoudl go to the Selfie state', function() {
                    var decoratedUser = {
                        email: 'josh@cinema6.com',
                        org: {
                            id: 'o-123'
                        },
                        advertiser: {
                            id: 'a-123'
                        },
                        customer: {
                            id: 'cus-123'
                        }
                    };

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie', [decoratedUser]);
                });

                it('should return the user', function() {
                    expect(success).toHaveBeenCalledWith(user);
                });
            });

            describe('if the user is not confirmed', function() {
                beforeEach(function() {
                    AccountService.confirmUser.and.returnValue($q.reject());
                    $rootScope.$apply(function() {
                        SelfieConfirmAcctState.model().then(success, failure);
                    });
                });

                it('should transition to the login state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Login', null, {reason:1});
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalled();
                });
            });

            describe('if the decoration is not successful', function() {
                beforeEach(function() {
                    AccountService.confirmUser.and.returnValue($q.when(user));
                    cinema6.db.find.and.returnValue($q.reject());
                    $rootScope.$apply(function() {
                        SelfieConfirmAcctState.model().then(success, failure);
                    });
                });

                it('should transition to the login state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Login', null, {reason:1});
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalled();
                });
            });
        });
    });
});