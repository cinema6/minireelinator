define(['app','minireel/services','minireel/mixins/PaginatedListState'], function(appModule, servicesModule, PaginatedListState) {
    'use strict';

    describe('Selfie:Campaigns state', function() {
        var c6State,
            paginatedDbList,
            selfie,
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

                selfie = c6State.get('Selfie');
                selfie.cModel = {
                    org: {
                        id: 'o-123456'
                    }
                };
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
                    expect(campaigns.filter).toBe('draft,pendingApproval,approved,active,paused,error');

                    $location.search.and.returnValue({
                        filter: 'active,draft',
                        filterBy: 'status'
                    });
                    campaigns = $injector.instantiate(campaigns.constructor);

                    expect(campaigns.filter).toBe('active,draft');
                });
            });

            describe('filterBy', function() {
                it('should be the filterBy query param from the url, or default to "status"', function() {
                    expect(campaigns.filterBy).toBe('status');

                    $location.search.and.returnValue({
                        filter: 'active,draft',
                        filterBy: 'budget'
                    });
                    campaigns = $injector.instantiate(campaigns.constructor);

                    expect(campaigns.filterBy).toBe('budget');
                });
            });

            describe('queryParams', function() {
                it('should add the filter and filterBy bindings', function() {
                    expect(campaigns.queryParams).toEqual(jasmine.objectContaining({
                        filter: '=',
                        filterBy: '='
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
                    org: 'o-123456',
                    application: 'selfie',
                    status: 'draft,pendingApproval,approved,active,paused,error'
                }, campaigns.limit, campaigns.page);
            });
        });
    });
});
