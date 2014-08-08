define (['app'], function(appModule) {
    'use strict';

    describe('MiniReel state', function() {
        var c6State,
            SettingsService,
            minireel,
            apps;

        var minireelExp,
            user;

        beforeEach(function() {
            user = {
                id: 'u-5dd4066eb1c277',
                name: 'team member',
                org: {
                    config: {
                        minireelinator: {}
                    },
                    save: jasmine.createSpy('org.save()')
                },
                config: {
                    minireelinator: {}
                },
                save: jasmine.createSpy('user.save()')
            };

            minireelExp = {};

            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
            });

            minireel = c6State.get('MiniReel');
            apps = c6State.get('Apps');
            apps.cModel = [minireelExp];
            c6State.get('Portal').cModel = user;
        });

        it('should exist', function() {
            expect(minireel).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = minireel.model();
            });

            it('should be the MiniReel experience', function() {
                expect(result).toBe(minireelExp);
            });
        });

        describe('afterModel()', function() {
            beforeEach(function() {
                spyOn(SettingsService, 'register').and.callThrough();
                minireel.afterModel();
            });

            it('should register org settings with the settings service', function() {
                expect(SettingsService.register).toHaveBeenCalledWith('MR::org', user.org.config.minireelinator, jasmine.objectContaining({
                    localSync: false,
                    defaults: {
                        embedTypes: ['script'],
                        minireelDefaults: {
                            mode: 'light',
                            autoplay: true,
                            splash: {
                                ratio: '3-2',
                                theme: 'img-text-overlay'
                            }
                        },
                        embedDefaults: {
                            size: null
                        }
                    }
                }));
            });

            it('should register user settings with the settings service', function() {
                expect(SettingsService.register).toHaveBeenCalledWith('MR::user', user.config.minireelinator, jasmine.objectContaining({
                    defaults: {
                        minireelDefaults: {
                            splash: {
                                ratio: SettingsService.getReadOnly('MR::org').minireelDefaults.splash.ratio,
                                theme: SettingsService.getReadOnly('MR::org').minireelDefaults.splash.theme
                            }
                        }
                    },
                    sync: jasmine.any(Function),
                    validateLocal: jasmine.any(Function),
                    localSync: user.id
                }));
            });

            describe('user settings localStore validation', function() {
                var validateLocal;

                beforeEach(function() {
                    validateLocal = SettingsService.register.calls.all().reduce(function(result, next) {
                        return next.args[0] === 'MR::user' ? next.args[2].validateLocal : result;
                    }, null);
                });

                it('should be true if both arguments are the same', function() {
                    expect(validateLocal('a', 'b')).toBe(false);
                    expect(validateLocal('a', 'a')).toBe(true);
                });
            });

            describe('user settings sync', function() {
                var settings;

                beforeEach(function() {
                    var sync = SettingsService.register.calls.all().reduce(function(result, next) {
                        return next.args[0] === 'MR::user' ? next.args[2].sync : result;
                    }, null);

                    settings = {
                        defaultSplash: {}
                    };

                    sync(settings);
                });

                it('should update the config on the user', function() {
                    expect(user.config.minireelinator).toBe(settings);
                });

                it('should save the user', function() {
                    expect(user.save).toHaveBeenCalled();
                });
            });

            describe('if there is no user minireelinator config', function() {
                beforeEach(function() {
                    delete user.config.minireelinator;
                    minireel.afterModel();
                });

                it('should create a minireelinator config', function() {
                    expect(user.config.minireelinator).toEqual(jasmine.any(Object));
                });
            });

            describe('if there is no org minireelinator config', function() {
                beforeEach(function() {
                    delete user.org.config.minireelinator;
                    minireel.afterModel();
                });

                it('should create a minireelinator config', function() {
                    expect(user.org.config.minireelinator).toEqual(jasmine.any(Object));
                });
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                minireel.enter();
            });

            it('should go to the manager state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager', null, null, true);
            });
        });
    });
});
