(function() {
    'use strict';

    define(['app','c6_defines'], function(appModule, c6Defines) {
        describe('PreviewController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6UrlMaker,
                PreviewController,
                MiniReelService,
                c6EventEmitter,
                c6BrowserInfo,
                c6State, portal,
                postMessage;

            var responseCallback,
                experience,
                session,
                playerMeta;

            beforeEach(function() {
                c6BrowserInfo = {
                    profile: {
                        flash: true,
                        autoplay: true,
                        device: 'desktop'
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.value('c6BrowserInfo',c6BrowserInfo);

                    $provide.decorator('c6UrlMaker', function($delegate) {
                        return jasmine.createSpy('c6UrlMaker()')
                            .and.callFake($delegate);
                    });
                });

                module(appModule.name, function($provide) {
                    $provide.value('playerMeta', {});
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    MiniReelService = $injector.get('MiniReelService');
                    postMessage = $injector.get('postMessage');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                    playerMeta = $injector.get('playerMeta');
                    c6State = $injector.get('c6State');
                    portal = c6State.get('Portal');
                    portal.cModel = {};

                    $scope = $rootScope.$new();

                    PreviewController = $controller('PreviewController', { $scope: $scope });
                });

                experience = {
                    id: 'foo',
                    data: {
                        mode: 'light',
                        autoplay: false,
                        deck: [
                            {
                                id: '1',
                                type: 'video',
                                data: {}
                            },
                            {
                                id: '2',
                                type: 'ad',
                                data: {}
                            },
                            {
                                id: '3',
                                type: 'video',
                                data: {}
                            }
                        ]
                    }
                };

                session = {
                    ping: jasmine.createSpy('session.ping()')
                };

                c6EventEmitter(session);

                spyOn(session, 'on').and.callThrough();

                responseCallback = jasmine.createSpy('responseCallback()');
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(PreviewController).toEqual(jasmine.any(Object));
                });

                it('should set the default mode to desktop', function() {
                    expect(PreviewController.device).toBe('desktop');
                });
            });

            describe('properties', function() {
                function controller() {
                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        PreviewController = $controller('PreviewController', { $scope: $scope });
                    });

                    return PreviewController;
                }

                describe('active', function() {
                    it('should be false', function() {
                        expect(PreviewController.active).toBe(false);
                    });
                });

                describe('playerSrc', function() {
                    describe('when developing locally', function() {
                        beforeEach(function() {
                            c6Defines.kDebug = true;
                            c6Defines.kEnv = 'dev';
                            c6Defines.kLocal = true;
                        });

                        it('should be "/apps/rumble/app/index.html?kCollateralUrl=/collateral&kDebug=true&kDevMode=true"', function() {
                            expect(PreviewController.playerSrc).toBe('/apps/rumble/app/index.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&kDebug=true&kDevMode=true&autoplay=false&kDevice=desktop&kMode=full&kEnvUrlRoot=');
                        });
                    });

                    ['staging', 'production'].forEach(function(env) {
                        describe('when in ' + env, function() {
                            beforeEach(function() {
                                c6Defines.kEnv = env;
                                c6Defines.kLocal = false;
                                c6Defines.kCollateralUrl = '/collateral';

                                spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                                $scope.$emit('mrPreview:initExperience', experience, session);
                            });

                            it('should load in the correct page based on the mode', function() {
                                experience.data.mode = 'full';
                                expect(PreviewController.playerSrc).toBe('/apps/rumble/full.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=full&kEnvUrlRoot=');

                                experience.data.mode = 'lightbox';
                                $scope.$emit('mrPreview:updateExperience', experience);
                                expect(PreviewController.playerSrc).toBe('/apps/rumble/lightbox.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=lightbox&kEnvUrlRoot=');

                                PreviewController.device = 'phone';
                                $scope.$emit('mrPreview:updateExperience', experience);
                                expect(PreviewController.playerSrc).toBe('/apps/rumble/mobile.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=phone&kMode=mobile&kEnvUrlRoot=');
                            });
                        });
                    });

                    describe('in staging', function() {
                        beforeEach(function() {
                            c6Defines.kDebug = true;
                            c6Defines.kEnv = 'staging';
                            c6Defines.kLocal = false;
                            c6Defines.kCollateralUrl = '/collateral';

                            c6UrlMaker.and.callFake(function(url, base) {
                                if (base !== 'app') {
                                    throw new Error('Must use app base');
                                }

                                return '/apps/' + url;
                            });
                        });

                        it('should be "/apps/rumble?kCollateralUrl=/collateral"', function() {
                            expect(controller().playerSrc).toBe('/apps/rumble/full.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=full&kEnvUrlRoot=');
                        });

                        it('should pass the current mode and device', function() {
                            spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                            $scope.$emit('mrPreview:initExperience', experience, session);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/light.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=light&kEnvUrlRoot=');

                            experience.data.mode = 'lightbox';
                            $scope.$apply(function() {
                                PreviewController.device = 'phone';
                            });
                            $scope.$emit('mrPreview:updateExperience', experience);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/mobile.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=phone&kMode=mobile&kEnvUrlRoot=');
                        });
                    });

                    describe('in production', function() {
                        beforeEach(function() {
                            c6Defines.kDebug = false;
                            c6Defines.kEnv = 'production';
                            c6Defines.kLocal = false;
                            c6Defines.kCollateralUrl = '/collateral';

                            c6UrlMaker.and.callFake(function(url, base) {
                                if (base !== 'app') {
                                    throw new Error('Must use app base');
                                }

                                return '/apps/' + url;
                            });
                        });

                        it('should be "/apps/rumble?kCollateralUrl=/collateral"', function() {
                            expect(controller().playerSrc).toBe('/apps/rumble/full.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=full&kEnvUrlRoot=');
                        });

                        it('should pass the current mode and device', function() {
                            spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                            $scope.$emit('mrPreview:initExperience', experience, session);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/light.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=light&kEnvUrlRoot=');

                            experience.data.mode = 'lightbox';
                            $scope.$apply(function() {
                                PreviewController.device = 'phone';
                            });
                            $scope.$emit('mrPreview:updateExperience', experience);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/mobile.html?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=phone&kMode=mobile&kEnvUrlRoot=');
                        });
                    });
                });
                
                describe('fullscreen', function() {
                    it('should default to false', function() {
                        expect(PreviewController.fullscreen).toBe(false);
                    });
                    it('should do stuff', function() {
                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        $scope.$emit('mrPreview:initExperience', experience, session);

                        session.emit('fullscreenMode', true);

                        expect(PreviewController.fullscreen).toBe(true);

                        session.emit('fullscreenMode', false);

                        expect(PreviewController.fullscreen).toBe(false);
                    });
                });
            });

            describe('session events', function() {
                beforeEach(function() {
                    $scope.$emit('mrPreview:initExperience', experience, session);
                });

                describe('open', function() {
                    beforeEach(function() {
                        PreviewController.active = false;
                        session.emit('open');
                    });

                    it('should set active to true', function() {
                        expect(PreviewController.active).toBe(true);
                    });
                });

                describe('close', function() {
                    beforeEach(function() {
                        PreviewController.active = true;
                    });

                    it('should set active to false', function() {
                        spyOn($scope, '$emit');
                        session.emit('close');

                        expect(PreviewController.active).toBe(false);
                        expect($scope.$emit).not.toHaveBeenCalledWith('mrPreview:closePreview');
                    });

                    it('should emit mrPreview:closePreview if previewing a card', function() {
                        spyOn(MiniReelService, 'convertCard').and.returnValue(experience.data.deck[0]);
                        $scope.$emit('mrPreview:updateExperience', experience, {});
                        spyOn($scope, '$emit');

                        session.emit('close');

                        expect($scope.$emit).toHaveBeenCalledWith('mrPreview:closePreview');
                    });
                });
            });

            describe('$scope listeners', function() {
                describe('mrPreview:splashClick', function() {
                    beforeEach(function() {
                        $scope.$emit('mrPreview:splashClick');
                        expect(PreviewController.active).toBe(false);

                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        $scope.$emit('mrPreview:initExperience', experience, session);
                        $scope.$emit('mrPreview:splashClick');
                    });

                    it('should set "active" to true', function() {
                        expect(PreviewController.active).toBe(true);
                    });
                });

                describe('mrPreview:initExperience', function() {
                    var dataSentToPlayer;

                    beforeEach(function() {
                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        $scope.$emit('mrPreview:initExperience', experience, session);
                    });

                    it('should convert the experience and add it to the session', function() {
                        expect(MiniReelService.convertForPlayer).toHaveBeenCalled();
                        expect(session.experience).toEqual(experience);
                    });

                    it('should register five session listeners', function() {
                        expect(session.on).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Function));
                        expect(session.on.calls.count()).toBe(5);
                    });

                    describe('handshake request', function() {
                        it('should respond with appData for the player', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer).toEqual({
                                success: true,
                                appData: {
                                    experience: experience,
                                    profile: c6BrowserInfo.profile,
                                    version: 1
                                }
                            });
                        });
                    });

                    describe('mrPreview:getCard request', function() {
                        it('should return undefined until a specific card has been selected', function() {
                            session.emit('mrPreview:getCard', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer).toBe(undefined);
                        });
                    });
                });

                describe('mrPreview:updateExperience', function() {
                    var newCard;

                    beforeEach(function() {
                        newCard = {
                            id: 'new'
                        };

                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        spyOn(MiniReelService, 'convertCard').and.returnValue(newCard);

                        $scope.$emit('mrPreview:initExperience', experience, session);
                    });

                    it('should convert the experience', function() {
                        experience.data.deck.push(newCard);

                        $scope.$emit('mrPreview:updateExperience', experience);
                        expect(MiniReelService.convertForPlayer).toHaveBeenCalled();
                    });

                    describe('when the experience has changed', function() {
                        it('should send the experience to the player', function() {
                            experience.data.deck.push(newCard);
                            experience.data.autoplay = true;

                            $scope.$emit('mrPreview:updateExperience', experience, newCard);

                            expect(experience).not.toEqual(session.experience);
                            expect(PreviewController.playerSrc).toContain('autoplay=true');
                            expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:updateExperience');
                        });
                    });

                    describe('when there\'s a card to jump to', function() {
                        it('should convert the card and tell the player to jump to the card', function() {
                            $scope.$emit('mrPreview:updateExperience', experience, newCard);

                            expect(MiniReelService.convertCard).toHaveBeenCalled();
                            expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:jumpToCard');
                        });
                    });

                    describe('when there\'s no card to jump to', function() {
                        it('should tell the player to reset', function() {
                            $scope.$emit('mrPreview:updateExperience', experience);

                            expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:reset');
                        });
                    });
                });

                describe('mrPreview:reset', function() {
                    beforeEach(function() {
                        PreviewController.active = true;
                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        $scope.$emit('mrPreview:initExperience', experience, session);
                    });
                    it('should tell the player to reset', function() {
                        $scope.$emit('mrPreview:reset');
                        expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:reset');
                    });

                    it('should set active to false', function() {
                        $scope.$emit('mrPreview:reset');
                        expect(PreviewController.active).toBe(false);
                    });

                    describe('if a card has been previewed then reset it', function() {
                        it('should reset it so no card is returned', function() {
                            spyOn(MiniReelService, 'convertCard').and.returnValue({id: '1'});
                            $scope.$emit('mrPreview:updateExperience', experience, {id: '1'});
                            $scope.$emit('mrPreview:reset');
                            session.emit('mrPreview:getCard', {}, responseCallback);

                            var dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer).toBe(null);
                        });
                    });
                });

                describe('mrPreview:updateMode', function() {
                    it('should change the playerSrc, cause a refresh, and send an updated experience', function() {
                        var dataSentToPlayer,
                            emitCount = 0,
                            updatedExperience = {
                                id: 'foo',
                                data: {
                                    mode: 'lightbox',
                                    autoplay: true,
                                    deck: [
                                        {
                                            id: '1'
                                        },
                                        {
                                            id: '2'
                                        },
                                        {
                                            id: '3'
                                        },
                                        {
                                            id: 'new'
                                        }
                                    ]
                                }
                            };

                        spyOn($scope, '$emit').and.callThrough();
                        spyOn(MiniReelService, 'convertForPlayer').and.callFake(function() {
                            if((emitCount === 0) && $scope.$emit.calls.argsFor(0)[0] === 'mrPreview:initExperience') {
                                emitCount++;
                                return experience;
                            } else if($scope.$emit.calls.argsFor(1)[0] === 'mrPreview:updateMode') {
                                return updatedExperience;
                            }
                        });
                        $scope.$emit('mrPreview:initExperience', experience, session);
                        expect(PreviewController.playerSrc).toContain('kMode=light');
                        
                        $scope.$emit('mrPreview:updateMode', updatedExperience);
                        expect(PreviewController.playerSrc).toContain('kMode=lightbox');
                        expect(PreviewController.playerSrc).toContain('autoplay=true');

                        session.emit('handshake', {}, responseCallback);

                        dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                        expect(dataSentToPlayer.appData.experience).not.toEqual(session.experience);
                        expect(dataSentToPlayer.appData.experience).toEqual(updatedExperience);
                    });
                });
            });

            describe('$watcher', function() {
                describe('active', function() {
                    function set(bool) {
                        $scope.$apply(function() {
                            PreviewController.active = bool;
                        });
                    }

                    beforeEach(function() {
                        set(undefined);

                        $scope.$emit('mrPreview:initExperience', experience, session);
                        spyOn($scope, '$broadcast').and.callThrough();
                    });

                    describe('if true', function() {
                        beforeEach(function() {
                            set(true);
                        });

                        it('should tell the splash page it is being hidden', function() {
                            expect($scope.$broadcast).toHaveBeenCalledWith('mrPreview:splashHide');
                        });

                        it('should tell the experience it is being shown', function() {
                            expect(session.ping).toHaveBeenCalledWith('show');
                        });
                    });

                    describe('if false', function() {
                        beforeEach(function() {
                            set(false);
                        });

                        it('should tell the splash page it is being shown', function() {
                            expect($scope.$broadcast).toHaveBeenCalledWith('mrPreview:splashShow');
                        });

                        it('should tell the experience it is being hidden', function() {
                            expect(session.ping).toHaveBeenCalledWith('hide');
                        });
                    });
                });

                describe('device', function() {
                    describe('when the device has been changed', function() {
                        var dataSentToPlayer, updatedExperience, emitCount;

                        beforeEach(function() {
                            updatedExperience = {
                                id: 'foo',
                                data: {
                                    mode: 'light',
                                    deck: [
                                        {
                                            id: '1'
                                        },
                                        {
                                            id: '2'
                                        },
                                        {
                                            id: '3'
                                        },
                                        {
                                            id: 'new'
                                        }
                                    ]
                                }
                            };

                            emitCount = 0;

                            spyOn($scope, '$emit').and.callThrough();

                            spyOn(MiniReelService, 'convertForPlayer').and.callFake(function() {
                                if((emitCount === 0) && $scope.$emit.calls.argsFor(0)[0] === 'mrPreview:initExperience') {
                                    emitCount++;
                                    return experience;
                                } else if($scope.$emit.calls.argsFor(1)[0] === 'mrPreview:updateExperience') {
                                    return updatedExperience;
                                }
                            });

                            $scope.$emit('mrPreview:initExperience', experience, session);
                            $scope.$emit('mrPreview:updateExperience', updatedExperience);

                            PreviewController.active = true;

                            $scope.$apply(function() {
                                PreviewController.device = 'desktop';
                            });

                            $scope.$apply(function() {
                                PreviewController.device = 'phone';
                            });
                        });

                        it('should leave fullscreen', function() {
                            expect(PreviewController.fullscreen).toBe(false);
                        });

                        it('should set active to false', function() {
                            expect(PreviewController.active).toBe(false);
                        });

                        it('should cause the playerSrc to change', function() {
                            expect(PreviewController.playerSrc).toContain('kDevice=phone');
                        });

                        it('should send an updated profile to the player after it reloads', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer.appData.profile.device).toBe('phone');
                        });
                        it('should send an updated experience to the player after it reloads', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer.appData.experience).not.toEqual(session.experience);
                            expect(dataSentToPlayer.appData.experience).toEqual(updatedExperience);
                        });

                        describe('if set to phone', function() {
                            beforeEach(function() {
                                session.emit('handshake', {}, responseCallback);
                                dataSentToPlayer = responseCallback.calls.argsFor(0)[0];
                            });

                            it('should set profile.flash to false', function() {
                                expect(dataSentToPlayer.appData.profile.flash).toBe(false);
                            });
                        });

                        describe('if set to something else', function() {
                            beforeEach(function() {
                                c6BrowserInfo.profile.flash = false;
                                $scope.$apply(function() {
                                    PreviewController.device = 'foo';
                                });
                                session.emit('handshake', {}, responseCallback);
                                dataSentToPlayer = responseCallback.calls.argsFor(0)[0];
                            });

                            it('should set profile.flash to true', function() {
                                expect(dataSentToPlayer.appData.profile.flash).toBe(true);
                            });
                        });
                    });
                });
            });
        });
    });
}());
