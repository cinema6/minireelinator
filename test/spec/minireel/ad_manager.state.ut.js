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

            describe('model()', function() {
                var result,
                    scopedPromise;

                beforeEach(function() {
                    scopedPromise = scopePromise($q.defer().promise);

                    spyOn(AdManagerState.cParent, 'getMiniReelList')
                        .and.returnValue(scopedPromise);

                    $rootScope.$apply(function() {
                        result = AdManagerState.model();
                    });
                });

                it('should call this.modelWithFilter() with the current filter property and return the resolved result', function() {
                    expect(AdManagerState.cParent.getMiniReelList).toHaveBeenCalledWith(AdManagerState.filter, AdManagerState.limit, AdManagerState.page);
                    expect(result).toBe(scopedPromise.ensureResolution());
                });
            });
        });
    });
}());
