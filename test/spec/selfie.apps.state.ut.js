define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Apps State', function() {
        var c6State,
            $rootScope,
            $q,
            cinema6,
            selfie,
            apps;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
            });

            selfie = c6State.get('Selfie');
            selfie.cModel = {
                id: 'u-123',
                org: {
                    id: '0-abc'
                },
                applications: ['e-4a10e2e0c9c9fc', 'e-e8603dc4da81c9']
            };
            apps = c6State.get('Selfie:Apps');
        });

        it('should exist', function() {
            expect(apps).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var minireel, other,
                success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                minireel = {
                    appUri: 'selfie'
                };
                other = {
                    appUri: 'some-other'
                };

                spyOn(cinema6.db, 'find').and.callFake(function(type, id) {
                    switch (id) {
                    case 'e-4a10e2e0c9c9fc':
                        return $q.when(minireel);
                    case 'e-e8603dc4da81c9':
                        return $q.when(other);
                    default:
                        return $q.reject('NOT FOUND');
                    }
                });

                $rootScope.$apply(function() {
                    apps.model().then(success, failure);
                });
            });

            it('should resolve to an object of experiences', function() {
                expect(success).toHaveBeenCalledWith({
                    'selfie': minireel,
                    'some-other': other
                });
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');
                apps.cModel = {
                    proshop: {
                        appUri: 'proshop'
                    },
                    selfie: {
                        appUri: 'selfie'
                    }
                };
                $rootScope.$apply(function() {
                    apps.enter();
                });
            });

            it('should transition to the Selfie:App state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:App', [apps.cModel.selfie], null, true);
            });

            it('should go to the error state if the minireel\'s uri is not "selfie"', function() {
                delete apps.cModel.selfie;
                apps.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Error', [jasmine.any(String)], null, true);
            });
        });
    });
});
