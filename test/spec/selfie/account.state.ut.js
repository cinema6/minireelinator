define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Account State', function() {
        var c6State,
            $rootScope,
            $q,
            AccountState,
            SelfieState,
            user;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                $q = $injector.get('$q');
            });

            user = {
                firstName: 'Selfie',
                lastName: 'User',
                company: 'Selfie, Inc.'
            };

            SelfieState = c6State.get('Selfie');
            SelfieState.cModel = user;

            AccountState = c6State.get('Selfie:Account');
        });

        it('should exist', function() {
            expect(AccountState).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            it('should return an empty login model', function() {
                expect(AccountState.model()).toEqual(user);
            });
        });

        describe('enter()', function() {
            it('should go to the Overview', function() {
                spyOn(c6State, 'goTo');

                AccountState.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Account:Overview');
            });
        });
    });
});
