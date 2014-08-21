(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('ManagerState', function() {
            var ManagerState,
                $rootScope,
                $q,
                cinema6,
                $injector,
                c6State,
                scopePromise,
                portal;

            var currentUser,
                experiences;

            beforeEach(function() {
                currentUser = {
                    id: 'u-1',
                    org: {
                        id: 'o-fn8y54thf85'
                    },
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

                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    c6State = $injector.get('c6State');
                    scopePromise = $injector.get('scopePromise');
                });

                ManagerState = c6State.get('MR:Manager');
                portal = c6State.get('Portal');
                portal.cModel = {
                    org: {
                        id: 'o-fe9cf63e8490b0'
                    }
                };
            });

            describe('filter', function() {
                it('should be all', function() {
                    expect(ManagerState.filter).toBe('all');
                });
            });

            describe('modelWithFilter(filter)', function() {
                var result,
                    promise,
                    ScopedPromise;

                beforeEach(function() {
                    ScopedPromise = scopePromise($q.defer().promise).constructor;
                    promise = $q.defer().promise;

                    spyOn(cinema6.db, 'findAll')
                        .and.returnValue(promise);
                });

                describe('when called with "all"', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            result = ManagerState.modelWithFilter('all');
                        });
                    });

                    it('should return a scoped promise', function() {
                        expect(result.promise).toBe(promise);
                        expect(result).toEqual(jasmine.any(ScopedPromise));
                    });

                    it('should find experiences of all statuses', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                            type: 'minireel',
                            org: portal.cModel.org.id,
                            sort: 'lastUpdated,-1',
                            status: null
                        });
                    });
                });

                ['active', 'pending'].forEach(function(status) {
                    describe('when called with ' + status, function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                result = ManagerState.modelWithFilter(status);
                            });
                        });

                        it('should return a scoped promise', function() {
                            expect(result.promise).toBe(promise);
                            expect(result).toEqual(jasmine.any(ScopedPromise));
                        });

                        it('should find experiences with the specified status', function() {
                            expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                                type: 'minireel',
                                org: portal.cModel.org.id,
                                sort: 'lastUpdated,-1',
                                status: status
                            });
                        });
                    });
                });
            });

            describe('model()', function() {
                var result,
                    scopedPromise;

                beforeEach(function() {
                    scopedPromise = scopePromise($q.defer().promise);

                    spyOn(ManagerState, 'modelWithFilter')
                        .and.returnValue(scopedPromise);

                    $rootScope.$apply(function() {
                        result = ManagerState.model();
                    });
                });

                it('should call this.modelWithFilter() with the current filter property and return the result', function() {
                    expect(ManagerState.modelWithFilter).toHaveBeenCalledWith(ManagerState.filter);
                    expect(result).toBe(scopedPromise);
                });
            });
        });
    });
}());
