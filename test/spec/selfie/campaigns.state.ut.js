define(['app','minireel/services','minireel/mixins/PaginatedListState'], function(appModule, servicesModule, PaginatedListState) {
    'use strict';

    describe('Selfie:Campaigns state', function() {
        var c6State,
            paginatedDbList,
            campaigns,
            $location,
            $injector;

        var dbList,
            promise;

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
                $provide.decorator('paginatedDbList', function($delegate, $q) {
                    return jasmine.createSpy('paginatedDbList()').and.callFake(function() {
                        dbList = $delegate.apply(null, arguments);

                        spyOn(dbList, 'ensureResolution').and.returnValue(promise = $q.when([]));

                        return dbList;
                    });
                });
            });

            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;
                spyOn($injector, 'invoke').and.callThrough();

                c6State = $injector.get('c6State');
                paginatedDbList = $injector.get('paginatedDbList');
                $location = $injector.get('$location');
                spyOn($location,'search').and.returnValue({});

                campaigns = c6State.get('Selfie:Campaigns');
            });
        });

        it('should exist', function() {
            expect(campaigns).toEqual(jasmine.any(Object));
        });

        it('should apply the PaginatedListState mixin', function() {
            expect($injector.invoke).toHaveBeenCalledWith(PaginatedListState, campaigns);
        });

        describe('properties', function() {
            describe('filter', function() {
                it('should be the filter query param from the url, or default to all statuses', function() {
                    expect(campaigns.filter).toBe('draft,pending,approved,active,paused,error');

                    $location.search.and.returnValue({
                        filter: 'active,draft',
                        filterBy: 'statuses'
                    });
                    campaigns = $injector.instantiate(campaigns.constructor);

                    expect(campaigns.filter).toBe('active,draft');
                });
            });

            describe('filterBy', function() {
                it('should be the filterBy query param from the url, or default to "status"', function() {
                    expect(campaigns.filterBy).toBe('statuses');

                    $location.search.and.returnValue({
                        filter: 'active,draft',
                        filterBy: 'budget'
                    });
                    campaigns = $injector.instantiate(campaigns.constructor);

                    expect(campaigns.filterBy).toBe('budget');
                });
            });

            describe('sort', function() {
                it('should be the filterBy query param from the url, or default to "status"', function() {
                    expect(campaigns.sort).toBe('lastUpdated,-1');

                    $location.search.and.returnValue({
                        filter: 'active,draft',
                        filterBy: 'budget',
                        sort: 'name,-1'
                    });
                    campaigns = $injector.instantiate(campaigns.constructor);

                    expect(campaigns.sort).toBe('name,-1');
                });
            });

            describe('queryParams', function() {
                it('should add the filter and filterBy bindings', function() {
                    expect(campaigns.queryParams).toEqual(jasmine.objectContaining({
                        filter: '=',
                        filterBy: '=',
                        sort: '=',
                        search: '='
                    }));
                });
            });
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = campaigns.model();

                expect(paginatedDbList.calls.count()).toBe(1);
            });

            it('should return the promise from the paginated db list', function() {
                expect(result).toBe(promise);
            });

            it('should be for a list of campaigns', function() {
                expect(paginatedDbList).toHaveBeenCalledWith('selfieCampaign', {
                    sort: 'lastUpdated,-1',
                    application: 'selfie',
                    statuses: 'draft,pending,approved,active,paused,error'
                }, campaigns.limit, campaigns.page);
            });
        });

        describe('afterModel()', function() {
            it('should add the isAdmin flag to the state', function() {
                var selfieState = c6State.get('Selfie');
                selfieState.cModel = {
                    entitlements: {}
                };

                campaigns.afterModel();
                expect(campaigns.isAdmin).toBe(false);

                selfieState.cModel.entitlements.adminCampaigns = true;

                campaigns.afterModel();
                expect(campaigns.isAdmin).toBe(true);
            });
        });
    });
});
