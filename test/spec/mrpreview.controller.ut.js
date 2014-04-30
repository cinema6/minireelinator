(function() {
    'use strict';

    define(['editor'], function() {
        describe('PreviewController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6UrlMaker,
                PreviewController,
                MiniReelService,
                c6EventEmitter,
                c6BrowserInfo,
                postMessage,
                c6Defines;

            var responseCallback,
                experience,
                session,
                iframe,
                player;

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

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    MiniReelService = $injector.get('MiniReelService');
                    postMessage = $injector.get('postMessage');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    c6Defines = $injector.get('c6Defines');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                    c6Defines.kExpUrl = '/apps';

                    $scope = $rootScope.$new();

                    PreviewController = $controller('PreviewController', { $scope: $scope });
                });

                experience = {
                    id: 'foo',
                    mode: 'light',
                    data: {
                        autoplay: false,
                        deck: [
                            {
                                id: '1'
                            },
                            {
                                id: '2'
                            },
                            {
                                id: '3'
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

                it('should set the default mode to full', function() {
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

                describe('playerSrc', function() {
                    describe('when developing locally', function() {
                        beforeEach(function() {
                            c6Defines.kDebug = true;
                            c6Defines.kEnv = 'dev';
                            c6Defines.kLocal = true;

                            c6UrlMaker.and.callFake(function(url, base) {
                                if (base !== 'app') {
                                    throw new Error('Must use app base');
                                }

                                return 'assets/apps/' + url;
                            });
                        });

                        it('should be "assets/apps/rumble/app/index.html?kCollateralUrl=../c6Content&kDebug=true&kDevMode=true"', function() {
                            expect(controller().playerSrc).toBe('assets/apps/rumble/app/index.html?kCollateralUrl=' + encodeURIComponent('../c6Content') + '&kDebug=true&kDevMode=true&autoplay=false&kDevice=desktop&kMode=full&kEnvUrlRoot=');
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
                            expect(controller().playerSrc).toBe('/apps/rumble/?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=full&kEnvUrlRoot=');
                        });

                        it('should pass the current mode and device', function() {
                            spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                            $scope.$emit('mrPreview:initExperience', experience, session);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=light&kEnvUrlRoot=');

                            experience.mode = 'lightbox';
                            $scope.$apply(function() {
                                PreviewController.device = 'phone';
                            });
                            $scope.$emit('mrPreview:updateExperience', experience);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=phone&kMode=lightbox&kEnvUrlRoot=');
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
                            expect(controller().playerSrc).toBe('/apps/rumble/?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=full&kEnvUrlRoot=');
                        });

                        it('should pass the current mode and device', function() {
                            spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                            $scope.$emit('mrPreview:initExperience', experience, session);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=desktop&kMode=light&kEnvUrlRoot=');

                            experience.mode = 'lightbox';
                            $scope.$apply(function() {
                                PreviewController.device = 'phone';
                            });
                            $scope.$emit('mrPreview:updateExperience', experience);

                            expect(PreviewController.playerSrc).toBe('/apps/rumble/?kCollateralUrl=' + encodeURIComponent('/collateral') + '&autoplay=false&kDevice=phone&kMode=lightbox&kEnvUrlRoot=');
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

            describe('$scope listeners', function() {
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

                    it('should register three session listeners', function() {
                        expect(session.on).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Function));
                        expect(session.on.calls.count()).toBe(3);
                    });

                    describe('handshake request', function() {
                        it('should respond with appData for the player', function() {
                            session.emit('handshake', {}, responseCallback);

                            dataSentToPlayer = responseCallback.calls.argsFor(0)[0];

                            expect(dataSentToPlayer.success).toBe(true);
                            expect(dataSentToPlayer.appData.experience).toEqual(experience);
                            expect(dataSentToPlayer.appData.profile).toEqual(c6BrowserInfo.profile);
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
                    var newCard,
                    dataSentToPlayer;

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
                    it('should tell the player to reset', function() {
                        spyOn(MiniReelService, 'convertForPlayer').and.returnValue(experience);
                        $scope.$emit('mrPreview:initExperience', experience, session);
                        $scope.$emit('mrPreview:reset');
                        expect(session.ping.calls.argsFor(0)[0]).toBe('mrPreview:reset');
                    });
                });

                describe('mrPreview:updateMode', function() {
                    it('should change the playerSrc, cause a refresh, and send an updated experience', function() {
                        var dataSentToPlayer,
                            emitCount = 0,
                            updatedExperience = {
                                id: 'foo',
                                mode: 'lightbox',
                                data: {
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
                describe('device', function() {
                    describe('when the device has been changed', function() {
                        var dataSentToPlayer, updatedExperience, emitCount;

                        beforeEach(function() {
                            updatedExperience = {
                                id: 'foo',
                                mode: 'light',
                                data: {
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
                    });
                });
            });
        });
    });
}());
