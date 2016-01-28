define(['app','minireel/services','minireel/mixins/PaginatedListState'], function(appModule, servicesModule, PaginatedListState) {
    'use strict';

    describe('Selfie:Campaigns state', function() {
        var c6State,
            paginatedDbList,
            campaigns,
            $location,
            $injector,
            SettingsService;

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
                SettingsService = $injector.get('SettingsService');

                spyOn(SettingsService, 'register');
                spyOn(SettingsService, 'getReadOnly');

                campaigns = c6State.get('Selfie:Campaigns');
            });
        });

        it('should exist', function() {
            expect(campaigns).toEqual(jasmine.any(Object));
        });

        it('should apply the PaginatedListState mixin', function() {
            expect($injector.invoke).toHaveBeenCalledWith(PaginatedListState, campaigns);
        });

        describe('beforeModel()', function() {
            var defaults, savedParams;

            beforeEach(function() {
                defaults = {
                    filter: 'draft,pending,active,paused,canceled,expired,error',
                    filterBy: 'statuses',
                    sort: 'lastUpdated,-1',
                    search: null
                };

                savedParams = {
                    filter: 'pending,active',
                    filterBy: 'budget',
                    sort: 'name,1',
                    search: 'Hello'
                };

                SettingsService.getReadOnly.and.returnValue(savedParams);

                campaigns.beforeModel();
            });

            it('should register the params object with the SettingsService', function() {
                expect(SettingsService.register).toHaveBeenCalledWith('Selfie::params', campaigns.params, {
                    localSync: true,
                    defaults: defaults
                });
            });

            it('should get the params from the SettingsService', function() {
                expect(SettingsService.getReadOnly).toHaveBeenCalledWith('Selfie::params');
            });

            it('should add the saved params to the State', function() {
                expect(campaigns.filter).toBe('pending,active');
                expect(campaigns.filterBy).toBe('budget');
                expect(campaigns.sort).toBe('name,1');
                expect(campaigns.search).toBe('Hello');
            });

            it('should add the params to the queryParams object', function() {
                expect(campaigns.queryParams).toEqual(jasmine.objectContaining({
                    filter: '=',
                    filterBy: '=',
                    sort: '=',
                    search: '='
                }));
            });
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                campaigns.filter = 'draft,pending,active,paused,canceled,expired,error';
                campaigns.sort = 'lastUpdated,-1';
                campaigns.search = null;

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
                    statuses: 'draft,pending,active,paused,canceled,expired,error',
                    text: null
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
