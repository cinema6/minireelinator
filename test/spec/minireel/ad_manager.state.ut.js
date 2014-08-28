(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('AdManagerState', function() {
            var AdManagerState,
                $rootScope,
                $q,
                $location,
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
                    $location = $injector.get('$location');
                    cinema6 = $injector.get('cinema6');
                    c6State = $injector.get('c6State');
                    scopePromise = $injector.get('scopePromise');
                });

                spyOn($location, 'search').and.returnValue({});

                AdManagerState = c6State.get('MR:AdManager');
                portal = c6State.get('Portal');
                portal.cModel = {
                    org: {
                        id: 'o-fe9cf63e8490b0'
                    }
                };
            });

            describe('filter', function() {
                it('should be all', function() {
                    expect(AdManagerState.filter).toBe('all');
                });
            });

            describe('limit', function() {
                it('should be 50', function() {
                    expect(AdManagerState.limit).toBe(50);
                });
            });

            describe('page', function() {
                it('should be 1', function() {
                    expect(AdManagerState.page).toBe(1);
                });
            });

            describe('filter, limit and page if they are set in the query params', function() {
                beforeEach(function() {
                    $location.search.and.returnValue({
                        filter: 'active',
                        limit: '100',
                        page: '3'
                    });

                    AdManagerState = $injector.instantiate(AdManagerState.constructor);
                });

                it('should take those properties', function() {
                    expect(AdManagerState.filter).toBe('active');
                    expect(AdManagerState.limit).toBe(100);
                    expect(AdManagerState.page).toBe(3);
                });
            });

            describe('modelWithFilter(filter, limit, page, previous)', function() {
                var result,
                    deferred, promise,
                    ScopedPromise;

                beforeEach(function() {
                    ScopedPromise = scopePromise($q.defer().promise).constructor;
                    deferred = $q.defer();
                    promise = deferred.promise;

                    spyOn(cinema6.db, 'findAll')
                        .and.returnValue(promise);
                });

                ['active', 'pending', 'all'].forEach(function(status) {
                    describe('when called with ' + status, function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                result = AdManagerState.modelWithFilter(status, 7, 1);
                            });
                        });

                        it('should return a scoped promise', function() {
                            expect(result.promise).toBe(promise);
                            expect(result).toEqual(jasmine.any(ScopedPromise));
                        });

                        it('should decorate the scoped promise with a null "selected" property', function() {
                            expect(result.selected).toBeNull();
                        });

                        it('should decorate the scoped promise with a null "page" property', function() {
                            expect(result.page).toBeNull();
                        });

                        describe('when the promise is resolved', function() {
                            var value;

                            beforeEach(function() {
                                value = [{}, {}, {}, {}, {}, {}, {}];
                                value.meta = {
                                    items: {
                                        start: 22,
                                        end: 28,
                                        total: 500
                                    }
                                };

                                $rootScope.$apply(function() {
                                    deferred.resolve(value);
                                });
                            });

                            it('should set selected to an array equal to the result, but filled with false', function() {
                                expect(result.selected).toEqual(value.map(function() { return false; }));
                            });

                            it('should set page as the page info', function() {
                                expect(result.page).toEqual({
                                    current: 4,
                                    total: 72
                                });
                            });
                        });

                        describe('when called with an initial value', function() {
                            var previous;

                            beforeEach(function() {
                                previous = AdManagerState.modelWithFilter(status, 50, 1);
                                previous.value = [{}, {}, {}];
                                previous.selected = [false, false, true];
                                previous.page = {
                                    current: 1,
                                    total: 10
                                };

                                $rootScope.$apply(function() {
                                    result = AdManagerState.modelWithFilter(status, 50, 1, previous);
                                });
                            });

                            it('should set the initial value on the scoped promise', function() {
                                expect(result.value).toBe(previous.value);
                            });

                            it('should set the selected property', function() {
                                expect(result.selected).toBe(previous.selected);
                            });

                            it('should set the page value', function() {
                                expect(result.page).toBe(previous.page);
                            });
                        });
                    });
                });

                describe('when called with "all"', function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            result = AdManagerState.modelWithFilter('all', 50, 1);
                        });
                    });

                    it('should find experiences of all statuses', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                            type: 'minireel',
                            org: portal.cModel.org.id,
                            sort: 'lastUpdated,-1',
                            status: null,
                            limit: 50,
                            skip: 0
                        });
                    });
                });

                ['active', 'pending'].forEach(function(status) {
                    describe('when called with ' + status, function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                result = AdManagerState.modelWithFilter(status, 25, 3);
                            });
                        });

                        it('should find experiences with the specified status', function() {
                            expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                                type: 'minireel',
                                org: portal.cModel.org.id,
                                sort: 'lastUpdated,-1',
                                status: status,
                                limit: 25,
                                skip: 50
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

                    spyOn(AdManagerState, 'modelWithFilter')
                        .and.returnValue(scopedPromise);

                    $rootScope.$apply(function() {
                        result = AdManagerState.model();
                    });
                });

                it('should call this.modelWithFilter() with the current filter property and return the resolved result', function() {
                    expect(AdManagerState.modelWithFilter).toHaveBeenCalledWith(AdManagerState.filter, AdManagerState.limit, AdManagerState.page);
                    expect(result).toBe(scopedPromise.ensureResolution());
                });
            });
        });
    });
}());
