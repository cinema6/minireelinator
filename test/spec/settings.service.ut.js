define( ['app', 'angular'], function(appModule, angular) {
    'use strict';

    var extend = angular.extend,
        copy = angular.copy;

    describe('SettingsService', function() {
        var SettingsServiceProvider;

        var SettingsService,
            c6LocalStorage,
            $rootScope,
            $timeout;

        beforeEach(function() {
            module(appModule.name, function($injector) {
                SettingsServiceProvider = $injector.get('SettingsServiceProvider');
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                SettingsService = $injector.get('SettingsService');
                c6LocalStorage = $injector.get('c6LocalStorage');
                $timeout = $injector.get('$timeout');
            });

            c6LocalStorage.removeAll();
        });

        afterAll(function() {
            SettingsServiceProvider = null;
            SettingsService = null;
            c6LocalStorage = null;
            $rootScope = null;
            $timeout = null;
        });

        it('should exist', function() {
            expect(SettingsService).toEqual(jasmine.any(Object));
        });

        describe('service', function() {
            describe('methods', function() {
                describe('createBinding(object, prop, binding)', function() {
                    var orgSettings, userSettings,
                        model;

                    beforeEach(function() {
                        model = {};

                        orgSettings = {
                            foo: {
                                bar: {
                                    version: 1
                                }
                            }
                        };
                        userSettings = {
                            name: 'cinema6'
                        };

                        SettingsService
                            .register('org', orgSettings)
                            .register('user', userSettings);

                        SettingsService
                            .createBinding(model, 'version', 'org.foo.bar.version')
                            .createBinding(model, 'name', 'user.name');
                    });

                    it('should create proxies which return the value of the binding', function() {
                        expect(model.version).toBe(orgSettings.foo.bar.version);
                        orgSettings.foo.bar.version = 2;
                        expect(model.version).toBe(orgSettings.foo.bar.version);

                        expect(model.name).toBe(userSettings.name);
                        userSettings.name = 'josh';
                        expect(model.name).toBe(userSettings.name);
                    });

                    it('should create proxies that set the values of the underlying settings', function() {
                        model.version = 2;
                        expect(orgSettings.foo.bar.version).toBe(2);

                        model.name = 'josh';
                        expect(userSettings.name).toBe('josh');
                    });
                });

                describe('getReadyOnly(id)', function() {
                    var account,
                        accountSettings, accountSettingsCopy;

                    beforeEach(function() {
                        accountSettings = {
                            sub: {
                                enabled: true
                            },
                            name: 'cinema6'
                        };
                        accountSettingsCopy = copy(accountSettings);

                        SettingsService.register('account', accountSettings);

                        account = SettingsService.getReadOnly('account');
                    });

                    it('should return a copy of the settings that are immutable', function() {
                        expect(account).toEqual(accountSettingsCopy);
                        expect(account).not.toBe(accountSettings);
                        expect(Object.isFrozen(account)).toBe(true);
                        expect(Object.isFrozen(account.sub)).toBe(true);
                    });
                });

                describe('get(id)', function() {
                    var org,
                        orgSettings;

                    beforeEach(function() {
                        orgSettings = {};

                        SettingsService.register('org', orgSettings);
                        org = SettingsService.get('org');
                    });

                    it('should return the settings', function() {
                        expect(org).toBe(orgSettings);
                    });
                });

                describe('register(id, object, config)', function() {
                    var result, userSettings,
                        localUserSettings,
                        syncSpy;

                    beforeEach(function() {
                        localUserSettings = {
                            foo: true,
                            name: 'cinema6'
                        };
                        c6LocalStorage.set('SettingsService::user', {
                            meta: null,
                            settings: localUserSettings
                        });

                        spyOn(c6LocalStorage, 'set').and.callThrough();
                        spyOn(c6LocalStorage, 'get').and.callThrough();
                        syncSpy = jasmine.createSpy('sync()');
                        userSettings = {};

                        $rootScope.$apply(function() {
                            result = SettingsService.register('user', userSettings, {
                                sync: syncSpy
                            });
                        });
                    });

                    it('should be chainable', function() {
                        expect(result).toBe(SettingsService);
                    });

                    it('should fetch the latest settings from localStorage', function() {
                        expect(userSettings).toEqual(localUserSettings);
                    });

                    it('should put the settings into localstorage', function() {
                        expect(c6LocalStorage.set).toHaveBeenCalledWith('SettingsService::user', {
                            meta: null,
                            settings: userSettings
                        });
                    });

                    it('should sync the settings to localStorage every time they change', function() {
                        c6LocalStorage.set.calls.reset();
                        $rootScope.$apply(function() {
                            userSettings.name = 'josh';
                        });
                        expect(c6LocalStorage.set).toHaveBeenCalledWith('SettingsService::user', {
                            meta: null,
                            settings: userSettings
                        });
                    });

                    it('should sync the settings permanently save the changes within 30 seconds of a change', function() {
                        expect(function() {
                            $timeout.flush();
                        }).toThrow();
                        $rootScope.$apply(function() {
                            userSettings.age = 23;
                        });
                        $timeout.flush();

                        expect(syncSpy).toHaveBeenCalledWith(userSettings);
                    });

                    describe('if defaults are provided', function() {
                        beforeEach(function() {
                            result = SettingsService.register('user', userSettings, {
                                defaults: {
                                    enabled: true,
                                    deleted: false
                                }
                            });
                        });

                        it('should extend the object with the defaults', function() {
                            expect(userSettings).toEqual(extend(localUserSettings, {
                                enabled: true,
                                deleted: false
                            }));
                        });
                    });

                    describe('if localSync is a value', function() {
                        var orgSettings;

                        beforeEach(function() {
                            orgSettings = {};
                            c6LocalStorage.set.calls.reset();

                            $rootScope.$apply(function() {
                                result = SettingsService.register('org', orgSettings, {
                                    sync: ['stub', syncSpy],
                                    localSync: 'u-e43ef4886e1681'
                                });
                            });
                        });

                        it('should set the value as the localStorage meta data', function() {
                            expect(c6LocalStorage.set).toHaveBeenCalledWith('SettingsService::org', {
                                meta: 'u-e43ef4886e1681',
                                settings: orgSettings
                            });
                        });
                    });

                    describe('if a validateLocal function is provided', function() {
                        var previousMeta, previousSettings,
                            currentMeta, currentSettings,
                            validateLocal;

                        beforeEach(function() {
                            previousMeta = 'u-e43ef4886e1681';
                            previousSettings = {};
                            currentMeta = 'u-86dc5dcfa662f4';
                            currentSettings = {
                                name: 'test'
                            };

                            validateLocal = jasmine.createSpy('validateLocal()')
                                .and.returnValue(false);

                            c6LocalStorage.set('SettingsService::org', {
                                meta: previousMeta,
                                settings: previousSettings
                            });

                            $rootScope.$apply(function() {
                                result = SettingsService.register('org', currentSettings, {
                                    sync: ['stub', syncSpy],
                                    localSync: currentMeta,
                                    validateLocal: validateLocal
                                });
                            });
                        });

                        it('should call the validateLocal() function with the currentMeta and previous meta', function() {
                            expect(validateLocal).toHaveBeenCalledWith(currentMeta, previousMeta);
                        });

                        it('should not update from localstorage if validateLocal returns false', function() {
                            expect(currentSettings).not.toEqual(previousSettings);
                        });
                    });

                    describe('if localSync is false', function() {
                        var orgSettings;

                        beforeEach(function() {
                            orgSettings = {};
                            c6LocalStorage.set.calls.reset();
                            c6LocalStorage.get.calls.reset();

                            $rootScope.$apply(function() {
                                result = SettingsService.register('org', orgSettings, {
                                    sync: ['stub', syncSpy],
                                    localSync: false
                                });
                            });
                        });

                        it('should not save anything to localStorage', function() {
                            expect(c6LocalStorage.set).not.toHaveBeenCalled();
                        });

                        it('should not get anything from localStorage', function() {
                            expect(c6LocalStorage.get).not.toHaveBeenCalled();
                        });

                        it('should not save anything to localStorage when the object changes', function() {
                            $rootScope.$apply(function() {
                                orgSettings.enabled = true;
                            });

                            expect(c6LocalStorage.set).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
});
