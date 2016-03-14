define(['app','minireel/services','minireel/mixins/PaginatedListState'], function(appModule, servicesModule, PaginatedListState) {
    'use strict';

    ['Selfie:All:Campaigns','Selfie:Pending:Campaigns'].forEach(function(stateName) {
        describe('Selfie:Campaigns state', function() {
            var c6State,
                paginatedDbList,
                campaigns,
                SelfieState,
                $location,
                $injector,
                $rootScope,
                SettingsService,
                SpinnerService;

            var dbList,
                deferred,
                user;

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
                    $location = $injector.get('$location');

                    c6State = $injector.get('c6State');
                    paginatedDbList = $injector.get('paginatedDbList');
                    SettingsService = $injector.get('SettingsService');
                    SpinnerService = $injector.get('SpinnerService');

                    spyOn(SettingsService, 'register');
                    spyOn(SettingsService, 'getReadOnly');
                    spyOn(SpinnerService, 'display');
                    spyOn(SpinnerService, 'close');

                    user = {
                        id: 'u-123',
                        config: {},
                        org: { // decorated org
                            id: 'o-123'
                        },
                        save: jasmine.createSpy('user.save()')
                    };

                    SelfieState = c6State.get('Selfie');
                    SelfieState.cModel = user;

                    campaigns = c6State.get(stateName);
                    campaigns.cParent = {
                        orgs: [
                            {
                                id: 'o-123'
                            }
                        ]
                    };
                });
            });

            it('should exist', function() {
                expect(campaigns).toEqual(jasmine.any(Object));
            });

            it('should apply the PaginatedListState mixin', function() {
                expect($injector.invoke).toHaveBeenCalledWith(PaginatedListState, campaigns);
            });

            describe('beforeModel()', function() {
                describe('when SettingsService already has settings registered', function() {
                    var savedParams;

                    beforeEach(function() {
                        savedParams = {
                            filter: 'pending,active',
                            filterBy: 'budget',
                            sort: 'name,1',
                            search: 'Hello',
                            excludeOrgs: 'o-111,o-222'
                        };

                        SettingsService.getReadOnly.and.returnValue(savedParams);

                        campaigns.beforeModel();
                    });

                    it('should not register the params object with the SettingsService', function() {
                        expect(SettingsService.register).not.toHaveBeenCalled();
                    });

                    it('should get the params from the SettingsService', function() {
                        expect(SettingsService.getReadOnly).toHaveBeenCalledWith('Selfie::params');
                    });

                    it('should add the saved params to the State', function() {
                        expect(campaigns.filter).toBe('pending,active');
                        expect(campaigns.filterBy).toBe('budget');
                        expect(campaigns.sort).toBe('name,1');
                        expect(campaigns.search).toBe('Hello');
                        expect(campaigns.excludeOrgs).toBe('o-111,o-222');
                    });

                    it('should add the params to the queryParams object', function() {
                        expect(campaigns.queryParams).toEqual(jasmine.objectContaining({
                            filter: '=',
                            filterBy: '=',
                            sort: '=',
                            search: '=',
                            excludeOrgs: '='
                        }));
                    });
                });

                describe('when SettingsService does not have settings registered', function() {
                    var defaults, savedParams;

                    beforeEach(function() {
                        var counter = 0;

                        defaults = {
                            filter: 'error,draft,pending,active,paused,canceled,completed,outOfBudget,expired',
                            filterBy: 'statuses',
                            sort: 'lastUpdated,-1',
                            search: null
                        };

                        savedParams = {
                            filter: 'pending,active',
                            filterBy: 'budget',
                            sort: 'name,1',
                            search: 'Hello',
                            excludeOrgs: 'o-111,o-222'
                        };

                        SettingsService.getReadOnly.and.callFake(function() {
                            if (counter) {
                                return savedParams;
                            } else {
                                counter++;
                                return null;
                            }
                        });
                    });

                    describe('when user only has access to their own org', function() {
                        beforeEach(function() {
                            campaigns.cParent.orgs = [{ id: 'o-123' }];
                        });

                        it('should register the params object with the SettingsService and pass a default excludeOrgs value of null', function() {
                            defaults.excludeOrgs = null;

                            campaigns.beforeModel();

                            expect(SettingsService.register).toHaveBeenCalledWith('Selfie::params', campaigns.params, {
                                defaults: defaults,
                                sync: jasmine.any(Function),
                                localSync: user.id,
                                validateLocal: jasmine.any(Function)
                            });
                        });

                        it('should add the saved params to the State', function() {
                            campaigns.beforeModel();

                            expect(campaigns.filter).toBe('pending,active');
                            expect(campaigns.filterBy).toBe('budget');
                            expect(campaigns.sort).toBe('name,1');
                            expect(campaigns.search).toBe('Hello');
                            expect(campaigns.excludeOrgs).toBe('o-111,o-222');
                        });

                        it('should add the params to the queryParams object', function() {
                            campaigns.beforeModel();

                            expect(campaigns.queryParams).toEqual(jasmine.objectContaining({
                                filter: '=',
                                filterBy: '=',
                                sort: '=',
                                search: '=',
                                excludeOrgs: '='
                            }));
                        });

                        describe('when user has excludeOrgs saved', function() {
                            beforeEach(function() {
                                user.config.platform = {
                                    excludeOrgs: ['o-111','o-222']
                                };
                            });

                            it('should register the params object with the SettingsService and pass a default excludeOrgs value of null', function() {
                                defaults.excludeOrgs = null;

                                campaigns.beforeModel();

                                expect(SettingsService.register).toHaveBeenCalledWith('Selfie::params', campaigns.params, {
                                    defaults: defaults,
                                    sync: jasmine.any(Function),
                                    localSync: user.id,
                                    validateLocal: jasmine.any(Function)
                                });
                            });

                            describe('sync()', function() {
                                it('should remove all saved orgs', function() {
                                    campaigns.beforeModel();

                                    var sync = SettingsService.register.calls.mostRecent().args[2].sync;
                                    sync(savedParams);

                                    expect(user.save).toHaveBeenCalled();
                                    expect(user.config.platform.excludeOrgs).toEqual([]);
                                });
                            });

                            describe('validateLocal()', function() {
                                it('should be true if ids match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal(user.id, user.id)).toBe(true);
                                });

                                it('should be false if ids do not match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal('u-999', user.id)).toBe(false);
                                });
                            });
                        });

                        describe('when user does not have excludeOrgs saved', function() {
                            beforeEach(function() {
                                delete user.config.platform;
                            });

                            it('should register the params object with the SettingsService and pass a default excludeOrgs value of null', function() {
                                defaults.excludeOrgs = null;

                                campaigns.beforeModel();

                                expect(SettingsService.register).toHaveBeenCalledWith('Selfie::params', campaigns.params, {
                                    defaults: defaults,
                                    sync: jasmine.any(Function),
                                    localSync: user.id,
                                    validateLocal: jasmine.any(Function)
                                });
                            });

                            describe('sync()', function() {
                                it('should set the excludedOrgs config to an empty array', function() {
                                    campaigns.beforeModel();

                                    var sync = SettingsService.register.calls.mostRecent().args[2].sync;
                                    sync(savedParams);

                                    expect(user.save).toHaveBeenCalled();
                                    expect(user.config.platform.excludeOrgs).toEqual([]);
                                });
                            });

                            describe('validateLocal()', function() {
                                it('should be true if ids match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal(user.id, user.id)).toBe(true);
                                });

                                it('should be false if ids do not match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal('u-999', user.id)).toBe(false);
                                });
                            });
                        });
                    });

                    describe('when user has access to multiple orgs', function() {
                        beforeEach(function() {
                            campaigns.cParent.orgs = [{ id: 'o-123' }, { id: 'o-999'}];
                        });

                        it('should add the saved params to the State', function() {
                            campaigns.beforeModel();

                            expect(campaigns.filter).toBe('pending,active');
                            expect(campaigns.filterBy).toBe('budget');
                            expect(campaigns.sort).toBe('name,1');
                            expect(campaigns.search).toBe('Hello');
                            expect(campaigns.excludeOrgs).toBe('o-111,o-222');
                        });

                        it('should add the params to the queryParams object', function() {
                            campaigns.beforeModel();

                            expect(campaigns.queryParams).toEqual(jasmine.objectContaining({
                                filter: '=',
                                filterBy: '=',
                                sort: '=',
                                search: '=',
                                excludeOrgs: '='
                            }));
                        });

                        describe('when user has excludeOrgs saved', function() {
                            beforeEach(function() {
                                user.config.platform = {
                                    excludeOrgs: ['o-111','o-222']
                                };
                            });

                            it('should register the params object with the SettingsService and include the excludeOrgs string value', function() {
                                defaults.excludeOrgs = 'o-111,o-222';

                                campaigns.beforeModel();

                                expect(SettingsService.register).toHaveBeenCalledWith('Selfie::params', campaigns.params, {
                                    defaults: defaults,
                                    sync: jasmine.any(Function),
                                    localSync: user.id,
                                    validateLocal: jasmine.any(Function)
                                });
                            });

                            describe('sync()', function() {
                                describe('when the excludeOrgs have not changed', function() {
                                    it('should not save the user or change the excludedOrgs config', function() {
                                        campaigns.beforeModel();

                                        var sync = SettingsService.register.calls.mostRecent().args[2].sync;

                                        savedParams.excludeOrgs = 'o-111,o-222';

                                        sync(savedParams);

                                        expect(user.save).not.toHaveBeenCalled();
                                        expect(user.config.platform.excludeOrgs).toEqual(['o-111','o-222']);
                                    });
                                });

                                describe('when the excludeOrgs have changed', function() {
                                    it('should update the exlcudeorgs and save the user', function() {
                                        campaigns.beforeModel();

                                        var sync = SettingsService.register.calls.mostRecent().args[2].sync;

                                        savedParams.excludeOrgs = 'o-xxx,o-yyy';

                                        sync(savedParams);

                                        expect(user.save).toHaveBeenCalled();
                                        expect(user.config.platform.excludeOrgs).toEqual(['o-xxx','o-yyy']);
                                    });
                                });
                            });

                            describe('validateLocal()', function() {
                                it('should be true if ids match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal(user.id, user.id)).toBe(true);
                                });

                                it('should be false if ids do not match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal('u-999', user.id)).toBe(false);
                                });
                            });
                        });

                        describe('when user does not have excludeOrgs saved', function() {
                            beforeEach(function() {
                                delete user.config.platform;
                            });

                            it('should register the params object with the SettingsService and pass a default excludeOrgs value of null', function() {
                                defaults.excludeOrgs = null;

                                campaigns.beforeModel();

                                expect(SettingsService.register).toHaveBeenCalledWith('Selfie::params', campaigns.params, {
                                    defaults: defaults,
                                    sync: jasmine.any(Function),
                                    localSync: user.id,
                                    validateLocal: jasmine.any(Function)
                                });
                            });

                            describe('sync()', function() {
                                describe('when the user does not have the exclusionOrgs config defined and no excludeOrgs are selected', function() {
                                    it('should initialize the user excludeOrgs to empty array and save the user', function() {
                                        campaigns.beforeModel();

                                        var sync = SettingsService.register.calls.mostRecent().args[2].sync;

                                        savedParams.excludeOrgs = null;

                                        sync(savedParams);

                                        expect(user.save).toHaveBeenCalled();
                                        expect(user.config.platform.excludeOrgs).toEqual([]);
                                    });
                                });

                                describe('when the user does not have the exclusionOrgs config defained and no excludeOrgs are selected', function() {
                                    it('should not change the excludeOrgs config or save the user', function() {
                                        user.config.platform = {
                                            excludeOrgs: []
                                        };

                                        campaigns.beforeModel();

                                        var sync = SettingsService.register.calls.mostRecent().args[2].sync;

                                        savedParams.excludeOrgs = null;

                                        sync(savedParams);

                                        expect(user.save).not.toHaveBeenCalled();
                                        expect(user.config.platform.excludeOrgs).toEqual([]);
                                    });
                                });

                                describe('when the excludeOrgs have changed', function() {
                                    it('should not save the user or change the excludedOrgs config', function() {
                                        campaigns.beforeModel();

                                        var sync = SettingsService.register.calls.mostRecent().args[2].sync;

                                        savedParams.excludeOrgs = 'o-111,o-222';

                                        sync(savedParams);

                                        expect(user.save).toHaveBeenCalled();
                                        expect(user.config.platform.excludeOrgs).toEqual(['o-111','o-222']);
                                    });
                                });
                            });

                            describe('validateLocal()', function() {
                                it('should be true if ids match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal(user.id, user.id)).toBe(true);
                                });

                                it('should be false if ids do not match', function() {
                                    campaigns.beforeModel();

                                    var validateLocal = SettingsService.register.calls.mostRecent().args[2].validateLocal;
                                    expect(validateLocal('u-999', user.id)).toBe(false);
                                });
                            });
                        });
                    });
                });
            });

            describe('model()', function() {
                var result, success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    campaigns.filter = 'error,draft,pending,active,paused,canceled,completed,outOfBudget,expired';
                    campaigns.sort = 'lastUpdated,-1';
                    campaigns.search = null;
                    campaigns.excludeOrgs = 'o-111,o-222';

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
                        statuses: 'error,draft,pending,active,paused,canceled,completed,outOfBudget,expired',
                        text: null,
                        excludeOrgs: 'o-111,o-222'
                    }, campaigns.limit, campaigns.page);
                });

                describe('when the page has a pending=true query param', function() {
                    it('should query for campaigns with pending updates', function() {
                        paginatedDbList.calls.reset();

                        spyOn($location, 'search').and.returnValue({pending: true});

                        campaigns.model().then(success, failure);

                        expect(paginatedDbList).toHaveBeenCalledWith('selfieCampaign', {
                            sort: 'lastUpdated,-1',
                            application: 'selfie',
                            statuses: 'error,draft,pending,active,paused,canceled,completed,outOfBudget,expired',
                            text: null,
                            excludeOrgs: 'o-111,o-222',
                            pendingUpdate: true
                        }, campaigns.limit, campaigns.page);
                    });
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
                var selfieState;

                beforeEach(function() {
                    selfieState = c6State.get('Selfie');
                    selfieState.cModel = {
                        entitlements: {}
                    };
                });

                it('should add the isAdmin flag to the state', function() {
                    campaigns.afterModel();
                    expect(campaigns.isAdmin).toBe(false);

                    selfieState.cModel.entitlements.adminCampaigns = true;

                    campaigns.afterModel();
                    expect(campaigns.isAdmin).toBe(true);
                });

                it('should pass the hasCampaigns flag from the cParent state', function() {
                    campaigns.cParent.hasCampaigns = false;

                    campaigns.afterModel();

                    expect(campaigns.hasCampaigns).toBe(false);

                    campaigns.cParent.hasCampaigns = true;

                    campaigns.afterModel();

                    expect(campaigns.hasCampaigns).toBe(true);
                });
            });
        });
    });
});
