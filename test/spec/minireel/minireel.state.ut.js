define (['app'], function(appModule) {
    'use strict';

    describe('MiniReel state', function() {
        var c6State,
            SettingsService,
            scopePromise,
            $q,
            cinema6,
            $rootScope,
            portal,
            minireel,
            apps;

        var minireelExp,
            user;

        beforeEach(function() {
            user = {
                id: 'u-5dd4066eb1c277',
                name: 'team member',
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

            minireelExp = {};

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                scopePromise = $injector.get('scopePromise');
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
            });

            portal = c6State.get('Portal');
            minireel = c6State.get('MiniReel');
            apps = c6State.get('Apps');
            apps.cModel = {
                'mini-reel-maker': minireelExp
            };
            portal.cModel = user;
        });

        it('should exist', function() {
            expect(minireel).toEqual(jasmine.any(Object));
        });

        describe('getMiniReelList(filter, limit, page, previous)', function() {
            var result,
                deferred, promise,
                ScopedPromise;

            beforeEach(function() {
                ScopedPromise = scopePromise($q.defer().promise).constructor;
                deferred = $q.defer();
                promise = deferred.promise;

                spyOn(cinema6.db, 'findAll')
                    .and.returnValue(promise);
            });

            ['active', 'pending', 'all'].forEach(function(status) {
                describe('when called with ' + status, function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            result = minireel.getMiniReelList(status, 7, 1);
                        });
                    });

                    it('should return a scoped promise', function() {
                        expect(result.promise).toBe(promise);
                        expect(result).toEqual(jasmine.any(ScopedPromise));
                    });

                    it('should decorate the scoped promise with a null "selected" property', function() {
                        expect(result.selected).toBeNull();
                    });

                    it('should decorate the scoped promise with a null "page" property', function() {
                        expect(result.page).toBeNull();
                    });

                    describe('when the promise is resolved', function() {
                        var value;

                        beforeEach(function() {
                            value = [{}, {}, {}, {}, {}, {}, {}];
                            value.meta = {
                                items: {
                                    start: 22,
                                    end: 28,
                                    total: 500
                                }
                            };

                            $rootScope.$apply(function() {
                                deferred.resolve(value);
                            });
                        });

                        it('should set selected to an array equal to the result, but filled with false', function() {
                            expect(result.selected).toEqual(value.map(function() { return false; }));
                        });

                        it('should set page as the page info', function() {
                            expect(result.page).toEqual({
                                current: 4,
                                total: 72
                            });
                        });
                    });

                    describe('if there are no results', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                var value = [];
                                value.meta = {
                                    items: {
                                        start: 0,
                                        end: 0,
                                        total: 0
                                    }
                                };

                                deferred.resolve(value);
                            });
                        });

                        it('should be on the first page', function() {
                            expect(result.page).toEqual({
                                current: 1,
                                total: 1
                            });
                        });
                    });

                    describe('when called with an initial value', function() {
                        var previous;

                        beforeEach(function() {
                            previous = minireel.getMiniReelList(status, 50, 1);
                            previous.value = [{}, {}, {}];
                            previous.selected = [false, false, true];
                            previous.page = {
                                current: 1,
                                total: 10
                            };

                            $rootScope.$apply(function() {
                                result = minireel.getMiniReelList(status, 50, 1, previous);
                            });
                        });

                        it('should set the initial value on the scoped promise', function() {
                            expect(result.value).toBe(previous.value);
                        });

                        it('should set the selected property', function() {
                            expect(result.selected).toBe(previous.selected);
                        });

                        it('should set the page value', function() {
                            expect(result.page).toBe(previous.page);
                        });
                    });
                });
            });

            describe('when called with "all"', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        result = minireel.getMiniReelList('all', 50, 1);
                    });
                });

                it('should find experiences of all statuses', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                        type: 'minireel',
                        sponsored: false,
                        org: portal.cModel.org.id,
                        sort: 'lastUpdated,-1',
                        status: null,
                        limit: 50,
                        skip: 0
                    });
                });
            });

            ['active', 'pending'].forEach(function(status) {
                describe('when called with ' + status, function() {
                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            result = minireel.getMiniReelList(status, 25, 3);
                        });
                    });

                    it('should find experiences with the specified status', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                            type: 'minireel',
                            sponsored: false,
                            org: portal.cModel.org.id,
                            sort: 'lastUpdated,-1',
                            status: status,
                            limit: 25,
                            skip: 50
                        });
                    });
                });
            });
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
