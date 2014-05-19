(function() {
    'use strict';

    define(['app'], function() {
        describe('ManagerState', function() {
            var ManagerState,
                $rootScope,
                $q,
                cinema6,
                $injector,
                c6State;

            var currentUser,
                experiences,
                appData;

            beforeEach(function() {
                currentUser = {
                    id: 'u-1',
                    org: 'o-fn8y54thf85',
                    username: 'test'
                };

                experiences = [
                    {
                        id: 'e-1'
                    },
                    {
                        id: 'e-2'
                    }
                ];

                appData = {
                    user: currentUser
                };

                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    c6State = $injector.get('c6State');
                });

                ManagerState = c6State.get('manager');
            });

            describe('model', function() {
                var result;

                beforeEach(function() {
                    spyOn(cinema6.db, 'findAll')
                        .and.callFake(function(type) {
                            var deferred = $q.defer();

                            switch(type) {
                            case 'experience':
                                deferred.resolve(experiences);
                                break;

                            default:
                                deferred.reject('404 not found');
                            }

                            return deferred.promise;
                        });
                    spyOn(cinema6, 'getAppData').and.returnValue($q.when(appData));

                    $rootScope.$apply(function() {
                        result = $injector.invoke(ManagerState.model, ManagerState);
                    });
                });

                it('should return a promise', function() {
                    expect(result.then).toEqual(jasmine.any(Function));
                });

                it('should get the currentUser', function() {
                    expect(cinema6.getAppData).toHaveBeenCalled();
                });

                it('should get all the minireels that are associated with the user\'s org', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', { type: 'minireel', org: currentUser.org, sort: 'lastUpdated,-1' });
                });

                it('should return the model it already has if it has one', function() {
                    ManagerState.cModel = [];

                    expect($injector.invoke(ManagerState.model, ManagerState)).toBe(ManagerState.cModel);
                });
            });
        });
    });
}());
