define(['app','minireel/services','minireel/mixins/PaginatedListState'], function(appModule, servicesModule, PaginatedListState) {
    'use strict';

    describe('Selfie:Campaigns state', function() {
        var c6State,
            paginatedDbList,
            campaigns,
            $location,
            $injector,
            $rootScope,
            SettingsService,
            SpinnerService;

        var dbList,
            deferred;

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
                $provide.decorator('paginatedDbList', function($delegate, $q) {
                    return jasmine.createSpy('paginatedDbList()').and.callFake(function() {
                        deferred = $q.defer();
                        dbList = {
                            ensureResolution: jasmine.createSpy('ensureResolution()')
                                .and.returnValue(deferred.promise)
                        };

                        // spyOn(dbList, 'ensureResolution').and;

                        return dbList;
                    });
                });
            });

            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;
                spyOn($injector, 'invoke').and.callThrough();
                $rootScope = $injector.get('$rootScope');

                c6State = $injector.get('c6State');
                paginatedDbList = $injector.get('paginatedDbList');
                SettingsService = $injector.get('SettingsService');
                SpinnerService = $injector.get('SpinnerService');

                spyOn(SettingsService, 'register');
                spyOn(SettingsService, 'getReadOnly');
                spyOn(SpinnerService, 'display');
                spyOn(SpinnerService, 'close');

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
                    filter: 'draft,pending,active,paused,canceled,completed,expired,error',
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
            var result, success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                campaigns.filter = 'draft,pending,active,paused,canceled,completed,expired,error';
                campaigns.sort = 'lastUpdated,-1';
                campaigns.search = null;

                result = campaigns.model().then(success, failure);

                expect(paginatedDbList.calls.count()).toBe(1);
            });

            it('should display the spinner', function() {
                expect(SpinnerService.display).toHaveBeenCalled();
            });

            it('should return a promise', function() {
                expect(result.then).toBeDefined();
            });

            it('should be for a list of campaigns', function() {
                expect(paginatedDbList).toHaveBeenCalledWith('selfieCampaign', {
                    sort: 'lastUpdated,-1',
                    application: 'selfie',
                    statuses: 'draft,pending,active,paused,canceled,completed,expired,error',
                    text: null
                }, campaigns.limit, campaigns.page);
            });

            describe('when the db call resolves', function() {
                it('the model should resolve', function() {
                    var items = [];

                    $rootScope.$apply(function() {
                        deferred.resolve(items);
                    });

                    expect(success).toHaveBeenCalledWith(items);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('should close the spinner', function() {
                    var items = [];

                    $rootScope.$apply(function() {
                        deferred.resolve(items);
                    });

                    expect(SpinnerService.close).toHaveBeenCalled();
                });
            });

            describe('when the db call rejects', function() {
                it('the model should reject', function() {
                    $rootScope.$apply(function() {
                        deferred.reject();
                    });

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalled();
                });

                it('should close the spinner', function() {
                    $rootScope.$apply(function() {
                        deferred.reject();
                    });

                    expect(SpinnerService.close).toHaveBeenCalled();
                });
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
