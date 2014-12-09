define(['app','minireel/services','minireel/mixins/PaginatedListState'], function(appModule, servicesModule, PaginatedListState) {
    'use strict';

    describe('MR:Campaigns state', function() {
        var c6State,
            paginatedDbList,
            campaigns;

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

            inject(function($injector) {
                c6State = $injector.get('c6State');
                paginatedDbList = $injector.get('paginatedDbList');

                campaigns = c6State.get('MR:Campaigns');
            });
        });

        it('should exist', function() {
            expect(campaigns).toEqual(jasmine.any(Object));
        });

        it('should apply the PaginatedListState mixin', inject(function($injector) {
            expect(campaigns).toEqual(jasmine.objectContaining($injector.instantiate(PaginatedListState)));
        }));

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
                expect(paginatedDbList).toHaveBeenCalledWith('campaign', {
                    sort: 'lastUpdated,-1'
                }, campaigns.limit, campaigns.page);
            });
        });
    });
});
