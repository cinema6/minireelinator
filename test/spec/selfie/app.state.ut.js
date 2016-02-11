define(['app','c6_defines'], function(appModule, c6Defines) {
    'use strict';

    describe('Selfie:App State', function() {
        var $rootScope,
            $q,
            c6State,
            SettingsService,
            CampaignService,
            selfie,
            selfieApps,
            selfieApp;

        var selfieExperience,
            user,
            intercom;

        beforeEach(function() {
            selfieExperience = {};

            user = {
                id: 'u-5dd4066eb1c277',
                email: 'selfie@reelcontent.com',
                firstName: 'Sammy',
                lastName: 'Selfie',
                created: '2015-06-26T00:00:00.000Z',
                org: {
                    id: 'o-0e8ad18c6c1086',
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

            c6Defines.kIntercomId = '123xyz';

            intercom = jasmine.createSpy('intercom');

            module(appModule.name, ['$provide', function($provide) {
                $provide.value('intercom', intercom);
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
                CampaignService = $injector.get('CampaignService');
            });

            selfie = c6State.get('Selfie');
            selfieApps = c6State.get('Selfie:Apps');
            selfieApp = c6State.get('Selfie:App');

            selfie.cModel = user;
            selfieApps.cModel = {
                selfie: selfieExperience
            };
        });

        it('should exist', function() {
            expect(selfieApp).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = selfieApp.model();
            });

            it('should be the MiniReel experience', function() {
                expect(result).toBe(selfieExperience);
            });
        });

        describe('afterModel()', function() {
            var campaignsDeferred;

            beforeEach(function() {
                campaignsDeferred = $q.defer();
                spyOn(SettingsService, 'register').and.callThrough();
                spyOn(CampaignService, 'hasCampaigns').and.returnValue(campaignsDeferred.promise);
                selfieApp.afterModel();
            });

            it('should "boot" intercom with user settings', function() {
                expect(intercom).toHaveBeenCalledWith('boot', {
                    app_id: c6Defines.kIntercomId,
                    email: user.email,
                    name: user.firstName + ' ' + user.lastName,
                    created_at: user.created
                });
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
                    selfieApp.afterModel();
                });

                it('should create a minireelinator config', function() {
                    expect(user.config.minireelinator).toEqual(jasmine.any(Object));
                });
            });

            describe('if there is no org minireelinator config', function() {
                beforeEach(function() {
                    delete user.org.config.minireelinator;
                    selfieApp.afterModel();
                });

                it('should create a minireelinator config', function() {
                    expect(user.org.config.minireelinator).toEqual(jasmine.any(Object));
                });
            });

            it('should check for campaigns', function() {
                expect(CampaignService.hasCampaigns).toHaveBeenCalled();
            });

            it('should add the hasCampaigns flag to the state', function() {
                $rootScope.$apply(function() {
                    campaignsDeferred.resolve(true);
                });

                expect(selfieApp.hasCampaigns).toBe(true);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');
            });

            describe('if the user has campaigns', function() {
                it('should go to the dashboard', function() {
                    $rootScope.$apply(function() {
                        selfieApp.hasCampaigns = true;
                        selfieApp.enter();
                    });
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:CampaignDashboard', null, null, true);
                });
            });

            describe('if the user does not have campaigns', function() {
                it('should go to New Campaign page', function() {
                    $rootScope.$apply(function() {
                        selfieApp.hasCampaigns = false;
                        selfieApp.enter();
                    });
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:NewCampaign', null, {}, true);
                });
            });
        });
    });
});